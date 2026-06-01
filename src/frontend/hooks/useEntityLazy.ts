import { useState, useCallback } from 'react';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../backend/firebase';
import { readCache, writeCache, getTTLForEntity } from '../utils/cacheStorage';

export function useEntityLazy<T>(entityType: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchEntity = useCallback(async (id: string) => {
    const cacheKey = `entityLazyCache:${entityType}:${id}`;
    const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    const dynamicEntities = ['order', 'user', 'notification', 'chat_message', 'conversation', 'abandoned_cart'];
    
    if (!isAdmin && !dynamicEntities.includes(entityType)) {
      const cached = readCache<T>(cacheKey);
      if (cached) {
        setData(cached);
        setIsLoading(false);
        return;
      }
    }

    if (!db) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, entityType, String(id));
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const itemData = { id: docSnap.id, ...docSnap.data() } as T;
        setData(itemData);
        if (!isAdmin) {
          writeCache(cacheKey, itemData, getTTLForEntity(entityType));
        }
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
