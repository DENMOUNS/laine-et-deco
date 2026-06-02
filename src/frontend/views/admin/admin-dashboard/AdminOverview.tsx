import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, ShoppingBag, BarChart3, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';
import { useAdminStats } from './hooks/useAdminStats';
import { useAdminStore } from '../../../../stores/adminStore';
import { useEntity } from '../../../hooks/useEntity';
import { DataTable } from '../../../components/DataTable';
import { TabFilter } from '../../../components/TabFilter';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { formatFirestoreDate as formatDate } from '../../../../services/adminService';
import type { Order, Product } from '../../../../types';

export function AdminOverview({ ctx }: { ctx: any }) {
  const {
    totalSales,
    totalOrdersCount,
    averageOrderValue,
    recentOrders,
    isLoading: isStatsLoading
  } = useAdminStats();

  const { data: localProducts } = useEntity<Product>('product', []);

  const overviewOrderFilter = useAdminStore((s) => s.overviewOrderFilter);
  const setOverviewOrderFilter = useAdminStore((s) => s.setOverviewOrderFilter);
  const setSelectedOrder = useAdminStore((s) => s.setSelectedOrder);
  const setActiveTab = useAdminStore((s) => s.setActiveTab);

  const stats = [
    { label: 'Ventes Totales', value: `${totalSales.toLocaleString('fr-FR')} FCFA`, change: '+12.5%', isUp: true, icon: <TrendingUp size={20} /> },
    { label: 'Commandes', value: totalOrdersCount.toString(), change: '+5.2%', isUp: true, icon: <ShoppingBag size={20} /> },
    { label: 'Panier Moyen', value: `${averageOrderValue.toLocaleString('fr-FR')} FCFA`, change: '+8.1%', isUp: true, icon: <BarChart3 size={20} /> },
  ];

  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card p-6 rounded-3xl shadow-sm border border-primary/10"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-secondary/50 rounded-2xl text-primary border border-primary/5">{stat.icon}</div>
              <span className={`flex items-center text-xs font-bold ${stat.isUp ? 'text-primary' : 'text-primary/60'}`}>
                {stat.change}
                {stat.isUp ? <ArrowUpRight size={14} className="ml-1" /> : <ArrowDownRight size={14} className="ml-1" />}
              </span>
            </div>
            <p className="text-primary/60 text-sm mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-primary">
              {isStatsLoading ? 'Chargement...' : stat.value}
            </h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Recent Orders */}
        <div className="xl:col-span-2 min-w-0">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-serif">Commandes Récentes</h3>
            <TabFilter 
              options={[
                { id: 'all', label: 'Toutes' },
                { id: 'today', label: 'Aujourd\'hui' },
                { id: 'yesterday', label: 'Hier' },
              ]}
              active={overviewOrderFilter}
              onChange={(val) => setOverviewOrderFilter(val as any)}
              className="mb-0"
            />
          </div>
          <DataTable<Order>
            dateFilterKey="createdAt"
            data={recentOrders.filter(o => {
              if (overviewOrderFilter === 'all') return true;
              if (overviewOrderFilter === 'today') return o.date.includes('2024'); // Mock today
              if (overviewOrderFilter === 'yesterday') return o.date.includes('2023'); // Mock yesterday
              return true;
            })}
            onRowClick={(order) => {
              setSelectedOrder(order);
              setActiveTab('order-detail');
            }}
            columns={[
              { header: 'Client', accessor: 'customer', className: 'font-medium', sortable: true },
              { header: 'Date Opération', accessor: 'date', className: 'text-primary/60 text-sm', sortable: true },
              { 
                header: 'Total', 
                accessor: (order: Order) => <span className="font-bold text-primary">{order.total.toLocaleString()} FCFA</span>,
                exportValue: (order: Order) => `${order.total} FCFA`,
                sortable: true,
                sortKey: 'total'
              },
              { header: 'Statut', accessor: (order: Order) => <StatusBadge status={order.status} />, exportValue: (order: Order) => order.status, sortable: true, sortKey: 'status' },
              { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt || item.date || item.subscribedAt || item.sentAt || new Date().toISOString()), className: 'text-primary/60 text-sm', sortable: true }
            ]}
          />
        </div>

        {/* Best Sellers */}
        <div className="space-y-10 min-w-0">
          <div className="bg-card rounded-[2.5rem] shadow-sm border border-primary/10 p-8">
            <h3 className="text-xl font-serif mb-8">Meilleures Ventes</h3>
            <div className="space-y-6">
              {localProducts.slice(0, 4).map((product) => (
                <div key={product.id} className="flex items-center gap-4">
                  <img src={product.image} alt={product.name} className="w-12 h-16 object-cover rounded-lg" referrerPolicy="no-referrer" />
                  <div className="flex-grow">
                    <h4 className="font-medium text-sm line-clamp-1 text-primary">{product.name}</h4>
                    <p className="text-primary/60 text-xs">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-primary">{product.price.toLocaleString()} FCFA</p>
                    <p className="text-[10px] text-primary font-bold">+12%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-[2.5rem] shadow-sm border border-primary/10 p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-serif text-primary">Alertes Stock</h3>
              <AlertCircle className="text-primary/60" size={20} />
            </div>
            <div className="space-y-4">
              {localProducts.filter(p => p.stock < 15).slice(0, 4).map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-2xl border border-primary/5 shadow-sm">
                  <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-lg" referrerPolicy="no-referrer" />
                  <div className="flex-grow">
                    <h4 className="font-bold text-xs line-clamp-1 text-primary">{product.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-grow h-1 bg-secondary/50 rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${Math.min((product.stock / 15) * 100, 100)}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-primary/80">{product.stock} restants</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
