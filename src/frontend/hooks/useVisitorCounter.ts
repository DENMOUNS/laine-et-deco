import { useEffect } from 'react';

export const useVisitorCounter = () => {
  useEffect(() => {
    const trackVisit = async () => {
      const VISIT_KEY = 'last_visit_timestamp';
      const now = Date.now();
      const lastVisit = localStorage.getItem(VISIT_KEY);
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

      if (!lastVisit || now - parseInt(lastVisit, 10) > TWENTY_FOUR_HOURS) {
        try {
          const response = await fetch('/api/analytics/visit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });

          if (response.ok) {
            const result = await response.json();
            if (result?.ok) {
              localStorage.setItem(VISIT_KEY, now.toString());
            }
          } else if (response.status === 429) {
            // If the analytics endpoint is rate-limited, avoid retrying repeatedly.
            localStorage.setItem(VISIT_KEY, now.toString());
          }
        } catch {
          /* analytics non bloquant */
        }
      }
    };

    const schedule = () => void trackVisit();
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(schedule, { timeout: 8000 });
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(schedule, 5000);
    return () => clearTimeout(t);
  }, []);
};
