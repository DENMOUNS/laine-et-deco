import type { QueryConstraint } from 'firebase/firestore';
import { Product } from '../../types';
import { useStaticEntity } from './useStaticEntity';

interface UseProductsOptions {
  enabled?: boolean;
  constraints?: QueryConstraint[];
  isAdmin?: boolean;
}

/** Produits en lecture unique (getDocs) — pas de listener temps réel sur la home. */
export const useProducts = (options: UseProductsOptions = {}) => {
  const { enabled = true, constraints = [], isAdmin = false } = options;
  const { data: allProducts, isLoading, error } = useStaticEntity<Product>('product', [], {
    enabled,
    constraints,
  });

  // Pour le front-office (isAdmin = false), on ne renvoie que les produits actifs (isAvailable n'est pas faux)
  const products = isAdmin ? allProducts : allProducts.filter(p => p.isAvailable !== false);

  return {
    products,
    isLoading,
    error,
  };
};
