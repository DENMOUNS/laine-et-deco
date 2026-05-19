import { firebaseAdmin, db } from './firebaseAdmin';
import * as constants from '../src/constants';

const collectionsToSeed = [
  { name: 'product', data: constants.PRODUCTS },
  { name: 'category', data: constants.CATEGORIES },
  { name: 'pack', data: constants.PACKS },
  { name: 'blog_post', data: constants.BLOG_POSTS },
  { name: 'review', data: constants.REVIEWS },
  { name: 'faq', data: constants.FAQ_ITEMS },
  { name: 'community_post', data: constants.COMMUNITY_POSTS },
  { name: 'lookbook_post', data: constants.LOOKBOOK_POSTS },
  { name: 'badge', data: constants.BADGES },
  { name: 'member_portfolio', data: constants.INITIAL_PORTFOLIOS },
  { name: 'coupon', data: constants.COUPONS },
  { name: 'promo_event', data: constants.PROMO_EVENTS },
  { name: 'shipping_rule', data: constants.SHIPPING_RULES },
  { name: 'tax_rule', data: constants.TAX_RULES },
  { name: 'catalog_price_rule', data: constants.CATALOG_PRICE_RULES },
  { name: 'currency', data: constants.CURRENCIES },
  { name: 'customer_group', data: constants.CUSTOMER_GROUPS },
  { name: 'notification', data: constants.NOTIFICATIONS },
  { name: 'chat_message', data: constants.CHAT_MESSAGES },
  { name: 'conversation', data: constants.CONVERSATIONS },
  { name: 'email', data: constants.EMAILS },
  { name: 'push_notification', data: constants.PUSH_NOTIFICATIONS },
  { name: 'subscriber', data: constants.SUBSCRIBERS },
  { name: 'expense', data: constants.EXPENSES },
  { name: 'rma', data: constants.RMAS },
  { name: 'abandoned_cart', data: constants.ABANDONED_CARTS },
  { name: 'site_config', data: [constants.SITE_CONFIG] },
  { name: 'city', data: constants.INITIAL_CITIES },
  { name: 'nav_item', data: constants.NAV_ITEMS },
  { name: 'admin_role', data: constants.ADMIN_ROLES },
  { name: 'user', data: constants.USERS },
  { name: 'order', data: constants.ORDERS },
  { name: 'analytics', data: constants.ANALYTICS }
];

export async function seedDashboardData() {
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
