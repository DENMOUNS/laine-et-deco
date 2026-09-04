import React from 'react';
import { Search, Mic, Camera, X, Loader2, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { FlashSale, Product } from '../../../types';

export interface ShopHeaderProps {
  targetFlashSale?: FlashSale | null;
  filteredCount: number;
  totalProductsCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  startVoiceSearch: () => void;
  isVoiceSearching: boolean;
  imagePreview: string | null;
  clearImageSearch: () => void;
  handleImageSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isAnalyzingImage: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  sortBy: string;
  setSortBy: (sort: string) => void;
  setShowMobileFilters: (show: boolean) => void;
  isAnyFilterActive: boolean;
}

export const ShopHeader: React.FC<ShopHeaderProps> = ({
  targetFlashSale,
  filteredCount,
  totalProductsCount,
  searchQuery,
  setSearchQuery,
  startVoiceSearch,
  isVoiceSearching,
  imagePreview,
  clearImageSearch,
  handleImageSearch,
  isAnalyzingImage,
  fileInputRef,
  sortBy,
  setSortBy,
  setShowMobileFilters,
  isAnyFilterActive,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 sm:mb-10 gap-5">
      <div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 mb-1.5">
          {targetFlashSale ? targetFlashSale.name : 'Boutique'}
        </h1>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-600 font-medium">
          <span className="font-semibold text-stone-900">
            {filteredCount} {filteredCount <= 1 ? 'article trouvé' : 'articles trouvés'}
          </span>
          {filteredCount !== totalProductsCount && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-accent bg-accent/10 px-2.5 py-0.5 rounded-full">
              sur {totalProductsCount} au total
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full md:w-auto">
        <div className="relative flex-grow md:flex-grow-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/70" size={18} />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 pr-12 py-2.5 bg-card border border-stone-200/80 rounded-full focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent w-full md:w-80 shadow-xs text-xs sm:text-sm"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              onClick={startVoiceSearch}
              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                isVoiceSearching ? 'bg-accent text-white animate-pulse' : 'text-primary/70 hover:text-accent hover:bg-primary/5'
              }`}
              title="Recherche vocale"
              type="button"
            >
              <Mic size={16} />
            </button>
            {imagePreview ? (
              <button
                onClick={clearImageSearch}
                className="p-1.5 bg-secondary text-primary/70 rounded-full hover:bg-secondary/80 transition-colors cursor-pointer"
                type="button"
              >
                <X size={14} />
              </button>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 bg-slate-50 text-accent rounded-full hover:bg-accent hover:text-white transition-all cursor-pointer"
                title="Rechercher par image"
                type="button"
              >
                <Camera size={16} />
              </button>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSearch}
            accept="image/*"
            className="hidden"
          />
        </div>
        {imagePreview && (
          <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
            <img src={imagePreview} alt="Search" className="w-6 h-6 rounded-full object-cover" />
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Recherche par image</span>
            {isAnalyzingImage && <Loader2 size={12} className="animate-spin text-accent" />}
          </div>
        )}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none pl-4 pr-9 py-2.5 bg-card border border-stone-200/80 rounded-full focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent cursor-pointer shadow-xs text-xs sm:text-sm font-medium"
          >
            <option value="Nouveautés">Nouveautés</option>
            <option value="Prix croissant">Prix croissant</option>
            <option value="Prix décroissant">Prix décroissant</option>
            <option value="Mieux notés">Mieux notés</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" size={15} />
        </div>

        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => setShowMobileFilters(true)}
          className="lg:hidden flex items-center gap-2 bg-[#2C372B] text-white px-4 py-2.5 rounded-full font-bold shadow-xs hover:bg-accent transition-all text-xs sm:text-sm cursor-pointer"
          type="button"
        >
          <SlidersHorizontal size={15} />
          Filtres
          {isAnyFilterActive && (
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          )}
        </button>
      </div>
    </div>
  );
};
