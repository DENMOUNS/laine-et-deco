/** Lightweight Suspense fallback — avoids motion/react on the critical path. */
export function RouteFallback() {
  return (
    <div
      className="min-h-[50vh] w-full animate-pulse bg-secondary/20"
      aria-busy="true"
      aria-label="Chargement"
    />
  );
}
