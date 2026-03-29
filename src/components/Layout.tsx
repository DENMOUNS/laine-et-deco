import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Search, User, Heart, Menu, X, ChevronRight, Globe, ArrowRight, Moon, Sun, Settings, Layers, LayoutGrid, Navigation, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CURRENCIES, LANGUAGES, PRODUCTS, CATEGORIES, PACKS } from '../constants';
import { Language, Currency, Product } from '../types';

interface NavbarProps {
  onNavigate: (view: string, id?: string) => void;
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const filtered = PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Accueil', view: 'home' },
    { name: 'Boutique', view: 'shop' },
    { name: 'Coffrets', view: 'gift-box' },
    { name: 'Lookbook', view: 'lookbook' },
    { name: 'Galerie', view: 'gallery' },
    { name: 'Calculateur Laine', view: 'wool-calculator' },
    { name: 'Calculateur Volume', view: 'volume-calculator' },
    { name: 'Blog', view: 'blog' },
    { name: 'À propos', view: 'about' },
    { name: 'Contact', view: 'contact' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 glass border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 relative">
          {/* Mobile Menu Button & Logo Container */}
          <div className="flex items-center gap-3 md:hidden z-20">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-primary hover:bg-primary/5 rounded-full transition-colors">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="cursor-pointer pt-1" onClick={() => onNavigate('home')}>
              <h1 className="text-base font-serif font-bold tracking-tight text-primary leading-none">
                Laine<span className="text-accent">&</span>Déco
              </h1>
            </div>
          </div>

          {/* Desktop Logo */}
          <div className="hidden md:flex flex-shrink-0 items-center cursor-pointer" onClick={() => onNavigate('home')}>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-primary">
              Laine<span className="text-accent">&</span>Déco
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => onNavigate(link.view)}
                className={`text-sm font-bold uppercase tracking-widest transition-all hover:text-accent relative py-2 ${
                  currentView === link.view ? 'text-accent' : 'text-primary/70'
                }`}
              >
                {link.name}
                {currentView === link.view && (
                  <motion.div 
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-1 md:space-x-2 z-20">
            {/* Language Selector */}
            <div className="relative hidden md:block">
              <button 
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-primary/5 transition-colors text-xs font-bold text-primary/60"
              >
                <span>{language.flag}</span>
                {language.code.toUpperCase()}
              </button>
              <AnimatePresence>
                {isLanguageOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 glass shadow-2xl rounded-2xl border border-primary/5 p-2 min-w-[120px] z-50"
                  >
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => { setLanguage(lang); setIsLanguageOpen(false); }}
                        className={`w-full text-left px-4 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-3 ${
                          language.code === lang.code ? 'bg-primary text-white' : 'hover:bg-primary/5 text-primary/70'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        {lang.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Currency Selector */}
            <div className="relative hidden md:block">
              <button 
                onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-primary/5 transition-colors text-xs font-bold text-primary/60"
              >
                <Globe size={14} />
                {currency.code}
              </button>
              <AnimatePresence>
                {isCurrencyOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full right-0 mt-2 glass shadow-2xl rounded-2xl border border-primary/5 p-2 min-w-[120px] z-50"
                  >
                    {CURRENCIES.map(curr => (
                      <button
                        key={curr.code}
                        onClick={() => { setCurrency(curr); setIsCurrencyOpen(false); }}
                        className={`w-full text-left px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                          currency.code === curr.code ? 'bg-primary text-white' : 'hover:bg-primary/5 text-primary/70'
                        }`}
                      >
                        {curr.name} ({curr.symbol})
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={toggleDarkMode} className="p-2 text-primary hover:text-accent transition-colors rounded-full hover:bg-primary/5">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => onNavigate('shop')} className="p-2 text-primary hover:text-accent transition-colors rounded-full hover:bg-primary/5">
              <Search size={20} />
            </button>
            <button onClick={() => onNavigate('wishlist')} className="p-2 text-primary hover:text-accent transition-colors relative rounded-full hover:bg-primary/5">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>
            <button onClick={() => onNavigate('cart')} className="p-2 text-primary hover:text-accent transition-colors relative rounded-full hover:bg-primary/5">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => onNavigate('customer-dashboard')} 
              className={`p-2 transition-colors rounded-full hover:bg-primary/5 ${currentView === 'customer-dashboard' ? 'text-accent' : 'text-primary hover:text-accent'}`}
            >
              <User size={20} />
            </button>
          </div>
        </div>
      </div>

      </nav>

      {/* Mobile Menu (Sidebar) */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          />
        )}
        {isMenuOpen && (
          <motion.div
            key="sidebar"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-[70%] max-w-[280px] shadow-2xl z-50 md:hidden flex flex-col overflow-y-auto bg-primary text-white"
          >
              <div className="p-6 border-b border-white/10 bg-primary/50 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-xl font-serif font-bold text-white">Menu</h1>
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-white/10 rounded-full shadow-sm text-white hover:text-accent transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-2xl shadow-sm border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Bienvenue</p>
                    <p className="font-serif font-bold text-white">Invité</p>
                  </div>
                </div>
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

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold">Laine&Déco</h2>
            <p className="text-white/70 text-sm leading-relaxed">
              Créer une atmosphère chaleureuse et authentique dans votre foyer avec nos laines sélectionnées et nos objets de décoration artisanaux.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-6 uppercase tracking-widest text-xs">Boutique</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li><button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">Toutes les laines</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">Décoration</button></li>
              <li><button onClick={() => onNavigate('lookbook')} className="hover:text-white transition-colors">Lookbook</button></li>
              <li><button onClick={() => onNavigate('gallery')} className="hover:text-white transition-colors">Galerie</button></li>
            </ul>
          </div>
            <div>
              <h3 className="font-bold mb-6 uppercase tracking-widest text-xs">Aide</h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li><button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">Contactez-nous</button></li>
                <li><button onClick={() => onNavigate('care-guide')} className="hover:text-white transition-colors">Guide d'entretien</button></li>
                <li><button onClick={() => onNavigate('shipping')} className="hover:text-white transition-colors">Livraison</button></li>
                <li><button onClick={() => onNavigate('returns')} className="hover:text-white transition-colors">Retours</button></li>
                <li><button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors">FAQ</button></li>
              </ul>
            </div>
          <div>
            <h3 className="font-bold mb-6 uppercase tracking-widest text-xs">Newsletter</h3>
            <p className="text-white/70 text-sm mb-4">Inscrivez-vous pour recevoir nos inspirations déco et offres exclusives.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Votre email"
                className="bg-white/10 border border-white/20 px-4 py-2 text-sm w-full focus:outline-none focus:border-white"
              />
              <button className="bg-white text-primary px-4 py-2 text-sm font-bold hover:bg-accent hover:text-white transition-colors">
                OK
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-white/40">
          <p>© 2024 Laine & Déco. Tous droits réservés.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <button onClick={() => onNavigate('team')} className="hover:text-white transition-colors">Équipe</button>
            <button onClick={() => onNavigate('admin-dashboard')} className="hover:text-white transition-colors">Administration</button>
            <button onClick={() => onNavigate('legal')} className="hover:text-white transition-colors">Mentions légales</button>
            <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">Confidentialité</button>
            <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">CGV</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
