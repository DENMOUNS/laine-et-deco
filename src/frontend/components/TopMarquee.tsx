import React, { useEffect } from 'react';
import { Package, Sparkles, Heart, Star, Truck, ShieldCheck, Tag, Gift, Award, CheckCircle2, Megaphone, Flame } from 'lucide-react';
import { useEntity } from '../hooks/useEntity';
import { setMarqueeReady } from '../hooks/useLoadingSequence';
import { ScrollingBannerConfig, MarqueeItem, SiteConfig } from '../../types';
import { useTranslation } from '../../i18n';

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
  CheckCircle2,
  Megaphone,
  Flame,
};

export const TopMarquee: React.FC<TopMarqueeProps> = () => {
  const { data: marqueeData, isLoading } = useEntity<MarqueeItem>('marquee_item');
  const { l } = useTranslation();

  useEffect(() => {
    if (!isLoading) {
      setMarqueeReady(true);
    }
  }, [isLoading]);

  // Firestore marquee_item collection
  const activeMarqueeData = (marqueeData || []).filter(item => !item.status || item.status === 'active');

  const sourceItems = activeMarqueeData.length > 0 
    ? activeMarqueeData.map(m => ({ id: m.id, text: m.text, text_en: m.text_en, iconName: m.iconName || 'Sparkles' })) 
    : [
        { id: '1', text: 'Livraison offerte dès 70€ d\'achat en France', text_en: 'Free shipping on orders over €70', iconName: 'Truck' },
        { id: '2', text: 'Artisanat 100% fait main en France', text_en: '100% Handmade in France', iconName: 'Sparkles' },
        { id: '3', text: 'Laines 100% Naturelles & Éco-responsables', text_en: '100% Natural & Eco-friendly yarns', iconName: 'Heart' },
        { id: '4', text: 'Retours gratuits sous 30 jours', text_en: 'Free returns within 30 days', iconName: 'ShieldCheck' }
      ];

  const baseItems = sourceItems.map((item) => ({
    ...item,
    Icon: iconMap[item.iconName] || Star,
  }));

  const items = [...baseItems, ...baseItems, ...baseItems, ...baseItems];

  return (
    <div className="hidden md:flex bg-[#F4EFE6] dark:bg-[#1B221B] text-stone-800 dark:text-stone-200 border-b border-stone-200/80 dark:border-stone-800 overflow-hidden py-2 lg:py-2.5 relative z-30 w-full group shadow-xs lg:max-w-7xl lg:mx-auto lg:rounded-2xl lg:mt-2.5 lg:border lg:border-stone-200/80 dark:lg:border-stone-800/80 before:pointer-events-none before:absolute before:left-0 before:top-0 before:bottom-0 before:w-16 lg:before:w-28 before:bg-gradient-to-r before:from-[#F4EFE6] dark:before:from-[#1B221B] before:to-transparent before:z-10 after:pointer-events-none after:absolute after:right-0 after:top-0 after:bottom-0 after:w-16 lg:after:w-28 after:bg-gradient-to-l after:from-[#F4EFE6] dark:after:from-[#1B221B] after:to-transparent after:z-10">
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
