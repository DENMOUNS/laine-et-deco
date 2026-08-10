import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, Search, ChevronDown, Grid, List as ListIcon, Loader2, Camera, X, Mic, SlidersHorizontal, Sparkles, Recycle } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';

import { useEntity } from '../hooks/useEntity';
import { ProductCard } from '../components/ProductCard';
import { FlashSale, Product, PromoEvent } from '../../types';
import { analyzeProductImage } from '../utils/aiUtils';
import { useProducts } from '../hooks/useProducts';
import { productSearch } from '../utils/searchUtils';
import { ProductSkeleton } from '../components/ui/Skeleton';

interface ShopViewProps {
  onAddToCart: (p: Product) => void;
  onAddToWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onAddToComparison: (p: Product) => void;
  onProductClick: (p: Product) => void;
  events?: PromoEvent[];
  initialSearchQuery?: string;
  initialAllowedCategories?: string[];
  flashSaleId?: string | null;
}

interface FilterContentProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  CATEGORIES: any[];
  PRODUCTS: Product[];
  priceRange: number;
  setPriceRange: (price: number) => void;
  isPriceFilterActive: boolean;
  setIsPriceFilterActive: (active: boolean) => void;
  selectedCondition: string;
  setSelectedCondition: (cond: string) => void;
  onlyNewArrivals: boolean;
  setOnlyNewArrivals: (val: boolean) => void;
  setSearchQuery: (query: string) => void;
}

const FilterContent: React.FC<FilterContentProps> = ({
  selectedCategory,
  setSelectedCategory,
  CATEGORIES,
  PRODUCTS,
  priceRange,
  setPriceRange,
  isPriceFilterActive,
  setIsPriceFilterActive,
  selectedCondition,
  setSelectedCondition,
  onlyNewArrivals,
  setOnlyNewArrivals,
  setSearchQuery
}) => (
  <div className="space-y-10">
    <div>
      <h3 className="font-bold uppercase tracking-widest text-xs mb-6 flex items-center">
        <Sparkles size={14} className="mr-2 text-accent" /> Nouveautés
      </h3>
      <button
        onClick={() => setOnlyNewArrivals(!onlyNewArrivals)}
        className={`flex items-center justify-between w-full p-4 rounded-2xl border transition-all ${onlyNewArrivals ? 'bg-accent border-accent text-white shadow-lg shadow-primary/10' : 'bg-card border-primary/10 text-primary/70 hover:border-primary/30'}`}
      >
        <span className="text-sm font-bold">Voir uniquement les nouveautés</span>
        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${onlyNewArrivals ? 'bg-white border-white' : 'border-primary/20'}`}>
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
          { id: 'new', label: 'Articles Neufs', icon: <Sparkles size={12} /> },
          { id: 'second-hand', label: 'Deuxième Main', icon: <Recycle size={12} /> }
        ].map(cond => (
          <button
            key={cond.id}
            onClick={() => setSelectedCondition(cond.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${selectedCondition === cond.id ? 'bg-primary text-white border-primary shadow-md' : 'bg-secondary text-primary/70 border-transparent hover:bg-secondary/80'}`}
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
          className={`block w-full text-left text-sm transition-colors ${selectedCategory === 'Tous' ? 'text-accent font-bold' : 'text-primary/70 hover:text-primary'}`}
        >
          Tous les produits
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.name)}
            className={`block w-full text-left text-sm transition-colors ${selectedCategory === cat.name ? 'text-accent font-bold' : 'text-primary/70 hover:text-primary'}`}
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
            <p className="text-lg font-serif font-bold text-primary">{priceRange.toLocaleString()} <span className="text-xs">FCFA</span></p>
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
        setSearchQuery('');
        setPriceRange(300000);
        setIsPriceFilterActive(false);
      }}
      className="w-full py-3 border border-primary/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
    >
      Réinitialiser les filtres
    </button>
  </div>
);

export const ShopView: React.FC<ShopViewProps> = ({ onAddToCart, onAddToWishlist, onQuickView, onAddToComparison, onProductClick, events = [], initialSearchQuery = '', initialAllowedCategories, flashSaleId }) => {
  const { products: fetchedProducts, isLoading: isInitialLoading } = useProducts({ cacheOnly: true });
  let PRODUCTS = fetchedProducts;
  
  const { data: FLASH_SALES } = useEntity<FlashSale>('flash_sale');
  const activeFlashSales = (FLASH_SALES || []).filter(fs => fs.status === 'active' && new Date(fs.endDate) > new Date());
  const targetFlashSale = flashSaleId ? activeFlashSales.find(fs => fs.id === flashSaleId) : null;
  
  if (targetFlashSale) {
    const flashProductIds = targetFlashSale.items.map(item => item.productId);
    PRODUCTS = PRODUCTS.filter(p => flashProductIds.includes(p.id)).map(p => {
      const flashItem = targetFlashSale.items.find(item => item.productId === p.id);
      return flashItem ? { ...p, price: flashItem.flashPrice, oldPrice: p.price } : p;
    });
  }

  const [CATEGORIES, setCATEGORIES] = useState<any[]>([]);
  
  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const mod = await import('../utils/cacheStorage');
        const cached = await mod.readEntityCache<any[]>('category');
        if (mounted && cached) setCATEGORIES(cached);
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedCondition, setSelectedCondition] = useState('Tous');
  const [onlyNewArrivals, setOnlyNewArrivals] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [sortBy, setSortBy] = useState('Nouveautés');
  const [priceRange, setPriceRange] = useState(300000);
  const [isPriceFilterActive, setIsPriceFilterActive] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const mobileFilterRef = React.useRef<HTMLDivElement>(null);

  // Reset scroll position when mobile filters open
  useEffect(() => {
    if (showMobileFilters && mobileFilterRef.current) {
      mobileFilterRef.current.scrollTop = 0;
    }
  }, [showMobileFilters]);

  // Index products for Lucene-like search
  useEffect(() => {
    if (PRODUCTS.length > 0) {
      productSearch.indexItems(PRODUCTS);
    }
  }, [PRODUCTS]);

  // Update search query if initialSearchQuery changes
  useEffect(() => {
    setSearchQuery(initialSearchQuery || '');
  }, [initialSearchQuery]);

  const normalizeString = (value: string) => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  useEffect(() => {
    if (!initialSearchQuery || CATEGORIES.length === 0) return;
    const normalizedQuery = normalizeString(initialSearchQuery);
    const matchingCategory = CATEGORIES.find((cat) =>
      normalizeString(cat.name || '') === normalizedQuery ||
      normalizeString(cat.slug || '') === normalizedQuery
    );
    if (matchingCategory) {
      setSelectedCategory(matchingCategory.name);
      setSearchQuery('');
    }
  }, [initialSearchQuery, CATEGORIES]);

  // Simulate loading when filters change
  useEffect(() => {
    setIsFiltering(true);
    setCurrentPage(1);
    const timer = setTimeout(() => setIsFiltering(false), 400);
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedCondition, onlyNewArrivals, searchQuery, sortBy, priceRange, isPriceFilterActive]);

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

  const [isVoiceSearching, setIsVoiceSearching] = useState(false);

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      sonnerToast.error("Votre navigateur ne supporte pas la recherche vocale.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsVoiceSearching(true);
      sonnerToast.info("Écoute en cours...");
    };

    recognition.onend = () => {
      setIsVoiceSearching(false);
    };

    recognition.onerror = (event: any) => {
      setIsVoiceSearching(false);
      if (event.error === 'not-allowed') {
        sonnerToast.error("Accès au microphone refusé. Veuillez vérifier vos paramètres.");
      } else {
        sonnerToast.error("Erreur lors de la recherche vocale. Réessayez.");
      }
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      sonnerToast.success(`Recherche : "${transcript}"`);
    };

    try {
      recognition.start();
    } catch (err) {
      setIsVoiceSearching(false);
    }
  };

  // 1. Get products matching the search query using Lucene-like search
  const searchedProducts = searchQuery.trim() 
    ? productSearch.search(searchQuery)
    : PRODUCTS;

  const filterProductPrice = (product: Product) => {
    if (typeof product.promoPrice === 'number' && product.promoPrice < product.price) {
      return product.promoPrice;
    }
    return product.price;
  };

  // 2. Filter the searched products by other criteria
  const filteredProducts = searchedProducts.filter(p => {
    const normalizeCategory = (value: string) => value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
    const allowedCategories = initialAllowedCategories?.map(normalizeCategory);
    const productCategory = normalizeCategory(p.category);
    const categoryFromCatalog = CATEGORIES.find(c => c.name === p.category)?.slug;
    const matchesAllowedCategory = !allowedCategories || allowedCategories.includes(productCategory) ||
      (categoryFromCatalog && allowedCategories.includes(normalizeCategory(categoryFromCatalog)));
    const matchesCategory = selectedCategory === 'Tous' || 
                           p.category === selectedCategory || 
                           CATEGORIES.find(c => c.name === p.category)?.slug === selectedCategory;
    const matchesCondition = selectedCondition === 'Tous' || (p.condition || 'new') === selectedCondition;
    const matchesNew = !onlyNewArrivals || p.isNew;
    const effectivePrice = filterProductPrice(p);
    const matchesPrice = !isPriceFilterActive || effectivePrice <= priceRange;
    
    return matchesAllowedCategory && matchesCategory && matchesCondition && matchesNew && matchesPrice;
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (isInitialLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="space-y-2">
            <div className="h-10 w-48 bg-primary/5 rounded-lg animate-pulse" />
            <div className="h-4 w-32 bg-primary/5 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-12">
          <aside className="hidden lg:block w-72 space-y-10">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-4">
                <div className="h-4 w-24 bg-primary/5 rounded animate-pulse" />
                <div className="space-y-2">
                  {[1, 2, 3].map(j => <div key={j} className="h-3 w-full bg-primary/5 rounded animate-pulse" />)}
                </div>
              </div>
            ))}
          </aside>
          <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => <ProductSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-2">{targetFlashSale ? targetFlashSale.name : 'Boutique'}</h1>
          <p className="text-primary/70">{filteredProducts.length} produits trouvés</p>
        </div>
        
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/70" size={18} />
              <input
                type="text"
                placeholder="Rechercher un produit"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 py-2 bg-card border border-primary/10 rounded-full focus:outline-none focus:border-accent w-full md:w-80 shadow-sm"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button 
                  onClick={startVoiceSearch}
                  className={`p-1.5 rounded-full transition-all ${isVoiceSearching ? 'bg-accent text-white animate-pulse' : 'text-primary/70 hover:text-accent hover:bg-primary/5'}`}
                  title="Recherche vocale"
                >
                  <Mic size={16} />
                </button>
                {imagePreview ? (
                  <button 
                    onClick={clearImageSearch}
                    className="p-1.5 bg-secondary text-primary/70 rounded-full hover:bg-secondary/80 transition-colors"
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
                className="appearance-none pl-4 pr-10 py-2 bg-card border border-primary/10 rounded-full focus:outline-none focus:border-accent cursor-pointer shadow-sm"
              >
                <option value="Nouveautés">Nouveautés</option>
                <option value="Prix croissant">Prix croissant</option>
                <option value="Prix décroissant">Prix décroissant</option>
                <option value="Mieux notés">Mieux notés</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/70 pointer-events-none" size={16} />
            </div>

            {/* Mobile Filter Toggle Button - Now at the top */}
            <button 
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-full font-bold shadow-sm hover:bg-accent transition-all text-sm"
            >
              <SlidersHorizontal size={16} />
              Filtres
              {filteredProducts.length !== PRODUCTS.length && (
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              )}
            </button>
          </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {showMobileFilters && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileFilters(false)}
                className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-50 lg:hidden"
              />
              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                ref={mobileFilterRef}
                className="fixed right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white z-50 p-8 overflow-y-auto lg:hidden shadow-2xl"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-serif">Filtres</h2>
                  <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>
                <FilterContent 
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  CATEGORIES={CATEGORIES}
                  PRODUCTS={PRODUCTS}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  isPriceFilterActive={isPriceFilterActive}
                  setIsPriceFilterActive={setIsPriceFilterActive}
                  selectedCondition={selectedCondition}
                  setSelectedCondition={setSelectedCondition}
                  onlyNewArrivals={onlyNewArrivals}
                  setOnlyNewArrivals={setOnlyNewArrivals}
                  setSearchQuery={setSearchQuery}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-72 space-y-10">
          <FilterContent 
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            CATEGORIES={CATEGORIES}
            PRODUCTS={PRODUCTS}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            isPriceFilterActive={isPriceFilterActive}
            setIsPriceFilterActive={setIsPriceFilterActive}
            selectedCondition={selectedCondition}
            setSelectedCondition={setSelectedCondition}
            onlyNewArrivals={onlyNewArrivals}
            setOnlyNewArrivals={setOnlyNewArrivals}
            setSearchQuery={setSearchQuery}
          />
        </aside>

        {/* Product Grid */}
        <main className="flex-grow relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {isFiltering ? (
              <motion.div 
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
              >
                {[1, 2, 3, 4, 5, 6].map(i => <ProductSkeleton key={i} />)}
              </motion.div>
            ) : (
              <motion.div 
                key="grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
              >
                {paginatedProducts.map((product) => (
                  <motion.div key={product.id} variants={itemVariants}>
                    <ProductCard 
                      product={product} 
                      onAddToCart={onAddToCart}
                      onAddToWishlist={onAddToWishlist}
                      onQuickView={onQuickView}
                      onAddToComparison={onAddToComparison}
                      onClick={onProductClick}
                      events={events}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          {!isFiltering && filteredProducts.length === 0 && (
            <div className="text-center py-24">
              <p className="text-xl text-primary/70 font-serif italic">Aucun produit ne correspond à votre recherche.</p>
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
