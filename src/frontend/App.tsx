import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { toast, Toaster } from 'sonner';
import { RouteFallback } from './components/RouteFallback';
import { NavigationProgress } from './components/NavigationProgress';
import { useAuthStore } from '../stores/authStore';
import { useConfigStore } from '../stores/configStore';
import { SiteConfig, PromoEvent, NavItem } from '../types';
import { DEFAULT_NAV_ITEMS } from '../siteDefaults';
import { getStaticEntityCacheKey, readCache, writeCache, getTTLForEntity } from './utils/cacheStorage';
import { dispatchNetworkIssue, getNetworkWarningMessage } from './utils/networkStatus';
import { AppRoutes } from './components/AppRoutes';
import { useThemeStore } from '../stores/themeStore';

const HOME_CACHE_COLLECTIONS = [
  { name: 'product', max: 24 },
  { name: 'category' },
  { name: 'pack' },
  { name: 'blog_post' },
  { name: 'flash_sale' },
  { name: 'lookbook' },
  { name: 'hero_banner' },
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
    const cacheKeyFor = (entityType: string) => `appBootstrap:${entityType}:v2`;

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

      if (cachedSiteConfigs?.[0]) setSiteConfig(cachedSiteConfigs[0]);
      if (hasCachedNavItems) resolveNavItems(cachedNavItems);
      if (cachedPromoEvents) setEvents(cachedPromoEvents);

      // Si les trois entrees sont en cache et valides, on ne fait aucun appel reseau.
      if (cachedSiteConfigs && cachedPromoEvents && hasCachedNavItems) return;

      const [{ initFirebase }, { getDocs, collection, query, limit }] = await Promise.all([
        import('../backend/firebase'),
        import('firebase/firestore'),
      ]);

      if (cancelled) return;

      const { db: firestore } = initFirebase();
      if (!firestore) return;

      const fetchCollection = async <T,>(name: string, max?: number): Promise<T[]> => {
        try {
          const controller = new AbortController();
          const timeoutId = window.setTimeout(() => controller.abort(), 1_200);
          const response = await fetch(`/api/entity/${encodeURIComponent(name)}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            signal: controller.signal,
          });
          window.clearTimeout(timeoutId);

          const body = await response.json().catch(() => null);
          if (response.ok && Array.isArray(body)) {
            return (max ? body.slice(0, max) : body) as T[];
          }
        } catch (error) {
          dispatchNetworkIssue(typeof navigator !== 'undefined' ? !navigator.onLine : false);
        }

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
        hasCachedNavItems ? Promise.resolve(cachedNavItems) : fetchCollection<NavItem>('nav_item', 30),
      ]);

      if (cancelled) return;

      if (siteConfigs[0]) setSiteConfig(siteConfigs[0]);
      if (navItems.length > 0) resolveNavItems(navItems);
      else resolveNavItems(DEFAULT_NAV_ITEMS);
      setEvents(promoEvents);

      if (!cachedSiteConfigs) writeCache(cacheKeyFor('site_config'), siteConfigs, getTTLForEntity('site_config'));
      if (!cachedPromoEvents) writeCache(cacheKeyFor('promo_event'), promoEvents, getTTLForEntity('promo_event'));
      if (!hasCachedNavItems) writeCache(cacheKeyFor('nav_item'), navItems, getTTLForEntity('nav_item'));

      void Promise.all(
        HOME_CACHE_COLLECTIONS.map(async ({ name, max }) => {
          const sharedCacheKey = `entityCache:${name}`;
          const constraintCacheKey = getStaticEntityCacheKey(name, max ? [limit(max)] : []);
          const cached = await readCache<unknown[]>(sharedCacheKey);
          if (cached) return;
          const items = await fetchCollection(name, max);
          if (!cancelled) {
            await Promise.all([
              writeCache(sharedCacheKey, items, getTTLForEntity(name)),
              writeCache(constraintCacheKey, items, getTTLForEntity(name)),
            ]);
          }
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
  const theme = useThemeStore((s) => s.theme); // Force React-binding/re-render on theme change at root level

  const initAuthListener = useAuthStore((s) => s.initAuthListener);
  const networkWarningShownRef = useRef(false);
  const offlineTimestampRef = useRef<number | null>(null);

  useEffect(() => {
    const handleNetworkIssue = (event: Event) => {
      const detail = (event as CustomEvent<{ isOffline?: boolean }>).detail;
      const isOffline = detail?.isOffline ?? false;

      if (networkWarningShownRef.current) {
        return;
      }

      networkWarningShownRef.current = true;
      toast.warning(getNetworkWarningMessage(isOffline), {
        duration: 6000,
        closeButton: true,
      });
    };

    const handleOnline = () => {
      const offlineAt = offlineTimestampRef.current;
      offlineTimestampRef.current = null;

      const elapsedMs = offlineAt ? Date.now() - offlineAt : 0;
      const FIVE_MINUTES_MS = 5 * 60 * 1000;

      if (offlineAt && elapsedMs > FIVE_MINUTES_MS) {
        toast.info("Connexion rétablie après plus de 5 minutes. Actualisation de la page...", { closeButton: true });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        return;
      }

      if (!networkWarningShownRef.current) {
        return;
      }

      networkWarningShownRef.current = false;
      toast.success('Connexion rétablie.', { closeButton: true });
    };

    const handleOffline = () => {
      if (!offlineTimestampRef.current) {
        offlineTimestampRef.current = Date.now();
      }
      dispatchNetworkIssue(true);
    };

    window.addEventListener('app:network-issue', handleNetworkIssue as EventListener);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('app:network-issue', handleNetworkIssue as EventListener);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
    // Do not inject hard-coded nav items — resolve from cache/DB only.
    useConfigStore.getState().resolveNavItems([]);
  }, []);

  return (
    <>
      <NavigationProgress />
      <Toaster position="top-center" duration={5000} closeButton />
      <Suspense fallback={<RouteFallback />}>
        <AppRoutes />
      </Suspense>
    </>
  );
}
