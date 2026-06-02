import {
  collection,
  doc,
  DocumentData,
  limit,
  onSnapshot,
  query,
  QueryConstraint,
  QuerySnapshot,
  getDocs,
  startAfter,
  count,
  getCountFromServer,
  getAggregateFromServer,
  sum,
  type Firestore,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { initFirebase, handleFirestoreError, OperationType } from '../../backend/firebase';
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
  'qr_config ',
  'invoice_config',
  'community_post',
  'member_portfolio',
  'coupon',
  'nav_item',
  'faq',
  'site_logo',
  'site_color',
  'hero_banner',
  'announcement_banner',
  'scrolling_banner',
  'seo_page',
  'loyalty_config_history',
  'maintenance_config_history',
  'newsletter_config_history',
  'custom_section_config'
];

const CACHEABLE_COLLECTIONS = new Set([
  'product',
  'promo_event',
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
  'category',
  'pack',
  'blog_post',
  'lookbook',
  'currency',
  'city',
  'coupon'
]);
const DEFAULT_LIMIT = 0;

export interface EntityServiceOptions {
  constraints?: QueryConstraint[];
  defaultLimit?: number;
}

export type EntityPayload<T extends BaseEntity> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

const getEntityCacheKey = (entityType: string) => `entity:${entityType}:v1`;

const hasLimitConstraint = (constraints: QueryConstraint[]) => {
  return constraints.some((constraint) => (constraint as { type?: string }).type === 'limit');
};

const buildEntityQuery = (
  firestore: Firestore,
  entityType: string,
  constraints: QueryConstraint[],
  defaultLimit = DEFAULT_LIMIT
) => {
  const finalConstraints = [...constraints];
  if (!hasLimitConstraint(finalConstraints) && defaultLimit > 0) {
    finalConstraints.push(limit(defaultLimit));
  }

  return query(collection(firestore, entityType), ...finalConstraints);
};

const parseSnapshot = <T extends BaseEntity>(snapshot: QuerySnapshot<DocumentData>) => {
  const items: T[] = [];
  snapshot.forEach((docSnapshot) => {
    items.push({ id: docSnapshot.id, ...(docSnapshot.data() as DocumentData) } as T);
  });
  return items;
};

export const getPaginatedEntities = async <T extends BaseEntity>(
  entityType: string,
  constraints: QueryConstraint[],
  pageSize: number,
  lastDocument: DocumentData | null = null
) => {
  const { db } = initFirebase();
  if (!db) throw new Error('Firestore is not initialized');

  const finalConstraints = [...constraints, limit(pageSize)];
  if (lastDocument) {
    finalConstraints.push(startAfter(lastDocument));
  }

  const q = query(collection(db, entityType), ...finalConstraints);
  const snapshot = await getDocs(q);
  
  const items = parseSnapshot<T>(snapshot);
  const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
  
  return { items, lastDoc, hasMore: snapshot.docs.length === pageSize };
};

export const getEntityAggregate = async (
  entityType: string,
  fieldToSum?: string,
  constraints: QueryConstraint[] = []
) => {
  const { db } = initFirebase();
  if (!db) throw new Error('Firestore is not initialized');

  const q = query(collection(db, entityType), ...constraints);
  
  if (fieldToSum) {
    const snapshot = await getAggregateFromServer(q, {
      count: count(),
      total: sum(fieldToSum)
    });
    return {
      count: snapshot.data().count,
      total: snapshot.data().total
    };
  } else {
    const snapshot = await getCountFromServer(q);
    return {
      count: snapshot.data().count,
      total: 0
    };
  }
};

export const subscribeToEntityCollection = <T extends BaseEntity>(
  entityType: string,
  options: EntityServiceOptions,
  onData: (items: T[]) => void,
  onError: (error: Error) => void
) => {
  const { db, auth } = initFirebase();
  if (!db) {
    onError(new Error('Firestore is not initialized')); 
    return () => {};
  }

  let unsubscribe: (() => void) | null = null;
  let authUnsubscribe: (() => void) | null = null;

  const startSnapshotListener = () => {
    const snapshotQuery = buildEntityQuery(db, entityType, options.constraints ?? [], options.defaultLimit);

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
          return;
        }

        // Try fallback: request via server API using idToken (server uses admin SDK)
        (async () => {
          try {
            const token = await getAuthToken();
            const resp = await fetch(`/api/entity/${encodeURIComponent(entityType)}`, {
              method: 'GET',
              headers: { Authorization: `Bearer ${token}` },
              credentials: 'same-origin',
            });
            const body = await resp.json().catch(() => null);
            if (resp.ok && Array.isArray(body)) {
              if (CACHEABLE_COLLECTIONS.has(entityType)) {
                writeCache(getEntityCacheKey(entityType), body as T[]);
              }
              onData(body as T[]);
              return;
            }

            const fallbackCache = readCache<T[]>(getEntityCacheKey(entityType));
            if (fallbackCache) {
              onData(fallbackCache);
              return;
            }
          } catch (e) {
            const fallbackCache = readCache<T[]>(getEntityCacheKey(entityType));
            if (fallbackCache) {
              onData(fallbackCache);
              return;
            }
          }

          onError(err instanceof Error ? err : new Error(String(err)));
          handleFirestoreError(err, OperationType.LIST, entityType);
        })();
      }
    );
  };

  if (!PUBLIC_COLLECTIONS.includes(entityType) && !auth?.currentUser) {
    if (!auth) {
      onError(new Error('Firebase Auth is not initialized'));
      return () => {};
    }
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
  const { auth: firebaseAuth } = initFirebase();
  if (!firebaseAuth?.currentUser) {
    window.dispatchEvent(new CustomEvent('auth-required'));
    throw new Error('Authentication is required.');
  }
};

const getAuthToken = async () => {
  const { auth: firebaseAuth } = initFirebase();
  if (!firebaseAuth?.currentUser) {
    window.dispatchEvent(new CustomEvent('auth-required'));
    throw new Error('Authentication is required.');
  }

  return firebaseAuth.currentUser.getIdToken();
};

const entityApiRequest = async (entityType: string, method: string, id?: string, payload?: any) => {
  const token = await getAuthToken();
  const url = id
    ? `/api/entity/${encodeURIComponent(entityType)}/${encodeURIComponent(id)}`
    : `/api/entity/${encodeURIComponent(entityType)}`;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'same-origin',
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.error || response.statusText || 'Erreur API';
    const error = new Error(message);
    handleFirestoreError(error, OperationType.WRITE, `${entityType}${id ? `/${id}` : ''}`);
    throw error;
  }

  return body;
};

export const createFirestoreEntity = async <T extends BaseEntity>(
  entityType: string,
  newItem: EntityPayload<T>
): Promise<string> => {
  requireAuth();

  try {
    const result = await entityApiRequest(entityType, 'POST', undefined, newItem);
    return result.id;
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
  requireAuth();

  try {
    await entityApiRequest(entityType, 'PUT', id, updates);
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
  requireAuth();

  try {
    await entityApiRequest(entityType, 'PUT', id, data);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${entityType}/${id}`);
    throw err;
  }
};

export const deleteFirestoreEntity = async (entityType: string, id: string): Promise<void> => {
  requireAuth();

  try {
    await entityApiRequest(entityType, 'DELETE', id);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${entityType}/${id}`);
    throw err;
  }
};
