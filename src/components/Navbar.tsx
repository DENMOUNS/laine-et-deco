import React, { useState } from 'react';
import { ShoppingBag, Search, User, Heart, Menu, X, ChevronRight, Globe, Moon, Sun, Settings, Layers, LayoutGrid, Navigation, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORIES } from '../constants';
import { Language, Currency } from '../types';

interface NavbarProps {
  onNavigate: (view: string, id?: string, category?: string) => void;
  currentView: string;
  cartCount: number;
  wishlistCount: number;
  language: Language;
  setLanguage: (l: Language) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onNavigate, 
  currentView, 
  cartCount, 
  wishlistCount,
  language,
  setLanguage,
  currency,
  setCurrency
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="p-2 hover:bg-secondary rounded-full transition-colors lg:hidden"
              >
                <Menu size={24} />
              </button>
              <div 
                onClick={() => onNavigate('home')}
                className="text-2xl font-serif font-bold tracking-tighter cursor-pointer hover:text-accent transition-colors"
              >
                Laine&Déco
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-8">
              <button 
                onClick={() => onNavigate('home')}
                className={`text-sm font-bold uppercase tracking-widest transition-colors ${currentView === 'home' ? 'text-accent' : 'text-primary/60 hover:text-accent'}`}
              >
                Accueil
              </button>
              <button 
                onClick={() => onNavigate('shop')}
                className={`text-sm font-bold uppercase tracking-widest transition-colors ${currentView === 'shop' ? 'text-accent' : 'text-primary/60 hover:text-accent'}`}
              >
                Boutique
              </button>
              <button 
                onClick={() => onNavigate('lookbook')}
                className={`text-sm font-bold uppercase tracking-widest transition-colors ${currentView === 'lookbook' ? 'text-accent' : 'text-primary/60 hover:text-accent'}`}
              >
                Lookbook
              </button>
              <button 
                onClick={() => onNavigate('about')}
                className={`text-sm font-bold uppercase tracking-widest transition-colors ${currentView === 'about' ? 'text-accent' : 'text-primary/60 hover:text-accent'}`}
              >
                À propos
              </button>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-5">
              <div className="hidden sm:flex items-center space-x-4 mr-4 pr-4 border-r border-primary/10">
                <button 
                  onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:text-accent transition-colors"
                >
                  <Globe size={14} />
                  {currency.code}
                </button>
                <button 
                  onClick={toggleDarkMode}
                  className="p-2 hover:bg-secondary rounded-full transition-colors text-primary/40 hover:text-accent"
                >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              </div>

              <button 
                onClick={() => onNavigate('shop')}
                className="p-2 hover:bg-secondary rounded-full transition-colors relative group"
              >
                <Search size={22} className="group-hover:text-accent transition-colors" />
              </button>
              
              <button 
                onClick={() => onNavigate('customer-dashboard')}
                className="p-2 hover:bg-secondary rounded-full transition-colors group"
              >
                <User size={22} className="group-hover:text-accent transition-colors" />
              </button>

              <button 
                onClick={() => onNavigate('wishlist')}
                className="p-2 hover:bg-secondary rounded-full transition-colors relative group"
              >
                <Heart size={22} className="group-hover:text-accent transition-colors" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button 
                onClick={() => onNavigate('cart')}
                className="p-2 hover:bg-secondary rounded-full transition-colors relative group"
              >
                <ShoppingBag size={22} className="group-hover:text-accent transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 bg-primary z-[60] flex flex-col overflow-y-auto"
            >
              <div className="p-6 flex justify-between items-center border-b border-white/10">
                <div className="text-2xl font-serif font-bold text-white tracking-tighter">Laine&Déco</div>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex flex-col p-6 space-y-8 flex-grow">
                {/* Section: Navigation */}
                <div>
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <Navigation size={14} className="text-accent" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Navigation</p>
                  </div>
                  <div className="space-y-1">
                    {[
                      { id: 'home', name: 'Accueil' },
                      { id: 'shop', name: 'Boutique' },
                      { id: 'lookbook', name: 'Lookbook' },
                      { id: 'gallery', name: 'Galerie' },
                      { id: 'about', name: 'À propos' },
                      { id: 'contact', name: 'Contact' },
                      { id: 'care-guide', name: 'Guide d\'entretien' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavigate(item.id);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full text-base font-serif text-left flex justify-between items-center p-3 rounded-xl transition-all ${currentView === item.id ? 'bg-accent text-white font-bold shadow-lg' : 'text-white/80 hover:bg-white/10'}`}
                      >
                        {item.name}
                        <ChevronRight size={16} className={currentView === item.id ? 'opacity-100 text-white' : 'opacity-0'} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section: Catégories */}
                <div>
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <Layers size={14} className="text-accent" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Catégories</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          onNavigate('shop', undefined, cat.name);
                          setIsMenuOpen(false);
                        }}
                        className="text-xs font-medium text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 hover:text-accent transition-colors text-white/90 border border-white/5"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section: Application */}
                <div>
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <LayoutGrid size={14} className="text-accent" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Application</p>
                  </div>
                  <div className="space-y-1">
                    {[
                      { id: 'wool-calculator', name: 'Calculateur Laine' },
                      { id: 'volume-calculator', name: 'Calculateur Volume' },
                      { id: 'gift-box', name: 'Coffrets Cadeaux' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavigate(item.id);
                          setIsMenuOpen(false);
                        }}
                        className={`w-full text-base font-serif text-left flex justify-between items-center p-3 rounded-xl transition-all ${currentView === item.id ? 'bg-accent text-white font-bold shadow-lg' : 'text-white/80 hover:bg-white/10'}`}
                      >
                        {item.name}
                        <ChevronRight size={16} className={currentView === item.id ? 'opacity-100 text-white' : 'opacity-0'} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section: Paramètres */}
                <div className="pb-8">
                  <div className="flex items-center gap-2 mb-4 px-2">
                    <Settings size={14} className="text-accent" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Paramètres</p>
                  </div>
                  <div className="space-y-2">
                    <button 
                      onClick={() => { onNavigate('customer-dashboard'); setIsMenuOpen(false); }} 
                      className={`w-full p-3 rounded-xl text-left flex items-center justify-between text-white/90 hover:bg-white/10 transition-colors font-medium ${currentView === 'customer-dashboard' ? 'bg-white/10' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <User size={16} className="text-accent" />
                        <span>Mon Profil</span>
                      </div>
                      <ChevronRight size={14} className="opacity-40" />
                    </button>

                    <button 
                      onClick={toggleDarkMode}
                      className="w-full p-3 rounded-xl text-left flex items-center justify-between text-white/90 hover:bg-white/10 transition-colors font-medium"
                    >
                      <div className="flex items-center gap-3">
                        {isDarkMode ? <Sun size={16} className="text-accent" /> : <Moon size={16} className="text-accent" />}
                        <span>Mode {isDarkMode ? 'Clair' : 'Sombre'}</span>
                      </div>
                    </button>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <p className="text-[8px] uppercase tracking-tighter text-white/40 mb-1">Langue</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{language.flag}</span>
                          <span className="text-xs font-bold">{language.code}</span>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <p className="text-[8px] uppercase tracking-tighter text-white/40 mb-1">Devise</p>
                        <div className="flex items-center gap-2">
                          <Globe size={12} className="text-accent" />
                          <span className="text-xs font-bold">{currency.code}</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => { onNavigate('home'); setIsMenuOpen(false); }} 
                      className="w-full p-3 rounded-xl text-left flex items-center gap-3 text-red-400 hover:bg-red-500/10 transition-colors font-medium mt-6 border border-red-500/20"
                    >
                      <LogOut size={16} />
                      <span>Déconnexion</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
