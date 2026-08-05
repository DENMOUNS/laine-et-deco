import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Search, User, Heart, Menu, X, ChevronRight, ArrowRight, Moon, Sun, Home, Shield, ArrowRightLeft, QrCode, Scissors } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { where } from 'firebase/firestore';

import { initialsAvatarDataUri } from '../utils/avatarFallback';
import { useStaticEntity } from '../hooks/useStaticEntity';
import { Product, NavItem } from '../../types';
import type { User as FirebaseUser } from 'firebase/auth';

const LogoDisplay = () => {
  const { data: logos } = useStaticEntity<any>('site_logo', [], {
    constraints: [where('status', '==', 'active')],
  });
  const activeLogo = logos?.[0];
  const logoSrc = activeLogo?.image || activeLogo?.lien;
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [logoSrc]);

  useEffect(() => {
    console.info('[nav-logo]', {
      message: 'state',
      host: window.location.host,
      logoCount: logos?.length || 0,
      activeLogoId: activeLogo?.id || null,
      activeLogoStatus: activeLogo?.status || null,
      hasImage: Boolean(activeLogo?.image),
      hasLien: Boolean(activeLogo?.lien),
      logoSrc: logoSrc || null,
      imgError,
    });
  }, [logos, activeLogo?.id, activeLogo?.status, activeLogo?.image, activeLogo?.lien, logoSrc, imgError]);
  
  if (logoSrc && !imgError && logoSrc !== '/logo.png') {
    return (
      <img 
        src={logoSrc} 
        alt="Laine & Déco" 
        onLoad={() => {
          console.info('[nav-logo]', {
            message: 'image:loaded',
            host: window.location.host,
            logoSrc,
            activeLogoId: activeLogo?.id || null,
          });
        }}
        onError={(event) => {
          console.error('[nav-logo]', {
            message: 'image:failed',
            host: window.location.host,
            logoSrc,
            activeLogoId: activeLogo?.id || null,
            naturalWidth: event.currentTarget.naturalWidth,
            naturalHeight: event.currentTarget.naturalHeight,
          });
          setImgError(true);
        }}
        className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105" 
      />
    );
  }
  
  return (
    <>
      <div className="flex items-center justify-center p-2 bg-gradient-to-br from-accent to-accent/90 text-white rounded-xl shadow-[0_4px_12px_rgba(230,111,105,0.3)] border border-white/20 transition-transform group-hover:scale-105">
         <Scissors className="h-6 w-6 sm:h-8 sm:w-8 text-white stroke-[2]" />
      </div>
      <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-black tracking-tight text-primary ml-3 relative whitespace-nowrap">
        Laine & <span className="text-accent underline decoration-accent/30 decoration-2 underline-offset-4">Déco</span>
      </h1>
    </>
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
  navItems?: NavItem[];
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onNavigate, 
  currentView, 
  cartCount, 
  wishlistCount,
  user,
  userRole,
  comparisonList = [],
  navItems = []
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: CATEGORIES } = useStaticEntity<any>('category', [], { enabled: isMenuOpen });


  const mainNavLinks = navItems.filter(item => item.status === 'active' && (!item.position || item.position === 'top')).sort((a, b) => a.order - b.order);

  const dynamicSidebarLinks = navItems.filter(item => item.status === 'active' && item.position === 'side' && item.view !== 'loyalty' && item.name !== 'Points VIP').sort((a, b) => a.order - b.order).map(item => ({ name: item.name, view: item.view, icon: <ChevronRight size={18} /> }));

  const sidebarLinks = dynamicSidebarLinks.length > 0 ? dynamicSidebarLinks : [
    { name: 'Compagnon Tricot', view: 'knitting-companion', icon: <ChevronRight size={18} /> },
    { name: 'Générateur IA', view: 'pattern-generator', icon: <ChevronRight size={18} /> },
    { name: 'Configurateur', view: 'configurator', icon: <ChevronRight size={18} /> },
    { name: 'Sur Mesure', view: 'custom-order', icon: <ChevronRight size={18} /> },
    { name: 'Lookbook', view: 'lookbook', icon: <ChevronRight size={18} /> },
    { name: 'Blog Inspirations', view: 'blog', icon: <ChevronRight size={18} /> },
    { name: 'Contactez-nous', view: 'contact', icon: <ChevronRight size={18} /> },
    { name: 'Calculateur de Laine', view: 'calculator', icon: <ChevronRight size={18} /> },
    { name: 'Calculateur de Volume', view: 'volume-calculator', icon: <ChevronRight size={18} /> },
  ];

  const navLinks = [
    ...mainNavLinks,
  ];
  const hasBackofficeAccess = ['super-admin', 'admin', 'editor', 'stock-manager', 'support-client'].includes(userRole);

  return (
    <>
      <nav className="sticky top-0 z-50 glass border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 relative">
          <div className="flex items-center gap-3 z-20 flex-shrink-0">
            <div className="cursor-pointer flex items-center group" onClick={() => onNavigate('home')}>
              <LogoDisplay />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4 lg:space-x-8">
            {mainNavLinks.map((link) => (
              <button
                key={link.name}
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
            <div className="flex items-center space-x-0.5 sm:space-x-1 flex-nowrap z-20">
              <button 
                aria-label="Rechercher"
                onClick={() => onNavigate('shop')} 
                className="p-2 text-primary hover:text-accent transition-colors rounded-full hover:bg-primary/5"
                title="Rechercher"
              >
                <Search size={20} />
              </button>
              <button aria-label="Favoris" onClick={() => onNavigate('wishlist')} className="flex p-2 text-primary hover:text-accent transition-colors relative rounded-full hover:bg-primary/5">
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-accent text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>
              <button aria-label="Panier" onClick={() => onNavigate('cart')} className="p-2 text-primary hover:text-accent transition-colors relative rounded-full hover:bg-primary/5">
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <button aria-label="Comparateur" onClick={() => onNavigate('comparison')} className="hidden sm:flex lg:flex p-2 text-primary hover:text-accent transition-colors relative rounded-full hover:bg-primary/5">
                <ArrowRightLeft size={20} />
                {comparisonList?.length > 0 && (
                  <span className="absolute top-1 right-1 bg-accent text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {comparisonList.length}
                  </span>
                )}
              </button>
              {hasBackofficeAccess && (
                <button 
                  aria-label="Tableau de bord Admin"
                  onClick={() => onNavigate('admin-dashboard')} 
                  className={`hidden md:flex p-2 transition-colors rounded-full hover:bg-primary/5 ${currentView === 'admin-dashboard' ? 'text-accent' : 'text-primary'}`}
                  title="Tableau de bord Admin"
                >
                  <Shield size={20} />
                </button>
              )}
              <button 
                aria-label="Compte utilisateur"
                onClick={() => user ? onNavigate('customer-dashboard') : onNavigate('auth')} 
                className={`flex p-2 transition-colors rounded-full hover:bg-primary/5 ${currentView === 'customer-dashboard' ? 'text-accent' : 'text-primary'} items-center gap-2`}
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
                  <User size={20} />
                )}
                {user && <span className="hidden xl:block text-xs font-bold">{user.displayName || 'Compte'}</span>}
              </button>
              <button 
                aria-label="Menu principal"
                onClick={() => setIsMenuOpen(true)}
                className="p-2 text-primary hover:text-accent transition-colors rounded-full hover:bg-primary/5 ml-1"
              >
                <Menu size={20} />
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
              className="fixed inset-0 bg-primary/20 z-[100] backdrop-blur-md"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm shadow-2xl z-[110] flex flex-col overflow-y-auto bg-primary text-white"
            >
              <div className="p-6 border-b border-white/10 bg-primary/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-xl font-serif font-bold text-white">Menu & Services</h1>
                  <button aria-label="Fermer le menu" onClick={() => setIsMenuOpen(false)} className="p-2 bg-white/10 rounded-full shadow-sm text-white hover:text-accent transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/10 rounded-2xl shadow-sm border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center overflow-hidden">
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
              
              <div className="flex flex-col p-6 space-y-2 flex-grow">
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
                      key={link.name}
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
                      key={link.name}
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
                      key={cat.id}
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

                <div className="mt-4">
                    <button
                      onClick={() => {
                        onNavigate('packs');
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left p-4 rounded-2xl bg-accent text-white font-bold hover:bg-accent/90 transition-colors flex justify-between items-center shadow-lg"
                    >
                      <span>Packs & Bundles</span>
                      <ShoppingBag size={18} />
                    </button>
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
  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-2xl inline-block group cursor-pointer" onClick={() => onNavigate('home')}>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center p-1.5 bg-gradient-to-br from-accent to-accent/90 text-white rounded-lg shadow-lg border border-white/20 transition-transform group-hover:scale-105">
                   <Scissors className="h-6 w-6 text-white stroke-[2]" />
                </div>
                <h2 className="text-xl font-serif font-black tracking-tight whitespace-nowrap">
                  Laine & <span className="text-accent underline decoration-accent/30 decoration-2 underline-offset-4">Déco</span>
                </h2>
              </div>
            </div>
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
              <h3 className="font-bold mb-6 uppercase tracking-widest text-xs">Aide & Outils</h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li><button onClick={() => onNavigate('calculator')} className="hover:text-white transition-colors">Calculateur de Laine</button></li>
                <li><button onClick={() => onNavigate('care-guide')} className="hover:text-white transition-colors">Guide d'Entretien</button></li>
                <li><button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors">FAQ</button></li>
                <li><button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">Contact</button></li>
              </ul>
            </div>
          <div>
            <h3 className="font-bold mb-6 uppercase tracking-widest text-xs">Outils & Services</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li><button onClick={() => onNavigate('wishlist')} className="hover:text-white transition-colors">Favoris</button></li>
              <li><button onClick={() => onNavigate('comparison')} className="hover:text-white transition-colors">Comparateur</button></li>
              <li><button onClick={() => onNavigate('knitting-companion')} className="hover:text-white transition-colors">Compagnon Tricot</button></li>
              <li><button onClick={() => onNavigate('pattern-generator')} className="hover:text-white transition-colors">Générateur IA</button></li>
              <li><button onClick={() => onNavigate('configurator')} className="hover:text-white transition-colors">Configurateur</button></li>
              <li><button onClick={() => onNavigate('custom-order')} className="hover:text-white transition-colors">Sur Mesure</button></li>
              <li><button onClick={() => onNavigate('lookbook')} className="hover:text-white transition-colors">Lookbook</button></li>
              <li><button onClick={() => onNavigate('packs')} className="hover:text-white transition-colors">Packs & Bundles</button></li>
              <li><button onClick={() => user ? onNavigate('customer-dashboard') : onNavigate('auth')} className="hover:text-white transition-colors">Mon Compte</button></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-white/70">
          <div className="flex flex-col items-center md:items-start gap-2">
            <p>© {new Date().getFullYear()} Laine et Déco. Tous droits réservés.</p>
            <p>Site réalisé par <span className="font-bold text-white/70">Mouns avec amour</span> | Propriété de <span className="font-bold text-white/70">Laine et Déco</span></p>
            <p className="font-bold opacity-50 mt-1">Version 1.0.0</p>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
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
