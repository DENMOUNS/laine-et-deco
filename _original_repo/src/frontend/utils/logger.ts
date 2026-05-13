import { db, auth } from '../../backend/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { UAParser } from 'ua-parser-js';

export const logActivity = async (method: string, path: string, statusCode: number = 200, duration: number = 0, explicitUserId?: string) => {
  try {
    const userAgent = navigator.userAgent;
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser().name || 'Unknown';
    const device = parser.getDevice().type || parser.getOS().name || 'Desktop';
    
    // Prioritize explicitUserId, then auth.currentUser?.uid, then 'anonyme'
    const finalUserId = explicitUserId || auth.currentUser?.uid || 'anonyme';

    const logData = {
      userId: finalUserId,
      method,
      path,
      statusCode,
      duration,
      device,
      browser,
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp(),
      ip: 'client-side' // We can't easily get IP on client side without an external service
    };

    await addDoc(collection(db, 'log'), logData);
  } catch (error) {
    console.error('Error saving log to Firestore:', error);
  }
};
