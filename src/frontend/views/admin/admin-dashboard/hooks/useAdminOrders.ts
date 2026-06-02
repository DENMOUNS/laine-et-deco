import { useState, useEffect, useCallback, useRef } from 'react';
import { getPaginatedEntities, getEntityAggregate } from '../../../../services/firestoreEntityService';
import { where, orderBy, type QueryConstraint, DocumentData } from 'firebase/firestore';
import { toast } from 'sonner';
import { updateOrderStatus as apiUpdateOrderStatus } from '../../../../services/dashboardApi';
import type { Order } from '../../../../../types';

export function useAdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  
  // Pagination references
  const [lastDoc, setLastDoc] = useState<DocumentData | null>(null);
  const [prevDocs, setPrevDocs] = useState<DocumentData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Fetch total count (using firestore server aggregation)
  const fetchCount = useCallback(async () => {
    try {
      const constraints: QueryConstraint[] = [];
      if (orderFilter !== 'all') {
        constraints.push(where('status', '==', orderFilter));
      }
      const agg = await getEntityAggregate('order', undefined, constraints);
      setTotalCount(agg.count);
    } catch (e) {
      console.error('Failed to get aggregated orders count:', e);
    }
  }, [orderFilter]);

  // Load paginated data
  const loadOrders = useCallback(async (direction: 'next' | 'prev' | 'init', currentLimit: number = pageSize) => {
    setIsLoading(true);
    try {
      let docCursor: DocumentData | null = null;
      let newPrevDocs = [...prevDocs];
      let newPage = currentPage;

      if (direction === 'next') {
        docCursor = lastDoc;
        newPage += 1;
      } else if (direction === 'prev') {
        newPrevDocs.pop(); // Remove current cursor
        docCursor = newPrevDocs[newPrevDocs.length - 1] || null;
        newPage = Math.max(1, newPage - 1);
      } else {
        // init
        docCursor = null;
        newPrevDocs = [];
        newPage = 1;
      }

      const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
      if (orderFilter !== 'all') {
        constraints.push(where('status', '==', orderFilter));
      }

      const result = await getPaginatedEntities<Order>('order', constraints, currentLimit, docCursor);
      
      setOrders(result.items);
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
      console.error('Error loading paginated orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [orderFilter, lastDoc, prevDocs, currentPage, pageSize]);

  // Trigger load on filter or page size changes
  useEffect(() => {
    fetchCount();
    loadOrders('init', pageSize);
  }, [orderFilter, pageSize]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    const oldOrders = [...orders];
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
    
    try {
      await apiUpdateOrderStatus(orderId, newStatus);
      toast.success(`Statut de la commande ${orderId} mis à jour : ${newStatus}`);
      fetchCount(); // Recalculate count if it was filtered
    } catch (err) {
      setOrders(oldOrders);
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      throw err;
    }
  };

  const handlePageChange = (direction: 'next' | 'prev', limitVal: number) => {
    if (limitVal !== pageSize) {
      setPageSize(limitVal);
    } else {
      loadOrders(direction, limitVal);
    }
  };

  return {
    orders,
    totalCount,
    isLoading,
    error,
    orderFilter,
    setOrderFilter,
    updateStatus,
    handlePageChange,
    currentPage
  };
}
