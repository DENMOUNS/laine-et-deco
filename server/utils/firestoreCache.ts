import * as fs from 'node:fs/promises';
import * as path from 'node:path';

interface CacheEntry {
  value: unknown;
  updatedAt: number;
}

const cache: Record<string, CacheEntry> = {};
const cacheFileEnabled = true;
const cacheFilePath = path.resolve(process.cwd(), 'server', '.firestore-cache.json');
let cacheFileLoaded = false;

const loadCacheFile = async () => {
  if (!cacheFileEnabled || cacheFileLoaded) {
    return;
  }

  try {
    const fileContents = await fs.readFile(cacheFilePath, 'utf8');
    const parsed = JSON.parse(fileContents) as Record<string, CacheEntry>;
    Object.assign(cache, parsed);
  } catch {
    // ignore missing or invalid cache file
  }
  cacheFileLoaded = true;
};

const saveCacheFile = async () => {
  if (!cacheFileEnabled) {
    return;
  }

  try {
    await fs.writeFile(cacheFilePath, JSON.stringify(cache, null, 2), 'utf8');
  } catch {
    // ignore write errors for fallback cache
  }
};

export const getFreshCachedResponse = async (key: string, maxAgeMs: number) => {
  await loadCacheFile();
  const entry = cache[key];
  if (!entry) {
    return null;
  }

  if (Date.now() - entry.updatedAt > maxAgeMs) {
    return null;
  }

  return entry.value;
};

export const getFallbackCachedResponse = async (key: string) => {
  await loadCacheFile();
  const entry = cache[key];
  return entry?.value ?? null;
};

export const setCachedResponse = async (key: string, value: unknown) => {
  cache[key] = {
    value,
    updatedAt: Date.now(),
  };
  await saveCacheFile();
};

export const clearEntityCache = async (entity: string, id?: string) => {
  await loadCacheFile();
  const keysToClear = [
    `public-firestore:${entity}:list`,
  ];
  if (id) {
    keysToClear.push(`public-firestore:${entity}:${id}`);
  }
  
  // Clear any variations of keys that match this entity
  const normalized = entity.toLowerCase();
  for (const k of Object.keys(cache)) {
    const lowerKey = k.toLowerCase();
    if (
      lowerKey.startsWith(`public-firestore:${normalized}:`) ||
      (id && lowerKey.includes(`:${id.toLowerCase()}`))
    ) {
      delete cache[k];
    }
  }
  await saveCacheFile();
};
