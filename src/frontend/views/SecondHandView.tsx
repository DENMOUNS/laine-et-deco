import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Recycle, Sparkles } from 'lucide-react';

import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../../types';
import { useTranslation } from '../../i18n';

interface SecondHandViewProps {
  onNavigate: (view: string, id?: string) => void;
  onAddToCart: (p: Product) => void;
  onAddToWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
}

export const SecondHandView: React.FC<SecondHandViewProps> = ({ 
  onNavigate, 
  onAddToCart, 
  onAddToWishlist, 
  onQuickView 
}) => {
  const { products: fetchedProducts } = useProducts({ cacheOnly: true });
  const PRODUCTS = fetchedProducts;
  const { isEn } = useTranslation();
  
  const secondHandProducts = PRODUCTS.filter(p => p.condition === 'second-hand');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2 text-primary/70 hover:text-primary font-bold text-xs uppercase tracking-widest mb-12 transition-colors"
      >
        <ArrowLeft size={16} /> {isEn ? 'Back to Home' : "Retour à l'accueil"}
      </button>

      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/5 text-accent mb-6">
          <Recycle size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-primary mb-4">
          {isEn ? 'Second Hand & Vintage' : 'Deuxième Main & Vintage'}
        </h1>
        <p className="text-primary/70 max-w-2xl mx-auto text-lg">
          {isEn 
            ? 'Give a second life to unique pieces. Our selection of second-hand products, carefully handpicked for their charm and authenticity.' 
            : 'Donnez une seconde vie à des pièces uniques. Notre sélection de produits de deuxième main, chinés avec soin pour leur charme et leur authenticité.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {[
          { icon: <Sparkles size={24} />, title: isEn ? "Unique Pieces" : "Pièces Uniques", desc: isEn ? "Rare and authentic items carefully curated." : "Des objets rares et authentiques chinés avec soin." },
          { icon: <Recycle size={24} />, title: isEn ? "Eco-friendly" : "Éco-responsable", desc: isEn ? "Reduce your footprint by choosing second hand." : "Réduisez votre impact en choisissant la seconde main." },
          { icon: <Sparkles size={24} />, title: isEn ? "Fair Prices" : "Prix Doux", desc: isEn ? "The charm of vintage at affordable rates." : "Le charme du vintage à des tarifs accessibles." },
        ].map((feature, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-primary/5 shadow-sm text-center">
            <div className="text-orange-500 mb-4 flex justify-center">{feature.icon}</div>
            <h3 className="font-serif text-lg mb-2">{feature.title}</h3>
            <p className="text-sm text-primary/70">{feature.desc}</p>
          </div>
        ))}
      </div>

      {secondHandProducts.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 md:gap-8">
          {secondHandProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={
                secondHandProducts.length % 2 !== 0 && index === secondHandProducts.length - 1
                  ? 'col-span-2 sm:col-span-1'
                  : ''
              }
            >
              <ProductCard 
                product={product}
                onAddToCart={onAddToCart}
                onAddToWishlist={onAddToWishlist}
                onQuickView={onQuickView}
                onClick={() => onNavigate('product-detail', product.id)}
                isFullWidthOnMobile={secondHandProducts.length % 2 !== 0 && index === secondHandProducts.length - 1}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-[3rem] border border-dashed border-primary/10">
          <Recycle size={48} className="mx-auto text-primary/70 mb-4" />
          <p className="text-primary/70 font-serif text-xl">
            {isEn ? 'Our second hand stock is currently empty.' : 'Notre stock de deuxième main est actuellement vide.'}
          </p>
          <button 
            onClick={() => onNavigate('shop')}
            className="mt-6 text-accent font-bold hover:underline"
          >
            {isEn ? 'Browse new products' : 'Voir les nouveautés'}
          </button>
        </div>
      )}
    </div>
  );
};
