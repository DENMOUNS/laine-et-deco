import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export function NavigationProgress() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showBadge, setShowBadge] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const badgeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevPathRef = useRef(location.pathname + location.search);

  const startProgress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);

    setLoading(true);
    setProgress(20);
    setShowBadge(false);

    // Show badge only if navigation takes longer than 250ms
    badgeTimerRef.current = setTimeout(() => {
      setShowBadge(true);
    }, 250);

    // Trickle progress to indicate active loading
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 90;
        }
        // Decelerating step
        const diff = (90 - prev) * 0.15;
        return prev + Math.max(diff, 1);
      });
    }, 120);
  };

  const completeProgress = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);

    setProgress(100);
    setShowBadge(false);

    timerRef.current = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 250);
  };

  // 1. Listen to location changes (React Router)
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    if (currentPath !== prevPathRef.current) {
      prevPathRef.current = currentPath;
      completeProgress();
    }
  }, [location]);

  // 2. Global event listeners for immediate tactile feedback on click
  useEffect(() => {
    const handleNavStart = () => {
      startProgress();
    };

    const handleNavEnd = () => {
      completeProgress();
    };

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const link = target.closest('a') as HTMLAnchorElement | null;
      const navBtn = target.closest('[data-navigate], button, [role="button"]') as HTMLElement | null;

      if (link && link.href) {
        const url = new URL(link.href, window.location.origin);
        // Only trigger for same-origin links that aren't download / target="_blank"
        if (url.origin === window.location.origin && link.target !== '_blank' && !link.hasAttribute('download')) {
          if (url.pathname + url.search !== window.location.pathname + window.location.search) {
            startProgress();
          }
        }
      } else if (navBtn) {
        // If it's a navigation button, trigger lightweight start
        const isAction = navBtn.hasAttribute('data-navigate') || navBtn.getAttribute('type') === 'submit';
        if (isAction) {
          startProgress();
        }
      }
    };

    window.addEventListener('navigation:start', handleNavStart);
    window.addEventListener('navigation:end', handleNavEnd);
    document.addEventListener('click', handleDocumentClick, { capture: true, passive: true });

    return () => {
      window.removeEventListener('navigation:start', handleNavStart);
      window.removeEventListener('navigation:end', handleNavEnd);
      document.removeEventListener('click', handleDocumentClick, { capture: true });
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);
    };
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <>
      {/* Top Loading Bar */}
      <div
        className="fixed top-0 left-0 right-0 z-[99999] h-1 pointer-events-none transition-opacity duration-300"
        style={{ opacity: loading ? 1 : 0 }}
        aria-hidden="true"
      >
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 transition-all duration-200 ease-out shadow-[0_0_12px_rgba(245,158,11,0.8)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Floating Spinner Badge when navigation takes > 250ms */}
      {showBadge && (
        <div className="fixed top-4 right-4 z-[99999] pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/95 text-white dark:bg-card dark:text-primary dark:border dark:border-border text-xs font-medium shadow-xl backdrop-blur-md">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
            <span>Chargement...</span>
          </div>
        </div>
      )}
    </>
  );
}
