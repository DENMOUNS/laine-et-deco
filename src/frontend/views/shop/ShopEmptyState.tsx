import React from 'react';
import { motion } from 'motion/react';
import { SearchX, RotateCcw, Tag } from 'lucide-react';

export interface ShopEmptyStateProps {
  onResetAllFilters: () => void;
  onShowPromotionsOnly: () => void;
  CATEGORIES: any[];
  onSelectCategory: (catName: string) => void;
}

export const ShopEmptyState: React.FC<ShopEmptyStateProps> = ({
  onResetAllFilters,
  onShowPromotionsOnly,
  CATEGORIES,
  onSelectCategory,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16 sm:py-20 px-4 max-w-lg mx-auto"
    >
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-400 border border-stone-200/80 shadow-xs">
        <SearchX size={42} className="text-stone-400 stroke-[1.8]" />
      </div>
      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mb-3">
        Aucun article ne correspond à votre sélection
      </h2>
      <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-8">
        Vos critères de recherche ou de filtre sont peut-être trop restrictifs. Vous pouvez réinitialiser vos filtres ou
        explorer l'une de nos catégories populaires ci-dessous.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
        <button
          onClick={onResetAllFilters}
          className="w-full sm:w-auto bg-[#2C372B] hover:bg-accent text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
        >
          <RotateCcw size={15} />
          Réinitialiser tous les filtres
        </button>
        <button
          onClick={onShowPromotionsOnly}
          className="w-full sm:w-auto bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300/80 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Tag size={15} className="text-rose-600" />
          Voir les promotions en cours
        </button>
      </div>

      {/* Suggestions rapides de rayons */}
      <div className="pt-6 border-t border-stone-200/80">
        <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-3">
          Suggestions de rayons rapides :
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.slice(0, 5).map((cat) => (
            <button
              key={cat.id || cat.name}
              onClick={() => onSelectCategory(cat.name)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 transition-colors cursor-pointer"
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
