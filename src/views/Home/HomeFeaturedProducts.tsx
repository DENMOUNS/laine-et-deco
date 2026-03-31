import React, { useState } from 'react';
import { ProductCard } from '../../components/ProductCard';
import { Product, PromoEvent } from '../../types';

interface HomeFeaturedProductsProps {
  products: Product[];
  onAddToCart: (p: Product) => void;
  onAddToWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onProductClick: (p: Product) => void;
  events?: PromoEvent[];
}

export const HomeFeaturedProducts: React.FC<HomeFeaturedProductsProps> = ({ products, onAddToCart, onAddToWishlist, onQuickView, onProductClick, events = [] }) => {
  const [showOnlyPromos, setShowOnlyPromos] = useState(false);
  const displayedProducts = showOnlyPromos ? products.filter(p => p.oldPrice || p.promoPrice) : products;

  return (
    <section className="bg-primary/5 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="text-left"><span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Sélection</span><h2 className="text-4xl font-serif mb-4">Les Incontournables</h2><p className="text-primary/60 max-w-xl">Nos meilleures ventes et coups de cœur du moment, choisis avec soin pour vous.</p></div>
          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-primary/5">
            <span className="text-xs font-bold uppercase tracking-widest text-primary/40 ml-4">Filtre:</span>
            <button onClick={() => setShowOnlyPromos(!showOnlyPromos)} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${showOnlyPromos ? 'bg-accent text-white shadow-md' : 'bg-slate-50 text-primary/60 hover:bg-slate-100'}`}>{showOnlyPromos ? 'Toutes les promos' : 'En promotion'}</button>
          </div>
        </div>
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
          {displayedProducts.map((product) => (
            <div key={product.id} className="min-w-[70vw] sm:min-w-0 snap-center">
              <ProductCard product={product} onAddToCart={onAddToCart} onAddToWishlist={onAddToWishlist} onQuickView={onQuickView} onClick={onProductClick} events={events} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
