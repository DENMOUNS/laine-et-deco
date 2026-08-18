import React from 'react';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import { useAdminOrders } from './hooks/useAdminOrders';
import { useAdminStore } from '../../../../stores/adminStore';
import { DataTable } from '../../../components/DataTable';
import { TabFilter } from '../../../components/TabFilter';
import { getStatusStyles } from '../../../components/ui/StatusBadge';
import { formatFirestoreDate as formatDate } from '../../../../services/adminService';
import { generateInvoicePDF } from '../../../utils/invoiceUtils';
import { cn } from '../../../utils/utils';
import type { Order } from '../../../../types';

export function AdminOrders({ ctx }: { ctx: any }) {
  const {
    orders,
    totalCount,
    isLoading,
    orderFilter,
    setOrderFilter,
    updateStatus,
    handlePageChange,
    currentPage
  } = useAdminOrders();

  const setSelectedOrder = useAdminStore((s) => s.setSelectedOrder);
  const setActiveTab = useAdminStore((s) => s.setActiveTab);

  return (
    <div className="space-y-6">
      <TabFilter 
        options={[
          { id: 'all', label: 'Tous' },
          { id: 'pending', label: 'En attente' },
          { id: 'processing', label: 'Traitement' },
          { id: 'shipped', label: 'Expédié' },
          { id: 'delivered', label: 'Livré' },
          { id: 'cancelled', label: 'Annulé' },
        ]}
        active={orderFilter}
        onChange={(val) => setOrderFilter(val as any)}
      />
      <DataTable<Order>
        dateFilterKey="createdAt"
        data={orders}
        onRowClick={(order) => {
          setSelectedOrder(order);
          setActiveTab('order-detail');
        }}
        title="Liste des Commandes"
        columns={[
          { header: 'Client', accessor: 'customer', className: 'font-medium', sortable: true },
          { 
            header: 'Type', 
            accessor: (order: Order) => order.type === 'custom' 
              ? <span className="text-accent font-bold text-xs uppercase tracking-widest">Sur Mesure</span> 
              : <span className="text-primary/60 text-xs uppercase tracking-widest">Standard</span>, 
            sortable: true, 
            sortKey: 'type' 
          },
          { header: 'Date Opération', accessor: 'date', className: 'text-primary/60 text-sm', sortable: true },
          { 
            header: 'Total', 
            accessor: (order: Order) => <span className="font-bold text-primary">{order.total.toLocaleString()} FCFA</span>,
            exportValue: (order: Order) => `${order.total} FCFA`,
            sortable: true,
            sortKey: 'total'
          },
          {
            header: 'Statut',
            accessor: (order: Order) => (
              <select
                value={order.status}
                onClick={(e) => e.stopPropagation()}
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  try {
                    await updateStatus(order.id, newStatus);
                  } catch (err) {
                    // State reversion is handled inside the hook
                  }
                }}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border-none focus:ring-2 focus:ring-primary/20 cursor-pointer",
                  getStatusStyles(order.status)
                )}
              >
                <option value="pending">En attente</option>
                <option value="processing">Traitement</option>
                <option value="shipped">Expédié</option>
                <option value="delivered">Livré</option>
                <option value="cancelled">Annulé</option>
              </select>
            ),
            exportValue: (order: Order) => order.status,
            sortable: true,
            sortKey: 'status'
          },
          {
            header: 'Actions',
            accessor: (order: Order) => (
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setSelectedOrder(order); 
                    setActiveTab('order-detail'); 
                  }}
                  className="text-primary font-bold text-sm hover:underline"
                >
                  Détails
                </button>
                {order.status === 'delivered' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void generateInvoicePDF(order, true);
                    }}
                    className="p-1.5 rounded-lg bg-primary/5 text-primary hover:bg-primary hover:text-white transition-colors"
                    title="Télécharger la facture PDF"
                  >
                    <Download size={14} />
                  </button>
                )}
              </div>
            )
          },
          { 
            header: 'Créé le', 
            accessor: (item: any) => formatDate(item.createdAt || item.date || item.subscribedAt || item.sentAt || new Date().toISOString()), 
            className: 'text-primary/60 text-sm', 
            sortable: true 
          }
        ]}
        serverPagination={{
          totalItems: totalCount,
          isLoading: isLoading,
          onPageChange: handlePageChange
        }}
      />
    </div>
  );
}
