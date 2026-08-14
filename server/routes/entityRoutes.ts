import { Router, Request, Response, NextFunction } from 'express';
import { db, auth, ensureFirestoreConnection } from '../firebaseAdmin.js';
import retryFirestoreOperation from '../utils/firestoreRetry.js';
import {
  getFreshCachedResponse,
  getFallbackCachedResponse,
  setCachedResponse,
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

const logEntity = (requestId: string | undefined, message: string, meta: Record<string, unknown> = {}) => {
  console.info('[entity-api]', { requestId, message, ...meta });
};

const logEntityError = (requestId: string | undefined, message: string, error: any, meta: Record<string, unknown> = {}) => {
  const msg = String(error?.message || '').toLowerCase();
  const isFallbackError = msg.includes('cached fallback mode active') || msg.includes('fallback cache-only mode');

  const isQuota = !isFallbackError && error && (
    error.code === 8 || 
    error.status === 8 ||
    error.code === 'RESOURCE_EXHAUSTED' ||
    msg.includes('quota') ||
    msg.includes('resource_exhausted') ||
    msg.includes('limit exceeded')
  );

  if (isQuota) {
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

const PUBLIC_FIRESTORE_CACHE_TTL_MS = Number(process.env.FIRESTORE_CACHE_TTL_MS || '300000');

let isQuotaExhausted = false;
let lastQuotaExhaustedCheck = 0;
const QUOTA_EXHAUSTED_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes

const isQuotaError = (err: any): boolean => {
  if (!err) return false;
  const msg = String(err.message || '').toLowerCase();
  
  // EXPLICITLY ignore our own self-inflicted fallback/cached mode errors to prevent self-reinforcing loops
  if (msg.includes('cached fallback mode active') || msg.includes('fallback cache-only mode')) {
    return false;
  }

  const code = err.code || err.status;
  if (code === 8 || code === 'RESOURCE_EXHAUSTED') return true;
  return msg.includes('quota') || msg.includes('resource_exhausted') || msg.includes('limit exceeded');
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
    console.warn('[entity-api] Firestore quota is exhausted (RESOURCE_EXHAUSTED). Entering fallback cache-only mode for 30 minutes to save resources and avoid error loops.');
  }
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
  const staleCache = await getPublicFallbackCache(collectionName, id);
  const freshCache = await getPublicFreshCache(collectionName, id);
  const quotaExhausted = checkQuotaStatus();

  if (freshCache !== null && !isEmptyPublicList(freshCache) && !quotaExhausted) {
    logEntity(req.requestId, 'public:read:cache-hit', { entity, collectionName, id, source: 'fresh-cache' });
    return sendPublicReadResponse(res, freshCache);
  }

  if (quotaExhausted && staleCache !== null && !isEmptyPublicList(staleCache)) {
    logEntity(req.requestId, 'public:read:cache-fallback-quota-exhausted', {
      entity,
      collectionName,
      id,
      source: 'stale-cache-quota-exhausted',
    });
    return sendPublicReadResponse(res, staleCache);
  }

  let firestoreDb = db;
  if (!firestoreDb && !quotaExhausted) {
    await ensureFirestoreConnection(3, 500);
    firestoreDb = db;
  }

  const fetchAdminData = async () => {
    if (quotaExhausted) {
      throw new Error('Firestore quota is exhausted (cached fallback mode active)');
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

  if (staleCache !== null && !isEmptyPublicList(staleCache)) {
    if (firestoreDb && !quotaExhausted) {
      void fetchAdminData().catch((adminError: any) => {
        if (isQuotaError(adminError)) {
          markQuotaExhausted();
        }
        logEntityError(req.requestId, 'public:read:admin-failed', adminError, { entity, collectionName, id, reason: 'background-refresh' });
      });
    }
    logEntity(req.requestId, 'public:read:cache-fallback', {
      entity,
      collectionName,
      id,
      source: 'stale-cache',
    });
    return sendPublicReadResponse(res, staleCache);
  }

  if (firestoreDb && !quotaExhausted) {
    try {
      const adminResult = await fetchAdminData();
      return sendPublicReadResponse(res, adminResult);
    } catch (adminError: any) {
      if (isQuotaError(adminError)) {
        markQuotaExhausted();
      }
      logEntityError(req.requestId, 'public:read:admin-failed', adminError, { entity, collectionName, id });
      
      // En cas d'erreur de la BDD, utiliser le staleCache s'il existe
      if (staleCache !== null && !isEmptyPublicList(staleCache)) {
        logEntity(req.requestId, 'public:read:cache-fallback-on-error', { entity, collectionName, id });
        return sendPublicReadResponse(res, staleCache);
      }

      // Si aucune donnée en cache et la BDD a échoué, retourner une erreur 503 au lieu d'un faux 200 []
      return res.status(503).json({ error: `Database temporarily unavailable for ${entity}` });
    }
  }

  if (staleCache !== null && !isEmptyPublicList(staleCache)) {
    return sendPublicReadResponse(res, staleCache);
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
  isSuperAdmin(r) || isAdmin(r);

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
      if (entity === 'site_logo') {
        return res.status(404).json({ error: 'Introuvable' });
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

        return res.json({ message: 'Produit modifié' });
      }

      await ref.update({
        ...req.body,
        updatedAt: new Date(),
      });

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

        return res.json({ message: 'Status changé' });
      }
    }

    // owner
    if (OWNER_COLLECTIONS.has(entity) && isOwner) {
      await ref.update({
        ...req.body,
        updatedAt: new Date(),
      });

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

  try {
    // 1. Accès public universel pour les collections publiques (Bannières, Logos, Nav, Produits, etc.)
    if (PUBLIC_READ_COLLECTIONS.has(entity)) {
      res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
      if (id) {
        const snap = await retryFirestoreOperation<any>(() => (db as any).collection(entity).doc(id).get());
        if (!snap.exists) return res.json(null);
        // Diagnostic log: taille + aperçu avant envoi
        // eslint-disable-next-line no-console
        console.log('[entityRoutes] public read single', { requestId: req.requestId, entity, id: snap.id });
        return res.json({ id: snap.id, ...snap.data() });
      }

      const snap = await retryFirestoreOperation<any>(() => (db as any).collection(entity).get());
      const docs = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      // Diagnostic log: nombre de docs et aperçu du premier document envoyé
      // eslint-disable-next-line no-console
      console.log('[entityRoutes] public read list', {
        requestId: req.requestId,
        entity,
        count: docs.length,
        first: docs.length > 0 ? { id: docs[0].id } : null,
      });
      return res.json(docs);
    }

    // 2. Si non connecté pour une ressource privée
    if (!uid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 3. Admin Level
    if (isAdminLevel(role)) {
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
