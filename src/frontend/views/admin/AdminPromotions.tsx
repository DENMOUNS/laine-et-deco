import React, { useState } from 'react';
import { Plus, Edit, Trash2, ChevronLeft, Sparkles, Globe, Loader2, Tag, Info } from 'lucide-react';
import { Promotion, Product } from '../../../types';
import { DataTable } from '../../components/DataTable';
import { useEntity } from '../../hooks/useEntity';
import { toast } from 'sonner';
import { translateContentWithAi } from '../../utils/aiTranslator';

interface AdminPromotionsProps {
  products: Product[];
}

export const AdminPromotions: React.FC<AdminPromotionsProps> = ({ products }) => {
  const { data: promotions, addEntity, updateEntity, deleteEntity } = useEntity<Promotion>('promotion', []);
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit'>('list');
  const [editingItem, setEditingItem] = useState<Partial<Promotion> | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!editingItem?.name?.trim()) {
      toast.error('Veuillez d\'abord saisir le nom de la promotion en français.');
      return;
    }
    setIsTranslating(true);
    try {
      const res = await translateContentWithAi(
        { 
          name: editingItem.name,
          description: editingItem.description || ''
        }, 
        'en', 
        'fr'
      );
      if (res?.name) {
        setEditingItem(prev => ({ 
          ...prev, 
          name_en: res.name,
          description_en: res.description || prev?.description_en
        }));
        toast.success('Traduction générée avec succès !');
      }
    } catch {
      toast.error('Erreur lors de la traduction.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.name || !editingItem?.endDate) {
      toast.error('Veuillez renseigner au minimum le nom et la date de fin de la promotion.');
      return;
    }

    if (activeTab === 'create') {
      await addEntity({
        ...editingItem,
        status: editingItem.status || 'active',
        items: editingItem.items || [],
        createdAt: new Date().toISOString(),
      } as Omit<Promotion, 'id'>);
      toast.success(`Promotion "${editingItem.name}" créée avec succès !`);
    } else if (activeTab === 'edit' && editingItem.id) {
      await updateEntity(editingItem.id, {
        ...editingItem,
        updatedAt: new Date().toISOString(),
      });
      toast.success(`Promotion "${editingItem.name}" mise à jour !`);
    }
    setActiveTab('list');
    setEditingItem(null);
  };

  const handleAddItem = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    setEditingItem(prev => {
      const items = prev?.items || [];
      if (items.find(i => i.productId === productId)) {
        toast.info('Ce produit est déjà dans la promotion.');
        return prev;
      }
      
      // Si le produit a déjà un prix promotionnel, c'est ce prix qui est utilisé par défaut.
      // Si le produit n'a pas de prix promotionnel, on propose le prix standard pour permettre de fixer le prix promotionnel souhaité.
      const hasExistingPromo = typeof product.promoPrice === 'number' && product.promoPrice > 0 && product.promoPrice < product.price;
      const promoPrice = hasExistingPromo ? product.promoPrice! : product.price;
      const discountPercentage = hasExistingPromo 
        ? Math.max(1, Math.round((1 - product.promoPrice! / product.price) * 100))
        : 0;
      
      return {
        ...prev,
        items: [
          ...items,
          {
            productId,
            promoPrice,
            discountPercentage
          }
        ]
      };
    });
  };

  const handleRemoveItem = (productId: string) => {
    setEditingItem(prev => ({
      ...prev,
      items: prev?.items?.filter(i => i.productId !== productId) || []
    }));
  };

  const handleUpdateItem = (productId: string, field: 'promoPrice' | 'discountPercentage', value: number) => {
    setEditingItem(prev => ({
      ...prev,
      items: prev?.items?.map(i => {
        if (i.productId !== productId) return i;
        const product = products.find(p => p.id === productId);
        if (!product) return i;

        if (field === 'discountPercentage') {
          const discount = Math.max(1, Math.min(99, value));
          const calculatedPrice = Math.round(product.price * (1 - discount / 100));
          return { ...i, discountPercentage: discount, promoPrice: calculatedPrice };
        } else {
          const newPrice = Math.max(0, value);
          const calculatedDiscount = Math.round((1 - newPrice / product.price) * 100);
          return { ...i, promoPrice: newPrice, discountPercentage: calculatedDiscount };
        }
      }) || []
    }));
  };

  if (activeTab === 'create' || activeTab === 'edit') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button 
            type="button"
            onClick={() => { setActiveTab('list'); setEditingItem(null); }} 
            className="p-2 hover:bg-secondary/50 rounded-full transition-colors cursor-pointer"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-serif font-bold text-primary">
              {activeTab === 'create' ? 'Créer une Promotion' : 'Modifier la Promotion'}
            </h2>
            <p className="text-xs text-primary/70">
              La promotion s'applique à toute la quantité en stock disponible jusqu'à sa date de fin.
            </p>
          </div>
        </div>

        <div className="bg-card p-6 sm:p-8 rounded-[2rem] border border-primary/10 shadow-sm max-w-4xl mx-auto">
          {/* Bannière explicative */}
          <div className="bg-amber-500/10 border border-amber-500/20 text-primary p-4 rounded-2xl mb-6 flex items-start gap-3">
            <Info size={20} className="text-accent shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-accent">Règle de gestion des Promotions :</p>
              <p className="text-primary/80">
                Contrairement à une <strong>Vente Flash</strong> (dont le stock est contingenté à un quota fixe), la <strong>Promotion</strong> s'applique automatiquement à <strong>tous les exemplaires</strong> d'un produit en stock jusqu'à l'expiration de la promotion.
              </p>
            </div>
          </div>

          {/* Translation Bar */}
          <div className="flex items-center justify-between bg-accent/5 p-4 rounded-2xl border border-accent/20 mb-6">
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-accent" />
              <span className="text-sm font-bold text-primary">Traduction automatique IA</span>
            </div>
            <button
              type="button"
              onClick={handleTranslate}
              disabled={isTranslating}
              className="px-3.5 py-1.5 bg-accent text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow hover:bg-accent/90 transition-all cursor-pointer disabled:opacity-50"
            >
              {isTranslating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              {isTranslating ? 'Traduction...' : 'Traduire en Anglais'}
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2 block">
                  Nom de la promotion (FR) *
                </label>
                <input 
                  type="text" 
                  className="input-field"
                  placeholder="Ex: Soldes d'Automne, Promo Rentrée Tricot..."
                  value={editingItem?.name || ''}
                  onChange={e => setEditingItem(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-1 mb-2">
                  <Globe size={12} /> Nom en anglais (EN)
                </label>
                <input 
                  type="text" 
                  className="input-field border-accent/40 focus:border-accent"
                  value={editingItem?.name_en || ''}
                  placeholder="Ex: Autumn Special Sale..."
                  onChange={e => setEditingItem(prev => ({ ...prev, name_en: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2 block">
                  Date de début (optionnelle)
                </label>
                <input 
                  type="datetime-local" 
                  className="input-field"
                  value={editingItem?.startDate ? new Date(editingItem.startDate).toISOString().slice(0, 16) : ''}
                  onChange={e => setEditingItem(prev => ({ 
                    ...prev, 
                    startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined 
                  }))}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2 block">
                  Date de fin *
                </label>
                <input 
                  type="datetime-local" 
                  className="input-field"
                  value={editingItem?.endDate ? new Date(editingItem.endDate).toISOString().slice(0, 16) : ''}
                  onChange={e => setEditingItem(prev => ({ ...prev, endDate: new Date(e.target.value).toISOString() }))}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2 block">
                  Description / Sous-titre (optionnel)
                </label>
                <input 
                  type="text" 
                  className="input-field"
                  placeholder="Ex: Profitez de nos remises exceptionnelles sur une sélection de laines..."
                  value={editingItem?.description || ''}
                  onChange={e => setEditingItem(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2 block">
                  Statut
                </label>
                <select 
                  className="input-field"
                  value={editingItem?.status || 'active'}
                  onChange={e => setEditingItem(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                >
                  <option value="active">Active (Visible immédiatement)</option>
                  <option value="inactive">Inactive (Brouillon / Suspendue)</option>
                </select>
              </div>
            </div>

            {/* Sélection des produits */}
            <div className="border-t border-primary/10 pt-8 mt-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-serif font-bold text-primary flex items-center gap-2">
                    <Tag size={18} className="text-accent" />
                    Produits inclus dans la Promotion
                  </h3>
                  <p className="text-xs text-primary/60">
                    Ajoutez les produits soumis à cette promotion et définissez leur prix réduit ou pourcentage.
                  </p>
                </div>
                <span className="text-xs font-bold bg-primary/5 px-3 py-1 rounded-full text-primary">
                  {editingItem?.items?.length || 0} produit(s)
                </span>
              </div>
              
              <div className="mb-6">
                <label className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-2 block">
                  Ajouter un produit du catalogue
                </label>
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
                  <option value="" disabled>Sélectionner un produit à ajouter à la promotion...</option>
                  {products.map(p => {
                    const hasPromo = typeof p.promoPrice === 'number' && p.promoPrice > 0 && p.promoPrice < p.price;
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.price.toLocaleString('fr-FR')} FCFA {hasPromo ? `(Prix promo actuel: ${p.promoPrice?.toLocaleString('fr-FR')} FCFA)` : ''} (Stock: {p.stock})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="space-y-3">
                {(editingItem?.items || []).map(item => {
                  const product = products.find(p => p.id === item.productId);
                  if (!product) return null;
                  
                  return (
                    <div 
                      key={item.productId} 
                      className="flex flex-col md:flex-row gap-4 items-center p-4 bg-secondary/20 rounded-2xl border border-primary/5 hover:border-primary/15 transition-all"
                    >
                      <div className="flex-grow flex items-center gap-3 w-full md:w-auto">
                        <img 
                          src={product.image} 
                          className="w-12 h-12 object-cover rounded-xl border border-black/5" 
                          alt="" 
                          referrerPolicy="no-referrer" 
                        />
                        <div>
                          <p className="font-bold text-sm text-primary">{product.name}</p>
                          <p className="text-xs text-primary/70">
                            Prix catalogue : <span className="font-semibold">{product.price.toLocaleString('fr-FR')} FCFA</span> (Stock : {product.stock})
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-primary/70 block mb-1">
                            Réduction (%)
                          </label>
                          <input 
                            type="number" 
                            className="input-field py-2 w-24 text-center font-bold" 
                            min={1}
                            max={99}
                            value={item.discountPercentage || Math.round((1 - item.promoPrice / product.price) * 100)}
                            onChange={(e) => handleUpdateItem(item.productId, 'discountPercentage', Number(e.target.value))}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-bold text-primary/70 block mb-1">
                            Prix Promo (FCFA)
                          </label>
                          <input 
                            type="number" 
                            className="input-field py-2 w-32 font-bold text-accent" 
                            min={1}
                            max={product.price - 1}
                            value={item.promoPrice}
                            onChange={e => handleUpdateItem(item.productId, 'promoPrice', Number(e.target.value))}
                          />
                        </div>

                        <button 
                          type="button"
                          onClick={() => handleRemoveItem(item.productId)}
                          className="p-2.5 text-primary/60 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all mt-4 md:mt-0 cursor-pointer"
                          title="Retirer ce produit de la promotion"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {(!editingItem?.items || editingItem.items.length === 0) && (
                  <div className="text-center py-8 bg-secondary/10 rounded-2xl border border-dashed border-primary/15">
                    <Tag size={28} className="mx-auto text-primary/40 mb-2" />
                    <p className="text-primary/70 text-sm italic">
                      Aucun produit sélectionné pour le moment. Choisissez un produit ci-dessus pour l'ajouter.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t border-primary/10">
              <button 
                type="button" 
                onClick={() => { setActiveTab('list'); setEditingItem(null); }}
                className="flex-grow py-3.5 bg-secondary/50 text-primary rounded-2xl font-bold hover:bg-secondary/70 transition-all cursor-pointer"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="flex-grow py-3.5 bg-primary text-white rounded-2xl font-bold hover:bg-accent transition-all shadow-md cursor-pointer"
              >
                Enregistrer la Promotion
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-serif font-bold text-primary flex items-center gap-2">
            <Tag size={24} className="text-accent" />
            Gestion des Promotions
          </h3>
          <p className="text-xs text-primary/70">
            Créez des campagnes de promotions nommées applicables à toute la quantité en stock jusqu'à leur date d'expiration.
          </p>
        </div>
        <button 
          onClick={() => { setActiveTab('create'); setEditingItem({}); }}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-md cursor-pointer text-sm"
        >
          <Plus size={18} /> Nouvelle Promotion
        </button>
      </div>

      <DataTable<Promotion>
        data={promotions}
        searchable={true}
        defaultSort={{ key: 'endDate', direction: 'desc' }}
        columns={[
          { 
            header: 'Nom de la Promotion', 
            accessor: (p) => (
              <div>
                <p className="font-bold text-primary">{p.name}</p>
                {p.name_en && <p className="text-xs text-primary/50 italic">{p.name_en}</p>}
              </div>
            ), 
            sortable: true 
          },
          { 
            header: 'Période de validité', 
            accessor: (p) => {
              const start = p.startDate ? new Date(p.startDate).toLocaleDateString('fr-FR') : 'Immédiat';
              const end = new Date(p.endDate).toLocaleDateString('fr-FR');
              const isExpired = new Date(p.endDate) < new Date();
              return (
                <div className="text-xs">
                  <p className="font-medium text-primary">Du {start} au {end}</p>
                  {isExpired && <span className="text-red-500 font-semibold">(Expirée)</span>}
                </div>
              );
            }, 
            sortable: true 
          },
          { 
            header: 'Produits', 
            accessor: (p) => (
              <span className="font-semibold text-xs px-2.5 py-1 bg-secondary/50 rounded-lg">
                {p.items?.length || 0} produit(s)
              </span>
            )
          },
          { 
            header: 'Statut', 
            accessor: (p) => {
              const isExpired = new Date(p.endDate) < new Date();
              const isEffectiveActive = p.status === 'active' && !isExpired;
              return (
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isEffectiveActive 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' 
                    : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                }`}>
                  {isEffectiveActive ? 'Active' : isExpired ? 'Expirée' : 'Inactive'}
                </span>
              );
            }
          },
          {
            header: 'Actions',
            accessor: (p) => (
              <div className="flex gap-2 justify-end">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setEditingItem(p); 
                    setActiveTab('edit'); 
                  }} 
                  className="p-2 text-primary hover:text-accent rounded-lg hover:bg-secondary/40 transition-colors cursor-pointer"
                  title="Modifier la promotion"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (window.confirm(`Supprimer définitivement la promotion "${p.name}" ?`)) {
                      deleteEntity(p.id); 
                    }
                  }} 
                  className="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                  title="Supprimer la promotion"
                >
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
