import { useState, useEffect, useRef } from 'react';
import type { QueryConstraint } from 'firebase/firestore';
import type { BaseEntity } from '../../domain/entities/BaseEntity';
import { readEntityCache, writeEntityCache } from '../utils/cacheStorage';

interface UseStaticEntityOptions {
  enabled?: boolean;
  constraints?: QueryConstraint[];
  deps?: unknown[];
}

const DEFAULT_LIMIT = 0;
const DIAGNOSTIC_ENTITIES = new Set(['site_logo', 'nav_item', 'category']);

const logStaticEntity = (entityType: string, message: string, meta: Record<string, unknown> = {}) => {
  if (!DIAGNOSTIC_ENTITIES.has(entityType)) return;
  console.info('[static-entity]', { entityType, message, ...meta });
};

const logStaticEntityError = (entityType: string, message: string, error: any, meta: Record<string, unknown> = {}) => {
  if (!DIAGNOSTIC_ENTITIES.has(entityType)) return;
  console.error('[static-entity]', {
    entityType,
    message,
    ...meta,
    errorName: error?.name,
    errorCode: error?.code,
    errorMessage: error?.message,
  });
};
interface StaticEntityUpdatePayload<T> {
  entityType: string;
  fullData?: T[];
  record?: T;
}

export function dispatchStaticEntityUpdate<T>(entityType: string, payload: { fullData?: T[]; record?: T }) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('staticEntity:update', { detail: { entityType, ...payload } }));
}

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
    if (hasFetched.current) {
      return;
    }

    // On ne met en cache (et ne saute la lecture réseau) que pour les requêtes
    // "collection entière" sans filtre. Les requêtes avec contraintes (where/limit
    // spécifiques) sont trop variables pour partager un cache fiable et restent
    // donc en lecture directe (déjà généralement limitées via `limit(...)`).
    const isCacheableQuery = constraints.length === 0;
    let cancelled = false;

    const fetchData = async () => {
      const cachedData = isCacheableQuery ? await readEntityCache<T[]>(entityType) : null;
      if (cancelled) return;

      if (cachedData) {
        logStaticEntity(entityType, 'cache:hit', {
          count: cachedData.length,
          ids: cachedData.slice(0, 5).map((item: any) => item?.id),
        });
        // Cache encore valide (TTL non expiré) : on l'utilise et on
        // n'effectue AUCUNE lecture Firestore.
        setData(cachedData.length > 0 ? cachedData : initialData);
        setIsLoading(false);
        setError(null);
        hasFetched.current = true;
        return;
      }

      if (!enabled) {
        logStaticEntity(entityType, 'fetch:disabled');
        setIsLoading(false);
        return;
      }

      try {
        logStaticEntity(entityType, 'fetch:start', {
          constraints: constraints.length,
          host: typeof window !== 'undefined' ? window.location.host : 'server',
        });
        const [{ collection, getDocs, query, limit }, { initFirebase }] = await Promise.all([
          import('firebase/firestore'),
          import('../../backend/firebase'),
        ]);

        if (cancelled) return;

        const { db: firestoreDb } = initFirebase();
        if (!firestoreDb) {
          logStaticEntity(entityType, 'firebase:not-initialized');
          if (isMounted.current) setIsLoading(false);
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

        if (!isMounted.current || cancelled) return;

        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as T[];

        logStaticEntity(entityType, 'fetch:success', {
          count: items.length,
          ids: items.slice(0, 5).map((item: any) => item?.id),
          statuses: items.slice(0, 5).map((item: any) => item?.status),
          images: items.slice(0, 5).map((item: any) => item?.image || item?.lien || null),
        });

        setData(items.length > 0 ? items : initialData);
        if (isCacheableQuery) {
          writeEntityCache(entityType, items);
        }
        setIsLoading(false);
        setError(null);
        hasFetched.current = true;
      } catch (err) {
        if (!isMounted.current || cancelled) return;
        logStaticEntityError(entityType, 'fetch:failed', err, {
          constraints: constraints.length,
        });
        setError(err as Error);
        setIsLoading(false);
      }
    };

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, [entityType, enabled, ...deps]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onStaticEntityUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<StaticEntityUpdatePayload<T>>;
      const detail = customEvent.detail;
      if (!detail || detail.entityType !== entityType) return;

      if (detail.fullData) {
        setData(detail.fullData);
      } else if (detail.record) {
        setData((prev) => prev.map((item) => (item.id === detail.record?.id ? { ...item, ...detail.record } : item)));
      }
    };

    window.addEventListener('staticEntity:update', onStaticEntityUpdate as EventListener);
    return () => window.removeEventListener('staticEntity:update', onStaticEntityUpdate as EventListener);
  }, [entityType]);

  return {
    data,
    setData,
    isLoading,
    error,
  };
}
