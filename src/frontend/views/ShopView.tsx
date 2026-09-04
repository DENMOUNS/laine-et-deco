import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';

import { useEntity } from '../hooks/useEntity';
import { FlashSale, Product, PromoEvent } from '../../types';
import { analyzeProductImage } from '../utils/aiUtils';
import { useProducts } from '../hooks/useProducts';
import { productSearch } from '../utils/searchUtils';
import { ShopFilterContent } from './shop/ShopFilterContent';
import { ShopHeader } from './shop/ShopHeader';
import { ShopActiveFilters } from './shop/ShopActiveFilters';
import { ShopProductGrid } from './shop/ShopProductGrid';
import { ShopLoadingSkeleton } from './shop/ShopLoadingSkeleton';

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
  const [onlyPromotions, setOnlyPromotions] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [sortBy, setSortBy] = useState('Nouveautés');
  const [priceRange, setPriceRange] = useState(300000);
  const [isPriceFilterActive, setIsPriceFilterActive] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
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
  }, [selectedCategory, selectedCondition, onlyNewArrivals, onlyPromotions, searchQuery, sortBy, priceRange, isPriceFilterActive]);

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
    const hasPromo = (typeof p.promoPrice === 'number' && p.promoPrice > 0 && p.promoPrice < p.price) || 
                     (events && events.some(e => e.status === 'active' && (e.applyToAll || e.productIds?.includes(p.id))));
    const matchesPromotion = !onlyPromotions || hasPromo;
    const effectivePrice = filterProductPrice(p);
    const matchesPrice = !isPriceFilterActive || effectivePrice <= priceRange;
    
    return matchesAllowedCategory && matchesCategory && matchesCondition && matchesNew && matchesPromotion && matchesPrice;
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
    return <ShopLoadingSkeleton />;
  }

  const isAnyFilterActive = selectedCategory !== 'Tous' || onlyPromotions || onlyNewArrivals || selectedCondition !== 'Tous' || isPriceFilterActive || !!searchQuery.trim();

  const resetAllFilters = () => {
    setSelectedCategory('Tous');
    setSelectedCondition('Tous');
    setOnlyNewArrivals(false);
    setOnlyPromotions(false);
    setSearchQuery('');
    setPriceRange(300000);
    setIsPriceFilterActive(false);
    setCurrentPage(1);
    sonnerToast.info("Tous les filtres ont été réinitialisés.");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      <ShopHeader
        targetFlashSale={targetFlashSale}
        filteredCount={filteredProducts.length}
        totalProductsCount={PRODUCTS.length}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        startVoiceSearch={startVoiceSearch}
        isVoiceSearching={isVoiceSearching}
        imagePreview={imagePreview}
        clearImageSearch={clearImageSearch}
        handleImageSearch={handleImageSearch}
        isAnalyzingImage={isAnalyzingImage}
        fileInputRef={fileInputRef}
        sortBy={sortBy}
        setSortBy={setSortBy}
        setShowMobileFilters={setShowMobileFilters}
        isAnyFilterActive={isAnyFilterActive}
      />

      <ShopActiveFilters
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        CATEGORIES={CATEGORIES}
        PRODUCTS={PRODUCTS}
        onlyPromotions={onlyPromotions}
        setOnlyPromotions={setOnlyPromotions}
        onlyNewArrivals={onlyNewArrivals}
        setOnlyNewArrivals={setOnlyNewArrivals}
        selectedCondition={selectedCondition}
        setSelectedCondition={setSelectedCondition}
        isPriceFilterActive={isPriceFilterActive}
        setIsPriceFilterActive={setIsPriceFilterActive}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isAnyFilterActive={isAnyFilterActive}
        onResetAllFilters={resetAllFilters}
      />

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
                <ShopFilterContent 
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
                  onlyPromotions={onlyPromotions}
                  setOnlyPromotions={setOnlyPromotions}
                  setSearchQuery={setSearchQuery}
                />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-72 space-y-10">
          <ShopFilterContent 
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
            onlyPromotions={onlyPromotions}
            setOnlyPromotions={setOnlyPromotions}
            setSearchQuery={setSearchQuery}
          />
        </aside>

        <ShopProductGrid
          isFiltering={isFiltering}
          filteredProducts={filteredProducts}
          paginatedProducts={paginatedProducts}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
          onQuickView={onQuickView}
          onAddToComparison={onAddToComparison}
          onProductClick={onProductClick}
          events={events}
          CATEGORIES={CATEGORIES}
          resetAllFilters={resetAllFilters}
          setSelectedCategory={setSelectedCategory}
          setOnlyPromotions={setOnlyPromotions}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>
    </div>
  );
};
