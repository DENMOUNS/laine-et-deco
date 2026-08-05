import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../backend/firebase';

export async function fetchCollection(name: string) {
  if (!db) return [];
  try {
    const q = query(collection(db, name));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    return [];
  }
}

export async function fetchBadges() {
  return fetchCollection('badge');
}

export async function fetchNavItems() {
  return fetchCollection('nav_item');
}

export async function fetchProducts() {
  return fetchCollection('product');
}

// add specific helpers as needed
