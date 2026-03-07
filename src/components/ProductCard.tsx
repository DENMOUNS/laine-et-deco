import React from 'react';
import { Star, Heart, ShoppingCart, Eye, Share2 } from 'lucide-react';
import { Product, PromoEvent } from '../types';
import { motion } from 'motion/react';
import { getEffectivePrice } from '../utils/siteUtils';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onAddToWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onClick: (p: Product) => void;
  events?: PromoEvent[];
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onAddToWishlist, onQuickView, onClick, events = [] }) => {
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
      <div className="relative aspect-[3/4] overflow-hidden cursor-pointer" onClick={() => onClick(product)}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); onAddToWishlist(product); }}
            className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center hover:bg-accent hover:text-white transition-colors shadow-lg"
          >
            <Heart size={20} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
            className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center hover:bg-accent hover:text-white transition-colors shadow-lg"
          >
            <ShoppingCart size={20} />
          </button>
          <button 
            onClick={handleShare}
            className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center hover:bg-accent hover:text-white transition-colors shadow-lg"
          >
            <Share2 size={20} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
            className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center hover:bg-accent hover:text-white transition-colors shadow-lg"
          >
            <Eye size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-1">
          <p className="text-[10px] uppercase tracking-widest text-primary/50 font-bold">{product.category}</p>
          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
            product.stock > 10 ? 'bg-green-100 text-green-600' : 
            product.stock > 0 ? 'bg-orange-100 text-orange-600' : 
            'bg-red-100 text-red-600'
          }`}>
            {product.stock > 10 ? 'En Stock' : product.stock > 0 ? 'Stock Faible' : 'Épuisé'}
          </span>
        </div>
        <h3 className="font-serif text-lg text-primary group-hover:text-accent transition-colors mb-2 cursor-pointer" onClick={() => onClick(product)}>
          {product.name}
        </h3>
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-xs text-primary/40 line-through font-bold">{product.price.toLocaleString()} FCFA</span>
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
};
