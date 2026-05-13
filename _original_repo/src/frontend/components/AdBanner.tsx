import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

import { useEntity } from '../hooks/useEntity';
import { SITE_CONFIG as INITIAL_SITE_CONFIG } from '../../constants';

export const AdBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const { data: siteConfigs } = useEntity<any>('site_config', [INITIAL_SITE_CONFIG]);
  const siteConfig = siteConfigs[0] || INITIAL_SITE_CONFIG;

  if (!isVisible || !siteConfig.showAdBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-accent text-white py-2 px-4 relative flex items-center justify-center text-xs sm:text-sm font-medium tracking-wide z-50"
      >
        <p className="text-center pr-8">
          {siteConfig.adBannerText || "Offre de lancement : Livraison gratuite avec le code BIENVENUE"}
        </p>
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute right-2 sm:right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Fermer la bannière"
        >
          <X size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
