import React from 'react';
import { Plus, Settings, X } from 'lucide-react';
import { useAdminCategories } from './hooks/useAdminCategories';
import { useAdminStore } from '../../../../stores/adminStore';
import { StatusBadge } from '../../../components/ui/StatusBadge';

export function AdminCategories({ ctx }: { ctx: any }) {
  const {
    categories,
    categoryPage,
    setCategoryPage,
    itemsPerPage,
    deleteCategory,
  } = useAdminCategories();

  const setModalType = useAdminStore((s) => s.setModalType);
  const setEditingItem = useAdminStore((s) => s.setEditingItem);
  const setActiveTab = useAdminStore((s) => s.setActiveTab);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-serif font-bold text-primary">Gestion des Catégories</h3>
        <button 
          onClick={() => { setModalType('category'); setEditingItem(null); setActiveTab('category-create'); }}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg"
        >
          <Plus size={18} /> Nouvelle catégorie
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.slice((categoryPage - 1) * itemsPerPage, categoryPage * itemsPerPage).map(cat => (
          <div 
            key={cat.id} 
            onClick={() => { setEditingItem(cat); setModalType('category'); setActiveTab('category-edit'); }}
            className="bg-card flex items-center gap-4 p-6 border border-primary/10 rounded-[2rem] shadow-sm hover:border-accent transition-all group cursor-pointer"
          >
            <img src={cat.image} alt={cat.name} className="w-20 h-20 object-cover rounded-2xl shadow-sm" referrerPolicy="no-referrer" />
            <div className="flex-grow">
              <h4 className="font-serif font-bold text-primary">{cat.name}</h4>
              <p className="text-xs text-primary/60 font-medium">{cat.count} produits</p>
              <div className="mt-2">
                <StatusBadge status={cat.status || 'active'} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button className="p-2 text-primary/20 group-hover:text-primary transition-colors">
                <Settings size={18} />
              </button>
              <button 
                onClick={async (e) => {
                  e.stopPropagation();
                  await deleteCategory(cat.id!, cat.name);
                }}
                className="p-2 text-primary/20 group-hover:text-accent transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {categories.length > itemsPerPage && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: Math.ceil(categories.length / itemsPerPage) }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => setCategoryPage(n)}
              className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${categoryPage === n ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-card border border-primary/10 text-primary/60 hover:border-primary hover:text-primary'}`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
