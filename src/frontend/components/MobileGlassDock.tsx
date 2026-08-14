import React from 'react';
import { Home, ShoppingBag, Heart, ShoppingCart, User, Layers, Scissors, BookOpen, Calculator, Menu } from 'lucide-react';
import { motion } from 'motion/react';
import type { User as FirebaseUser } from 'firebase/auth';

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
  onOpenMenu,
}) => {
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

  const navItems = [
    { id: 'home', label: 'Accueil', icon: Home, view: 'home' },
    { id: 'shop', label: 'Boutique', icon: ShoppingBag, view: 'shop' },
    { id: 'companion', label: 'Compagnon', icon: Scissors, view: 'knitting-companion' },
    { id: 'lookbook', label: 'Lookbook', icon: BookOpen, view: 'lookbook' },
    { id: 'calculator', label: 'Calculs', icon: Calculator, view: 'calculator' },
    { id: 'wishlist', label: 'Favoris', icon: Heart, view: 'wishlist', badge: wishlistCount },
    { id: 'cart', label: 'Panier', icon: ShoppingCart, view: 'cart', badge: cartCount },
    {
      id: 'account',
      label: user ? 'Profil' : 'Compte',
      icon: User,
      view: user ? 'customer-dashboard' : 'auth',
    },
  ];

  const isCurrentActive = (item: typeof navItems[0]) => {
    if (item.view === 'home' && currentView === 'home') return true;
    if (item.view === 'shop' && currentView === 'shop') return true;
    if (item.view === 'knitting-companion' && currentView === 'knitting-companion') return true;
    if (item.view === 'lookbook' && currentView === 'lookbook') return true;
    if (item.view === 'calculator' && (currentView === 'calculator' || currentView === 'volume-calculator')) return true;
    if (item.view === 'wishlist' && currentView === 'wishlist') return true;
    if (item.view === 'cart' && currentView === 'cart') return true;
    if (
      item.id === 'account' &&
      (currentView === 'customer-dashboard' ||
        currentView === 'auth' ||
        currentView === 'login' ||
        currentView === 'register')
    ) {
      return true;
    }
    return false;
  };

  return (
    <aside 
      aria-label="Navigation tactile mobile et tablette" 
      className={`fixed inset-x-0 z-50 flex justify-center items-center pointer-events-none px-4 lg:hidden transition-all duration-300 ${
        isMobileLandscape ? 'bottom-1.5' : 'bottom-4 sm:bottom-6'
      }`}
    >
      <nav
        className={`pointer-events-auto relative transition-all duration-300 clay-tactile glass-ios-dock overflow-hidden ${
          isMobileLandscape 
            ? 'w-full max-w-[340px] rounded-full p-1 shadow-xl' 
            : 'w-full max-w-[620px] rounded-[2.5rem] p-2 shadow-2xl border border-white/40 dark:border-white/10'
        }`}
      >
        <div className="flex items-center justify-around relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isCurrentActive(item);

            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.86 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => onNavigate(item.view)}
                className={`relative flex flex-col items-center justify-center rounded-2xl flex-1 transition-all group ${
                  isMobileLandscape ? 'py-1 px-1 rounded-xl' : 'py-2 px-2.5'
                } ${
                  active
                    ? 'text-accent dark:text-accent font-bold'
                    : 'text-primary/75 dark:text-white/75 hover:text-primary'
                }`}
                aria-label={item.label}
              >
                {/* Active Capsule Glass Effect */}
                {active && (
                  <motion.div
                    layoutId="tablet-dock-active-indicator"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className={`absolute inset-0 bg-accent/15 dark:bg-accent/30 shadow-[inset_0_1px_3px_rgba(255,255,255,0.4)] ${
                      isMobileLandscape ? 'rounded-xl' : 'rounded-2xl'
                    }`}
                  />
                )}

                {/* Icon Container */}
                <div className="relative z-10 flex items-center justify-center">
                  <Icon
                    size={isMobileLandscape ? 17 : 22}
                    className={`transition-all duration-300 ${
                      active ? 'stroke-[2.6] scale-110 text-accent' : 'stroke-[1.8] group-hover:scale-105'
                    }`}
                  />
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 bg-accent text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md border border-white/90 dark:border-white/30"
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </motion.span>
                  )}
                </div>

                {/* Label */}
                {!isMobileLandscape && (
                  <span className="relative z-10 text-[10px] sm:text-[11px] tracking-tight mt-1 leading-none font-medium truncate max-w-[64px]">
                    {item.label}
                  </span>
                )}
              </motion.button>
            );
          })}

          {/* Menu Drawer trigger button if available */}
          {onOpenMenu && (
            <motion.button
              whileTap={{ scale: 0.86 }}
              whileHover={{ scale: 1.05 }}
              onClick={onOpenMenu}
              className={`relative flex flex-col items-center justify-center rounded-2xl flex-1 text-primary/75 dark:text-white/75 hover:text-primary transition-all ${
                isMobileLandscape ? 'py-1 px-1 rounded-xl' : 'py-2 px-2.5'
              }`}
              aria-label="Menu complet"
            >
              <div className="relative z-10 flex items-center justify-center">
                <Menu size={isMobileLandscape ? 17 : 22} className="stroke-[1.8]" />
              </div>
              {!isMobileLandscape && (
                <span className="relative z-10 text-[10px] sm:text-[11px] tracking-tight mt-1 leading-none font-medium truncate max-w-[64px]">
                  Menu
                </span>
              )}
            </motion.button>
          )}
        </div>
      </nav>
    </aside>
  );
};

