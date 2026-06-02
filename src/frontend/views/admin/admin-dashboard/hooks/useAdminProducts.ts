import { useState, useEffect, useCallback } from 'react';
import { getPaginatedEntities, getEntityAggregate } from '../../../../services/firestoreEntityService';
import { where, orderBy, type QueryConstraint, DocumentData, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../../../backend/firebase';
import { toast } from 'sonner';
import type { Product } from '../../../../../types';

export function useAdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [productFilter, setProductFilter] = useState<'all' | 'stock_low' | 'stock_out'>('all');
  
  // Pagination
  const [lastDoc, setLastDoc] = useState<DocumentData | null>(null);
  const [prevDocs, setPrevDocs] = useState<DocumentData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchCount = useCallback(async () => {
    try {
      const constraints: QueryConstraint[] = [];
      if (productFilter === 'stock_low') {
        constraints.push(where('stock', '<', 10), where('stock', '>', 0));
      } else if (productFilter === 'stock_out') {
        constraints.push(where('stock', '==', 0));
      }
      const agg = await getEntityAggregate('product', undefined, constraints);
      setTotalCount(agg.count);
    } catch (e) {
      console.error('Failed to get aggregated products count:', e);
    }
  }, [productFilter]);

  const loadProducts = useCallback(async (direction: 'next' | 'prev' | 'init', currentLimit: number = pageSize) => {
    setIsLoading(true);
    try {
      let docCursor: DocumentData | null = null;
      let newPrevDocs = [...prevDocs];
      let newPage = currentPage;

      if (direction === 'next') {
        docCursor = lastDoc;
        newPage += 1;
      } else if (direction === 'prev') {
        newPrevDocs.pop();
        docCursor = newPrevDocs[newPrevDocs.length - 1] || null;
        newPage = Math.max(1, newPage - 1);
      } else {
        docCursor = null;
        newPrevDocs = [];
        newPage = 1;
      }

      const constraints: QueryConstraint[] = [];
      if (productFilter === 'stock_low') {
        constraints.push(where('stock', '<', 10), where('stock', '>', 0), orderBy('stock', 'asc'));
      } else if (productFilter === 'stock_out') {
        constraints.push(where('stock', '==', 0), orderBy('createdAt', 'desc'));
      } else {
        constraints.push(orderBy('createdAt', 'desc'));
      }

      const result = await getPaginatedEntities<Product>('product', constraints, currentLimit, docCursor);
      setProducts(result.items);
      setLastDoc(result.lastDoc);
      setCurrentPage(newPage);

      if (direction === 'next' && result.lastDoc) {
        newPrevDocs.push(result.lastDoc);
      } else if (direction === 'init' && result.lastDoc) {
        newPrevDocs = [result.lastDoc];
      }
      setPrevDocs(newPrevDocs);
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading paginated products:', err);
    } finally {
      setIsLoading(false);
    }
  }, [productFilter, lastDoc, prevDocs, currentPage, pageSize]);

  useEffect(() => {
    fetchCount();
    loadProducts('init', pageSize);
  }, [productFilter, pageSize]);

  const updateProductFields = async (id: string, fields: Partial<Product>) => {
    const oldProducts = [...products];
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...fields } : p));
    try {
      if (!db) throw new Error('Firestore not initialized');
      await updateDoc(doc(db, 'product', id), fields);
    } catch (e) {
      setProducts(oldProducts);
      toast.error('Erreur lors de la mise à jour');
      throw e;
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce produit ?')) return;
    try {
      if (!db) throw new Error('Firestore not initialized');
      await deleteDoc(doc(db, 'product', id));
      toast.success('Produit supprimé');
      loadProducts('init', pageSize);
    } catch (e) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handlePageChange = (direction: 'next' | 'prev', limitVal: number) => {
    if (limitVal !== pageSize) {
      setPageSize(limitVal);
    } else {
      loadProducts(direction, limitVal);
    }
  };

  return {
    products,
    totalCount,
    isLoading,
    error,
    productFilter,
    setProductFilter,
    updateProductFields,
    deleteProduct,
    handlePageChange,
    currentPage
  };
}
