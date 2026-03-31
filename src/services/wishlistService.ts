import { db } from '../firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { Product } from '../types';

export const WishlistService = {
  async getWishlist(uid: string): Promise<string[]> {
    const q = query(collection(db, `wishlists/${uid}/items`));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.id);
  },

  async addToWishlist(uid: string, productId: string) {
    await setDoc(doc(db, `wishlists/${uid}/items`, productId), {
      uid,
      productId
    });
  },

  async removeFromWishlist(uid: string, productId: string) {
    await deleteDoc(doc(db, `wishlists/${uid}/items`, productId));
  }
};
