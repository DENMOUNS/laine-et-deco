import React, { useEffect } from 'react';
import { Package, Sparkles, Heart, Star, Truck, ShieldCheck, Tag, Gift, Award } from 'lucide-react';
import { useMarqueeService } from '../hooks/useMarqueeService';
import { setMarqueeReady } from '../hooks/useLoadingSequence';
import { MarqueeItem, SiteConfig } from '../../types';

interface TopMarqueeProps {
  siteConfig?: SiteConfig;
}

const iconMap: Record<string, typeof Package> = {
  Package,
  Sparkles,
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
    <div className="hidden md:flex bg-primary text-secondary overflow-hidden py-2 relative z-30 w-full">
      <div className="flex w-max animate-marquee">
        {[0, 1].map((setIndex) => (
          <div key={setIndex} className="flex gap-16 items-center pr-16 whitespace-nowrap">
            {items.map((item, index) => {
              const Icon = item.Icon;
              return (
                <div key={`${setIndex}-${index}-${item.id || index}`} className="flex items-center gap-3">
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
