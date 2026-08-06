import { useState, useEffect } from 'react';

let marqueeReady = false;
let heroReady = false;

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

// Active par défaut le fallback de sécurité au bout de 4s pour ne jamais bloquer la page en cas d'erreur
if (typeof window !== 'undefined') {
  setTimeout(() => {
    if (!marqueeReady) {
      marqueeReady = true;
      notify();
    }
  }, 3500);

  setTimeout(() => {
    if (!heroReady) {
      heroReady = true;
      notify();
    }
  }, 6000);
}

export function setMarqueeReady(ready: boolean) {
  if (marqueeReady !== ready) {
    marqueeReady = ready;
    notify();
  }
}

export function setHeroReady(ready: boolean) {
  if (heroReady !== ready) {
    heroReady = ready;
    notify();
  }
}

export function useLoadingSequence() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    isMarqueeReady: marqueeReady,
    isHeroReady: heroReady,
    isAllReady: marqueeReady && heroReady,
  };
}
