import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Heart, ShoppingBag, Truck, ShieldCheck, RefreshCcw, Plus, Minus, ChevronRight, Share2 } from 'lucide-react';
import { Product, PromoEvent } from '../types';
import { PRODUCTS } from '../constants';
import { ProductCard } from '../components/ProductCard';
import { getEffectivePrice } from '../utils/siteUtils';

interface ProductDetailViewProps {
  product: Product;
  onAddToCart: (p: Product, q: number) => void;
  onAddToWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onNavigate: (view: string) => void;
  events?: PromoEvent[];
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product, onAddToCart, onAddToWishlist, onQuickView, onNavigate, events = [] }) => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const effectivePrice = getEffectivePrice(product, events);
  const hasDiscount = effectivePrice < product.price;

  const relatedProducts = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-primary/40 mb-12">
        <button onClick={() => onNavigate('home')} className="hover:text-primary">Accueil</button>
        <ChevronRight size={14} />
        <button onClick={() => onNavigate('shop')} className="hover:text-primary">Boutique</button>
        <ChevronRight size={14} />
        <span className="text-primary">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
        {/* Image Gallery */}
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl"
          >
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-accent transition-all">
                <img 
                  src={`https://picsum.photos/seed/${product.id}-${i}/400/400`} 
                  alt="Gallery" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent mb-2">{product.category}</p>
              <h1 className="text-5xl font-serif text-primary leading-tight">{product.name}</h1>
            </div>
            <button 
              onClick={() => onAddToWishlist(product)}
              className="p-4 rounded-full bg-white shadow-lg text-primary hover:text-accent transition-colors"
            >
              <Heart size={24} />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center text-yellow-500">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={18} fill={i <= Math.floor(product.rating) ? "currentColor" : "none"} />
              ))}
            </div>
            <span className="text-sm font-bold text-primary/60">{product.rating} (48 avis clients)</span>
            <span className={`ml-4 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
              product.stock > 10 ? 'bg-green-100 text-green-600' : 
              product.stock > 0 ? 'bg-orange-100 text-orange-600' : 
              'bg-red-100 text-red-600'
            }`}>
              {product.stock > 10 ? 'En Stock' : product.stock > 0 ? 'Stock Faible' : 'Épuisé'}
            </span>
          </div>

          <div className="flex items-center gap-4 mb-8">
            {hasDiscount && (
              <span className="text-xl text-primary/40 line-through font-bold">{product.price.toLocaleString()} FCFA</span>
            )}
            <p className="text-4xl font-bold text-primary">{effectivePrice.toLocaleString()} FCFA</p>
          </div>
          
          <p className="text-primary/70 leading-relaxed mb-10 text-lg">
            {product.description} Notre sélection est faite avec passion pour vous offrir le meilleur de l'artisanat.
          </p>

          <div className="space-y-8 mb-12">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Quantité</h3>
              <div className="flex items-center w-32 bg-white border border-primary/10 rounded-full p-1">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:text-accent transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="flex-grow text-center font-bold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:text-accent transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => onAddToCart(product, quantity)}
                className="flex-grow bg-primary text-white py-5 rounded-2xl font-bold hover:bg-accent transition-all duration-300 flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
              >
                <ShoppingBag size={20} />
                Ajouter au panier
              </button>
              <button className="p-5 border border-primary/10 rounded-2xl hover:bg-secondary transition-colors">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* Features List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-primary/10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 text-accent rounded-lg"><Truck size={20} /></div>
              <span className="text-xs font-bold text-primary/70">Livraison 48h</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 text-accent rounded-lg"><ShieldCheck size={20} /></div>
              <span className="text-xs font-bold text-primary/70">Garantie 2 ans</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 text-accent rounded-lg"><RefreshCcw size={20} /></div>
              <span className="text-xs font-bold text-primary/70">Retours Gratuits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <section className="mb-24">
          <div className="flex border-b border-primary/10 mb-10 overflow-x-auto no-scrollbar">
            <div className="flex min-w-max">
              {['description', 'caractéristiques', 'avis'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
                    activeTab === tab ? 'text-primary' : 'text-primary/40 hover:text-primary'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-1 bg-accent" />
                  )}
                </button>
              ))}
            </div>
          </div>
        <div className="max-w-3xl">
          {activeTab === 'description' && (
            <div className="space-y-6 text-primary/70 leading-relaxed">
              <p>
                Plongez dans l'univers de la création avec notre {product.name}. Chaque pièce est sélectionnée pour sa qualité exceptionnelle et son esthétique intemporelle.
              </p>
              <p>
                Que vous soyez un expert ou un débutant passionné, ce produit saura répondre à toutes vos attentes. Sa texture unique et ses finitions soignées en font un incontournable de notre collection.
              </p>
            </div>
          )}
          {activeTab === 'caractéristiques' && (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Matière', value: product.material || '100% Naturel' },
                { label: 'Origine', value: 'France' },
                { label: 'Poids', value: '500g' },
                { label: 'Dimensions', value: '20 x 15 cm' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-3 border-b border-primary/5">
                  <span className="text-primary/40 text-sm">{item.label}</span>
                  <span className="text-primary font-bold text-sm">{item.value}</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'avis' && (
            <div className="space-y-12">
              <div className="space-y-8">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-primary/5 pb-8">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-primary">{review.userName}</h4>
                          <div className="flex text-yellow-500 mt-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star key={i} size={12} fill={i <= review.rating ? "currentColor" : "none"} />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-primary/40">{review.date}</span>
                      </div>
                      <p className="text-primary/70 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-primary/40 italic">Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
                )}
              </div>

              <div className="bg-secondary/50 p-8 rounded-3xl space-y-6">
                <h3 className="text-xl font-serif">Laisser un avis</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-primary/60">Votre note :</span>
                    <div className="flex text-yellow-500">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <button key={i} className="hover:scale-125 transition-transform">
                          <Star size={20} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea 
                    placeholder="Partagez votre expérience avec ce produit..."
                    className="w-full p-4 bg-white border border-primary/10 rounded-2xl focus:outline-none focus:border-accent min-h-[120px]"
                  />
                  <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-accent transition-all">
                    Publier l'avis
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      <section>
        <h2 className="text-3xl font-serif mb-12">Vous aimerez aussi</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {relatedProducts.map((p) => (
            <ProductCard 
              key={p.id} 
              product={p} 
              onAddToCart={() => onAddToCart(p, 1)}
              onAddToWishlist={onAddToWishlist}
              onQuickView={onQuickView}
              onClick={() => onNavigate('product-detail')}
              events={events}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
