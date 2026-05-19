import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { RouteFallback } from './components/RouteFallback';
import { useVisitorCounter } from './hooks/useVisitorCounter';
import { useAuthStore } from '../stores/authStore';
import { useConfigStore } from '../stores/configStore';
import { SiteConfig, PromoEvent, NavItem } from '../types';
import { DEFAULT_SITE_CONFIG, DEFAULT_NAV_ITEMS } from '../siteDefaults';

const AppRoutes = lazy(() =>
  import('./components/AppRoutes').then((m) => ({ default: m.AppRoutes }))
);

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
    const idleTimer = scheduleIdle(start, 25_000);
    return () => {
      window.removeEventListener('pointerdown', start);
      window.removeEventListener('keydown', start);
      idleTimer();
    };
  }, []);

  useEffect(() => {
    if (!sync) return;

    let cancelled = false;

    void (async () => {
      const [{ initFirebase }, { getDocs, collection, query, limit }] = await Promise.all([
        import('../backend/firebase'),
        import('firebase/firestore'),
      ]);

      if (cancelled) return;

      const { db: firestore } = initFirebase();
      if (!firestore) return;

      const fetchCollection = async <T,>(name: string, max = 50): Promise<T[]> => {
        try {
          const snap = await getDocs(query(collection(firestore, name), limit(max)));
          return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];
        } catch {
          return [];
        }
      };

      const [siteConfigs, promoEvents, navItems] = await Promise.all([
        fetchCollection<SiteConfig>('site_config', 5),
        fetchCollection<PromoEvent>('promo_event', 20),
        fetchCollection<NavItem>('nav_item', 30),
      ]);

      if (cancelled) return;

      if (siteConfigs[0]) setSiteConfig(siteConfigs[0]);
      if (navItems.length > 0) resolveNavItems(navItems);
      else resolveNavItems(DEFAULT_NAV_ITEMS);
      setEvents(promoEvents);
    })();

    return () => {
      cancelled = true;
    };
  }, [sync, setSiteConfig, resolveNavItems, setEvents]);
}

export function App() {
  useVisitorCounter();
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

  useEffect(() => {
    return scheduleIdle(() => {
      void import('./utils/firebaseSeed').then(({ seedFirebase }) => seedFirebase());
    }, 30_000);
  }, []);

  useEffect(() => {
    useConfigStore.getState().setSiteConfig(DEFAULT_SITE_CONFIG);
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
