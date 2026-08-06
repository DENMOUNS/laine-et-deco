import { useState, useEffect } from 'react';
import { HeroBannerConfig } from '../../types';
import { ApiHeroBannerRepository } from '../../backend/infrastructure/repositories/ApiHeroBannerRepository';
import { GetHeroBannersUseCase } from '../../backend/application/use-cases/GetHeroBanners';

const heroBannerRepository = new ApiHeroBannerRepository();
const getHeroBannersUseCase = new GetHeroBannersUseCase(heroBannerRepository);

export function useHeroBannersService(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const [data, setData] = useState<HeroBannerConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(true);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    getHeroBannersUseCase.execute().then((result) => {
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
