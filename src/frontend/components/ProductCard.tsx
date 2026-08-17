import React from 'react';
import { Star, Heart, ShoppingCart, Share2, ArrowRightLeft } from 'lucide-react';
import { Product, PromoEvent } from '../../types';
import { motion } from 'motion/react';
import { getEffectivePrice, cleanText } from '../utils/siteUtils';
import { generateSvgPlaceholder } from './ui/ImageWithFallback';
import { optimizeImageUrl } from '../utils/imageUtils';
import { triggerHaptic } from '../utils/haptics';
import { toast } from 'sonner';

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

export const ProductCard: React.FC<ProductCardProps> = React.memo(({ product, onAddToCart, onAddToWishlist, onQuickView, onAddToComparison, onClick, events = [], isFullWidthOnMobile = false }) => {
  const effectivePrice = getEffectivePrice(product, events);
  const hasDiscount = effectivePrice < product.price;
  const isOutOfStock = !product.isAvailable || product.stock <= 0;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: product.name,
      text: cleanText(product.description),
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papier !');
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`group relative bg-white md:clay-tactile rounded-2xl sm:rounded-3xl md:rounded-[2rem] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500 flex ${
        isFullWidthOnMobile 
          ? 'flex-row items-center p-3 h-[160px] sm:h-[180px] md:h-[220px] gap-4 w-full' 
          : 'flex-col h-full'
      } ${isOutOfStock ? 'opacity-75 grayscale-[0.5]' : ''}`}
    >
      {/* Badges with iPhone glass finish */}
      <div className={`absolute z-10 flex flex-col gap-1 sm:gap-1.5 ${
        isFullWidthOnMobile 
          ? 'top-4 left-4' 
          : 'top-2.5 left-2.5 sm:top-3.5 sm:left-3.5'
      }`}>
        {product.isNew && (
          <span className="glass-ios text-primary text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-xs">
            Nouveau
          </span>
        )}
        {(product.isSale || hasDiscount) && (
          <span className="bg-accent/95 backdrop-blur-md text-primary text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-xs border border-white/30">
            -{Math.round((1 - effectivePrice / product.price) * 100)}%
          </span>
        )}
        {isOutOfStock && (
          <span className="bg-red-500/90 backdrop-blur-md text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-xs border border-white/30">
            Indisponible
          </span>
        )}
      </div>

      {/* Image Container */}
      <div 
        className={`relative overflow-hidden cursor-pointer group/img ${
          isFullWidthOnMobile 
            ? 'w-[136px] h-[136px] sm:w-[156px] sm:h-[156px] md:w-[196px] md:h-[196px] rounded-xl shrink-0' 
            : 'aspect-square sm:aspect-[3/4]'
        }`} 
        onClick={() => onClick(product)}
      >
        <img
          src={optimizeImageUrl(product.image || (product as any).imageUrl || (Array.isArray(product.images) && product.images[0]) || generateSvgPlaceholder(product.name), 600)}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover/img:scale-110"
          referrerPolicy="no-referrer"
          loading="lazy"
          width="400"
          height="400"
          onError={(e) => {
            e.currentTarget.src = generateSvgPlaceholder(product.name);
          }}
        />
        {/* Gradient Overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500" />
        
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 sm:gap-3 p-2 sm:p-4">
          <motion.button 
            aria-label="Ajouter aux favoris"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { 
              e.stopPropagation(); 
              triggerHaptic('selection');
              onAddToWishlist(product); 
            }}
            className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white text-primary flex items-center justify-center hover:bg-accent hover:text-primary transition-colors shadow-xl"
          >
            <Heart size={15} className="sm:w-5 sm:h-5" />
          </motion.button>
          <motion.button 
            aria-label="Ajouter au panier"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { 
              e.stopPropagation(); 
              triggerHaptic('success');
              onAddToCart(product); 
            }}
            className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white text-primary flex items-center justify-center hover:bg-accent hover:text-primary transition-colors shadow-xl"
          >
            <ShoppingCart size={15} className="sm:w-5 sm:h-5" />
          </motion.button>
          <motion.button 
            aria-label="Partager"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              triggerHaptic('light');
              handleShare(e);
            }}
            className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white text-primary flex items-center justify-center hover:bg-accent hover:text-primary transition-colors shadow-xl"
          >
            <Share2 size={15} className="sm:w-5 sm:h-5" />
          </motion.button>
          {onAddToComparison && (
            <motion.button 
              aria-label="Comparer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { 
                e.stopPropagation(); 
                triggerHaptic('light');
                onAddToComparison(product); 
              }}
              className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white text-primary flex items-center justify-center hover:bg-accent hover:text-primary transition-colors shadow-xl"
              title="Comparer"
            >
              <ArrowRightLeft size={15} className="sm:w-5 sm:h-5" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`flex flex-col justify-between flex-grow min-w-0 ${
        isFullWidthOnMobile 
          ? 'p-2 sm:p-5 md:p-6 h-full' 
          : 'p-3 sm:p-5 md:p-6'
      }`}>
        <div>
          <div className="flex justify-between items-start mb-1 gap-1">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-primary/70 font-bold truncate">{product.category}</p>
            <span className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-widest px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ${
              product.stock > 10 ? 'bg-green-100 text-green-700' : 
              product.stock > 0 ? 'bg-orange-100 text-orange-700' : 
              'bg-red-100 text-red-700'
            }`}>
              {product.stock > 0 ? `${product.stock} dispo` : 'Épuisé'}
            </span>
          </div>
          <h3 className={`font-serif text-primary group-hover:text-accent transition-colors mb-2 cursor-pointer line-clamp-2 font-medium ${
            isFullWidthOnMobile 
              ? 'text-sm sm:text-base md:text-lg' 
              : 'text-xs sm:text-base md:text-lg'
          }`} onClick={() => onClick(product)}>
            {product.name}
          </h3>
        </div>
        <div className="flex justify-between items-end gap-1 pt-1">
          <div className="flex flex-col min-w-0">
            {hasDiscount && (
              <span className="text-[10px] sm:text-xs text-primary/60 line-through font-medium truncate">{product.price.toLocaleString()} FCFA</span>
            )}
            <span className={`font-bold text-primary truncate ${
              isFullWidthOnMobile 
                ? 'text-sm sm:text-base md:text-xl' 
                : 'text-xs sm:text-base md:text-xl'
            }`}>{effectivePrice.toLocaleString()} FCFA</span>
          </div>
          <div className="flex items-center text-amber-500 text-xs sm:text-sm shrink-0">
            <Star size={12} className="sm:w-3.5 sm:h-3.5" fill="currentColor" />
            <span className="ml-1 text-primary/70 font-medium text-[11px] sm:text-xs">{product.rating}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
