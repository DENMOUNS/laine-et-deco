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
  'qr_config',
  'invoice_config',
  'community_post',
  'member_portfolio',
  'coupon',
  'nav_item',
  'marquee_item',
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
  'marquee_item',
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

const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

const parseValueForSorting = (val: any): any => {
  if (!val) return val;
  if (typeof val.toDate === 'function') {
    return val.toDate().getTime();
  }
  if (typeof val === 'object' && val.seconds !== undefined) {
    return val.seconds * 1000;
  }
  if (typeof val === 'string') {
    const timestamp = Date.parse(val);
    if (!isNaN(timestamp)) {
      return timestamp;
    }
  }
  return val;
};

const filterInMemory = <T extends any>(
  items: T[],
  constraints: QueryConstraint[]
): T[] => {
  let filtered = [...items];

  for (const c of constraints) {
    const raw = c as any;
    if (raw.type === 'where') {
      const fieldPath = raw._field?.segments?.join('.') || raw._field?._path?.segments?.join('.');
      const op = raw._op;
      const val = raw._value;

      if (fieldPath) {
        filtered = filtered.filter(item => {
          const itemVal = getNestedValue(item, fieldPath);
          switch (op) {
            case '==':
              return itemVal === val;
            case '!=':
              return itemVal !== val;
            case '<':
              return itemVal < val;
            case '<=':
              return itemVal <= val;
            case '>':
              return itemVal > val;
            case '>=':
              return itemVal >= val;
            case 'array-contains':
              return Array.isArray(itemVal) && itemVal.includes(val);
            case 'in':
              return Array.isArray(val) && val.includes(itemVal);
            case 'not-in':
              return Array.isArray(val) && !val.includes(itemVal);
            case 'array-contains-any':
              return Array.isArray(itemVal) && Array.isArray(val) && val.some(v => itemVal.includes(v));
            default:
              return true;
          }
        });
      }
    }
  }

  return filtered;
};

const filterAndSortInMemory = <T extends any>(
  items: T[],
  constraints: QueryConstraint[],
  pageSize: number,
  lastDocumentId: string | null
) => {
  let filtered = filterInMemory(items, constraints);

  const orderBys = constraints.filter((c: any) => c.type === 'orderBy');
  if (orderBys.length > 0) {
    filtered.sort((a, b) => {
      for (const c of orderBys) {
        const raw = c as any;
        const fieldPath = raw._field?.segments?.join('.') || raw._field?._path?.segments?.join('.');
        const direction = raw._direction || 'asc';
        if (!fieldPath) continue;

        let valA = parseValueForSorting(getNestedValue(a, fieldPath));
        let valB = parseValueForSorting(getNestedValue(b, fieldPath));

        if (valA === valB) continue;
        if (valA === undefined || valA === null) return direction === 'asc' ? -1 : 1;
        if (valB === undefined || valB === null) return direction === 'asc' ? 1 : -1;

        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  if (lastDocumentId) {
    const lastDocIndex = filtered.findIndex((item: any) => item.id === lastDocumentId);
    if (lastDocIndex !== -1) {
      filtered = filtered.slice(lastDocIndex + 1);
    }
  }

  const paginatedItems = filtered.slice(0, pageSize);
  const lastItem = paginatedItems[paginatedItems.length - 1];
  const lastDocMock = lastItem ? { id: (lastItem as any).id, data: () => lastItem, exists: () => true } : null;

  return {
    items: paginatedItems,
    lastDoc: lastDocMock as any,
    hasMore: filtered.length > pageSize
  };
};

export const getPaginatedEntities = async <T extends BaseEntity>(
  entityType: string,
  constraints: QueryConstraint[],
  pageSize: number,
  lastDocument: DocumentData | null = null
) => {
  const { db } = initFirebase();
  if (!db) throw new Error('Firestore is not initialized');

  try {
    const finalConstraints = [...constraints, limit(pageSize)];
    if (lastDocument) {
      finalConstraints.push(startAfter(lastDocument));
    }

    const q = query(collection(db, entityType), ...finalConstraints);
    const snapshot = await getDocs(q);
    
    const items = parseSnapshot<T>(snapshot);
    const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
    
    return { items, lastDoc, hasMore: snapshot.docs.length === pageSize };
  } catch (err) {
    console.warn(`Direct query for ${entityType} failed. Trying fallback via API.`, err);
    try {
      const allItems = await entityApiRequest(entityType, 'GET') as T[];
      return filterAndSortInMemory<T>(allItems, constraints, pageSize, lastDocument?.id || null);
    } catch (fallbackErr) {
      console.error(`API fallback for ${entityType} failed:`, fallbackErr);
      throw err;
    }
  }
};

export const getEntityAggregate = async (
  entityType: string,
  fieldToSum?: string,
  constraints: QueryConstraint[] = []
) => {
  const { db } = initFirebase();
  if (!db) throw new Error('Firestore is not initialized');

  try {
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
  } catch (err) {
    console.warn(`Direct aggregation for ${entityType} failed. Trying fallback via API.`, err);
    try {
      const allItems = await entityApiRequest(entityType, 'GET') as any[];
      const filtered = filterInMemory(allItems, constraints);
      if (fieldToSum) {
        const total = filtered.reduce((sumVal, item) => sumVal + (Number(item[fieldToSum]) || 0), 0);
        return {
          count: filtered.length,
          total
        };
      } else {
        return {
          count: filtered.length,
          total: 0
        };
      }
    } catch (fallbackErr) {
      console.error(`API fallback aggregation for ${entityType} failed:`, fallbackErr);
      throw err;
    }
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
        // All readCache calls are async — wrap everything in an async IIFE
        // to properly await them. Calling readCache without await returns a
        // Promise (always truthy), which would cause onData(Promise) and
        // downstream errors like "ORDERS.reduce is not a function".
        (async () => {
          // 1. Try the in-memory/IDB cache first
          const cachedData = CACHEABLE_COLLECTIONS.has(entityType)
            ? await readCache<T[]>(getEntityCacheKey(entityType))
            : null;

          if (cachedData) {
            onData(cachedData);
            return;
          }

          // 2. Try fallback: request via server API using idToken (server uses admin SDK)
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

            // 3. Try cache one more time after API failure
            const fallbackCache = await readCache<T[]>(getEntityCacheKey(entityType));
            if (fallbackCache) {
              onData(fallbackCache);
              return;
            }
          } catch (e) {
            const fallbackCache = await readCache<T[]>(getEntityCacheKey(entityType));
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
