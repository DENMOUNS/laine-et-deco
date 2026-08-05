import { Router, Request, Response, NextFunction } from 'express';
import { db, auth } from '../firebaseAdmin';

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
}

const STAFF_READ_COLLECTIONS = [
  'product',
  'category',
  'order',
  'user',
  'knitting_tool',
  'lookbook',
  'blog_post',
];

const OWNER_COLLECTIONS = [
  'order',
  'review',
  'community_post',
  'conversation',
  'chat_message',
  'wishlist',
  'rma',
];

// ==========================
// ROLE
// ==========================

async function getUserRole(uid: string, email?: string, existingRole?: string): Promise<UserRole | null> {
  if (!db) return null;

  const validRoles: UserRole[] = ['super-admin', 'admin', 'editor', 'stock-manager', 'support-client', 'customer'];

  if (existingRole && validRoles.includes(existingRole as UserRole)) {
    return existingRole as UserRole;
  }

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
  try {
    const bearer = req.headers.authorization;

    if (!bearer?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = bearer.replace('Bearer ', '');

    const decoded = await auth.verifyIdToken(token);
    req.user = decoded as any;

    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

const resolveRole = async (
  req: AuthenticatedRequest,
  _: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.uid) {
      return next(new Error('Unauthorized')); 
    }
    req.user.role = await getUserRole(req.user.uid, req.user.email, req.user.role as string);
    next();
  } catch (error: any) {
    console.error('resolveRole error:', error);
    return next(error);
  }
};

// ==========================
// CREATE
// ==========================

router.post('/:entity', verifyToken, resolveRole, async (req: any, res) => {
  const { entity } = req.params;
  const role = req.user?.role ?? null;
  const uid = req.user?.uid;

  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // admin + super-admin
    if (isAdminLevel(role)) {
      // If creating a user, record notification
      if (entity === 'user') {
        const userData = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const ref = await db.collection(entity).add(userData);

        // create system notification for user creation
        const notifId = `sys-user-${Date.now()}`;
        await db.collection('notification').doc(notifId).set({
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

        const ref = await db.collection(entity).add(productData);

        // create system notification for product creation
        const notifId = `sys-prod-${Date.now()}`;
        await db.collection('notification').doc(notifId).set({
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
        const docRef = db.collection(entity).doc(docId);
        await docRef.set({
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        return res.status(201).json({ id: docId });
      }

      if (entity === 'site_logo') {
        const newLogoData = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (newLogoData.status === 'active') {
          const activeLogos = await db.collection(entity).where('status', '==', 'active').get();
          const batch = db.batch();
          activeLogos.forEach((logo) => {
            batch.update(logo.ref, { status: 'inactive', updatedAt: new Date() });
          });
          const docRef = db.collection(entity).doc();
          batch.set(docRef, newLogoData);
          await batch.commit();
          return res.status(201).json({ id: docRef.id });
        }

        const ref = await db.collection(entity).add(newLogoData);
        return res.status(201).json({ id: ref.id });
      }

      const ref = await db.collection(entity).add({
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return res.status(201).json({ id: ref.id });
    }

    // owner
    if (OWNER_COLLECTIONS.includes(entity)) {
      const ref = await db.collection(entity).add({
        ...req.body,
        userId: uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return res.status(201).json({ id: ref.id });
    }

    return res.status(403).json({ error: 'Forbidden' });
  } catch (e: any) {
    console.error(`Entity create error for ${entity}:`, e);
    return res.status(400).json({ error: e.message });
  }
});

// ==========================
// UPDATE
// ==========================

const updateEntityHandler = async (req: any, res: Response) => {
  const { entity, id } = req.params;
  const role = req.user.role;
  const uid = req.user.uid;

  try {
    const ref = db.collection(entity).doc(id);
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

          await db.collection('notification').doc(notifId).set({
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
        const activeLogos = await db.collection(entity).where('status', '==', 'active').get();
        const batch = db.batch();
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

        await db.collection('notification').doc(notifId).set({
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
    if (OWNER_COLLECTIONS.includes(entity) && isOwner) {
      await ref.update({
        ...req.body,
        updatedAt: new Date(),
      });

      return res.json({ message: 'Updated' });
    }

    return res.status(403).json({ error: 'Forbidden' });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
};

router.put('/:entity/:id', verifyToken, resolveRole, updateEntityHandler);
router.patch('/:entity/:id', verifyToken, resolveRole, updateEntityHandler);

// ==========================
// DELETE
// ==========================

router.delete('/:entity/:id', verifyToken, resolveRole, async (req: any, res) => {
  const { entity, id } = req.params;
  const role = req.user.role;

  try {
    const ref = db.collection(entity).doc(id);

    if (isAdminLevel(role)) {
      await ref.delete();
      return res.json({ message: 'Deleted' });
    }

    return res.status(403).json({ error: 'Forbidden' });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
});

// ==========================
// READ
// ==========================

const readEntity = async (req: any, res: any) => {
  const { entity, id } = req.params;
  const role = req.user.role;
  const uid = req.user.uid;

  try {
    // admin
    if (isAdminLevel(role)) {
      if (id) {
        const snap = await db.collection(entity).doc(id).get();
        return res.json(snap.data());
      }

      const snap = await db.collection(entity).get();
      return res.json(snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })));
    }

    // stock manager
    if (isStockManager(role) && STAFF_READ_COLLECTIONS.includes(entity)) {
      if (id) {
        const snap = await db.collection(entity).doc(id).get();
        return res.json(snap.data());
      }

      const snap = await db.collection(entity).get();
      return res.json(snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })));
    }

    // owner
    if (OWNER_COLLECTIONS.includes(entity)) {
      const snap = await db.collection(entity)
        .where('userId', '==', uid)
        .get();

      return res.json(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    }

    return res.status(403).json({ error: 'Forbidden' });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
};

router.get('/:entity', verifyToken, resolveRole, readEntity);
router.get('/:entity/:id', verifyToken, resolveRole, readEntity);

export default router;
