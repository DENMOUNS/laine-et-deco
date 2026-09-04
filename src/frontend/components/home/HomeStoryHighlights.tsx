import React from 'react';
import { motion } from 'motion/react';
import { SiteConfig } from '../../../types';
import { isFeatureEnabled } from '../../utils/featureFlags';

interface HomeStoryHighlightsProps {
  siteConfig: SiteConfig;
  isMobileLandscape: boolean;
  onNavigate: (view: string, id?: string, query?: string) => void;
}

export const HomeStoryHighlights: React.FC<HomeStoryHighlightsProps> = ({
  siteConfig,
  isMobileLandscape,
  onNavigate,
}) => {
  const highlightItems = [
    { label: 'Laines', icon: '🧶', view: 'shop', query: 'Laine', bg: 'from-amber-400 to-orange-500', feature: 'shop' },
    { label: 'Déco', icon: '🏺', view: 'shop', query: 'Décoration', bg: 'from-rose-400 to-pink-600', feature: 'shop' },
    { label: 'Packs', icon: '🎁', view: 'packs', bg: 'from-emerald-400 to-teal-600', feature: 'packs' },
    { label: 'Flash', icon: '⚡', view: 'flash-sales', bg: 'from-amber-500 to-red-500', feature: 'flashSales' },
    { label: 'Sur Mesure', icon: '🎨', view: 'custom-order', bg: 'from-fuchsia-400 to-pink-500', feature: 'customOrder' },
  ].filter((item) => isFeatureEnabled(siteConfig, item.feature));

  return (
    <section
      className={`md:hidden px-3 transition-all duration-300 ${
        isMobileLandscape ? '-mt-2 mb-2 flex justify-center w-full' : '-mt-4 sm:-mt-8'
      }`}
    >
      <div
        className={`flex items-center overflow-x-auto no-scrollbar snap-x snap-mandatory transition-all duration-300 ${
          isMobileLandscape ? 'gap-2 pb-1 pt-0.5 justify-center w-full max-w-full' : 'gap-3 pb-2 pt-1 w-full'
        }`}
      >
        {highlightItems.map((item, idx) => (
          <motion.button
            key={idx}
            whileTap={{ scale: 0.92 }}
            onClick={() => onNavigate(item.view, undefined, item.query)}
            className="flex flex-col items-center gap-1 snap-start shrink-0 focus:outline-none group"
          >
            <div
              className={`rounded-full p-[1.5px] bg-gradient-to-tr ${item.bg} shadow-sm group-hover:shadow-md transition-all duration-300 ${
                isMobileLandscape ? 'w-11 h-11' : 'w-14 h-14'
              }`}
            >
              <div
                className={`w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center backdrop-blur-sm group-hover:scale-105 transition-transform duration-300 ${
                  isMobileLandscape ? 'text-base' : 'text-xl'
                }`}
              >
                <span>{item.icon}</span>
              </div>
            </div>
            <span
              className={`font-semibold tracking-tight text-primary/85 dark:text-white/90 truncate transition-all duration-300 ${
                isMobileLandscape ? 'text-[9px] max-w-[50px]' : 'text-[11px] max-w-[62px]'
              }`}
            >
              {item.label}
            </span>
          </motion.button>
        ))}
      </div>
    </section>
  );
};
