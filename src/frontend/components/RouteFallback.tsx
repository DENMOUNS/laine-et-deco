import React from 'react';
import { Loader2 } from 'lucide-react';

/** Suspense fallback loader — displays a clean spinner and progress bar when loading views. */
export function RouteFallback() {
  return (
    <div
      className="min-h-[55vh] w-full flex flex-col items-center justify-center p-8 text-center animate-fade-in"
      aria-busy="true"
      aria-label="Chargement de la page"
    >
      <div className="relative mb-4 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
        <Loader2 className="w-6 h-6 text-accent animate-spin absolute" />
      </div>

      <p className="text-sm font-medium text-primary/80 dark:text-white/80 animate-pulse tracking-wide">
        Chargement de la page...
      </p>

      <div className="mt-4 w-36 h-1 bg-secondary-dark/20 dark:bg-white/10 rounded-full overflow-hidden">
        <div className="w-full h-full bg-accent animate-pulse" />
      </div>
    </div>
  );
}
