import { getDb, firebaseAdmin } from '../firebaseAdmin.js';

// Ensure critical collections exist server-side, create minimal sample documents if empty
export async function ensureServerCollections() {
  const adminDb = getDb();
  if (!adminDb) return;

  const collections: { name: string; sample: any[] }[] = [
    { name: 'nav_item', sample: [{ id: 'nav-1', name: 'Accueil', view: 'home', order: 1, status: 'active' }] },
    { name: 'request_log', sample: [{ id: 'log-1', path: '/health', method: 'GET', status: 200, timestamp: new Date().toISOString() }] },
    { name: 'sales_data', sample: [{ id: 's-1', date: new Date().toISOString(), total: 0 }] },
    { name: 'device_data', sample: [{ id: 'd-1', userAgent: 'unknown', count: 1 }] },
  ];

  for (const col of collections) {
    try {
      const snap = await adminDb.collection(col.name).limit(1).get();
      if (snap.empty) {
        const batch = adminDb.batch();
        col.sample.forEach((item) => {
          const ref = adminDb.collection(col.name).doc(item.id || undefined);
          batch.set(ref, { ...item, createdAt: firebaseAdmin.firestore.FieldValue.serverTimestamp(), updatedAt: firebaseAdmin.firestore.FieldValue.serverTimestamp() });
        });
        await batch.commit();
      }
    } catch (err) {
      // ignore permission issues during seeding on hosted envs
      console.warn('ensureServerCollections error for', col.name, err);
    }
  }
}
