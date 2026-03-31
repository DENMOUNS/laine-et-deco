import React from 'react';
import { 
  Search, Filter, User as UserIcon, Mail, 
  Phone, MapPin, Calendar, ShoppingBag, 
  MoreVertical, Edit2, Trash2, Eye 
} from 'lucide-react';
import { User as UserType } from '../../types';

interface AdminCustomersProps {
  customers: UserType[];
  filter: string;
  setFilter: (filter: string) => void;
  onView: (customer: UserType) => void;
  onEdit: (customer: UserType) => void;
  onDelete: (id: string) => void;
}

export const AdminCustomers: React.FC<AdminCustomersProps> = ({ 
  customers, filter, setFilter, onView, onEdit, onDelete 
}) => {
  const filteredCustomers = customers.filter(c => filter === 'all' || c.role === filter);

  return (
    <div className="space-y-8 p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div><h3 className="text-2xl font-serif font-bold text-gray-900">Gestion des Clients</h3><p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">{customers.length} Clients au total</p></div>
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Rechercher un client..." className="pl-12 pr-6 py-3 bg-gray-50 border-none rounded-full w-full md:w-64 focus:ring-2 focus:ring-primary/20 text-sm" />
          </div>
          <button className="bg-primary text-white px-8 py-3 rounded-full font-bold flex items-center gap-3 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"><span>Nouveau Client</span></button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-wrap items-center justify-between gap-6 bg-gray-50/30">
          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-2xl">
            {['all', 'client', 'admin'].map((role) => (
              <button key={role} onClick={() => setFilter(role)} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${filter === role ? 'bg-white text-primary shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>{role === 'all' ? 'Tous' : role}</button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client</th>
                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Commandes</th>
                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Dépensé</th>
                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg group-hover:scale-110 transition-transform">{customer.name.charAt(0)}</div>
                      <div><p className="font-bold text-gray-900 group-hover:text-primary transition-colors">{customer.name}</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">ID: {customer.id.slice(0, 8)}</p></div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-600"><Mail size={12} className="text-gray-400" />{customer.email}</div>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-400"><Phone size={12} className="text-gray-400" />+33 6 12 34 56 78</div>
                    </div>
                  </td>
                  <td className="px-8 py-6"><div className="flex items-center gap-2"><ShoppingBag size={14} className="text-gray-400" /><span className="text-sm font-bold text-gray-900">12</span></div></td>
                  <td className="px-8 py-6"><p className="font-bold text-gray-900">452.50€</p></td>
                  <td className="px-8 py-6"><span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest">Actif</span></td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button onClick={() => onView(customer)} className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all" title="Détails"><Eye size={16} /></button>
                      <button onClick={() => onEdit(customer)} className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all" title="Modifier"><Edit2 size={16} /></button>
                      <button onClick={() => onDelete(customer.id)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Supprimer"><Trash2 size={16} /></button>
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
