import React from 'react';
import { LogoDisplay } from './Layout';

interface MobileGlassHeaderProps {
  onNavigate: (view: string) => void;
}

export const MobileGlassHeader: React.FC<MobileGlassHeaderProps> = ({
  onNavigate,
}) => {
  return (
    <header className="sticky top-0 inset-x-0 z-40 md:hidden px-3 pt-2.5 pb-2 transition-all duration-300 pointer-events-none">
      <div
        className="pointer-events-auto max-w-[420px] mx-auto relative rounded-full px-4 py-2 flex items-center justify-center
          glass-ios overflow-hidden"
      >
        {/* Brand Logo & Name */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center text-center group cursor-pointer"
          aria-label="Aller à l'accueil"
        >
          <LogoDisplay compact={true} />
        </button>
      </div>
    </header>
  );
};
