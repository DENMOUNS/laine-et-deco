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

  // Normalisation du stock entre stock / quantity pour garder le front cohérent
  const normalizedProducts = allProducts.map((p) => {
    const normalizedStock = typeof p.stock === 'number'
      ? p.stock
      : typeof (p as any).quantity === 'number'
        ? (p as any).quantity
        : 0;
    return { ...p, stock: normalizedStock, quantity: normalizedStock } as T & { quantity: number };
  });

  // Pour le front-office (isAdmin = false), on ne renvoie que les produits actifs (isAvailable n'est pas faux)
  const products = isAdmin ? normalizedProducts : normalizedProducts.filter(p => p.isAvailable !== false);

  return {
    products,
    isLoading,
    error,
  };
};
