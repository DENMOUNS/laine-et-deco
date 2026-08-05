import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { RouteFallback } from './components/RouteFallback';
import { useAuthStore } from '../stores/authStore';
import { useConfigStore } from '../stores/configStore';
import { SiteConfig, PromoEvent, NavItem } from '../types';
import { DEFAULT_NAV_ITEMS } from '../siteDefaults';
import { readCache, writeCache, getTTLForEntity, writeEntityCache } from './utils/cacheStorage';

const AppRoutes = lazy(() =>
  import('./components/AppRoutes').then((m) => ({ default: m.AppRoutes }))
);

const HOME_CACHE_COLLECTIONS = [
  'product',
  'category',
  'pack',
  'blog_post',
  'flash_sale',
  'lookbook',
  'hero_banner',
];

function scheduleIdle(task: () => void, timeoutMs: number) {
  if ('requestIdleCallback' in window) {
    const id = requestIdleCallback(task, { timeout: timeoutMs });
    return () => cancelIdleCallback(id);
  }
  const t = setTimeout(task, timeoutMs);
  return () => clearTimeout(t);
}

/** Sync Firestore config uniquement après interaction ou long délai (évite Firebase au LCP). */
function useDeferredConfigSync() {
  const setSiteConfig = useConfigStore((s) => s.setSiteConfig);
  const resolveNavItems = useConfigStore((s) => s.resolveNavItems);
  const setEvents = useConfigStore((s) => s.setEvents);
  const [sync, setSync] = useState(false);

  useEffect(() => {
    const start = () => setSync(true);
    window.addEventListener('pointerdown', start, { once: true, passive: true });
    window.addEventListener('keydown', start, { once: true });
    const idleTimer = scheduleIdle(start, 2_000);
    return () => {
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
      idleTimer();
    };
  }, []);

  useEffect(() => {
    if (!sync) return;

    let cancelled = false;

    // Même format de clé que useEntity, pour partager le cache IndexedDB
    // entre ce bootstrap et les hooks d'entité (évite une double lecture Firestore).
    const cacheKeyFor = (entityType: string) => `entityCache:${entityType}`;

    void (async () => {
      // 1. Applique immédiatement les valeurs en cache si elles sont encore valides
      //    (TTL défini dans getTTLForEntity) — aucune lecture Firestore nécessaire.
      const [cachedSiteConfigs, cachedPromoEvents, cachedNavItems] = await Promise.all([
        readCache<SiteConfig[]>(cacheKeyFor('site_config')),
        readCache<PromoEvent[]>(cacheKeyFor('promo_event')),
        readCache<NavItem[]>(cacheKeyFor('nav_item')),
      ]);

      if (cancelled) return;

      const hasCachedNavItems = Array.isArray(cachedNavItems) && cachedNavItems.length > 0;

      console.info('[config-sync]', {
        message: 'cache:read',
        host: window.location.host,
        hasCachedSiteConfig: Boolean(cachedSiteConfigs?.[0]),
        cachedNavCount: cachedNavItems?.length || 0,
        cachedPromoCount: cachedPromoEvents?.length || 0,
      });

      if (cachedSiteConfigs?.[0]) setSiteConfig(cachedSiteConfigs[0]);
      if (hasCachedNavItems) resolveNavItems(cachedNavItems);
      if (cachedPromoEvents) setEvents(cachedPromoEvents);

      // Si les trois entrées sont en cache et valides, on ne fait aucun appel réseau.
      // Navigation is visible immediately and edited often enough that it should
      // revalidate in the background even when a local cache exists.

      const [{ initFirebase }, { getDocs, collection, query, limit }] = await Promise.all([
        import('../backend/firebase'),
        import('firebase/firestore'),
      ]);

      if (cancelled) return;

      const { db: firestore } = initFirebase();
      if (!firestore) return;

      const fetchCollection = async <T,>(name: string, max?: number): Promise<T[]> => {
        try {
          const ref = collection(firestore, name);
          const snap = await getDocs(max ? query(ref, limit(max)) : ref);
          return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];
        } catch {
          return [];
        }
      };

      const [siteConfigs, promoEvents, navItems] = await Promise.all([
        cachedSiteConfigs ? Promise.resolve(cachedSiteConfigs) : fetchCollection<SiteConfig>('site_config', 5),
        cachedPromoEvents ? Promise.resolve(cachedPromoEvents) : fetchCollection<PromoEvent>('promo_event', 20),
        fetchCollection<NavItem>('nav_item', 30),
      ]);

      if (cancelled) return;

      console.info('[config-sync]', {
        message: 'firestore:read',
        host: window.location.host,
        siteConfigCount: siteConfigs.length,
        navCount: navItems.length,
        navIds: navItems.slice(0, 10).map((item) => item.id),
        navStatuses: navItems.slice(0, 10).map((item) => item.status),
        promoCount: promoEvents.length,
      });

      if (siteConfigs[0]) setSiteConfig(siteConfigs[0]);
      if (navItems.length > 0) resolveNavItems(navItems);
      else resolveNavItems(DEFAULT_NAV_ITEMS);
      setEvents(promoEvents);

      if (!cachedSiteConfigs) writeCache(cacheKeyFor('site_config'), siteConfigs, getTTLForEntity('site_config'));
      if (!cachedPromoEvents) writeCache(cacheKeyFor('promo_event'), promoEvents, getTTLForEntity('promo_event'));
      writeCache(cacheKeyFor('nav_item'), navItems, getTTLForEntity('nav_item'));

      void Promise.all(
        HOME_CACHE_COLLECTIONS.map(async (collectionName) => {
          const cached = await readCache<unknown[]>(cacheKeyFor(collectionName));
          if (cached) return;
          const items = await fetchCollection(collectionName);
          if (!cancelled) await writeEntityCache(collectionName, items);
        })
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [sync, setSiteConfig, resolveNavItems, setEvents]);
}

export function App() {
  useDeferredConfigSync();

  const initAuthListener = useAuthStore((s) => s.initAuthListener);

  useEffect(() => {
    const startAuth = () => initAuthListener();
    window.addEventListener('pointerdown', startAuth, { once: true, passive: true });
    const cancelIdle = scheduleIdle(startAuth, 20_000);
    return () => {
      window.removeEventListener('pointerdown', startAuth);
      cancelIdle();
    };
  }, [initAuthListener]);

  // NOTE: le seed automatique global (seedFirebase) a été retiré du boot client.
  // Il exécutait un getDocs() sur ~35 collections entières (product, order, user, ...)
  // à CHAQUE visite de CHAQUE visiteur (juste pour vérifier si elles étaient vides),
  // ce qui épuisait le quota de lectures Firestore du plan gratuit en quelques visites.
  // Le seed initial reste disponible via AdminDashboard (useAdminDashboardContext ->
  // autoSeedIfEmpty), qui ne vérifie que 2 collections et seulement pour un admin connecté.

  useEffect(() => {
    useConfigStore.getState().resolveNavItems(DEFAULT_NAV_ITEMS);
  }, []);

  return (
    <>
      <Toaster position="top-center" />
      <Suspense fallback={<RouteFallback />}>
        <AppRoutes />
      </Suspense>
    </>
  );
}
