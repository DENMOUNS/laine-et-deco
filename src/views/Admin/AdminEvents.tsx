import React from 'react';
import { DataTable } from '../../components/DataTable';
import { PromoEvent } from '../../types';
import { Calendar as CalendarIcon, Plus, Settings, X } from 'lucide-react';

interface AdminEventsProps {
  events: PromoEvent[];
  setModalType: (type: any) => void;
  setIsAddModalOpen: (open: boolean) => void;
  setEditingItem: (item: any) => void;
}

export const AdminEvents: React.FC<AdminEventsProps> = ({
  events,
  setModalType,
  setIsAddModalOpen,
  setEditingItem,
}) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-serif flex items-center gap-3 text-slate-900">
          <CalendarIcon className="text-accent" size={24} /> Évènements Promotionnels
        </h3>
        <button 
          onClick={() => { setModalType('event'); setIsAddModalOpen(true); }}
          className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-md"
        >
          <Plus size={18} /> Créer un évènement
        </button>
      </div>
      <DataTable<PromoEvent>
        data={events}
        title="Évènements Promotionnels"
        columns={[
          { header: 'Nom', accessor: 'name', className: 'font-bold' },
          { 
            header: 'Période', 
            accessor: (e) => (
              <div className="text-xs text-slate-500">
                <div>Du {new Date(e.startDate).toLocaleString()}</div>
                <div>Au {new Date(e.endDate).toLocaleString()}</div>
              </div>
            )
          },
          { header: 'Remise', accessor: (e) => <span className="text-accent font-bold">-{e.discountPercentage}%</span> },
          { 
            header: 'Portée', 
            accessor: (e) => e.applyToAll ? 'Tous les produits' : `${e.productIds?.length || 0} produits`
          },
          {
            header: 'Statut',
            accessor: (e) => (
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                e.status === 'active' ? 'bg-green-100 text-green-600' :
                e.status === 'scheduled' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
              }`}>
                {e.status === 'active' ? 'En cours' : e.status === 'scheduled' ? 'Planifié' : 'Terminé'}
              </span>
            )
          },
          {
            header: 'Actions',
            accessor: (e) => (
              <div className="flex gap-2">
                <button onClick={() => { setModalType('event'); setEditingItem(e); setIsAddModalOpen(true); }} className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"><Settings size={16} /></button>
                <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><X size={16} /></button>
              </div>
            )
          }
        ]}
      />
    </div>
  );
};
