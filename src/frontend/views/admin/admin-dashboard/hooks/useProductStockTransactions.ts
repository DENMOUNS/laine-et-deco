import { useState, useEffect, useCallback } from 'react';
import { getPaginatedEntities } from '../../../../services/firestoreEntityService';
import { where, orderBy, type QueryConstraint, DocumentData } from 'firebase/firestore';

export function useProductStockTransactions(productId: string | undefined) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Pagination
  const [lastDoc, setLastDoc] = useState<DocumentData | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 10;

  const loadTransactions = useCallback(async (isInit: boolean = false) => {
    if (!productId) return;
    setIsLoading(true);
    try {
      const constraints: QueryConstraint[] = [
        where('productId', '==', productId),
        orderBy('timestamp', 'desc')
      ];

      const cursor = isInit ? null : lastDoc;
      const result = await getPaginatedEntities<any>('stock_transaction', constraints, pageSize, cursor);

      if (isInit) {
        setTransactions(result.items);
      } else {
        setTransactions(prev => [...prev, ...result.items]);
      }

      setLastDoc(result.lastDoc);
      setHasMore(result.items.length === pageSize);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to load stock transactions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [productId, lastDoc]);

  useEffect(() => {
    if (productId) {
      setTransactions([]);
      setLastDoc(null);
      setHasMore(true);
      loadTransactions(true);
    }
  }, [productId]);

  return {
    transactions,
    isLoading,
    error,
    loadMore: () => loadTransactions(false),
    hasMore
  };
}
