import React from 'react';
import { Package, Sparkles, Heart, Star } from 'lucide-react';
import { SiteConfig } from '../../types';

interface TopMarqueeProps {
  siteConfig?: SiteConfig;
}

export const TopMarquee: React.FC<TopMarqueeProps> = ({ siteConfig }) => {
  const fallbackItems = [
    { id: '1', text: 'LIVRAISON OFFERTE DÈS 200 000 FCFA', Icon: Package },
    { id: '2', text: 'NOUVELLE COLLECTION DISPONIBLE', Icon: Sparkles },
    { id: '3', text: 'TRICOTÉ AVEC AMOUR', Icon: Heart },
  ];

  const baseItems = siteConfig?.marqueeItems?.length
    ? siteConfig.marqueeItems.map((item) => ({
        ...item,
        Icon: ({ size, className }: { size?: number; className?: string }) => {
          const icons: Record<string, typeof Package> = { Package, Sparkles, Heart, Star };
          const IconComp = icons[item.iconName || 'Star'] || Star;
          return <IconComp size={size} className={className} />;
        },
      }))
    : fallbackItems;

  if (baseItems.length === 0) return null;

  const items = [...baseItems, ...baseItems, ...baseItems, ...baseItems];

  return (
    <div className="bg-primary text-secondary overflow-hidden py-2 sticky top-0 z-[60] flex w-full">
      <div className="flex w-max animate-marquee">
        {[0, 1].map((setIndex) => (
          <div key={setIndex} className="flex gap-16 items-center pr-16 whitespace-nowrap">
            {items.map((item, index) => {
              const Icon = item.Icon;
              return (
                <div key={`${setIndex}-${index}`} className="flex items-center gap-3">
                  <Icon size={14} className="text-secondary/70" />
                  <span className="text-xs font-bold uppercase tracking-widest">{item.text}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
