import React, { useState } from 'react';
import { 
  Home, 
  ShoppingBag, 
  ShoppingCart, 
  User, 
  Sparkles, 
  Scissors, 
  Calculator, 
  Ruler, 
  BookOpen, 
  Layers, 
  Palette, 
  FileText, 
  Heart, 
  X, 
  ChevronRight,
  Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { User as FirebaseUser } from 'firebase/auth';
import { triggerHaptic } from '../utils/haptics';
import { initialsAvatarDataUri } from '../utils/avatarFallback';

interface MobileGlassDockProps {
  currentView: string;
  onNavigate: (view: string) => void;
  cartCount: number;
  wishlistCount: number;
  user: FirebaseUser | null;
  onOpenMenu?: () => void;
}

export const MobileGlassDock: React.FC<MobileGlassDockProps> = ({
  currentView,
  onNavigate,
  cartCount,
  wishlistCount,
  user,
}) => {
  const [isMobileLandscape, setIsMobileLandscape] = React.useState(false);
  const [isToolsSheetOpen, setIsToolsSheetOpen] = useState(false);

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

  // Tool views list
  const toolViews = [
    'knitting-companion',
    'calculator',
    'volume-calculator',
    'pattern-generator',
    'configurator',
    'custom-order',
    'lookbook',
    'blog',
    'wishlist'
  ];

  const isToolActive = toolViews.includes(currentView);

  const toolsList = [
    {
      id: 'companion',
      label: 'Compagnon Tricot',
      description: 'Compteur de rangs et suivi de projet',
      icon: Scissors,
      view: 'knitting-companion',
      badge: 'Populaire',
    },
    {
      id: 'calculator',
      label: 'Calculateur de Pelotes',
      description: 'Estimez la quantité exacte de laine',
      icon: Calculator,
      view: 'calculator',
    },
    {
      id: 'volume-calc',
      label: 'Calculateur de Volume',
      description: 'Dimensions et métrage',
      icon: Ruler,
      view: 'volume-calculator',
    },
    {
      id: 'generator',
      label: 'Générateur IA de Patrons',
      description: 'Créez des modèles uniques par IA',
      icon: Wand2,
      view: 'pattern-generator',
      badge: 'IA',
    },
    {
      id: 'configurator',
      label: 'Configurateur Personnalisé',
      description: 'Créez votre pièce sur-mesure',
      icon: Palette,
      view: 'configurator',
    },
    {
      id: 'lookbook',
      label: 'Lookbook & Inspirations',
      description: 'Galerie visuelle de créations',
      icon: BookOpen,
      view: 'lookbook',
    },
    {
      id: 'wishlist',
      label: 'Mes Favoris',
      description: 'Articles sauvegardés',
      icon: Heart,
      view: 'wishlist',
      count: wishlistCount,
    },
    {
      id: 'blog',
      label: 'Blog & Tutoriels',
      description: 'Guides pratiques et astuces tricot',
      icon: FileText,
      view: 'blog',
    },
  ];

  const handleToolClick = (view: string) => {
    setIsToolsSheetOpen(false);
    onNavigate(view);
  };

  const navItems = [
    { 
      id: 'home', 
      label: 'Accueil', 
      icon: Home, 
      view: 'home',
      active: currentView === 'home'
    },
    { 
      id: 'shop', 
      label: 'Boutique', 
      icon: ShoppingBag, 
      view: 'shop',
      active: currentView === 'shop' || currentView === 'product-detail'
    },
    { 
      id: 'tools', 
      label: 'Outils', 
      icon: Wand2, 
      isToolsButton: true,
      active: isToolActive
    },
    { 
      id: 'cart', 
      label: 'Panier', 
      icon: ShoppingCart, 
      view: 'cart', 
      badge: cartCount,
      active: currentView === 'cart' || currentView === 'checkout'
    },
    {
      id: 'account',
      label: user ? 'Profil' : 'Compte',
      icon: User,
      view: user ? 'customer-dashboard' : 'auth',
      active: currentView === 'customer-dashboard' || currentView === 'auth' || currentView === 'login' || currentView === 'register'
    },
  ];

  return (
    <>
      {/* Barre de navigation tactile - STRICTEMENT RÉSERVÉE À LA VUE MOBILE (< 768px) */}
      <aside 
        aria-label="Navigation tactile mobile" 
        className="fixed inset-x-0 z-[90] flex justify-center items-center pointer-events-none px-3 md:hidden transition-all duration-300"
        style={{
          bottom: isMobileLandscape 
            ? 'max(6px, env(safe-area-inset-bottom, 6px))' 
            : 'max(12px, calc(8px + env(safe-area-inset-bottom, 0px)))',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      >
        <nav
          className={`pointer-events-auto relative w-full max-w-[400px] transition-all duration-300 overflow-hidden ${
            isMobileLandscape 
              ? 'rounded-full p-1 shadow-2xl bg-white/95 dark:bg-[#181C18]/95 backdrop-blur-2xl border-2 border-[#3E4A3D]/25 dark:border-white/20' 
              : 'rounded-[2.2rem] p-1.5 shadow-[0_12px_36px_rgba(45,69,51,0.25),0_4px_16px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.6)] bg-white/95 dark:bg-[#181C18]/95 backdrop-blur-2xl border-2 border-[#3E4A3D]/20 dark:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between relative px-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.active;

              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.88 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    triggerHaptic('light');
                    if (item.isToolsButton) {
                      setIsToolsSheetOpen(true);
                    } else if (item.view) {
                      onNavigate(item.view);
                    }
                  }}
                  className={`relative flex flex-col items-center justify-center rounded-2xl flex-1 transition-all py-1.5 px-1 group ${
                    active
                      ? 'text-[#243325] dark:text-accent font-bold'
                      : 'text-[#2D3E31] dark:text-[#E2ECE2] hover:text-[#182419]'
                  }`}
                  aria-label={item.label}
                >
                  {/* Active Capsule Glass Effect */}
                  {active && (
                    <motion.div
                      layoutId="mobile-dock-active-indicator"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className={`absolute inset-0 bg-[#3E4A3D]/12 dark:bg-accent/25 border border-[#3E4A3D]/15 dark:border-accent/40 shadow-[inset_0_1px_3px_rgba(255,255,255,0.4)] ${
                        isMobileLandscape ? 'rounded-xl' : 'rounded-2xl'
                      }`}
                    />
                  )}

                  {/* Icon Container */}
                  <div className="relative z-10 flex items-center justify-center">
                    {item.id === 'account' && user ? (
                      <div className="relative flex items-center justify-center">
                        <img
                          src={user.photoURL || initialsAvatarDataUri(user.displayName, 48)}
                          alt={user.displayName || 'Profil'}
                          className={`rounded-full object-cover border border-primary/20 ${
                            isMobileLandscape ? 'w-[19px] h-[19px]' : 'w-[23px] h-[23px]'
                          } ${active ? 'ring-2 ring-accent' : ''}`}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = initialsAvatarDataUri(user.displayName, 48);
                          }}
                        />
                        {/* Bouton/Pastille verte qui clignote (Status connecté actif) */}
                        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white dark:border-[#181C18] shadow-sm" />
                        </span>
                      </div>
                    ) : (
                      <>
                        <Icon
                          size={isMobileLandscape ? 18 : 21}
                          className={`transition-all duration-300 ${
                            active ? 'stroke-[2.6] scale-110 text-[#2D3E31] dark:text-accent' : 'stroke-[2] text-[#2D3E31] dark:text-[#E2ECE2] group-hover:scale-105'
                          }`}
                        />
                        {typeof item.badge === 'number' && item.badge > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-1 bg-accent text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-[#181C18]"
                          >
                            {item.badge > 99 ? '99+' : item.badge}
                          </motion.span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Label */}
                  {!isMobileLandscape && (
                    <span className={`relative z-10 text-[10.5px] tracking-tight mt-0.5 leading-none truncate max-w-[62px] ${
                      active ? 'font-bold text-[#1F2C21] dark:text-accent' : 'font-semibold text-[#2D3E31] dark:text-[#E2ECE2]'
                    }`}>
                      {item.label}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Bottom Sheet des Outils & Services Créatifs */}
      <AnimatePresence>
        {isToolsSheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsToolsSheetOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] md:hidden"
            />

            {/* Bottom Sheet Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed inset-x-0 bottom-0 z-[120] max-h-[85vh] bg-[#222E26] text-white rounded-t-[2.5rem] shadow-2xl border-t border-white/20 flex flex-col overflow-hidden md:hidden"
            >
              {/* Drawer Handle */}
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-3 mb-2" />

              {/* Header */}
              <div className="px-6 py-3 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-accent/20 text-accent">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-bold text-white">Studio & Outils</h3>
                    <p className="text-xs text-white/60">Toutes nos fonctionnalités créatives</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsToolsSheetOpen(false)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
                  aria-label="Fermer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tools List */}
              <div className="p-4 overflow-y-auto space-y-2.5 max-h-[calc(85vh-100px)] pb-10">
                {toolsList.map((tool) => {
                  const ToolIcon = tool.icon;
                  const active = currentView === tool.view;

                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolClick(tool.view)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all text-left group ${
                        active
                          ? 'bg-accent/25 border border-accent/40 text-white'
                          : 'bg-white/5 hover:bg-white/10 border border-white/10 text-white/90'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`p-2.5 rounded-xl ${
                          active ? 'bg-accent text-primary font-bold' : 'bg-white/10 text-accent group-hover:bg-accent group-hover:text-primary transition-colors'
                        }`}>
                          <ToolIcon size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{tool.label}</span>
                            {tool.badge && (
                              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-accent/30 text-amber-300 border border-accent/40">
                                {tool.badge}
                              </span>
                            )}
                            {typeof tool.count === 'number' && tool.count > 0 && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent text-white">
                                {tool.count}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/60 mt-0.5">{tool.description}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-white/40 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
