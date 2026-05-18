import { addDoc, collection, deleteDoc, doc, DocumentData, limit, onSnapshot, query, QueryConstraint, QuerySnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '../../backend/firebase';
import { readCache, writeCache } from '../utils/cacheStorage';
import type { BaseEntity } from '../../domain/entities/BaseEntity';

const PUBLIC_COLLECTIONS = [
  'product',
  'category',
  'pack',
  'blog_post',
  'promo_event',
  'lookbook_post',
  'lookbook',
  'flash_sale',
  'review',
  'site_config',
  'currency',
  'badge',
  'city',
  'community_post',
  'member_portfolio',
  'coupon',
  'nav_item',
  'faq',
  'analytics'
];

const CACHEABLE_COLLECTIONS = new Set(['product', 'promo_event']);
const DEFAULT_LIMIT = 200;

export interface EntityServiceOptions {
  constraints?: QueryConstraint[];
  defaultLimit?: number;
}

export type EntityPayload<T extends BaseEntity> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

const getEntityCacheKey = (entityType: string) => `entity:${entityType}:v1`;

const hasLimitConstraint = (constraints: QueryConstraint[]) => {
  return constraints.some((constraint) => (constraint as { type?: string }).type === 'limit');
};

const buildEntityQuery = (entityType: string, constraints: QueryConstraint[], defaultLimit = DEFAULT_LIMIT) => {
  const finalConstraints = [...constraints];
  if (!hasLimitConstraint(finalConstraints)) {
    finalConstraints.push(limit(defaultLimit));
  }

  return query(collection(db, entityType), ...finalConstraints);
};

const parseSnapshot = <T extends BaseEntity>(snapshot: QuerySnapshot<DocumentData>) => {
  const items: T[] = [];
  snapshot.forEach((docSnapshot) => {
    items.push({ id: docSnapshot.id, ...(docSnapshot.data() as DocumentData) } as T);
  });
  return items;
};

export const subscribeToEntityCollection = <T extends BaseEntity>(
  entityType: string,
  options: EntityServiceOptions,
  onData: (items: T[]) => void,
  onError: (error: Error) => void
) => {
  if (!db) {
    onError(new Error('Firestore is not initialized')); 
    return () => {};
  }

  let unsubscribe: (() => void) | null = null;
  let authUnsubscribe: (() => void) | null = null;

  const startSnapshotListener = () => {
    const snapshotQuery = buildEntityQuery(entityType, options.constraints ?? [], options.defaultLimit);

    unsubscribe = onSnapshot(
      snapshotQuery,
      (snapshot) => {
        const items = parseSnapshot<T>(snapshot);
        if (CACHEABLE_COLLECTIONS.has(entityType)) {
          writeCache(getEntityCacheKey(entityType), items);
        }
        onData(items);
      },
      (err) => {
        const cachedData = CACHEABLE_COLLECTIONS.has(entityType)
          ? readCache<T[]>(getEntityCacheKey(entityType))
          : null;

        if (cachedData) {
          onData(cachedData);
        }

        onError(err instanceof Error ? err : new Error(String(err)));
        handleFirestoreError(err, OperationType.LIST, entityType);
      }
    );
  };

  if (!PUBLIC_COLLECTIONS.includes(entityType) && !auth?.currentUser) {
    authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        authUnsubscribe?.();
        startSnapshotListener();
      } else {
        onError(new Error('Authentication is required to access protected data.'));
      }
    });
  } else {
    startSnapshotListener();
  }

  return () => {
    authUnsubscribe?.();
    unsubscribe?.();
  };
};

const requireAuth = () => {
  if (!auth?.currentUser) {
    window.dispatchEvent(new CustomEvent('auth-required'));
    throw new Error('Authentication is required.');
  }
};

export const createFirestoreEntity = async <T extends BaseEntity>(
  entityType: string,
  newItem: EntityPayload<T>
): Promise<string> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  requireAuth();

  try {
    const docRef = await addDoc(collection(db, entityType), {
      ...newItem,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, entityType);
    throw err;
  }
};

export const updateFirestoreEntity = async <T extends BaseEntity>(
  entityType: string,
  id: string,
  updates: Partial<T>
): Promise<void> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  requireAuth();

  try {
    await updateDoc(doc(db, entityType, String(id)), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${entityType}/${id}`);
    throw err;
  }
};

export const setFirestoreEntity = async <T extends BaseEntity>(
  entityType: string,
  id: string,
  data: Partial<T>
): Promise<void> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  requireAuth();

  try {
    await setDoc(doc(db, entityType, String(id)), {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${entityType}/${id}`);
    throw err;
  }
};

export const deleteFirestoreEntity = async (entityType: string, id: string): Promise<void> => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }

  requireAuth();

  try {
    await deleteDoc(doc(db, entityType, String(id)));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${entityType}/${id}`);
    throw err;
  }
};
