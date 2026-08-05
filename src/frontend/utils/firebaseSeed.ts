import { collection, getDocs, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../backend/firebase';

let hasSeeded = false;

/**
 * Seed Firestore with initial data from constants.ts.
 * Only seeds collections that are EMPTY — safe to call multiple times.
 * Called automatically at app boot.
 */
export const seedFirebase = async () => {
  if (!db || hasSeeded) return;
  hasSeeded = true;

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

  for (const col of collectionsToSeed) {
    try {
      if (!col.data || col.data.length === 0) continue;

      const snapshot = await getDocs(collection(db, col.name));
      if (!snapshot.empty) continue;

      // Firestore batch limit is 500 operations
      const chunks = [];
      for (let i = 0; i < col.data.length; i += 450) {
        chunks.push(col.data.slice(i, i + 450));
      }

      for (const chunk of chunks) {
        const batch = writeBatch(db);
        chunk.forEach((item: any) => {
          const docRef = item.id
            ? doc(db, col.name, String(item.id))
            : doc(collection(db, col.name));
          batch.set(docRef, {
            ...item,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        });
        await batch.commit();
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'permission-denied') continue;
    }
  }
};
