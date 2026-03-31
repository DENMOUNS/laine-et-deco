import React from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import { Coupon } from '../../types';
import { COUPONS } from '../../constants';
import { toast } from 'sonner';

export const AdminCoupons: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif">Gestion des Coupons</h2>
        <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg">
          <Plus size={18} /> Nouveau Coupon
        </button>
      </div>
      <DataTable<Coupon> 
        data={COUPONS}
        title="Coupons de Réduction"
        columns={[
          { header: 'Code', accessor: 'code', className: 'font-mono font-bold text-primary' },
          { 
            header: 'Réduction', 
            accessor: (c: Coupon) => `${c.discount}${c.type === 'percentage' ? '%' : ' FCFA'}`,
            exportValue: (c: Coupon) => `${c.discount}${c.type === 'percentage' ? '%' : ' FCFA'}`
          },
          { header: 'Expiration', accessor: 'expiryDate' as any },
          { 
            header: 'Utilisation', 
            accessor: (c: Coupon) => (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <span>{c.usageCount} / {c.usageLimit}</span>
                  <span>{Math.round((c.usageCount / c.usageLimit) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all" 
                    style={{ width: `${(c.usageCount / c.usageLimit) * 100}%` }}
                  />
                </div>
              </div>
            ),
            exportValue: (c: Coupon) => `${c.usageCount} / ${c.usageLimit}`
          },
          { 
            header: 'Statut', 
            accessor: (c: Coupon) => (
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                c.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {c.status}
              </span>
            ),
            exportValue: (c: Coupon) => c.status
          },
          {
            header: 'Actions',
            accessor: (c: Coupon) => (
              <div className="flex gap-2">
                <button 
                  onClick={() => toast.success(`Coupon ${c.code} édité (simulé)`)}
                  className="text-primary font-bold text-sm hover:underline"
                >
                  Editer
                </button>
                <button 
                  onClick={() => toast.success(`Coupon ${c.code} supprimé (simulé)`)}
                  className="text-red-500 font-bold text-sm hover:underline"
                >
                  Supprimer
                </button>
              </div>
            )
          }
        ]}
      />
    </div>
  );
};
