import type { QueryConstraint } from 'firebase/firestore';
import { Product } from '../../types';
import { useStaticEntity } from './useStaticEntity';

interface UseProductsOptions {
  enabled?: boolean;
  constraints?: QueryConstraint[];
}

/** Produits en lecture unique (getDocs) — pas de listener temps réel sur la home. */
export const useProducts = (options: UseProductsOptions = {}) => {
  const { enabled = true, constraints = [] } = options;
  const { data: products, isLoading, error } = useStaticEntity<Product>('product', [], {
    enabled,
    constraints,
  });

  return {
    products,
    isLoading,
    error,
  };
};
