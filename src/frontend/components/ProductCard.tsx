import React from 'react';
import { Star, Heart, ShoppingCart, Share2, ArrowRightLeft } from 'lucide-react';
import { Product, PromoEvent } from '../../types';
import { motion } from 'motion/react';
import { getEffectivePrice } from '../utils/siteUtils';
import { generateSvgPlaceholder } from './ui/ImageWithFallback';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onAddToWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onAddToComparison?: (p: Product) => void;
  onClick: (p: Product) => void;
  events?: PromoEvent[];
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({ product, onAddToCart, onAddToWishlist, onQuickView, onAddToComparison, onClick, events = [] }) => {
  const effectivePrice = getEffectivePrice(product, events);
  const hasDiscount = effectivePrice < product.price;
  const isOutOfStock = !product.isAvailable || product.stock <= 0;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: product.name,
      text: product.description,
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 ${isOutOfStock ? 'opacity-75 grayscale-[0.5]' : ''}`}
    >
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {product.isNew && (
          <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full shadow-sm">Nouveau</span>
        )}
        {(product.isSale || hasDiscount) && (
          <span className="bg-accent text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full shadow-sm">
            -{Math.round((1 - effectivePrice / product.price) * 100)}%
          </span>
        )}
        {isOutOfStock && (
          <span className="bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full shadow-sm">Indisponible</span>
        )}
      </div>

      {/* Image Container */}
      <div className="relative aspect-square sm:aspect-[3/4] overflow-hidden cursor-pointer group/img" onClick={() => onClick(product)}>
        <img
          src={product.image || generateSvgPlaceholder(product.name)}
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
        
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4">
          <motion.button 
            aria-label="Ajouter aux favoris"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onAddToWishlist(product); }}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-primary flex items-center justify-center hover:bg-accent hover:text-white transition-colors shadow-xl"
          >
            <Heart size={18} className="sm:w-5 sm:h-5" />
          </motion.button>
          <motion.button 
            aria-label="Ajouter au panier"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-primary flex items-center justify-center hover:bg-accent hover:text-white transition-colors shadow-xl"
          >
            <ShoppingCart size={18} className="sm:w-5 sm:h-5" />
          </motion.button>
          <motion.button 
            aria-label="Partager"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-primary flex items-center justify-center hover:bg-accent hover:text-white transition-colors shadow-xl"
          >
            <Share2 size={18} className="sm:w-5 sm:h-5" />
          </motion.button>
          {onAddToComparison && (
            <motion.button 
              aria-label="Comparer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onAddToComparison(product); }}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-primary flex items-center justify-center hover:bg-accent hover:text-white transition-colors shadow-xl"
              title="Comparer"
            >
              <ArrowRightLeft size={18} className="sm:w-5 sm:h-5" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-1">
          <p className="text-[10px] uppercase tracking-widest text-primary/70 font-bold">{product.category}</p>
          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
            product.stock > 10 ? 'bg-green-100 text-green-600' : 
            product.stock > 0 ? 'bg-orange-100 text-orange-600' : 
            'bg-red-100 text-red-600'
          }`}>
            {product.stock > 0 ? `${product.stock} en stock` : 'Épuisé'}
          </span>
        </div>
        <h3 className="font-serif text-lg text-primary group-hover:text-accent transition-colors mb-2 cursor-pointer" onClick={() => onClick(product)}>
          {product.name}
        </h3>
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-xs text-primary/70 line-through font-bold">{product.price.toLocaleString()} FCFA</span>
            )}
            <span className="text-xl font-bold text-primary">{effectivePrice.toLocaleString()} FCFA</span>
          </div>
          <div className="flex items-center text-yellow-500 text-sm">
            <Star size={14} fill="currentColor" />
            <span className="ml-1 text-primary/70 font-medium">{product.rating}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
