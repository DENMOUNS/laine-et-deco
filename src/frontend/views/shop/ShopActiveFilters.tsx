import React from 'react';
import { Filter, Tag, Zap, X, RotateCcw } from 'lucide-react';
import { Product } from '../../../types';

export interface ShopActiveFiltersProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  CATEGORIES: any[];
  PRODUCTS: Product[];
  onlyPromotions: boolean;
  setOnlyPromotions: (val: boolean) => void;
  onlyNewArrivals: boolean;
  setOnlyNewArrivals: (val: boolean) => void;
  selectedCondition: string;
  setSelectedCondition: (cond: string) => void;
  isPriceFilterActive: boolean;
  setIsPriceFilterActive: (active: boolean) => void;
  priceRange: number;
  setPriceRange: React.Dispatch<React.SetStateAction<number>>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isAnyFilterActive: boolean;
  onResetAllFilters: () => void;
}

export const ShopActiveFilters: React.FC<ShopActiveFiltersProps> = ({
  selectedCategory,
  setSelectedCategory,
  CATEGORIES,
  PRODUCTS,
  onlyPromotions,
  setOnlyPromotions,
  onlyNewArrivals,
  setOnlyNewArrivals,
  selectedCondition,
  setSelectedCondition,
  isPriceFilterActive,
  setIsPriceFilterActive,
  priceRange,
  setPriceRange,
  searchQuery,
  setSearchQuery,
  isAnyFilterActive,
  onResetAllFilters,
}) => {
  return (
    <>
      {/* Category Quick Ribbon */}
      <div className="mb-5 overflow-x-auto no-scrollbar pb-1">
        <div className="flex items-center gap-2 min-w-max">
          <button
            onClick={() => setSelectedCategory('Tous')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              selectedCategory === 'Tous'
                ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400 hover:bg-stone-50'
            }`}
          >
            Tous les articles
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedCategory === 'Tous' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              {PRODUCTS.length}
            </span>
          </button>
          {CATEGORIES.map((cat) => {
            const count = PRODUCTS.filter((p) => p.category === cat.name).length;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.id || cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400 hover:bg-stone-50'
                }`}
              >
                {cat.name}
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Filter Chips Bar */}
      {isAnyFilterActive && (
        <div className="mb-7 flex flex-wrap items-center gap-2 p-3 sm:p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mr-1 flex items-center gap-1">
            <Filter size={12} className="text-accent" />
            Filtres actifs :
          </span>

          {selectedCategory !== 'Tous' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-stone-900 text-white pl-3 pr-1.5 py-1 rounded-full shadow-xs">
              <span>
                Rayon : <strong>{selectedCategory}</strong>
              </span>
              <button
                onClick={() => setSelectedCategory('Tous')}
                className="hover:bg-white/20 p-0.5 rounded-full transition-colors cursor-pointer"
                aria-label="Supprimer le filtre de catégorie"
                title="Supprimer ce filtre"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {onlyPromotions && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-rose-600 text-white pl-3 pr-1.5 py-1 rounded-full shadow-xs">
              <Tag size={12} />
              <span>Promotions uniquement</span>
              <button
                onClick={() => setOnlyPromotions(false)}
                className="hover:bg-white/20 p-0.5 rounded-full transition-colors cursor-pointer"
                aria-label="Supprimer le filtre promotion"
                title="Supprimer ce filtre"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {onlyNewArrivals && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-accent text-white pl-3 pr-1.5 py-1 rounded-full shadow-xs">
              <Zap size={12} />
              <span>Nouveautés</span>
              <button
                onClick={() => setOnlyNewArrivals(false)}
                className="hover:bg-white/20 p-0.5 rounded-full transition-colors cursor-pointer"
                aria-label="Supprimer le filtre nouveautés"
                title="Supprimer ce filtre"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {selectedCondition !== 'Tous' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-stone-200 text-stone-800 pl-3 pr-1.5 py-1 rounded-full">
              <span>
                État : <strong>{selectedCondition === 'new' ? 'Neuf' : 'Deuxième Main'}</strong>
              </span>
              <button
                onClick={() => setSelectedCondition('Tous')}
                className="hover:bg-stone-300 p-0.5 rounded-full transition-colors cursor-pointer"
                aria-label="Supprimer le filtre état"
                title="Supprimer ce filtre"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {isPriceFilterActive && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-stone-200 text-stone-800 pl-3 pr-1.5 py-1 rounded-full">
              <span>
                Budget max : <strong>{priceRange.toLocaleString('fr-FR')} FCFA</strong>
              </span>
              <button
                onClick={() => {
                  setIsPriceFilterActive(false);
                  setPriceRange(300000);
                }}
                className="hover:bg-stone-300 p-0.5 rounded-full transition-colors cursor-pointer"
                aria-label="Supprimer le filtre de prix"
                title="Supprimer ce filtre"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {searchQuery.trim() && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-stone-200 text-stone-800 pl-3 pr-1.5 py-1 rounded-full">
              <span>
                Recherche : <strong>"{searchQuery}"</strong>
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className="hover:bg-stone-300 p-0.5 rounded-full transition-colors cursor-pointer"
                aria-label="Effacer la recherche"
                title="Effacer la recherche"
              >
                <X size={13} />
              </button>
            </span>
          )}

          <button
            onClick={onResetAllFilters}
            className="text-xs font-bold text-accent hover:text-accent/80 flex items-center gap-1 ml-auto transition-colors cursor-pointer pl-2 py-1"
            title="Réinitialiser tous les critères de recherche"
          >
            <RotateCcw size={13} />
            Tout effacer
          </button>
        </div>
      )}
    </>
  );
};
