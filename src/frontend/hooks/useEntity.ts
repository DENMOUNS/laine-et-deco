import { useState, useEffect, useRef } from 'react';
import type { QueryConstraint } from 'firebase/firestore';
import {
  createFirestoreEntity,
  deleteFirestoreEntity,
  EntityPayload,
  EntityServiceOptions,
  setFirestoreEntity,
  subscribeToEntityCollection,
  updateFirestoreEntity
} from '../services/firestoreEntityService';
import type { BaseEntity } from '../../domain/entities/BaseEntity';

interface UseEntityOptions {
  enabled?: boolean;
  constraints?: QueryConstraint[];
  deps?: unknown[];
}

export function useEntity<T extends BaseEntity = BaseEntity>(
  entityType: string,
  initialData: T[] = [],
  options: UseEntityOptions = {}
) {
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

    const unsubscribe = subscribeToEntityCollection<T>(
      entityType,
      { constraints },
      (items) => {
        if (!isMounted.current) {
          return;
        }

        setData(items);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        if (!isMounted.current) {
          return;
        }

        setError(err);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [entityType, enabled, ...deps]);

  const addEntity = async (newItem: EntityPayload<T>) => {
    return createFirestoreEntity<T>(entityType, newItem);
  };

  const updateEntity = async (id: string, updates: Partial<T>) => {
    return updateFirestoreEntity<T>(entityType, id, updates);
  };

  const setEntity = async (id: string, data: Partial<T>) => {
    return setFirestoreEntity<T>(entityType, id, data);
  };

  const deleteEntity = async (id: string) => {
    return deleteFirestoreEntity(entityType, id);
  };

  return {
    data,
    setData,
    isLoading,
    error,
    addEntity,
    updateEntity,
    setEntity,
    deleteEntity,
  };
}
