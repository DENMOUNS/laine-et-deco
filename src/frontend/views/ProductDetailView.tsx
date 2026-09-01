import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Product, PromoEvent } from '../../types';
import { Button } from '../components/ui/Button';
import { Minus, Plus, ShoppingBag, Heart, ArrowRightLeft, Check, Sparkles } from 'lucide-react';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { ProductImageGallery } from '../components/ProductImageGallery';
import { formatAvailabilityDate, getProductAvailability } from '../utils/stockAvailability';
import { getEffectivePrice, cleanText } from '../utils/siteUtils';
import { triggerHaptic } from '../utils/haptics';
import { useComparisonStore } from '../../stores/comparisonStore';
import { SEO } from '../components/SEO';

interface FlyingDot {
  id: number;
  x: number;
  y: number;
}

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
  const [flyingDots, setFlyingDots] = useState<FlyingDot[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const availability = getProductAvailability(product, selectedColor);
  const maxQuantity = availability.total;

  const comparisonList = useComparisonStore((s) => s.comparisonList);
  const addToComparison = useComparisonStore((s) => s.addToComparison);
  const isCompared = comparisonList.some((p) => p.id === product.id);

  // Rassembler toutes les photos du produit
  const productImages = React.useMemo(() => {
    const list: string[] = [];
    if (product.image) list.push(product.image);
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list.length > 0 ? list : [product.image];
  }, [product]);

  // Filter for similar products: same category, not the current product
  const recommendedProducts = allProducts
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <SEO 
        title={product.seo?.title || product.name}
        description={product.seo?.description || cleanText(product.description).slice(0, 160)}
        ogImage={product.image || (product.images && product.images[0])}
        ogType="product"
      />
      <div className="bg-card p-6 sm:p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] border border-primary/5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Galerie d'images avec swipe tactile et points de pagination */}
          <div>
            <ProductImageGallery
              images={productImages}
              productName={product.name}
              isSale={product.isSale}
            />
          </div>
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl font-serif text-primary">{product.name}</h1>
            <div className="flex items-center gap-4">
              {product.promoPrice && product.promoPrice > 0 && product.promoPrice < (product.price || 0) ? (
                <>
                  <p className="text-3xl font-bold text-accent">{product.promoPrice.toLocaleString()} FCFA</p>
                  <p className="text-xl text-primary/70 line-through">{product.price.toLocaleString()} FCFA</p>
                  <span className="px-3 py-1 bg-accent/20 text-accent font-bold text-sm rounded-full">
                    -{Math.round((1 - product.promoPrice / (product.price || 1)) * 100)}%
                  </span>
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold text-accent">{product.price.toLocaleString()} FCFA</p>
                  {product.oldPrice && (
                    <p className="text-xl text-primary/70 line-through">{product.oldPrice.toLocaleString()} FCFA</p>
                  )}
                </>
              )}
            </div>
            
            <div className="inline-block px-3 py-1 bg-secondary/30 rounded-full">
              <p className={`text-sm font-bold ${availability.immediate > 0 ? 'text-green-600' : availability.preorder > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                {availability.immediate > 0 ? `${availability.immediate} disponible(s) immédiatement` : 'Aucun stock immédiat'}
              </p>
              {availability.preorder > 0 && (
                <p className="text-xs font-semibold text-amber-700 mt-1">
                  + {availability.preorder} en précommande{availability.nextArrivalDate ? ` dès le ${formatAvailabilityDate(availability.nextArrivalDate)}` : ''}
                </p>
              )}
            </div>
            
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-bold text-primary uppercase text-xs tracking-widest">Couleurs disponibles</h4>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color, idx) => (
                    <button 
                      key={idx} 
                      type="button"
                      onClick={() => {
                        triggerHaptic('selection');
                        setSelectedColor(color);
                      }}
                      aria-pressed={selectedColor === color}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${selectedColor === color ? 'border-accent ring-2 ring-accent/30 scale-110' : 'border-primary/20 hover:scale-105'} shadow-sm`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div 
              className="text-primary/80 leading-relaxed prose prose-sm max-w-none space-y-2" 
              dangerouslySetInnerHTML={{ 
                __html: product.description ? product.description.replace(/\n/g, '<br />') : '' 
              }} 
            />
            
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="pt-6 border-t border-primary/5 space-y-4">
                <h4 className="font-bold text-primary uppercase text-xs tracking-widest">Caractéristiques</h4>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-primary/50 uppercase text-[10px] tracking-wider mb-1 font-bold">{key}</dt>
                      <dd className="font-medium text-primary">{value as React.ReactNode}</dd>
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
                  onClick={() => {
                    triggerHaptic('light');
                    setQuantity(Math.max(1, quantity - 1));
                  }}
                  className="w-10 h-10 flex items-center justify-center hover:text-accent"
                  disabled={quantity <= 1 || maxQuantity <= 0}
                >
                  <Minus size={18} />
                </Button>
                <input
                  type="number"
                  min="1"
                  max={maxQuantity}
                  value={maxQuantity <= 0 ? 0 : quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) {
                      setQuantity(Math.min(maxQuantity, Math.max(1, val)));
                    } else {
                      setQuantity(1);
                    }
                  }}
                  className="flex-grow w-8 text-center font-bold bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  disabled={maxQuantity <= 0}
                />
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    triggerHaptic('light');
                    setQuantity(Math.min(maxQuantity, quantity + 1));
                  }}
                  className="w-10 h-10 flex items-center justify-center hover:text-accent"
                  disabled={quantity >= maxQuantity || maxQuantity <= 0}
                >
                  <Plus size={18} />
                </Button>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" className="flex-grow relative overflow-hidden py-3.5" onClick={(e) => {
                  if (maxQuantity <= 0) return;
                  triggerHaptic('success');
                  const rect = e.currentTarget.getBoundingClientRect();
                  const newDot = { id: Date.now(), x: e.clientX, y: e.clientY };
                  setFlyingDots(prev => [...prev, newDot]);
                  onAddToCart(product, quantity);
                  setTimeout(() => setFlyingDots(prev => prev.filter(d => d.id !== newDot.id)), 1000);
                }} disabled={maxQuantity <= 0}>
                  <ShoppingBag size={20} className="mr-2" /> {availability.immediate >= quantity ? 'Ajouter au panier' : 'Précommander'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    triggerHaptic('selection');
                    onAddToWishlist(product);
                  }}
                  title="Ajouter aux favoris"
                  className="px-4"
                >
                  <Heart size={20} />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    triggerHaptic('light');
                    addToComparison(product);
                  }}
                  title={isCompared ? "Déjà dans le comparateur" : "Ajouter au comparateur de prix"}
                  className={`px-4 gap-2 transition-all ${isCompared ? 'bg-accent/15 border-accent text-accent font-bold' : ''}`}
                >
                  {isCompared ? <Check size={20} className="text-accent" /> : <ArrowRightLeft size={20} />}
                  <span className="hidden sm:inline">{isCompared ? 'Comparé' : 'Comparer'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Comparateur Rapide (PC Uniquement) */}
      <div className="hidden md:block mt-12 bg-gradient-to-br from-primary/5 via-secondary/20 to-accent/10 p-6 sm:p-8 rounded-[2.5rem] border border-primary/10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-widest mb-1">
              <Sparkles size={16} /> Comparateur de Produits
            </div>
            <h3 className="text-xl sm:text-2xl font-serif text-primary">Comparer avec d'autres articles</h3>
          </div>
          <Button 
            variant="outline"
            onClick={() => {
              addToComparison(product);
              onNavigate('comparison');
            }}
            className="self-start sm:self-auto gap-2 border-primary/20 hover:border-accent text-primary hover:text-accent font-bold text-xs rounded-xl"
          >
            <ArrowRightLeft size={16} /> Ouvrir le comparateur complet ({comparisonList.length})
          </Button>
        </div>

        {recommendedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Produit Actuel */}
            <div className="bg-white p-4 rounded-2xl border-2 border-accent shadow-md relative">
              <span className="absolute top-3 right-3 bg-accent text-primary text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                Ce produit
              </span>
              <p className="font-serif font-bold text-primary truncate mb-1">{product.name}</p>
              <p className="text-accent font-bold text-lg mb-2">{product.price.toLocaleString()} FCFA</p>
              <p className="text-xs text-primary/70 line-clamp-2">{cleanText(product.description)}</p>
            </div>

            {/* Alternatives */}
            {recommendedProducts.slice(0, 2).map((other) => (
              <div key={other.id} className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-primary/10 shadow-xs flex flex-col justify-between">
                <div>
                  <p className="font-serif font-bold text-primary truncate mb-1">{other.name}</p>
                  <p className="text-primary/80 font-bold text-lg mb-2">{other.price.toLocaleString()} FCFA</p>
                  <p className="text-xs text-primary/70 line-clamp-2">{cleanText(other.description)}</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      addToComparison(product);
                      addToComparison(other);
                    }}
                    className="flex-1 py-1.5 px-3 bg-secondary/40 hover:bg-accent hover:text-white text-primary rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowRightLeft size={13} /> Comparer les 2
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('product-detail', other.id)}
                    className="py-1.5 px-3 bg-primary/5 hover:bg-primary hover:text-white text-primary rounded-xl text-xs font-medium transition-all cursor-pointer"
                  >
                    Voir
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-primary/70">Ajoutez ce produit et d'autres articles au comparateur pour analyser leurs caractéristiques côte à côte.</p>
        )}
      </div>

      {recommendedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-3xl font-serif text-primary mb-8">Produits similaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendedProducts.map(p => (
              <div key={p.id} className="bg-card p-6 rounded-[2rem] border border-primary/5 shadow-sm">
                <ImageWithFallback src={p.image} alt={p.name} className="w-full h-64 object-cover rounded-2xl mb-4" loading="lazy" />
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

      {/* Flying Dots Animation */}
      {flyingDots.map(dot => (
        <motion.div
          key={dot.id}
          initial={{ x: dot.x, y: dot.y, scale: 1, opacity: 1 }}
          animate={{ 
            x: window.innerWidth - 60, // Top right corner (Cart Icon)
            y: 40,
            scale: 0.2, 
            opacity: 0 
          }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          className="fixed z-[100] top-0 left-0 w-8 h-8 bg-accent rounded-full pointer-events-none shadow-xl flex items-center justify-center text-white"
        >
          <ShoppingBag size={14} />
        </motion.div>
      ))}
    </div>
  );
};

