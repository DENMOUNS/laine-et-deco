import React from 'react';
import { LogoDisplay } from './Layout';
import { Sun, Moon, User } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import type { User as FirebaseUser } from 'firebase/auth';
import { initialsAvatarDataUri } from '../utils/avatarFallback';
import { triggerHaptic } from '../utils/haptics';

interface MobileGlassHeaderProps {
  onNavigate: (view: string) => void;
  user?: FirebaseUser | null;
}

export const MobileGlassHeader: React.FC<MobileGlassHeaderProps> = ({
  onNavigate,
  user = null,
}) => {
  const { theme, toggleTheme } = useThemeStore();
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

  return (
    <header className={`sticky top-0 inset-x-0 z-40 md:hidden px-3 transition-all duration-300 pointer-events-none ${
      isMobileLandscape ? 'pt-1.5 pb-1' : 'pt-2.5 pb-2'
    }`}>
      <div
        className={`pointer-events-auto mx-auto relative rounded-full flex items-center justify-between glass-ios overflow-hidden transition-all duration-300 ${
          isMobileLandscape ? 'max-w-[340px] px-3 py-1' : 'max-w-[420px] px-3.5 py-1.5'
        }`}
      >
        {/* Profil utilisateur mobile à gauche (si connecté ou bouton compte) */}
        <button
          onClick={() => {
            triggerHaptic('selection');
            user ? onNavigate('customer-dashboard') : onNavigate('auth');
          }}
          className="relative p-1 text-primary dark:text-white hover:text-accent transition-all rounded-full bg-primary/5 hover:bg-primary/10 dark:bg-white/10 flex items-center justify-center active:scale-95 shrink-0"
          aria-label={user ? 'Mon profil client' : 'Se connecter'}
          title={user ? (user.displayName || 'Mon profil') : 'Se connecter'}
        >
          {user ? (
            <div className="relative flex items-center justify-center">
              <img
                src={user.photoURL || initialsAvatarDataUri(user.displayName, 48)}
                alt={user.displayName || 'Profil'}
                className="w-7 h-7 rounded-full object-cover border border-primary/20"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = initialsAvatarDataUri(user.displayName, 48);
                }}
              />
              {/* Point vert clignotant / pulsant */}
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white dark:border-[#181C18] shadow-sm" />
              </span>
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full flex items-center justify-center">
              <User size={16} className="text-[#3E4A3D] dark:text-[#E8EBE7]" />
            </div>
          )}
        </button>

        {/* Brand Logo & Name au centre */}
        <button
          onClick={() => {
            triggerHaptic('light');
            onNavigate('home');
          }}
          className="flex items-center text-center group cursor-pointer"
          aria-label="Aller à l'accueil"
        >
          <LogoDisplay compact={true} />
        </button>

        {/* Bouton de mode sombre à droite */}
        <button
          onClick={() => {
            triggerHaptic('light');
            toggleTheme();
          }}
          className="p-2 text-primary dark:text-white hover:text-accent transition-all rounded-full bg-primary/5 hover:bg-primary/10 dark:bg-white/10 dark:hover:bg-white/15 flex items-center justify-center active:scale-95 shrink-0"
          aria-label={theme === 'dark' ? "Activer le mode clair" : "Activer le mode sombre"}
          title={theme === 'dark' ? "Passer au thème clair" : "Passer au thème sombre"}
        >
          {theme === 'dark' ? (
            <Sun size={15} className="text-amber-400 stroke-[2.5]" />
          ) : (
            <Moon size={15} className="text-[#3E4A3D] dark:text-[#E8EBE7] stroke-[2.5]" />
          )}
        </button>
      </div>
    </header>
  );
};

