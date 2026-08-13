import React from 'react';
import { Home, ShoppingBag, Heart, ShoppingCart, User, Layers, Menu } from 'lucide-react';
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
  const navItems = [
    { id: 'home', label: 'Accueil', icon: Home, view: 'home' },
    { id: 'shop', label: 'Boutique', icon: ShoppingBag, view: 'shop' },
    { id: 'packs', label: 'Packs', icon: Layers, view: 'packs' },
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
    if (item.view === 'packs' && (currentView === 'packs' || currentView === 'pack-detail')) return true;
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
    <aside aria-label="Navigation mobile principale" className="fixed bottom-3 sm:bottom-5 inset-x-0 z-50 flex justify-center items-center pointer-events-none md:hidden px-3">
      <nav
        className="pointer-events-auto w-full max-w-[410px] relative rounded-[2.5rem] p-1.5 transition-all duration-300
          glass-ios-dock overflow-hidden"
      >
        <div className="flex items-center justify-around relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isCurrentActive(item);

            return (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.86 }}
                onClick={() => onNavigate(item.view)}
                className={`relative flex flex-col items-center justify-center py-2 px-2 rounded-2xl flex-1 transition-colors group ${
                  active
                    ? 'text-accent dark:text-accent font-bold'
                    : 'text-primary/75 dark:text-white/75 hover:text-primary'
                }`}
                aria-label={item.label}
              >
                {/* Active Capsule Glass Effect */}
                {active && (
                  <motion.div
                    layoutId="mobile-dock-active-indicator"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute inset-0 bg-accent/10 dark:bg-accent/20 rounded-2xl"
                  />
                )}

                {/* Icon Container */}
                <div className="relative z-10 flex items-center justify-center">
                  <Icon
                    size={21}
                    className={`transition-all duration-300 ${
                      active ? 'stroke-[2.6] scale-110' : 'stroke-[1.8] group-hover:scale-105'
                    }`}
                  />
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1.5 -right-2 min-w-[17px] h-[17px] px-1 bg-accent text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md border border-white/80 dark:border-white/30"
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </motion.span>
                  )}
                </div>

                {/* Label */}
                <span className="relative z-10 text-[10px] tracking-tight mt-1 leading-none font-medium truncate max-w-[56px]">
                  {item.label}
                </span>
              </motion.button>
            );
          })}

          {/* Menu Drawer trigger button if available */}
          {onOpenMenu && (
            <motion.button
              whileTap={{ scale: 0.86 }}
              onClick={onOpenMenu}
              className="relative flex flex-col items-center justify-center py-2 px-2 rounded-2xl flex-1 text-primary/75 dark:text-white/75 hover:text-primary transition-colors"
              aria-label="Menu complet"
            >
              <div className="relative z-10 flex items-center justify-center">
                <Menu size={21} className="stroke-[1.8]" />
              </div>
              <span className="relative z-10 text-[10px] tracking-tight mt-1 leading-none font-medium truncate max-w-[56px]">
                Menu
              </span>
            </motion.button>
          )}
        </div>
      </nav>
    </aside>
  );
};
