import { db } from './server/firebaseAdmin.js';

async function seedHeroBanners() {
  console.log('Seeding hero_banner collection...');

  const collectionRef = db.collection('hero_banner');
  const snapshot = await collectionRef.get();

  if (!snapshot.empty) {
    console.log(`Collection hero_banner déjà peuplée (${snapshot.size} éléments).`);
    process.exit(0);
  }

  const initialBanners = [
    {
      title: 'Laine & Créations Artisanales',
      subtitle: 'Découvrez notre collection exclusive tricotée avec amour et passion.',
      ctaText: 'Découvrir la boutique',
      image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=1600',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      title: 'Nouvelle Collection Hiver',
      subtitle: 'Des fils doux et chauds pour toutes vos créations de la saison.',
      ctaText: 'Voir les nouveautés',
      image: 'https://images.unsplash.com/photo-1606760227091-3dd858d9721d?auto=format&fit=crop&q=80&w=1600',
      status: 'inactive',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  for (const banner of initialBanners) {
    const docRef = await collectionRef.add(banner);
    console.log(`Bannière créée avec l'ID: ${docRef.id} (${banner.title})`);
  }

  console.log('Seed hero_banner terminé avec succès !');
  process.exit(0);
}

seedHeroBanners().catch((err) => {
  console.error('Erreur lors du seed hero_banner:', err);
  process.exit(1);
});
