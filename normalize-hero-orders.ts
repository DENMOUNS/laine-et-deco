import { db } from './server/firebaseAdmin.js';

async function normalizeOrders() {
  const snapshot = await db.collection('hero_banner').get();
  let index = 1;
  for (const doc of snapshot.docs) {
    const currentData = doc.data();
    const order = currentData.order || index;
    await doc.ref.update({ order });
    console.log(`Bannière ${doc.id} ("${currentData.title}") mise à jour avec order: ${order}`);
    index++;
  }
  process.exit(0);
}

normalizeOrders().catch(console.error);
