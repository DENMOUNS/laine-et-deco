import React from 'react';
import { LogoDisplay } from './Layout';
import { Sun, Moon, User, Phone, Globe } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useLanguageStore } from '../../stores/languageStore';
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
  const { language, toggleLanguage } = useLanguageStore();
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
          isMobileLandscape ? 'max-w-[370px] px-2.5 py-1' : 'max-w-[440px] px-3 py-1.5'
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

        {/* Actions à droite : Langue + Appel direct + Mode sombre */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => {
              triggerHaptic('selection');
              toggleLanguage();
            }}
            className="px-1.5 py-1 text-[10px] font-extrabold text-primary dark:text-white hover:text-accent transition-all rounded-full bg-primary/5 hover:bg-primary/10 dark:bg-white/10 flex items-center gap-0.5 active:scale-95 cursor-pointer uppercase tracking-wider border border-black/5 dark:border-white/10"
            aria-label={language === 'fr' ? "Switch to English" : "Passer en Français"}
            title={language === 'fr' ? "Changer de langue (Passer en Anglais)" : "Switch to French (Passer en Français)"}
          >
            <span>{language === 'fr' ? 'EN' : 'FR'}</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('selection');
              window.dispatchEvent(new CustomEvent('app:start-call'));
            }}
            className="p-1.5 text-white bg-accent hover:bg-accent-dark transition-all rounded-full flex items-center justify-center active:scale-95 shadow-xs cursor-pointer"
            aria-label={language === 'en' ? "Free call with an advisor" : "Appeler un conseiller gratuitement"}
            title={language === 'en' ? "Free voice call with an advisor" : "Appel direct avec un conseiller (Gratuit)"}
          >
            <Phone size={13} className="stroke-[2.5] fill-current animate-pulse" />
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              toggleTheme();
            }}
            className="p-1.5 text-primary dark:text-white hover:text-accent transition-all rounded-full bg-primary/5 hover:bg-primary/10 dark:bg-white/10 dark:hover:bg-white/15 flex items-center justify-center active:scale-95 cursor-pointer"
            aria-label={theme === 'dark' ? (language === 'en' ? "Switch to light mode" : "Activer le mode clair") : (language === 'en' ? "Switch to dark mode" : "Activer le mode sombre")}
            title={theme === 'dark' ? (language === 'en' ? "Switch to light mode" : "Activer le mode clair") : (language === 'en' ? "Switch to dark mode" : "Activer le mode sombre")}
          >
            {theme === 'dark' ? (
              <Sun size={14} className="text-amber-400 stroke-[2.5]" />
            ) : (
              <Moon size={14} className="text-[#3E4A3D] dark:text-[#E8EBE7] stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};


