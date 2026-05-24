import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Package, Truck, ShieldCheck, Heart, Calendar, User, Search, Camera, Zap, Clock, Loader2, Mic, X as CloseIcon, HelpCircle, Star, Sparkles } from 'lucide-react';

import { useStaticEntity } from '../hooks/useStaticEntity';
import { useProducts } from '../hooks/useProducts';
import { limit, where } from 'firebase/firestore';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/Button';
import { Product, SiteConfig, PromoEvent, Pack, FlashSale, Lookbook, HeroBannerConfig } from '../../types';
import { AdBanner } from '../components/AdBanner';
import { productSearch } from '../utils/searchUtils';
import { useDeferUntilInteraction } from '../hooks/useAfterIdle';
import { optimizeImageUrl } from '../utils/imageUtils';
import { toast } from 'sonner';

const CountdownTimer: React.FC<{ endDate: string }> = ({ endDate }) => {
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
  const dataReady = useDeferUntilInteraction(20_000);
  const [secondaryReady, setSecondaryReady] = React.useState(false);

  React.useEffect(() => {
    if (!dataReady) return;
    const t = setTimeout(() => setSecondaryReady(true), 5000);
    return () => clearTimeout(t);
  }, [dataReady]);

  const { products: fetchedProducts, isLoading: isProductsLoading } = useProducts({
    enabled: dataReady,
    constraints: [limit(24)],
  });
  const PRODUCTS = fetchedProducts;
  const secondaryOpts = { enabled: secondaryReady };
  const { data: CATEGORIES } = useStaticEntity<any>('category', [], secondaryOpts);
  const { data: BLOG_POSTS } = useStaticEntity<any>('blog_post', [], secondaryOpts);
  const { data: PACKS } = useStaticEntity<any>('pack', [], secondaryOpts);
  const { data: RECENT_FLASH_SALES } = useStaticEntity<FlashSale>('flash_sale', [], secondaryOpts);
  const { data: LOOKBOOKS } = useStaticEntity<Lookbook>('lookbook', [], secondaryOpts);
  const { data: HERO_BANNERS } = useStaticEntity<HeroBannerConfig>('hero_banner', [], {
    constraints: [where('status', '==', 'active')],
  });
  const { data: ALL_HERO_BANNERS } = useStaticEntity<HeroBannerConfig>('hero_banner', [], secondaryOpts);
  const activeFlashSales = RECENT_FLASH_SALES.filter(fs => fs.status === 'active' && new Date(fs.endDate) > new Date());
  const activeLookbooks = LOOKBOOKS.filter(lb => lb.status === 'active');

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
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
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

  const heroBannersToRender = HERO_BANNERS && HERO_BANNERS.length > 0 ? HERO_BANNERS : ALL_HERO_BANNERS;

  const HERO_SLIDES = heroBannersToRender && heroBannersToRender.length > 0
    ? heroBannersToRender.map((item) => ({
        image: optimizeImageUrl(item.image, 960),
        title: item.title,
        subtitle: item.subtitle,
        ctaText: item.ctaText || 'Découvrir la collection',
        link: 'shop',
      }))
    : [{
        image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1200',
        title: 'Laine & Déco',
        subtitle: 'Bienvenue chez Laine et Déco',
        ctaText: 'Découvrir la collection',
        link: 'shop',
      }];

      
  const HERO_SLIDES_OPTIMIZED = HERO_SLIDES;

  useEffect(() => {
    if (HERO_SLIDES.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [HERO_SLIDES.length]);

  const featuredProducts = PRODUCTS.filter(p => siteConfig.homeFeaturedProducts.includes(p.id));
  const featuredCategories = CATEGORIES.filter(c => siteConfig.homeFeaturedCategories.includes(c.id));

  const activeFlashSale = activeFlashSales[0];
  const flashSaleEndDate = activeFlashSale ? activeFlashSale.endDate : new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString();
  const flashSaleProduct = PRODUCTS.find(p => activeFlashSale?.items?.some(i => i.productId === p.id)) || PRODUCTS.find(p => p.isSale) || PRODUCTS[0] || null;
  const flashSalePrice = flashSaleProduct ? (activeFlashSale?.items?.find(i => i.productId === flashSaleProduct.id)?.flashPrice || (flashSaleProduct.price * 0.8)) : 0;

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
    <motion.div className="relative space-y-24 pb-24">
      {isSearchFocused && (
        <button
          type="button"
          aria-label="Fermer la recherche"
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40] cursor-default animate-in fade-in duration-200"
          onClick={() => setIsSearchFocused(false)}
        />
      )}
      <AdBanner />
      
      {/* Hero Section Slider */}
      <section className="relative min-h-[90vh] flex items-center py-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="sync">
            {HERO_SLIDES_OPTIMIZED.map((slide, i) => {
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
                    transition={{ duration: 1 }}
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
                  transition={{ duration: 1 }}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  referrerPolicy="no-referrer"
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  width={960}
                  height={540}
                  sizes="100vw"
                />
              );
            })}
          </AnimatePresence>
          <div className="absolute inset-0 bg-black/40 pointer-events-none z-[1]" aria-hidden />
        </div>
        
        {/* Content Overlay */}
        <div className={`relative ${isSearchFocused ? 'z-[50]' : 'z-10'} max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full`}>
          <div className="max-w-3xl text-white">
            {/* Animated Title/Subtitle */}
            <motion.div key={currentSlide} className="mb-10 animate-hero-fade-in">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] mb-6 text-accent">
                {HERO_SLIDES_OPTIMIZED[currentSlide].subtitle}
              </span>
              <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif leading-[1.1]">
                {HERO_SLIDES_OPTIMIZED[currentSlide].title}
              </h1>
            </motion.div>

            {/* Static Controls */}
            <div className="max-w-3xl mb-12 relative z-50" ref={searchContainerRef}>
              <form onSubmit={handleSearch} className="relative group">
                {/* ... search input ... */}
                <label htmlFor="home-search" className="sr-only">
                  Rechercher un produit
                </label>
                <div className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors z-10 ${isSearchFocused ? 'text-accent' : 'text-white'}`} aria-hidden="true">
                  <Search size={24} />
                </div>
                <input
                  id="home-search"
                  type="search"
                  placeholder="Rechercher un produit"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  autoComplete="off"
                  className={`w-full backdrop-blur-2xl border rounded-full py-4 sm:py-6 pl-14 sm:pl-16 pr-32 sm:pr-48 text-base sm:text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white transition-all shadow-2xl relative z-0 ${
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
              <div className="mt-6 flex flex-col items-center sm:items-start">
                {!isTrackingExpanded ? (
                  <button 
                    onClick={() => setIsTrackingExpanded(true)}
                    className="flex items-center gap-2 text-white/90 hover:text-accent transition-all text-sm font-bold uppercase tracking-widest bg-white/5 px-6 py-3 rounded-full backdrop-blur-2xl border border-white/10 hover:bg-white/10 hover:scale-105 active:scale-95 shadow-xl"
                  >
                    <Package size={16} />
                    Suivre ma commande
                  </button>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-3xl border border-white/10 p-8 rounded-[2.5rem] w-full max-w-md relative shadow-2xl"
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

            <div className="flex flex-wrap gap-6">
              <button 
                onClick={() => onNavigate('shop')}
                className="bg-white text-slate-900 px-12 py-5 rounded-full font-bold hover:bg-accent hover:text-white transition-all duration-300 flex items-center group shadow-xl animate-shine"
              >
                Voir plus
                <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={24} />
              </button>
              <div className="flex gap-2 items-center ml-auto">
                {HERO_SLIDES_OPTIMIZED.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Aller à la diapositive ${i + 1}`}
                    onClick={() => setCurrentSlide(i)}
                    className={`w-3 h-3 rounded-full transition-all ${currentSlide === i ? 'bg-accent w-8' : 'bg-white/30 hover:bg-white/50'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sale Section */}
      {flashSaleProduct && (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary rounded-[3rem] overflow-hidden relative">
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
                  src={flashSaleProduct?.image} 
                  alt="Flash Sale" 
                  className="w-full h-full object-cover rounded-full p-8 relative z-10"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  width="400"
                  height="400"
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-[3rem] p-12 md:p-20 overflow-hidden relative">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="w-full md:w-1/2 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-accent">Produit Vedette</span>
              <h2 className="text-4xl md:text-5xl font-serif text-primary leading-tight">Laine Mérinos <br/> Extra Fine</h2>
              <p className="text-primary/70 text-lg">Une douceur incomparable pour vos créations les plus précieuses. Disponible en 12 coloris naturels.</p>
            </div>
            <div className="w-full md:w-1/2 relative">
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <img 
                  src="https://picsum.photos/seed/merino-slider/800/800" 
                  alt="Featured" 
                  className="w-full aspect-square object-cover rounded-[3rem] shadow-2xl"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  width="800"
                  height="800"
                />
                <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between shadow-xl gap-4">
                  <span className="text-2xl font-bold text-primary">82 000 FCFA</span>
                  <Button 
                    onClick={() => onNavigate('shop')}
                    className="w-full sm:w-auto px-6 py-3 text-sm"
                  >
                    Acheter maintenant
                  </Button>
                </div>
              </motion.div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute -top-10 -left-10 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
                className="flex flex-col items-center text-center p-8 bg-white rounded-3xl shadow-sm border border-primary/5"
              >
                <div className="text-accent mb-4"><IconComponent size={32} /></div>
                <h3 className="font-serif text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-primary/70">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Flash Sales Section */}
      {activeFlashSales.length > 0 && activeFlashSales.map((fs) => (
        <section key={fs.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-red-50/50 py-12 rounded-[3rem] my-12 border border-red-100">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-red-500">Offre Spéciale</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              </div>
              <h2 className="text-4xl font-serif text-red-900">{fs.name}</h2>
              <p className="text-red-700/80 mt-2">Vite ! Quantités limitées, l'offre expire bientôt.</p>
            </div>
              <div className="flex items-center gap-4">
                <CountdownTimer endDate={fs.endDate} />
                <button 
                  onClick={() => onNavigate('flash-sales', undefined, fs.id)}
                  className="bg-red-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-red-600 transition-colors shadow-sm hidden sm:block whitespace-nowrap"
                >
                  Voir tout
                </button>
              </div>
          </div>
          
          <div className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-6 pb-6 hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {fs.items.map(item => {
              const product = PRODUCTS.find(p => p.id === item.productId);
              if (!product) return null;
              
              const flashProduct = { ...product, price: item.flashPrice, oldPrice: product.price }; // Fake flash price
              const isComboSoldOut = item.soldQuantity >= item.totalQuantity;

              return (
                <div key={item.productId} className="min-w-[280px] w-[280px] sm:min-w-[300px] sm:w-[300px] snap-start relative group flex-shrink-0">
                  <ProductCard 
                    product={flashProduct} 
                    onAddToCart={(p) => {
                      if (isComboSoldOut) {
                        toast.error("Quantités en vente flash épuisées !");
                      } else {
                        onAddToCart({ ...p, id: `flash-${fs.id}-${p.id}` }); // Identify flash sale in cart
                        toast.success("Produit ajouté à votre panier au prix de la vente flash !");
                      }
                    }}
                    onAddToWishlist={onAddToWishlist}
                    onQuickView={onQuickView}
                    onAddToComparison={onAddToComparison}
                    onClick={onProductClick}
                  />
                  
                  {/* Progress Bar for stock */}
                  <div className="absolute top-4 left-4 right-4 z-10 bg-white/90 backdrop-blur tracking-widest text-[10px] uppercase font-bold p-2 px-3 rounded-full shadow-lg border border-red-100 flex items-center justify-between">
                    <span className="text-red-600">Vendus: {item.soldQuantity}/{item.totalQuantity}</span>
                    <div className="w-1/3 h-1.5 bg-red-100 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${(item.soldQuantity / item.totalQuantity) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            <div className="min-w-[280px] w-[280px] sm:hidden snap-start flex items-center justify-center p-6">
              <button 
                onClick={() => onNavigate('flash-sales', undefined, fs.id)}
                className="w-full bg-red-100 text-red-600 py-4 rounded-2xl font-bold hover:bg-red-200 transition-colors"
              >
                Voir toute la vente
              </button>
            </div>
          </div>
        </section>
      ))}

      {/* Categories Bento Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Explorer</span>
            <h2 className="text-4xl font-serif">Nos Catégories</h2>
          </div>
          <button onClick={() => onNavigate('categories')} className="text-primary font-bold border-b-2 border-primary/20 hover:border-accent hover:text-accent transition-all pb-1">
            Voir tout
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[250px] md:auto-rows-[300px]">
          {(featuredCategories.length > 0 ? featuredCategories : CATEGORIES.slice(0, 4)).map((cat, i) => {
            const isLarge = i === 0;
            const isTall = i === 3;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`group relative overflow-hidden rounded-[2.5rem] cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 ${
                  isLarge ? 'md:col-span-2 md:row-span-2' : 
                  isTall ? 'md:row-span-2' : ''
                }`}
                onClick={() => onNavigate('shop', undefined, cat.name)}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-white/70">{cat.count} Articles</p>
                  <h3 className={`${isLarge ? 'text-4xl' : 'text-2xl'} font-serif mb-4`}>{cat.name}</h3>
                  <span className="inline-flex items-center text-xs font-bold uppercase tracking-widest group-hover:text-accent transition-colors">
                    Découvrir <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Laines Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Essentiels</span>
            <h2 className="text-4xl font-serif">Laines & Fils</h2>
          </div>
          <button onClick={() => onNavigate('shop', undefined, 'Laine')} className="text-primary font-bold border-b-2 border-primary/20 hover:border-accent hover:text-accent transition-all pb-1">
            Voir toute la laine
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRODUCTS.filter(p => p.category === 'Laine').slice(0, 4).map((product) => (
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

      {/* Artisanat & Décoration (Gypsum / Moules) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Matériel & Outils</span>
            <h2 className="text-4xl font-serif">Artisanat & Décoration</h2>
          </div>
          <button onClick={() => onNavigate('shop', undefined, 'Artisanat')} className="text-primary font-bold border-b-2 border-primary/20 hover:border-accent hover:text-accent transition-all pb-1">
            Voir le matériel
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRODUCTS.filter(p => p.category === 'Artisanat').slice(0, 3).map((product) => (
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

      {/* High-Tech Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Nouveauté</span>
            <h2 className="text-4xl font-serif">High-Tech & Design</h2>
          </div>
          <button onClick={() => onNavigate('shop')} className="text-primary font-bold border-b-2 border-primary/20 hover:border-accent hover:text-accent transition-all pb-1">
            Voir tout
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRODUCTS.filter(p => p.category === 'Électronique' || p.isElectronic).slice(0, 3).map((product) => (
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

      {/* Featured Products */}
      <section className="bg-primary/5 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Sélection</span>
              <h2 className="text-4xl font-serif mb-4">Les Incontournables</h2>
              <p className="text-primary/70 max-w-xl">Nos meilleures ventes et coups de cœur du moment, choisis avec soin pour vous.</p>
            </div>
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-primary/5">
              <span className="text-xs font-bold uppercase tracking-widest text-primary/70 ml-4">Filtre:</span>
              <button 
                onClick={() => setShowOnlyPromos(!showOnlyPromos)}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${showOnlyPromos ? 'bg-accent text-white shadow-md' : 'bg-slate-50 text-primary/70 hover:bg-slate-100'}`}
              >
                {showOnlyPromos ? 'Toutes les promos' : 'En promotion'}
              </button>
            </div>
          </div>
          
          <div 
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 no-scrollbar"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {(showOnlyPromos 
              ? PRODUCTS.filter(p => p.oldPrice || p.promoPrice)
              : (featuredProducts.length > 0 ? featuredProducts : PRODUCTS.slice(0, 4))
            ).map((product) => (
              <div key={product.id} className="min-w-[70vw] sm:min-w-0 snap-center">
                <ProductCard 
                  product={product} 
                  onAddToCart={onAddToCart}
                  onAddToWishlist={onAddToWishlist}
                  onQuickView={onQuickView}
                  onClick={onProductClick}
                  events={events}
                />
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Promotions Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary/5 rounded-[3rem] p-12 md:p-20 border border-primary/10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
            <div className="text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Offres Spéciales</span>
              <h2 className="text-4xl font-serif mb-4">Promotions du Moment</h2>
              <p className="text-primary/70 max-w-xl">Profitez de remises exceptionnelles sur une sélection d'articles pour embellir votre intérieur à petit prix.</p>
            </div>
            <Button 
              onClick={() => onNavigate('shop')}
              variant="accent"
              className="px-8 py-4"
            >
              Voir toutes les promos
            </Button>
          </div>
          
          <div 
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 no-scrollbar"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {PRODUCTS.filter(p => p.oldPrice || p.promoPrice).slice(0, 4).map((product) => (
              <div key={product.id} className="min-w-[70vw] sm:min-w-0 snap-center">
                <ProductCard 
                  product={product} 
                  onAddToCart={onAddToCart}
                  onAddToWishlist={onAddToWishlist}
                  onQuickView={onQuickView}
                  onClick={onProductClick}
                  events={events}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packs & Bundles Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-[3rem] p-12 md:p-20 border border-primary/5">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
            <div className="text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Kits Complets</span>
              <h2 className="text-4xl font-serif mb-4">Packs & Bundles</h2>
              <p className="text-primary/70 max-w-xl">Économisez en achetant nos kits complets, parfaits pour démarrer un nouveau projet ou pour offrir.</p>
            </div>
            <Button 
              onClick={() => onNavigate('packs')}
              className="px-8 py-4"
            >
              Voir tous les kits
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PACKS.map((pack) => {
              const packProducts = pack.products.map(item => {
                const product = PRODUCTS.find(p => p.id === item.productId);
                return product ? { ...product, quantity: item.quantity } : null;
              }).filter((p): p is Product & { quantity: number } => p !== null);
              
              const totalPrice = packProducts.reduce((acc, p) => acc + (p.price || 0) * (p.quantity || 1), 0);
              const discountedPrice = totalPrice * (1 - (pack.discountPercentage || 0) / 100);

              return (
                <div key={pack.id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-primary/5 flex flex-col gap-6 group cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('pack-detail', pack.id)}>
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100">
                     <div className="grid grid-cols-2 gap-1 h-full">
                        {packProducts.slice(0, 4).map((p, i) => (
                            <img key={i} src={p.image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" width="200" height="200" />
                        ))}
                     </div>
                     <div className="absolute bottom-0 right-0 bg-primary text-white px-3 py-1 rounded-tl-xl text-xs font-bold uppercase tracking-widest">
                        {packProducts.length} Articles
                     </div>
                  </div>
                  <div className="space-y-4">
                    <span className="px-3 py-1 bg-primary/10 text-accent rounded-full text-[10px] font-bold uppercase tracking-widest">Économisez {pack.discountPercentage}%</span>
                    <h3 className="text-2xl font-serif text-primary group-hover:text-accent transition-colors">{pack.name}</h3>
                    <p className="text-sm text-primary/70 line-clamp-2">{pack.description}</p>
                    <div className="flex items-center gap-4 pt-4">
                      <span className="text-lg text-primary/70 line-through font-bold">{totalPrice.toLocaleString()} FCFA</span>
                      <span className="text-2xl font-bold text-primary">{discountedPrice.toLocaleString()} FCFA</span>
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
      </section>

      {/* Blog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Inspirations</span>
            <h2 className="text-4xl font-serif">Derniers Articles</h2>
          </div>
          <button onClick={() => onNavigate('blog')} className="text-primary font-bold border-b-2 border-primary/20 hover:border-accent hover:text-accent transition-all pb-1">
            Voir tout le blog
          </button>
        </div>

        <div 
          className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 no-scrollbar"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {BLOG_POSTS.slice(0, 2).map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="min-w-[85vw] sm:min-w-0 snap-center group cursor-pointer"
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
      </section>

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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

      {/* Newsletter / CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif mb-6">Rejoignez la communauté Laine&Déco</h2>
            <p className="text-white/70 mb-10 text-lg">Recevez 10% de réduction sur votre première commande et restez informé de nos nouveaux arrivages.</p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-grow bg-white/10 border border-white/20 rounded-full px-8 py-4 focus:outline-none focus:border-white transition-colors"
              />
              <button className="bg-accent text-white px-10 py-4 rounded-full font-bold hover:bg-white hover:text-primary transition-all duration-300">
                S'abonner
              </button>
            </form>
          </div>
        </div>
      </section>
    </motion.div>
  );
};
