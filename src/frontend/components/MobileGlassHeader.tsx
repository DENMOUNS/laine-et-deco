import React from 'react';
import { LogoDisplay } from './Layout';
import { Sun, Moon, Phone, Globe } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';
import { useLanguageStore } from '../../stores/languageStore';
import type { User as FirebaseUser } from 'firebase/auth';
import { triggerHaptic } from '../utils/haptics';

interface MobileGlassHeaderProps {
  onNavigate: (view: string) => void;
  user?: FirebaseUser | null;
}

export const MobileGlassHeader: React.FC<MobileGlassHeaderProps> = ({
  onNavigate,
  user,
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
    <header
      className={`sticky top-0 inset-x-0 z-40 md:hidden px-2.5 sm:px-3 transition-all duration-300 pointer-events-none ${
        isMobileLandscape ? 'pt-1 pb-1' : 'pt-2 pb-2'
      }`}
      style={{
        paddingTop: 'max(0.5rem, env(safe-area-inset-top, 0.5rem))',
      }}
    >
      <div
        className={`pointer-events-auto mx-auto relative rounded-full flex items-center justify-between overflow-hidden transition-all duration-300 bg-white/95 dark:bg-[#18201a] backdrop-blur-xl border border-stone-300/80 dark:border-stone-700 shadow-md ${
          isMobileLandscape ? 'max-w-[390px] px-3 py-1' : 'max-w-[460px] px-3.5 py-1.5'
        }`}
      >
        {/* Brand Logo & Name */}
        <button
          onClick={() => {
            triggerHaptic('light');
            onNavigate('home');
          }}
          className="flex items-center text-left group cursor-pointer shrink-0"
          aria-label="Aller à l'accueil"
        >
          <LogoDisplay compact={true} />
        </button>

        {/* Actions à droite : Langue + Appel direct + Mode sombre (High Contrast & Touch Friendly) */}
        <div className="flex items-center gap-1.5 shrink-0 pl-2">
          {/* Bouton Traduction / Langue (Ultra contrasté sur Samsung / AMOLED) */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('selection');
              toggleLanguage();
            }}
            className="px-2.5 py-1.5 min-h-[32px] text-xs font-black text-stone-900 dark:text-white bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 transition-all rounded-full flex items-center gap-1.5 active:scale-95 cursor-pointer uppercase tracking-wider border border-stone-300 dark:border-stone-600 shadow-xs"
            aria-label={language === 'fr' ? "Switch to English" : "Passer en Français"}
            title={language === 'fr' ? "Changer de langue (Passer en Anglais)" : "Switch to French (Passer en Français)"}
          >
            <Globe size={14} className="text-accent shrink-0 stroke-[2.5]" />
            <span className="font-extrabold text-[11px] leading-none">{language === 'fr' ? 'EN' : 'FR'}</span>
          </button>

          {/* Bouton Appel Direct (si connecté) */}
          {!!user && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                window.dispatchEvent(new CustomEvent('app:start-call'));
              }}
              className="w-8 h-8 min-w-[32px] text-white bg-accent hover:bg-accent-dark transition-all rounded-full flex items-center justify-center active:scale-95 shadow-xs cursor-pointer"
              aria-label={language === 'en' ? "Free call with an advisor" : "Appeler un conseiller gratuitement"}
              title={language === 'en' ? "Free voice call with an advisor" : "Appel direct avec un conseiller (Gratuit)"}
            >
              <Phone size={13} className="stroke-[2.5] fill-current animate-pulse" />
            </button>
          )}

          {/* Bouton Thème Sombre / Clair (Ultra visible sur écrans OLED / Samsung) */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              toggleTheme();
            }}
            className="w-8 h-8 min-w-[32px] text-stone-900 dark:text-amber-300 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 transition-all rounded-full flex items-center justify-center active:scale-95 cursor-pointer border border-stone-300 dark:border-stone-600 shadow-xs"
            aria-label={theme === 'dark' ? (language === 'en' ? "Switch to light mode" : "Activer le mode clair") : (language === 'en' ? "Switch to dark mode" : "Activer le mode sombre")}
            title={theme === 'dark' ? (language === 'en' ? "Switch to light mode" : "Activer le mode clair") : (language === 'en' ? "Switch to dark mode" : "Activer le mode sombre")}
          >
            {theme === 'dark' ? (
              <Sun size={17} className="text-amber-400 fill-amber-400 stroke-[2.5]" />
            ) : (
              <Moon size={16} className="text-stone-800 fill-stone-800/40 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};


