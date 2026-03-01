import React from 'react';
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onAddToWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onClick: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onAddToWishlist, onQuickView, onClick }) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
    >
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {product.isNew && (
          <span className="bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">Nouveau</span>
        )}
        {product.isSale && (
          <span className="bg-accent text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">Promo</span>
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
          <span className="text-xl font-bold text-primary">{product.price.toLocaleString()} FCFA</span>
          <div className="flex items-center text-yellow-500 text-sm">
            <Star size={14} fill="currentColor" />
            <span className="ml-1 text-primary/70 font-medium">{product.rating}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
