import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Package, Truck, ShieldCheck, Heart, Calendar, User, Search, Camera, Zap, Clock, Loader2, Mic, X as CloseIcon, HelpCircle, Star, Sparkles, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

import { useStaticEntity } from '../hooks/useStaticEntity';
import { useHeroBannersService } from '../hooks/useHeroBannersService';
import { useLoadingSequence, setHeroReady } from '../hooks/useLoadingSequence';
import { where, orderBy, limit as fsLimit } from 'firebase/firestore';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';
import { Product, SiteConfig, PromoEvent, Pack, FlashSale, Lookbook, HeroBannerConfig } from '../../types';
import { AdBanner } from '../components/AdBanner';
import { productSearch } from '../utils/searchUtils';
import { useDeferUntilInteraction } from '../hooks/useAfterIdle';
import { optimizeImageUrl } from '../utils/imageUtils';
import { cleanText } from '../utils/siteUtils';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { YarnLoadingBanner } from '../components/ui/YarnLoadingBanner';
import { HeroTrustWidget } from '../components/ui/HeroTrustWidget';
import { CategorySkeleton, ContentCardSkeleton, ProductSkeleton, Skeleton } from '../components/ui/Skeleton';
import { toast } from 'sonner';
import { isFeatureEnabled } from '../utils/featureFlags';

const CountdownTimer: React.FC<{ endDate: string; compact?: boolean }> = ({ endDate, compact }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(endDate).getTime() - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 font-mono text-xs text-white">
        <div className="bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-0.5">
          <span className="text-xs font-bold text-amber-300">{timeLeft.hours.toString().padStart(2, '0')}</span>
          <span className="text-[9px] text-white/70 font-sans">h</span>
        </div>
        <span className="text-white/50 text-[10px]">:</span>
        <div className="bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-0.5">
          <span className="text-xs font-bold text-amber-300">{timeLeft.minutes.toString().padStart(2, '0')}</span>
          <span className="text-[9px] text-white/70 font-sans">m</span>
        </div>
        <span className="text-white/50 text-[10px]">:</span>
        <div className="bg-black/30 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-0.5">
          <span className="text-xs font-bold text-amber-300">{timeLeft.seconds.toString().padStart(2, '0')}</span>
          <span className="text-[9px] text-white/70 font-sans">s</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      {[
        { label: 'Heures', value: timeLeft.hours },
        { label: 'Min', value: timeLeft.minutes },
        { label: 'Sec', value: timeLeft.seconds },
      ].map((item, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="w-14 h-14 bg-card rounded-2xl flex items-center justify-center text-xl font-bold text-accent shadow-sm border border-primary/10">
            {item.value.toString().padStart(2, '0')}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 mt-2">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

interface HomeViewProps {
  onNavigate: (view: string, id?: string, query?: string) => void;
  onAddToCart: (p: Product) => void;
  onAddToWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onAddToComparison: (p: Product) => void;
  onProductClick: (p: Product) => void;
  siteConfig: SiteConfig;
  events?: PromoEvent[];
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onAddToCart, onAddToWishlist, onQuickView, onAddToComparison, onProductClick, siteConfig, events = [] }) => {
  const { isMarqueeReady, isAllReady } = useLoadingSequence();
  const isLookbookEnabled = isFeatureEnabled({ featureFlags: siteConfig.featureFlags }, 'lookbook');
  const isBlogEnabled = isFeatureEnabled({ featureFlags: siteConfig.featureFlags }, 'blog');

  // Étape 2 : Chargement du Hero Banner via le Repository & Use-case dédié
  const { data: rawHeroBanners, isLoading: isHeroLoading } = useHeroBannersService({
    enabled: isMarqueeReady,
  });

  React.useEffect(() => {
    if (!isHeroLoading && isMarqueeReady) {
      setHeroReady(true);
    }
  }, [isHeroLoading, isMarqueeReady]);

  // Étape 3 : Chargement immédiat de toutes les entités
  const { products: fetchedProducts, isLoading: isProductsLoading, error: productsError } = useProducts({
    enabled: true,
  });
  const PRODUCTS = fetchedProducts;
  const secondaryOpts = { enabled: true };
  const { data: CATEGORIES, isLoading: isCategoriesLoading, error: categoriesError } = useStaticEntity<any>('category', [], secondaryOpts);
  const { data: BLOG_POSTS, isLoading: isBlogLoading, error: blogError } = useStaticEntity<any>('blog_post', [], secondaryOpts);
  const { data: PACKS, isLoading: isPacksLoading, error: packsError } = useStaticEntity<any>('pack', [], secondaryOpts);
  const { data: RECENT_FLASH_SALES, isLoading: isFlashSalesLoading, error: flashSalesError } = useStaticEntity<FlashSale>('flash_sale', [], secondaryOpts);
  const { data: LOOKBOOKS, isLoading: isLookbooksLoading, error: lookbooksError } = useStaticEntity<Lookbook>('lookbook', [], secondaryOpts);

  const HERO_BANNERS = React.useMemo(() => {
    return (rawHeroBanners || [])
      .filter((b) => !b.status || ['active', 'actif', 'true', '1', true].includes(b.status as any))
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
      .slice(0, 50);
  }, [rawHeroBanners]);
  const activeFlashSales = RECENT_FLASH_SALES.filter(fs =>
    fs.status === 'active' &&
    new Date(fs.endDate) > new Date() &&
    Array.isArray(fs.items) &&
    fs.items.length > 0 &&
    fs.items.some((item) => PRODUCTS.some((product) => product.id === item.productId))
  );
  const activeLookbooks = LOOKBOOKS.filter(lb => lb.status === 'active');
  const visiblePacks = PACKS.filter((pack) => Array.isArray(pack.products) && pack.products.length > 0);

  const [showOnlyPromos, setShowOnlyPromos] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isAnalyzingImage, setIsAnalyzingImage] = React.useState(false);
  const [isVoiceSearching, setIsVoiceSearching] = React.useState(false);
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [isTrackingExpanded, setIsTrackingExpanded] = React.useState(false);
  const [trackingNumber, setTrackingNumber] = React.useState('');
  const [trackingStatus, setTrackingStatus] = React.useState<{ steps: { label: string, date: string, completed: boolean }[] } | null>(null);
  const [isTrackingLoading, setIsTrackingLoading] = React.useState(false);
  const [liveSearchResults, setLiveSearchResults] = React.useState<Product[]>([]);
  const HERO_SLIDES = HERO_BANNERS.map((item) => ({
    image: optimizeImageUrl(item.image, 960),
    title: item.title,
    subtitle: item.subtitle,
    ctaText: item.ctaText || 'Découvrir la boutique',
    // Lien CTA configurable : si item.link est renseigné on l'utilise, sinon boutique par défaut
    link: (item.link || 'shop') as string,
  }));

  const currentHeroSlide = HERO_SLIDES[currentSlide] ?? HERO_SLIDES[0] ?? null;

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  // Défilement automatique du carrousel Hero (toutes les 7 secondes)
  React.useEffect(() => {
    if (HERO_SLIDES.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 15_000);
    return () => clearInterval(timer);
  }, [HERO_SLIDES.length]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Index products for Lucene-like search
  React.useEffect(() => {
    if (PRODUCTS.length > 0) {
      productSearch.indexItems(PRODUCTS);
    }
  }, [PRODUCTS]);

  // Update live search results
  React.useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const results = productSearch.search(searchQuery);
      setLiveSearchResults(results.slice(0, 4)); // Show top 4 results
    } else {
      setLiveSearchResults([]);
    }
  }, [searchQuery]);

  // (timer unique géré ci-dessus, pas de doublon)

  const featuredProducts = PRODUCTS.filter(p => siteConfig.homeFeaturedProducts.includes(p.id));
  const featuredCategories = CATEGORIES.filter(c => siteConfig.homeFeaturedCategories.includes(c.id));

  const activeFlashSale = activeFlashSales[0];
  const flashSaleEndDate = activeFlashSale ? activeFlashSale.endDate : new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString();
  const flashSaleProduct = PRODUCTS.find(p => activeFlashSale?.items?.some(i => i.productId === p.id)) || null;
  const flashSalePrice = flashSaleProduct
    ? (activeFlashSale?.items?.find(i => i.productId === flashSaleProduct.id)?.flashPrice ?? flashSaleProduct.salePrice ?? flashSaleProduct.price)
    : 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('shop', undefined, searchQuery);
    }
  };

  const handleImageSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setIsAnalyzingImage(true);
      
      const { analyzeProductImage } = await import('../utils/aiUtils');
      const keywords = await analyzeProductImage(base64);
      if (keywords) {
        onNavigate('shop', undefined, keywords);
      }
      setIsAnalyzingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error("Votre navigateur ne supporte pas la recherche vocale.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsVoiceSearching(true);
      toast.info("Écoute en cours...");
    };

    recognition.onend = () => {
      setIsVoiceSearching(false);
    };

    recognition.onerror = (event: any) => {
      setIsVoiceSearching(false);
      if (event.error === 'not-allowed') {
        toast.error("Accès au microphone refusé. Veuillez vérifier vos paramètres.");
      } else {
        toast.error("Erreur lors de la recherche vocale. Réessayez.");
      }
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      onNavigate('shop', undefined, transcript);
      toast.success(`Recherche : "${transcript}"`);
    };

    try {
      recognition.start();
    } catch (err) {
      setIsVoiceSearching(false);
    }
  };

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) return;
    setIsTrackingLoading(true);
    setTrackingStatus(null);
    
    setTimeout(() => {
      setIsTrackingLoading(false);
      // Demo case: "123456" shows full progress
      if (trackingNumber === '123456') {
        setTrackingStatus({
          steps: [
            { label: 'Commande reçue', date: '01/03/2026', completed: true },
            { label: 'Préparation', date: '02/03/2026', completed: true },
            { label: 'Expédiée', date: '03/03/2026', completed: true },
            { label: 'En livraison', date: '04/03/2026', completed: true },
            { label: 'Livrée', date: '05/03/2026', completed: true },
          ]
        });
      } else if (trackingNumber.includes('123')) {
        setTrackingStatus({
          steps: [
            { label: 'Commande reçue', date: '05/03/2026', completed: true },
            { label: 'Préparation', date: '06/03/2026', completed: true },
            { label: 'Expédiée', date: 'En attente', completed: false },
            { label: 'Livrée', date: 'En attente', completed: false },
          ]
        });
      } else {
        setTrackingStatus(null);
        toast.error("Commande introuvable. Essayez '123456' pour voir un exemple complet.");
      }
    }, 1500);
  };

  return (
    <motion.div className="relative space-y-10 sm:space-y-16 md:space-y-24 pb-24">
      {isSearchFocused && (
        <button
          type="button"
          aria-label="Fermer la recherche"
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40] cursor-default animate-in fade-in duration-200"
          onClick={() => setIsSearchFocused(false)}
        />
      )}
      <AdBanner />
      
      {/* Hero Section Slider — Card soignée sur mobile avec bordures douces et hauteur adaptée */}
      <section className="relative min-h-[500px] h-auto py-12 sm:py-16 md:py-0 md:h-[600px] lg:h-[680px] xl:h-[720px] flex items-center overflow-hidden mx-2.5 sm:mx-4 md:mx-0 rounded-[2rem] md:rounded-none shadow-md md:shadow-none">
        {/* Background */}
        <div className="absolute inset-0 z-0 bg-slate-950">
          {isHeroLoading || HERO_SLIDES.length === 0 ? (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-primary/80" />
          ) : (
            <>
              <AnimatePresence mode="sync">
                {HERO_SLIDES.map((slide, i) => {
                  if (i !== currentSlide) return null;
                  if (slide.image.endsWith('.mp4')) {
                    return (
                      <motion.video
                        key={`video-${i}`}
                        src={slide.image}
                        autoPlay
                        muted
                        loop
                        playsInline
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.75 }}
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      />
                    );
                  }
                  return (
                    <motion.img
                      key={`img-${i}`}
                      src={slide.image}
                      alt={slide.title || 'Collection Laine et Déco'}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.75 }}
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      referrerPolicy="no-referrer"
                      loading={i === 0 ? "eager" : "lazy"}
                      decoding="async"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1280px"
                    />
                  );
                })}
              </AnimatePresence>
              <div className="absolute inset-0 bg-black/40 pointer-events-none z-[1]" aria-hidden />
            </>
          )}
        </div>
        
        {/* Content Overlay — Recherche et animation de chargement parfaitement ordonnées */}
        <div className={`relative ${isSearchFocused ? 'z-[50]' : 'z-10'} max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full`}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
            <div className="lg:col-span-7 text-white">
            {/* Carte de chargement SVG (Pelote & message) — AU-DESSUS de la barre de recherche */}
            {(isHeroLoading || HERO_SLIDES.length === 0) && (
              <YarnLoadingBanner />
            )}

            {/* Animated Title/Subtitle/CTA — Quand les bannières sont chargées */}
            {!isHeroLoading && HERO_SLIDES.length > 0 && currentHeroSlide?.title && (
              <motion.div key={currentSlide} className="mb-6 space-y-4 animate-hero-fade-in">
                {/* Header row: Subtitle + Mobile Slider Counter without overlapping */}
                <div className="flex items-center justify-between gap-3">
                  {currentHeroSlide.subtitle ? (
                    <span className="block text-xs sm:text-sm font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/90 leading-relaxed max-w-xl whitespace-normal break-words">
                      {currentHeroSlide.subtitle}
                    </span>
                  ) : <div />}

                  {HERO_SLIDES.length > 1 && (
                    <div className="md:hidden flex items-center gap-1 bg-black/40 backdrop-blur-xl px-2.5 py-1 rounded-full text-white shrink-0 shadow-lg">
                      <button
                        type="button"
                        aria-label="Bannière précédente"
                        onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                        className="p-1 hover:bg-white/20 active:scale-90 rounded-full transition-all text-white/90 hover:text-white"
                      >
                        <ChevronLeft size={15} />
                      </button>
                      <span className="text-[11px] font-bold tracking-wider px-1 text-white/95">
                        {currentSlide + 1} / {HERO_SLIDES.length}
                      </span>
                      <button
                        type="button"
                        aria-label="Bannière suivante"
                        onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
                        className="p-1 hover:bg-white/20 active:scale-90 rounded-full transition-all text-white/90 hover:text-white"
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif leading-[1.1] text-white">
                  {currentHeroSlide.title}
                </h1>
                {currentHeroSlide.ctaText && (
                  <div className="pt-2">
                    <button 
                      onClick={() => onNavigate(currentHeroSlide.link || 'shop')}
                      className="bg-white text-slate-900 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold hover:bg-accent hover:text-white transition-all duration-300 inline-flex items-center group shadow-xl animate-shine text-sm sm:text-base cursor-pointer"
                    >
                      {currentHeroSlide.ctaText}
                      <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={18} />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Static Controls */}
            <div className="max-w-3xl mt-6 sm:mt-12 md:mt-24 mb-4 sm:mb-8 md:mb-12 relative z-50" ref={searchContainerRef}>
              <form onSubmit={handleSearch} className="relative group">
                {/* ... search input ... */}
                <label htmlFor="home-search" className="sr-only">
                  Rechercher
                </label>
                <div className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors z-10 ${isSearchFocused ? 'text-accent' : 'text-white'}`} aria-hidden="true">
                  <Search size={24} />
                </div>
                <input
                  id="home-search"
                  type="search"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  autoComplete="off"
                  className={`w-full backdrop-blur-2xl border rounded-full py-3.5 sm:py-6 pl-14 sm:pl-16 pr-32 sm:pr-48 text-base sm:text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-all shadow-2xl relative z-0 ${
                    isSearchFocused 
                      ? 'bg-white/95 border-white text-primary placeholder:text-primary' 
                      : 'bg-white/10 border-white/20 text-white placeholder:text-white hover:bg-white/15'
                  }`}
                />
                <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 sm:gap-2 z-10">
                  <button 
                    type="button"
                    onClick={startVoiceSearch}
                    aria-label="Recherche vocale"
                    className={`p-2 sm:p-3 rounded-full transition-all flex items-center gap-2 ${
                      isVoiceSearching ? 'bg-accent text-white animate-pulse' : (isSearchFocused ? 'bg-primary/5 text-primary hover:bg-primary/10' : 'bg-white/10 text-white hover:bg-white/20')
                    }`}
                    title="Recherche vocale"
                  >
                    <Mic size={18} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Rechercher par image"
                    className={`p-2 sm:p-3 rounded-full transition-all flex items-center gap-2 ${
                      isSearchFocused ? 'bg-primary/5 text-primary hover:bg-primary/10' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                    title="Rechercher par image"
                  >
                    {isAnalyzingImage ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                  </button>
                  <button
                    type="submit"
                    aria-label="Lancer la recherche"
                    className="bg-accent text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold hover:bg-primary transition-all shadow-lg text-sm sm:text-base"
                  >
                    Go
                  </button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageSearch} 
                  accept="image/*" 
                  className="hidden" 
                />
              </form>

              {/* ... tracking ... */}
              <div className="mt-4 sm:mt-6 flex flex-col items-center sm:items-start">
                {!isTrackingExpanded ? (
                  <button 
                    onClick={() => setIsTrackingExpanded(true)}
                    className="flex items-center gap-2 text-white/90 hover:text-accent transition-all text-sm font-bold uppercase tracking-widest bg-white/5 px-6 py-2.5 sm:py-3 rounded-full backdrop-blur-2xl border border-white/10 hover:bg-white/10 hover:scale-105 active:scale-95 shadow-xl"
                  >
                    <Package size={16} />
                    Suivre ma commande
                  </button>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 sm:p-8 rounded-[2.5rem] w-full max-w-md relative shadow-2xl"
                  >
                    <button 
                      aria-label="Fermer le suivi de commande"
                      onClick={() => setIsTrackingExpanded(false)}
                      className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                    >
                      <CloseIcon size={20} />
                    </button>
                    <form onSubmit={handleTrackOrder} className="flex gap-2 mb-4">
                      <input 
                        type="text" 
                        placeholder="N° de commande (ex: 123456)" 
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="flex-grow bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white placeholder:text-white/70 focus:outline-none focus:border-accent text-sm"
                      />
                      <button 
                        type="submit" 
                        disabled={isTrackingLoading || !trackingNumber.trim()}
                        className="bg-accent text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-primary transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isTrackingLoading ? <Loader2 size={16} className="animate-spin" /> : 'Suivre'}
                      </button>
                    </form>
                    <AnimatePresence>
                      {trackingStatus && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 pt-4"
                        >
                          {trackingStatus.steps.map((step, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center border ${step.completed ? 'bg-accent border-accent' : 'border-white/30'}`}>
                                {step.completed && <div className="w-2 h-2 bg-white rounded-full" />}
                              </div>
                              <div>
                                <p className={`text-sm font-bold ${step.completed ? 'text-white' : 'text-white/70'}`}>{step.label}</p>
                                <p className="text-xs text-white/70">{step.date}</p>
                              </div>
                            </div>
                          ))}
                          <button 
                            onClick={() => {
                              setTrackingStatus(null);
                              setIsTrackingExpanded(false);
                              setTrackingNumber('');
                            }}
                            className="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors border border-white/10"
                          >
                            Terminer le suivi
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>

              {/* Expanded Search Panel */}
              <AnimatePresence>
                {isSearchFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    className="relative mt-8 bg-white/98 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 p-8 text-primary overflow-hidden text-left z-[100]"
                  >
                    <button 
                      aria-label="Fermer la recherche"
                      onClick={() => setIsSearchFocused(false)}
                      className="absolute top-4 right-4 text-primary/70 hover:text-primary transition-colors z-10"
                    >
                      <CloseIcon size={20} />
                    </button>
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="flex-1">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-4 flex items-center gap-2">
                          <Search size={14} /> {liveSearchResults.length > 0 ? 'Résultats en direct' : 'Recherche textuelle'}
                        </h3>
                        {liveSearchResults.length > 0 ? (
                          <div className="space-y-3">
                            {liveSearchResults.map(product => (
                              <button
                                key={product.id}
                                onClick={() => onProductClick(product)}
                                className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-primary/5 transition-all text-left group border border-transparent hover:border-primary/5"
                              >
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary border border-primary/5 flex-shrink-0 shadow-sm">
                                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" loading="lazy" width="64" height="64" />
                                </div>
                                <div className="flex-grow">
                                  <h4 className="text-base font-bold group-hover:text-accent transition-colors line-clamp-1">{product.name}</h4>
                                  <p className="text-[10px] text-primary/70 uppercase tracking-widest font-bold mt-1">{product.category}</p>
                                  <p className="text-sm font-serif italic text-accent mt-1">{product.price}€</p>
                                </div>
                                <ArrowRight size={18} className="text-primary/70 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                              </button>
                            ))}
                            <button 
                              onClick={() => onNavigate('shop', undefined, searchQuery)}
                              className="w-full mt-4 py-4 text-center text-sm font-bold text-white bg-primary rounded-2xl hover:bg-accent transition-all shadow-lg shadow-primary/10"
                            >
                              Voir les {liveSearchResults.length}+ résultats dans la boutique
                            </button>
                          </div>
                        ) : (
                          <p className="text-sm text-primary/70 mb-4 leading-relaxed">
                            Saisissez ce que vous cherchez. Exemples : <br/>
                            <span className="font-bold text-primary mt-2 inline-block">"Laine mérinos rouge"</span><br/>
                            <span className="font-bold text-primary">"Vase en céramique"</span>
                          </p>
                        )}
                      </div>
                      <div className="w-px bg-primary/10 hidden sm:block"></div>
                      <div className="flex-1">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-4 flex items-center gap-2">
                          <Camera size={14} /> Recherche visuelle
                        </h3>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-primary/20 hover:border-accent rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-colors group bg-slate-50 hover:bg-primary/5"
                        >
                          {isAnalyzingImage ? (
                            <>
                              <Loader2 size={32} className="animate-spin text-accent" />
                              <span className="text-sm font-bold text-accent">Analyse en cours...</span>
                            </>
                          ) : (
                            <>
                              <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-primary/70 group-hover:text-accent group-hover:scale-110 transition-all">
                                <Camera size={24} />
                              </div>
                              <span className="text-sm font-bold text-primary/70 group-hover:text-accent">Importer une photo</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CTA handled in header block */}
            </div>

            {/* Colonne de Droite (Desktop) — Widget de Réassurance & Avantages clés Artisanats */}
            <div className="lg:col-span-5 hidden lg:block">
              <HeroTrustWidget onNavigate={onNavigate} />
            </div>
          </div>

          {/* Desktop Left / Right Arrows */}
          {HERO_SLIDES.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Bannière précédente"
                onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                className="hidden md:flex absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 z-30 p-3.5 lg:p-4 bg-white/15 hover:bg-white/30 text-white rounded-full backdrop-blur-2xl border border-white/20 transition-all shadow-2xl cursor-pointer hover:scale-105 active:scale-95 items-center justify-center"
              >
                <ChevronLeft size={26} />
              </button>
              <button
                type="button"
                aria-label="Bannière suivante"
                onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
                className="hidden md:flex absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 z-30 p-3.5 lg:p-4 bg-white/15 hover:bg-white/30 text-white rounded-full backdrop-blur-2xl border border-white/20 transition-all shadow-2xl cursor-pointer hover:scale-105 active:scale-95 items-center justify-center"
              >
                <ChevronRight size={26} />
              </button>
            </>
          )}



          {/* Scroll Indicator — invite l'utilisateur à défiler vers les produits */}
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 hidden sm:flex flex-col items-center gap-1 text-white/70 hover:text-white cursor-pointer"
            onClick={() => window.scrollTo({ top: window.innerHeight * 0.7, behavior: 'smooth' })}
            title="Découvrir la suite de la boutique"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Découvrir nos créations</span>
            <ChevronDown size={18} className="text-white" />
          </motion.div>
        </div>
      </section>

      {/* ── Mobile Story Highlights (Découverte Express Mobile) ── */}
      <section className="md:hidden px-3 -mt-4 sm:-mt-8">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar snap-x snap-mandatory">
          {[
            { label: 'Laines', icon: '🧶', view: 'shop', query: 'Laine', bg: 'from-amber-400 to-orange-500' },
            { label: 'Déco', icon: '🏺', view: 'shop', query: 'Décoration', bg: 'from-rose-400 to-pink-600' },
            { label: 'Packs', icon: '🎁', view: 'packs', bg: 'from-emerald-400 to-teal-600' },
            { label: 'Flash', icon: '⚡', view: 'flash-sales', bg: 'from-amber-500 to-red-500' },
            { label: 'Calculateur', icon: '🧮', view: 'calculator', bg: 'from-blue-400 to-indigo-600' },
            { label: 'Lookbook', icon: '📖', view: 'lookbook', bg: 'from-purple-400 to-violet-600' },
            { label: 'Personnaliser', icon: '🎨', view: 'knitting-configurator', bg: 'from-fuchsia-400 to-pink-500' },
          ].map((item, idx) => (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.92 }}
              onClick={() => onNavigate(item.view, undefined, item.query)}
              className="flex flex-col items-center gap-1.5 snap-start shrink-0 focus:outline-none group"
            >
              <div className={`w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr ${item.bg} shadow-sm group-hover:shadow-md transition-shadow`}>
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-xl backdrop-blur-sm group-hover:scale-105 transition-transform">
                  <span>{item.icon}</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold tracking-tight text-primary/85 dark:text-white/90 truncate max-w-[62px]">
                {item.label}
              </span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Flash Sale Section */}
      {activeFlashSale && flashSaleProduct && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Mobile Flash Sale Layout ── */}
        <div className="md:hidden bg-gradient-to-br from-primary via-primary/95 to-slate-900 rounded-[2rem] p-5 relative overflow-hidden text-white shadow-xl border border-primary/20">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar: Live Badge & Compact Countdown */}
          <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Zap size={14} className="animate-pulse" fill="currentColor" />
              <span>Vente Flash</span>
            </div>
            <CountdownTimer endDate={flashSaleEndDate} compact />
          </div>

          {/* Product Spotlight */}
          <div className="relative z-10 space-y-3.5">
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black/20 shadow-inner group">
              <img 
                src={flashSaleProduct?.image || 'https://picsum.photos/seed/flash/600/600'} 
                alt={flashSaleProduct?.name || "Vente Flash"} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                loading="lazy"
                width={400}
                height={250}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Discount Tag */}
              <div className="absolute top-3 left-3 bg-accent text-primary font-black text-xs px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wider">
                Jusqu'à -40%
              </div>

              {/* Price Pill */}
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-white/70">Prix exceptionnel</p>
                  <p className="text-xl font-bold text-amber-300">{flashSalePrice.toLocaleString()} FCFA</p>
                </div>
                {flashSaleProduct.price && flashSaleProduct.price > flashSalePrice && (
                  <span className="text-xs line-through text-white/50 mb-0.5">
                    {flashSaleProduct.price.toLocaleString()} FCFA
                  </span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-serif text-white leading-snug">
                Offre limitée sur la <span className="text-accent italic">Collection Hiver</span>
              </h3>
              <p className="text-xs text-white/75 mt-1 line-clamp-2">
                Profitez de remises exclusives sur une sélection de laines et objets déco artisanaux.
              </p>
            </div>

            <Button 
              onClick={() => onNavigate('shop')}
              className="w-full py-3.5 bg-gradient-to-r from-accent to-amber-500 hover:from-amber-500 hover:to-accent text-primary font-bold shadow-lg shadow-accent/20 rounded-xl flex items-center justify-center gap-2 text-sm"
            >
              <span>En profiter maintenant</span>
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>

        {/* ── Desktop / Tablet Flash Sale Layout ── */}
        <div className="hidden md:block bg-primary rounded-[3rem] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 skew-x-12 translate-x-1/4" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center">
            <div className="w-full lg:w-1/2 p-12 md:p-20 space-y-8">
              <div className="flex items-center gap-3 text-accent font-bold uppercase tracking-widest text-sm">
                <Zap size={20} fill="currentColor" />
                <span>Vente Flash Exceptionnelle</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-serif text-white leading-tight">
                Offre limitée sur la <span className="italic text-accent">Collection Hiver</span>
              </h2>
              <p className="text-white text-lg max-w-md">
                Profitez de remises allant jusqu'à -40% sur une sélection exclusive de laines et objets déco.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-widest">
                  <Clock size={14} />
                  <span>Se termine dans :</span>
                </div>
                <CountdownTimer endDate={flashSaleEndDate} />
              </div>

              <Button 
                onClick={() => onNavigate('shop')}
                className="px-10 py-4 animate-shine"
              >
                En profiter maintenant
              </Button>
            </div>
            
            <div className="w-full lg:w-1/2 p-12 lg:p-0">
              <div className="relative aspect-square max-w-md mx-auto">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-full"
                />
                <img 
                  src={flashSaleProduct?.image || 'https://picsum.photos/seed/flash/600/600'} 
                  alt={flashSaleProduct?.name || "Vente Flash"} 
                  className="w-full h-full object-cover rounded-full relative z-10"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  width={400}
                  height={400}
                />
                <div className="absolute top-1/4 -right-4 bg-white p-4 rounded-2xl shadow-2xl z-20 rotate-12">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">À partir de</p>
                  <p className="text-2xl font-bold text-accent">{flashSalePrice.toLocaleString()} FCFA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {isLookbookEnabled && (
        isLookbooksLoading || lookbooksError ? (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-3 mb-10"><Skeleton className="h-3 w-1/4" /><Skeleton className="h-10 w-1/2" /><Skeleton className="h-4 w-2/3" /></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><ContentCardSkeleton /><ContentCardSkeleton /><ContentCardSkeleton /></div>
          </section>
        ) : activeLookbooks.length > 0 ? (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Inspiration</span>
                <h2 className="text-4xl font-serif">Notre Lookbook</h2>
                <p className="text-primary/70 mt-2 max-w-xl">Explorez des idées de décoration, des ambiances laine et des looks créatifs pour vos projets déco.</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('lookbook')}
                className="text-primary font-bold border-b-2 border-primary/20 hover:border-accent hover:text-accent transition-all pb-1"
              >
                Voir tout
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activeLookbooks.slice(0, 3).map((lookbook) => (
                <button
                  key={lookbook.id}
                  type="button"
                  onClick={() => onNavigate('lookbook')}
                  className="group overflow-hidden rounded-[2rem] bg-white border border-primary/10 shadow-sm hover:shadow-lg transition-shadow text-left"
                >
                  <div className="relative h-64 overflow-hidden">
                    <ImageWithFallback
                      src={optimizeImageUrl(lookbook.image, 800)}
                      alt={lookbook.title || 'Lookbook'}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      width={800}
                      height={640}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  </div>
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-[0.3em] text-accent font-bold mb-2">Lookbook</p>
                    <h3 className="text-xl font-serif text-primary mb-2">{lookbook.title}</h3>
                    {lookbook.description && <p className="text-sm text-primary/70 line-clamp-3">{lookbook.description}</p>}
                  </div>
                </button>
              ))}
            </div>
          </section>
        ) : null
      )}

      {/* Wool Calculator Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-[3rem] p-8 md:p-16 border border-primary/10 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
          <div className="w-full md:w-1/2 space-y-6 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Nouveau Outil</span>
            <h2 className="text-4xl font-serif text-primary">Calculateur de Pelotes</h2>
            <p className="text-primary/70 text-lg">
              Vous ne savez pas combien de pelotes acheter pour votre prochain projet ? 
              Utilisez notre calculateur intelligent pour estimer la quantité exacte de laine nécessaire pour votre pull, écharpe ou bonnet.
            </p>
            <Button 
              onClick={() => onNavigate('calculator')}
              className="px-8 py-4 flex items-center gap-2 animate-shine"
            >
              <Package size={20} />
              Calculer maintenant
            </Button>
          </div>
          <div className="w-full md:w-1/2 relative flex justify-center h-[400px]">
            <div className="relative w-64 h-64 bg-white rounded-full flex items-center justify-center shadow-2xl border-8 border-white/20">
              <span className="text-9xl font-serif text-accent">?</span>
              
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 bg-white p-4 rounded-2xl shadow-xl rotate-12"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Package className="text-accent" />
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-5 -left-10 bg-white p-4 rounded-2xl shadow-xl -rotate-6"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <div className="w-8 h-1 bg-primary rounded-full rotate-45" />
                  <div className="w-8 h-1 bg-primary rounded-full -rotate-45 absolute" />
                </div>
              </motion.div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
             
             {/* Floating elements */}
             <motion.div 
                animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                className="absolute top-10 left-10 bg-white p-4 rounded-2xl shadow-lg z-20"
             >
                <span className="text-4xl">🧶</span>
             </motion.div>
             <motion.div 
                animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 2 }}
                className="absolute bottom-20 right-10 bg-white p-4 rounded-2xl shadow-lg z-20"
             >
                <span className="text-4xl">📏</span>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Slider */}
      {(() => {
        const featuredProduct = PRODUCTS.find(p => siteConfig.homeFeaturedProducts?.includes(p.id)) || PRODUCTS[0];
        if (!featuredProduct) return null;
        const cleanedDescription = cleanText(featuredProduct.description) || "Une création d'exception façonnée avec des matières nobles pour sublimer vos projets les plus précieux.";
        return (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-stone-50 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-800 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 md:p-20 overflow-hidden relative border border-primary/5 shadow-sm">
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                <div className="w-full md:w-1/2 space-y-4 sm:space-y-6 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[11px] sm:text-xs font-bold uppercase tracking-widest">
                    <span>Création d'Exception</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif text-primary leading-tight">{featuredProduct.name}</h2>
                  <p className="text-primary/75 text-sm sm:text-base md:text-lg line-clamp-3 leading-relaxed">{cleanedDescription}</p>
                  
                  <div className="pt-2 flex items-center gap-4">
                    <span className="text-xl sm:text-3xl font-bold text-primary font-serif">{featuredProduct.price.toLocaleString()} FCFA</span>
                    <Button 
                      onClick={() => onProductClick(featuredProduct)}
                      className="px-6 py-3 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
                    >
                      <span>Découvrir l'ouvrage</span>
                      <ArrowRight size={15} className="ml-1.5" />
                    </Button>
                  </div>
                </div>

                <div className="w-full md:w-1/2 relative">
                  <motion.div 
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10"
                  >
                    <ImageWithFallback 
                      src={optimizeImageUrl(featuredProduct.image, 800)} 
                      alt={featuredProduct.name} 
                      className="w-full aspect-[4/3] sm:aspect-square object-cover rounded-2xl sm:rounded-[3rem] shadow-xl"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      width={800}
                      height={800}
                    />
                  </motion.div>
                  <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
                  <div className="absolute -top-10 -left-10 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6 md:gap-8">
          {(siteConfig.features || [
            { iconName: "Package", title: "Qualité Premium", description: "Laines 100% naturelles" },
            { iconName: "Truck", title: "Livraison Rapide", description: "Offerte dès 200 000 FCFA" },
            { iconName: "ShieldCheck", title: "Paiement Sécurisé", description: "Transaction 100% protégée" },
            { iconName: "Heart", title: "Fait avec Amour", description: "Sélection artisanale" },
          ]).map((feature, i) => {
            const icons: Record<string, any> = { Package, Truck, ShieldCheck, Heart, HelpCircle };
            const IconComponent = icons[feature.iconName] || HelpCircle;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center p-4 sm:p-6 md:p-8 bg-card rounded-2xl sm:rounded-3xl shadow-xs border border-primary/5"
              >
                <div className="text-accent mb-2.5 sm:mb-4"><IconComponent size={28} /></div>
                <h3 className="font-serif text-sm sm:text-base md:text-lg font-medium mb-1">{feature.title}</h3>
                <p className="text-xs text-primary/70">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Flash Sales Section */}
      {isFlashSalesLoading || flashSalesError ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-stone-50/50 py-8 sm:py-12 rounded-[2rem] sm:rounded-[3rem] my-8 sm:my-12 border border-primary/5">
          <div className="flex justify-between items-end mb-8 gap-8">
            <div className="space-y-3 w-full max-w-md"><Skeleton className="h-3 w-1/3" /><Skeleton className="h-8 sm:h-10 w-2/3" /><Skeleton className="h-4 w-full" /></div>
            <div className="hidden sm:flex gap-4"><Skeleton className="h-14 w-14 rounded-2xl" /><Skeleton className="h-14 w-14 rounded-2xl" /><Skeleton className="h-14 w-14 rounded-2xl" /></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4"><ProductSkeleton /><ProductSkeleton /></div>
        </section>
      ) : activeFlashSales.length > 0 && activeFlashSales.map((fs) => (
        <section key={fs.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6 sm:my-12">
          {/* Cadre Noble : Charme atelier haut de gamme */}
          <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-slate-950 text-white p-5 sm:p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-amber-500/20 shadow-xl relative overflow-hidden">
            {/* Lueur d'ambiance dorée subtile */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Header: Responsive & Haute Lisibilité */}
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end mb-6 md:mb-10 gap-4 md:gap-8">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                  <Zap size={13} className="text-amber-400 animate-pulse" fill="currentColor" />
                  <span>Offre Privilège • Durée Limitée</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-stone-100 leading-tight tracking-tight">{fs.name}</h2>
                <p className="text-xs sm:text-sm text-stone-300/80 max-w-lg">Sélection exclusive de pièces d'atelier à prix doux. Quantités très limitées.</p>
              </div>

              <div className="flex items-center justify-between w-full md:w-auto gap-3 pt-1 md:pt-0">
                <div className="md:hidden">
                  <CountdownTimer endDate={fs.endDate} compact />
                </div>
                <div className="hidden md:block">
                  <CountdownTimer endDate={fs.endDate} />
                </div>
                <button 
                  onClick={() => onNavigate('flash-sales', undefined, fs.id)}
                  className="bg-accent hover:bg-amber-400 text-primary text-xs sm:text-sm px-4 sm:px-6 py-2.5 rounded-xl font-bold transition-all shadow-md whitespace-nowrap ml-auto md:ml-0 active:scale-95 flex items-center gap-1.5"
                >
                  <span>Explorer la vente</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
            
            {/* Grille de produits : 2 colonnes fixes sur mobile, jamais de carte étirée */}
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {fs.items.map(item => {
                const product = PRODUCTS.find(p => p.id === item.productId);
                if (!product) return null;
                
                const flashProduct = { ...product, price: item.flashPrice, oldPrice: product.price };
                const isComboSoldOut = item.soldQuantity >= item.totalQuantity;
                const remaining = Math.max(0, item.totalQuantity - item.soldQuantity);

                return (
                  <div key={item.productId} className="relative group flex flex-col">
                    <ProductCard 
                      product={flashProduct} 
                      onAddToCart={(p) => {
                        if (isComboSoldOut) {
                          toast.error("Quantités en vente flash épuisées !");
                        } else {
                          onAddToCart({ ...p, id: `flash-${fs.id}-${p.id}` });
                          toast.success("Produit ajouté au prix de la vente privilège !");
                        }
                      }}
                      onAddToWishlist={onAddToWishlist}
                      onQuickView={onQuickView}
                      onAddToComparison={onAddToComparison}
                      onClick={onProductClick}
                    />
                    
                    {/* Indicateur de rareté sobre et élégant */}
                    <div className="mt-2 px-1 flex items-center justify-between text-[9px] sm:text-[10px] text-amber-200/90 font-medium">
                      <span>{remaining > 0 ? `Plus que ${remaining} en stock` : 'Épuisé'}</span>
                      <div className="w-14 sm:w-20 h-1 bg-white/10 rounded-full overflow-hidden ml-2">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${Math.min(100, (item.soldQuantity / item.totalQuantity) * 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ))}

      {/* Categories Bento Grid */}
      {(isCategoriesLoading || categoriesError || CATEGORIES.length > 0) && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6 md:mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent mb-1 sm:mb-2 block">Explorer</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif">Nos Catégories</h2>
          </div>
          <button onClick={() => onNavigate('categories')} className="text-primary font-bold text-xs sm:text-sm md:text-base border-b-2 border-primary/20 hover:border-accent hover:text-accent transition-all pb-1">
            Voir tout
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 auto-rows-[160px] sm:auto-rows-[220px] md:auto-rows-[300px]">
          {isCategoriesLoading || categoriesError ? [0, 1, 2, 3].map((i) => (
            <CategorySkeleton key={i} className={i === 0 ? 'md:col-span-2 md:row-span-2' : i === 3 ? 'md:row-span-2' : ''} />
          )) : (featuredCategories.length > 0 ? featuredCategories : CATEGORIES).slice(0, 4).map((cat, i) => {
            const isLarge = i === 0;
            const isTall = i === 3;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`group relative overflow-hidden rounded-[1.8rem] md:rounded-[2.5rem] cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 ${
                  isLarge ? 'md:col-span-2 md:row-span-2' : 
                  isTall ? 'md:row-span-2' : ''
                }`}
                onClick={() => onNavigate('shop', undefined, cat.name)}
              >
                <ImageWithFallback
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute bottom-3 sm:bottom-6 md:bottom-8 left-3 sm:left-6 md:left-8 right-3 sm:right-6 md:right-8 text-white">
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] mb-1 text-white/80">{cat.count} Articles</p>
                  <h3 className={`${isLarge ? 'text-lg sm:text-2xl md:text-4xl' : 'text-sm sm:text-xl md:text-2xl'} font-serif mb-1 sm:mb-4 leading-tight`}>{cat.name}</h3>
                  <span className="inline-flex items-center text-[10px] sm:text-xs font-bold uppercase tracking-widest group-hover:text-accent transition-colors">
                    Découvrir <ArrowRight size={12} className="ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
      )}

      {/* Nos Coups de Cœur (Max 6 derniers) */}
      {(isProductsLoading || productsError || PRODUCTS.length > 0) && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <div className="flex justify-between items-end mb-6 md:mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent mb-1 sm:mb-2 block">Incontournables</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif">Nos Coups de Cœur</h2>
          </div>
          <button onClick={() => onNavigate('shop')} className="text-primary font-bold text-xs sm:text-sm md:text-base border-b-2 border-primary/20 hover:border-accent hover:text-accent transition-all pb-1">
            Voir toute la boutique
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {isProductsLoading || productsError ? [0, 1, 2, 3, 4, 5].map((i) => <ProductSkeleton key={i} />) : (featuredProducts.length > 0 ? featuredProducts : PRODUCTS).slice(0, 6).map((product) => (
            <ProductCard 
              key={product.id}
              product={product} 
              onAddToCart={onAddToCart}
              onAddToWishlist={onAddToWishlist}
              onQuickView={onQuickView}
              onClick={onProductClick}
              onAddToComparison={onAddToComparison}
              events={events}
            />
          ))}
        </div>
      </section>
      )}

      {/* Laines Section */}
      {(isProductsLoading || productsError || PRODUCTS.filter(p => p.category === 'Laine').length > 0) && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        <div className="flex justify-between items-end mb-6 md:mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent mb-1 sm:mb-2 block">Essentiels</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif">Laines & Fils</h2>
          </div>
          <button onClick={() => onNavigate('shop', undefined, 'Laine')} className="text-primary font-bold text-xs sm:text-sm md:text-base border-b-2 border-primary/20 hover:border-accent hover:text-accent transition-all pb-1">
            Voir toute la laine
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
          {isProductsLoading || productsError ? [0, 1, 2, 3].map((i) => <ProductSkeleton key={i} />) : PRODUCTS.filter(p => p.category === 'Laine').slice(0, 4).map((product) => (
            <ProductCard 
              key={product.id}
              product={product} 
              onAddToCart={onAddToCart}
              onAddToWishlist={onAddToWishlist}
              onQuickView={onQuickView}
              onClick={onProductClick}
              onAddToComparison={onAddToComparison}
              events={events}
            />
          ))}
        </div>
      </section>
      )}



      {/* Promotions Section */}
      {(isProductsLoading || productsError || PRODUCTS.some(p => p.oldPrice || p.promoPrice)) && <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-amber-500/5 via-primary/5 to-transparent rounded-[2rem] md:rounded-[3rem] p-4 sm:p-8 md:p-14 border border-accent/15">
          <div className="flex justify-between items-end mb-6 md:mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-accent mb-1 sm:mb-2 block">Offres Spéciales</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif">Promotions du Moment</h2>
              <p className="text-xs sm:text-sm text-primary/70 max-w-xl hidden sm:block mt-1">Profitez de remises exceptionnelles sur une sélection d'articles pour embellir votre intérieur à petit prix.</p>
            </div>
            <button 
              onClick={() => onNavigate('shop')}
              className="text-primary font-bold text-xs sm:text-sm md:text-base border-b-2 border-primary/20 hover:border-accent hover:text-accent transition-all pb-1 whitespace-nowrap"
            >
              Voir tout
            </button>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
            {isProductsLoading || productsError ? [0, 1, 2, 3].map((i) => <ProductSkeleton key={i} />) : PRODUCTS.filter(p => p.oldPrice || p.promoPrice).slice(0, 4).map((product) => (
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
          </div>
        </div>
      </section>}

      {/* Packs & Bundles Section */}
      {(isPacksLoading || packsError || visiblePacks.length > 0) && <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-[2rem] md:rounded-[3rem] p-4 sm:p-8 md:p-14 border border-primary/5 shadow-sm">
          <div className="flex justify-between items-end mb-6 md:mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-accent mb-1 sm:mb-2 block">Kits Complets</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif">Packs & Bundles</h2>
              <p className="text-xs sm:text-sm text-primary/70 max-w-xl hidden sm:block mt-1">Économisez en achetant nos kits complets, parfaits pour démarrer un nouveau projet ou pour offrir.</p>
            </div>
            <button 
              onClick={() => onNavigate('packs')}
              className="text-primary font-bold text-xs sm:text-sm md:text-base border-b-2 border-primary/20 hover:border-accent hover:text-accent transition-all pb-1 whitespace-nowrap"
            >
              Voir tous les kits
            </button>
          </div>
          
          {/* ── Mobile Layout pour les Packs ── */}
          <div className="md:hidden space-y-4">
            {isPacksLoading || packsError ? [0, 1].map((i) => <ContentCardSkeleton key={i} />) : visiblePacks.slice(0, 3).map((pack) => {
              const packProducts = pack.products.map(item => {
                const product = PRODUCTS.find(p => p.id === item.productId);
                return product ? { ...product, quantity: item.quantity } : null;
              }).filter((p): p is Product & { quantity: number } => p !== null);
              
              const totalPrice = packProducts.reduce((acc, p) => acc + (p.price || 0) * (p.quantity || 1), 0);
              const discountedPrice = totalPrice * (1 - (pack.discountPercentage || 0) / 100);

              return (
                <div 
                  key={pack.id} 
                  className="bg-card rounded-2xl p-3.5 shadow-sm border border-primary/10 flex flex-col gap-3 group cursor-pointer active:scale-[0.99] transition-transform" 
                  onClick={() => onNavigate('pack-detail', pack.id)}
                >
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {pack.coverImage ? (
                      <ImageWithFallback src={pack.coverImage} alt={pack.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="grid grid-cols-2 gap-0.5 h-full">
                        {packProducts.slice(0, 4).map((p, i) => (
                          <ImageWithFallback key={i} src={p?.image} alt={p?.name} className="w-full h-full object-cover" loading="lazy" width={150} height={150} />
                        ))}
                      </div>
                    )}
                    <div className="absolute top-2.5 left-2.5 bg-accent text-primary font-black text-[10px] px-2 py-0.5 rounded-md shadow uppercase tracking-wider">
                      -{pack.discountPercentage}%
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur text-white px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      {packProducts.length} Articles
                    </div>
                  </div>

                  <div className="space-y-1.5 px-0.5">
                    <h3 className="text-base font-serif font-medium text-primary group-hover:text-accent transition-colors leading-snug">
                      {pack.name}
                    </h3>
                    <p className="text-xs text-primary/70 line-clamp-2 leading-relaxed">
                      {cleanText(pack.description)}
                    </p>
                    <div className="flex items-baseline justify-between pt-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold text-accent">
                          {discountedPrice.toLocaleString()} FCFA
                        </span>
                        {totalPrice > discountedPrice && (
                          <span className="text-xs text-primary/50 line-through font-medium">
                            {totalPrice.toLocaleString()} FCFA
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:text-accent">
                        Voir <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Desktop Layout pour les Packs (Inchangé) ── */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isPacksLoading || packsError ? [0, 1, 2].map((i) => <ContentCardSkeleton key={i} />) : visiblePacks.map((pack) => {
              const packProducts = pack.products.map(item => {
                const product = PRODUCTS.find(p => p.id === item.productId);
                return product ? { ...product, quantity: item.quantity } : null;
              }).filter((p): p is Product & { quantity: number } => p !== null);
              
              const totalPrice = packProducts.reduce((acc, p) => acc + (p.price || 0) * (p.quantity || 1), 0);
              const discountedPrice = totalPrice * (1 - (pack.discountPercentage || 0) / 100);

              return (
                <div key={pack.id} className="bg-white dark:bg-slate-800/80 rounded-[2rem] p-8 shadow-sm border border-primary/5 flex flex-col gap-6 group cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('pack-detail', pack.id)}>
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                     {pack.coverImage ? (
                        <ImageWithFallback src={pack.coverImage} alt={pack.name} className="w-full h-full object-cover" loading="lazy" />
                     ) : (
                        <div className="grid grid-cols-2 gap-1 h-full">
                           {packProducts.slice(0, 4).map((p, i) => (
                               <ImageWithFallback key={i} src={p?.image} alt={p?.name} className="w-full h-full object-cover" loading="lazy" width={200} height={200} />
                           ))}
                        </div>
                     )}
                     <div className="absolute bottom-0 right-0 bg-primary text-white px-3 py-1 rounded-tl-xl text-xs font-bold uppercase tracking-widest">
                        {packProducts.length} Articles
                     </div>
                  </div>
                  <div className="space-y-4">
                    <span className="px-3 py-1 bg-primary/10 text-accent rounded-full text-[10px] font-bold uppercase tracking-widest">Économisez {pack.discountPercentage}%</span>
                    <h3 className="text-2xl font-serif text-primary dark:text-white group-hover:text-accent transition-colors">{pack.name}</h3>
                    <p className="text-sm text-primary/70 dark:text-white/70 line-clamp-2">{cleanText(pack.description)}</p>
                    <div className="flex items-center gap-4 pt-4">
                      <span className="text-lg text-primary/70 dark:text-white/50 line-through font-bold">{totalPrice.toLocaleString()} FCFA</span>
                      <span className="text-2xl font-bold text-primary dark:text-accent">{discountedPrice.toLocaleString()} FCFA</span>
                    </div>
                    <Button 
                      onClick={(e) => { 
                          e.stopPropagation(); 
                          onNavigate('pack-detail', pack.id);
                      }}
                      className="w-full py-4 mt-4"
                    >
                      Voir le pack
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>}

      {/* Blog Section */}
      {isBlogEnabled && (isBlogLoading || blogError || BLOG_POSTS.length > 0) && <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6 md:mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent mb-1 sm:mb-2 block">Inspirations</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif">Derniers Articles</h2>
          </div>
          <button onClick={() => onNavigate('blog')} className="text-primary font-bold text-xs sm:text-sm md:text-base border-b-2 border-primary/20 hover:border-accent hover:text-accent transition-all pb-1">
            Voir tout le blog
          </button>
        </div>

        {/* ── Mobile Blog Layout (Édition Mobile Raffinée) ── */}
        <div className="md:hidden space-y-4">
          {isBlogLoading || blogError ? (
            <ContentCardSkeleton />
          ) : (
            <>
              {/* Premier article mis en avant */}
              {BLOG_POSTS[0] && (
                <motion.article
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  onClick={() => onNavigate('blog-post', BLOG_POSTS[0].id)}
                  className="rounded-[1.75rem] overflow-hidden bg-card border border-primary/10 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <img
                      src={BLOG_POSTS[0].image}
                      alt={BLOG_POSTS[0].title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-accent shadow-sm">
                      {BLOG_POSTS[0].category}
                    </div>
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white/90 text-xs font-medium">
                      <Calendar size={12} />
                      <span>{BLOG_POSTS[0].date}</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="text-base sm:text-lg font-serif font-medium text-primary leading-snug">
                      {BLOG_POSTS[0].title}
                    </h3>
                    <p className="text-xs text-primary/70 line-clamp-2 leading-relaxed">
                      {BLOG_POSTS[0].excerpt}
                    </p>
                    <div className="pt-1 flex items-center text-xs font-bold text-accent">
                      <span>Lire l'article</span>
                      <ArrowRight size={13} className="ml-1.5" />
                    </div>
                  </div>
                </motion.article>
              )}

              {/* Deuxième article en format carte compacte */}
              {BLOG_POSTS[1] && (
                <motion.article
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.05 }}
                  onClick={() => onNavigate('blog-post', BLOG_POSTS[1].id)}
                  className="rounded-2xl p-3 bg-card border border-primary/10 shadow-sm flex items-center gap-3.5 cursor-pointer active:scale-[0.99] transition-transform"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100 relative">
                    <img
                      src={BLOG_POSTS[1].image}
                      alt={BLOG_POSTS[1].title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded-md">
                        {BLOG_POSTS[1].category}
                      </span>
                      <span className="text-[10px] text-primary/60 flex items-center gap-1">
                        <Calendar size={10} /> {BLOG_POSTS[1].date}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-serif font-medium text-primary leading-snug line-clamp-2">
                      {BLOG_POSTS[1].title}
                    </h4>
                  </div>
                  <ArrowRight size={14} className="text-primary/40 shrink-0 mr-1" />
                </motion.article>
              )}
            </>
          )}
        </div>

        {/* ── Desktop / Tablet Blog Layout (Inchangé) ── */}
        <div className="hidden md:grid md:grid-cols-2 gap-8">
          {isBlogLoading || blogError ? [0, 1].map((i) => <ContentCardSkeleton key={i} />) : BLOG_POSTS.slice(0, 2).map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer"
              onClick={() => onNavigate('blog-post', post.id)}
            >
              <div className="aspect-[16/9] rounded-[2rem] overflow-hidden mb-6 shadow-lg">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-primary/70">
                  <span className="text-accent">{post.category}</span>
                  <div className="flex items-center gap-2"><Calendar size={14} /> {post.date}</div>
                </div>
                <h3 className="text-2xl font-serif group-hover:text-accent transition-colors">{post.title}</h3>
                <p className="text-primary/70 line-clamp-2">{post.excerpt}</p>
                <span className="inline-flex items-center font-bold text-primary group-hover:text-accent transition-colors">
                  Lire la suite <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </motion.article>
          ))}
        </div>
      </section>}

      {/* Custom Sections */}
      {siteConfig.customSections.map((section) => (
        <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-4xl font-serif">{section.title}</h2>
            <button onClick={() => onNavigate('shop')} className="text-primary font-bold border-b-2 border-primary/20 hover:border-accent hover:text-accent transition-all pb-1">
              Voir tout
            </button>
          </div>
          
          {section.type === 'products' && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
              {PRODUCTS.filter(p => section.itemIds.includes(p.id)).map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={onAddToCart}
                  onAddToWishlist={onAddToWishlist}
                  onQuickView={onQuickView}
                  onAddToComparison={onAddToComparison}
                  onClick={onProductClick}
                  events={events}
                />
              ))}
            </div>
          )}

          {section.type === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {CATEGORIES.filter(c => section.itemIds.includes(c.id)).map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative aspect-[4/5] overflow-hidden rounded-3xl cursor-pointer"
                  onClick={() => onNavigate('shop')}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute bottom-8 left-8 text-white">
                    <p className="text-xs font-bold uppercase tracking-widest mb-2 text-white/70">{cat.count} Articles</p>
                    <h3 className="text-3xl font-serif mb-4">{cat.name}</h3>
                    <span className="inline-flex items-center text-sm font-bold group-hover:text-accent transition-colors">
                      Découvrir <ArrowRight size={16} className="ml-2" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      ))}

      {/* Newsletter / CTA Redesigned */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-stone-900 via-primary to-stone-900 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 text-white relative overflow-hidden border border-amber-500/20 shadow-xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
            <div className="text-center lg:text-left space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                <span>Club Privilège Laine & Déco</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-white leading-tight">Rejoignez la communauté</h2>
              <p className="text-xs sm:text-sm text-stone-300/90 leading-relaxed">
                Profitez de <span className="text-amber-300 font-bold">-10% sur votre première commande</span> et recevez nos tutoriels créatifs & ventes privées en avant-première.
              </p>
            </div>

            <div className="w-full lg:w-auto shrink-0 max-w-md">
              <form 
                onSubmit={(e) => { 
                  e.preventDefault(); 
                  toast.success("Merci ! Votre inscription à la communauté est confirmée. Vérifiez vos emails pour votre code promo de -10%."); 
                }} 
                className="relative flex items-center group w-full"
              >
                <input
                  type="email"
                  required
                  placeholder="Votre adresse email..."
                  className="w-full bg-white/10 dark:bg-black/40 border border-white/20 rounded-full py-3 sm:py-3.5 pl-4 sm:pl-5 pr-28 sm:pr-32 text-xs sm:text-sm text-white placeholder:text-white/60 focus:outline-none focus:border-amber-400 focus:bg-black/30 transition-all shadow-inner"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-accent hover:bg-amber-400 text-primary font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-full transition-all shadow-md active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>S'abonner</span>
                  <ArrowRight size={13} />
                </button>
              </form>
              <p className="text-[10px] text-stone-400/70 mt-2 text-center lg:text-left">
                Pas de spam. Désinscription possible à tout moment.
              </p>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default HomeView;
