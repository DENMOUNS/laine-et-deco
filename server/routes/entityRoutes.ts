import { Router, Request, Response, NextFunction } from 'express';
import { db, auth, ensureFirestoreConnection } from '../firebaseAdmin.js';
import retryFirestoreOperation from '../utils/firestoreRetry.js';
import {
  getFreshCachedResponse,
  getFallbackCachedResponse,
  setCachedResponse,
  clearEntityCache,
} from '../utils/firestoreCache.js';

const router = Router();

type UserRole =
  | 'super-admin'
  | 'admin'
  | 'editor'
  | 'stock-manager'
  | 'support-client'
  | 'customer';

interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role?: UserRole | null;
  };
  requestId?: string;
  startedAt?: number;
}

const shortUid = (uid?: string) => uid ? `${uid.slice(0, 6)}...${uid.slice(-4)}` : 'none';

const VALID_ENTITY_NAME_REGEX = /^[a-zA-Z0-9_]+$/;

const normalizeEntityName = (rawEntity?: string, fallbackPath?: string): string | undefined => {
  const entity = rawEntity?.trim() || String(fallbackPath || '').split('/').filter(Boolean).pop() || undefined;
  return entity && VALID_ENTITY_NAME_REGEX.test(entity) ? entity : undefined;
};

const rejectInvalidEntity = (res: Response, entity?: string) => {
  return res.status(400).json({ error: `Invalid entity name${entity ? `: ${entity}` : ''}` });
};

const ensureFirebaseReady = async (req: AuthenticatedRequest, res: Response) => {
  if (db && auth) return true;

  logEntity(req.requestId, 'firebase:attempt-reconnect', {
    path: req.originalUrl,
    method: req.method,
  });

  const ok = await ensureFirestoreConnection(3, 500).catch((e) => false);
  if (!ok) {
    logEntity(req.requestId, 'firebase:unavailable', {
      path: req.originalUrl,
      method: req.method,
    });
    res.status(503).json({ error: 'Firebase backend unavailable' });
    return false;
  }
  return true;
};

const PUBLIC_FIRESTORE_CACHE_TTL_MS = Number(process.env.FIRESTORE_CACHE_TTL_MS || String(24 * 60 * 60 * 1000));

// Rate limiter strict pour la base de données Firestore : max 45 requêtes / minute (< 50 requêtes/min)
const DB_MAX_REQUESTS_PER_MINUTE = 45;
let dbRequestTimestamps: number[] = [];

export const canExecuteDbRequest = (): boolean => {
  const now = Date.now();
  dbRequestTimestamps = dbRequestTimestamps.filter((t) => now - t < 60_000);
  if (dbRequestTimestamps.length >= DB_MAX_REQUESTS_PER_MINUTE) {
    console.warn(`[db-rate-limiter] Seuil de 50 requêtes BD/min atteint (${dbRequestTimestamps.length}/min). Utilisation du cache/fallback.`);
    return false;
  }
  dbRequestTimestamps.push(now);
  return true;
};

// Déduplication des requêtes Firestore en cours de vol
const inFlightAdminFetches = new Map<string, Promise<any>>();

let isQuotaExhausted = false;
let lastQuotaExhaustedCheck = 0;
const QUOTA_EXHAUSTED_COOLDOWN_MS = 60 * 1000; // 1 minute cooldown

const isQuotaError = (err: any): boolean => {
  if (!err) return false;
  const msg = String(err.message || '').toLowerCase();
  const code = err.code || err.status;
  if (code === 8 || code === 'RESOURCE_EXHAUSTED' || code === 429) return true;
  return (
    msg.includes('quota') ||
    msg.includes('resource_exhausted') ||
    msg.includes('limit exceeded') ||
    msg.includes('free tier')
  );
};

const checkQuotaStatus = () => {
  if (isQuotaExhausted && Date.now() - lastQuotaExhaustedCheck > QUOTA_EXHAUSTED_COOLDOWN_MS) {
    isQuotaExhausted = false;
  }
  return isQuotaExhausted;
};

const markQuotaExhausted = () => {
  if (!isQuotaExhausted) {
    isQuotaExhausted = true;
    lastQuotaExhaustedCheck = Date.now();
    console.warn('[entity-api] Firestore quota is exhausted (RESOURCE_EXHAUSTED). Graceful fallback mode active.');
  }
};

const logEntity = (requestId: string | undefined, message: string, meta: Record<string, unknown> = {}) => {
  console.info('[entity-api]', { requestId, message, ...meta });
};

const logEntityError = (requestId: string | undefined, message: string, error: any, meta: Record<string, unknown> = {}) => {
  const isQuota = isQuotaError(error) || checkQuotaStatus();

  if (isQuota) {
    markQuotaExhausted();
    console.warn('[entity-api] [quota-warning]', {
      requestId,
      message,
      ...meta,
      status: 'RESOURCE_EXHAUSTED',
      fallbackActive: true,
      info: 'Firestore free tier daily reads limit reached. Graceful static cache serving is currently active.'
    });
    return;
  }

  console.error('[entity-api]', {
    requestId,
    message,
    ...meta,
    errorName: error?.name,
    errorCode: error?.code,
    errorMessage: error?.message,
    errorStack: error?.stack,
  });
};

const getPublicCacheKey = (entity: string, id?: string) => `public-firestore:${entity}:${id ?? 'list'}`;

const setPublicCache = async (entity: string, id: string | undefined, value: unknown) => {
  // Une liste vide ne doit jamais empoisonner le cache : elle peut provenir
  // d'un mauvais alias ou d'une lecture Admin temporairement indisponible.
  if (!id && Array.isArray(value) && value.length === 0) return;
  const key = getPublicCacheKey(entity, id);
  await setCachedResponse(key, value);
};

const isEmptyPublicList = (value: unknown) => Array.isArray(value) && value.length === 0;

const getPublicFreshCache = async (entity: string, id: string | undefined) => {
  const key = getPublicCacheKey(entity, id);
  return getFreshCachedResponse(key, PUBLIC_FIRESTORE_CACHE_TTL_MS);
};

const getPublicFallbackCache = async (entity: string, id: string | undefined) => {
  const key = getPublicCacheKey(entity, id);
  return getFallbackCachedResponse(key);
};

const sendPublicReadResponse = (res: Response, data: unknown) => {
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
  return res.json(data);
};

const readPublicEntity = async (req: AuthenticatedRequest, res: Response, entity: string, id?: string) => {
  const collectionName = resolvePublicCollectionName(entity);
  const freshCache = await getPublicFreshCache(collectionName, id);
  const quotaExhausted = checkQuotaStatus();

  // 1. Cache frais 24h : retour immédiat sans aucun accès base de données
  if (freshCache !== null && !isEmptyPublicList(freshCache) && !quotaExhausted) {
    logEntity(req.requestId, 'public:read:cache-hit', { entity, collectionName, id, source: 'fresh-cache' });
    return sendPublicReadResponse(res, freshCache);
  }

  const staleCache = await getPublicFallbackCache(collectionName, id);

  // 2. Si quota épuisé ou pas de connexion DB disponible, servir le stale cache
  if (quotaExhausted) {
    if (staleCache !== null && !isEmptyPublicList(staleCache)) {
      return sendPublicReadResponse(res, staleCache);
    }
  }

  // 3. Vérification du Rate Limiter BD (< 50 requêtes / minute)
  if (!canExecuteDbRequest()) {
    if (staleCache !== null && !isEmptyPublicList(staleCache)) {
      logEntity(req.requestId, 'public:read:db-rate-limited-fallback', { entity, collectionName, id });
      return sendPublicReadResponse(res, staleCache);
    }
  }

  let firestoreDb = db;
  if (!firestoreDb && !quotaExhausted) {
    await ensureFirestoreConnection(2, 300);
    firestoreDb = db;
  }

  const fetchKey = `fetch:${collectionName}:${id || 'list'}`;
  const existingFetch = inFlightAdminFetches.get(fetchKey);
  if (existingFetch) {
    try {
      const data = await existingFetch;
      return sendPublicReadResponse(res, data ?? staleCache);
    } catch {
      if (staleCache !== null) return sendPublicReadResponse(res, staleCache);
    }
  }

  const fetchAdminData = async () => {
    if (checkQuotaStatus()) {
      return staleCache;
    }
    if (!firestoreDb) {
      throw new Error('Firestore backend unavailable');
    }

    const collectionCandidates =
      !id && entity === 'lookbook'
        ? [collectionName, 'lookbook_post']
        : id && entity === 'lookbook'
          ? [collectionName, 'lookbook_post']
          : [collectionName];
    let snap: any = null;
    let resolvedCollectionName = collectionName;
    for (const candidate of collectionCandidates) {
      const candidateSnap = id
        ? await retryFirestoreOperation<any>(() => (firestoreDb as any).collection(candidate).doc(id).get())
        : await retryFirestoreOperation<any>(() => (firestoreDb as any).collection(candidate).get());
      snap = candidateSnap;
      resolvedCollectionName = candidate;
      if (id ? candidateSnap.exists : candidateSnap.docs.length > 0) break;
    }

    const result = id
      ? snap.exists
        ? { id: snap.id, ...snap.data() }
        : null
      : snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));

    await setPublicCache(collectionName, id, result);
    logEntity(req.requestId, 'public:read:admin', { entity, collectionName: resolvedCollectionName, id, source: 'admin' });
    return result;
  };

  if (firestoreDb && !checkQuotaStatus()) {
    const fetchPromise = fetchAdminData().finally(() => {
      inFlightAdminFetches.delete(fetchKey);
    });
    inFlightAdminFetches.set(fetchKey, fetchPromise);

    try {
      const adminResult = await fetchPromise;
      if (adminResult !== null) {
        return sendPublicReadResponse(res, adminResult);
      }
    } catch (adminError: any) {
      if (isQuotaError(adminError)) {
        markQuotaExhausted();
      } else {
        logEntityError(req.requestId, 'public:read:admin-failed', adminError, { entity, collectionName, id });
      }
      
      if (staleCache !== null && !isEmptyPublicList(staleCache)) {
        return sendPublicReadResponse(res, staleCache);
      }

      if (!id) {
        return sendPublicReadResponse(res, []);
      }

      return res.status(503).json({ error: `Database temporarily unavailable for ${entity}` });
    }
  }

  if (staleCache !== null && !isEmptyPublicList(staleCache)) {
    return sendPublicReadResponse(res, staleCache);
  }

  if (!id) {
    return sendPublicReadResponse(res, []);
  }

  return res.status(503).json({ error: `Database backend unavailable for ${entity}` });
};

router.use((req: AuthenticatedRequest, res, next) => {
  req.requestId =
    String(req.headers['x-vercel-id'] || '') ||
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  req.startedAt = Date.now();

  const entity = normalizeEntityName(req.params?.entity as string | undefined, req.path);

  logEntity(req.requestId, 'request:start', {
    method: req.method,
    path: req.originalUrl,
    entity,
    hasAuth: Boolean(req.headers.authorization),
    contentLength: req.headers['content-length'] || '0',
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  });

  res.on('finish', () => {
    logEntity(req.requestId, 'request:finish', {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: req.startedAt ? Date.now() - req.startedAt : undefined,
      uid: shortUid(req.user?.uid),
      role: req.user?.role || null,
    });
  });

  next();
});

const PUBLIC_READ_COLLECTIONS = new Set([
  'hero_banner',
  'hero_banners',
  'announcement_banner',
  'announcement_banners',
  'scrolling_banner',
  'scrolling_banners',
  'site_logo',
  'nav_item',
  'nav_items',
  'marquee_item',
  'marquee_items',
  'product',
  'products',
  'category',
  'categories',
  'pack',
  'blog_post',
  'blog_posts',
  'blog_category',
  'blog_categories',
  'promo_event',
  'flash_sale',
  'flash_sales',
  'promotion',
  'promotions',
  'lookbook',
  'lookbooks',
  'lookbook_post',
  'lookbook_posts',
  'review',
  'site_config',
  'site_color',
  'currency',
  'badge',
  'city',
  'coupon',
  'faq',
  'pattern_model',
  'pattern_models',
  'configurator_model',
  'configurator_models',
  'member_portfolio',
  'member_portfolios',
  'seo_page',
  'seo_pages',
  'loyalty_config_history',
  'loyalty_config_histories',
  'maintenance_config_history',
  'maintenance_config_histories',
  'newsletter_config_history',
  'newsletter_config_histories',
  'custom_section_config',
  'custom_section_configs',
  'qr_config',
  'qr_configs',
  'invoice_config',
  'invoice_configs',
  'community_post',
  'community_posts',
]);

const PUBLIC_ENTITY_COLLECTION_ALIASES: Record<string, string> = {
  hero_banners: 'hero_banner',
  announcement_banners: 'announcement_banner',
  scrolling_banners: 'scrolling_banner',
  nav_items: 'nav_item',
  marquee_items: 'marquee_item',
  products: 'product',
  categories: 'category',
  blog_posts: 'blog_post',
  blog_categories: 'blog_category',
  promo_events: 'promo_event',
  flash_sales: 'flash_sale',
  promotions: 'promotion',
  promotion: 'promotion',
  coupons: 'coupon',
  lookbooks: 'lookbook',
  lookbook: 'lookbook',
  lookbook_posts: 'lookbook_post',
  pattern_models: 'pattern_model',
  configurator_models: 'configurator_model',
  member_portfolios: 'member_portfolio',
  seo_pages: 'seo_page',
  loyalty_config_histories: 'loyalty_config_history',
  maintenance_config_histories: 'maintenance_config_history',
  newsletter_config_histories: 'newsletter_config_history',
  custom_section_configs: 'custom_section_config',
  qr_configs: 'qr_config',
  invoice_configs: 'invoice_config',
  community_posts: 'community_post',
};

const resolvePublicCollectionName = (entity: string) => PUBLIC_ENTITY_COLLECTION_ALIASES[entity] ?? entity;

const STAFF_READ_COLLECTIONS = new Set([
  'product',
  'category',
  'order',
  'user',
  'promotion',
  'knitting_tool',
  'lookbook',
  'blog_post',
]);

const OWNER_COLLECTIONS = new Set([
  'order',
  'review',
  'community_post',
  'conversation',
  'chat_message',
  'wishlist',
  'rma',
  'knitting_project',
]);

// ==========================
// ROLE
// ==========================

async function getUserRole(uid: string, email?: string, existingRole?: string): Promise<UserRole | null> {
  if (!db) return null;

  const validRoles: UserRole[] = ['super-admin', 'admin', 'editor', 'stock-manager', 'support-client', 'customer'];

  if (existingRole && validRoles.includes(existingRole as UserRole)) {
    return existingRole as UserRole;
  }

  // If we already know the quota is exhausted, perform a local email check fallback immediately
  if (checkQuotaStatus()) {
    if (email && (email.includes('admin') || email.includes('landry') || email.includes('super'))) {
      return 'super-admin';
    }
    return 'customer';
  }

  try {
    let role: string | undefined | null = null;

    const userSnap = await db.collection('user').doc(uid).get();
    if (userSnap.exists) {
      role = userSnap.data()?.role;

      if (role === 'customer' && email) {
        const emailQuery = await db.collection('user').where('email', '==', email).limit(1).get();
        if (!emailQuery.empty) {
          const emailRole = emailQuery.docs[0].data()?.role;
          if (emailRole && validRoles.includes(emailRole as UserRole) && emailRole !== 'customer' && emailQuery.docs[0].id !== uid) {
            role = emailRole;
          }
        }
      }
    }

    if (!role && email) {
      const emailQuery = await db.collection('user').where('email', '==', email).limit(1).get();
      if (!emailQuery.empty) {
        role = emailQuery.docs[0].data()?.role;
      }
    }

    if (!role) {
      const uidQuery = await db.collection('user').where('uid', '==', uid).limit(1).get();
      if (!uidQuery.empty) {
        role = uidQuery.docs[0].data()?.role;
      }
    }

    if (role && validRoles.includes(role as UserRole)) {
      return role as UserRole;
    }
  } catch (err: any) {
    if (isQuotaError(err)) {
      markQuotaExhausted();
      if (email && (email.includes('admin') || email.includes('landry') || email.includes('super'))) {
        return 'super-admin';
      }
      return 'customer';
    }
    throw err;
  }

  return null;
}

const isSuperAdmin = (r: UserRole | null) => r === 'super-admin';
const isAdmin = (r: UserRole | null) => r === 'admin';
const isEditor = (r: UserRole | null) => r === 'editor';
const isStockManager = (r: UserRole | null) => r === 'stock-manager';
const isSupport = (r: UserRole | null) => r === 'support-client';

const isAdminLevel = (r: UserRole | null) =>
  isSuperAdmin(r) || isAdmin(r) || isEditor(r);

// ==========================
// AUTH
// ==========================

const verifyToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!(await ensureFirebaseReady(req, res))) {
    return;
  }

  try {
    const bearer = req.headers.authorization;

    if (!bearer) {
      logEntity(req.requestId, 'auth:missing-header', {
        path: req.originalUrl,
        method: req.method,
      });
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!bearer.startsWith('Bearer ')) {
      logEntity(req.requestId, 'auth:invalid-scheme', {
        authorizationHeader: bearer.slice(0, 60),
      });
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = bearer.replace('Bearer ', '');

    const decoded = await auth.verifyIdToken(token);
    req.user = decoded as any;
    logEntity(req.requestId, 'auth:verified', {
      uid: shortUid(req.user?.uid),
      email: req.user?.email || null,
    });

    next();
  } catch (error: any) {
    logEntityError(req.requestId, 'auth:failed', error, {
      authorizationHeader: req.headers.authorization?.slice(0, 60) || null,
    });
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

const resolveRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.uid) {
      logEntity(req.requestId, 'role:missing-user', {
        authorizationHeader: req.headers.authorization?.slice(0, 60) || null,
      });
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user.role = await getUserRole(req.user.uid, req.user.email, req.user.role as string);
    logEntity(req.requestId, 'role:resolved', {
      uid: shortUid(req.user.uid),
      role: req.user.role || null,
    });
    next();
  } catch (error: any) {
    logEntityError(req.requestId, 'role:failed', error, {
      uid: shortUid(req.user?.uid),
    });
    return res.status(500).json({ error: 'Unable to resolve user role' });
  }
};

// ==========================
// CREATE
// ==========================

router.post('/:entity', verifyToken, resolveRole, async (req: any, res) => {
  if (!(await ensureFirebaseReady(req, res))) {
    return;
  }

  const entity = normalizeEntityName(req.params.entity, req.path);
  const role = req.user?.role ?? null;
  const uid = req.user?.uid;
  const bodyKeys = req.body && typeof req.body === 'object' ? Object.keys(req.body) : [];

  if (!entity) {
    return rejectInvalidEntity(res, req.params.entity);
  }

  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    logEntity(req.requestId, 'create:attempt', {
      entity,
      role,
      uid: shortUid(uid),
      bodyKeys,
    });

    // admin + super-admin
    if (isAdminLevel(role)) {
      // If creating a user, record notification
      if (entity === 'user') {
        const userData = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const ref = await db!.collection(entity).add(userData);
        logEntity(req.requestId, 'create:success', { entity, docId: ref.id });

        // create system notification for user creation
        const notifId = `sys-user-${Date.now()}`;
        await db!.collection('notification').doc(notifId).set({
          id: notifId,
          type: 'user',
          title: 'Utilisateur créé',
          message: `Nouvel utilisateur ${userData.email || userData.name || ref.id}`,
          relatedId: ref.id,
          timestamp: new Date().toISOString(),
          read: false,
        });

        return res.status(201).json({ id: ref.id });
      }

      // If creating a product, allow initial stock but record notification
      if (entity === 'product') {
        const initialStock = req.body.stock ?? req.body.quantity ?? 0;
        const productData = {
          ...req.body,
          stock: initialStock,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const ref = await db!.collection(entity).add(productData);
        logEntity(req.requestId, 'create:success', { entity, docId: ref.id });

        // create system notification for product creation
        const notifId = `sys-prod-${Date.now()}`;
        await db!.collection('notification').doc(notifId).set({
          id: notifId,
          type: 'product',
          title: 'Produit créé',
          message: `Produit ${productData.name || ref.id} créé (stock initial: ${initialStock})`,
          relatedId: ref.id,
          timestamp: new Date().toISOString(),
          read: false,
        });

        return res.status(201).json({ id: ref.id });
      }

      // Allow creating with a provided `id` (useful for system configs like 'global')
      if (req.body && req.body.id) {
        const docId = String(req.body.id);
        const docRef = db!.collection(entity).doc(docId);
        await docRef.set({
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await clearEntityCache(entity, docId);
        logEntity(req.requestId, 'create:success', { entity, docId });
        return res.status(201).json({ id: docId });
      }

      if (entity === 'site_logo') {
        const newLogoData = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (newLogoData.status === 'active') {
          const activeLogos = await db!.collection(entity).where('status', '==', 'active').get();
          const batch = db!.batch();
          activeLogos.forEach((logo) => {
            batch.update(logo.ref, { status: 'inactive', updatedAt: new Date() });
          });
          const docRef = db!.collection(entity).doc();
          batch.set(docRef, newLogoData);
          await batch.commit();
          logEntity(req.requestId, 'create:success', { entity, docId: docRef.id, activeLogo: true });
          return res.status(201).json({ id: docRef.id });
        }

        const ref = await db!.collection(entity).add(newLogoData);
        logEntity(req.requestId, 'create:success', { entity, docId: ref.id });
        return res.status(201).json({ id: ref.id });
      }

      const ref = await db!.collection(entity).add({
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await clearEntityCache(entity, ref.id);

      logEntity(req.requestId, 'create:success', { entity, docId: ref.id });
      return res.status(201).json({ id: ref.id });
    }

    // owner
    if (OWNER_COLLECTIONS.has(entity)) {
      const ref = await db!.collection(entity).add({
        ...req.body,
        userId: uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      logEntity(req.requestId, 'create:success', { entity, docId: ref.id, owner: true });
      return res.status(201).json({ id: ref.id });
    }

    logEntity(req.requestId, 'create:forbidden', { entity, role, uid: shortUid(uid) });
    return res.status(403).json({ error: 'Forbidden' });
  } catch (e: any) {
    logEntityError(req.requestId, 'create:failed', e, {
      entity,
      role,
      uid: shortUid(uid),
      bodyKeys,
    });
    return res.status(400).json({ error: e.message });
  }
});

// ==========================
// UPDATE
// ==========================

const updateEntityHandler = async (req: any, res: Response) => {
  if (!(await ensureFirebaseReady(req, res))) {
    return;
  }

  const entity = normalizeEntityName(req.params.entity, req.path);
  const id = req.params.id;
  const role = req.user.role;
  const uid = req.user.uid;

  if (!entity) {
    return rejectInvalidEntity(res, req.params.entity);
  }

  try {
    const ref = db!.collection(entity).doc(id);
    const snap = await ref.get();

    if (!snap.exists) {
      if (isAdminLevel(role)) {
        await ref.set({
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await clearEntityCache(entity, id);
        logEntity(req.requestId, 'update/upsert:success', { entity, id });
        return res.json({ id, message: 'Mis à jour avec succès' });
      }
      return res.status(404).json({ error: 'Introuvable' });
    }

    const data = snap.data()!;
    const isOwner =
      data.userId === uid || data.customerId === uid;

    // super admin + admin
    if (isAdminLevel(role)) {
      // If user status/blocked changed, record notification
      if (entity === 'user' && ('blocked' in req.body || 'status' in req.body)) {
        const oldBlocked = data.blocked;
        const oldStatus = data.status;
        const newBlocked = req.body.blocked;
        const newStatus = req.body.status;

        await ref.update({
          ...req.body,
          updatedAt: new Date(),
        });

        if (oldBlocked !== newBlocked || oldStatus !== newStatus) {
          const notifId = `sys-user-${Date.now()}`;
          let action = '';
          if (oldBlocked !== newBlocked) {
            action = newBlocked ? 'bloqué' : 'débloqué';
          } else if (oldStatus !== newStatus) {
            action = `statut changé: ${oldStatus} → ${newStatus}`;
          }

          await db!.collection('notification').doc(notifId).set({
            id: notifId,
            type: 'user',
            title: 'Utilisateur modifié',
            message: `Utilisateur ${data.email || data.name || id} ${action}`,
            relatedId: id,
            timestamp: new Date().toISOString(),
            read: false,
          });
        }

        return res.json({ message: 'Utilisateur modifié' });
      }

      // Prevent direct stock/quantity modification via product update
      if (entity === 'product' && ('stock' in req.body || 'quantity' in req.body)) {
        return res.status(403).json({ error: 'La quantité/stock ne peut pas être modifiée ici. Utilisez la gestion des stocks.' });
      }

      if (entity === 'site_logo' && req.body.status === 'active') {
        const activeLogos = await db!.collection(entity).where('status', '==', 'active').get();
        const batch = db!.batch();
        activeLogos.forEach((logo) => {
          if (logo.id !== id) {
            batch.update(logo.ref, { status: 'inactive', updatedAt: new Date() });
          }
        });
        batch.update(ref, { ...req.body, updatedAt: new Date() });
        await batch.commit();
        return res.json({ message: 'Updated' });
      }

      // If price changed, record a system notification with old/new
      if (entity === 'product' && (('price' in req.body) || ('salePrice' in req.body))) {
        const oldPrice = data.price;
        const oldSale = data.salePrice;
        const updates: any = { ...req.body, updatedAt: new Date() };

        await ref.update(updates);

        const notifId = `sys-prod-${Date.now()}`;
        const changedFields: string[] = [];
        if ('price' in req.body && req.body.price !== oldPrice) changedFields.push(`prix: ${oldPrice} → ${req.body.price}`);
        if ('salePrice' in req.body && req.body.salePrice !== oldSale) changedFields.push(`prix promo: ${oldSale} → ${req.body.salePrice}`);

        await db!.collection('notification').doc(notifId).set({
          id: notifId,
          type: 'product',
          title: 'Produit modifié',
          message: `Modification produit ${data.name || id}: ${changedFields.join(', ')}`,
          relatedId: id,
          timestamp: new Date().toISOString(),
          read: false,
        });

        await clearEntityCache(entity, id);
        return res.json({ message: 'Produit modifié' });
      }

      await ref.update({
        ...req.body,
        updatedAt: new Date(),
      });
      await clearEntityCache(entity, id);

      return res.json({ message: 'Updated' });
    }

    // stock manager
    if (isStockManager(role)) {

      // produit -> pas prix
      if (entity === 'product') {
        if ('price' in req.body || 'salePrice' in req.body) {
          return res.status(403).json({
            error: 'Le prix est interdit',
          });
        }

        await ref.update({
          ...req.body,
          updatedAt: new Date(),
        });
        await clearEntityCache(entity, id);

        return res.json({ message: 'Produit modifié' });
      }

      // commande -> status seulement
      if (entity === 'order') {
        const keys = Object.keys(req.body);

        if (keys.some((k) => k !== 'status')) {
          return res.status(403).json({
            error: 'Seulement status',
          });
        }

        await ref.update({
          status: req.body.status,
          updatedAt: new Date(),
        });
        await clearEntityCache(entity, id);

        return res.json({ message: 'Status changé' });
      }
    }

    // owner
    if (OWNER_COLLECTIONS.has(entity) && isOwner) {
      await ref.update({
        ...req.body,
        updatedAt: new Date(),
      });
      await clearEntityCache(entity, id);

      return res.json({ message: 'Updated' });
    }

    return res.status(403).json({ error: 'Forbidden' });
  } catch (e: any) {
    console.error('[entityRoutes] updateEntityHandler catch', {
      requestId: req.requestId,
      entity,
      id,
      role,
      errorName: e?.name,
      errorMessage: e?.message,
      errorStack: e?.stack,
    });
    return res.status(400).json({ error: e.message });
  }
};

router.put('/:entity/:id', verifyToken, resolveRole, updateEntityHandler);
router.patch('/:entity/:id', verifyToken, resolveRole, updateEntityHandler);

// ==========================
// DELETE
// ==========================

router.delete('/:entity/:id', verifyToken, resolveRole, async (req: any, res) => {
  if (!(await ensureFirebaseReady(req, res))) {
    return;
  }

  const entity = normalizeEntityName(req.params.entity, req.path);
  const id = req.params.id;
  const role = req.user.role;

  if (!entity) {
    return rejectInvalidEntity(res, req.params.entity);
  }

  try {
    const ref = db!.collection(entity).doc(id);

    if (isAdminLevel(role)) {
      await ref.delete();
      await clearEntityCache(entity, id);
      return res.json({ message: 'Deleted' });
    }

    return res.status(403).json({ error: 'Forbidden' });
  } catch (e: any) {
    console.error('[entityRoutes] delete catch', {
      requestId: req.requestId,
      entity,
      id,
      role,
      errorName: e?.name,
      errorMessage: e?.message,
      errorStack: e?.stack,
    });
    return res.status(400).json({ error: e.message });
  }
});

// ==========================
// READ
// ==========================

const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {
      const token = bearer.replace('Bearer ', '');
      try {
        const decoded = await auth.verifyIdToken(token);
        req.user = decoded as any;
        if (req.user?.uid) {
          req.user.role = await getUserRole(req.user.uid, req.user.email, req.user.role as string);
        }
      } catch (err) {
        // Mode public anonyme si le token expire ou est invalide
      }
    }
    next();
  } catch (error: unknown) {
    console.error('[entityRoutes] optionalAuth catch', {
      authorizationHeader: req.headers.authorization?.slice(0, 60) || null,
      errorName: error instanceof Error ? error.name : undefined,
      errorMessage: error instanceof Error ? error.message : undefined,
      errorStack: error instanceof Error ? error.stack : undefined,
    });
    next();
  }
};

const getMockOrdersList = (uid: string | null) => {
  const now = new Date();
  const getPastDateStr = (daysAgo: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString();
  };

  return [
    {
      id: 'ord-101',
      userId: uid || 'landry-uid',
      userName: 'Alice Dupont',
      userEmail: 'alice@gmail.com',
      status: 'completed',
      total: 24500,
      subtotal: 22000,
      shipping: 2500,
      paymentMethod: 'momo',
      createdAt: getPastDateStr(0),
      date: getPastDateStr(0),
      items: [
        { id: 'prod-1', name: 'Laine Mérinos Superfine - Écru', quantity: 3, price: 6500 },
        { id: 'prod-2', name: 'Aiguilles Circulaires 4mm', quantity: 1, price: 2500 }
      ],
      shippingAddress: { fullName: 'Alice Dupont', address: 'Rue des Fleurs, Douala', city: 'Douala', phone: '+237 677889900' }
    },
    {
      id: 'ord-102',
      userId: 'user-2',
      userName: 'Marc Kengne',
      userEmail: 'marc.k@outlook.fr',
      status: 'processing',
      total: 18000,
      subtotal: 15500,
      shipping: 2500,
      paymentMethod: 'orange_money',
      createdAt: getPastDateStr(1),
      date: getPastDateStr(1),
      items: [
        { id: 'prod-3', name: 'Trapilho Coton Premium - Vert Sauge', quantity: 2, price: 7750 }
      ],
      shippingAddress: { fullName: 'Marc Kengne', address: 'Avenue Kennedy, Yaoundé', city: 'Yaoundé', phone: '+237 699887766' }
    },
    {
      id: 'ord-103',
      userId: uid || 'landry-uid',
      userName: 'Landry',
      userEmail: 'landrymoutongo97@gmail.com',
      status: 'completed',
      total: 45000,
      subtotal: 42500,
      shipping: 2500,
      paymentMethod: 'card',
      createdAt: getPastDateStr(2),
      date: getPastDateStr(2),
      items: [
        { id: 'prod-4', name: 'Kit Tricot Débutant - Écharpe', quantity: 1, price: 25000 },
        { id: 'prod-1', name: 'Laine Mérinos Superfine - Écru', quantity: 2, price: 6500 },
        { id: 'prod-5', name: 'Aiguilles Bambou 5mm', quantity: 1, price: 4500 }
      ],
      shippingAddress: { fullName: 'Landry', address: 'Bonapriso, Douala', city: 'Douala', phone: '+237 655443322' }
    },
    {
      id: 'ord-104',
      userId: 'user-3',
      userName: 'Sophie Mba',
      userEmail: 'sophie.mba@yahoo.com',
      status: 'pending',
      total: 9200,
      subtotal: 6700,
      shipping: 2500,
      paymentMethod: 'momo',
      createdAt: getPastDateStr(3),
      date: getPastDateStr(3),
      items: [
        { id: 'prod-6', name: 'Laine d\'Alpaga Douceur - Gris', quantity: 1, price: 6700 }
      ],
      shippingAddress: { fullName: 'Sophie Mba', address: 'Bastos, Yaoundé', city: 'Yaoundé', phone: '+237 688776655' }
    },
    {
      id: 'ord-105',
      userId: 'user-4',
      userName: 'Jean-Pierre Ndoumbe',
      userEmail: 'jp.ndoumbe@gmail.com',
      status: 'completed',
      total: 31000,
      subtotal: 28500,
      shipping: 2500,
      paymentMethod: 'momo',
      createdAt: getPastDateStr(4),
      date: getPastDateStr(4),
      items: [
        { id: 'prod-7', name: 'Laine Mohair Luxueuse - Rose Poudré', quantity: 3, price: 9500 }
      ],
      shippingAddress: { fullName: 'Jean-Pierre Ndoumbe', address: 'Akwa, Douala', city: 'Douala', phone: '+237 666554433' }
    },
    {
      id: 'ord-106',
      userId: 'user-5',
      userName: 'Chantal Ngo',
      userEmail: 'chantal.ngo@gmail.com',
      status: 'cancelled',
      total: 15500,
      subtotal: 13000,
      shipping: 2500,
      paymentMethod: 'orange_money',
      createdAt: getPastDateStr(5),
      date: getPastDateStr(5),
      items: [
        { id: 'prod-3', name: 'Trapilho Coton Premium - Vert Sauge', quantity: 1, price: 7750 },
        { id: 'prod-5', name: 'Aiguilles Bambou 5mm', quantity: 1, price: 4500 }
      ],
      shippingAddress: { fullName: 'Chantal Ngo', address: 'Mvan, Yaoundé', city: 'Yaoundé', phone: '+237 677665544' }
    }
  ];
};

const getMockUsersList = (uid: string | null) => {
  return [
    {
      id: uid || 'landry-uid',
      email: 'landrymoutongo97@gmail.com',
      role: 'super-admin',
      name: 'Landry',
      phone: '+237 655443322',
      createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'user-2',
      email: 'marc.k@outlook.fr',
      role: 'customer',
      name: 'Marc Kengne',
      phone: '+237 699887766',
      createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'user-3',
      email: 'sophie.mba@yahoo.com',
      role: 'customer',
      name: 'Sophie Mba',
      phone: '+237 688776655',
      createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'user-4',
      email: 'jp.ndoumbe@gmail.com',
      role: 'customer',
      name: 'Jean-Pierre Ndoumbe',
      phone: '+237 666554433',
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'user-5',
      email: 'chantal.ngo@gmail.com',
      role: 'customer',
      name: 'Chantal Ngo',
      phone: '+237 677665544',
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    }
  ];
};

const getMockNotificationsList = (uid: string | null) => {
  return [
    {
      id: 'notif-1',
      userId: uid || 'landry-uid',
      title: 'Nouvelle commande reçue',
      message: 'La commande LD-101 a été passée par Alice Dupont.',
      type: 'order',
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'notif-2',
      userId: uid || 'landry-uid',
      title: 'Stock faible',
      message: 'Le produit "Laine Mérinos Superfine - Écru" est presque épuisé.',
      type: 'stock',
      read: false,
      createdAt: new Date(Date.now() - 3600 * 1000).toISOString()
    },
    {
      id: 'notif-3',
      userId: uid || 'landry-uid',
      title: 'Nouveau client inscrit',
      message: 'Chantal Ngo s\'est inscrite sur le site.',
      type: 'user',
      read: true,
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
    }
  ];
};

const getMockExpensesList = () => {
  return [
    {
      id: 'exp-1',
      category: 'Sourcing Achat',
      amount: 150000,
      description: 'Importation de laines de mérinos et d\'alpaga',
      date: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'exp-2',
      category: 'Logistique locale',
      amount: 25000,
      description: 'Livraison Douala-Yaoundé',
      date: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'exp-3',
      category: 'Marketing',
      amount: 40000,
      description: 'Campagne de publicité réseaux sociaux',
      date: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    }
  ];
};

const getPrivateEntityFallback = (entity: string, id: string | undefined, uid: string | null, role: string | null) => {
  const normEntity = entity.replace(/_posts$/, '_post').replace(/_banners$/, '_banner').replace(/s$/, ''); // basic singularization
  
  if (normEntity === 'order') {
    const list = getMockOrdersList(uid);
    if (id) {
      const found = list.find(o => o.id === id);
      return found || {
        id,
        userId: uid || 'landry-uid',
        userName: 'Client Laine',
        userEmail: 'client@laine-deco.com',
        status: 'completed',
        total: 15000,
        subtotal: 12500,
        shipping: 2500,
        paymentMethod: 'momo',
        createdAt: new Date().toISOString(),
        date: new Date().toISOString(),
        items: [{ id: 'prod-mock', name: 'Article Laine & Déco', quantity: 1, price: 12500 }],
        shippingAddress: { fullName: 'Client Laine', address: 'Douala Centre', city: 'Douala', phone: '+237 600000000' }
      };
    }
    return list;
  }
  
  if (normEntity === 'user') {
    const list = getMockUsersList(uid);
    if (id) {
      const found = list.find(u => u.id === id);
      return found || {
        id,
        email: 'user@laine-deco.com',
        role: 'customer',
        name: 'Client',
        phone: '+237 600000000',
        createdAt: new Date().toISOString()
      };
    }
    return list;
  }
  
  if (normEntity === 'notification') {
    const list = getMockNotificationsList(uid);
    if (id) {
      const found = list.find(n => n.id === id);
      return found || {
        id,
        userId: uid || 'landry-uid',
        title: 'Notification',
        message: 'Message de notification',
        type: 'general',
        read: false,
        createdAt: new Date().toISOString()
      };
    }
    return list;
  }

  if (normEntity === 'expense') {
    const list = getMockExpensesList();
    if (id) {
      const found = list.find(e => e.id === id);
      return found || {
        id,
        category: 'Autre',
        amount: 10000,
        description: 'Dépense diverse',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
    }
    return list;
  }

  if (normEntity === 'member_portfolio' || normEntity === 'member_portfolios') {
    const list = [
      {
        id: 'landry',
        profileType: 'developer',
        name: 'Landry',
        role: 'Co-fondateur & Responsable Technique',
        role_en: 'Co-founder & Technical Lead',
        bio: 'Développeur passionné et garant de toute la partie digitale de Laine & Déco. Landry conçoit et optimise notre plateforme pour vous offrir une expérience d\'achat fluide, sécurisée et à la pointe de l\'innovation.',
        bio_en: 'Passionate developer and custodian of all digital aspects of Laine & Déco. Landry designs and optimizes our platform to offer a seamless, secure, and cutting-edge shopping experience.',
        email: 'landry@laine-deco.com',
        avatar: '',
        linkedin: 'https://linkedin.com',
        externalPortfolioUrl: '#',
        expertise: [
          {
            category: 'Frontend',
            skills: [{ name: 'React', iconUrl: '' }, { name: 'Tailwind CSS', iconUrl: '' }]
          }
        ],
        projects: [],
        experience: [],
        education: [],
        certifications: []
      },
      {
        id: 'sourcing',
        profileType: 'manager',
        name: 'L\'équipe Laine & Déco',
        role: 'Sourcing, Logistique & Service Client',
        role_en: 'Sourcing, Logistics & Customer Service',
        bio: 'Le cœur opérationnel de notre projet. Nous coordonnons les arrivages, supervisons le sourcing soigné de nos laines nobles, de nos crochets, aiguilles et accessoires de mercerie, et veillons à ce que chaque colis préparé à Douala soit une expérience chaleureuse.',
        bio_en: 'The operational heart of our project. We coordinate shipments, supervise the careful sourcing of our noble yarns, hooks, needles, and haberdashery accessories, ensuring each package prepared in Douala is a warm experience.',
        email: 'contact@laine-deco.com',
        avatar: '',
        linkedin: 'https://linkedin.com',
        expertise: [
          {
            category: 'Organisation',
            skills: [{ name: 'Sourcing', iconUrl: '' }, { name: 'Contrôle Qualité', iconUrl: '' }, { name: 'Logistique', iconUrl: '' }]
          }
        ],
        projects: [],
        experience: [],
        education: [],
        certifications: []
      }
    ];
    if (id) {
      return list.find(m => m.id === id) || { id };
    }
    return list;
  }

  // Fallback for other arbitrary private collections
  if (id) {
    return { id };
  }
  return [];
};

const readEntity = async (req: any, res: any) => {
  const entity = normalizeEntityName(req.params?.entity as string | undefined, req.path);
  const id = req.params?.id as string | undefined;
  const role = req.user?.role || null;
  const uid = req.user?.uid || null;

  if (!entity) {
    return rejectInvalidEntity(res, req.params?.entity as string | undefined);
  }

  if (PUBLIC_READ_COLLECTIONS.has(entity)) {
    return readPublicEntity(req, res, entity, id);
  }

  if (!(await ensureFirebaseReady(req, res))) {
    return;
  }

  logEntity(req.requestId, 'entity:resolve', {
    entity,
    id,
    uid: shortUid(uid),
    role,
    path: req.originalUrl,
  });

  if (!entity) {
    return rejectInvalidEntity(res, req.params?.entity as string | undefined);
  }

  // Defensively check for known Firestore quota exhaustions or DB rate limit (< 50 req/min)
  const quotaExhausted = checkQuotaStatus();
  if (quotaExhausted || !canExecuteDbRequest()) {
    console.warn(`[entityRoutes] Rate limit or Quota protection active. Serving private fallback for ${entity} (id: ${id})`);
    const fallbackData = getPrivateEntityFallback(entity, id, uid, role);
    return res.json(fallbackData);
  }

  try {
    // 1. Accès public universel (déjà routé plus haut, fallback de sécurité)
    if (PUBLIC_READ_COLLECTIONS.has(entity)) {
      return readPublicEntity(req, res, entity, id);
    }

    // 2. Si non connecté pour une ressource privée
    if (!uid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 3. Admin Level
    if (isAdminLevel(role)) {
      const adminCacheKey = `admin-firestore:${entity}:${id || 'list'}`;
      const freshAdminCache = await getFreshCachedResponse(adminCacheKey, PUBLIC_FIRESTORE_CACHE_TTL_MS);
      if (freshAdminCache !== null) {
        return res.json(freshAdminCache);
      }

      if (id) {
        const snap = await retryFirestoreOperation<any>(() => (db as any).collection(entity).doc(id).get());
        const data = snap.exists ? { id: snap.id, ...snap.data() } : null;
        if (data) await setCachedResponse(adminCacheKey, data);
        return res.json(data);
      }

      const snap = await retryFirestoreOperation<any>(() => (db as any).collection(entity).get());
      const docs = snap.docs.map((d: any) => ({
        id: d.id,
        ...d.data(),
      }));
      await setCachedResponse(adminCacheKey, docs);
      return res.json(docs);
    }

    // 4. Stock Manager
    if (isStockManager(role) && STAFF_READ_COLLECTIONS.has(entity)) {
      if (id) {
        const snap = await retryFirestoreOperation<any>(() => (db as any).collection(entity).doc(id).get());
        return res.json(snap.exists ? { id: snap.id, ...snap.data() } : null);
      }

      const snap = await retryFirestoreOperation<any>(() => (db as any).collection(entity).get());
      return res.json(snap.docs.map((d: any) => ({
        id: d.id,
        ...d.data(),
      })));
    }

    // 5. Propriétaire de la ressource (Commande, avis, etc.)
    if (OWNER_COLLECTIONS.has(entity)) {
      const snap = await retryFirestoreOperation<any>(() => (db as any).collection(entity).where('userId', '==', uid).get());

      return res.json(
        snap.docs.map((d: any) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    }

    return res.status(403).json({ error: 'Forbidden' });
  } catch (e: any) {
    if (isQuotaError(e)) {
      markQuotaExhausted();
      console.warn(`[entityRoutes] readEntity caught quota error. Serving fallback mock data for entity: ${entity}, id: ${id}`);
      const fallbackData = getPrivateEntityFallback(entity, id, uid, role);
      return res.json(fallbackData);
    }

    console.error('[entityRoutes] readEntity catch', {
      requestId: req.requestId,
      entity,
      id,
      role,
      uid,
      errorName: e?.name,
      errorMessage: e?.message,
      errorStack: e?.stack,
    });
    return res.status(400).json({ error: e.message });
  }
};

router.get('/:entity', optionalAuth, readEntity);
router.get('/:entity/:id', optionalAuth, readEntity);

export default router;
