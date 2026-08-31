import React from 'react';
import { Star, Heart, ShoppingCart, Share2, ArrowRightLeft, Eye } from 'lucide-react';
import { Product, PromoEvent } from '../../types';
import { motion } from 'motion/react';
import { getEffectivePrice, cleanText } from '../utils/siteUtils';
import { generateSvgPlaceholder } from './ui/ImageWithFallback';
import { optimizeImageUrl } from '../utils/imageUtils';
import { triggerHaptic } from '../utils/haptics';
import { toast } from 'sonner';
import { useTranslation } from '../../i18n';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onAddToWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onAddToComparison?: (p: Product) => void;
  onClick: (p: Product) => void;
  events?: PromoEvent[];
  isFullWidthOnMobile?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({ 
  product, 
  onAddToCart, 
  onAddToWishlist, 
  onQuickView, 
  onAddToComparison, 
  onClick, 
  events = [], 
  isFullWidthOnMobile = false 
}) => {
  const { t, l } = useTranslation();
  const effectivePrice = getEffectivePrice(product, events);
  const hasDiscount = effectivePrice < product.price;
  const isOutOfStock = !product.isAvailable || product.stock <= 0;
  const displayName = l(product, 'name', product.name);
  const displayCategory = l(product, 'category', product.category);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: displayName,
      text: cleanText(l(product, 'description', product.description)),
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t('common.success'));
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`group relative bg-white md:clay-tactile rounded-2xl sm:rounded-3xl border border-primary/5 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex ${
        isFullWidthOnMobile 
          ? 'flex-row items-center p-3 gap-4 w-full min-h-[160px]' 
          : 'flex-col h-full'
      } ${isOutOfStock ? 'opacity-75 grayscale-[0.3]' : ''}`}
    >
      {/* Badges */}
      <div className={`absolute z-10 flex flex-col gap-1 sm:gap-1.5 ${
        isFullWidthOnMobile 
          ? 'top-4 left-4' 
          : 'top-2.5 left-2.5 sm:top-3.5 sm:left-3.5'
      }`}>
        {product.isNew && (
          <span className="glass-ios text-primary text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-xs">
            {t('common.new')}
          </span>
        )}
        {(product.isSale || hasDiscount) && (
          <span className="bg-accent/95 backdrop-blur-md text-primary text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-xs border border-white/30">
            -{Math.round((1 - effectivePrice / product.price) * 100)}%
          </span>
        )}
        {isOutOfStock && (
          <span className="bg-red-500/90 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-xs border border-white/30">
            {t('common.outOfStock')}
          </span>
        )}
      </div>

      {/* Image Container */}
      <div 
        className={`relative overflow-hidden cursor-pointer group/img ${
          isFullWidthOnMobile 
            ? 'w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] rounded-xl shrink-0' 
            : 'w-full aspect-square sm:aspect-[4/3]'
        }`} 
        onClick={() => onClick(product)}
      >
        <img
          src={optimizeImageUrl(product.image || (product as any).imageUrl || (Array.isArray(product.images) && product.images[0]) || generateSvgPlaceholder(displayName), 600)}
          alt={displayName}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/img:scale-105"
          referrerPolicy="no-referrer"
          loading="lazy"
          width="400"
          height="400"
          onError={(e) => {
            e.currentTarget.src = generateSvgPlaceholder(displayName);
          }}
        />
        
        {/* Overlay actions (Wishlist, QuickView, Share, Compare) - WITHOUT AddToCart which is now next to price */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 p-2">
          <motion.button 
            aria-label={t('common.wishlist')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { 
              e.stopPropagation(); 
              triggerHaptic('selection');
              onAddToWishlist(product); 
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 text-primary flex items-center justify-center hover:bg-accent hover:text-primary transition-colors shadow-lg cursor-pointer"
            title={t('common.wishlist')}
          >
            <Heart size={16} />
          </motion.button>
          
          <motion.button 
            aria-label="Aperçu rapide"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { 
              e.stopPropagation(); 
              triggerHaptic('light');
              onQuickView(product); 
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 text-primary flex items-center justify-center hover:bg-accent hover:text-primary transition-colors shadow-lg cursor-pointer"
            title="Aperçu rapide"
          >
            <Eye size={16} />
          </motion.button>

          <motion.button 
            aria-label="Partager"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              triggerHaptic('light');
              handleShare(e);
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 text-primary flex items-center justify-center hover:bg-accent hover:text-primary transition-colors shadow-lg cursor-pointer"
            title="Partager"
          >
            <Share2 size={16} />
          </motion.button>

          {onAddToComparison && (
            <motion.button 
              aria-label={t('common.comparison')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { 
                e.stopPropagation(); 
                triggerHaptic('light');
                onAddToComparison(product); 
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 text-primary flex items-center justify-center hover:bg-accent hover:text-primary transition-colors shadow-lg cursor-pointer"
              title={t('common.comparison')}
            >
              <ArrowRightLeft size={16} />
            </motion.button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`flex flex-col justify-between flex-grow min-w-0 ${
        isFullWidthOnMobile 
          ? 'p-2 sm:p-4 h-full' 
          : 'p-3.5 sm:p-4 md:p-5'
      }`}>
        <div>
          <div className="flex justify-between items-center mb-1 gap-1">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-primary/70 font-bold truncate">{displayCategory}</p>
            <div className="flex items-center text-amber-500 text-xs shrink-0">
              <Star size={12} fill="currentColor" />
              <span className="ml-1 text-primary/70 font-semibold text-[11px]">{product.rating}</span>
            </div>
          </div>
          
          <h3 
            className="font-serif text-primary group-hover:text-accent transition-colors mb-2 cursor-pointer font-semibold text-xs sm:text-sm md:text-base leading-snug line-clamp-2 min-h-[2.4rem]" 
            onClick={() => onClick(product)}
            title={displayName}
          >
            {displayName}
          </h3>
        </div>

        {/* Footer Row: Price + Add to Cart Button */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-primary/5 mt-auto">
          <div className="flex flex-col min-w-0">
            {hasDiscount && (
              <span className="text-[10px] sm:text-xs text-primary/50 line-through font-medium whitespace-nowrap">
                {product.price.toLocaleString()} FCFA
              </span>
            )}
            <span className="font-bold text-primary text-xs sm:text-sm md:text-base whitespace-nowrap">
              {effectivePrice.toLocaleString()} FCFA
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onAddToComparison && (
              <button
                type="button"
                aria-label={t('common.comparison')}
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic('light');
                  onAddToComparison(product);
                }}
                className="p-2 rounded-xl bg-secondary/30 text-primary hover:bg-accent hover:text-white transition-all cursor-pointer"
                title={t('common.comparison')}
              >
                <ArrowRightLeft size={15} />
              </button>
            )}
            <button
              type="button"
              aria-label={t('common.addToCart')}
              disabled={isOutOfStock}
              onClick={(e) => {
                e.stopPropagation();
                triggerHaptic('success');
                onAddToCart(product);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-primary hover:bg-accent text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title={t('common.addToCart')}
            >
              <ShoppingCart size={14} />
              <span className="hidden sm:inline">{t('common.addToCart')}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
