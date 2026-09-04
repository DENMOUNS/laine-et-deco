import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Package, Truck, ShieldCheck, Heart, Calendar, User, Search, Camera, Zap, Clock, Loader2, Mic, X as CloseIcon, HelpCircle, Star, Sparkles, ChevronLeft, ChevronRight, ChevronDown, Tag } from 'lucide-react';

import { useStaticEntity } from '../hooks/useStaticEntity';
import { useHeroBannersService } from '../hooks/useHeroBannersService';
import { useLoadingSequence, setHeroReady } from '../hooks/useLoadingSequence';
import { where, orderBy, limit as fsLimit } from 'firebase/firestore';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';
import { Product, SiteConfig, PromoEvent, Pack, FlashSale, Lookbook, HeroBannerConfig, Promotion } from '../../types';
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
import { isFeatureEnabled, isFeatureDisabled } from '../utils/featureFlags';
import { useTranslation } from '../../i18n';
import { CountdownTimer } from '../components/home/CountdownTimer';
import { HomeStoryHighlights } from '../components/home/HomeStoryHighlights';
import { HomeCalculatorTeaser } from '../components/home/HomeCalculatorTeaser';
import { HomeNewsletterSection } from '../components/home/HomeNewsletterSection';

// Helper function for deterministic daily product rotation changing at midnight
const getDailyRotationIndex = (itemCount: number, salt: number = 0): number => {
  if (itemCount <= 0) return 0;
  const now = new Date();
  const dayId = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const hash = Math.abs((dayId * 9301 + 49297 + salt * 31337) % 233280);
  return hash % itemCount;
};

interface HomeViewProps {
  onNavigate: (view: string, id?: string, query?: string) => void;
  onAddToCart: (p: Product) => void;
  onAddToWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onAddToComparison?: (p: Product) => void;
  onProductClick: (p: Product) => void;
  siteConfig: SiteConfig;
  events?: PromoEvent[];
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onAddToCart, onAddToWishlist, onQuickView, onAddToComparison, onProductClick, siteConfig, events = [] }) => {
  const { isMarqueeReady, isAllReady } = useLoadingSequence();
  const { t, l, isEn } = useTranslation();
  const isBlogEnabled = isFeatureEnabled(siteConfig, 'blog');
  const isCalculatorEnabled = isFeatureEnabled(siteConfig, 'calculator');
  const isFlashSalesEnabled = isFeatureEnabled(siteConfig, 'flashSales');
  const isPacksEnabled = isFeatureEnabled(siteConfig, 'packs');

  // ── Mobile Landscape detector ──
  const [isMobileLandscape, setIsMobileLandscape] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileLandscape(
        window.innerWidth < 768 && window.innerWidth > window.innerHeight
      );
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

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
  const { data: CATEGORIES, isLoading: isCategoriesLoading, error: categoriesError } = useStaticEntity<any>('category', [], { enabled: true });
  const { data: BLOG_POSTS, isLoading: isBlogLoading, error: blogError } = useStaticEntity<any>('blog_post', [], { enabled: !isFeatureDisabled(siteConfig, 'blog') });
  const { data: PACKS, isLoading: isPacksLoading, error: packsError } = useStaticEntity<any>('pack', [], { enabled: !isFeatureDisabled(siteConfig, 'packs') });
  const { data: RECENT_FLASH_SALES, isLoading: isFlashSalesLoading, error: flashSalesError } = useStaticEntity<FlashSale>('flash_sale', [], { enabled: !isFeatureDisabled(siteConfig, 'flashSales') });
  const { data: RECENT_PROMOTIONS, isLoading: isPromotionsLoading, error: promotionsError } = useStaticEntity<Promotion>('promotion', [], { enabled: true });

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
  const activePromotions = React.useMemo(() => {
    return RECENT_PROMOTIONS.filter(p =>
      p.status === 'active' &&
      new Date(p.endDate) > new Date() &&
      (!p.startDate || new Date(p.startDate) <= new Date()) &&
      Array.isArray(p.items) &&
      p.items.length > 0 &&
      p.items.some((item) => PRODUCTS.some((product) => product.id === item.productId))
    );
  }, [RECENT_PROMOTIONS, PRODUCTS]);
  const visiblePacks = PACKS.filter((pack) => Array.isArray(pack.products) && pack.products.length > 0);

  const [isNewsletterSubscribed, setIsNewsletterSubscribed] = React.useState(() => {
    const dec = localStorage.getItem('newsletter_decision');
    const sub = localStorage.getItem('newsletter_subscribed');
    return dec === 'accepted' || sub === 'true';
  });

  React.useEffect(() => {
    const checkSub = () => {
      const dec = localStorage.getItem('newsletter_decision');
      const sub = localStorage.getItem('newsletter_subscribed');
      if (dec === 'accepted' || sub === 'true') {
        setIsNewsletterSubscribed(true);
      }
    };
    window.addEventListener('storage', checkSub);
    window.addEventListener('newsletter_subscribed', checkSub);
    return () => {
      window.removeEventListener('storage', checkSub);
      window.removeEventListener('newsletter_subscribed', checkSub);
    };
  }, []);

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

  // Produits enrichis avec les promotions actives
  const enhancedProducts = React.useMemo(() => {
    return PRODUCTS.map((p) => {
      let promoPrice = p.promoPrice;
      for (const promo of activePromotions) {
        const item = promo.items?.find((i) => i.productId === p.id);
        if (item && typeof item.promoPrice === 'number' && item.promoPrice > 0 && item.promoPrice < p.price) {
          promoPrice = item.promoPrice;
          break;
        }
      }
      if (typeof promoPrice === 'number' && promoPrice > 0 && promoPrice < p.price) {
        return { ...p, promoPrice };
      }
      return p;
    });
  }, [PRODUCTS, activePromotions]);

  // Index products for Lucene-like search
  React.useEffect(() => {
    if (enhancedProducts.length > 0) {
      productSearch.indexItems(enhancedProducts);
    }
  }, [enhancedProducts]);

  // Update live search results
  React.useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const results = productSearch.search(searchQuery);
      setLiveSearchResults(results.slice(0, 4)); // Show top 4 results
    } else {
      setLiveSearchResults([]);
    }
  }, [searchQuery]);

  // Produits avec prix promotionnel actif
  const promoProductsOnly = React.useMemo(() => {
    return enhancedProducts.filter(
      (p) => typeof p.promoPrice === 'number' && p.promoPrice > 0 && p.promoPrice < p.price
    );
  }, [enhancedProducts]);

  // Pour la section d'accueil "Nos Coups de Cœur", on affiche uniquement les produits qui ont un prix promotionnel
  const homeDisplayProducts = React.useMemo(() => {
    if (promoProductsOnly.length > 0) {
      return promoProductsOnly;
    }
    const featured = enhancedProducts.filter(p => siteConfig.homeFeaturedProducts.includes(p.id));
    return featured.length > 0 ? featured : enhancedProducts;
  }, [promoProductsOnly, enhancedProducts, siteConfig.homeFeaturedProducts]);

  const featuredCategories = CATEGORIES.filter(c => siteConfig.homeFeaturedCategories.includes(c.id));

  // Produits éligibles avec un prix valide
  const validProducts = React.useMemo(() => {
    const list = enhancedProducts.filter(p => p && p.price && p.price > 0);
    return list.length > 0 ? list : enhancedProducts;
  }, [enhancedProducts]);

  // Produit du jour pour la Vente Flash (-10%, rotation automatique quotidienne à minuit)
  const flashSaleProduct = React.useMemo(() => {
    if (validProducts.length === 0) return null;
    const index = getDailyRotationIndex(validProducts.length, 17);
    return validProducts[index] || validProducts[0];
  }, [validProducts]);

  // Prix de la vente flash avec réduction de 10% appliquée
  const flashSalePrice = React.useMemo(() => {
    if (!flashSaleProduct || !flashSaleProduct.price) return 0;
    return Math.round(flashSaleProduct.price * 0.9); // 10% de réduction
  }, [flashSaleProduct]);

  // Produit du jour pour la Création d'Exception (sans réduction, obligatoirement distinct de la vente flash, rotation à minuit)
  const exceptionProduct = React.useMemo(() => {
    if (validProducts.length === 0) return null;
    const candidates = validProducts.filter(p => p.id !== flashSaleProduct?.id);
    const pool = candidates.length > 0 ? candidates : validProducts;
    const index = getDailyRotationIndex(pool.length, 83);
    return pool[index] || pool[0];
  }, [validProducts, flashSaleProduct]);

  // Fin de la vente flash : prochain minuit exact
  const flashSaleEndDate = React.useMemo(() => {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    return nextMidnight.toISOString();
  }, []);

  const activeFlashSale = React.useMemo(() => {
    if (activeFlashSales.length > 0) return activeFlashSales[0];
    if (flashSaleProduct) {
      return {
        id: 'daily-flash',
        name: 'Vente Flash du Jour',
        status: 'active',
        endDate: flashSaleEndDate,
        items: [
          {
            productId: flashSaleProduct.id,
            flashPrice: flashSalePrice,
            totalQuantity: 15,
            soldQuantity: 3
          }
        ]
      } as FlashSale;
    }
    return null;
  }, [activeFlashSales, flashSaleProduct, flashSalePrice, flashSaleEndDate]);

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
    <motion.div className="relative space-y-10 sm:space-y-16 md:space-y-20 pb-4 sm:pb-8">
      {isSearchFocused && (
        <button
          type="button"
          aria-label="Fermer la recherche"
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40] cursor-default animate-in fade-in duration-200"
          onClick={() => setIsSearchFocused(false)}
        />
      )}
      <AdBanner />
      
      {/* Hero Section Slider — Card soignée sur mobile avec bordures douces et cadrée sur PC */}
      <section className="relative min-h-[500px] h-auto py-12 sm:py-16 md:py-0 md:h-[600px] lg:h-[680px] xl:h-[720px] flex items-center overflow-hidden mx-2.5 sm:mx-4 md:mx-0 lg:mx-auto lg:max-w-7xl lg:rounded-[2.5rem] lg:my-3 lg:shadow-xl lg:border lg:border-white/10 rounded-[2rem] md:rounded-none shadow-md md:shadow-none lg:shadow-xl">
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
                  {l(currentHeroSlide, 'subtitle') ? (
                    <span className="block text-xs sm:text-sm font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/90 leading-relaxed max-w-xl whitespace-normal break-words">
                      {l(currentHeroSlide, 'subtitle')}
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
                  {l(currentHeroSlide, 'title')}
                </h1>
                {l(currentHeroSlide, 'ctaText') && (
                  <div className="pt-2">
                    <button 
                      onClick={() => onNavigate(currentHeroSlide.link || 'shop')}
                      className="bg-[#ffffff] text-[#111311] px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold hover:bg-[#E2C29B] hover:text-[#111311] transition-all duration-300 inline-flex items-center group shadow-xl animate-shine text-sm sm:text-base cursor-pointer"
                    >
                      {l(currentHeroSlide, 'ctaText')}
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
                                  <p className="text-sm font-serif italic text-accent mt-1">{product.price.toLocaleString()} FCFA</p>
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
      <HomeStoryHighlights
        siteConfig={siteConfig}
        isMobileLandscape={isMobileLandscape}
        onNavigate={onNavigate}
      />

      {/* Flash Sale Section */}
      {isFlashSalesEnabled && flashSaleProduct && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Mobile Flash Sale Layout ── */}
        <div className="md:hidden bg-gradient-to-br from-[#3E4A3D] via-[#2F392E] to-slate-900 rounded-[2rem] p-5 relative overflow-hidden text-white shadow-xl border border-white/10">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top Bar: Live Badge & Compact Countdown */}
          <div className="flex items-center justify-between gap-2 mb-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Zap size={14} className="animate-pulse" fill="currentColor" />
              <span>Vente Flash (-10%)</span>
            </div>
            <CountdownTimer endDate={flashSaleEndDate} compact />
          </div>

          {/* Product Spotlight */}
          <div className="relative z-10 space-y-3.5">
            <div 
              onClick={() => onProductClick({ ...flashSaleProduct, salePrice: flashSalePrice })}
              className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black/20 shadow-inner group cursor-pointer"
            >
              <img 
                src={flashSaleProduct?.image || 'https://picsum.photos/seed/flash/600/600'} 
                alt={flashSaleProduct?.name || "Vente Flash"} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
                loading="lazy"
                width={400}
                height={250}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Discount Tag */}
              <div className="absolute top-3 left-3 bg-accent text-primary font-black text-xs px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wider">
                -10%
              </div>

              {/* Price Pill */}
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-white/70">Prix flash du jour</p>
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
                Offre flash sur <span className="text-accent italic">{flashSaleProduct.name}</span>
              </h3>
              <p className="text-xs text-white/75 mt-1 line-clamp-2">
                Profitez d'une remise exclusive de 10% sur cet article sélectionné aujourd'hui jusqu'à minuit.
              </p>
            </div>

            <Button 
              onClick={() => onProductClick({ ...flashSaleProduct, salePrice: flashSalePrice })}
              className="w-full py-3.5 bg-gradient-to-r from-accent to-amber-500 hover:from-amber-500 hover:to-accent text-primary font-bold shadow-lg shadow-accent/20 rounded-xl flex items-center justify-center gap-2 text-sm"
            >
              <span>En profiter maintenant (-10%)</span>
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>

        {/* ── Desktop / Tablet Flash Sale Layout ── */}
        <div className="hidden md:block bg-[#3E4A3D] dark:bg-[#1A1D1A] border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden relative shadow-xl">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 skew-x-12 translate-x-1/4" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center">
            <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-10 space-y-4 lg:space-y-5">
              <div className="flex items-center gap-2.5 text-accent font-bold uppercase tracking-widest text-xs">
                <Zap size={16} fill="currentColor" />
                <span>Vente Flash du Jour • Offre Limitée</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-white leading-tight">
                -10% sur <span className="italic text-accent">{flashSaleProduct.name}</span>
              </h2>
              <p className="text-white/85 text-xs sm:text-sm max-w-md leading-relaxed">
                Profitez d'une remise exceptionnelle de 10% sur cette création artisanale sélectionnée, valable aujourd'hui jusqu'à minuit.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-widest">
                  <Clock size={14} />
                  <span>Se termine dans :</span>
                </div>
                <CountdownTimer endDate={flashSaleEndDate} />
              </div>

              <Button 
                onClick={() => onProductClick({ ...flashSaleProduct, salePrice: flashSalePrice })}
                className="px-6 py-3 text-xs font-bold animate-shine"
              >
                En profiter maintenant (-10%)
              </Button>
            </div>
            
            <div className="w-full lg:w-1/2 p-6 lg:p-8 flex justify-center">
              <div 
                onClick={() => onProductClick({ ...flashSaleProduct, salePrice: flashSalePrice })}
                className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 cursor-pointer group"
              >
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-dashed border-white/20 rounded-full"
                />
                <img 
                  src={flashSaleProduct?.image || 'https://picsum.photos/seed/flash/600/600'} 
                  alt={flashSaleProduct?.name || "Vente Flash"} 
                  className="w-full h-full object-cover rounded-full relative z-10 group-hover:scale-105 transition-transform duration-500 shadow-2xl"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  width={300}
                  height={300}
                />
                <div className="absolute top-1/4 -right-4 bg-white dark:bg-stone-900 p-3 rounded-2xl shadow-2xl z-20 rotate-12 border border-primary/10">
                  <div className="inline-block bg-accent text-primary text-[10px] font-black uppercase px-2 py-0.5 rounded-md mb-1">-10%</div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70 dark:text-stone-300">Prix Flash</p>
                  <p className="text-lg font-bold text-accent">{flashSalePrice.toLocaleString()} FCFA</p>
                  {flashSaleProduct.price && flashSaleProduct.price > flashSalePrice && (
                    <p className="text-xs line-through text-primary/50 dark:text-stone-400 font-normal">
                      {flashSaleProduct.price.toLocaleString()} FCFA
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Wool Calculator Teaser (PC Uniquement) */}
      {isCalculatorEnabled && <HomeCalculatorTeaser onNavigate={onNavigate} />}

      {/* Featured Slider / Création d'Exception */}
      {(() => {
        const featuredProduct = exceptionProduct;
        if (!featuredProduct) return null;
        const cleanedDescription = cleanText(featuredProduct.description) || "Une création d'exception façonnée avec des matières nobles pour sublimer vos projets les plus précieux.";
        return (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-stone-50 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-800 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 overflow-hidden relative border border-primary/5 shadow-sm">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                <div className="w-full md:w-1/2 space-y-3 sm:space-y-4 text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                    <span>Création d'Exception</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-primary leading-tight">{featuredProduct.name}</h2>
                  <p className="text-primary/75 text-xs sm:text-sm md:text-base line-clamp-3 leading-relaxed">{cleanedDescription}</p>
                  
                  <div className="pt-2 flex items-center gap-4">
                    <span className="text-lg sm:text-2xl font-bold text-primary font-serif">{featuredProduct.price.toLocaleString()} FCFA</span>
                    <Button 
                      onClick={() => onProductClick(featuredProduct)}
                      className="px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
                    >
                      <span>Découvrir l'ouvrage</span>
                      <ArrowRight size={15} className="ml-1.5" />
                    </Button>
                  </div>
                </div>

                <div 
                  onClick={() => onProductClick(featuredProduct)}
                  className="w-full md:w-1/2 relative cursor-pointer group flex justify-center"
                >
                  <motion.div 
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative z-10 w-full max-w-md"
                  >
                    <ImageWithFallback 
                      src={optimizeImageUrl(featuredProduct.image, 800)} 
                      alt={featuredProduct.name} 
                      className="w-full aspect-[4/3] sm:aspect-[16/10] object-cover rounded-2xl sm:rounded-[2rem] shadow-xl group-hover:scale-102 transition-transform duration-500 max-h-[280px] sm:max-h-[340px]"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      width={600}
                      height={400}
                    />
                  </motion.div>
                  <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
                  <div className="absolute -top-10 -left-10 w-36 h-36 bg-primary/5 rounded-full blur-2xl" />
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
      {isFlashSalesEnabled && (isFlashSalesLoading || flashSalesError ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-stone-50/50 py-8 sm:py-12 rounded-[2rem] sm:rounded-[3rem] my-8 sm:my-12 border border-primary/5">
          <div className="flex justify-between items-end mb-8 gap-8">
            <div className="space-y-3 w-full max-w-md"><Skeleton className="h-3 w-1/3" /><Skeleton className="h-8 sm:h-10 w-2/3" /><Skeleton className="h-4 w-full" /></div>
            <div className="hidden sm:flex gap-4"><Skeleton className="h-14 w-14 rounded-2xl" /><Skeleton className="h-14 w-14 rounded-2xl" /><Skeleton className="h-14 w-14 rounded-2xl" /></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4"><ProductSkeleton /><ProductSkeleton /></div>
        </section>
      ) : activeFlashSales.length > 0 ? activeFlashSales.map((fs) => (
        <section key={fs.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              {fs.items.slice(0, 4).map(item => {
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
      )) : null)}

      {/* Categories Grid */}
      {(isCategoriesLoading || categoriesError || CATEGORIES.length > 0) && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-4 sm:mb-6 md:mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent mb-1 sm:mb-2 block">Explorer</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif">Nos Catégories</h2>
          </div>
          <button onClick={() => onNavigate('categories')} className="text-primary font-bold text-xs sm:text-sm md:text-base border-b-2 border-primary/20 hover:border-accent hover:text-accent transition-all pb-1">
            Voir tout
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
          {isCategoriesLoading || categoriesError ? [0, 1, 2, 3].map((i) => (
            <CategorySkeleton key={i} />
          )) : (featuredCategories.length > 0 ? featuredCategories : CATEGORIES).slice(0, 4).map((cat, i) => {
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 h-44 sm:h-56 md:h-64"
                onClick={() => onNavigate('shop', undefined, cat.name)}
              >
                <ImageWithFallback
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent opacity-70 group-hover:opacity-85 transition-opacity" />
                <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-5 right-3 sm:right-5 text-white">
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] mb-0.5 text-white/80">{cat.count || 0} Articles</p>
                  <h3 className="text-base sm:text-lg md:text-xl font-serif mb-1 sm:mb-2 leading-tight line-clamp-1">{cat.name}</h3>
                  <span className="inline-flex items-center text-[10px] sm:text-xs font-bold uppercase tracking-widest group-hover:text-accent transition-colors">
                    Découvrir <ArrowRight size={12} className="ml-1 sm:ml-1.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
      )}


      {/* Laines Section */}
      {(isProductsLoading || productsError || enhancedProducts.filter(p => p.category === 'Laine').length > 0) && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-4 sm:mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent mb-1 sm:mb-2 block">Essentiels</span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif">Laines & Fils</h2>
          </div>
          <button onClick={() => onNavigate('shop', undefined, 'Laine')} className="text-primary font-bold text-xs sm:text-sm md:text-base border-b-2 border-primary/20 hover:border-accent hover:text-accent transition-all pb-1">
            Voir toute la laine
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
          {isProductsLoading || productsError ? [0, 1, 2, 3].map((i) => <ProductSkeleton key={i} />) : enhancedProducts.filter(p => p.category === 'Laine').slice(0, 4).map((product) => (
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
      </section>
      )}



      {/* Promotions Section (Uniquement promotions réelles créées) */}
      {activePromotions.length > 0 && activePromotions.map((promo) => {
        const promoProducts = promo.items
          .map((item) => {
            const product = PRODUCTS.find((p) => p.id === item.productId);
            if (!product) return null;
            return {
              ...product,
              promoPrice: item.promoPrice,
            };
          })
          .filter(Boolean) as Product[];

        if (promoProducts.length === 0) return null;

        const promoTitle = isEn && promo.name_en ? promo.name_en : promo.name;
        const promoDesc = isEn && promo.description_en ? promo.description_en : promo.description;

        return (
          <section key={promo.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-amber-500/5 via-primary/5 to-transparent rounded-[2rem] p-5 sm:p-8 md:p-10 border border-accent/15">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 md:mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-1">
                      <Tag size={14} /> Promotion
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-accent/15 text-accent px-2.5 py-0.5 rounded-full">
                      Toute la quantité en stock
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif">{promoTitle}</h2>
                  {promoDesc ? (
                    <p className="text-xs sm:text-sm text-primary/70 max-w-xl mt-1">{promoDesc}</p>
                  ) : (
                    <p className="text-xs sm:text-sm text-primary/70 max-w-xl hidden sm:block mt-1">
                      Profitez de réductions sur l'ensemble du stock disponible jusqu'à la fin de la promotion.
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <CountdownTimer endDate={promo.endDate} />
                  <button 
                    onClick={() => onNavigate('promotions')}
                    className="text-primary font-bold text-xs sm:text-sm md:text-base border-b-2 border-primary/20 hover:border-accent hover:text-accent transition-all pb-1 whitespace-nowrap"
                  >
                    Voir tout
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
                {promoProducts.slice(0, 4).map((product) => (
                  <ProductCard 
                    key={product.id}
                    product={product} 
                    onAddToCart={onAddToCart}
                    onAddToWishlist={onAddToWishlist}
                    onQuickView={onQuickView}
                    onClick={onProductClick}
                    events={[]}
                  />
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* Packs & Bundles Section */}
      {isPacksEnabled && (isPacksLoading || packsError || visiblePacks.length > 0) && <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-[2rem] p-5 sm:p-8 md:p-10 border border-primary/5 shadow-sm">
          <div className="flex justify-between items-end mb-6 md:mb-8">
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
                    <ImageWithFallback
                      src={pack.coverImage || packProducts[0]?.image}
                      alt={pack.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
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
                <div key={pack.id} className="bg-white dark:bg-slate-800/80 rounded-[1.8rem] p-5 shadow-sm border border-primary/5 flex flex-col gap-4 group cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('pack-detail', pack.id)}>
                  <div className="relative aspect-[16/10] sm:aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <ImageWithFallback
                      src={pack.coverImage || packProducts[0]?.image}
                      alt={pack.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                     <div className="absolute bottom-0 right-0 bg-primary text-white px-2.5 py-1 rounded-tl-xl text-[10px] font-bold uppercase tracking-widest">
                        {packProducts.length} Articles
                      </div>
                  </div>
                  <div className="space-y-2.5">
                    <span className="px-2.5 py-0.5 bg-primary/10 text-accent rounded-full text-[10px] font-bold uppercase tracking-widest">Économisez {pack.discountPercentage}%</span>
                    <h3 className="text-xl font-serif text-primary dark:text-white group-hover:text-accent transition-colors">{pack.name}</h3>
                    <p className="text-xs sm:text-sm text-primary/70 dark:text-white/70 line-clamp-2">{cleanText(pack.description)}</p>
                    <div className="flex items-center gap-3 pt-2">
                      <span className="text-sm text-primary/70 dark:text-white/50 line-through font-bold">{totalPrice.toLocaleString()} FCFA</span>
                      <span className="text-xl font-bold text-primary dark:text-accent">{discountedPrice.toLocaleString()} FCFA</span>
                    </div>
                    <Button 
                      onClick={(e) => { 
                          e.stopPropagation(); 
                          onNavigate('pack-detail', pack.id);
                      }}
                      className="w-full py-3 mt-2 text-xs font-bold"
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

      {/* Custom Sections (Exclut les doublons éventuels de sections principales) */}
      {siteConfig.customSections
        .filter((section) => {
          if (!section || !section.title) return false;
          const normalized = section.title.trim().toLowerCase();
          return normalized !== 'nos coups de cœur' && normalized !== 'nos coups de coeur';
        })
        .map((section) => (
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

      {/* Newsletter / CTA Rejoignez la communauté */}
      <HomeNewsletterSection
        isSubscribed={isNewsletterSubscribed}
        onSubscribed={() => setIsNewsletterSubscribed(true)}
      />
    </motion.div>
  );
};

export default HomeView;
