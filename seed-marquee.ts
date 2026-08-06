import { db } from './server/firebaseAdmin.js';

async function seedMarquee() {
  console.log('Seeding marquee_item collection to Firestore...');
  
  const marqueeItems = [
    {
      id: 'mq-1',
      text: 'LIVRAISON OFFERTE DÈS 200 000 FCFA',
      iconName: 'Package',
      order: 1,
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'mq-2',
      text: 'NOUVELLE COLLECTION DISPONIBLE',
      iconName: 'Sparkles',
      order: 2,
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'mq-3',
      text: 'TRICOTÉ AVEC AMOUR',
      iconName: 'Heart',
      order: 3,
      status: 'active',
      createdAt: new Date().toISOString(),
    },
  ];

  for (const item of marqueeItems) {
    await db.collection('marquee_item').doc(item.id).set(item, { merge: true });
    console.log(`Pushed document ${item.id} to marquee_item collection.`);
  }

  console.log('Successfully seeded marquee_item to Firestore!');
  process.exit(0);
}

seedMarquee().catch((err) => {
  console.error('Error seeding marquee_item:', err);
  process.exit(1);
});
