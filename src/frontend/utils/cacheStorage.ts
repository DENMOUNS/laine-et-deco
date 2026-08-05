export const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * HOUR_MS;
export const WEEK_MS = 7 * DAY_MS;
export const MONTH_MS = 30 * DAY_MS;
export const THREE_MONTHS_MS = 3 * MONTH_MS;
export const SIX_MONTHS_MS = 6 * MONTH_MS;

type CachedValue<T> = {
  expiresAt: number;
  createdAt: number;
  value: T;
};

import { get, set, del } from 'idb-keyval';
import type { QueryConstraint } from 'firebase/firestore';

export async function readCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await get<string>(key);
    if (!raw) return null;

    const cached = JSON.parse(raw) as CachedValue<T>;
    if (!cached || cached.expiresAt < Date.now()) {
      await del(key);
      return null;
    }

    return cached.value;
  } catch {
    await del(key);
    return null;
  }
}

export const getSharedEntityCacheKey = (entityType: string) => `entityCache:${entityType}`;
export const describeCacheConstraint = (constraint: QueryConstraint) => {
  const raw = constraint as any;
  if (raw.type === 'limit') {
    return `limit:${raw._limit ?? raw.limit ?? 'unknown'}`;
  }
  if (raw.type === 'where') {
    const fieldPath = raw._field?.segments?.join('.') || raw._field?._path?.segments?.join('.') || 'field';
    return `where:${fieldPath}:${raw._op ?? 'op'}:${JSON.stringify(raw._value ?? null)}`;
  }
  if (raw.type === 'orderBy') {
    const fieldPath = raw._field?.segments?.join('.') || raw._field?._path?.segments?.join('.') || 'field';
    return `orderBy:${fieldPath}:${raw._direction ?? 'asc'}`;
  }
  return raw.type || 'constraint';
};
export const getStaticEntityCacheKey = (entityType: string, constraints: QueryConstraint[] = []) => {
  if (constraints.length === 0) return `staticEntity:${entityType}:v2`;
  return `staticEntity:${entityType}:v2:${constraints.map(describeCacheConstraint).join('|')}`;
};
export const getLegacyEntityCacheKey = (entityType: string) => `entity:${entityType}:v1`;

export const getEntityCacheKeys = (entityType: string) => [
  getSharedEntityCacheKey(entityType),
  getStaticEntityCacheKey(entityType),
  getLegacyEntityCacheKey(entityType),
];

export async function readEntityCache<T>(entityType: string): Promise<T | null> {
  for (const key of getEntityCacheKeys(entityType)) {
    const value = await readCache<T>(key);
    if (value) return value;
  }
  return null;
}

export async function writeEntityCache<T>(entityType: string, value: T, ttlMs = getTTLForEntity(entityType)): Promise<void> {
  await Promise.all(getEntityCacheKeys(entityType).map((key) => writeCache(key, value, ttlMs)));
}

export async function readCacheCreatedAt(key: string): Promise<number | null> {
  try {
    const raw = await get<string>(key);
    if (!raw) return null;

    const cached = JSON.parse(raw) as CachedValue<any>;
    if (!cached || cached.expiresAt < Date.now()) {
      return null;
    }

    return cached.createdAt || (cached.expiresAt - getTTLForEntity(key.split(':')[1] || ''));
  } catch {
    return null;
  }
}

export function getTTLForEntity(entityType: string): number {
  switch (entityType) {
    case 'order':
    case 'user':
    case 'notification':
    case 'sales_data':
    case 'revenue_by_payment':
    case 'retention_data':
    case 'category_distribution':
    case 'device_data':
    case 'traffic_source':
    case 'admin_role':
      return HOUR_MS; // Short TTL for dynamic/frequently changing data
    case 'product':
    case 'pack':
    case 'blog_post':
    case 'lookbook':
    case 'promo_event':
    case 'flash_sale':
    case 'category':
    case 'site_config':
    case 'site_logo':
    case 'site_color':
    case 'nav_item':
    case 'hero_banner':
    case 'announcement_banner':
    case 'scrolling_banner':
      return DAY_MS;
    case 'faq':
      return THREE_MONTHS_MS;
    case 'city':
    case 'shipping_rule':
    case 'tax_rule':
    case 'coupon':
      return SIX_MONTHS_MS;
    default:
      return MONTH_MS;
  }
}

export async function writeCache<T>(key: string, value: T, ttlMs = MONTH_MS): Promise<void> {
  try {
    await set(
      key,
      JSON.stringify({
        expiresAt: Date.now() + ttlMs,
        createdAt: Date.now(),
        value,
      } satisfies CachedValue<T>)
    );
  } catch {
    // Storage can be unavailable or full; the app should still work online.
  }
}

export async function removeCache(key: string): Promise<void> {
  try {
    await del(key);
  } catch {
    // Ignore storage failures.
  }
}

export const CACHE_TTL_MONTH = MONTH_MS;
