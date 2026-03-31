import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, Search, ChevronDown, Camera, X, Loader2 } from 'lucide-react';
import { CATEGORIES } from '../../constants';

interface ShopFiltersProps {
  isFilterMenuOpen: boolean;
  setIsFilterMenuOpen: (o: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  selectedMaterial: string;
  setSelectedMaterial: (m: string) => void;
  priceRange: number;
  setPriceRange: (p: number) => void;
  selectedColor: string;
  setSelectedColor: (c: string) => void;
  materials: string[];
  colors: { name: string; hex: string }[];
  imagePreview: string | null;
  isAnalyzingImage: boolean;
  handleImageSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearImageSearch: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  totalProducts: number;
}

export const ShopFilters: React.FC<ShopFiltersProps> = ({
  isFilterMenuOpen, setIsFilterMenuOpen,
  searchQuery, setSearchQuery,
  sortBy, setSortBy,
  selectedCategory, setSelectedCategory,
  selectedMaterial, setSelectedMaterial,
  priceRange, setPriceRange,
  selectedColor, setSelectedColor,
  materials, colors,
  imagePreview, isAnalyzingImage,
  handleImageSearch, clearImageSearch,
  fileInputRef, totalProducts
}) => {
  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-2">Boutique</h1>
          <p className="text-primary/60">{totalProducts} produits trouvés</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <button 
            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
            className={`flex items-center gap-2 px-6 py-2 rounded-full border transition-all ${isFilterMenuOpen ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary/10 hover:border-accent hover:text-accent'}`}
          >
            <Filter size={18} />
            <span className="font-bold uppercase tracking-widest text-xs">Filtres</span>
            {isFilterMenuOpen ? <ChevronDown size={16} className="rotate-180 transition-transform" /> : <ChevronDown size={16} />}
          </button>

          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
            <input
              type="text"
              placeholder="Ex: name:wool category:deco ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-12 py-2 bg-white border border-primary/10 rounded-full focus:outline-none focus:border-accent w-full md:w-80 shadow-sm"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {imagePreview ? (
                <button onClick={clearImageSearch} className="p-1.5 bg-slate-100 text-primary/60 rounded-full hover:bg-slate-200 transition-colors"><X size={14} /></button>
              ) : (
                <button onClick={() => fileInputRef.current?.click()} className="p-1.5 bg-slate-50 text-accent rounded-full hover:bg-accent hover:text-white transition-all"><Camera size={16} /></button>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageSearch} accept="image/*" className="hidden" />
          </div>
          {imagePreview && (
            <div className="flex items-center gap-2 bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
              <img src={imagePreview} alt="Search" className="w-6 h-6 rounded-full object-cover" />
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Recherche par image</span>
              {isAnalyzingImage && <Loader2 size={12} className="animate-spin text-accent" />}
            </div>
          )}
          <div className="relative">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="appearance-none pl-4 pr-10 py-2 bg-white border border-primary/10 rounded-full focus:outline-none focus:border-accent cursor-pointer shadow-sm">
              <option value="Nouveautés">Nouveautés</option>
              <option value="Prix croissant">Prix croissant</option>
              <option value="Prix décroissant">Prix décroissant</option>
              <option value="Mieux notés">Mieux notés</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/40 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isFilterMenuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 p-8 bg-secondary/30 rounded-[2.5rem] border border-primary/5">
              <div>
                <h3 className="font-bold uppercase tracking-widest text-[10px] text-primary/40 mb-4">Catégories</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedCategory('Tous')} className={`px-3 py-1.5 rounded-full text-xs transition-all ${selectedCategory === 'Tous' ? 'bg-primary text-white' : 'bg-white text-primary/70 hover:bg-primary/5'}`}>Tous</button>
                  {CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.name)} className={`px-3 py-1.5 rounded-full text-xs transition-all ${selectedCategory === cat.name ? 'bg-primary text-white' : 'bg-white text-primary/70 hover:bg-primary/5'}`}>{cat.name}</button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold uppercase tracking-widest text-[10px] text-primary/40 mb-4">Matières</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedMaterial('Tous')} className={`px-3 py-1.5 rounded-full text-xs transition-all ${selectedMaterial === 'Tous' ? 'bg-primary text-white' : 'bg-white text-primary/70 hover:bg-primary/5'}`}>Toutes</button>
                  {materials.map(mat => (
                    <button key={mat} onClick={() => setSelectedMaterial(mat!)} className={`px-3 py-1.5 rounded-full text-xs transition-all ${selectedMaterial === mat ? 'bg-primary text-white' : 'bg-white text-primary/70 hover:bg-primary/5'}`}>{mat}</button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold uppercase tracking-widest text-[10px] text-primary/40 mb-4">Budget Max</h3>
                <div className="space-y-4">
                  <input type="range" className="w-full h-1.5 bg-primary/10 rounded-lg appearance-none cursor-pointer accent-accent" min="0" max="100000" step="1000" value={priceRange} onChange={(e) => setPriceRange(parseInt(e.target.value))} />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-primary">{priceRange.toLocaleString()} FCFA</span>
                    <button onClick={() => setPriceRange(100000)} className="text-[10px] font-bold uppercase tracking-widest text-accent">Reset</button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold uppercase tracking-widest text-[10px] text-primary/40 mb-4">Couleurs</h3>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color, i) => (
                    <button key={i} onClick={() => setSelectedColor(color.hex)} className={`w-6 h-6 rounded-full border border-primary/10 transition-all ${selectedColor === color.hex ? 'ring-2 ring-accent ring-offset-2' : ''}`} style={{ backgroundColor: color.hex }} />
                  ))}
                  <button onClick={() => setSelectedColor('Tous')} className="text-[10px] font-bold text-accent px-2">Reset</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
