import React from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import { Pack } from '../../types';

interface AdminPacksProps {
  localPacks: Pack[];
  setModalType: (type: any) => void;
  setIsAddModalOpen: (open: boolean) => void;
  setEditingItem: (item: any) => void;
}

export const AdminPacks: React.FC<AdminPacksProps> = ({
  localPacks,
  setModalType,
  setIsAddModalOpen,
  setEditingItem,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif">Gestion des Packs</h2>
        <button 
          onClick={() => { setModalType('pack'); setIsAddModalOpen(true); }}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg"
        >
          <Plus size={18} /> Nouveau Pack
        </button>
      </div>
      <DataTable<Pack>
        data={localPacks}
        onRowClick={(pack) => { setEditingItem(pack); setModalType('pack'); setIsAddModalOpen(true); }}
        title="Liste des Packs"
        columns={[
          { header: 'Nom', accessor: 'name', className: 'font-bold' },
          { header: 'Description', accessor: 'description', className: 'text-slate-400 max-w-xs truncate' },
          { 
            header: 'Prix', 
            accessor: (p: Pack) => <span className="font-bold text-primary">{p.price.toLocaleString()} FCFA</span>,
            exportValue: (p: Pack) => p.price.toString()
          },
          { 
            header: 'Produits', 
            accessor: (p: Pack) => <span className="text-slate-500 font-medium">{p.products.length} produits</span>,
            exportValue: (p: Pack) => p.products.length.toString()
          },
          {
              header: 'Actions',
              accessor: (pack: Pack) => (
                  <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setEditingItem(pack); setModalType('pack'); setIsAddModalOpen(true); }} className="text-primary hover:text-accent font-bold text-sm">Modifier</button>
                  </div>
              )
          }
        ]}
      />
    </div>
  );
};
