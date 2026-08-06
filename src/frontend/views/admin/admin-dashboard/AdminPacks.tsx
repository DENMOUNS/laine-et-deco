import React from 'react';
import { useAdminPacks } from './hooks/useAdminPacks';
import { useAdminStore } from '../../../../stores/adminStore';
import { DataTable } from '../../../components/DataTable';
import { ImageWithFallback } from '../../../components/ui/ImageWithFallback';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import type { Pack } from '../../../../types';

const formatDate = (val: any) => val ? new Date(val.seconds ? val.seconds * 1000 : val).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';


export function AdminPacks({ ctx }: { ctx: any }) {
  const {
    packs,
    togglePackStatus,
    deletePack
  } = useAdminPacks();

  const setModalType = useAdminStore((s) => s.setModalType);
  const setIsAddModalOpen = useAdminStore((s) => s.setIsAddModalOpen);
  const setEditingItem = useAdminStore((s) => s.setEditingItem);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => { setModalType('pack'); setIsAddModalOpen(true); }}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg"
        >
          + Ajouter un Pack
        </button>
      </div>
      <DataTable<Pack>
        dateFilterKey="createdAt"
        data={packs}
        onRowClick={(p) => { setEditingItem(p); setModalType('pack'); }}
        onDelete={(item) => deletePack(item.id!, item.name)}
        title="Packs"
        columns={[
          { 
            header: 'Image', 
            accessor: (p: Pack) => (
              <ImageWithFallback 
                src={p.coverImage || (p.products?.[0] as any)?.image} 
                alt={p.name} 
                className="w-12 h-12 rounded-xl object-cover shadow-sm border border-primary/10"
              />
            )
          },
          { header: 'Nom', accessor: 'name', className: 'font-bold', sortable: true },
          { 
            header: 'Produits', 
            accessor: (p: Pack) => p.products.length, 
            className: 'text-center font-bold',
            sortable: true,
            sortKey: 'products'
          },
          { header: 'Code Promo', accessor: 'promoCode', className: 'font-mono text-accent', sortable: true },
          { 
            header: 'Réduction', 
            accessor: (p) => `${p.discountPercentage}%`, 
            className: 'text-right',
            sortable: true,
            sortKey: 'discountPercentage'
          },
          { 
            header: 'Statut', 
            accessor: (pack: Pack) => (
              <button 
                onClick={async (e) => {
                  e.stopPropagation();
                  await togglePackStatus(pack.id!, pack.status, pack.name);
                }}
              >
                <StatusBadge status={pack.status || 'active'} />
              </button>
            ),
            sortable: true,
            sortKey: 'status'
          },
          {
            header: 'Actions',
            accessor: (pack: Pack) => (
              <div className="flex gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); setEditingItem(pack); setModalType('pack'); }}
                  className="text-primary font-bold text-sm hover:underline"
                >
                  Modifier
                </button>
              </div>
            )
          },
          { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt || item.date || item.subscribedAt || item.sentAt || new Date().toISOString()), className: 'text-primary/60 text-sm', sortable: true }
        ]}
      />
    </div>
  );
}
