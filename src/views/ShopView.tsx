import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, Search, ChevronDown, Grid, List as ListIcon, Loader2, Camera, X } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { ProductCard } from '../components/ProductCard';
import { Product, PromoEvent } from '../types';
import { analyzeProductImage } from '../utils/aiUtils';
import { useProducts } from '../hooks/useProducts';

interface ShopViewProps {
  onAddToCart: (p: Product) => void;
  onAddToWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onProductClick: (p: Product) => void;
  events?: PromoEvent[];
  initialSearchQuery?: string;
}

export const ShopView: React.FC<ShopViewProps> = ({ onAddToCart, onAddToWishlist, onQuickView, onProductClick, events = [], initialSearchQuery = '' }) => {
  const { products: PRODUCTS, isLoading: isInitialLoading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedMaterial, setSelectedMaterial] = useState('Tous');
  const [selectedColor, setSelectedColor] = useState('Tous');
  const [selectedBrand, setSelectedBrand] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [sortBy, setSortBy] = useState('Nouveautés');
  const [priceRange, setPriceRange] = useState(100000);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Update search query if initialSearchQuery changes
  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Simulate loading when filters change
  useEffect(() => {
    setIsFiltering(true);
    setCurrentPage(1);
    const timer = setTimeout(() => setIsFiltering(false), 400);
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedMaterial, selectedColor, selectedBrand, searchQuery, sortBy, priceRange]);

  const handleImageSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setIsAnalyzingImage(true);
      
      const keywords = await analyzeProductImage(base64);
      if (keywords) {
        setSearchQuery(keywords);
      }
      setIsAnalyzingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const clearImageSearch = () => {
    setImagePreview(null);
    setSearchQuery('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const materials = Array.from(new Set(PRODUCTS.map(p => p.material).filter(Boolean)));
  const brands = Array.from(new Set(PRODUCTS.map(p => p.brand).filter(Boolean)));
  const colors = [
    { name: 'Blanc', hex: '#FFFFFF' },
    { name: 'Beige', hex: '#F5F5DC' },
    { name: 'Marron', hex: '#8B4513' },
    { name: 'Gris', hex: '#808080' },
    { name: 'Noir', hex: '#000000' },
  ];

  const filteredProducts = PRODUCTS.filter(p => {
    const matchesCategory = selectedCategory === 'Tous' || p.category === selectedCategory;
    const matchesMaterial = selectedMaterial === 'Tous' || p.material === selectedMaterial;
    const matchesColor = selectedColor === 'Tous' || (p.colors && p.colors.includes(selectedColor));
    const matchesBrand = selectedBrand === 'Tous' || p.brand === selectedBrand;
    
    // Advanced search logic (Apache Lucene style)
    const parseLuceneQuery = (query: string, product: Product) => {
      if (!query.trim()) return true;

      // Split by space but keep quoted strings together
      const terms = query.toLowerCase().match(/(?:[^\s"]+|"[^"]*")+/g);
      if (!terms) return true;
      
      return terms.every((term: string) => {
        let field = '';
        let value = term;

        if (term.includes(':')) {
          const parts = term.split(':');
          field = parts[0];
          value = parts.slice(1).join(':'); // Handle cases like field:value:extra
        }
        
        value = value.replace(/"/g, ''); // Remove quotes

        const getFieldText = (f: string) => {
          switch(f) {
            case 'name': return product.name.toLowerCase();
            case 'category': return product.category.toLowerCase();
            case 'material': return (product.material || '').toLowerCase();
            case 'brand': return (product.brand || '').toLowerCase();
            case 'desc': return product.description.toLowerCase();
            case 'price': return product.price.toString();
            default: return `${product.name} ${product.category} ${product.description} ${product.material || ''} ${product.brand || ''}`.toLowerCase();
          }
        };

        if (field) {
          return getFieldText(field).includes(value);
        } else {
          return getFieldText('').includes(value);
        }
      });
    };

    const matchesSearch = parseLuceneQuery(searchQuery, p);
    const matchesPrice = p.price <= priceRange;
    return matchesCategory && matchesMaterial && matchesColor && matchesBrand && matchesSearch && matchesPrice;
  }).sort((a, b) => {
    if (sortBy === 'Prix croissant') return a.price - b.price;
    if (sortBy === 'Prix décroissant') return b.price - a.price;
    if (sortBy === 'Mieux notés') return b.rating - a.rating;
    if (sortBy === 'Nouveautés') return (a.isNew ? -1 : 1) - (b.isNew ? -1 : 1);
    return 0;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 size={48} className="text-accent animate-spin mb-4" />
        <p className="text-lg font-serif italic text-primary/60">Chargement de la boutique...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-2">Boutique</h1>
          <p className="text-primary/60">{filteredProducts.length} produits trouvés</p>
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
                  <button 
                    onClick={clearImageSearch}
                    className="p-1.5 bg-slate-100 text-primary/60 rounded-full hover:bg-slate-200 transition-colors"
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 bg-slate-50 text-accent rounded-full hover:bg-accent hover:text-white transition-all"
                    title="Rechercher par image"
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
              <div className="flex items-center gap-2 bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
                <img src={imagePreview} alt="Search" className="w-6 h-6 rounded-full object-cover" />
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Recherche par image</span>
                {isAnalyzingImage && <Loader2 size={12} className="animate-spin text-accent" />}
              </div>
            )}
            <div className="relative">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 bg-white border border-primary/10 rounded-full focus:outline-none focus:border-accent cursor-pointer shadow-sm"
              >
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
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-12"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 p-8 bg-secondary/30 rounded-[2.5rem] border border-primary/5">
              <div>
                <h3 className="font-bold uppercase tracking-widest text-[10px] text-primary/40 mb-4">Catégories</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('Tous')}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${selectedCategory === 'Tous' ? 'bg-primary text-white' : 'bg-white text-primary/70 hover:bg-primary/5'}`}
                  >
                    Tous
                  </button>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-all ${selectedCategory === cat.name ? 'bg-primary text-white' : 'bg-white text-primary/70 hover:bg-primary/5'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold uppercase tracking-widest text-[10px] text-primary/40 mb-4">Matières</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedMaterial('Tous')}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${selectedMaterial === 'Tous' ? 'bg-primary text-white' : 'bg-white text-primary/70 hover:bg-primary/5'}`}
                  >
                    Toutes
                  </button>
                  {materials.map(mat => (
                    <button
                      key={mat}
                      onClick={() => setSelectedMaterial(mat!)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-all ${selectedMaterial === mat ? 'bg-primary text-white' : 'bg-white text-primary/70 hover:bg-primary/5'}`}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold uppercase tracking-widest text-[10px] text-primary/40 mb-4">Budget Max</h3>
                <div className="space-y-4">
                  <input 
                    type="range" 
                    className="w-full h-1.5 bg-primary/10 rounded-lg appearance-none cursor-pointer accent-accent" 
                    min="0" 
                    max="100000" 
                    step="1000"
                    value={priceRange}
                    onChange={(e) => setPriceRange(parseInt(e.target.value))}
                  />
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
                    <button 
                      key={i} 
                      onClick={() => setSelectedColor(color.hex)}
                      className={`w-6 h-6 rounded-full border border-primary/10 transition-all ${selectedColor === color.hex ? 'ring-2 ring-accent ring-offset-2' : ''}`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                  <button 
                    onClick={() => setSelectedColor('Tous')}
                    className="text-[10px] font-bold text-accent px-2"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Product Grid */}
        <main className="flex-grow relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {isFiltering ? (
              <motion.div 
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-[2px] z-10 rounded-[3rem]"
              >
                <Loader2 size={40} className="text-accent animate-spin mb-4" />
                <p className="text-sm font-serif italic text-primary/60">Mise à jour des produits...</p>
              </motion.div>
            ) : (
              <motion.div 
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
              >
                {paginatedProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onAddToCart={onAddToCart}
                    onAddToWishlist={onAddToWishlist}
                    onQuickView={onQuickView}
                    onClick={onProductClick}
                    events={events}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          {!isFiltering && filteredProducts.length === 0 && (
            <div className="text-center py-24">
              <p className="text-xl text-primary/40 font-serif italic">Aucun produit ne correspond à votre recherche.</p>
              <button 
                onClick={() => { setSelectedCategory('Tous'); setSearchQuery(''); }}
                className="mt-4 text-accent font-bold underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}

          {filteredProducts.length > itemsPerPage && (
            <div className="mt-16 flex justify-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button 
                  key={n} 
                  onClick={() => {
                    setCurrentPage(n);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${currentPage === n ? 'bg-primary text-white shadow-lg' : 'bg-white border border-primary/10 hover:border-accent hover:text-accent'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
