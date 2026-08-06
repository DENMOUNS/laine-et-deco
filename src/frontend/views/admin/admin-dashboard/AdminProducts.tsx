import React from 'react';
import { Settings, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminProducts } from './hooks/useAdminProducts';
import { useAdminStore } from '../../../../stores/adminStore';
import { DataTable } from '../../../components/DataTable';
import { TabFilter } from '../../../components/TabFilter';
import { getStatusStyles } from '../../../components/ui/StatusBadge';
import { formatFirestoreDate as formatDate } from '../../../../services/adminService';
import { cn } from '../../../utils/utils';
import { ImageWithFallback } from '../../../components/ui/ImageWithFallback';
import type { Product } from '../../../../types';

export function AdminProducts({ ctx }: { ctx: any }) {
  const {
    products,
    totalCount,
    isLoading,
    productFilter,
    setProductFilter,
    updateProductFields,
    deleteProduct,
    handlePageChange,
    currentPage
  } = useAdminProducts();

  const setEditingItem = useAdminStore((s) => s.setEditingItem);
  const setActiveTab = useAdminStore((s) => s.setActiveTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <TabFilter 
          options={[
            { id: 'all', label: 'Tous' },
            { id: 'stock_low', label: 'Stock Faible' },
            { id: 'stock_out', label: 'Rupture' },
          ]}
          active={productFilter}
          onChange={(val) => setProductFilter(val as any)}
        />
        <button 
          onClick={() => { setEditingItem(null); setActiveTab('product-create'); }}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg"
        >
          <Plus size={18} /> Ajouter un produit
        </button>
      </div>
      <DataTable<Product>
        dateFilterKey="createdAt"
        searchable={true}
        defaultSort={{ key: 'createdAt', direction: 'desc' }}
        data={products}
        onRowClick={(p) => { setEditingItem(p); setActiveTab('product-edit'); }}
        onDelete={(item) => deleteProduct(item.id!)}
        title="Catalogue Produits"
        columns={[
          {
            header: 'Produit',
            accessor: (product: Product) => (
              <div className="flex items-center gap-4">
                <ImageWithFallback src={product.image} alt={product.name} className="w-10 h-12 object-cover rounded-lg" />
                <div className="flex flex-col">
                  <span className="font-medium text-primary">{product.name}</span>
                  {!product.isAvailable && <span className="text-[10px] text-primary/40 font-bold uppercase">Désactivé</span>}
                </div>
              </div>
            ),
            exportValue: (product: Product) => product.name,
            sortable: true,
            sortKey: 'name'
          },
          { header: 'Catégorie', accessor: 'category' as any, className: 'text-primary/60 text-sm', sortable: true },
          { 
            header: 'Prix', 
            accessor: (product: Product) => (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <input 
                  type="number" 
                  defaultValue={product.price}
                  onBlur={async (e) => {
                    const newPrice = Number(e.target.value);
                    if (newPrice !== product.price) {
                      await updateProductFields(product.id, { price: newPrice });
                      toast.success(`Prix de ${product.name} mis à jour`);
                    }
                  }}
                  className="w-24 bg-transparent border-b border-dashed border-primary/10 focus:border-primary focus:outline-none font-bold text-right text-primary"
                />
                <span className="text-xs font-bold text-primary/60">FCFA</span>
              </div>
            ),
            exportValue: (product: Product) => `${product.price} FCFA`,
            sortable: true,
            sortKey: 'price'
          },
          {
            header: 'Stock',
            accessor: (product: Product) => (
              <div className="flex flex-col gap-1" onClick={e => e.stopPropagation()}>
                <span className="font-bold text-primary text-sm">{product.stock || 0} p.</span>
                <select 
                  value={product.in_stock ? 'in' : 'out'} 
                  onChange={async (e) => {
                    const in_stock = e.target.value === 'in';
                    await updateProductFields(product.id, { in_stock });
                    toast.success(`Statut stock mis à jour: ${in_stock ? 'En stock' : 'En rupture'}`);
                  }}
                  className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-full outline-none cursor-pointer w-24 text-center",
                    product.in_stock ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                  )}
                >
                  <option value="in">En stock</option>
                  <option value="out">En rupture</option>
                </select>
              </div>
            ),
            exportValue: (product: Product) => String(product.stock),
            sortable: true,
            sortKey: 'stock'
          },
          { header: 'Créé le', accessor: (p: Product) => formatDate(p.createdAt), className: 'text-primary/60 text-sm', sortable: true },
          {
            header: 'Statut',
            accessor: (product: Product) => (
              <button 
                onClick={async (e) => {
                  e.stopPropagation();
                  const newAvailable = !product.isAvailable;
                  await updateProductFields(product.id, { isAvailable: newAvailable });
                  toast.success(newAvailable ? 'Produit activé' : 'Produit désactivé');
                }}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors border",
                  getStatusStyles(product.isAvailable ? 'active' : 'inactive')
                )}
              >
                {product.isAvailable ? 'Actif' : 'Inactif'}
              </button>
            ),
            sortable: true,
            sortKey: 'isAvailable'
          },
          {
            header: 'Actions',
            accessor: (product: Product) => (
              <div className="flex gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); setEditingItem(product); setActiveTab('product-edit'); }}
                  className="p-2 text-primary/60 hover:text-primary transition-colors"
                >
                  <Settings size={16} />
                </button>
              </div>
            )
          }
        ]}
        serverPagination={{
          totalItems: totalCount,
          isLoading: isLoading,
          onPageChange: handlePageChange
        }}
      />
    </div>
  );
}
