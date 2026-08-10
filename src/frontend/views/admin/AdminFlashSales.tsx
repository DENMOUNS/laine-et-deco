import React, { useState } from 'react';
import { Plus, Edit, Trash2, X, ChevronLeft, Search } from 'lucide-react';
import { FlashSale, Product } from '../../../types';
import { DataTable } from '../../components/DataTable';
import { useEntity } from '../../hooks/useEntity';

interface AdminFlashSalesProps {
  products: Product[];
}

export const AdminFlashSales: React.FC<AdminFlashSalesProps> = ({ products }) => {
  const { data: flashSales, setData: setFlashSales, addEntity, updateEntity, deleteEntity } = useEntity<FlashSale>('flash_sale', []);
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit'>('list');
  const [editingItem, setEditingItem] = useState<Partial<FlashSale> | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.name || !editingItem?.endDate) return;

    if (activeTab === 'create') {
      await addEntity({
        ...editingItem,
        status: editingItem.status || 'active',
        items: editingItem.items || [],
        createdAt: new Date().toISOString(),
      } as Omit<FlashSale, 'id'>);
    } else if (activeTab === 'edit' && editingItem.id) {
      await updateEntity(editingItem.id, {
        ...editingItem,
        updatedAt: new Date().toISOString(),
      });
    }
    setActiveTab('list');
    setEditingItem(null);
  };

  const handleAddItem = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    setEditingItem(prev => {
      const items = prev?.items || [];
      if (items.find(i => i.productId === productId)) return prev;
      
      const discountPercentage = 20; // Default 20% discount
      const flashPrice = Math.round(product.price * (1 - discountPercentage / 100));
      
      return {
        ...prev,
        items: [
          ...items,
          {
            productId,
            flashPrice,
            discountPercentage,
            totalQuantity: Math.min(5, product.stock),
            soldQuantity: 0
          }
        ]
      }
    });
  };

  const handleRemoveItem = (productId: string) => {
    setEditingItem(prev => ({
      ...prev,
      items: prev?.items?.filter(i => i.productId !== productId) || []
    }));
  };

  const handleUpdateItem = (productId: string, field: string, value: number) => {
    setEditingItem(prev => ({
      ...prev,
      items: prev?.items?.map(i => i.productId === productId ? { ...i, [field]: value } : i) || []
    }));
  };

  if (activeTab === 'create' || activeTab === 'edit') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => { setActiveTab('list'); setEditingItem(null); }} className="p-2 hover:bg-secondary/50 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-serif font-bold">
            {activeTab === 'create' ? 'Nouvelle Vente Flash' : 'Modifier la Vente Flash'}
          </h2>
        </div>

        <div className="bg-card p-8 rounded-[2rem] border border-primary/10 shadow-sm max-w-4xl mx-auto">
          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2 block">Nom de la vente flash</label>
                <input 
                  type="text" 
                  className="input-field"
                  value={editingItem?.name || ''}
                  onChange={e => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2 block">Date de fin</label>
                <input 
                  type="datetime-local" 
                  className="input-field"
                  value={editingItem?.endDate ? new Date(editingItem.endDate).toISOString().slice(0, 16) : ''}
                  onChange={e => setEditingItem(prev => ({ ...prev, endDate: new Date(e.target.value).toISOString() }))}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2 block">Statut</label>
                <select 
                  className="input-field"
                  value={editingItem?.status || 'active'}
                  onChange={e => setEditingItem(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="border-t border-primary/10 pt-8 mt-8">
              <h3 className="text-lg font-serif font-bold mb-4">Produits en Vente Flash</h3>
              
              <div className="mb-6">
                <label className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2 block">Ajouter un produit</label>
                <select 
                  className="input-field"
                  onChange={e => {
                    if (e.target.value) {
                      handleAddItem(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Sélectionner un produit...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - Stock: {p.stock} - {p.price} FCFA</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                {(editingItem?.items || []).map(item => {
                  const product = products.find(p => p.id === item.productId);
                  if (!product) return null;
                  
                  return (
                    <div key={item.productId} className="flex flex-col md:flex-row gap-4 items-center p-4 bg-secondary/20 rounded-xl border border-primary/5">
                      <div className="flex-grow flex items-center gap-3">
                        <img src={product.image} className="w-10 h-10 object-cover rounded-lg" alt="" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-bold">{product.name}</p>
                          <p className="text-xs text-primary/70">Prix normal: {product.price} FCFA</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4">
                        <div>
                          <label className="text-[10px] uppercase text-primary/70 block">Réduction (%)</label>
                          <input 
                            type="number" 
                            className="input-field py-2 w-24" 
                            min={1}
                            max={99}
                            value={item.discountPercentage || Math.round((1 - item.flashPrice / product.price) * 100)}
                            onChange={(e) => {
                              const discount = Number(e.target.value);
                              const newFlashPrice = Math.round(product.price * (1 - discount / 100));
                              handleUpdateItem(item.productId, 'discountPercentage', discount);
                              handleUpdateItem(item.productId, 'flashPrice', newFlashPrice);
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase text-primary/70 block">Prix Flash (FCFA)</label>
                          <input 
                            type="number" 
                            className="input-field py-2 w-32" 
                            value={item.flashPrice}
                            onChange={e => {
                              const newFlashPrice = Number(e.target.value);
                              const discount = Math.round((1 - newFlashPrice / product.price) * 100);
                              handleUpdateItem(item.productId, 'flashPrice', newFlashPrice);
                              handleUpdateItem(item.productId, 'discountPercentage', discount);
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase text-primary/70 block">Quantité max</label>
                          <input 
                            type="number" 
                            className="input-field py-2 w-24" 
                            value={item.totalQuantity}
                            max={product.stock}
                            onChange={e => handleUpdateItem(item.productId, 'totalQuantity', Number(e.target.value))}
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={() => handleRemoveItem(item.productId)}
                          className="p-2 text-primary/70 hover:text-red-500 mt-4"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {(!editingItem?.items || editingItem.items.length === 0) && (
                  <p className="text-primary/70 text-sm italic text-center py-4">Aucun produit ajouté</p>
                )}
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
        <h3 className="text-2xl font-serif font-bold text-primary">Ventes Flash</h3>
        <button 
          onClick={() => { setActiveTab('create'); setEditingItem({}); }}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg"
        >
          <Plus size={18} /> Nouvelle Vente Flash
        </button>
      </div>

      <DataTable<FlashSale>
        data={flashSales}
        searchable={true}
        defaultSort={{ key: 'endDate', direction: 'desc' }}
        columns={[
          { header: 'Nom', accessor: 'name', sortable: true },
          { header: 'Date de fin', accessor: (fs) => new Date(fs.endDate).toLocaleString('fr-FR'), sortable: true },
          { header: 'Produits', accessor: (fs) => `${fs.items.length} produits` },
          { 
            header: 'Statut', 
            accessor: (fs) => (
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${fs.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {fs.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            )
          },
          {
            header: 'Actions',
            accessor: (fs) => (
              <div className="flex gap-2 justify-end">
                <button onClick={(e) => { e.stopPropagation(); setEditingItem(fs); setActiveTab('edit'); }} className="p-2 text-primary hover:text-accent">
                  <Edit size={16} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); deleteEntity(fs.id); }} className="p-2 text-red-400 hover:text-red-600">
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
