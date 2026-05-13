import { useState, useCallback } from 'react';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../backend/firebase';
import { handleFirestoreError, OperationType } from './useEntity';

export function useEntityLazy<T>(entityType: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchEntity = useCallback(async (id: string) => {
    if (!db) {
      console.warn(`Firebase db is not initialized. Cannot fetch ${entityType}.`);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, entityType, String(id));
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setData({ id: docSnap.id, ...docSnap.data() } as T);
      } else {
        setData(null);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `${entityType}/${id}`);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [entityType]);

  return { data, isLoading, error, fetchEntity };
}
