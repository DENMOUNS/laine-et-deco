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

async function getUserRole(uid: string): Promise<UserRole | null> {
  if (!db) return null;

  const userSnap = await db.collection('user').doc(uid).get();
  if (!userSnap.exists) return null;

  const role = userSnap.data()?.role;
  if (!role) return null;

  const roleSnap = await db.collection('role').doc(role).get();
  if (!roleSnap.exists) return null;

  return role;
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
  req.user!.role = await getUserRole(req.user!.uid);
  next();
};

// ==========================
// CREATE
// ==========================

router.post('/:entity', verifyToken, resolveRole, async (req: any, res) => {
  const { entity } = req.params;
  const role = req.user.role;
  const uid = req.user.uid;

  try {
    // admin + super-admin
    if (isAdminLevel(role)) {
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
    return res.status(400).json({ error: e.message });
  }
});

// ==========================
// UPDATE
// ==========================

router.put('/:entity/:id', verifyToken, resolveRole, async (req: any, res) => {
  const { entity, id } = req.params;
  const role = req.user.role;
  const uid = req.user.uid;

  try {
    const ref = db.collection(entity).doc(id);
    const snap = await ref.get();

    if (!snap.exists) {
      return res.status(404).json({ error: 'Introuvable' });
    }

    const data = snap.data()!;
    const isOwner =
      data.userId === uid || data.customerId === uid;

    // super admin + admin
    if (isAdminLevel(role)) {
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
});

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