import { useState, useEffect } from 'react';
import { MarqueeItem } from '../../types';
import { ApiMarqueeRepository } from '../../backend/infrastructure/repositories/ApiMarqueeRepository';
import { GetMarqueeItemsUseCase } from '../../backend/application/use-cases/GetMarqueeItems';

const marqueeRepository = new ApiMarqueeRepository();
const getMarqueeItemsUseCase = new GetMarqueeItemsUseCase(marqueeRepository);

export function useMarqueeService(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const [data, setData] = useState<MarqueeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(true);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    getMarqueeItemsUseCase.execute().then((result) => {
      if (!isMounted) return;
      if (result.success === true) {
        setData(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [enabled]);

  return { data, isLoading, error };
}
