import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useConfigStore } from '../../stores/configStore';
import { useTranslation } from '../../i18n';
import { useEntity } from '../hooks/useEntity';
import { AnnouncementBannerConfig } from '../../types';

export const AdBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const siteConfig = useConfigStore((s) => s.siteConfig);
  const { l, isEn } = useTranslation();
  const { data: banners } = useEntity<AnnouncementBannerConfig>('announcement_banner');

  if (!isVisible) return null;

  const activeBanner = banners && banners.length > 0 ? banners.find(b => b.status === 'active') : null;

  const message = activeBanner
    ? (isEn && activeBanner.message_en ? activeBanner.message_en : activeBanner.message)
    : (siteConfig.showAdBanner ? l(siteConfig, 'adBannerText', siteConfig.adBannerText) : '');

  if (!message) return null;

  return (
    <div className="relative z-40 bg-accent text-white text-center py-2.5 px-4 text-sm font-medium lg:max-w-7xl lg:mx-auto lg:rounded-2xl lg:my-2 lg:shadow-md">
      <p className="pr-12 max-w-4xl mx-auto">{message}</p>
      <button
        type="button"
        onClick={() => setIsVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
        aria-label="Fermer la bannière"
      >
        <X size={16} />
      </button>
    </div>
  );
};
