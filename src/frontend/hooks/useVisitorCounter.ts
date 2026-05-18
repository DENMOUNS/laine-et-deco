import { useEffect } from 'react';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../backend/firebase';

export const useVisitorCounter = () => {
  useEffect(() => {
    const trackVisit = async () => {
      if (!db) return;

      const VISIT_KEY = 'last_visit_timestamp';
      const now = new Date().getTime();
      const lastVisit = localStorage.getItem(VISIT_KEY);
      
      // Track only once per day (24 hours)
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
      
      if (!lastVisit || (now - parseInt(lastVisit)) > TWENTY_FOUR_HOURS) {
        let currentPath = 'analytics/visitors';
        try {
          const visitorDocRef = doc(db, 'analytics', 'visitors');
          const docSnap = await getDoc(visitorDocRef);

          if (docSnap.exists()) {
            await updateDoc(visitorDocRef, {
              count: increment(1),
              updatedAt: serverTimestamp()
            });
          } else {
            // First time initializer
            await setDoc(visitorDocRef, {
              count: 1,
              updatedAt: serverTimestamp()
            });
          }
          
          localStorage.setItem(VISIT_KEY, now.toString());
          console.log('Visitor count incremented');
        } catch (error) {
          console.error('Error tracking visitor:', error);
          try {
            handleFirestoreError(error, OperationType.WRITE, currentPath);
          } catch (e) {
            // Error with context thrown
          }
        }
      }
    };

    // Delay a bit to not block initial render
    const timeoutId = setTimeout(trackVisit, 2000);
    return () => clearTimeout(timeoutId);
  }, []);
};
