import React from 'react';
import { Tag, Zap, Recycle, Filter } from 'lucide-react';
import { Product } from '../../../types';

export interface ShopFilterContentProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  CATEGORIES: any[];
  PRODUCTS: Product[];
  priceRange: number;
  setPriceRange: React.Dispatch<React.SetStateAction<number>>;
  isPriceFilterActive: boolean;
  setIsPriceFilterActive: (active: boolean) => void;
  selectedCondition: string;
  setSelectedCondition: (cond: string) => void;
  onlyNewArrivals: boolean;
  setOnlyNewArrivals: (val: boolean) => void;
  onlyPromotions: boolean;
  setOnlyPromotions: (val: boolean) => void;
  setSearchQuery: (query: string) => void;
}

export const ShopFilterContent: React.FC<ShopFilterContentProps> = ({
  selectedCategory,
  setSelectedCategory,
  CATEGORIES,
  priceRange,
  setPriceRange,
  isPriceFilterActive,
  setIsPriceFilterActive,
  selectedCondition,
  setSelectedCondition,
  onlyNewArrivals,
  setOnlyNewArrivals,
  onlyPromotions,
  setOnlyPromotions,
  setSearchQuery,
}) => (
  <div className="space-y-10">
    <div>
      <h3 className="font-bold uppercase tracking-widest text-xs mb-6 flex items-center">
        <Tag size={14} className="mr-2 text-rose-500" /> Promotions
      </h3>
      <button
        onClick={() => setOnlyPromotions(!onlyPromotions)}
        className={`flex items-center justify-between w-full p-4 rounded-2xl border transition-all ${
          onlyPromotions
            ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-primary/10'
            : 'bg-card border-primary/10 text-primary/70 hover:border-primary/30'
        }`}
      >
        <span className="text-sm font-bold">Voir uniquement les promotions</span>
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
            onlyPromotions ? 'bg-white border-white' : 'border-primary/20'
          }`}
        >
          {onlyPromotions && <div className="w-2 h-2 bg-white rounded-full" />}
        </div>
      </button>
    </div>

    <div>
      <h3 className="font-bold uppercase tracking-widest text-xs mb-6 flex items-center">
        <Zap size={14} className="mr-2 text-accent" /> Nouveautés
      </h3>
      <button
        onClick={() => setOnlyNewArrivals(!onlyNewArrivals)}
        className={`flex items-center justify-between w-full p-4 rounded-2xl border transition-all ${
          onlyNewArrivals
            ? 'bg-accent border-accent text-white shadow-lg shadow-primary/10'
            : 'bg-card border-primary/10 text-primary/70 hover:border-primary/30'
        }`}
      >
        <span className="text-sm font-bold">Voir uniquement les nouveautés</span>
        <div
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
            onlyNewArrivals ? 'bg-white border-white' : 'border-primary/20'
          }`}
        >
          {onlyNewArrivals && <div className="w-2 h-2 bg-accent rounded-full" />}
        </div>
      </button>
    </div>

    <div>
      <h3 className="font-bold uppercase tracking-widest text-xs mb-6 flex items-center">
        <Recycle size={14} className="mr-2 text-orange-500" /> État du produit
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {[
          { id: 'Tous', label: 'Tous les articles', icon: null },
          { id: 'new', label: 'Articles Neufs', icon: <Tag size={12} /> },
          { id: 'second-hand', label: 'Deuxième Main', icon: <Recycle size={12} /> },
        ].map((cond) => (
          <button
            key={cond.id}
            onClick={() => setSelectedCondition(cond.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
              selectedCondition === cond.id
                ? 'bg-primary text-white border-primary shadow-md'
                : 'bg-secondary text-primary/70 border-transparent hover:bg-secondary/80'
            }`}
          >
            {cond.icon}
            {cond.label}
          </button>
        ))}
      </div>
    </div>

    <div>
      <h3 className="font-bold uppercase tracking-widest text-xs mb-6 flex items-center">
        <Filter size={14} className="mr-2" /> Catégories
      </h3>
      <div className="space-y-3">
        <button
          onClick={() => setSelectedCategory('Tous')}
          className={`block w-full text-left text-sm transition-colors ${
            selectedCategory === 'Tous' ? 'text-accent font-bold' : 'text-primary/70 hover:text-primary'
          }`}
        >
          Tous les produits
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.name)}
            className={`block w-full text-left text-sm transition-colors ${
              selectedCategory === cat.name ? 'text-accent font-bold' : 'text-primary/70 hover:text-primary'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>

    <div>
      <h3 className="font-bold uppercase tracking-widest text-xs mb-6">Budget</h3>
      <div className="space-y-6 bg-secondary p-6 rounded-2xl border border-primary/5">
        <div className="flex justify-between items-end gap-4">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-widest text-primary/70 font-bold">Max</p>
            <p className="text-lg font-serif font-bold text-primary">
              {priceRange.toLocaleString()} <span className="text-xs">FCFA</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPriceRange((prev) => Math.max(0, prev - 500));
                setIsPriceFilterActive(true);
              }}
              className="h-9 w-9 rounded-full border border-primary/10 bg-white text-primary shadow-sm hover:bg-primary/5 transition"
              aria-label="Réduire le budget"
            >
              −
            </button>
            <button
              onClick={() => {
                setPriceRange((prev) => Math.min(300000, prev + 500));
                setIsPriceFilterActive(true);
              }}
              className="h-9 w-9 rounded-full border border-primary/10 bg-white text-primary shadow-sm hover:bg-primary/5 transition"
              aria-label="Augmenter le budget"
            >
              +
            </button>
            <button
              onClick={() => {
                setPriceRange(300000);
                setIsPriceFilterActive(false);
              }}
              className="text-[10px] font-bold uppercase tracking-widest text-accent hover:underline"
            >
              Reset
            </button>
          </div>
        </div>
        <input
          type="range"
          className="w-full h-1.5 bg-primary/10 rounded-lg appearance-none cursor-pointer accent-accent"
          min="0"
          max="300000"
          step="500"
          value={priceRange}
          onChange={(e) => {
            setPriceRange(parseInt(e.target.value));
            setIsPriceFilterActive(true);
          }}
        />
        <div className="flex justify-between text-[10px] text-primary/70 font-bold uppercase tracking-widest">
          <span>0 FCFA</span>
          <span>300k FCFA</span>
        </div>
      </div>
    </div>
    <button
      onClick={() => {
        setSelectedCategory('Tous');
        setSelectedCondition('Tous');
        setOnlyNewArrivals(false);
        setOnlyPromotions(false);
        setSearchQuery('');
        setPriceRange(300000);
        setIsPriceFilterActive(false);
      }}
      className="w-full py-3 border border-primary/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all cursor-pointer"
    >
      Réinitialiser les filtres
    </button>
  </div>
);
