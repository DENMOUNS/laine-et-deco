import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Search, User, Heart, Menu, X, ChevronRight, ChevronDown, ArrowRight, Moon, Sun, Home, Shield, ArrowRightLeft, QrCode, Scissors } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { where } from 'firebase/firestore';

import { initialsAvatarDataUri } from '../utils/avatarFallback';
import { useStaticEntity } from '../hooks/useStaticEntity';
import { useLoadingSequence } from '../hooks/useLoadingSequence';
import { Product, NavItem } from '../../types';
import { DEFAULT_NAV_ITEMS } from '../../siteDefaults';
import { useConfigStore } from '../../stores/configStore';
import { useThemeStore } from '../../stores/themeStore';
import { isFeatureEnabled } from '../utils/featureFlags';
import type { User as FirebaseUser } from 'firebase/auth';

export const LogoDisplay: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const { isMarqueeReady } = useLoadingSequence();
  const { data: logos } = useStaticEntity<any>('site_logo', [], {
    enabled: isMarqueeReady,
    constraints: [where('status', '==', 'active')],
  });
  const activeLogo = logos?.[0];
  const logoSrc = activeLogo?.image || activeLogo?.lien;
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [logoSrc]);

  if (logoSrc && !imgError && logoSrc !== '/logo.png') {
    return (
      <img 
        src={logoSrc} 
        alt="LAINE ET DECO" 
        onError={() => setImgError(true)}
        className={`${compact ? 'h-7 sm:h-8' : 'h-10 md:h-12'} w-auto object-contain transition-transform group-hover:scale-105`} 
      />
    );
  }
  
  return (
    <div className="flex items-center">
      <div className={`flex items-center justify-center ${compact ? 'p-1.5 rounded-lg' : 'p-2 rounded-xl'} bg-gradient-to-br from-accent to-accent/90 text-white shadow-[0_4px_12px_rgba(230,111,105,0.3)] border border-white/20 transition-transform group-hover:scale-105`}>
         <Scissors className={`${compact ? 'h-4 w-4 sm:h-5 sm:w-5' : 'h-6 w-6 sm:h-8 sm:w-8'} text-white stroke-[2]`} />
      </div>
      <span className={`${compact ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl md:text-3xl'} font-serif font-black tracking-tight text-primary ml-2.5 relative whitespace-nowrap`}>
        Laine & <span className="text-accent underline decoration-accent/30 decoration-2 underline-offset-4">Déco</span>
      </span>
    </div>
  );
};

interface NavbarProps {
  onNavigate: (view: string, id?: string, query?: string) => void;
  currentView: string;
  cartCount: number;
  wishlistCount: number;
  user: FirebaseUser | null;
  userRole: string;
  comparisonList?: Product[];
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onNavigate, 
  currentView, 
  cartCount, 
  wishlistCount,
  user,
  userRole,
  comparisonList = [],
}) => {
  const { isMarqueeReady } = useLoadingSequence();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInfoMenuOpen, setIsInfoMenuOpen] = useState(false);
  const siteConfig = useConfigStore((state) => state.siteConfig);
  const { theme, toggleTheme } = useThemeStore();
  const { data: CATEGORIES } = useStaticEntity<any>('category', [], { enabled: isMenuOpen, cacheOnly: true });

  // Lecture directe Firestore — chargé après le marquee
  const { data: firestoreNavItems, isLoading: navLoading } = useStaticEntity<NavItem>('nav_item', [], {
    enabled: isMarqueeReady,
  });

  // Default robust navigation items if Firestore is empty
  const defaultNavs: NavItem[] = [
    { id: 'n-shop', name: 'Boutique', view: 'shop', order: 1, status: 'active' },
    { id: 'n-lookbook', name: 'Lookbook', view: 'lookbook', order: 1, status: 'active' },
    { id: 'n-companion', name: 'Compagnon Tricot', view: 'knitting-companion', order: 2, status: 'active' },
    { id: 'n-generator', name: 'Générateur IA', view: 'pattern-generator', order: 2, status: 'active' },
    { id: 'n-configurator', name: 'Configurateur', view: 'configurator', order: 2, status: 'active' },
    { id: 'n-custom', name: 'Sur Mesure', view: 'custom-order', order: 2, status: 'active' },
    { id: 'n-blog', name: 'Blog Inspirations', view: 'blog', order: 2, status: 'active' },
    { id: 'n-calculator', name: 'Calculateur de Laine', view: 'calculator', order: 2, status: 'active' },
    { id: 'n-volcalc', name: 'Calculateur de Volume', view: 'volume-calculator', order: 2, status: 'active' },
    { id: 'n-qr', name: 'Aperçu QR Landing', view: 'qr-landing', order: 2, status: 'active' },
  ];

  const resolvedNavItems: NavItem[] = (firestoreNavItems && firestoreNavItems.length > 0)
    ? firestoreNavItems
    : defaultNavs;

  // order === 1 → top navbar  |  order > 1 → sidebar
  const featureAwareNavItems = resolvedNavItems;

  const mainNavLinks = featureAwareNavItems
    .filter(item => item.status === 'active' && item.order === 1);

  const dynamicSidebarLinks = featureAwareNavItems
    .filter(item => item.status === 'active' && item.order > 1 && item.view !== 'loyalty' && item.name !== 'Points VIP')
    .map(item => ({ id: item.id, name: item.name, view: item.view, icon: <ChevronRight size={18} /> }));

  const aboutSectionViews = ['about', 'team', 'contact', 'faq', 'legal', 'privacy', 'terms'];
  const isAboutSectionActive = aboutSectionViews.includes(currentView);

  const sidebarLinks = dynamicSidebarLinks.length > 0 ? dynamicSidebarLinks : [
    { id: 'sb-companion', name: 'Compagnon Tricot', view: 'knitting-companion', icon: <ChevronRight size={18} /> },
    { id: 'sb-generator', name: 'Générateur IA', view: 'pattern-generator', icon: <ChevronRight size={18} /> },
    { id: 'sb-configurator', name: 'Configurateur', view: 'configurator', icon: <ChevronRight size={18} /> },
    { id: 'sb-custom', name: 'Sur Mesure', view: 'custom-order', icon: <ChevronRight size={18} /> },
    { id: 'sb-lookbook', name: 'Lookbook', view: 'lookbook', icon: <ChevronRight size={18} /> },
    { id: 'sb-blog', name: 'Blog Inspirations', view: 'blog', icon: <ChevronRight size={18} /> },
    { id: 'sb-contact', name: 'Contactez-nous', view: 'contact', icon: <ChevronRight size={18} /> },
    { id: 'sb-calculator', name: 'Calculateur de Laine', view: 'calculator', icon: <ChevronRight size={18} /> },
    { id: 'sb-volcalc', name: 'Calculateur de Volume', view: 'volume-calculator', icon: <ChevronRight size={18} /> },
    { id: 'sb-qr', name: 'Aperçu QR Landing', view: 'qr-landing', icon: <ChevronRight size={18} /> },
  ];

  const navLinks = [
    ...mainNavLinks,
  ];
  const hasBackofficeAccess = true;

  return (
    <>
      <nav className="hidden md:block sticky top-0 z-50 glass-ios-navbar transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 relative">
          <div className="flex items-center gap-3 z-20 flex-shrink-0">
            <div className="cursor-pointer flex items-center group" onClick={() => onNavigate('home')}>
              <LogoDisplay />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-8">
            {mainNavLinks.map((link) => (
              <button
                key={link.id || link.view || link.name}
                onClick={() => onNavigate(link.view)}
                className={`text-sm font-bold uppercase tracking-widest transition-all hover:text-accent relative py-2 ${
                  currentView === link.view ? 'text-accent' : 'text-primary'
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

          <div className="flex items-center space-x-1 md:space-x-2 z-20">
            {/* Icons visible on all screens */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 flex-nowrap z-20">
              <button 
                aria-label="Rechercher"
                onClick={() => onNavigate('shop')} 
                className="p-2.5 text-primary hover:text-accent transition-colors rounded-full glass-ios-pill hover:bg-white/90"
                title="Rechercher"
              >
                <Search size={19} />
              </button>
              <button aria-label="Favoris" onClick={() => onNavigate('wishlist')} className="flex p-2.5 text-primary hover:text-accent transition-colors relative rounded-full glass-ios-pill hover:bg-white/90">
                <Heart size={19} />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-accent text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </button>
              <button aria-label="Panier" onClick={() => onNavigate('cart')} className="p-2.5 text-primary hover:text-accent transition-colors relative rounded-full glass-ios-pill hover:bg-white/90">
                <ShoppingBag size={19} />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>
              <button aria-label="Comparateur" onClick={() => onNavigate('comparison')} className="hidden sm:flex lg:flex p-2.5 text-primary hover:text-accent transition-colors relative rounded-full glass-ios-pill hover:bg-white/90">
                <ArrowRightLeft size={19} />
                {comparisonList?.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-accent text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                    {comparisonList.length}
                  </span>
                )}
              </button>
              {hasBackofficeAccess && (
                <button 
                  aria-label="Tableau de bord Admin"
                  onClick={() => onNavigate('admin-dashboard')} 
                  className={`hidden md:flex p-2.5 transition-colors rounded-full glass-ios-pill hover:bg-white/90 ${currentView === 'admin-dashboard' ? 'text-accent' : 'text-primary'}`}
                  title="Tableau de bord Admin"
                >
                  <Shield size={19} />
                </button>
              )}
              <button 
                aria-label="Compte utilisateur"
                onClick={() => user ? onNavigate('customer-dashboard') : onNavigate('auth')} 
                className={`flex p-2 sm:p-2.5 transition-colors rounded-full glass-ios-pill hover:bg-white/90 ${currentView === 'customer-dashboard' ? 'text-accent' : 'text-primary'} items-center gap-2`}
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Profil'}
                    className="w-6 h-6 rounded-full border border-primary/10"
                    width="24"
                    height="24"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = initialsAvatarDataUri(user?.displayName, 48);
                    }}
                  />
                ) : (
                  <User size={19} />
                )}
                {user && <span className="hidden xl:block text-xs font-bold">{user.displayName || 'Compte'}</span>}
              </button>
              {/* Bouton de mode sombre sur ordinateur */}
              <button 
                aria-label={theme === 'dark' ? "Activer le mode clair" : "Activer le mode sombre"}
                onClick={toggleTheme}
                className="p-2.5 text-primary hover:text-accent transition-colors rounded-full glass-ios-pill hover:bg-white/90 ml-0.5"
                title={theme === 'dark' ? "Passer au thème clair" : "Passer au thème sombre"}
              >
                {theme === 'dark' ? <Sun size={19} className="text-amber-500" /> : <Moon size={19} />}
              </button>
              <button 
                aria-label="Menu principal"
                onClick={() => setIsMenuOpen(true)}
                className="p-2.5 text-primary hover:text-accent transition-colors rounded-full glass-ios-pill hover:bg-white/90 ml-0.5"
              >
                <Menu size={19} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

      {/* Navigation Sidebar */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-xl transition-all"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              className="fixed inset-y-0 left-0 w-[88%] max-w-sm shadow-[0_25px_60px_rgba(0,0,0,0.5)] z-[110] flex flex-col overflow-y-auto bg-[#232d24]/90 backdrop-blur-2xl border-r border-white/20 text-white"
            >
              <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-10">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-xl font-serif font-bold text-white">Menu & Services</h1>
                  <div className="flex items-center gap-2">
                    {/* Bouton de mode sombre dans le menu latéral */}
                    <button 
                      aria-label={theme === 'dark' ? "Activer le mode clair" : "Activer le mode sombre"}
                      onClick={toggleTheme}
                      className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full shadow-sm text-white hover:text-accent transition-colors border border-white/15 flex items-center justify-center active:scale-95"
                      title={theme === 'dark' ? "Passer au thème clair" : "Passer au thème sombre"}
                    >
                      {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
                    </button>
                    <button aria-label="Fermer le menu" onClick={() => setIsMenuOpen(false)} className="p-2.5 bg-white/15 hover:bg-white/25 rounded-full shadow-sm text-white hover:text-accent transition-colors border border-white/20">
                      <X size={18} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-2xl shadow-sm border border-white/15 backdrop-blur-md">
                  <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center overflow-hidden shadow-md">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'Profil'}
                        className="w-full h-full object-cover"
                        width="48"
                        height="48"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = initialsAvatarDataUri(user?.displayName, 96);
                        }}
                      />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white uppercase tracking-widest">Bienvenue</p>
                    <p className="font-serif font-bold text-white">{user?.displayName || (user ? 'Utilisateur' : 'Invité')}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col p-6 pb-36 space-y-2 flex-grow">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white mb-2 px-2">Navigation Principale</p>
                <div className="grid grid-cols-1 gap-1">
                  <button
                    onClick={() => { onNavigate('home'); setIsMenuOpen(false); }}
                    className={`text-sm font-medium text-left p-3 rounded-xl transition-all flex items-center gap-3 ${currentView === 'home' ? 'bg-accent text-white' : 'text-white hover:bg-white/10'}`}
                  >
                    <Home size={18} /> Accueil
                  </button>
                  {mainNavLinks.map((link) => (
                    <button
                      key={link.id || link.view || link.name}
                      onClick={() => {
                        onNavigate(link.view);
                        setIsMenuOpen(false);
                      }}
                      className={`text-lg font-serif text-left flex justify-between items-center p-4 rounded-2xl transition-all ${currentView === link.view ? 'bg-accent text-white font-bold shadow-lg' : 'text-white hover:bg-white/10'}`}
                    >
                      {link.name}
                      <ChevronRight size={18} className={currentView === link.view ? 'opacity-100 text-white' : 'opacity-40'} />
                    </button>
                  ))}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const query = formData.get('q')?.toString().trim();
                      if (query) {
                        onNavigate('shop', undefined, query);
                      } else {
                        onNavigate('shop');
                      }
                      setIsMenuOpen(false);
                    }}
                    className="p-3 bg-white/10 rounded-2xl shadow-sm border border-white/5 flex items-center gap-2 mt-2"
                  >
                    <Search size={18} className="text-white/50 shrink-0" />
                    <input 
                      type="text" 
                      name="q"
                      placeholder="Rechercher un produit..." 
                      className="bg-transparent text-sm text-white placeholder-white/45 focus:outline-none w-full"
                    />
                    <button type="submit" className="text-xs bg-accent text-white px-3 py-1.5 rounded-xl font-bold hover:bg-accent/80 transition-colors shrink-0">
                      Go
                    </button>
                  </form>
                </div>

                <hr className="border-white/10 my-6" />

                <p className="text-[10px] font-bold uppercase tracking-widest text-white mb-2 px-2">Outils & Services</p>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => { onNavigate('wishlist'); setIsMenuOpen(false); }}
                    className="sm:hidden text-sm font-medium text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Heart size={18} /> Favoris
                    </div>
                    {wishlistCount > 0 && <span className="bg-accent text-[10px] px-2 py-0.5 rounded-full">{wishlistCount}</span>}
                  </button>
                  <button
                    onClick={() => { onNavigate('comparison'); setIsMenuOpen(false); }}
                    className="lg:hidden text-sm font-medium text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft size={18} /> Comparateur
                    </div>
                    {comparisonList?.length > 0 && <span className="bg-accent text-[10px] px-2 py-0.5 rounded-full">{comparisonList.length}</span>}
                  </button>
                  {sidebarLinks.map((link) => (
                    <button
                      key={link.id || link.view || link.name}
                      onClick={() => {
                        onNavigate(link.view);
                        setIsMenuOpen(false);
                      }}
                      className={`text-sm font-medium text-left p-3 rounded-xl transition-all flex items-center justify-between border border-white/5 ${
                        currentView === link.view 
                          ? 'bg-accent text-white font-bold shadow-md' 
                          : 'bg-white/5 text-white hover:bg-white/10 hover:text-accent'
                      }`}
                    >
                      <span>{link.name}</span>
                      {link.name.includes('Générateur') || link.name.includes('Compagnon') ? (
                        <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full">Nouveau</span>
                      ) : (
                        <ChevronRight size={14} className="opacity-40" />
                      )}
                    </button>
                  ))}
                  
                </div>

                <hr className="border-white/10 my-6" />

                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-2 px-2">Catégories</p>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id || cat.name || cat.slug}
                      onClick={() => {
                        onNavigate('shop', undefined, cat.name);
                        setIsMenuOpen(false);
                      }}
                      className="text-sm font-medium text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 hover:text-accent transition-colors text-white border border-white/5"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                <hr className="border-white/10 my-6" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-white mb-2 px-2">Informations publiques</p>
                <div className="grid grid-cols-1 gap-2">
                  {isFeatureEnabled(siteConfig, 'about') && <button onClick={() => { onNavigate('about'); setIsMenuOpen(false); }} className="text-sm font-medium text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white">À propos</button>}
                  {isFeatureEnabled(siteConfig, 'team') && <button onClick={() => { onNavigate('team'); setIsMenuOpen(false); }} className="text-sm font-medium text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white">Notre équipe</button>}
                  {isFeatureEnabled(siteConfig, 'contact') && <button onClick={() => { onNavigate('contact'); setIsMenuOpen(false); }} className="text-sm font-medium text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white">Nous contacter</button>}
                  {isFeatureEnabled(siteConfig, 'faq') && <button onClick={() => { onNavigate('faq'); setIsMenuOpen(false); }} className="text-sm font-medium text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white">FAQ</button>}
                  <button onClick={() => { onNavigate('legal'); setIsMenuOpen(false); }} className="text-sm font-medium text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white">Mentions légales</button>
                  <button onClick={() => { onNavigate('terms'); setIsMenuOpen(false); }} className="text-sm font-medium text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white">CGV</button>
                </div>


                

                
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-2 px-2">Compte</p>
                  <button onClick={() => { user ? onNavigate('customer-dashboard') : onNavigate('auth'); setIsMenuOpen(false); }} className="w-full p-4 rounded-2xl text-left flex items-center gap-3 text-white hover:bg-white/10 transition-colors font-medium">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"><User size={16} /></div>
                    {user ? 'Mon Compte' : 'Se connecter'}
                  </button>
                  {user && (
                    <button
                      type="button"
                      aria-label="Se déconnecter"
                      onClick={async () => {
                        const { initFirebase } = await import('../../backend/firebase');
                        const { signOut } = await import('firebase/auth');
                        const { auth: firebaseAuth } = initFirebase();
                        if (firebaseAuth) await signOut(firebaseAuth);
                        setIsMenuOpen(false);
                      }}
                      className="w-full p-4 rounded-2xl text-left flex items-center gap-3 text-red-400 hover:bg-red-500/10 transition-colors font-medium"
                    >
                      <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500"><X size={16} /></div>
                      Déconnexion
                    </button>
                  )}
                  {hasBackofficeAccess && (
                    <>
                      <button onClick={() => { onNavigate('admin-dashboard'); setIsMenuOpen(false); }} className="w-full p-4 rounded-2xl text-left flex items-center gap-3 text-white/70 hover:bg-white/10 hover:text-white transition-colors font-medium">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><Shield size={16} /></div>
                        Admin Panel
                      </button>
                      <button onClick={() => { onNavigate('qr-landing'); setIsMenuOpen(false); }} className="w-full p-4 rounded-2xl text-left flex items-center gap-3 text-white/70 hover:bg-white/10 hover:text-white transition-colors font-medium">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"><QrCode size={16} /></div>
                        Aperçu QR Landing
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

interface FooterProps {
  onNavigate: (view: string) => void;
  user?: FirebaseUser | null;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, user }) => {
  const siteConfig = useConfigStore((state) => state.siteConfig);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    shop: false,
    apps: false,
    about: false,
    tools: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <footer className="bg-[#3E4A3D] dark:bg-[#0d0f0d] text-white pt-10 sm:pt-16 pb-32 sm:pb-36 md:pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand presentation */}
        <div className="flex flex-col items-center text-center md:items-start md:text-left mb-8 md:mb-12">
          <div className="bg-white/10 p-3 sm:p-4 rounded-2xl inline-block group cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center p-1.5 bg-gradient-to-br from-accent to-accent/90 text-white rounded-lg shadow-lg border border-white/20 transition-transform group-hover:scale-105">
                 <Scissors className="h-5 w-5 sm:h-6 sm:w-6 text-white stroke-[2]" />
              </div>
              <h2 className="text-xl font-serif font-black tracking-tight whitespace-nowrap">
                Laine & <span className="text-accent underline decoration-accent/30 decoration-2 underline-offset-4">Déco</span>
              </h2>
            </div>
          </div>
          <p className="text-white/70 text-xs sm:text-sm leading-relaxed max-w-md mt-3">
            Créer une atmosphère chaleureuse et authentique dans votre foyer avec nos laines sélectionnées et nos objets de décoration artisanaux.
          </p>
        </div>

        {/* Mobile Accordion Style Footer (md:hidden) */}
        <div className="md:hidden space-y-3 mb-8">
          {/* Section Boutique */}
          <div className="rounded-2xl bg-white/10 dark:bg-black/30 border border-white/20 dark:border-white/15 overflow-hidden backdrop-blur-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12),inset_0_1px_1.5px_rgba(255,255,255,0.25)]">
            <button
              onClick={() => toggleSection('shop')}
              className="w-full py-4 px-4 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-white"
            >
              <span>Boutique</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${openSections.shop ? 'rotate-180 text-accent' : 'text-white/60'}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {openSections.shop && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden border-t border-white/10"
                >
                  <ul className="py-3 px-4 space-y-2.5 text-xs text-white/80 bg-white/5">
                    <li><button onClick={() => onNavigate('shop')} className="hover:text-white py-1 block w-full text-left">Toutes les laines</button></li>
                    <li><button onClick={() => onNavigate('shop')} className="hover:text-white py-1 block w-full text-left">Décoration</button></li>
                    <li><button onClick={() => onNavigate('shop')} className="hover:text-white py-1 block w-full text-left">Nouveautés</button></li>
                    <li><button onClick={() => onNavigate('shop')} className="hover:text-white py-1 block w-full text-left">Promotions</button></li>
                    <li><button onClick={() => onNavigate('packs')} className="hover:text-white py-1 block w-full text-left font-medium text-accent">Packs & Bundles</button></li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section Applications */}
          <div className="rounded-2xl bg-white/10 dark:bg-black/30 border border-white/20 dark:border-white/15 overflow-hidden backdrop-blur-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12),inset_0_1px_1.5px_rgba(255,255,255,0.25)]">
            <button
              onClick={() => toggleSection('apps')}
              className="w-full py-4 px-4 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-white"
            >
              <span>Applications & Créativité</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${openSections.apps ? 'rotate-180 text-accent' : 'text-white/60'}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {openSections.apps && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden border-t border-white/10"
                >
                  <ul className="py-3 px-4 space-y-2.5 text-xs text-white/80 bg-white/5">
                    {isFeatureEnabled(siteConfig, 'comparison') && <li><button onClick={() => onNavigate('comparison')} className="hover:text-white py-1 block w-full text-left">Comparateur</button></li>}
                    {isFeatureEnabled(siteConfig, 'knittingCompanion') && <li><button onClick={() => onNavigate('knitting-companion')} className="hover:text-white py-1 block w-full text-left">Compagnon Tricot</button></li>}
                    {isFeatureEnabled(siteConfig, 'lookbook') && <li><button onClick={() => onNavigate('lookbook')} className="hover:text-white py-1 block w-full text-left">Lookbook</button></li>}
                    {isFeatureEnabled(siteConfig, 'customOrder') && <li><button onClick={() => onNavigate('custom-order')} className="hover:text-white py-1 block w-full text-left">Sur Mesure</button></li>}
                    {isFeatureEnabled(siteConfig, 'patternGenerator') && <li><button onClick={() => onNavigate('pattern-generator')} className="hover:text-white py-1 block w-full text-left">Générateur IA</button></li>}
                    <li><button onClick={() => onNavigate('configurator')} className="hover:text-white py-1 block w-full text-left">Configurateur</button></li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section Aide & Outils */}
          <div className="rounded-2xl bg-white/10 dark:bg-black/30 border border-white/20 dark:border-white/15 overflow-hidden backdrop-blur-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12),inset_0_1px_1.5px_rgba(255,255,255,0.25)]">
            <button
              onClick={() => toggleSection('tools')}
              className="w-full py-4 px-4 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-white"
            >
              <span>Aide & Outils</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${openSections.tools ? 'rotate-180 text-accent' : 'text-white/60'}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {openSections.tools && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden border-t border-white/10"
                >
                  <ul className="py-3 px-4 space-y-2.5 text-xs text-white/80 bg-white/5">
                    {isFeatureEnabled(siteConfig, 'calculator') && <li><button onClick={() => onNavigate('calculator')} className="hover:text-white py-1 block w-full text-left">Calculateur de Laine</button></li>}
                    {isFeatureEnabled(siteConfig, 'volumeCalculator') && <li><button onClick={() => onNavigate('volume-calculator')} className="hover:text-white py-1 block w-full text-left">Calculateur de Volume</button></li>}
                    <li><button onClick={() => onNavigate('care-guide')} className="hover:text-white py-1 block w-full text-left">Guide d'Entretien</button></li>
                    <li><button onClick={() => user ? onNavigate('customer-dashboard') : onNavigate('auth')} className="hover:text-white py-1 block w-full text-left">Mon Compte</button></li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section À propos & Légal */}
          <div className="rounded-2xl bg-white/10 dark:bg-black/30 border border-white/20 dark:border-white/15 overflow-hidden backdrop-blur-2xl shadow-[0_8px_24px_rgba(0,0,0,0.12),inset_0_1px_1.5px_rgba(255,255,255,0.25)]">
            <button
              onClick={() => toggleSection('about')}
              className="w-full py-4 px-4 flex items-center justify-between font-bold text-xs uppercase tracking-wider text-white"
            >
              <span>À propos & Contact</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${openSections.about ? 'rotate-180 text-accent' : 'text-white/60'}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {openSections.about && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden border-t border-white/10"
                >
                  <ul className="py-3 px-4 space-y-2.5 text-xs text-white/80 bg-white/5">
                    {isFeatureEnabled(siteConfig, 'about') && <li><button onClick={() => onNavigate('about')} className="hover:text-white py-1 block w-full text-left">À propos</button></li>}
                    {isFeatureEnabled(siteConfig, 'team') && <li><button onClick={() => onNavigate('team')} className="hover:text-white py-1 block w-full text-left">Notre équipe</button></li>}
                    {isFeatureEnabled(siteConfig, 'faq') && <li><button onClick={() => onNavigate('faq')} className="hover:text-white py-1 block w-full text-left">FAQ</button></li>}
                    {isFeatureEnabled(siteConfig, 'contact') && <li><button onClick={() => onNavigate('contact')} className="hover:text-white py-1 block w-full text-left">Nous contacter</button></li>}
                    <li><button onClick={() => onNavigate('legal')} className="hover:text-white py-1 block w-full text-left">Mentions légales</button></li>
                    <li><button onClick={() => onNavigate('terms')} className="hover:text-white py-1 block w-full text-left">CGV</button></li>
                    <li><button onClick={() => onNavigate('privacy')} className="hover:text-white py-1 block w-full text-left">Confidentialité</button></li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Desktop Footer Grid (hidden on mobile, visible from md:) */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">
          <div>
            <h3 className="font-bold mb-6 uppercase tracking-widest text-xs">Boutique</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li><button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">Toutes les laines</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">Décoration</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">Nouveautés</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">Promotions</button></li>
              <li><button onClick={() => onNavigate('packs')} className="hover:text-white transition-colors">Packs & Bundles</button></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-6 uppercase tracking-widest text-xs">Applications</h3>
            <ul className="space-y-3 text-sm text-white/70">
              {isFeatureEnabled(siteConfig, 'comparison') && <li><button onClick={() => onNavigate('comparison')} className="hover:text-white transition-colors">Comparateur</button></li>}
              {isFeatureEnabled(siteConfig, 'knittingCompanion') && <li><button onClick={() => onNavigate('knitting-companion')} className="hover:text-white transition-colors">Compagnon Tricot</button></li>}
              {isFeatureEnabled(siteConfig, 'lookbook') && <li><button onClick={() => onNavigate('lookbook')} className="hover:text-white transition-colors">Lookbook</button></li>}
              {isFeatureEnabled(siteConfig, 'customOrder') && <li><button onClick={() => onNavigate('custom-order')} className="hover:text-white transition-colors">Sur Mesure</button></li>}
              {isFeatureEnabled(siteConfig, 'patternGenerator') && <li><button onClick={() => onNavigate('pattern-generator')} className="hover:text-white transition-colors">Générateur IA</button></li>}
              <li><button onClick={() => onNavigate('configurator')} className="hover:text-white transition-colors">Configurateur</button></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-6 uppercase tracking-widest text-xs">À propos</h3>
            <ul className="space-y-3 text-sm text-white/70">
              {isFeatureEnabled(siteConfig, 'about') && <li><button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">À propos</button></li>}
              {isFeatureEnabled(siteConfig, 'team') && <li><button onClick={() => onNavigate('team')} className="hover:text-white transition-colors">Notre équipe</button></li>}
              {isFeatureEnabled(siteConfig, 'faq') && <li><button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors">FAQ</button></li>}
              {isFeatureEnabled(siteConfig, 'contact') && <li><button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">Nous contacter</button></li>}
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-6 uppercase tracking-widest text-xs">Aide & Outils</h3>
            <ul className="space-y-3 text-sm text-white/70">
              {isFeatureEnabled(siteConfig, 'calculator') && <li><button onClick={() => onNavigate('calculator')} className="hover:text-white transition-colors">Calculateur de Laine</button></li>}
              {isFeatureEnabled(siteConfig, 'volumeCalculator') && <li><button onClick={() => onNavigate('volume-calculator')} className="hover:text-white transition-colors">Calculateur de Volume</button></li>}
              <li><button onClick={() => onNavigate('care-guide')} className="hover:text-white transition-colors">Guide d'Entretien</button></li>
              <li><button onClick={() => user ? onNavigate('customer-dashboard') : onNavigate('auth')} className="hover:text-white transition-colors">Mon Compte</button></li>
            </ul>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-white/70 gap-4 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p>© {new Date().getFullYear()} Laine et Déco. Tous droits réservés.</p>
            <p className="opacity-75">Site réalisé avec amour | Propriété de Laine et Déco</p>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">À propos</button>
            <button onClick={() => onNavigate('team')} className="hover:text-white transition-colors">Équipe</button>
            <button onClick={() => onNavigate('legal')} className="hover:text-white transition-colors">Mentions légales</button>
            <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">Confidentialité</button>
            <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">CGV</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
