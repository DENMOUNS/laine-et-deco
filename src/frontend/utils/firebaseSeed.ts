import { collection, getDocs, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../backend/firebase';
import * as constants from '../../constants';

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
    // Products & catalog
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

    // Commerce & pricing
    { name: 'coupon', data: constants.COUPONS },
    { name: 'promo_event', data: constants.PROMO_EVENTS },
    { name: 'shipping_rule', data: constants.SHIPPING_RULES },
    { name: 'tax_rule', data: constants.TAX_RULES },
    { name: 'catalog_price_rule', data: constants.CATALOG_PRICE_RULES },
    { name: 'currency', data: constants.CURRENCIES },
    { name: 'customer_group', data: constants.CUSTOMER_GROUPS },
    // Communication
    { name: 'notification', data: constants.NOTIFICATIONS },
    { name: 'chat_message', data: constants.CHAT_MESSAGES },
    { name: 'conversation', data: constants.CONVERSATIONS },
    { name: 'email', data: constants.EMAILS },
    { name: 'push_notification', data: constants.PUSH_NOTIFICATIONS },
    { name: 'subscriber', data: constants.SUBSCRIBERS },

    // Operations
    { name: 'expense', data: constants.EXPENSES },
    { name: 'rma', data: constants.RMAS },
    { name: 'abandoned_cart', data: constants.ABANDONED_CARTS },

    // Config (these stay as fallback in constants but also seed)
    { name: 'site_config', data: [constants.SITE_CONFIG] },
    { name: 'city', data: constants.INITIAL_CITIES },
    { name: 'nav_item', data: constants.NAV_ITEMS },
    { name: 'admin_role', data: constants.ADMIN_ROLES },
    { name: 'user', data: constants.USERS },
    { name: 'order', data: constants.ORDERS },
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
      console.warn(`Seed: failed to seed "${col.name}"`, err);
    }
  }
};
