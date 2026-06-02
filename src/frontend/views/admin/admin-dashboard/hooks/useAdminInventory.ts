import { useMemo } from 'react';
import { useEntity } from '../../../../hooks/useEntity';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../../backend/firebase';
import { toast } from 'sonner';
import type { Product } from '../../../../../types';

export function useAdminInventory() {
  const { data: products, setData: setProducts, isLoading, error } = useEntity<Product>('product', []);

  const stats = useMemo(() => {
    let outOfStockCount = 0;
    let lowStockCount = 0;
    let totalStockValue = 0;

    for (const p of products) {
      const stock = Number(p.stock) || 0;
      const price = Number(p.price) || 0;

      if (stock === 0) {
        outOfStockCount += 1;
      } else if (stock < 10) {
        lowStockCount += 1;
      }
      totalStockValue += stock * price;
    }

    return {
      outOfStockCount,
      lowStockCount,
      totalStockValue
    };
  }, [products]);

  /**
   * Synchronise le champ `in_stock` du produit dans Firestore et dans l'état local.
   * Utilisé quand un ajustement de stock externe change le statut disponible/rupture.
   */
  const updateProductStockStatus = async (productId: string, in_stock: boolean, stock?: number) => {
    const oldProducts = [...products];
    // Optimistic update
    setProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? { ...p, in_stock, ...(stock !== undefined ? { stock } : {}) }
          : p
      )
    );
    try {
      if (!db) throw new Error('Firestore non initialisé');
      const fields: Record<string, any> = { in_stock };
      if (stock !== undefined) fields.stock = stock;
      await updateDoc(doc(db, 'product', productId), fields);
    } catch (e) {
      // Rollback on error
      setProducts(oldProducts);
      toast.error('Erreur lors de la mise à jour du statut stock');
      throw e;
    }
  };

  return {
    products,
    isLoading,
    error,
    updateProductStockStatus,
    ...stats
  };
}
