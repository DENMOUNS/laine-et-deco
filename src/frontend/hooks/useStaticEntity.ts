import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, limit, type QueryConstraint } from 'firebase/firestore';
import type { BaseEntity } from '../../domain/entities/BaseEntity';
import { getStaticEntityCacheKey, readCache, writeCache, getTTLForEntity } from '../utils/cacheStorage';
import { initFirebase } from '../../backend/firebase';

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
      // 1. Essai de lecture dans le cache local (Fast Read)
      let cachedData: T[] | null = null;
      try {
        cachedData = await readCache<T[]>(cacheKey);
      } catch (e) {
        cachedData = null;
      }

      if (cancelled || !isMounted.current) return;

      if (cachedData && cachedData.length > 0) {
        setData(cachedData);
        setIsLoading(false);
        setError(null);
        return;
      }

      if (!enabled || hasFetchedFromNetwork.current) {
        setIsLoading(false);
        return;
      }

      // 2. Si le cache est vide ou absent, appel immédiat à Firestore (avec fallback API backend en cas d'erreur d'index)
      try {
        const { db: firestoreDb } = initFirebase();
        let items: T[] = [];

        if (firestoreDb) {
          try {
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
            items = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...docSnap.data(),
            })) as T[];
          } catch {
            const res = await fetch(`/api/entity/${encodeURIComponent(entityType)}`).catch(() => null);
            if (res && res.ok) {
              const body = await res.json().catch(() => null);
              items = Array.isArray(body) ? body : (body?.data || []);
            }
          }
        } else {
          const res = await fetch(`/api/entity/${encodeURIComponent(entityType)}`).catch(() => null);
          if (res && res.ok) {
            const body = await res.json().catch(() => null);
            items = Array.isArray(body) ? body : (body?.data || []);
          }
        }

        if (cancelled || !isMounted.current) return;

        const finalData = items.length > 0 ? items : initialData;
        setData(finalData);
        if (items.length > 0) {
          writeCache(cacheKey, items, getTTLForEntity(entityType));
        }
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
