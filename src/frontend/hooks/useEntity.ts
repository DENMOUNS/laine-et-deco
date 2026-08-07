import { useState, useEffect, useRef } from 'react';
import type { QueryConstraint } from 'firebase/firestore';
import type { EntityPayload } from '../services/firestoreEntityService';
import type { BaseEntity } from '../../domain/entities/BaseEntity';

interface UseEntityOptions {
  enabled?: boolean;
  constraints?: QueryConstraint[];
  deps?: unknown[];
}

import { readCache, writeCache, getTTLForEntity, readEntityCache, writeEntityCache } from '../utils/cacheStorage';

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

const CACHEABLE_ENTITIES = [
  'product',
  'pack',
  'blog_post',
  'lookbook',
  'lookbook_post',
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

const resolveEntityType = (entityType: string) => ENTITY_TYPE_ALIASES[entityType] ?? entityType;

export function useEntity<T extends BaseEntity = BaseEntity>(
  entityType: string,
  initialData: T[] = [],
  options: UseEntityOptions = {}
) {
  const resolvedEntityType = resolveEntityType(entityType);
  const cacheKey = `entityCache:${resolvedEntityType}`;
  const isAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  
  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState(true);
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

    let cancelled = false;
    let unsubscribe = () => {};

    const initializeData = async () => {
      let cached: T[] | null = null;
      let cacheTime: number | null = null;
      
      if (CACHEABLE_ENTITIES.includes(entityType)) {
        cached = await readEntityCache<T[]>(entityType);
        if (cached && !cancelled) {
          setData(cached);
          setIsLoading(false);
          cacheTime = await import('../utils/cacheStorage').then(m => m.readCacheCreatedAt(cacheKey));
        }
      }

      if (cancelled) return;

      const dynamicEntities = ['order', 'user', 'notification', 'chat_message', 'conversation', 'abandoned_cart'];
      const isDynamic = dynamicEntities.includes(entityType);

      if (!isAdmin && cached && !isDynamic) {
        // SWR (Stale-While-Revalidate)
        if (!cacheTime) return;
        
        try {
          const [{ collection, getDocs, query, where }, { initFirebase }] = await Promise.all([
            import('firebase/firestore'),
            import('../../backend/firebase')
          ]);
          
          const { db: firestoreDb } = initFirebase();
          if (!firestoreDb) return;
          
          const q = query(
            collection(firestoreDb, resolvedEntityType),
            where('updatedAt', '>', new Date(cacheTime).toISOString())
          );
          
          const snapshot = await getDocs(q);
          if (snapshot.empty || cancelled) return;
          
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
        return;
      }

      // Fetch from Firebase if no cache or if it's admin/dynamic
      const { subscribeToEntityCollection } = await import('../services/firestoreEntityService');
      if (cancelled) return;

      unsubscribe = subscribeToEntityCollection<T>(
        resolvedEntityType,
        { constraints },
        (items) => {
          if (cancelled) return;
          setData(items);
          if (CACHEABLE_ENTITIES.includes(entityType)) {
            void writeEntityCache(entityType, items, getTTLForEntity(entityType));
          }
          setIsLoading(false);
          setError(null);
        },
        (err) => {
          if (cancelled) return;
          setError(err);
          setIsLoading(false);
        }
      );
    };

    initializeData();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [entityType, enabled, isAdmin, ...deps]);

  const withService = async <R>(
    fn: (svc: typeof import('../services/firestoreEntityService')) => Promise<R>
  ): Promise<R> => {
    const svc = await import('../services/firestoreEntityService');
    return fn(svc);
  };

  const addEntity = async (newItem: EntityPayload<T>) =>
    withService((svc) => svc.createFirestoreEntity<T>(resolvedEntityType, newItem));

  const updateEntity = async (id: string, updates: Partial<T>) =>
    withService((svc) => svc.updateFirestoreEntity<T>(resolvedEntityType, id, updates));

  const setEntity = async (id: string, entityData: Partial<T>) =>
    withService((svc) => svc.setFirestoreEntity(resolvedEntityType, id, entityData));

  const deleteEntity = async (id: string) =>
    withService((svc) => svc.deleteFirestoreEntity(resolvedEntityType, id));

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
