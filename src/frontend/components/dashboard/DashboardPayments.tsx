import React from 'react';
import { CreditCard, Download } from 'lucide-react';
import { toast } from 'sonner';
import { TabFilter } from '../TabFilter';
import { DataTable } from '../DataTable';
import { Invoice, Order } from '../../../types';
import { generateInvoicePDF } from '../../utils/invoiceUtils';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';

interface DashboardPaymentsProps {
  invoices: Invoice[];
  orders: Order[];
  paymentFilter: string;
  setPaymentFilter: (filter: string) => void;
  userRole: string;
}

export const DashboardPayments: React.FC<DashboardPaymentsProps> = ({
  invoices,
  orders,
  paymentFilter,
  setPaymentFilter,
  userRole
}) => {
  const canManagePayments = ['super-admin', 'admin'].includes(userRole);

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
      <DataTable<Invoice>
        data={invoices.filter(i => paymentFilter === 'all' || i.status === paymentFilter)}
        title="Mes Paiements"
        columns={[
          { 
            header: 'Paiement', 
            accessor: (invoice) => (
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 rounded-xl text-primary">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="font-mono text-[10px] text-primary/70">{invoice.id}</p>
                  <p className="font-bold text-sm">{invoice.amount.toLocaleString()} FCFA</p>
                </div>
              </div>
            ),
            exportValue: (invoice) => `${invoice.amount} FCFA`
          },
          { header: 'Date', accessor: 'date', className: 'text-sm text-primary/70' },
          { 
            header: 'Statut', 
            accessor: (invoice) => (
              <StatusBadge status={invoice.status} />
            ),
            exportValue: (invoice) => invoice.status
          },
          {
            header: 'Action',
            accessor: (invoice) => {
              const order = orders.find(o => o.id === invoice.orderId);
              const isDelivered = order?.status === 'delivered';
              const canDownload = isDelivered || canManagePayments;
              
              return (
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (order && canDownload) generateInvoicePDF(order, true);
                    else toast.error("La facture n'est disponible qu'après la livraison.");
                  }}
                  className={`p-2 rounded-lg transition-all h-auto ${canDownload ? 'bg-slate-50 text-primary hover:bg-primary hover:text-white' : 'bg-slate-100 text-primary/70 cursor-not-allowed'}`}
                  title={canDownload ? "Télécharger la facture" : "Disponible après livraison"}
                >
                  <Download size={18} />
                </Button>
              );
            }
          }
        ]}
      />
    </div>
  );
};
