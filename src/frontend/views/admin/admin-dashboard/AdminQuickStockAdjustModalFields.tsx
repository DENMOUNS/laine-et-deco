import React from 'react';

export function AdminQuickStockAdjustModalFields({ ctx }: { ctx: any }) {
  const { modalType, editingItem } = ctx;

  if (modalType !== 'quick-stock-adjust' || !editingItem) return null;

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="space-y-4 p-6 bg-primary/5 rounded-3xl border border-primary/10">
        <p className="text-sm text-primary font-bold mb-2">Produit: {editingItem.name}</p>
        <p className="text-sm text-primary/60 italic leading-relaxed">
          Stock actuel: <span className="font-bold text-primary">{editingItem.stock || 0}</span>
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Quantité à ajouter ou retirer</label>
        <p className="text-[10px] text-primary/50 italic">Utilisez un nombre positif pour ajouter, négatif pour retirer</p>
        <input 
          name="quantityChange" 
          type="number" 
          className="input-field" 
          placeholder="Ex: 50 (ajout) ou -10 (retrait)" 
          required 
          step="1"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Note (optionnelle)</label>
        <input 
          name="note" 
          type="text" 
          className="input-field" 
          placeholder="Ex: Retour client, réajustement, etc." 
        />
      </div>
    </div>
  );
}
