import React from 'react';
import { Plus, X, Image as ImageIcon } from 'lucide-react';
import { ImageUpload } from '../../../components/ui/ImageUpload';

export function AdminPackModalFields({ ctx }: { ctx: any }) {
  const {
    modalType,
    editingItem,
    localProducts,
    selectedPackProducts,
    setSelectedPackProducts,
  } = ctx;

  if (modalType !== 'pack') return null;

  const MAX_PRODUCTS = 20;

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Nom */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Nom du pack</label>
        <input name="name" type="text" className="input-field" defaultValue={editingItem?.name} required />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Description</label>
        <textarea name="description" className="input-field" defaultValue={editingItem?.description} required />
      </div>

      {/* Image de couverture */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-primary/60 flex items-center gap-2">
          <ImageIcon size={14} />
          Image de couverture <span className="text-primary/40 font-normal normal-case tracking-normal">(optionnelle)</span>
        </label>
        <p className="text-xs text-primary/50">
          Une image représentative du pack. Si absente, la première image produit sera utilisée.
        </p>
        <ImageUpload
          name="coverImage"
          defaultValue={editingItem?.coverImage || ''}
          onChange={() => {}}
        />
      </div>

      {/* Réduction & Code promo */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Réduction (%)</label>
          <input
            name="discountPercentage"
            type="number"
            min="0"
            max="100"
            className="input-field"
            defaultValue={editingItem?.discountPercentage || 10}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Code Promo (Auto)</label>
          <input
            name="promoCode"
            type="text"
            className="input-field"
            defaultValue={editingItem?.promoCode}
            placeholder="Généré automatiquement si vide"
          />
        </div>
      </div>

      {/* Produits du pack */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-widest text-primary/60">
            Produits du Pack
          </label>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            selectedPackProducts.length >= MAX_PRODUCTS
              ? 'bg-red-100 text-red-700'
              : 'bg-primary/10 text-primary'
          }`}>
            {selectedPackProducts.length} / {MAX_PRODUCTS}
          </span>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {selectedPackProducts.map((item: { productId: string; quantity: number }, idx: number) => (
            <div
              key={idx}
              className="flex gap-4 items-center bg-secondary/50 p-4 rounded-2xl border border-primary/10"
            >
              <select
                value={item.productId}
                onChange={(e) => {
                  const newProducts = [...selectedPackProducts];
                  newProducts[idx] = { ...newProducts[idx], productId: e.target.value };
                  setSelectedPackProducts(newProducts);
                }}
                className="flex-grow bg-transparent font-medium focus:outline-none"
              >
                {localProducts.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-primary/60 font-bold">Qté:</span>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => {
                    const newProducts = [...selectedPackProducts];
                    newProducts[idx] = { ...newProducts[idx], quantity: Number(e.target.value) };
                    setSelectedPackProducts(newProducts);
                  }}
                  className="w-16 px-3 py-2 bg-card rounded-xl border border-primary/10 text-center font-bold"
                />
              </div>
              <button
                type="button"
                onClick={() => setSelectedPackProducts((prev: any[]) => prev.filter((_, i) => i !== idx))}
                className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        {selectedPackProducts.length < MAX_PRODUCTS && (
          <button
            type="button"
            onClick={() =>
              setSelectedPackProducts((prev: any[]) => [
                ...prev,
                { productId: localProducts[0]?.id || '', quantity: 1 },
              ])
            }
            className="w-full py-4 border-2 border-dashed border-primary/10 rounded-2xl text-primary/60 font-bold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} /> Ajouter un produit
          </button>
        )}

        {selectedPackProducts.length >= MAX_PRODUCTS && (
          <p className="text-center text-xs text-red-500 font-medium">
            Limite de {MAX_PRODUCTS} produits atteinte
          </p>
        )}
      </div>
    </div>
  );
}
