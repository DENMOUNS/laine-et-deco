import { firebaseAdmin, db } from './firebaseAdmin.js';
import { ensureServerCollections } from './utils/ensureCollectionsServer.js';

const collectionsToSeed = [
  { name: 'product', data: [] },
  { name: 'category', data: [] },
  { name: 'pack', data: [] },
  { name: 'blog_post', data: [] },
  { name: 'review', data: [] },
  { name: 'faq', data: [] },
  { name: 'community_post', data: [] },
  { name: 'lookbook_post', data: [] },
  { name: 'badge', data: [] },
  { name: 'member_portfolio', data: [] },
  { name: 'coupon', data: [] },
  { name: 'promo_event', data: [] },
  { name: 'flash_sale', data: [] },
  { name: 'shipping_rule', data: [] },
  { name: 'tax_rule', data: [] },
  { name: 'catalog_price_rule', data: [] },
  { name: 'currency', data: [] },
  { name: 'customer_group', data: [] },
  { name: 'notification', data: [] },
  { name: 'chat_message', data: [] },
  { name: 'conversation', data: [] },
  { name: 'email', data: [] },
  { name: 'push_notification', data: [] },
  { name: 'subscriber', data: [] },
  { name: 'expense', data: [] },
  { name: 'rma', data: [] },
  { name: 'abandoned_cart', data: [] },
  { name: 'city', data: [] },
  { name: 'nav_item', data: [] },
  { name: 'admin_role', data: [] },
  { name: 'user', data: [] },
  { name: 'order', data: [] }
];

export async function seedDashboardData() {
  // Ensure minimal collections exist before running the full seed
  try {
    await ensureServerCollections();
  } catch (err) {
    console.warn('ensureServerCollections failed', err);
  }
  for (const col of collectionsToSeed) {
    if (!col.data || col.data.length === 0) {
      continue;
    }

    const snapshot = await db.collection(col.name).limit(1).get();
    if (!snapshot.empty) {
      continue;
    }

    const chunks: any[][] = [];
    for (let i = 0; i < col.data.length; i += 450) {
      chunks.push(col.data.slice(i, i + 450));
    }

    for (const chunk of chunks) {
      const batch = db.batch();
      chunk.forEach((item: any) => {
        const docRef = item.id ? db.collection(col.name).doc(String(item.id)) : db.collection(col.name).doc();
        batch.set(docRef, {
          ...item,
          createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp()
        });
      });
      await batch.commit();
    }
  }
}

export async function migrateCreatedAt(collectionNames: string[]) {
  for (const collectionName of collectionNames) {
    const snapshot = await db.collection(collectionName).get();
    let batch = db.batch();
    let count = 0;

    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      if (!data.createdAt) {
        batch.update(docSnapshot.ref, {
          createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(),
        });
        count += 1;
      }

      if (count >= 450) {
        await batch.commit();
        batch = db.batch();
        count = 0;
      }
    }

    if (count > 0) {
      await batch.commit();
    }
  }
}
