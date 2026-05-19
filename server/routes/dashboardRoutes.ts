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

  req.user.role = await getUserRole(req.user.uid, req.user.email, req.user.role as string);
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
  const uid = req.user?.uid;

  console.log(`[ORDER_STATUS] User ${uid} with role ${role} attempting to update order ${orderId} to ${status}`);

  if (!orderId || !status) {
    return res.status(400).json({ error: 'orderId and status are required' });
  }

  const canUpdate = isAdminLevel(role) || isStockManager(role);
  console.log(`[ORDER_STATUS] Permission check: isAdminLevel=${isAdminLevel(role)}, isStockManager=${isStockManager(role)}, canUpdate=${canUpdate}`);

  if (!canUpdate) {
    return res.status(403).json({ error: `Forbidden: role ${role} cannot update order status` });
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

    console.log(`[ORDER_STATUS] Updating order ${orderId}: ${oldStatus} → ${status}`);

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

    console.log(`[ORDER_STATUS] Creating notification:`, notification);
    await db.collection('notification').doc(notification.id).set(notification);

    console.log(`[ORDER_STATUS] Order update completed successfully`);
    return res.json({ message: 'Statut de commande mis à jour.', orderId, status });
  } catch (e: any) {
    console.error('[ORDER_STATUS] Error:', e);
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

router.post('/send-push-notification', verifyToken, resolveRole, async (req: any, res) => {
  const { title, message } = req.body;
  const role = req.user?.role ?? null;

  if (!title || !message) {
    return res.status(400).json({ error: 'title et message requis' });
  }

  const isStaff = (r: UserRole | null) => r !== null && r !== 'customer';
  if (!isStaff(role)) {
    return res.status(403).json({ error: `Forbidden: role ${role} cannot send push notifications` });
  }

  try {
    const customersSnap = await db.collection('user').where('role', '==', 'customer').get();
    const notificationId = `push-${Date.now()}`;
    const notificationData = {
      id: notificationId,
      type: 'push',
      title,
      message,
      timestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      read: false,
      recipientCount: customersSnap.size,
    };

    await db.collection('push_notification').doc(notificationId).set(notificationData);

    const batch = db.batch();
    customersSnap.docs.forEach((customerDoc) => {
      const notifRef = db.collection('notification').doc(`${customerDoc.id}-${notificationId}`);
      batch.set(notifRef, {
        id: `${customerDoc.id}-${notificationId}`,
        userId: customerDoc.id,
        type: 'push',
        title,
        message,
        timestamp: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        read: false,
      });
    });
    await batch.commit();

    return res.json({
      id: notificationId,
      recipientCount: customersSnap.size,
      message: `Notification envoyée à ${customersSnap.size} client(s)`,
    });
  } catch (e: any) {
    console.error('Push notification send failed:', e);
    return res.status(500).json({ error: e.message || 'Impossible d\'envoyer la notification' });
  }
});

// Stock transaction: add or remove stock for a product
router.post('/stock/test', verifyToken, resolveRole, async (req: any, res) => {
  console.log('[STOCK_TEST] reached');
  return res.json({ ok: true, test: 'stock test endpoint' });
});

router.post('/stock/transaction', verifyToken, resolveRole, async (req: any, res) => {
  console.log('[STOCK_TX] incoming request');
  const { productId, type, quantity, note } = req.body as { productId: string; type: 'add' | 'remove'; quantity: number; note?: string };
  const role = req.user?.role ?? null;
  const uid = req.user?.uid;

  const isStaff = (r: UserRole | null) => r !== null && r !== 'customer';
  if (!isStaff(role)) return res.status(403).json({ error: `Forbidden: role ${role} cannot manage stock` });

  if (!productId || !type || typeof quantity !== 'number' || quantity <= 0) {
    return res.status(400).json({ error: 'productId, type (add|remove) et quantity (>0) requis' });
  }

  try {
    const productRef = db.collection('product').doc(productId);

    const result = await db.runTransaction(async (tx) => {
      const snap = await tx.get(productRef);
      if (!snap.exists) throw new Error('Produit introuvable');

      const data = snap.data() as any;
      const beforeQty = Number(data.stock ?? data.quantity ?? 0);
      const delta = type === 'add' ? Math.abs(quantity) : -Math.abs(quantity);
      const afterQty = beforeQty + delta;

      if (afterQty < 0) throw new Error('Stock insuffisant');

      const updateField: any = {};
      if ('stock' in data) updateField.stock = afterQty;
      else if ('quantity' in data) updateField.quantity = afterQty;
      else updateField.stock = afterQty;
      updateField.updatedAt = firebaseAdmin.firestore.FieldValue.serverTimestamp();

      // Record lastRestock when adding stock
      if (type === 'add') {
        updateField.lastRestock = Math.abs(quantity);
        updateField.lastRestockAt = new Date().toISOString();
      }

      tx.update(productRef, updateField);

      const txId = `stock-${Date.now()}`;
      const txDoc = {
        id: txId,
        productId,
        type,
        quantity: Math.abs(quantity),
        before: beforeQty,
        after: afterQty,
        note: note || null,
        author: uid,
        timestamp: new Date().toISOString(),
      };

      tx.set(db.collection('stock_transaction').doc(txId), txDoc);

      // create notification about stock change
      const notifId = `sys-prod-${Date.now()}`;
      const title = type === 'add' ? 'Stock ajouté' : 'Stock retiré';
      const message = `${title} pour produit ${data.name || productId} : ${Math.abs(quantity)} (avant ${beforeQty} → après ${afterQty})`;

      tx.set(db.collection('notification').doc(notifId), {
        id: notifId,
        type: 'product',
        title,
        message,
        relatedId: productId,
        timestamp: new Date().toISOString(),
        read: false,
      });

      const stockField = 'stock' in data ? 'stock' : 'quantity';
      const productObj: any = { id: snap.id, ...data };
      productObj[stockField] = afterQty;
      if (type === 'add') {
        productObj.lastRestock = Math.abs(quantity);
        productObj.lastRestockAt = new Date().toISOString();
      }

      return { txDoc, product: productObj };
    });

    return res.json({ message: 'Transaction de stock enregistrée', transaction: result.txDoc, product: result.product });
  } catch (e: any) {
    console.error('Stock transaction failed:', e);
    return res.status(400).json({ error: e.message || 'Impossible d\'effectuer la transaction' });
  }
});

export default router;

