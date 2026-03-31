import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Plus, Trash2, Package, ShoppingBag, Coins, Users, Lock, Bell, MessageSquare, DollarSign } from 'lucide-react';

interface AdminModalsProps {
  isOpen: boolean;
  onClose: () => void;
  type: string;
  editingItem: any;
  isSaving: boolean;
  onSave: (data: any) => void;
  products?: any[];
  categories?: any[];
}

export const AdminModals: React.FC<AdminModalsProps> = ({ 
  isOpen, onClose, type, editingItem, isSaving, onSave, products = [], categories = [] 
}) => {
  if (!isOpen) return null;

  const renderProductModal = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nom du produit</label><input type="text" defaultValue={editingItem?.name} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium" /></div>
        <div className="space-y-3"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Catégorie</label><select defaultValue={editingItem?.category} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium">{categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select></div>
        <div className="space-y-3"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Prix (€)</label><input type="number" defaultValue={editingItem?.price} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium" /></div>
        <div className="space-y-3"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Stock</label><input type="number" defaultValue={editingItem?.stock} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium" /></div>
      </div>
      <div className="space-y-3"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label><textarea defaultValue={editingItem?.description} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium min-h-[120px] resize-none"></textarea></div>
    </div>
  );

  const getTitle = () => {
    const action = editingItem ? 'Modifier' : 'Ajouter';
    switch (type) {
      case 'product': return `${action} un Produit`;
      case 'category': return `${action} une Catégorie`;
      case 'currency': return `${action} une Devise`;
      case 'pack': return `${action} un Pack`;
      case 'user': return `${action} un Utilisateur`;
      case 'role': return `${action} un Rôle`;
      case 'expense': return `${action} une Dépense`;
      default: return `${action} Élément`;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-gray-50/30 flex-shrink-0">
          <div><h3 className="text-2xl font-serif font-bold text-gray-900">{getTitle()}</h3><p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Remplissez les informations ci-dessous</p></div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-full transition-all text-gray-400 hover:text-gray-900 shadow-sm border border-transparent hover:border-gray-100"><X size={24} /></button>
        </div>
        <div className="p-10 overflow-y-auto custom-scrollbar flex-grow">
          {type === 'product' && renderProductModal()}
          {/* Add other modal types here */}
        </div>
        <div className="p-10 border-t border-gray-50 flex justify-end gap-4 bg-gray-50/30 flex-shrink-0">
          <button onClick={onClose} className="px-8 py-4 rounded-full font-bold text-gray-500 hover:bg-gray-100 transition-all uppercase tracking-widest text-xs">Annuler</button>
          <button onClick={() => onSave({})} disabled={isSaving} className="bg-primary text-white px-10 py-4 rounded-full font-bold flex items-center gap-3 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 hover:scale-105 active:scale-95">{isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={20} />}<span>{editingItem ? 'Mettre à jour' : 'Enregistrer'}</span></button>
        </div>
      </motion.div>
    </div>
  );
};
