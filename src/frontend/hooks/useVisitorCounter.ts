import { useEffect } from 'react';

export const useVisitorCounter = () => {
  useEffect(() => {
    const trackVisit = async () => {
      const VISIT_KEY = 'last_visit_timestamp';
      const now = new Date().getTime();
      const lastVisit = localStorage.getItem(VISIT_KEY);
      
      // Track only once per day (24 hours)
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
      
      if (!lastVisit || (now - parseInt(lastVisit)) > TWENTY_FOUR_HOURS) {
        try {
          const response = await fetch('/api/analytics/visit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });

          if (!response.ok) {
            throw new Error(`Visitor tracking failed with status ${response.status}`);
          }

          const result = await response.json();
          if (!result?.ok) {
            throw new Error('Visitor tracking endpoint returned an invalid response');
          }
          
          localStorage.setItem(VISIT_KEY, now.toString());
        } catch (error) {
          console.error('Error tracking visitor:', error);
        }
      }
    };

    // Delay a bit to not block initial render
    const timeoutId = setTimeout(trackVisit, 2000);
    return () => clearTimeout(timeoutId);
  }, []);
};
