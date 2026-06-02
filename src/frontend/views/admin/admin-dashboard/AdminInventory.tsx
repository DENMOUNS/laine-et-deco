import React from 'react';
import { Plus, History, Edit, ChevronLeft } from 'lucide-react';
import { useAdminInventory } from './hooks/useAdminInventory';
import { useProductStockTransactions } from './hooks/useProductStockTransactions';
import { useAdminStore } from '../../../../stores/adminStore';
import { DataTable } from '../../../components/DataTable';
import { cn } from '../../../utils/utils';
import type { Product } from '../../../../types';

const formatDate = (val: any) => val ? new Date(val.seconds ? val.seconds * 1000 : val).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';


export function AdminInventory({ ctx }: { ctx: any }) {
  const {
    products,
    outOfStockCount,
    lowStockCount,
    totalStockValue,
    updateProductStockStatus
  } = useAdminInventory();

  const setModalType = useAdminStore((s) => s.setModalType);
  const setIsAddModalOpen = useAdminStore((s) => s.setIsAddModalOpen);
  const setEditingItem = useAdminStore((s) => s.setEditingItem);
  const setActiveTab = useAdminStore((s) => s.setActiveTab);
  const activeTab = useAdminStore((s) => s.activeTab);
  const editingItem = useAdminStore((s) => s.editingItem);

  return (
    <>
      {activeTab === 'inventory' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card p-8 rounded-[2rem] border border-primary/10 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Produits en Rupture</p>
              <p className="text-3xl font-serif font-bold text-primary">{outOfStockCount}</p>
            </div>
            <div className="bg-card p-8 rounded-[2rem] border border-primary/10 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Stock Faible (&lt; 10)</p>
              <p className="text-3xl font-serif font-bold text-accent">{lowStockCount}</p>
            </div>
            <div className="bg-card p-8 rounded-[2rem] border border-primary/10 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Valeur du Stock</p>
              <p className="text-3xl font-serif font-bold text-primary">
                {totalStockValue.toLocaleString()} FCFA
              </p>
            </div>
          </div>

          <div className="bg-card rounded-[2rem] shadow-sm border border-primary/10 overflow-hidden">
            <div className="p-8 border-b border-primary/5 flex justify-between items-center">
              <h3 className="text-xl font-serif font-bold text-primary">État des Stocks</h3>
              <button 
                onClick={() => { setModalType('inventory-adjustment'); setIsAddModalOpen(true); setEditingItem(null); }} 
                className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-accent transition-all"
              >
                <Plus size={18} /> Réapprovisionner
              </button>
            </div>
            <DataTable<Product>
              dateFilterKey="createdAt"
              searchable={true}
              defaultSort={{ key: 'createdAt', direction: 'desc' }}
              data={products}
              onRowClick={(p) => { setEditingItem(p); setActiveTab('inventory-detail'); }}
              columns={[
                { header: 'Produit', accessor: 'name', sortable: true },
                { header: 'Catégorie', accessor: 'category' as any, sortable: true },
                { 
                  header: 'Stock', 
                  accessor: (p: Product) => <span className="font-bold text-primary text-lg">{p.stock || 0}</span>, 
                  sortable: true, 
                  sortKey: 'stock' 
                },
                { 
                  header: 'État', 
                  accessor: (p: Product) => (
                    <div onClick={(e) => e.stopPropagation()}>
                      <select
                        value={p.in_stock ? 'in' : 'out'}
                        onChange={async (e) => {
                          const in_stock = e.target.value === 'in';
                          await updateProductStockStatus(p.id!, in_stock);
                        }}
                        className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full outline-none cursor-pointer text-center",
                          p.in_stock ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                        )}
                      >
                        <option value="in">En stock</option>
                        <option value="out">En rupture</option>
                      </select>
                    </div>
                  )
                },
                { header: 'Prix', accessor: (p: Product) => `${Number(p.price || 0).toLocaleString()} FCFA`, sortable: true, sortKey: 'price' },
                { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt || item.date || item.subscribedAt || item.sentAt || new Date().toISOString()), className: 'text-primary/60 text-sm', sortable: true },
                {
                  header: 'Actions',
                  accessor: (p: Product) => (
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => { setEditingItem(p); setActiveTab('inventory-detail'); }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-xs font-bold"
                      >
                        <History size={14} /> Historique
                      </button>
                      <button 
                        onClick={() => { setEditingItem(p); setModalType('quick-stock-adjust'); setIsAddModalOpen(true); }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-accent/10 text-accent rounded-lg hover:bg-accent/20 transition-colors text-xs font-bold"
                      >
                        <Edit size={14} /> Ajuster
                      </button>
                    </div>
                  )
                }
              ]}
            />
          </div>
        </div>
      )}
      {activeTab === 'inventory-detail' && editingItem && (
        <AdminInventoryDetail product={editingItem} />
      )}
    </>
  );
}

// Composant détail inventaire avec historique ciblé
function AdminInventoryDetail({ product }: { product: any }) {
  const { transactions: stockMovements, isLoading, loadMore, hasMore } = useProductStockTransactions(product.id);
  const setActiveTab = useAdminStore((s) => s.setActiveTab);
  const setEditingItem = useAdminStore((s) => s.setEditingItem);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => { setActiveTab('inventory'); setEditingItem(null); }}
          className="p-2 hover:bg-secondary/50 rounded-full transition-colors border border-transparent hover:border-primary/10"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="text-3xl font-serif font-bold text-primary">{product.name}</h2>
          <p className="text-sm text-primary/60">Catégorie: {product.category}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-[2rem] border border-primary/10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Stock Actuel</p>
          <p className="text-3xl font-serif font-bold text-primary">{product.stock || 0}</p>
        </div>
        <div className="bg-card p-6 rounded-[2rem] border border-primary/10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Prix Unitaire</p>
          <p className="text-2xl font-bold text-primary">{Number(product.price || 0).toLocaleString()} FCFA</p>
        </div>
        <div className="bg-card p-6 rounded-[2rem] border border-primary/10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Valeur Total</p>
          <p className="text-2xl font-bold text-accent">{((Number(product.price) || 0) * (Number(product.stock) || 0)).toLocaleString()} FCFA</p>
        </div>
        <div className="bg-card p-6 rounded-[2rem] border border-primary/10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">État</p>
          <span className={cn(
            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block",
            product.in_stock ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
          )}>
            {product.in_stock ? 'En stock' : 'En rupture'}
          </span>
        </div>
      </div>

      <div className="bg-card rounded-[2rem] shadow-sm border border-primary/10 overflow-hidden">
        <div className="p-8 border-b border-primary/5">
          <h3 className="text-xl font-serif font-bold text-primary">Historique des Mouvements de Stock</h3>
        </div>
        {stockMovements.length === 0 && !isLoading ? (
          <div className="p-8 text-center">
            <p className="text-primary/60 italic">Aucun mouvement de stock enregistré pour ce produit</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/30 border-b border-primary/5">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-primary/70">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-primary/70">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-primary/70">Quantité</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-primary/70">Note</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-primary/70">Effectué par</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {stockMovements.map((movement: any) => (
                  <tr key={movement.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-primary/80">{formatDate(movement.timestamp)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest inline-block",
                        movement.type === 'add' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      )}>
                        {movement.type === 'add' ? 'Ajout' : 'Retrait'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">{movement.quantity || 0}</td>
                    <td className="px-6 py-4 text-sm text-primary/70">{movement.note || '-'}</td>
                    <td className="px-6 py-4 text-sm text-primary/60">{movement.author || 'Système'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {hasMore && (
              <div className="p-4 border-t border-primary/5 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="px-6 py-2 bg-secondary text-primary font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Chargement...' : 'Charger Plus'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
