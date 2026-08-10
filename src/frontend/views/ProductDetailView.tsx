import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Product, PromoEvent } from '../../types';
import { Button } from '../components/ui/Button';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { formatAvailabilityDate, getProductAvailability } from '../utils/stockAvailability';
import { getEffectivePrice } from '../utils/siteUtils';

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const availability = getProductAvailability(product, selectedColor);
  const maxQuantity = availability.total;

  // Filter for similar products: same category, not the current product
  const recommendedProducts = allProducts
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="bg-card p-8 md:p-12 rounded-[3rem] border border-primary/5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <ImageWithFallback src={selectedImage || product.image} alt={product.name} className="w-full aspect-square object-cover rounded-3xl transition-opacity duration-300" loading="lazy" width={800} height={800} />
              {product.isSale && (
                <span className="absolute top-4 left-4 bg-accent text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  Promo
                </span>
              )}
            </div>
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-4">
                <button 
                  onClick={() => setSelectedImage(product.image)}
                  className={`relative rounded-xl overflow-hidden aspect-square border-2 ${selectedImage === product.image || !selectedImage ? 'border-accent shadow-md scale-95' : 'border-transparent hover:scale-95 transition-transform'}`}
                >
                  <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </button>
                {product.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 ${selectedImage === img ? 'border-accent shadow-md scale-95' : 'border-transparent hover:scale-95 transition-transform'}`}
                  >
                    <ImageWithFallback src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-serif text-primary">{product.name}</h1>
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
                      onClick={() => setSelectedColor(color)}
                      aria-pressed={selectedColor === color}
                      className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-accent ring-2 ring-accent/30' : 'border-primary/20'} shadow-sm`}
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
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
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
                  onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center hover:text-accent"
                  disabled={quantity >= maxQuantity || maxQuantity <= 0}
                >
                  <Plus size={18} />
                </Button>
              </div>
              <div className="flex gap-4">
                <Button variant="primary" className="flex-grow relative overflow-hidden" onClick={(e) => {
                  if (maxQuantity <= 0) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const newDot = { id: Date.now(), x: e.clientX, y: e.clientY };
                  setFlyingDots(prev => [...prev, newDot]);
                  onAddToCart(product, quantity);
                  setTimeout(() => setFlyingDots(prev => prev.filter(d => d.id !== newDot.id)), 1000);
                }} disabled={maxQuantity <= 0}>
                  <ShoppingBag size={20} className="mr-2" /> {availability.immediate >= quantity ? 'Ajouter au panier' : 'Précommander'}
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

