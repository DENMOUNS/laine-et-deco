import React, { useEffect } from 'react';
import { Package, Sparkles, Heart, Star, Truck, ShieldCheck, Tag, Gift, Award } from 'lucide-react';
import { useMarqueeService } from '../hooks/useMarqueeService';
import { setMarqueeReady } from '../hooks/useLoadingSequence';
import { MarqueeItem, SiteConfig } from '../../types';
import { useTranslation } from '../../i18n';

interface TopMarqueeProps {
  siteConfig?: SiteConfig;
}

const iconMap: Record<string, typeof Package> = {
  Package,
  Sparkles: Star,
  Heart,
  Star,
  Truck,
  ShieldCheck,
  Tag,
  Gift,
  Award,
};

export const TopMarquee: React.FC<TopMarqueeProps> = () => {
  const { data: marqueeData, isLoading } = useMarqueeService();
  const { l } = useTranslation();

  useEffect(() => {
    if (!isLoading) {
      setMarqueeReady(true);
    }
  }, [isLoading]);

  const activeItems = (marqueeData || [])
    .filter((item) => !item.status || item.status === 'active')
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (!activeItems || activeItems.length === 0) return null;

  const baseItems = activeItems.map((item) => ({
    ...item,
    Icon: iconMap[item.iconName] || Star,
  }));

  const items = [...baseItems, ...baseItems, ...baseItems, ...baseItems];

  return (
    <div className="hidden md:flex bg-[#F4EFE6] dark:bg-[#1B221B] text-stone-800 dark:text-stone-200 border-b border-stone-200/80 dark:border-stone-800 overflow-hidden py-2 relative z-30 w-full group shadow-xs">
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        {[0, 1].map((setIndex) => (
          <div key={setIndex} className="flex gap-14 items-center pr-14 whitespace-nowrap">
            {items.map((item, index) => {
              const Icon = item.Icon;
              return (
                <div key={`${setIndex}-${index}-${item.id || index}`} className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/70 shrink-0" />
                  <Icon size={13} className="text-accent shrink-0" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-stone-700 dark:text-stone-300">
                    {l(item, 'text', item.text)}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
