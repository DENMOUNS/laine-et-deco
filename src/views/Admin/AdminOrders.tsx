import React from 'react';
import { 
  Search, Filter, Eye, Download, MoreVertical, 
  CheckCircle2, Clock, Truck, XCircle, Package 
} from 'lucide-react';
import { Order } from '../../types';

interface AdminOrdersProps {
  orders: Order[];
  filter: string;
  setFilter: (filter: string) => void;
  onView: (order: Order) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ 
  orders, filter, setFilter, onView 
}) => {
  const filteredOrders = orders.filter(o => filter === 'all' || o.status === filter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><CheckCircle2 size={12} />Livré</span>;
      case 'processing': return <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><Clock size={12} />En cours</span>;
      case 'shipped': return <span className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><Truck size={12} />Expédié</span>;
      case 'cancelled': return <span className="px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><XCircle size={12} />Annulé</span>;
      default: return <span className="px-4 py-1.5 bg-gray-50 text-gray-600 rounded-full text-[10px] font-bold uppercase tracking-widest">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div><h3 className="text-2xl font-serif font-bold text-gray-900">Gestion des Commandes</h3><p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">{orders.length} Commandes au total</p></div>
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Rechercher une commande..." className="pl-12 pr-6 py-3 bg-gray-50 border-none rounded-full w-full md:w-64 focus:ring-2 focus:ring-primary/20 text-sm" />
          </div>
          <button className="bg-gray-50 text-gray-600 px-6 py-3 rounded-full font-bold flex items-center gap-3 hover:bg-gray-100 transition-all border border-gray-100"><Download size={18} /><span>Exporter CSV</span></button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-wrap items-center justify-between gap-6 bg-gray-50/30">
          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-2xl">
            {['all', 'processing', 'shipped', 'completed', 'cancelled'].map((status) => (
              <button key={status} onClick={() => setFilter(status)} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${filter === status ? 'bg-white text-primary shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>{status === 'all' ? 'Toutes' : status}</button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Commande</th>
                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client</th>
                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</th>
                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-8 py-6"><p className="font-bold text-gray-900 group-hover:text-primary transition-colors">#{order.id.slice(0, 8)}</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{order.items.length} articles</p></td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs uppercase">{order.customerName.charAt(0)}</div>
                      <div><p className="text-sm font-bold text-gray-900">{order.customerName}</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{order.customerEmail}</p></div>
                    </div>
                  </td>
                  <td className="px-8 py-6"><p className="text-sm font-bold text-gray-600">{order.date}</p></td>
                  <td className="px-8 py-6"><p className="font-bold text-gray-900">{order.total}€</p></td>
                  <td className="px-8 py-6">{getStatusBadge(order.status)}</td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button onClick={() => onView(order)} className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all" title="Détails"><Eye size={16} /></button>
                      <button className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all" title="Imprimer facture"><Download size={16} /></button>
                      <button className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all" title="Plus"><MoreVertical size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
