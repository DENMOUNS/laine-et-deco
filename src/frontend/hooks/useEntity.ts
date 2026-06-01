import { useState, useEffect, useRef } from 'react';
import type { QueryConstraint } from 'firebase/firestore';
import type { EntityPayload } from '../services/firestoreEntityService';
import type { BaseEntity } from '../../domain/entities/BaseEntity';

interface UseEntityOptions {
  enabled?: boolean;
  constraints?: QueryConstraint[];
  deps?: unknown[];
}

import { readCache, writeCache, getTTLForEntity } from '../utils/cacheStorage';

const CACHEABLE_ENTITIES = [
  'product',
  'pack',
  'blog_post',
  'lookbook',
  'category',
  'faq',
  'sales_data',
  'order',
  'admin_role',
  'traffic_source',
  'retention_data',
  'category_distribution',
  'device_data',
  'user',
  'revenue_by_payment',
  'site_config',
  'notification',
  'nav_item',
  'coupon',
  'promo_event',
  'flash_sale',
  'site_logo',
  'hero_banner',
  'announcement_banner',
  'scrolling_banner',
  'site_color',
  'city',
  'shipping_rule',
  'tax_rule'
];

export function useEntity<T extends BaseEntity = BaseEntity>(
  entityType: string,
  initialData: T[] = [],
  options: UseEntityOptions = {}
) {
  const cacheKey = `entityCache:${entityType}`;
  const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  
  const [data, setData] = useState<T[]>(() => {
    if (CACHEABLE_ENTITIES.includes(entityType)) {
      const cached = readCache<T[]>(cacheKey);
      if (cached) return cached;
    }
    return initialData;
  });

  const isCachedAndValid = CACHEABLE_ENTITIES.includes(entityType) && readCache<T[]>(cacheKey) !== null;
  const [isLoading, setIsLoading] = useState(!isCachedAndValid);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);
  const { enabled = true, constraints = [], deps = [] } = options;

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

    // Client-side optimization: If we have valid cache and we are not in admin, skip fetching
    // BUT only for entities that don't need real-time updates for clients.
    const dynamicEntities = ['order', 'user', 'notification', 'chat_message', 'conversation', 'abandoned_cart'];
    if (!isAdmin && isCachedAndValid && !dynamicEntities.includes(entityType)) {
      setIsLoading(false);
      
      // SWR: Fetch only documents updated since the cache was created
      void import('../services/firestoreEntityService').then(async ({ subscribeToEntityCollection }) => {
        const [{ readCacheCreatedAt }, { collection, getDocs, query, where }, { initFirebase }] = await Promise.all([
          import('../utils/cacheStorage'),
          import('firebase/firestore'),
          import('../../backend/firebase')
        ]);
        
        const cacheTime = readCacheCreatedAt(cacheKey);
        if (!cacheTime) return;
        
        const { db: firestoreDb } = initFirebase();
        if (!firestoreDb) return;
        
        try {
          const q = query(
            collection(firestoreDb, entityType),
            where('updatedAt', '>', new Date(cacheTime).toISOString())
          );
          const snapshot = await getDocs(q);
          if (snapshot.empty) return;
          
          // Merge updated docs into cache and state
          const updatedItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
          setData(prev => {
            const newMap = new Map(prev.map(p => [p.id, p]));
            updatedItems.forEach(item => newMap.set(item.id, item));
            const merged = Array.from(newMap.values());
            writeCache(cacheKey, merged, getTTLForEntity(entityType));
            return merged;
          });
        } catch (e) {
          // ignore SWR errors silently
        }
      });
      
      return;
    }

    let cancelled = false;
    let unsubscribe = () => {};

    void import('../services/firestoreEntityService').then(({ subscribeToEntityCollection }) => {
      if (cancelled) return;

      unsubscribe = subscribeToEntityCollection<T>(
        entityType,
        { constraints },
        (items) => {
          if (!isMounted.current) return;
          setData(items);
          if (CACHEABLE_ENTITIES.includes(entityType)) {
            writeCache(cacheKey, items, getTTLForEntity(entityType));
          }
          setIsLoading(false);
          setError(null);
        },
        (err) => {
          if (!isMounted.current) return;
          setError(err);
          setIsLoading(false);
        }
      );
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [entityType, enabled, isAdmin, isCachedAndValid, ...deps]);

  const withService = async <R>(
    fn: (svc: typeof import('../services/firestoreEntityService')) => Promise<R>
  ): Promise<R> => {
    const svc = await import('../services/firestoreEntityService');
    return fn(svc);
  };

  const addEntity = async (newItem: EntityPayload<T>) =>
    withService((svc) => svc.createFirestoreEntity<T>(entityType, newItem));

  const updateEntity = async (id: string, updates: Partial<T>) =>
    withService((svc) => svc.updateFirestoreEntity<T>(entityType, id, updates));

  const setEntity = async (id: string, entityData: Partial<T>) =>
    withService((svc) => svc.setFirestoreEntity<T>(entityType, id, entityData));

  const deleteEntity = async (id: string) =>
    withService((svc) => svc.deleteFirestoreEntity(entityType, id));

  return {
    data,
    setData,
    isLoading,
    error,
    addEntity,
    createEntity: addEntity,
    updateEntity,
    setEntity,
    deleteEntity,
  };
}
