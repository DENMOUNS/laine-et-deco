import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Star, Heart, ArrowRightLeft } from 'lucide-react';
import { Product } from '../../types';
import { Button } from './ui/Button';
import { cleanText } from '../utils/siteUtils';
import { ProductImageGallery } from './ProductImageGallery';
import { triggerHaptic } from '../utils/haptics';
import { useComparisonStore } from '../../stores/comparisonStore';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (p: Product, q: number) => void;
  onAddToWishlist: (p: Product) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose, onAddToCart, onAddToWishlist }) => {
  const productImages = React.useMemo(() => {
    if (!product) return [];
    const list: string[] = [];
    if (product.image) list.push(product.image);
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list.length > 0 ? list : [product.image];
  }, [product]);

  return (
    <AnimatePresence>
      {product && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="flex min-h-screen items-start sm:items-center justify-center p-4 text-center">
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            />
            <motion.div
              key="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[95vh] rounded-[2rem] md:rounded-[3rem] shadow-2xl flex flex-col md:flex-row text-left overflow-hidden my-8"
            >
              <Button 
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4 md:top-6 md:right-6 z-20 p-2 bg-white/80 backdrop-blur-md rounded-full text-primary hover:text-accent shadow-lg"
              >
                <X size={24} />
              </Button>

              <div className="w-full md:w-1/2 p-4 md:p-6 bg-secondary/10 flex flex-col justify-center">
                <ProductImageGallery
                  images={productImages}
                  productName={product.name}
                  isSale={product.isSale}
                />
              </div>

              <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col">
                <div className="mb-6">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent mb-2">{product.category}</p>
                  <h2 className="text-2xl md:text-3xl font-serif text-primary mb-3">{product.name}</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center text-yellow-500">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} size={16} fill={i <= Math.floor(product.rating) ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-primary/70">{product.rating}</span>
                    <span className={`ml-auto text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                      product.stock > 10 ? 'bg-green-100 text-green-600' : 
                      product.stock > 0 ? 'bg-orange-100 text-orange-600' : 
                      'bg-red-100 text-red-600'
                    }`}>
                      {product.stock > 10 ? 'En Stock' : product.stock > 0 ? 'Stock Faible' : 'Épuisé'}
                    </span>
                  </div>
                </div>

                <p className="text-2xl font-bold text-primary mb-4">{product.price.toLocaleString()} FCFA</p>
                
                <p className="text-primary/70 leading-relaxed mb-6 line-clamp-3 text-sm">
                  {cleanText(product.description) || "Une pièce d'exception façonnée avec passion pour vos plus beaux projets."}
                </p>

                <div className="mt-auto space-y-2.5 pt-4">
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => { 
                        triggerHaptic('success');
                        onAddToCart(product, 1); 
                        onClose(); 
                      }}
                      className="flex-grow py-3 rounded-2xl font-bold gap-2 shadow-xl shadow-primary/20 text-xs sm:text-sm"
                    >
                      <ShoppingBag size={18} />
                      Ajouter au panier
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        triggerHaptic('light');
                        useComparisonStore.getState().addToComparison(product);
                      }}
                      title="Ajouter au comparateur"
                      className="py-3 px-3.5 border border-primary/10 rounded-2xl font-bold hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-1.5 text-xs"
                    >
                      <ArrowRightLeft size={18} />
                    </Button>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => { 
                      triggerHaptic('selection');
                      onAddToWishlist(product); 
                      onClose(); 
                    }}
                    className="w-full py-2.5 border border-primary/10 rounded-2xl font-bold hover:bg-secondary flex items-center justify-center gap-2 text-xs"
                  >
                    <Heart size={16} />
                    Ajouter aux favoris
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
