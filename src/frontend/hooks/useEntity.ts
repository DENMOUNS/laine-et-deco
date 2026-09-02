import { useState, useEffect, useRef } from 'react';
import type { QueryConstraint } from 'firebase/firestore';
import {
  createFirestoreEntity,
  deleteFirestoreEntity,
  setFirestoreEntity,
  subscribeToEntityCollection,
  updateFirestoreEntity,
  fetchEntityDataFromApi,
  type EntityPayload,
} from '../services/firestoreEntityService';
import type { BaseEntity } from '../../domain/entities/BaseEntity';

interface UseEntityOptions {
  enabled?: boolean;
  constraints?: QueryConstraint[];
  deps?: unknown[];
  cacheOnly?: boolean;
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
  'tax_rule',
  'member_portfolio'
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
  const { enabled = true, constraints = [], deps = [], cacheOnly = false } = options;

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
      
      if (CACHEABLE_ENTITIES.includes(resolvedEntityType)) {
        cached = await readEntityCache<T[]>(resolvedEntityType);
        if (cached && cached.length > 0 && !cancelled) {
          setData(cached);
          setIsLoading(false);
          cacheTime = await import('../utils/cacheStorage').then(m => m.readCacheCreatedAt(cacheKey));
        } else {
          cached = null;
        }
      }

      if (cancelled) return;

      if (cacheOnly) {
        setIsLoading(false);
        return;
      }

      const dynamicEntities = ['order', 'user', 'notification', 'chat_message', 'conversation', 'abandoned_cart'];
      const isDynamic = dynamicEntities.includes(resolvedEntityType);

      if (!isAdmin && cached && !isDynamic) {
        // SWR (Stale-While-Revalidate) via server proxy API
        if (!cacheTime) return;
        
        try {
          const apiData = await fetchEntityDataFromApi<T>(resolvedEntityType);
          if (apiData && apiData.length > 0 && !cancelled) {
            setData(apiData);
            await writeEntityCache(resolvedEntityType, apiData, getTTLForEntity(resolvedEntityType));
          }
        } catch (e) {
          // ignore SWR errors silently
        }
        return;
      }

      // Fetch from Firebase if no cache or if it's admin/dynamic
      if (cancelled) return;

      unsubscribe = subscribeToEntityCollection<T>(
        resolvedEntityType,
        { constraints },
        (items) => {
          if (cancelled) return;
          setData(items);
          if (CACHEABLE_ENTITIES.includes(resolvedEntityType)) {
            void writeEntityCache(resolvedEntityType, items, getTTLForEntity(resolvedEntityType));
          }
          setIsLoading(false);
          setError(null);
        },
        (err) => {
          if (cancelled) return;
          if (cached && cached.length > 0) {
            console.warn(`[useEntity] Firebase subscription failed for ${resolvedEntityType}, falling back to cache:`, err);
            setIsLoading(false);
            return;
          }
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
  }, [entityType, enabled, isAdmin, cacheOnly, ...deps]);

  const addEntity = async (newItem: EntityPayload<T>) => {
    const resId = await createFirestoreEntity<T>(resolvedEntityType, newItem);
    const addedItem = { id: resId, ...newItem } as unknown as T;
    setData((prev) => [...(prev || []).filter((i: any) => i.id !== resId), addedItem]);
    return resId;
  };

  const updateEntity = async (id: string, updates: Partial<T>) => {
    await updateFirestoreEntity<T>(resolvedEntityType, id, updates);
    setData((prev) => (prev || []).map((i: any) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const setEntity = async (id: string, entityData: Partial<T>) => {
    await setFirestoreEntity(resolvedEntityType, id, entityData);
    setData((prev) => (prev || []).map((i: any) => (i.id === id ? { ...i, ...entityData } : i)));
  };

  const deleteEntity = async (id: string) => {
    await deleteFirestoreEntity(resolvedEntityType, id);
    setData((prev) => (prev || []).filter((i: any) => i.id !== id));
  };

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
