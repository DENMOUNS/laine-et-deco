import React, { useState } from 'react';
import { Product, PromoEvent } from '../../types';
import { Button } from '../components/ui/Button';
import { Minus, Plus, ShoppingBag } from 'lucide-react';

interface ProductDetailViewProps {
  product: Product;
  allProducts: Product[];
  onAddToCart: (product: Product, quantity?: number) => void;
  onAddToWishlist: (product: Product) => void;
  onQuickView: (product: Product | null) => void;
  onNavigate: (view: string, id?: string, query?: string) => void;
  events: PromoEvent[];
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  allProducts,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  onNavigate,
  events
}) => {
  const [quantity, setQuantity] = useState(1);

  // Filter for similar products: same category, not the current product
  const recommendedProducts = allProducts
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="bg-card p-8 md:p-12 rounded-[3rem] border border-primary/5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="relative">
            <img src={product.image} alt={product.name} className="w-full aspect-square object-cover rounded-3xl" referrerPolicy="no-referrer" loading="lazy" width="800" height="800" />
            {product.isSale && (
              <span className="absolute top-4 left-4 bg-accent text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                Promo
              </span>
            )}
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-serif text-primary">{product.name}</h1>
            <div className="flex items-center gap-4">
              <p className="text-3xl font-bold text-accent">{product.price.toLocaleString()} FCFA</p>
              {product.oldPrice && (
                <p className="text-xl text-primary/70 line-through">{product.oldPrice.toLocaleString()} FCFA</p>
              )}
            </div>
            <p className="text-primary/70 leading-relaxed">{product.description}</p>
            
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="pt-6 border-t border-primary/5 space-y-4">
                <h4 className="font-bold text-primary uppercase text-xs tracking-widest">Caractéristiques</h4>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-primary/50 uppercase text-[10px] tracking-wider mb-1 font-bold">{key}</dt>
                      <dd className="font-medium text-primary">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
            
            <div className="space-y-4 pt-6 border-t border-primary/5">
              <div className="flex items-center w-32 bg-card border border-primary/10 rounded-full p-1">
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:text-accent"
                >
                  <Minus size={18} />
                </Button>
                <span className="flex-grow text-center font-bold">{quantity}</span>
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:text-accent"
                >
                  <Plus size={18} />
                </Button>
              </div>
              <div className="flex gap-4">
                <Button variant="primary" className="flex-grow" onClick={() => onAddToCart(product, quantity)}>
                  <ShoppingBag size={20} className="mr-2" /> Ajouter au panier
                </Button>
                <Button variant="outline" onClick={() => onAddToWishlist(product)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {recommendedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-3xl font-serif text-primary mb-8">Produits similaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendedProducts.map(p => (
              <div key={p.id} className="bg-card p-6 rounded-[2rem] border border-primary/5 shadow-sm">
                <img src={p.image} alt={p.name} className="w-full h-64 object-cover rounded-2xl mb-4" referrerPolicy="no-referrer" loading="lazy" />
                <h3 className="font-serif text-xl text-primary mb-2">{p.name}</h3>
                <p className="text-accent font-bold mb-4">{p.price.toLocaleString()} FCFA</p>
                <Button variant="outline" className="w-full" onClick={() => onNavigate('product-detail', p.id)}>
                  Voir le produit
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

