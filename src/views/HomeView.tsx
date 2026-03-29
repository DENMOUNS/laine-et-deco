import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Package, Truck, ShieldCheck, Heart, Calendar, User, Search, Camera, Loader2, Zap, Clock, Calculator, Gift, Sparkles, Flower2, Dna, Wind, Waves, Box, FlaskConical, Ruler, Check } from 'lucide-react';
import { CATEGORIES, PRODUCTS, BLOG_POSTS, PACKS } from '../constants';
import { ProductCard } from '../components/ProductCard';
import { Product, SiteConfig, PromoEvent, Pack } from '../types';
import { AdBanner } from '../components/AdBanner';
import { analyzeProductImage } from '../utils/aiUtils';
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
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-xl font-bold text-accent shadow-sm border border-accent/10">
            {item.value.toString().padStart(2, '0')}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mt-2">{item.label}</span>
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
  onProductClick: (p: Product) => void;
  siteConfig: SiteConfig;
  events?: PromoEvent[];
}

const ShimmerEffect: React.FC = () => (
  <motion.div
    initial={{ x: '-150%', skewX: -25 }}
    animate={{ x: '250%' }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      repeatDelay: 3.5,
      ease: "easeInOut"
    }}
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent z-10 pointer-events-none"
  />
);

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onAddToCart, onAddToWishlist, onQuickView, onProductClick, siteConfig, events = [] }) => {
  const [showOnlyPromos, setShowOnlyPromos] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isAnalyzingImage, setIsAnalyzingImage] = React.useState(false);
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const HERO_SLIDES = [
    {
      image: siteConfig.hero.backgroundImage,
      title: siteConfig.hero.title,
      subtitle: "Bienvenue chez Laine & Déco",
      link: "shop"
    },
    {
      image: "https://picsum.photos/seed/promo1/1920/1080",
      title: "Nouvelle Collection Artisanale",
      subtitle: "Découvrez nos dernières créations",
      link: "shop"
    },
    {
      image: "https://picsum.photos/seed/promo2/1920/1080",
      title: "Promotions de Printemps",
      subtitle: "Jusqu'à -50% sur une sélection",
      link: "shop"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const featuredProducts = PRODUCTS.filter(p => siteConfig.homeFeaturedProducts.includes(p.id));
  const featuredCategories = CATEGORIES.filter(c => siteConfig.homeFeaturedCategories.includes(c.id));

  const flashSaleProduct = PRODUCTS.find(p => p.isSale) || PRODUCTS[0];
  const flashSaleEndDate = new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(); // 5 hours from now

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
      
      const keywords = await analyzeProductImage(base64);
      if (keywords) {
        onNavigate('shop', undefined, keywords);
      }
      setIsAnalyzingImage(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-24 pb-24">
      <AdBanner />
      
      {/* Hero Section Slider */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            style={{ touchAction: 'pan-y' }}
            onDragEnd={(e, { offset }) => {
              if (offset.x < -50) {
                setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
              } else if (offset.x > 50) {
                setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
              }
            }}
          >
            <img
              src={HERO_SLIDES[currentSlide].image}
              alt="Hero"
              className="w-full h-full object-cover pointer-events-none"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />
          </motion.div>
        </AnimatePresence>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl text-white"
          >
            <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] mb-6 text-accent">
              {HERO_SLIDES[currentSlide].subtitle}
            </span>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif leading-[1.1] mb-10">
              {HERO_SLIDES[currentSlide].title}
            </h1>

            {/* Search Bar */}
            <div className="max-w-2xl mb-12">
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-accent transition-colors">
                  <Search size={24} />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher un produit, une catégorie..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-6 pl-16 pr-48 text-lg focus:outline-none focus:border-white/40 transition-all placeholder:text-white/40"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all flex items-center gap-2"
                    title="Rechercher par image"
                  >
                    {isAnalyzingImage ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                  </button>
                  <motion.button 
                    type="submit"
                    whileHover={{ scale: 1.05, brightness: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-accent text-white px-6 py-3 rounded-full font-bold hover:bg-white hover:text-primary transition-all shadow-lg relative overflow-hidden"
                  >
                    <ShimmerEffect />
                    Go
                  </motion.button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageSearch} 
                  accept="image/*" 
                  className="hidden" 
                />
              </form>
            </div>

            <div className="flex flex-wrap gap-6">
              <motion.button 
                onClick={() => onNavigate(HERO_SLIDES[currentSlide].link)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-primary px-12 py-5 rounded-full font-bold hover:bg-accent hover:text-white transition-all duration-300 flex items-center group shadow-xl relative overflow-hidden"
              >
                <ShimmerEffect />
                Voir plus
                <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={24} />
              </motion.button>
              <div className="flex gap-2 items-center ml-auto">
                {HERO_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`w-3 h-3 rounded-full transition-all ${currentSlide === i ? 'bg-accent w-8' : 'bg-white/30 hover:bg-white/50'}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
          {[
            { icon: <Package size={32} />, title: "Qualité Premium", desc: "Laines 100% naturelles" },
            { icon: <Truck size={32} />, title: "Livraison Rapide", desc: "Offerte dès 50€ d'achat" },
            { icon: <ShieldCheck size={32} />, title: "Paiement Sécurisé", desc: "Transaction 100% protégée" },
            { icon: <Heart size={32} />, title: "Fait avec Amour", desc: "Sélection artisanale" },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center p-6 sm:p-8 bg-white rounded-3xl shadow-sm border border-primary/5"
            >
              <div className="text-accent mb-4">{feature.icon}</div>
              <h3 className="font-serif text-base sm:text-lg mb-2">{feature.title}</h3>
              <p className="text-[10px] sm:text-sm text-primary/60">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Flash Sale Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary rounded-[3rem] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/10 skew-x-12 translate-x-1/4" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center">
            <div className="w-full lg:w-1/2 p-12 md:p-20 space-y-8">
              <div className="flex items-center gap-3 text-accent font-bold uppercase tracking-widest text-sm">
                <Zap size={20} fill="currentColor" />
                <span>Vente Flash Exceptionnelle</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-serif text-white leading-tight">
                Offre limitée sur la <span className="italic text-accent">Collection Hiver</span>
              </h2>
              <p className="text-white/60 text-lg max-w-md">
                Profitez de remises allant jusqu'à -40% sur une sélection exclusive de laines et objets déco.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-widest">
                  <Clock size={14} />
                  <span>Se termine dans :</span>
                </div>
                <CountdownTimer endDate={flashSaleEndDate} />
              </div>

              <motion.button 
                onClick={() => onNavigate('shop')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-accent text-white px-10 py-4 rounded-full font-bold hover:bg-white hover:text-primary transition-all shadow-xl shadow-accent/20 relative overflow-hidden"
              >
                <ShimmerEffect />
                En profiter maintenant
              </motion.button>
            </div>
            
            <div className="w-full lg:w-1/2 p-12 lg:p-0">
              <div className="relative aspect-square max-w-md mx-auto">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-dashed border-accent/30 rounded-full"
                />
                <img 
                  src={flashSaleProduct.image} 
                  alt="Flash Sale" 
                  className="w-full h-full object-cover rounded-full p-8 relative z-10"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-1/4 -right-4 bg-white p-4 rounded-2xl shadow-2xl z-20 rotate-12">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">À partir de</p>
                  <p className="text-2xl font-bold text-accent">5 900 FCFA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wool Calculator Promo Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary rounded-[3rem] overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-white/5 -skew-x-12 -translate-x-1/4" />
          <div className="relative z-10 flex flex-col lg:flex-row-reverse items-center">
            <div className="w-full lg:w-1/2 p-12 md:p-20 space-y-8">
              <div className="flex items-center gap-3 text-accent font-bold uppercase tracking-widest text-sm">
                <div className="relative">
                  <Calculator size={20} />
                  <Sparkles size={10} className="absolute -top-1 -right-1 text-white animate-pulse" />
                </div>
                <span>Calculateur de Laine</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-serif text-white leading-tight">
                Combien de <span className="italic text-accent">pelotes</span> pour votre projet ?
              </h2>
              <p className="text-white/80 text-lg max-w-md">
                Ne manquez plus jamais de fil. Notre calculateur intelligent estime précisément vos besoins selon votre projet et votre taille.
              </p>
              
              <motion.button 
                onClick={() => onNavigate('wool-calculator')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-accent text-white px-10 py-4 rounded-full font-bold hover:bg-white hover:text-primary transition-all shadow-xl shadow-accent/20 relative overflow-hidden"
              >
                <ShimmerEffect />
                Calculer maintenant
              </motion.button>
            </div>
            
            <div className="w-full lg:w-1/2 p-12 lg:p-0 flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                {/* Wool & Needles Animation Component */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="relative z-10 w-full h-full flex items-center justify-center"
                  >
                    {/* Background Soft Glow */}
                    <div className="absolute inset-0 bg-accent/20 rounded-full blur-[100px]" />
                    
                    {/* Floating Decorative Icons */}
                    <motion.div
                      animate={{ y: [0, -20, 0], opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="absolute top-1/4 left-1/4 text-accent/40"
                    >
                      <Sparkles size={24} />
                    </motion.div>
                    <motion.div
                      animate={{ y: [0, 20, 0], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                      className="absolute bottom-1/4 right-1/3 text-white/30"
                    >
                      <Heart size={20} />
                    </motion.div>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute top-1/3 right-1/4 text-accent/20"
                    >
                      <Flower2 size={40} />
                    </motion.div>

                    {/* The "Calculateur" Label */}
                    <motion.div 
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-10 left-10 z-30 bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/80">Calculateur</span>
                      </div>
                    </motion.div>

                    {/* Wool Ball 1 */}
                    <motion.div
                      animate={{ 
                        y: [0, -15, 0],
                        rotate: [0, 5, 0]
                      }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute z-20 top-1/4 right-1/4"
                    >
                      <div className="w-32 h-32 bg-accent rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden group">
                        <Dna className="text-white/30 absolute rotate-45 scale-150" size={80} />
                        <Dna className="text-white/20 absolute -rotate-45 scale-125" size={80} />
                        <div className="w-full h-full bg-gradient-to-br from-white/20 to-transparent" />
                        <Sparkles className="absolute text-white/40 animate-pulse" size={16} />
                      </div>
                    </motion.div>

                    {/* Wool Ball 2 (Smaller) */}
                    <motion.div
                      animate={{ 
                        y: [0, 15, 0],
                        rotate: [0, -5, 0]
                      }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      className="absolute z-10 bottom-1/4 left-1/4"
                    >
                      <div className="w-24 h-24 bg-secondary rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden">
                        <Dna className="text-primary/20 absolute rotate-90 scale-125" size={60} />
                        <div className="w-full h-full bg-gradient-to-br from-white/40 to-transparent" />
                        <Heart className="absolute text-primary/30 animate-bounce" size={12} />
                      </div>
                    </motion.div>

                    {/* Knitting Needles */}
                    <motion.div
                      animate={{ 
                        rotate: [45, 50, 45],
                        x: [0, 5, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-2 bg-white/80 rounded-full shadow-lg transform rotate-45"
                    >
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                        <Sparkles size={8} className="text-accent" />
                      </div>
                    </motion.div>
                    <motion.div
                      animate={{ 
                        rotate: [-45, -50, -45],
                        x: [0, -5, 0]
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                      className="absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-2 bg-white/60 rounded-full shadow-lg transform -rotate-45"
                    >
                      <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-white/80 rounded-full flex items-center justify-center">
                        <Sparkles size={8} className="text-accent" />
                      </div>
                    </motion.div>

                    {/* Animated Thread */}
                    <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                      <motion.path
                        d="M 100 300 Q 200 100 300 300 T 500 300"
                        fill="none"
                        stroke="var(--color-accent)"
                        strokeWidth="2"
                        strokeDasharray="10 10"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.6 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      />
                      <motion.path
                        d="M 50 150 Q 250 350 450 150"
                        fill="none"
                        stroke="var(--color-primary)"
                        strokeWidth="1.5"
                        strokeDasharray="5 5"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.2 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                      />
                    </svg>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Volume Calculator Promo Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[3rem] overflow-hidden relative shadow-xl border border-primary/5">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 skew-x-12 translate-x-1/4" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center">
            <div className="w-full lg:w-1/2 p-12 md:p-20 space-y-8">
              <div className="flex items-center gap-3 text-accent font-bold uppercase tracking-widest text-sm">
                <div className="relative">
                  <Box size={20} />
                  <Sparkles size={10} className="absolute -top-1 -right-1 text-primary animate-pulse" />
                </div>
                <span>Nouveau : Décoration Maison</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-serif text-primary leading-tight">
                Créez vos propres <span className="italic text-accent">objets déco</span>
              </h2>
              <p className="text-primary/60 text-lg max-w-md">
                Découvrez nos moules et poudres créatives. Utilisez notre calculateur de volume pour doser parfaitement vos mélanges de Jesmonite ou de plâtre.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <motion.button 
                  onClick={() => onNavigate('volume-calculator')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary text-white px-10 py-4 rounded-full font-bold hover:bg-accent transition-all shadow-xl shadow-primary/20 relative overflow-hidden"
                >
                  <ShimmerEffect />
                  Calculateur de Volume
                </motion.button>
                <motion.button 
                  onClick={() => onNavigate('shop')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-primary border-2 border-primary/10 px-10 py-4 rounded-full font-bold hover:border-primary transition-all"
                >
                  Voir les moules
                </motion.button>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 p-12 lg:p-0 flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                <div className="relative w-full h-full flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="relative z-10 w-full h-full flex items-center justify-center"
                  >
                    {/* Decorative background elements */}
                    <div className="absolute inset-0 bg-accent/10 rounded-full blur-[80px]" />
                    
                    {/* Floating Mold/Object Icons */}
                    <motion.div
                      animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-1/4 right-1/4 z-20"
                    >
                      <div className="w-40 h-40 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center border border-primary/5 overflow-hidden group">
                        <img src="https://picsum.photos/seed/moldovale/400/400" alt="Moule" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        <Box className="absolute bottom-4 right-4 text-white/80" size={24} />
                      </div>
                    </motion.div>

                    <motion.div
                      animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      className="absolute bottom-1/4 left-1/4 z-10"
                    >
                      <div className="w-32 h-32 bg-secondary rounded-[2rem] shadow-xl flex items-center justify-center border border-primary/5 overflow-hidden">
                        <img src="https://picsum.photos/seed/jesmonite/400/400" alt="Poudre" className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
                        <FlaskConical className="absolute text-primary/40" size={32} />
                      </div>
                    </motion.div>

                    {/* Measurement Ruler Animation */}
                    <motion.div
                      animate={{ 
                        width: ["0%", "80%", "0%"],
                        opacity: [0, 1, 0]
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1 bg-accent/30 rounded-full z-30"
                    >
                      <div className="absolute -right-2 -top-2 w-4 h-4 bg-accent rounded-full flex items-center justify-center">
                        <Ruler size={10} className="text-white" />
                      </div>
                    </motion.div>

                    <motion.div
                      animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute top-10 right-10 text-accent"
                    >
                      <Sparkles size={32} />
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gift Box Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="bg-primary rounded-[4rem] p-12 md:p-20 overflow-hidden relative shadow-2xl shadow-primary/20">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <Gift size={600} className="translate-x-1/4 -translate-y-1/4 rotate-12" />
          </div>
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
            <div className="w-full lg:w-1/2 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full border border-accent/20">
                <Sparkles size={16} className="text-accent" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Nouveau : Coffrets Cadeaux</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-serif text-white leading-tight">
                Offrez le <span className="italic text-accent">cadeau parfait</span>
              </h2>
              <p className="text-white/60 text-xl leading-relaxed max-w-xl">
                Composez votre propre coffret cadeau personnalisé. Choisissez vos laines, vos accessoires et ajoutez un mot doux. Nous préparons un emballage premium pour une surprise inoubliable.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="flex items-center gap-4 text-white/80">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-accent">
                    <Check size={20} />
                  </div>
                  <span className="text-sm font-medium">Emballage Premium</span>
                </div>
                <div className="flex items-center gap-4 text-white/80">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-accent">
                    <Check size={20} />
                  </div>
                  <span className="text-sm font-medium">Carte Personnalisée</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-8 pt-6">
                <motion.button 
                  onClick={() => onNavigate('gift-box')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-accent text-white px-12 py-5 rounded-full font-bold hover:bg-white hover:text-primary transition-all shadow-2xl shadow-accent/20 flex items-center gap-3 group/btn relative overflow-hidden"
                >
                  <ShimmerEffect />
                  Créer mon coffret
                  <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform" />
                </motion.button>
                
                <div className="flex items-center gap-4 text-white/40">
                  <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-primary bg-secondary overflow-hidden">
                        <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs font-medium">+500 créés ce mois-ci</p>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 flex justify-center">
              <div className="relative group/img">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0], y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10"
                >
                  <div className="w-72 h-72 md:w-96 md:h-96 bg-white/10 backdrop-blur-md border border-white/20 rounded-[4rem] p-12 flex items-center justify-center shadow-2xl overflow-hidden">
                    <img 
                      src="https://picsum.photos/seed/giftbox-preview/800/800" 
                      alt="Gift Box Preview" 
                      className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover/img:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <Gift size={140} className="text-white relative z-10 drop-shadow-2xl" />
                  </div>
                </motion.div>
                <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-accent rounded-full blur-[100px] opacity-30" />
                <div className="absolute -top-12 -left-12 w-48 h-48 bg-white rounded-full blur-[100px] opacity-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Explorer</span>
            <h2 className="text-4xl font-serif">Nos Catégories</h2>
          </div>
          <button onClick={() => onNavigate('shop')} className="text-primary font-bold border-b-2 border-primary/20 hover:border-accent hover:text-accent transition-all pb-1">
            Voir tout
          </button>
        </div>
        
        <div 
          className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 no-scrollbar"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {(featuredCategories.length > 0 ? featuredCategories : CATEGORIES.slice(0, 3)).map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="min-w-[70vw] sm:min-w-0 snap-center group relative aspect-[4/5] overflow-hidden rounded-3xl cursor-pointer"
              onClick={() => onNavigate('shop')}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
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
      </section>

      {/* Featured Products */}
      <section className="bg-primary/5 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Sélection</span>
              <h2 className="text-4xl font-serif mb-4">Les Incontournables</h2>
              <p className="text-primary/60 max-w-xl">Nos meilleures ventes et coups de cœur du moment, choisis avec soin pour vous.</p>
            </div>
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-primary/5">
              <span className="text-xs font-bold uppercase tracking-widest text-primary/40 ml-4">Filtre:</span>
              <button 
                onClick={() => setShowOnlyPromos(!showOnlyPromos)}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${showOnlyPromos ? 'bg-accent text-white shadow-md' : 'bg-slate-50 text-primary/60 hover:bg-slate-100'}`}
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

      {/* Coussins & Plaids Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Confort</span>
            <h2 className="text-4xl font-serif">Coussins & Plaids</h2>
          </div>
          <button onClick={() => onNavigate('shop')} className="text-primary font-bold border-b-2 border-primary/20 hover:border-accent hover:text-accent transition-all pb-1">
            Voir la collection
          </button>
        </div>
        
        <div 
          className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 no-scrollbar"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {PRODUCTS.filter(p => p.category === 'Coussins & Plaids').slice(0, 4).map((product) => (
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
      </section>

      {/* Promotions Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-accent/5 rounded-[3rem] p-12 md:p-20 border border-accent/10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
            <div className="text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Offres Spéciales</span>
              <h2 className="text-4xl font-serif mb-4">Promotions du Moment</h2>
              <p className="text-primary/60 max-w-xl">Profitez de remises exceptionnelles sur une sélection d'articles pour embellir votre intérieur à petit prix.</p>
            </div>
            <button 
              onClick={() => onNavigate('shop')}
              className="px-8 py-4 bg-accent text-white rounded-full font-bold hover:bg-primary transition-all shadow-lg"
            >
              Voir toutes les promos
            </button>
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
        <div className="bg-secondary/20 rounded-[3rem] p-12 md:p-20 border border-primary/5">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
            <div className="text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Kits Complets</span>
              <h2 className="text-4xl font-serif mb-4">Packs & Bundles</h2>
              <p className="text-primary/60 max-w-xl">Économisez en achetant nos kits complets, parfaits pour démarrer un nouveau projet ou pour offrir.</p>
            </div>
            <motion.button 
              onClick={() => onNavigate('shop')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-primary text-white rounded-full font-bold hover:bg-accent transition-all shadow-lg relative overflow-hidden"
            >
              <ShimmerEffect />
              Voir tous les kits
            </motion.button>
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
                            <img key={i} src={p.image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ))}
                     </div>
                     <div className="absolute bottom-0 right-0 bg-primary text-white px-3 py-1 rounded-tl-xl text-xs font-bold uppercase tracking-widest">
                        {packProducts.length} Articles
                     </div>
                  </div>
                  <div className="space-y-4">
                    <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-bold uppercase tracking-widest">Économisez {pack.discountPercentage}%</span>
                    <h3 className="text-2xl font-serif text-primary group-hover:text-accent transition-colors">{pack.name}</h3>
                    <p className="text-sm text-primary/60 line-clamp-2">{pack.description}</p>
                    <div className="flex items-center gap-4 pt-4">
                      <span className="text-lg text-primary/40 line-through font-bold">{totalPrice.toLocaleString()} FCFA</span>
                      <span className="text-2xl font-bold text-primary">{discountedPrice.toLocaleString()} FCFA</span>
                    </div>
                    <button 
                      onClick={(e) => { 
                          e.stopPropagation(); 
                          onNavigate('pack-detail', pack.id);
                      }}
                      className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-accent transition-colors mt-4"
                    >
                      Voir le pack
                    </button>
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
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-primary/40">
                  <span className="text-accent">{post.category}</span>
                  <div className="flex items-center gap-2"><Calendar size={14} /> {post.date}</div>
                </div>
                <h3 className="text-2xl font-serif group-hover:text-accent transition-colors">{post.title}</h3>
                <p className="text-primary/60 line-clamp-2">{post.excerpt}</p>
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
          <div className="absolute top-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif mb-6">Rejoignez la communauté Laine&Déco</h2>
            <p className="text-white/70 mb-10 text-lg">Recevez 10% de réduction sur votre première commande et restez informé de nos nouveaux arrivages.</p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-grow bg-white/10 border border-white/20 rounded-full px-8 py-4 focus:outline-none focus:border-white transition-colors"
              />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-accent text-white px-10 py-4 rounded-full font-bold hover:bg-white hover:text-primary transition-all duration-300 relative overflow-hidden"
              >
                <ShimmerEffect />
                S'abonner
              </motion.button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
