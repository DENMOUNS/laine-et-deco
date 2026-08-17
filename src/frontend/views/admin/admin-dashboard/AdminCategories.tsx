import React from 'react';
import { Plus } from 'lucide-react';
import { useAdminCategories } from './hooks/useAdminCategories';
import { useAdminStore } from '../../../../stores/adminStore';
import { DataTable } from '../../../components/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { ImageWithFallback } from '../../../components/ui/ImageWithFallback';
import type { Category } from '../../../../types';

const formatDate = (val: any) => {
  if (!val) return '-';
  try {
    if (typeof val?.toDate === 'function') {
      return val.toDate().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    if (typeof val === 'object') {
      const secs = val.seconds ?? val._seconds;
      if (typeof secs === 'number') {
        return new Date(secs * 1000).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
      }
    }
    if (typeof val === 'number') {
      return new Date(val).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    if (typeof val === 'string') {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
      }
    }
    return '-';
  } catch {
    return '-';
  }
};

export function AdminCategories({ ctx }: { ctx: any }) {
  const {
    categories,
    deleteCategory,
  } = useAdminCategories();

  const setModalType = useAdminStore((s) => s.setModalType);
  const setEditingItem = useAdminStore((s) => s.setEditingItem);
  const setActiveTab = useAdminStore((s) => s.setActiveTab);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-serif font-bold text-primary">Gestion des Catégories</h3>
        <button 
          onClick={() => { setModalType('category'); setEditingItem(null); setActiveTab('category-create'); }}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg text-sm sm:text-base"
        >
          <Plus size={18} /> Nouvelle catégorie
        </button>
      </div>

      <DataTable<Category>
        dateFilterKey="createdAt"
        data={categories}
        onRowClick={(cat) => { setEditingItem(cat); setModalType('category'); setActiveTab('category-edit'); }}
        title="Catégories"
        columns={[
          { 
            header: 'Image', 
            accessor: (cat: Category) => (
              <ImageWithFallback 
                src={cat.image} 
                alt={cat.name} 
                className="w-12 h-12 rounded-xl object-cover shadow-sm border border-primary/10"
              />
            ) 
          },
          { header: 'Nom', accessor: 'name', className: 'font-serif font-bold text-primary', sortable: true },
          { 
            header: 'Produits', 
            accessor: (cat: Category) => `${cat.count ?? 0} produit(s)`, 
            className: 'text-sm text-primary/70 font-medium',
            sortable: true,
            sortKey: 'count'
          },
          { 
            header: 'Statut', 
            accessor: (cat: Category) => <StatusBadge status={cat.status || 'active'} />,
            sortable: true,
            sortKey: 'status'
          },
          {
            header: 'Actions',
            accessor: (cat: Category) => (
              <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                <button 
                  type="button"
                  onClick={() => { 
                    setEditingItem(cat); 
                    setModalType('category'); 
                    setActiveTab('category-edit'); 
                  }}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-lg font-bold text-xs hover:bg-primary hover:text-white transition-all cursor-pointer"
                >
                  Modifier
                </button>
                <button 
                  type="button"
                  onClick={() => { 
                    deleteCategory(cat.id!, cat.name); 
                  }}
                  className="px-3 py-1 bg-rose-500/10 text-rose-600 rounded-lg font-bold text-xs hover:bg-rose-600 hover:text-white transition-all cursor-pointer"
                >
                  Supprimer
                </button>
              </div>
            )
          },
          { 
            header: 'Créé le', 
            accessor: (cat: any) => formatDate(cat.createdAt || cat.date || cat.updatedAt), 
            className: 'text-primary/60 text-sm', 
            sortable: true 
          }
        ]}
      />
    </div>
  );
}
