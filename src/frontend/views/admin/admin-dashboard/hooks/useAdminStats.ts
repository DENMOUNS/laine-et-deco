import { useState, useEffect, useCallback } from 'react';
import { getEntityAggregate, getPaginatedEntities } from '../../../../services/firestoreEntityService';
import { orderBy, type QueryConstraint } from 'firebase/firestore';
import type { Order } from '../../../../../types';

export function useAdminStats() {
  const [statsData, setStatsData] = useState({
    totalSales: 0,
    totalOrdersCount: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    recentOrders: [] as Order[],
    isLoading: true,
  });

  const loadStats = useCallback(async () => {
    try {
      // 1. Get aggregates using fast, server-side aggregations
      const orderAgg = await getEntityAggregate('order', 'total');
      const userAgg = await getEntityAggregate('user');
      
      const totalSales = orderAgg.total || 0;
      const totalOrdersCount = orderAgg.count || 0;
      const totalCustomers = userAgg.count || 0;
      const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalSales / totalOrdersCount) : 0;

      // 2. Fetch only the 10 most recent orders instead of thousands
      const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
      const recentOrdersResult = await getPaginatedEntities<Order>('order', constraints, 10);

      setStatsData({
        totalSales,
        totalOrdersCount,
        totalCustomers,
        averageOrderValue,
        recentOrders: recentOrdersResult.items,
        isLoading: false
      });
    } catch (e) {
      console.error('Failed to aggregate stats or load recent orders:', e);
      setStatsData(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return statsData;
}
