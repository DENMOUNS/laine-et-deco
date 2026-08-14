import React from 'react';
import { LogoDisplay } from './Layout';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';

interface MobileGlassHeaderProps {
  onNavigate: (view: string) => void;
}

export const MobileGlassHeader: React.FC<MobileGlassHeaderProps> = ({
  onNavigate,
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
        className={`pointer-events-auto mx-auto relative rounded-full flex items-center justify-center glass-ios overflow-hidden transition-all duration-300 ${
          isMobileLandscape ? 'max-w-[340px] px-3 py-1' : 'max-w-[420px] px-4 py-2'
        }`}
      >
        {/* Brand Logo & Name */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center text-center group cursor-pointer"
          aria-label="Aller à l'accueil"
        >
          <LogoDisplay compact={true} />
        </button>

        {/* Bouton de mode sombre à droite */}
        <button
          onClick={toggleTheme}
          className="absolute right-3 p-2 text-primary dark:text-white hover:text-accent transition-all rounded-full bg-primary/5 hover:bg-primary/10 dark:bg-white/10 dark:hover:bg-white/15 flex items-center justify-center active:scale-95"
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

