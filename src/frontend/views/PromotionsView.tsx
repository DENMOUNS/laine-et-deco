import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Tag, Percent } from 'lucide-react';

import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../../types';

interface PromotionsViewProps {
  onNavigate: (view: string, id?: string) => void;
  onAddToCart: (p: Product) => void;
  onAddToWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
}

export const PromotionsView: React.FC<PromotionsViewProps> = ({ 
  onNavigate, 
  onAddToCart, 
  onAddToWishlist, 
  onQuickView 
}) => {
  const { products: fetchedProducts } = useProducts({ cacheOnly: true });
  const PRODUCTS = fetchedProducts;
  
  const promoProducts = PRODUCTS.filter(p => p.isSale || (p.promoPrice && p.promoPrice < p.price));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2 text-primary/70 hover:text-primary font-bold text-xs uppercase tracking-widest mb-12 transition-colors"
      >
        <ArrowLeft size={16} /> Retour à l'accueil
      </button>

      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/5 text-accent mb-6">
          <Tag size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-primary mb-4">Offres & Promotions</h1>
        <p className="text-primary/70 max-w-2xl mx-auto text-lg">
          Profitez de nos meilleures offres sur une sélection de produits artisanaux. Des remises exceptionnelles pour vos projets créatifs.
        </p>
      </div>

      {promoProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {promoProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard 
                product={product}
                onAddToCart={onAddToCart}
                onAddToWishlist={onAddToWishlist}
                onQuickView={onQuickView}
                onClick={() => onNavigate('product-detail', product.id)}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-primary/10">
          <Percent size={48} className="mx-auto text-primary/70 mb-4" />
          <p className="text-primary/70 font-serif text-xl">Aucune promotion en cours pour le moment.</p>
          <button 
            onClick={() => onNavigate('shop')}
            className="mt-6 text-accent font-bold hover:underline"
          >
            Découvrir toute la boutique
          </button>
        </div>
      )}
    </div>
  );
};
