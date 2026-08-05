import { useState, useEffect, useRef } from 'react';
import type { QueryConstraint } from 'firebase/firestore';
import type { BaseEntity } from '../../domain/entities/BaseEntity';
import { getStaticEntityCacheKey, readCache, writeCache, getTTLForEntity } from '../utils/cacheStorage';

interface UseStaticEntityOptions {
  enabled?: boolean;
  constraints?: QueryConstraint[];
  deps?: unknown[];
}

const DEFAULT_LIMIT = 0;

interface StaticEntityUpdatePayload<T> {
  entityType: string;
  fullData?: T[];
  record?: T;
}

export function dispatchStaticEntityUpdate<T>(entityType: string, payload: { fullData?: T[]; record?: T }) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('staticEntity:update', { detail: { entityType, ...payload } }));
}

export function useStaticEntity<T extends BaseEntity = BaseEntity>(
  entityType: string,
  initialData: T[] = [],
  options: UseStaticEntityOptions = {}
) {
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);
  const hasFetchedFromNetwork = useRef(false);
  const { enabled = true, constraints = [], deps = [] } = options;
  const cacheKey = getStaticEntityCacheKey(entityType, constraints);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const cachedData = await readCache<T[]>(cacheKey);
      if (cancelled || !isMounted.current) return;

      if (cachedData) {
        setData(cachedData.length > 0 ? cachedData : initialData);
        setIsLoading(false);
        setError(null);
        return;
      }

      if (!enabled || hasFetchedFromNetwork.current) {
        if (!cachedData) setIsLoading(false);
        return;
      }

      try {
        const [{ collection, getDocs, query, limit }, { initFirebase }] = await Promise.all([
          import('firebase/firestore'),
          import('../../backend/firebase'),
        ]);

        if (cancelled || !isMounted.current) return;

        const { db: firestoreDb } = initFirebase();
        if (!firestoreDb) {
          setIsLoading(false);
          return;
        }

        const finalConstraints: QueryConstraint[] = [...constraints];
        const hasLimit = finalConstraints.some((c) => (c as { type?: string }).type === 'limit');
        if (!hasLimit && DEFAULT_LIMIT > 0) {
          finalConstraints.push(limit(DEFAULT_LIMIT));
        }

        const q =
          finalConstraints.length > 0
            ? query(collection(firestoreDb, entityType), ...finalConstraints)
            : collection(firestoreDb, entityType);

        const snapshot = await getDocs(q);
        if (cancelled || !isMounted.current) return;

        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as T[];

        setData(items.length > 0 ? items : initialData);
        writeCache(cacheKey, items, getTTLForEntity(entityType));
        setIsLoading(false);
        setError(null);
        hasFetchedFromNetwork.current = true;
      } catch (err) {
        if (!isMounted.current || cancelled) return;
        setError(err as Error);
        setIsLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [cacheKey, enabled, entityType, ...deps]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onStaticEntityUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<StaticEntityUpdatePayload<T>>;
      const detail = customEvent.detail;
      if (!detail || detail.entityType !== entityType) return;

      if (detail.fullData) {
        setData(detail.fullData);
        writeCache(cacheKey, detail.fullData, getTTLForEntity(entityType));
      } else if (detail.record) {
        setData((prev) => {
          const next = prev.map((item) => (item.id === detail.record?.id ? { ...item, ...detail.record } : item));
          writeCache(cacheKey, next, getTTLForEntity(entityType));
          return next;
        });
      }
    };

    window.addEventListener('staticEntity:update', onStaticEntityUpdate as EventListener);
    return () => window.removeEventListener('staticEntity:update', onStaticEntityUpdate as EventListener);
  }, [cacheKey, entityType]);

  return {
    data,
    setData,
    isLoading,
    error,
  };
}
