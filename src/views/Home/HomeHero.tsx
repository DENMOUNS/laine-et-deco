import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Camera, Loader2, ArrowRight } from 'lucide-react';
import { SiteConfig } from '../../types';
import { analyzeProductImage } from '../../utils/aiUtils';

interface HomeHeroProps {
  siteConfig: SiteConfig;
  onNavigate: (view: string, id?: string, query?: string) => void;
}

const ShimmerEffect: React.FC = () => (
  <motion.div
    initial={{ x: '-150%', skewX: -25 }}
    animate={{ x: '250%' }}
    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3.5, ease: "easeInOut" }}
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent z-10 pointer-events-none"
  />
);

export const HomeHero: React.FC<HomeHeroProps> = ({ siteConfig, onNavigate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const HERO_SLIDES = [
    { image: siteConfig.hero.backgroundImage, title: siteConfig.hero.title, subtitle: "Bienvenue chez Laine & Déco", link: "shop" },
    { image: "https://picsum.photos/seed/promo1/1920/1080", title: "Nouvelle Collection Artisanale", subtitle: "Découvrez nos dernières créations", link: "shop" },
    { image: "https://picsum.photos/seed/promo2/1920/1080", title: "Promotions de Printemps", subtitle: "Jusqu'à -50% sur une sélection", link: "shop" }
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) onNavigate('shop', undefined, searchQuery);
  };

  const handleImageSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setIsAnalyzingImage(true);
      const keywords = await analyzeProductImage(base64);
      if (keywords) onNavigate('shop', undefined, keywords);
      setIsAnalyzingImage(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="relative h-[90vh] flex items-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div key={currentSlide} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2} onDragEnd={(e, { offset }) => { if (offset.x < -50) setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length); else if (offset.x > 50) setCurrentSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length); }}>
          <img src={HERO_SLIDES[currentSlide].image} alt="Hero" className="w-full h-full object-cover pointer-events-none" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
        </motion.div>
      </AnimatePresence>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div key={currentSlide} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl text-white">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] mb-6 text-accent">{HERO_SLIDES[currentSlide].subtitle}</span>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif leading-[1.1] mb-10">{HERO_SLIDES[currentSlide].title}</h1>
          <div className="max-w-2xl mb-12">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-accent transition-colors"><Search size={24} /></div>
              <input type="text" placeholder="Rechercher un produit, une catégorie..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full py-6 pl-16 pr-48 text-lg focus:outline-none focus:border-white/40 transition-all placeholder:text-white/40" />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all flex items-center gap-2" title="Rechercher par image">{isAnalyzingImage ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}</button>
                <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-accent text-white px-6 py-3 rounded-full font-bold hover:bg-white hover:text-primary transition-all shadow-lg relative overflow-hidden"><ShimmerEffect />Go</motion.button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageSearch} accept="image/*" className="hidden" />
            </form>
          </div>
          <div className="flex flex-wrap gap-6">
            <motion.button onClick={() => onNavigate(HERO_SLIDES[currentSlide].link)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-white text-primary px-12 py-5 rounded-full font-bold hover:bg-accent hover:text-white transition-all duration-300 flex items-center group shadow-xl relative overflow-hidden"><ShimmerEffect />Voir plus<ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" size={24} /></motion.button>
            <div className="flex gap-2 items-center ml-auto">{HERO_SLIDES.map((_, i) => (<button key={i} onClick={() => setCurrentSlide(i)} className={`w-3 h-3 rounded-full transition-all ${currentSlide === i ? 'bg-accent w-8' : 'bg-white/30 hover:bg-white/50'}`} />))}</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
