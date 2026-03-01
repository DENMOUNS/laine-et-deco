import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Star, Heart } from 'lucide-react';
import { Product } from '../types';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (p: Product, q: number) => void;
  onAddToWishlist: (p: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose, onAddToCart, onAddToWishlist }) => {
  if (!product) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-primary hover:text-accent transition-colors shadow-lg"
          >
            <X size={24} />
          </button>

          <div className="w-full md:w-1/2 aspect-[3/4] md:aspect-auto">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent mb-2">{product.category}</p>
              <h2 className="text-3xl font-serif text-primary mb-4">{product.name}</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center text-yellow-500">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={16} fill={i <= Math.floor(product.rating) ? "currentColor" : "none"} />
                  ))}
                </div>
                <span className="text-sm font-bold text-primary/60">{product.rating}</span>
                <span className={`ml-auto text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                  product.stock > 10 ? 'bg-green-100 text-green-600' : 
                  product.stock > 0 ? 'bg-orange-100 text-orange-600' : 
                  'bg-red-100 text-red-600'
                }`}>
                  {product.stock > 10 ? 'En Stock' : product.stock > 0 ? 'Stock Faible' : 'Épuisé'}
                </span>
              </div>
            </div>

            <p className="text-2xl font-bold text-primary mb-6">{product.price.toLocaleString()} FCFA</p>
            
            <p className="text-primary/70 leading-relaxed mb-8 line-clamp-4">
              {product.description}
            </p>

            <div className="mt-auto space-y-4">
              <button 
                onClick={() => { onAddToCart(product, 1); onClose(); }}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-accent transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
              >
                <ShoppingBag size={20} />
                Ajouter au panier
              </button>
              <button 
                onClick={() => { onAddToWishlist(product); onClose(); }}
                className="w-full py-4 border border-primary/10 rounded-2xl font-bold hover:bg-secondary transition-colors flex items-center justify-center gap-3"
              >
                <Heart size={20} />
                Ajouter aux favoris
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
