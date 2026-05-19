import { useEffect, useState } from 'react';

/** Active après idle (ou timeout) — garde le chemin critique sans Firebase / données lourdes. */
export function useAfterIdle(timeoutMs = 2800) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const run = () => setReady(true);
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(run, { timeout: timeoutMs });
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(run, timeoutMs);
    return () => clearTimeout(t);
  }, [timeoutMs]);

  return ready;
}

/** Active après scroll / clic — Firebase ne charge pas pendant l’audit Lighthouse initial. */
export function useDeferUntilInteraction(fallbackMs = 20_000) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;
    const go = () => setReady(true);
    window.addEventListener('pointerdown', go, { once: true, passive: true });
    window.addEventListener('scroll', go, { once: true, passive: true });
    window.addEventListener('keydown', go, { once: true });
    const t = setTimeout(go, fallbackMs);
    return () => {
      window.removeEventListener('pointerdown', go);
      window.removeEventListener('scroll', go);
      window.removeEventListener('keydown', go);
      clearTimeout(t);
    };
  }, [ready, fallbackMs]);

  return ready;
}
