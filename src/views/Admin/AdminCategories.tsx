import React from 'react';
import { Plus, Settings, X } from 'lucide-react';
import { Category } from '../../types';
import { toast } from 'sonner';

interface AdminCategoriesProps {
  localCategories: Category[];
  categoryPage: number;
  setCategoryPage: (page: number) => void;
  itemsPerPage: number;
  setModalType: (type: any) => void;
  setIsAddModalOpen: (open: boolean) => void;
  setEditingItem: (item: any) => void;
  setLocalCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({
  localCategories,
  categoryPage,
  setCategoryPage,
  itemsPerPage,
  setModalType,
  setIsAddModalOpen,
  setEditingItem,
  setLocalCategories,
}) => {
  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-serif font-bold text-primary">Gestion des Catégories</h3>
        <button 
          onClick={() => { setModalType('category'); setIsAddModalOpen(true); }}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg"
        >
          <Plus size={18} /> Nouvelle catégorie
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {localCategories.slice((categoryPage - 1) * itemsPerPage, categoryPage * itemsPerPage).map(cat => (
          <div 
            key={cat.id} 
            onClick={() => { setEditingItem(cat); setModalType('category'); setIsAddModalOpen(true); }}
            className="bg-white flex items-center gap-4 p-6 border border-slate-100 rounded-[2rem] shadow-sm hover:border-accent transition-all group cursor-pointer"
          >
            <img src={cat.image} alt={cat.name} className="w-20 h-20 object-cover rounded-2xl shadow-sm" referrerPolicy="no-referrer" />
            <div className="flex-grow">
              <h4 className="font-serif font-bold text-slate-900">{cat.name}</h4>
              <p className="text-xs text-slate-400 font-medium">{cat.count} produits</p>
            </div>
            <div className="flex flex-col gap-2">
              <button className="p-2 text-slate-300 group-hover:text-primary transition-colors">
                <Settings size={18} />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toast.success(`Catégorie ${cat.name} supprimée (simulé)`);
                  setLocalCategories(prev => prev.filter(c => c.id !== cat.id));
                }}
                className="p-2 text-slate-300 group-hover:text-red-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {localCategories.length > itemsPerPage && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: Math.ceil(localCategories.length / itemsPerPage) }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => setCategoryPage(n)}
              className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${categoryPage === n ? 'bg-primary text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-400 hover:border-primary hover:text-primary'}`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
