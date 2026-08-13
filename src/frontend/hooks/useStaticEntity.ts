import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query, limit, type QueryConstraint } from 'firebase/firestore';
import type { BaseEntity } from '../../domain/entities/BaseEntity';
import { getStaticEntityCacheKey, readCache, writeCache, getTTLForEntity, readEntityCache } from '../utils/cacheStorage';
import { initFirebase } from '../../backend/firebase';
import { fetchEntityDataFromApi } from '../services/firestoreEntityService';

interface UseStaticEntityOptions {
  enabled?: boolean;
  constraints?: QueryConstraint[];
  deps?: unknown[];
  cacheOnly?: boolean;
}

const DEFAULT_LIMIT = 0;
const sharedStaticEntityFetches = new Map<string, Promise<unknown>>();

const fetchStaticEntityFromApi = async <T>(entityType: string, cacheKey: string): Promise<T[] | null> => {
  if (typeof window === 'undefined') {
    return null;
  }

  const existingPromise = sharedStaticEntityFetches.get(cacheKey) as Promise<T[] | null> | undefined;
  if (existingPromise) {
    return existingPromise;
  }

  const promise = (async () => {
    try {
      return await fetchEntityDataFromApi<T>(entityType);
    } finally {
      if (sharedStaticEntityFetches.get(cacheKey) === promise) {
        sharedStaticEntityFetches.delete(cacheKey);
      }
    }
  })();

  sharedStaticEntityFetches.set(cacheKey, promise);
  return promise;
};

const ENTITY_TYPE_ALIASES: Record<string, string> = {
  hero_banners: 'hero_banner',
  nav_items: 'nav_item',
  marquee_items: 'marquee_item',
  products: 'product',
  categories: 'category',
  blog_posts: 'blog_post',
  promo_events: 'promo_event',
  flash_sales: 'flash_sale',
  lookbook: 'lookbook',
  lookbooks: 'lookbook',
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
  const { enabled = true, constraints = [], deps = [], cacheOnly = false } = options;
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
      }

      if (cacheOnly) {
        // Mode strict : on n'effectue aucune requête réseau, on s'arrête
        hasFetchedFromNetwork.current = false;
        return;
      }

      if (hasFetchedFromNetwork.current) {
        return;
      }

      // 2. Si le cache est vide ou absent, appel immédiat
      hasFetchedFromNetwork.current = true;
      let items: T[] = [];
      const useApiFallback = constraints.length === 0;
      let apiRequestSucceeded = false;

      try {
      if (useApiFallback) {
        const apiData = await fetchStaticEntityFromApi<T>(resolvedEntityType, cacheKey);
        if (apiData !== null) {
          apiRequestSucceeded = true;
          items = apiData;
        }
      }

      const shouldTryClientFetch = items.length === 0 && !apiRequestSucceeded && (!cachedData || cachedData.length === 0);
      if (shouldTryClientFetch) {
        try {
          const res = await fetch(`/api/entity/${encodeURIComponent(resolvedEntityType)}`, {
            credentials: 'same-origin',
            headers: await getAuthHeaders(),
          }).catch(() => null);
          if (res && res.ok) {
            const body = await res.json().catch(() => null);
            items = Array.isArray(body) ? body : (body?.data || []);
          }
        } catch {
          // ignore
        }
      }

      if (cancelled || !isMounted.current) return;

      const finalData = items.length > 0 ? items : (cachedData ?? initialData);
      setData(finalData);
      if (items.length > 0) {
        writeCache(cacheKey, items, getTTLForEntity(resolvedEntityType));
        hasFetchedFromNetwork.current = true;
      } else {
        // En cas de tableau vide reçu ou d'échec temporaire réseau, autoriser un re-fetch ultérieur
        hasFetchedFromNetwork.current = false;
      }
      setIsLoading(false);
      setError(null);
      } catch (err) {
      if (!isMounted.current || cancelled) return;
      // Le cache reste prioritaire : une erreur de revalidation ne doit pas
      // remplacer les données déjà affichées par un skeleton.
      if (!cachedData || cachedData.length === 0) {
        setError(err as Error);
      }
      setIsLoading(false);
      }
    
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [cacheKey, enabled, entityType, cacheOnly, ...deps]);

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

    // Invalidation après create/update/delete : re-fetch immédiat depuis API/cache.
    const onStaticEntityInvalidate = (event: Event) => {
      const customEvent = event as CustomEvent<{ entityType: string }>;
      if (!customEvent.detail) return;
      const isMatching = customEvent.detail.entityType === entityType || resolveEntityType(customEvent.detail.entityType) === resolvedEntityType;
      if (!isMatching) return;

      hasFetchedFromNetwork.current = false;
      setIsLoading(true);

      // Si en mode cache-only, on n'essaie pas de revalider via le réseau
      if (cacheOnly) {
        setIsLoading(false);
        return;
      }

      const doRefetch = async () => {
        try {
          let items: T[] = [];
          const apiItems = await fetchStaticEntityFromApi<T>(resolvedEntityType, cacheKey);
          if (apiItems) {
            items = apiItems;
          } else {
            const res = await fetch(`/api/entity/${encodeURIComponent(resolvedEntityType)}`, {
              credentials: 'same-origin',
              headers: await getAuthHeaders(),
            }).catch(() => null);
            if (res && res.ok) {
              const body = await res.json().catch(() => null);
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
