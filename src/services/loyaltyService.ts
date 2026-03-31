import { db } from '../firebase';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';

export const LoyaltyService = {
  async getPoints(uid: string): Promise<number> {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? (userDoc.data().loyaltyPoints || 0) : 0;
  },

  async addPoints(uid: string, points: number) {
    await updateDoc(doc(db, 'users', uid), {
      loyaltyPoints: increment(points)
    });
  },

  async referFriend(uid: string, friendEmail: string) {
    // Logic to handle referral, maybe add points to the referrer
    await this.addPoints(uid, 50); // Example: 50 points for referral
  }
};
