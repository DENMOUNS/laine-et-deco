import React from 'react';
import { TabFilter } from '../TabFilter';
import { DataTable } from '../DataTable';
import { Order } from '../../../types';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { Download, Eye } from 'lucide-react';
import { generateInvoicePDF } from '../../utils/invoiceUtils';

interface DashboardOrdersProps {
  orders: Order[];
  orderFilter: string;
  setOrderFilter: (filter: string) => void;
  setSelectedOrder: (order: Order) => void;
}

export const DashboardOrders: React.FC<DashboardOrdersProps> = ({
  orders,
  orderFilter,
  setOrderFilter,
  setSelectedOrder
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h3 className="text-2xl font-serif font-bold text-primary">Historique des Commandes</h3>
        <TabFilter 
          options={[
            { id: 'all', label: 'Toutes' },
            { id: 'delivered', label: 'Livrées' },
            { id: 'processing', label: 'En cours' },
          ]}
          active={orderFilter}
          onChange={setOrderFilter}
          className="mb-0"
        />
      </div>
      <DataTable<Order>
        data={orders.filter(o => orderFilter === 'all' || o.status === orderFilter)}
        title="Mes Commandes"
        onRowClick={(order) => setSelectedOrder(order)}
        columns={[
          { header: 'ID', accessor: 'id', className: 'font-mono text-xs text-primary/70' },
          { header: 'Date', accessor: 'date', className: 'text-sm text-primary/70' },
          { 
            header: 'Total', 
            accessor: (order) => <span className="font-bold text-primary">{order.total.toLocaleString()} FCFA</span>,
            exportValue: (order) => `${order.total} FCFA`
          },
          {
            header: 'Statut',
            accessor: (order) => <StatusBadge status={order.status} />,
            exportValue: (order) => order.status
          },
          {
            header: 'Actions',
            accessor: (order) => (
              <div className="flex gap-2">
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                  className="text-accent font-bold text-xs hover:underline h-auto px-0 flex items-center gap-1"
                >
                  <Eye size={14} /> Détails
                </Button>
                {order.status === 'delivered' && (
                  <Button 
                    variant="outline"
                    size="icon"
                    onClick={(e) => { e.stopPropagation(); void generateInvoicePDF(order, true); }}
                    className="h-8 w-8 rounded-lg bg-green-50 text-green-600 border-green-100 hover:bg-green-600 hover:text-white transition-all shadow-sm"
                    title="Télécharger le reçu"
                  >
                    <Download size={14} />
                  </Button>
                )}
              </div>
            )
          }
        ]}
      />
    </div>
  );
};
