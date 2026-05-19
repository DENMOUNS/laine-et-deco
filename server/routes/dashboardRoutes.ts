import { Router, Request, Response, NextFunction } from 'express';
import { firebaseAdmin, db, auth } from '../firebaseAdmin';
import * as constants from '../../src/constants';
import { migrateCreatedAt, seedDashboardData } from '../dashboardSeed';

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

const isSuperAdmin = (role: UserRole | null) => role === 'super-admin';
const isAdmin = (role: UserRole | null) => role === 'admin';
const isStockManager = (role: UserRole | null) => role === 'stock-manager';
const isAdminLevel = (role: UserRole | null) => isSuperAdmin(role) || isAdmin(role);

async function getUserRole(uid: string): Promise<UserRole | null> {
  if (!db) return null;

  const userSnap = await db.collection('user').doc(uid).get();
  if (!userSnap.exists) return null;

  const role = userSnap.data()?.role;
  if (!role) return null;

  const roleSnap = await db.collection('role').doc(role).get();
  if (!roleSnap.exists) return null;

  return role as UserRole;
}

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
  res: Response,
  next: NextFunction
) => {
  if (!req.user?.uid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user.role = await getUserRole(req.user.uid);
  next();
};

const findOrderDoc = async (orderId: string) => {
  const directRef = db.collection('order').doc(orderId);
  const directSnap = await directRef.get();
  if (directSnap.exists) {
    return directSnap;
  }

  const querySnap = await db.collection('order').where('id', '==', orderId).limit(1).get();
  return querySnap.docs[0] ?? null;
};

router.put('/order/status', verifyToken, resolveRole, async (req: any, res) => {
  const { orderId, status } = req.body;
  const role = req.user?.role ?? null;

  if (!orderId || !status) {
    return res.status(400).json({ error: 'orderId and status are required' });
  }

  if (!isAdminLevel(role) && !isStockManager(role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const orderSnap = await findOrderDoc(orderId);
    if (!orderSnap || !orderSnap.exists) {
      return res.status(404).json({ error: 'Order introuvable' });
    }

    const orderData = orderSnap.data() as any;
    const oldStatus = orderData.status;
    const orderRef = orderSnap.ref;

    const orderStatusNotes: Record<string, string> = {
      pending: 'Commande passée',
      processing: 'Commande en cours de traitement',
      shipped: 'Commande expédiée',
      delivered: 'Commande livrée',
      cancelled: 'Commande annulée',
      completed: 'Commande complétée',
    };

    const noteText = orderStatusNotes[status] || `Statut de commande mis à jour : ${status}`;
    const orderNote = {
      id: `note-${Date.now()}`,
      note: noteText,
      author: 'Système',
      date: new Date().toISOString(),
    };

    await orderRef.update({
      status,
      internalNotes: firebaseAdmin.firestore.FieldValue.arrayUnion(orderNote),
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    });

    if (status === 'delivered' && oldStatus !== 'delivered' && orderData.userId) {
      const userRef = db.collection('user').doc(orderData.userId);
      const userSnap = await userRef.get();

      if (userSnap.exists) {
        const userData = userSnap.data() as any;
        const referralCode = userData?.referredBy;

        if (referralCode && !userData?.referralRewardGiven) {
          const deliveredOrdersSnapshot = await db
            .collection('order')
            .where('userId', '==', orderData.userId)
            .where('status', '==', 'delivered')
            .get();

          if (deliveredOrdersSnapshot.size <= 1) {
            const usersSnapshot = await db.collection('user').get();
            const referrer = usersSnapshot.docs.find((d) => d.id.substring(0, 8) === referralCode);

            if (referrer && referrer.id !== orderData.userId) {
              await referrer.ref.update({
                points: firebaseAdmin.firestore.FieldValue.increment(20),
                updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
              });
              await userRef.update({ referralRewardGiven: true, updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp() });
            }
          }
        }
      }
    }

    const notification = {
      id: `notif-${Date.now()}`,
      type: 'order',
      title: noteText,
      message: `Commande ${orderId} ${noteText.toLowerCase()}`,
      timestamp: new Date().toISOString(),
      read: false,
      relatedId: orderId,
    };

    await db.collection('notification').doc(notification.id).set(notification);

    return res.json({ message: 'Statut de commande mis à jour.' });
  } catch (e: any) {
    console.error('Dashboard order status update failed:', e);
    return res.status(500).json({ error: e.message || 'Impossible de mettre à jour la commande.' });
  }
});

router.post('/cities/reset', verifyToken, resolveRole, async (_req: any, res) => {
  const role = _req.user?.role ?? null;

  if (!isAdminLevel(role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const batch = db.batch();
    constants.INITIAL_CITIES.forEach((city: any) => {
      const docRef = db.collection('city').doc(String(city.id));
      batch.set(docRef, {
        ...city,
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();

    return res.json({ message: 'Villes réinitialisées.' });
  } catch (e: any) {
    console.error('Cities reset failed:', e);
    return res.status(500).json({ error: e.message || 'Impossible de réinitialiser les villes.' });
  }
});

router.post('/seed', verifyToken, resolveRole, async (_req: any, res) => {
  const role = _req.user?.role ?? null;

  if (!isAdminLevel(role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    await migrateCreatedAt(['nav_item', 'catalog_price_rule']);
    await seedDashboardData();
    return res.json({ message: 'Seed et migration exécutés.' });
  } catch (e: any) {
    console.error('Dashboard seed failed:', e);
    return res.status(500).json({ error: e.message || 'Impossible de lancer le seed.' });
  }
});

export default router;
