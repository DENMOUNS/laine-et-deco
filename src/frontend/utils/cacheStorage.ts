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

export function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const cached = JSON.parse(raw) as CachedValue<T>;
    if (!cached || cached.expiresAt < Date.now()) {
      localStorage.removeItem(key);
      return null;
    }

    return cached.value;
  } catch {
    localStorage.removeItem(key);
    return null;
  }
}

export function readCacheCreatedAt(key: string): number | null {
  try {
    const raw = localStorage.getItem(key);
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
      return WEEK_MS;
    case 'category':
    case 'faq':
    case 'site_config':
    case 'site_logo':
    case 'site_color':
    case 'nav_item':
    case 'hero_banner':
    case 'announcement_banner':
    case 'scrolling_banner':
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

export function writeCache<T>(key: string, value: T, ttlMs = MONTH_MS) {
  try {
    localStorage.setItem(
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

export function removeCache(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage failures.
  }
}

export const CACHE_TTL_MONTH = MONTH_MS;
