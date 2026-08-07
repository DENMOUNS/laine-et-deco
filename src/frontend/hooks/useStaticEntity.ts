import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, limit, type QueryConstraint } from 'firebase/firestore';
import type { BaseEntity } from '../../domain/entities/BaseEntity';
import { getStaticEntityCacheKey, readCache, writeCache, getTTLForEntity, readEntityCache } from '../utils/cacheStorage';
import { initFirebase } from '../../backend/firebase';

interface UseStaticEntityOptions {
  enabled?: boolean;
  constraints?: QueryConstraint[];
  deps?: unknown[];
}

const DEFAULT_LIMIT = 0;

const ENTITY_TYPE_ALIASES: Record<string, string> = {
  hero_banners: 'hero_banner',
  nav_items: 'nav_item',
  marquee_items: 'marquee_item',
  products: 'product',
  categories: 'category',
  blog_posts: 'blog_post',
  promo_events: 'promo_event',
  flash_sales: 'flash_sale',
  lookbook: 'lookbook_post',
  lookbooks: 'lookbook_post',
  lookbook_posts: 'lookbook_post',
};

const resolveEntityType = (entityType: string) => ENTITY_TYPE_ALIASES[entityType] ?? entityType;

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
  const resolvedEntityType = resolveEntityType(entityType);
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);
  const hasFetchedFromNetwork = useRef(false);
  const { enabled = true, constraints = [], deps = [] } = options;
  const cacheKey = getStaticEntityCacheKey(resolvedEntityType, constraints);

  const getAuthHeaders = async () => {
    const headers: Record<string, string> = {};
    try {
      const { auth } = initFirebase();
      const token = await auth?.currentUser?.getIdToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Ignore missing auth / token retrieval errors.
    }
    return headers;
  };

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      // 1. Essai de lecture dans le cache local (Fast Read)
      let cachedData: T[] | null = null;
      try {
        cachedData = await readCache<T[]>(cacheKey);
        if (!cachedData) {
          cachedData = await readEntityCache<T[]>(resolvedEntityType);
        }
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

      if (hasFetchedFromNetwork.current) {
        setIsLoading(false);
        return;
      }

      // 2. Si le cache est vide ou absent, appel immédiat
      hasFetchedFromNetwork.current = true;
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
                ? query(collection(firestoreDb, resolvedEntityType), ...finalConstraints)
                : collection(firestoreDb, resolvedEntityType);

            // Timeout rapide de 1.5s sur le SDK Firestore client pour ne pas faire patienter l'utilisateur des minutes
            const fetchPromise = getDocs(q);
            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Firestore timeout')), 1500)
            );

            const snapshot = await Promise.race([fetchPromise, timeoutPromise]);
            items = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...docSnap.data(),
            })) as T[];
          } catch {
            // En cas d'erreur de permissions ou de timeout, appel direct à l'API backend
            const res = await fetch(`/api/entity/${encodeURIComponent(resolvedEntityType)}`, {
              credentials: 'same-origin',
              headers: await getAuthHeaders(),
            }).catch(() => null);
            if (res && res.ok) {
              const body = await res.json().catch(() => null);
              if (!body) {
                const txt = await res.text().catch(() => null);
                // eslint-disable-next-line no-console
                console.warn('[useStaticEntity] empty JSON body from /api/entity (fallback after getDocs)', {
                  entityType,
                  status: res.status,
                  statusText: res.statusText,
                  text: txt,
                  headers: Array.from(res.headers.entries()),
                });
              }
              items = Array.isArray(body) ? body : (body?.data || []);
            }
          }
        } else {
          const res = await fetch(`/api/entity/${encodeURIComponent(resolvedEntityType)}`, {
            credentials: 'same-origin',
            headers: await getAuthHeaders(),
          }).catch(() => null);
          if (res && res.ok) {
            const body = await res.json().catch(() => null);
            if (!body) {
              const txt = await res.text().catch(() => null);
              // eslint-disable-next-line no-console
              console.warn('[useStaticEntity] empty JSON body from /api/entity (no firestoreDb)', {
                entityType,
                status: res.status,
                statusText: res.statusText,
                text: txt,
                headers: Array.from(res.headers.entries()),
              });
            }
            items = Array.isArray(body) ? body : (body?.data || []);
          }
        }

        if (cancelled || !isMounted.current) return;

        const finalData = items.length > 0 ? items : initialData;
        setData(finalData);
        if (items.length > 0) {
          writeCache(cacheKey, items, getTTLForEntity(resolvedEntityType));
        }
        setIsLoading(false);
        setError(null);
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

    // Mise à jour optimiste (patch en mémoire sans re-fetch)
    const onStaticEntityUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<StaticEntityUpdatePayload<T>>;
      const detail = customEvent.detail;
      if (!detail) return;
      const isMatching = detail.entityType === entityType || resolveEntityType(detail.entityType) === resolvedEntityType;
      if (!isMatching) return;

      if (detail.fullData) {
        setData(detail.fullData);
        writeCache(cacheKey, detail.fullData, getTTLForEntity(resolvedEntityType));
      } else if (detail.record) {
        setData((prev) => {
          const next = prev.map((item) => (item.id === detail.record?.id ? { ...item, ...detail.record } : item));
          writeCache(cacheKey, next, getTTLForEntity(resolvedEntityType));
          return next;
        });
      }
    };

    // Invalidation après create/update/delete : re-fetch immédiat depuis Firestore
    const onStaticEntityInvalidate = (event: Event) => {
      const customEvent = event as CustomEvent<{ entityType: string }>;
      if (!customEvent.detail) return;
      const isMatching = customEvent.detail.entityType === entityType || resolveEntityType(customEvent.detail.entityType) === resolvedEntityType;
      if (!isMatching) return;

      hasFetchedFromNetwork.current = false;
      setIsLoading(true);

      const doRefetch = async () => {
        try {
          const { db: firestoreDb } = initFirebase();
          let items: T[] = [];

          if (firestoreDb) {
            const finalConstraints: QueryConstraint[] = [...constraints];
            const q =
              finalConstraints.length > 0
                ? query(collection(firestoreDb, resolvedEntityType), ...finalConstraints)
                : collection(firestoreDb, resolvedEntityType);
            const snapshot = await getDocs(q);
            items = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })) as T[];
          } else {
            const res = await fetch(`/api/entity/${encodeURIComponent(resolvedEntityType)}`, {
              credentials: 'same-origin',
              headers: await getAuthHeaders(),
            }).catch(() => null);
            if (res && res.ok) {
              const body = await res.json().catch(() => null);
              if (!body) {
                const txt = await res.text().catch(() => null);
                // eslint-disable-next-line no-console
                console.warn('[useStaticEntity] empty JSON body from /api/entity (invalidate refetch)', {
                  entityType,
                  status: res.status,
                  statusText: res.statusText,
                  text: txt,
                  headers: Array.from(res.headers.entries()),
                });
              }
              items = Array.isArray(body) ? body : (body?.data || []);
            }
          }

          if (items.length > 0) {
            setData(items);
            writeCache(cacheKey, items, getTTLForEntity(resolvedEntityType));
          }
        } catch {
          // Silencieux : on garde les données déjà affichées
        } finally {
          setIsLoading(false);
          hasFetchedFromNetwork.current = true;
        }
      };

      void doRefetch();
    };

    window.addEventListener('staticEntity:update', onStaticEntityUpdate as EventListener);
    window.addEventListener('staticEntity:invalidate', onStaticEntityInvalidate as EventListener);
    return () => {
      window.removeEventListener('staticEntity:update', onStaticEntityUpdate as EventListener);
      window.removeEventListener('staticEntity:invalidate', onStaticEntityInvalidate as EventListener);
    };
  }, [cacheKey, entityType, constraints]);

  return {
    data,
    setData,
    isLoading,
    error,
  };
}
