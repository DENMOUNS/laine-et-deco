import React from 'react';
import { CreditCard, Download } from 'lucide-react';
import { toast } from 'sonner';
import { TabFilter } from '../TabFilter';
import { DataTable } from '../DataTable';
import { Order } from '../../../types';
import { generateInvoicePDF } from '../../utils/invoiceUtils';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';

type PaymentRow = {
  id: string;
  orderId: string;
  date: string;
  amount: number;
  status: 'paid' | 'unpaid';
};

function ordersToPayments(orders: Order[]): PaymentRow[] {
  const paidStatuses = new Set(['shipped', 'delivered', 'completed']);
  return orders.map((order) => ({
    id: `INV-${order.id}`,
    orderId: order.id,
    date: order.date,
    amount: order.total,
    status: paidStatuses.has(order.status) ? 'paid' : 'unpaid',
  }));
}

interface DashboardPaymentsProps {
  orders: Order[];
  paymentFilter: string;
  setPaymentFilter: (filter: string) => void;
  userRole: string;
}

export const DashboardPayments: React.FC<DashboardPaymentsProps> = ({
  orders,
  paymentFilter,
  setPaymentFilter,
  userRole,
}) => {
  const canManagePayments = ['super-admin', 'admin'].includes(userRole);
  const payments = ordersToPayments(orders);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h3 className="text-2xl font-serif font-bold text-primary">Historique des Paiements</h3>
        <TabFilter
          options={[
            { id: 'all', label: 'Tous' },
            { id: 'paid', label: 'Payés' },
            { id: 'unpaid', label: 'En attente' },
          ]}
          active={paymentFilter}
          onChange={setPaymentFilter}
          className="mb-0"
        />
      </div>
      <DataTable<PaymentRow>
        data={payments.filter((p) => paymentFilter === 'all' || p.status === paymentFilter)}
        title="Mes Paiements"
        columns={[
          {
            header: 'Paiement',
            accessor: (payment) => (
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 rounded-xl text-primary">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="font-mono text-[10px] text-primary/70">{payment.id}</p>
                  <p className="font-bold text-sm">{payment.amount.toLocaleString()} FCFA</p>
                </div>
              </div>
            ),
            exportValue: (payment) => `${payment.amount} FCFA`,
          },
          { header: 'Date', accessor: 'date', className: 'text-sm text-primary/70' },
          {
            header: 'Statut',
            accessor: (payment) => <StatusBadge status={payment.status} />,
            exportValue: (payment) => payment.status,
          },
          {
            header: 'Action',
            accessor: (payment) => {
              const order = orders.find((o) => o.id === payment.orderId);
              const isDelivered = order?.status === 'delivered';
              const canDownload = isDelivered || canManagePayments;

              return (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (order && canDownload) void generateInvoicePDF(order, true);
                    else toast.error("La facture n'est disponible qu'après la livraison.");
                  }}
                  className={`p-2 rounded-lg transition-all h-auto ${canDownload ? 'bg-slate-50 text-primary hover:bg-primary hover:text-white' : 'bg-slate-100 text-primary/70 cursor-not-allowed'}`}
                  title={canDownload ? 'Télécharger la facture' : 'Disponible après livraison'}
                >
                  <Download size={18} />
                </Button>
              );
            },
          },
        ]}
      />
    </div>
  );
};
