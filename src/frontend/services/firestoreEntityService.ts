import {
  collection,
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
import {
  writeCache,
  getEntityCacheKeys,
  removeCache,
  readEntityCache,
  writeEntityCache,
  getTTLForEntity,
} from '../utils/cacheStorage';
import { dispatchNetworkIssue } from '../utils/networkStatus';
import { incrementFirestoreMetric } from '../utils/firestoreInstrumentation';
import type { BaseEntity } from '../../domain/entities/BaseEntity';

/** Invalide toutes les clés de cache IDB pour une entité et notifie les listeners React. */
async function invalidateEntityCache(entityType: string): Promise<void> {
  await Promise.all(getEntityCacheKeys(entityType).map((key) => removeCache(key)));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('staticEntity:invalidate', { detail: { entityType } }));
  }
}

const PUBLIC_COLLECTIONS = new Set([
  'pattern_model',
  'configurator_model',
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
]);

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

const isAbortError = (error: unknown): boolean => {
  return error instanceof DOMException
    ? error.name === 'AbortError'
    : error instanceof Error && error.name === 'AbortError';
};

export const fetchEntityDataFromApi = async <T extends BaseEntity>(entityType: string): Promise<T[] | null> => {
  let timeoutId: number | undefined;
  try {
    const controller = new AbortController();
    timeoutId = window.setTimeout(() => controller.abort(), 5_000);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = PUBLIC_COLLECTIONS.has(entityType) ? null : await getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`/api/entity/${encodeURIComponent(entityType)}`, {
      method: 'GET',
      headers,
      credentials: 'same-origin',
      signal: controller.signal,
    });

    const body = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(`Entity API ${entityType} responded with HTTP ${response.status}`);
    }
    if (!Array.isArray(body)) {
      throw new Error(`Entity API ${entityType} returned an invalid payload`);
    }

    return body as T[];
  } catch (error) {
    if (isAbortError(error)) {
      return null;
    }

    dispatchNetworkIssue(typeof navigator !== 'undefined' ? !navigator.onLine : false);
    throw error instanceof Error ? error : new Error(`Unable to load entity ${entityType}`);
  } finally {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
  }
};

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

const operators: Record<string, (a: any, b: any) => boolean> = {
  '==': (a, b) => a === b,
  '!=': (a, b) => a !== b,
  '<': (a, b) => a < b,
  '<=': (a, b) => a <= b,
  '>': (a, b) => a > b,
  '>=': (a, b) => a >= b,
  'array-contains': (a, b) => Array.isArray(a) && a.includes(b),
  'in': (a, b) => Array.isArray(b) && b.includes(a),
  'not-in': (a, b) => Array.isArray(b) && !b.includes(a),
  'array-contains-any': (a, b) =>
    Array.isArray(a) &&
    Array.isArray(b) &&
    b.some(v => a.includes(v)),
};



const filterInMemory = <T>(
  items: T[],
  constraints: QueryConstraint[]
): T[] => {
  let filtered = [...items];

  for (const c of constraints) {
    const raw = c as any;

    if (raw.type !== 'where') continue;

    const fieldPath =
      raw._field?.segments?.join('.') ||
      raw._field?._path?.segments?.join('.');

    if (!fieldPath) continue;

    const compare =
      operators[raw._op] || (() => true);

    filtered = filtered.filter(item =>
      compare(getNestedValue(item, fieldPath), raw._value)
    );
  }

  return filtered;
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
    incrementFirestoreMetric('getDocs', entityType);

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

const filterAndSortInMemory = <T extends BaseEntity>(
  items: T[],
  constraints: QueryConstraint[],
  pageSize: number,
  lastDocumentId: string | null
) => {
  const filtered = filterInMemory(items, constraints);
  const startIndex = lastDocumentId
    ? Math.max(filtered.findIndex((item) => item.id === lastDocumentId) + 1, 0)
    : 0;
  const pageItems = filtered.slice(startIndex, startIndex + pageSize);
  return {
    items: pageItems,
    lastDoc: pageItems.length > 0 ? (pageItems[pageItems.length - 1] as unknown as DocumentData) : null,
    hasMore: filtered.length > startIndex + pageItems.length,
  };
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

  type SubEntry = {
    callbacks: Set<{ onData: (items: T[]) => void; onError: (error: Error) => void }>;
    unsubscribe?: () => void;
    lastData?: T[] | null;
  };

  const makeSubKey = () => {
    const constraints = options.constraints ?? [];
    const constraintKey = constraints
      .map((c: any) => {
        try {
          return String(c.type || c._op || JSON.stringify(c));
        } catch {
          return String(Object.keys(c || {}).join(','));
        }
      })
      .join('|');
    return `${entityType}::${constraintKey}::${options.defaultLimit ?? 0}`;
  };

  if (!(window as any).__entitySubscriptions) {
    (window as any).__entitySubscriptions = new Map<string, SubEntry>();
  }

  const subsMap: Map<string, SubEntry> = (window as any).__entitySubscriptions;
  const key = makeSubKey();
  const listener = { onData, onError };

  const existing = subsMap.get(key);
  if (existing) {
    existing.callbacks.add(listener);
    if (existing.lastData) {
      try {
        listener.onData(existing.lastData);
      } catch {
        // ignore
      }
    }
    return () => {
      const entry = subsMap.get(key);
      if (!entry) return;
      entry.callbacks.delete(listener);
      if (entry.callbacks.size === 0) {
        entry.unsubscribe?.();
        subsMap.delete(key);
      }
    };
  }

  const entry: SubEntry = {
    callbacks: new Set([{ onData, onError }]),
    lastData: null,
  };
  subsMap.set(key, entry);

  const emitData = (items: T[]) => {
    entry.lastData = items;
    entry.callbacks.forEach((cb) => {
      try {
        cb.onData(items);
      } catch {
        // ignore individual listener errors
      }
    });
  };

  const emitError = (err: Error) => {
    entry.callbacks.forEach((cb) => {
      try {
        cb.onError(err);
      } catch {
        // ignore
      }
    });
  };

  const startSnapshotListener = async () => {
    const cachedData = await readEntityCache<T[]>(entityType);
    if (cachedData && Array.isArray(cachedData)) {
      emitData(cachedData);
    }

    const apiData = await fetchEntityDataFromApi<T>(entityType);
    if (apiData) {
      incrementFirestoreMetric('apiFetch', entityType);
      if (CACHEABLE_COLLECTIONS.has(entityType)) {
        await writeEntityCache(entityType, apiData, getTTLForEntity(entityType));
        await writeCache(getEntityCacheKey(entityType), apiData, getTTLForEntity(entityType));
      }
      emitData(apiData);
    }

    entry.unsubscribe = () => {
      // Pas de souscription en cours, rien à désinscrire.
    };
  };

  let authUnsubscribe: (() => void) | null = null;

  const start = () => {
    void startSnapshotListener();
  };

  if (!PUBLIC_COLLECTIONS.has(entityType) && !auth?.currentUser) {
    if (!auth) {
      emitError(new Error('Firebase Auth is not initialized'));
      return () => {};
    }
    authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        authUnsubscribe?.();
        start();
      } else {
        emitError(new Error('Authentication is required to access protected data.'));
      }
    });
  } else {
    start();
  }

  return () => {
    authUnsubscribe?.();
    const stored = subsMap.get(key);
    if (!stored) return;
    stored.callbacks.delete(listener);
    if (stored.callbacks.size === 0) {
      stored.unsubscribe?.();
      subsMap.delete(key);
    }
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
    // Invalider le cache immédiatement pour que la liste se rafraîchisse
    await invalidateEntityCache(entityType);
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
    // Invalider le cache immédiatement pour que la liste se rafraîchisse
    await invalidateEntityCache(entityType);
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
    // Invalider le cache immédiatement pour que la liste se rafraîchisse
    await invalidateEntityCache(entityType);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${entityType}/${id}`);
    throw err;
  }
};

export const deleteFirestoreEntity = async (entityType: string, id: string): Promise<void> => {
  requireAuth();

  try {
    await entityApiRequest(entityType, 'DELETE', id);
    // Invalider le cache immédiatement pour que la liste se rafraîchisse
    await invalidateEntityCache(entityType);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${entityType}/${id}`);
    throw err;
  }
};
