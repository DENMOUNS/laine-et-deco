import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Search, User, Heart, Menu, X, ChevronRight, Globe, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CURRENCIES, LANGUAGES, PRODUCTS } from '../constants';
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
  const searchRef = useRef<HTMLDivElement>(null);

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
    { name: 'À propos', view: 'about' },
    { name: 'Contact', view: 'contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-primary">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
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
          <div className="flex items-center space-x-4">
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
                    className="absolute top-full right-0 mt-2 bg-white shadow-2xl rounded-2xl border border-primary/5 p-2 min-w-[120px] z-50"
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
                    className="absolute top-full right-0 mt-2 bg-white shadow-2xl rounded-2xl border border-primary/5 p-2 min-w-[120px] z-50"
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

            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="p-2 text-primary hover:text-accent transition-colors">
              <Search size={20} />
            </button>
            <button onClick={() => onNavigate('wishlist')} className="p-2 text-primary hover:text-accent transition-colors relative">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>
            <button onClick={() => onNavigate('cart')} className="p-2 text-primary hover:text-accent transition-colors relative">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => onNavigate('customer-dashboard')} 
              className={`p-2 transition-colors ${currentView === 'customer-dashboard' ? 'text-accent' : 'text-primary hover:text-accent'}`}
            >
              <User size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white shadow-2xl border-t border-primary/5 z-40"
            ref={searchRef}
          >
            <div className="max-w-3xl mx-auto p-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher de la laine, un vase, une bougie..."
                  className="w-full border-b-2 border-primary/10 py-4 px-4 focus:outline-none focus:border-accent text-xl font-serif transition-colors"
                  autoFocus
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/30" size={24} />
              </div>

              {/* Autocomplete Results */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 space-y-4"
                  >
                    <p className="text-[10px] uppercase tracking-widest font-bold text-primary/40">Suggestions de produits</p>
                    <div className="grid grid-cols-1 gap-2">
                      {searchResults.map(product => (
                        <button
                          key={product.id}
                          onClick={() => {
                            onNavigate('product-detail', product.id);
                            setIsSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-4 p-3 rounded-2xl hover:bg-secondary/50 transition-colors text-left group"
                        >
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-12 h-12 object-cover rounded-xl shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-grow">
                            <h4 className="text-sm font-bold text-primary group-hover:text-accent transition-colors">{product.name}</h4>
                            <p className="text-xs text-primary/40">{product.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-primary">{(product.price * currency.rate).toLocaleString()} {currency.symbol}</p>
                            <ArrowRight size={14} className="ml-auto text-primary/20 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                          </div>
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => {
                        onNavigate('shop', undefined);
                        setIsSearchOpen(false);
                      }}
                      className="w-full py-3 text-xs font-bold uppercase tracking-widest text-accent hover:bg-accent/5 rounded-xl transition-colors"
                    >
                      Voir tous les résultats
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {searchQuery.length > 1 && searchResults.length === 0 && (
                <div className="mt-8 text-center py-12">
                  <p className="text-primary/40 italic font-serif">Aucun produit ne correspond à votre recherche...</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="fixed inset-0 bg-secondary z-50 md:hidden flex flex-col p-8"
          >
            <div className="flex justify-between items-center mb-12">
              <h1 className="text-2xl font-serif font-bold text-primary">Laine&Déco</h1>
              <button onClick={() => setIsMenuOpen(false)} className="p-2">
                <X size={24} />
              </button>
            </div>
            <div className="flex flex-col space-y-6 flex-grow">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => {
                    onNavigate(link.view);
                    setIsMenuOpen(false);
                  }}
                  className={`text-2xl font-serif text-left flex justify-between items-center group ${currentView === link.view ? 'text-accent' : 'text-primary'}`}
                >
                  {link.name}
                  <ChevronRight className={currentView === link.view ? 'opacity-100 text-accent' : 'opacity-0 group-hover:opacity-100 transition-opacity'} />
                </button>
              ))}
              <hr className="border-primary/10" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Langue</p>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => setLanguage(lang)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${language.code === lang.code ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary/10'}`}
                      >
                        {lang.flag} {lang.code.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Devise</p>
                  <div className="flex flex-wrap gap-2">
                    {CURRENCIES.map(curr => (
                      <button
                        key={curr.code}
                        onClick={() => setCurrency(curr)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${currency.code === curr.code ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-primary/10'}`}
                      >
                        {curr.code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <hr className="border-primary/10" />
              <button onClick={() => { onNavigate('customer-dashboard'); setIsMenuOpen(false); }} className="text-xl font-serif text-left flex items-center gap-3">
                <User size={20} /> Mon Compte
              </button>
              <button onClick={() => { onNavigate('order-tracking'); setIsMenuOpen(false); }} className="text-xl font-serif text-left">Suivre ma commande</button>
              <button onClick={() => { onNavigate('admin-dashboard'); setIsMenuOpen(false); }} className="text-xl font-serif text-left text-primary/30">Admin Panel</button>
            </div>
            
            <div className="mt-auto pt-8 border-t border-primary/10">
              <div className="flex justify-center space-x-6">
                <a href="#" className="text-primary/40 hover:text-accent transition-colors">Instagram</a>
                <a href="#" className="text-primary/40 hover:text-accent transition-colors">Pinterest</a>
                <a href="#" className="text-primary/40 hover:text-accent transition-colors">Facebook</a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
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
              <li><button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">Nouveautés</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">Promotions</button></li>
            </ul>
          </div>
            <div>
              <h3 className="font-bold mb-6 uppercase tracking-widest text-xs">Aide</h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li><button onClick={() => onNavigate('order-tracking')} className="hover:text-white transition-colors">Suivi de commande</button></li>
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
