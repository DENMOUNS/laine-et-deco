import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { ProductCard } from '../../components/ProductCard';
import { Product, PromoEvent } from '../../types';

interface ShopProductGridProps {
  products: Product[];
  isFiltering: boolean;
  onAddToCart: (p: Product) => void;
  onAddToWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onProductClick: (p: Product) => void;
  events: PromoEvent[];
  currentPage: number;
  setCurrentPage: (p: number) => void;
  totalPages: number;
  onReset: () => void;
}

export const ShopProductGrid: React.FC<ShopProductGridProps> = ({
  products, isFiltering, onAddToCart, onAddToWishlist, onQuickView, onProductClick, events,
  currentPage, setCurrentPage, totalPages, onReset
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-12">
      <main className="flex-grow relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {isFiltering ? (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-[2px] z-10 rounded-[3rem]">
              <Loader2 size={40} className="text-accent animate-spin mb-4" />
              <p className="text-sm font-serif italic text-primary/60">Mise à jour des produits...</p>
            </motion.div>
          ) : (
            <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} onAddToWishlist={onAddToWishlist} onQuickView={onQuickView} onClick={onProductClick} events={events} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isFiltering && products.length === 0 && (
          <div className="text-center py-24">
            <p className="text-xl text-primary/40 font-serif italic">Aucun produit ne correspond à votre recherche.</p>
            <button onClick={onReset} className="mt-4 text-accent font-bold underline">Réinitialiser les filtres</button>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-16 flex justify-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button 
                key={n} 
                onClick={() => { setCurrentPage(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${currentPage === n ? 'bg-primary text-white shadow-lg' : 'bg-white border border-primary/10 hover:border-accent hover:text-accent'}`}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
