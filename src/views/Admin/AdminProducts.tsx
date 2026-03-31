import React from 'react';
import { 
  Plus, Search, Filter, MoreVertical, Edit2, Trash2, 
  ExternalLink, Package, LayoutGrid, List, Eye 
} from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../../types';

interface AdminProductsProps {
  products: Product[];
  filter: string;
  setFilter: (filter: string) => void;
  onAdd: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ 
  products, filter, setFilter, onAdd, onEdit, onDelete 
}) => {
  const filteredProducts = products.filter(p => filter === 'all' || p.category === filter);

  return (
    <div className="space-y-8 p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div><h3 className="text-2xl font-serif font-bold text-gray-900">Gestion des Produits</h3><p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">{products.length} Produits au total</p></div>
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Rechercher un produit..." className="pl-12 pr-6 py-3 bg-gray-50 border-none rounded-full w-full md:w-64 focus:ring-2 focus:ring-primary/20 text-sm" />
          </div>
          <button onClick={onAdd} className="bg-primary text-white px-8 py-3 rounded-full font-bold flex items-center gap-3 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"><Plus size={20} /><span>Nouveau Produit</span></button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-wrap items-center justify-between gap-6 bg-gray-50/30">
          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-2xl">
            {['all', 'Laine', 'Accessoires', 'Kits'].map((cat) => (
              <button key={cat} onClick={() => setFilter(cat)} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all uppercase tracking-widest ${filter === cat ? 'bg-white text-primary shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>{cat === 'all' ? 'Tous' : cat}</button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:text-primary transition-all shadow-sm"><LayoutGrid size={18} /></button>
            <button className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/10"><List size={18} /></button>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Produit</th>
                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Catégorie</th>
                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Prix</th>
                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stock</th>
                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100 group-hover:scale-105 transition-transform"><img src={product.image} alt={product.name} className="w-full h-full object-cover" /></div>
                      <div><p className="font-bold text-gray-900 group-hover:text-primary transition-colors">{product.name}</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">ID: {product.id.slice(0, 8)}</p></div>
                    </div>
                  </td>
                  <td className="px-8 py-6"><span className="text-xs font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full uppercase tracking-tighter">{product.category}</span></td>
                  <td className="px-8 py-6"><p className="font-bold text-gray-900">{product.price}€</p></td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${product.stock < 10 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(product.stock, 100)}%` }}></div></div>
                      <span className={`text-xs font-bold ${product.stock < 10 ? 'text-red-500' : 'text-gray-600'}`}>{product.stock}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6"><span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${product.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}><span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>{product.stock > 0 ? 'En Stock' : 'Rupture'}</span></td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button onClick={() => onEdit(product)} className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all" title="Modifier"><Edit2 size={16} /></button>
                      <button onClick={() => onDelete(product.id)} className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Supprimer"><Trash2 size={16} /></button>
                      <button className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all" title="Voir sur le site"><ExternalLink size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
