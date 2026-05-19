import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useConfigStore } from '../../stores/configStore';

export const AdBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const siteConfig = useConfigStore((s) => s.siteConfig);

  if (!isVisible || !siteConfig.showAdBanner) return null;

  return (
    <div className="relative z-40 bg-accent text-white text-center py-2 px-4 text-sm font-medium">
      <p>{siteConfig.adBannerText}</p>
      <button
        type="button"
        onClick={() => setIsVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Fermer la bannière"
      >
        <X size={16} />
      </button>
    </div>
  );
};
