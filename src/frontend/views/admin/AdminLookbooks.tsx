import React, { useState } from 'react';
import { Plus, Edit, Trash2, ChevronLeft, Camera } from 'lucide-react';
import { Lookbook, Product } from '../../../types';
import { DataTable } from '../../components/DataTable';
import { useEntity } from '../../hooks/useEntity';
import { ImageUpload } from '../../components/ui/ImageUpload';

interface AdminLookbooksProps {
  products: Product[];
}

export const AdminLookbooks: React.FC<AdminLookbooksProps> = ({ products }) => {
  const { data: lookbooks, addEntity, updateEntity, deleteEntity } = useEntity<Lookbook>('lookbook', []);
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit'>('list');
  const [editingItem, setEditingItem] = useState<Partial<Lookbook> | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.title || !editingItem?.image) return;

    if (activeTab === 'create') {
      await addEntity({
        ...editingItem,
        status: editingItem.status || 'active',
        products: editingItem.products || [],
        createdAt: new Date().toISOString(),
      } as Omit<Lookbook, 'id'>);
    } else if (activeTab === 'edit' && editingItem.id) {
      await updateEntity(editingItem.id, {
        ...editingItem,
        updatedAt: new Date().toISOString(),
      });
    }
    setActiveTab('list');
    setEditingItem(null);
  };

  const handleProductToggle = (productId: string) => {
    setEditingItem(prev => {
      const currentProducts = prev?.products || [];
      if (currentProducts.includes(productId)) {
        return { ...prev, products: currentProducts.filter(id => id !== productId) };
      } else {
        return { ...prev, products: [...currentProducts, productId] };
      }
    });
  };

  if (activeTab === 'create' || activeTab === 'edit') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => { setActiveTab('list'); setEditingItem(null); }} className="p-2 hover:bg-secondary/50 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-serif font-bold">
            {activeTab === 'create' ? 'Nouveau Lookbook' : 'Modifier Lookbook'}
          </h2>
        </div>

        <div className="bg-card p-8 rounded-[2rem] border border-primary/10 shadow-sm max-w-4xl mx-auto">
          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2 block">Titre</label>
                <input 
                  type="text" 
                  className="input-field"
                  value={editingItem?.title || ''}
                  onChange={e => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2 block">Image</label>
                <ImageUpload
                  name="image"
                  defaultValue={editingItem?.image || ''}
                  onChange={(dataUrl) => setEditingItem(prev => ({ ...prev, image: dataUrl }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2 block">Description courte</label>
                <textarea 
                  className="input-field min-h-[100px]"
                  value={editingItem?.description || ''}
                  onChange={e => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2 block">Statut</label>
                <select 
                  className="input-field"
                  value={editingItem?.status || 'active'}
                  onChange={e => setEditingItem(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
            </div>

            <div className="border-t border-primary/10 pt-8 mt-8">
              <h3 className="text-lg font-serif font-bold mb-4">Produits associés (Shop the look)</h3>
              <p className="text-primary/70 mb-6 text-sm">Sélectionnez les produits qui figurent sur cette image de lookbook.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-4 border border-primary/10 rounded-xl">
                {products.map(product => {
                  const isSelected = editingItem?.products?.includes(product.id);
                  return (
                    <div 
                      key={product.id}
                      onClick={() => handleProductToggle(product.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${isSelected ? 'border-accent bg-accent/10 shadow-sm' : 'border-primary/5 hover:border-primary/20'}`}
                    >
                      <img src={product.image} alt="" className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{product.name}</p>
                        <p className="text-xs text-primary/70">{product.price} FCFA</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'bg-accent border-accent text-white' : 'border-primary/20'}`}>
                        {isSelected && <span className="text-[10px]">✓</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-primary/10">
              <button 
                type="button" 
                onClick={() => setActiveTab('list')}
                className="flex-grow py-4 bg-secondary/50 text-primary/70 rounded-2xl font-bold hover:bg-secondary/70 transition-all"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="flex-grow py-4 bg-primary text-white rounded-2xl font-bold hover:bg-accent transition-all"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-serif font-bold text-primary">Lookbooks</h3>
        <button 
          onClick={() => { setActiveTab('create'); setEditingItem({ products: [] }); }}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg"
        >
          <Camera size={18} /> Ajouter Lookbook
        </button>
      </div>

      <DataTable<Lookbook>
        data={lookbooks}
        searchable={true}
        defaultSort={{ key: 'createdAt', direction: 'desc' }}
        columns={[
          { 
            header: 'Image', 
            accessor: (lb) => (
              <img src={lb.image} alt={lb.title} className="w-16 h-16 object-cover rounded-xl shadow-sm" referrerPolicy="no-referrer" />
            ) 
          },
          { header: 'Titre', accessor: 'title', sortable: true },
          { header: 'Produits associés', accessor: (lb) => `${lb.products.length} produits` },
          { 
            header: 'Statut', 
            accessor: (lb) => (
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${lb.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {lb.status === 'active' ? 'Actif' : 'Inactif'}
              </span>
            )
          },
          {
            header: 'Actions',
            accessor: (lb) => (
              <div className="flex gap-2 justify-end">
                <button onClick={(e) => { e.stopPropagation(); setEditingItem(lb); setActiveTab('edit'); }} className="p-2 text-primary hover:text-accent">
                  <Edit size={16} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); deleteEntity(lb.id); }} className="p-2 text-red-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            )
          }
        ]}
      />
    </div>
  );
};
