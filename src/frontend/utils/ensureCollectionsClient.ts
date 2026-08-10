import { collection, getDocs, writeBatch, doc, serverTimestamp, query, limit } from 'firebase/firestore';
import { db } from '../../backend/firebase';

export async function ensureClientCollections() {
  if (!db) return;

  const collections: { name: string; sample: any[] }[] = [
    { name: 'nav_item', sample: [{ id: 'nav-1', name: 'Accueil', view: 'home', order: 1, status: 'active' }] },
    { name: 'request_log', sample: [{ id: 'log-1', path: '/health', method: 'GET', status: 200, timestamp: new Date().toISOString() }] },
    { name: 'sales_data', sample: [{ id: 's-1', date: new Date().toISOString(), total: 0 }] },
    { name: 'device_data', sample: [{ id: 'd-1', userAgent: 'unknown', count: 1 }] },
  ];

  for (const col of collections) {
    try {
      // Only probe a single document to check emptiness — avoids scanning full collection
      const snap = await getDocs(query(collection(db, col.name), limit(1)));
      if (snap.empty) {
        const batch = writeBatch(db);
        for (const item of col.sample) {
          const ref = item.id ? doc(db, col.name, String(item.id)) : doc(collection(db, col.name));
          batch.set(ref, { ...item, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        }
        await batch.commit();
      }
    } catch (err) {
      // ignore permission issues
      // console.warn('ensureClientCollections error', col.name, err);
    }
  }
}
