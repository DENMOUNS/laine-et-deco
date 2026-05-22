import { useState, useEffect, useRef } from 'react';
import type { QueryConstraint } from 'firebase/firestore';
import type { EntityPayload } from '../services/firestoreEntityService';
import type { BaseEntity } from '../../domain/entities/BaseEntity';

interface UseEntityOptions {
  enabled?: boolean;
  constraints?: QueryConstraint[];
  deps?: unknown[];
}

import { readCache, writeCache } from '../utils/cacheStorage';

const CACHEABLE_ENTITIES = ['product', 'pack', 'blog_post', 'lookbook', 'category'];

export function useEntity<T extends BaseEntity = BaseEntity>(
  entityType: string,
  initialData: T[] = [],
  options: UseEntityOptions = {}
) {
  const cacheKey = `entityCache:${entityType}`;
  
  const [data, setData] = useState<T[]>(() => {
    if (CACHEABLE_ENTITIES.includes(entityType)) {
      const cached = readCache<T[]>(cacheKey);
      if (cached) return cached;
    }
    return initialData;
  });
  const [isLoading, setIsLoading] = useState(!CACHEABLE_ENTITIES.includes(entityType) || !readCache(cacheKey));
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

    void import('../services/firestoreEntityService').then(({ subscribeToEntityCollection }) => {
      if (cancelled) return;

      unsubscribe = subscribeToEntityCollection<T>(
        entityType,
        { constraints },
        (items) => {
          if (!isMounted.current) return;
          setData(items);
          if (CACHEABLE_ENTITIES.includes(entityType)) {
            writeCache(cacheKey, items);
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
  }, [entityType, enabled, ...deps]);

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
