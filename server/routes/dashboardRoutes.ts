import { Router, Request, Response, NextFunction } from 'express';
import { firebaseAdmin, db, auth } from '../firebaseAdmin';
import * as constants from '../../src/constants';
import { migrateCreatedAt, seedDashboardData } from '../dashboardSeed';

const router = Router();

// Debug: indicate this routes module was loaded
try { console.log('[ROUTES] dashboardRoutes module loaded'); } catch (e) { }

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

const SYSTEM_CONFIG_COLLECTIONS = new Set([
  'invoice_config',
  'qr_config',
  'site_logo',
  'site_color',
  'hero_banner',
  'announcement_banner',
  'scrolling_banner',
  'seo_page',
  'loyalty_config_history',
  'maintenance_config_history',
  'newsletter_config_history',
  'custom_section_config',
]);

function buildSystemConfigDocs(siteConfig: any) {
  const branding = siteConfig?.branding || {};
  const newsletter = siteConfig?.newsletterPopup || {};
  const now = firebaseAdmin.firestore.FieldValue.serverTimestamp();
  const meta = { createdAt: now, updatedAt: now };
  const docs: { collectionName: string; id: string; data: any }[] = [
    {
      collectionName: 'invoice_config',
      id: 'global',
      data: {
        phone: '+237 000 000 000',
        email: 'contact@laine-deco.com',
        paymentPhone: '+237 000 000 000',
        paymentName: 'Laine et Déco',
        address: 'Douala, Cameroun',
        message1: 'Les articles faits sur-mesure ne sont ni repris ni échangés.',
        message2: 'Merci de vérifier votre commande à la réception.',
        footerMessage: 'Merci pour votre confiance !',
        ...meta,
      },
    },
    {
      collectionName: 'qr_config',
      id: 'global',
      data: {
        whatsappNumber: siteConfig?.qrConfig?.whatsappNumber || '+237600000000',
        whatsappMessage: siteConfig?.qrConfig?.whatsappMessage || 'Bonjour Laine et Déco, je souhaite passer commande.',
        welcomeMessage: siteConfig?.qrConfig?.welcomeMessage || 'Bienvenue chez Laine et Déco ! Découvrez nos créations uniques.',
        ...meta,
      },
    },
    {
      collectionName: 'site_logo',
      id: 'default-logo',
      data: { image: '', lien: branding.logo || siteConfig?.hero?.backgroundImages?.[0] || '/logo.png', status: 'active', ...meta },
    },
    {
      collectionName: 'site_color',
      id: 'default-color',
      data: {
        primaryColor: branding.primaryColor || siteConfig?.primaryColor || '#3E4A3D',
        secondaryColor: branding.secondaryColor || '#B85535',
        accentColor: siteConfig?.accentColor || '#5C6B5A',
        backgroundColor: '#fbf9f6',
        status: 'active',
        ...meta,
      },
    },
    {
      collectionName: 'announcement_banner',
      id: 'default-announcement',
      data: { message: siteConfig?.adBannerText || '', status: siteConfig?.showAdBanner ? 'active' : 'inactive', ...meta },
    },
    {
      collectionName: 'loyalty_config_history',
      id: 'default-loyalty',
      data: { config: siteConfig?.loyaltyConfig || constants.SITE_CONFIG.loyaltyConfig, status: 'active', ...meta },
    },
    {
      collectionName: 'maintenance_config_history',
      id: 'default-maintenance',
      data: {
        isActive: siteConfig?.maintenance?.isActive || false,
        message: siteConfig?.maintenance?.message || '',
        endDate: siteConfig?.maintenance?.endDate || '',
        status: 'active',
        ...meta,
      },
    },
    {
      collectionName: 'newsletter_config_history',
      id: 'default-newsletter',
      data: {
        isActive: newsletter.isActive || false,
        title: newsletter.title || '',
        message: newsletter.message || '',
        delay: newsletter.delay || 5000,
        image: newsletter.image || '',
        button1Text: "S'inscrire",
        button2Text: 'Non merci',
        status: 'active',
        ...meta,
      },
    },
  ];

  (siteConfig?.sliderItems || []).forEach((slide: any) => {
    docs.push({
      collectionName: 'hero_banner',
      id: String(slide.id),
      data: {
        image: slide.image,
        title: slide.title,
        subtitle: slide.subtitle || '',
        ctaText: siteConfig?.hero?.ctaText || 'Découvrir',
        status: 'active',
        ...meta,
      },
    });
  });

  (siteConfig?.marqueeItems || []).forEach((item: any) => {
    docs.push({
      collectionName: 'scrolling_banner',
      id: String(item.id),
      data: { text: item.text, iconName: item.iconName, status: 'active', ...meta },
    });
  });

  Object.entries(siteConfig?.seo || {}).forEach(([page, pageMeta]: [string, any]) => {
    docs.push({
      collectionName: 'seo_page',
      id: `seo-${page}`,
      data: { page, metaTitle: pageMeta.title || '', metaDescription: pageMeta.description || '', status: 'active', ...meta },
    });
  });

  (siteConfig?.customSections || []).forEach((section: any) => {
    docs.push({
      collectionName: 'custom_section_config',
      id: String(section.id),
      data: { title: section.title, type: section.type, itemIds: section.itemIds || [], status: 'active', ...meta },
    });
  });

  return docs;
}

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

// Old routes removed - use generic /config/:collectionName/:id instead

router.get('/config/:collectionName/:id', verifyToken, resolveRole, async (req: any, res) => {
  const role = req.user?.role ?? null;
  const { collectionName, id } = req.params;

  if (!isAdminLevel(role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (!SYSTEM_CONFIG_COLLECTIONS.has(collectionName)) {
    return res.status(400).json({ error: 'Collection config non autorisée.' });
  }

  try {
    // Try to get by document ID first
    let snap = await db.collection(collectionName).doc(id).get();
    
    // If not found, try to find by field 'id' (fallback for legacy seed data)
    if (!snap.exists) {
      const query = await db.collection(collectionName).where('id', '==', id).limit(1).get();
      if (!query.empty) {
        snap = query.docs[0];
      }
    }
    
    if (!snap.exists) {
      return res.status(404).json({ error: 'Configuration introuvable.' });
    }
    return res.json({ id: snap.id, ...snap.data() });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Impossible de lire la configuration.' });
  }
});

router.put('/config/:collectionName/:id', verifyToken, resolveRole, async (req: any, res) => {
  const role = req.user?.role ?? null;
  const { collectionName, id } = req.params;

  if (!isAdminLevel(role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (!SYSTEM_CONFIG_COLLECTIONS.has(collectionName)) {
    return res.status(400).json({ error: 'Collection config non autorisée.' });
  }

  try {
    // Try to find the document first (to get its actual ID)
    let docId = id;
    let snap = await db.collection(collectionName).doc(id).get();
    
    // If not found by document ID, try by field 'id'
    if (!snap.exists) {
      const query = await db.collection(collectionName).where('id', '==', id).limit(1).get();
      if (!query.empty) {
        docId = query.docs[0].id;
        snap = query.docs[0];
      } else {
        return res.status(404).json({ error: 'Configuration introuvable.' });
      }
    }
    
    // Update using the actual document ID
    await db.collection(collectionName).doc(docId).set({
      ...req.body,
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    return res.json({ message: 'Configuration enregistrée.' });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Impossible d\'enregistrer la configuration.' });
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

// GET config (qr_config ou invoice_config)
router.get('/config/:type', verifyToken, resolveRole, async (req: any, res) => {
  const { type } = req.params;
  const allowed = ['qr_config', 'invoice_config'];
  
  if (!allowed.includes(type)) {
    return res.status(400).json({ error: 'Type non autorisé' });
  }

  try {
    // Prefer explicit 'global' doc id, then fallback to legacy 'id' field,
    // then fallback to any document in the collection. If nothing found,
    // return an empty object (like public endpoint) so the admin UI can
    // render defaults instead of crashing on 404.
    let snap: any = await db.collection(type).doc('global').get();

    if (!snap.exists) {
      const query = await db.collection(type).where('id', '==', 'global').limit(1).get();
      if (!query.empty) snap = query.docs[0];
    }

    if (!snap.exists) {
      const any = await db.collection(type).limit(1).get();
      if (!any.empty) snap = any.docs[0];
    }

    if (!snap || !snap.exists) {
      return res.json({});
    }

    return res.json({ id: snap.id, ...snap.data() });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// PUT config
router.put('/config/:type', verifyToken, resolveRole, async (req: any, res) => {
  const { type } = req.params;
  const role = req.user?.role ?? null;
  const allowed = ['qr_config', 'invoice_config'];

  if (!allowed.includes(type)) {
    return res.status(400).json({ error: 'Type non autorisé' });
  }

  if (!isAdminLevel(role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const snapshot = await db.collection(type).limit(1).get();
    
    if (snapshot.empty) {
      // Créer si inexistant
      const ref = await db.collection(type).add({
        ...req.body,
        createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      });
      return res.json({ id: ref.id, message: 'Créé avec succès' });
    }
    
    const docRef = snapshot.docs[0].ref;
    await docRef.update({
      ...req.body,
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    });
    return res.json({ message: 'Mis à jour avec succès' });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// Route publique — pas besoin de token

router.get('/public/config/:collection/:docId', async (req, res) => {
  const { collection, docId } = req.params;
  const ALLOWED_PUBLIC = ['qr_config', 'invoice_config', 'site_config'];

  if (!ALLOWED_PUBLIC.includes(collection)) {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  try {
    let data: any = null;

    if (docId === 'global') {
      const snap = await db.collection(collection).limit(1).get();
      if (!snap.empty) {
        data = { id: snap.docs[0].id, ...snap.docs[0].data() };
      }
    } else {
      const snap = await db.collection(collection).doc(docId).get();
      if (snap.exists) {
        data = { id: snap.id, ...snap.data() };
      }
    }

    if (!data) {
      // ← NE PAS retourner 404 qui ferait crasher resp.ok
      // Retourner un objet vide avec les defaults
      return res.json({});
    }

    return res.json(data);
  } catch (e: any) {
    console.error('Public config fetch error:', e);
    return res.json({}); // ← toujours du JSON, jamais de HTML
  }
});

router.put('/config/:collection', verifyToken, resolveRole, async (req: any, res) => {
  const { collection } = req.params;
  const role = req.user?.role ?? null;
  const ALLOWED = ['qr_config', 'invoice_config'];

  if (!ALLOWED.includes(collection)) {
    return res.status(400).json({ error: 'Collection non autorisée' });
  }

  if (!isAdminLevel(role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const snap = await db.collection(collection).limit(1).get();

    if (snap.empty) {
      const ref = await db.collection(collection).add({
        ...req.body,
        createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      });
      return res.status(201).json({ id: ref.id });
    }

    await snap.docs[0].ref.update({
      ...req.body,
      updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
    });
    return res.json({ message: 'Mis à jour' });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// POST /invoice/generate - Create invoice generation job (authenticated)
router.post('/invoice/generate', verifyToken, resolveRole, async (req: any, res) => {
  const { orderId, isDuplicata } = req.body;
  const uid = req.user?.uid;
  const role = req.user?.role ?? null;

  if (!orderId) {
    return res.status(400).json({ error: 'orderId requis' });
  }

  // Allow customers to generate their own invoices, and staff/admin can generate any
  const isStaff = role && role !== 'customer';
  let order;
  try {
    order = await findOrderDoc(orderId);
  } catch (e: any) {
    console.error('[INVOICE_JOB] Error loading order:', e);
    return res.status(500).json({ error: e.message || 'Impossible de charger la commande' });
  }
  
  if (!order || !order.exists) {
    return res.status(404).json({ error: 'Commande introuvable' });
  }

  const orderData = order.data() as any;
  const canGenerate = isStaff || orderData.userId === uid;

  if (!canGenerate) {
    return res.status(403).json({ error: 'Accès refusé' });
  }

  try {
    // Create invoice job in Firestore
    const jobId = `invoice-job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const jobData = {
      id: jobId,
      orderId,
      isDuplicata: isDuplicata || false,
      status: 'pending', // pending | processing | completed | failed
      createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
      expiresAt: firebaseAdmin.firestore.Timestamp.fromMillis(Date.now() + 60000),
      createdBy: uid,
      pdfUrl: null,
      error: null,
    };

    await db.collection('invoice_job').doc(jobId).set(jobData);
    console.log(`[INVOICE_JOB] Created job ${jobId} for order ${orderId}`);

    return res.json({ jobId, status: 'pending' });
  } catch (e: any) {
    console.error('[INVOICE_JOB] Error creating job:', e);
    return res.status(500).json({ error: e.message || 'Impossible de créer la tâche' });
  }
});

// GET /invoice/job/:jobId - Poll job status (authenticated)
router.get('/invoice/job/:jobId', verifyToken, resolveRole, async (req: any, res) => {
  const { jobId } = req.params;
  const uid = req.user?.uid;
  const role = req.user?.role ?? null;

  try {
    const jobSnap = await db.collection('invoice_job').doc(jobId).get();
    if (!jobSnap.exists) {
      return res.status(404).json({ error: 'Job introuvable' });
    }

    const jobData = jobSnap.data() as any;
    const isStaff = role && role !== 'customer';
    if (!isStaff && jobData.createdBy !== uid) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    return res.json({
      jobId,
      status: jobData.status,
      pdfUrl: jobData.pdfUrl,
      error: jobData.error,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

// PUBLIC GET endpoint - QR config for landing page (no auth required)
router.get('/public/config/qr_config/global', async (_req, res) => {
  try {
    let snap = await db.collection('qr_config').doc('global').get();
    
    // If not found by document ID, try by field 'id' (fallback for legacy seed data)
    if (!snap.exists) {
      const query = await db.collection('qr_config').where('id', '==', 'global').limit(1).get();
      if (!query.empty) {
        snap = query.docs[0];
      }
    }
    
    if (!snap.exists) {
      return res.status(404).json({ error: 'Configuration QR introuvable.' });
    }
    return res.json({ id: snap.id, ...snap.data() });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Erreur lecture configuration QR.' });
  }
});

export default router;

