import type { QueryConstraint } from 'firebase/firestore';
import { Product } from '../../types';
import { useStaticEntity } from './useStaticEntity';

interface UseProductsOptions {
  enabled?: boolean;
  constraints?: QueryConstraint[];
  isAdmin?: boolean;
  cacheOnly?: boolean;
}

/** Produits en lecture unique (getDocs) — pas de listener temps réel sur la home. */
export const useProducts = (options: UseProductsOptions = {}) => {
  const { enabled = true, constraints = [], isAdmin = false, cacheOnly = false } = options;
  const { data: allProducts, isLoading, error } = useStaticEntity<Product>('product', [], {
    enabled,
    constraints,
    cacheOnly,
  });

  // Normalisation du stock et des images pour garder le front parfaitement cohérent
  const normalizedProducts = allProducts.map((p) => {
    const normalizedStock = typeof p.stock === 'number'
      ? p.stock
      : typeof (p as any).quantity === 'number'
        ? (p as any).quantity
        : 0;
    
    const primaryImg = p.image || (p as any).imageUrl || (Array.isArray(p.images) && p.images[0]) || '';
    const imgArray = Array.isArray(p.images) && p.images.length > 0 ? p.images : (primaryImg ? [primaryImg] : []);

    return {
      ...p,
      image: primaryImg,
      imageUrl: primaryImg,
      images: imgArray,
      stock: normalizedStock,
      quantity: normalizedStock
    } as Product & { quantity: number };
  });

  // Pour le front-office (isAdmin = false), on ne renvoie que les produits actifs (isAvailable n'est pas faux)
  const products = isAdmin ? normalizedProducts : normalizedProducts.filter(p => p.isAvailable !== false);

  return {
    products,
    isLoading,
    error,
  };
};
