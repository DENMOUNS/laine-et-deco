import { db } from './server/firebaseAdmin.js';

async function checkHeroBanners() {
  const snapshot = await db.collection('hero_banner').get();
  console.log(`Nombre total de bannières dans hero_banner: ${snapshot.size}`);
  snapshot.docs.forEach((doc) => {
    console.log(`ID: ${doc.id} | Titre: "${doc.data().title}" | Order: ${doc.data().order} | Status: "${doc.data().status}"`);
  });
  process.exit(0);
}

checkHeroBanners().catch(console.error);
