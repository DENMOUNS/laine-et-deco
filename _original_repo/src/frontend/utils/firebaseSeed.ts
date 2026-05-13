import { collection, addDoc, getDocs, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../backend/firebase';
import * as constants from '../../constants';

export const seedFirebase = async () => {
  if (!db) {
    console.warn("Firebase db is not initialized. Cannot seed database.");
    return;
  }
  const collectionsToSeed = [
    { name: 'product', data: constants.PRODUCTS },
    { name: 'category', data: constants.CATEGORIES },
    { name: 'user', data: constants.USERS },
    { name: 'order', data: constants.ORDERS },
    { name: 'blog_post', data: constants.BLOG_POSTS },
    { name: 'pack', data: constants.PACKS },
    { name: 'review', data: constants.REVIEWS },
    { name: 'promo_event', data: constants.PROMO_EVENTS },
    { name: 'chat_message', data: constants.CHAT_MESSAGES },
    { name: 'conversation', data: constants.CONVERSATIONS },
    { name: 'lookbook_post', data: constants.LOOKBOOK_POSTS },
    { name: 'community_post', data: constants.COMMUNITY_POSTS },
    { name: 'badge', data: constants.BADGES },
    { name: 'coupon', data: constants.COUPONS },
    { name: 'site_config', data: [constants.SITE_CONFIG] },
    { name: 'notification', data: constants.NOTIFICATIONS },
    { name: 'expense', data: constants.EXPENSES },
    { name: 'rma', data: constants.RMAS },
    { name: 'abandoned_cart', data: constants.ABANDONED_CARTS },
    { name: 'customer_group', data: constants.CUSTOMER_GROUPS },
    { name: 'tax_rule', data: constants.TAX_RULES },
    { name: 'shipping_rule', data: constants.SHIPPING_RULES },
    { name: 'catalog_price_rule', data: constants.CATALOG_PRICE_RULES },
    { name: 'city', data: constants.INITIAL_CITIES },
    { name: 'nav_item', data: constants.NAV_ITEMS }
  ];

  for (const col of collectionsToSeed) {
    try {
      console.log(`Checking collection: ${col.name}`);
      const snapshot = await getDocs(collection(db, col.name));
      if (snapshot.empty) {
        console.log(`Seeding collection: ${col.name}`);
        const batch = writeBatch(db);
        col.data.forEach((item: any) => {
          try {
            const docRef = item.id ? doc(db, col.name, String(item.id)) : doc(collection(db, col.name));
            batch.set(docRef, {
              ...item,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
          } catch (err) {
            console.error(`Error creating docRef for item in ${col.name}:`, item, err);
            throw err;
          }
        });
        await batch.commit();
        console.log(`Successfully seeded ${col.name}`);
      }
    } catch (err) {
      console.error(`Error processing collection ${col.name}:`, err);
      throw err;
    }
  }
};
