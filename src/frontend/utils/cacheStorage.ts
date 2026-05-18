const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

type CachedValue<T> = {
  expiresAt: number;
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

export function writeCache<T>(key: string, value: T, ttlMs = MONTH_MS) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        expiresAt: Date.now() + ttlMs,
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
