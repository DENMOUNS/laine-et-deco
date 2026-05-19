import { useState, useEffect, useRef } from 'react';
import type { QueryConstraint } from 'firebase/firestore';
import type { BaseEntity } from '../../domain/entities/BaseEntity';

interface UseStaticEntityOptions {
  enabled?: boolean;
  constraints?: QueryConstraint[];
  deps?: unknown[];
}

const DEFAULT_LIMIT = 200;

/**
 * Charge les données une fois (getDocs). Import Firebase différé pour ne pas bloquer le LCP.
 */
export function useStaticEntity<T extends BaseEntity = BaseEntity>(
  entityType: string,
  initialData: T[] = [],
  options: UseStaticEntityOptions = {}
) {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);
  const hasFetched = useRef(false);
  const { enabled = true, constraints = [], deps = [] } = options;

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled || hasFetched.current) {
      if (!enabled) setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchData = async () => {
      try {
        const [{ collection, getDocs, query, limit }, { initFirebase }] = await Promise.all([
          import('firebase/firestore'),
          import('../../backend/firebase'),
        ]);

        if (cancelled) return;

        const { db: firestoreDb } = initFirebase();
        if (!firestoreDb) {
          if (isMounted.current) setIsLoading(false);
          return;
        }

        const finalConstraints: QueryConstraint[] = [...constraints];
        const hasLimit = finalConstraints.some((c) => (c as { type?: string }).type === 'limit');
        if (!hasLimit) {
          finalConstraints.push(limit(DEFAULT_LIMIT));
        }

        const q =
          finalConstraints.length > 0
            ? query(collection(firestoreDb, entityType), ...finalConstraints)
            : collection(firestoreDb, entityType);

        const snapshot = await getDocs(q);

        if (!isMounted.current || cancelled) return;

        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as T[];

        setData(items.length > 0 ? items : initialData);
        setIsLoading(false);
        setError(null);
        hasFetched.current = true;
      } catch (err) {
        if (!isMounted.current || cancelled) return;
        setError(err as Error);
        setIsLoading(false);
      }
    };

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, [entityType, enabled, ...deps]);

  return {
    data,
    setData,
    isLoading,
    error,
  };
}
