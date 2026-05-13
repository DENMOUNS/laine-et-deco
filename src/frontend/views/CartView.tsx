import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft, Truck, Package } from 'lucide-react';
import { CartItem, Product, Pack } from '../../types';

interface CartViewProps {
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onNavigate: (view: string) => void;
  onAddToCart?: (product: Product) => void;
  onAddToWishlist?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  allProducts?: Product[];
}

export const CartView: React.FC<CartViewProps> = ({
  cart,
  onUpdateQuantity,
  onRemove,
  onNavigate,
  allProducts = []
}) => {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const FREE_SHIPPING_THRESHOLD = 200000;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 5000; 
  const total = subtotal + (cart.length > 0 ? shipping : 0);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 min-h-[70vh] flex flex-col items-center justify-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center mb-8 text-primary/70"
        >
          <ShoppingBag size={64} />
        </motion.div>
        <h1 className="text-4xl font-serif text-primary mb-4 text-center">Votre panier est vide</h1>
        <p className="text-primary/70 text-center max-w-md mb-8">
          Découvrez nos collections de laines et d'objets de décoration artisanaux pour trouver votre bonheur.
        </p>
        <button 
          onClick={() => onNavigate('shop')}
          className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-accent transition-all shadow-lg flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Retour à la boutique
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-5xl font-serif text-primary mb-16">Votre Panier</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Main Content */}
        <div className="w-full lg:w-2/3 space-y-8">
          {/* Free Shipping Progress */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary rounded-lg">
                  <Truck className="text-accent" size={24} />
                </div>
                <span className="font-serif font-bold text-lg">Livraison</span>
              </div>
              <span className="text-accent font-bold">
                {subtotal >= FREE_SHIPPING_THRESHOLD ? 'Livraison gratuite offerte !' : `Plus que ${(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()} FCFA`}
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-accent"
              />
            </div>
          </div>

          {/* Cart Items */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {cart.map((item) => {
                const name = item.type === 'product' ? item.product?.name : item.pack?.name;
                const category = item.type === 'product' ? item.product?.category : 'Pack Créatif';
                const image = item.type === 'product' ? item.product?.image : 'https://picsum.photos/seed/pack/200';
                return (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-primary/5 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6"
                  >
                    <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto">
                      <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-[1.2rem] sm:rounded-[1.5rem] overflow-hidden bg-secondary flex-shrink-0">
                        <img 
                          src={image} 
                          alt={name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      
                      <div className="flex-grow">
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70 mb-1">{category}</p>
                        <h3 className="text-base sm:text-lg font-serif font-bold text-primary mb-1">{name}</h3>
                        <p className="text-accent font-bold text-sm sm:text-base">{item.price.toLocaleString()} FCFA</p>
                        {item.type === 'pack' && (
                          <p className="text-[10px] text-primary/70 font-bold mt-2 uppercase tracking-widest leading-none flex items-center gap-2">
                             <Package size={10} /> Contenu groupé (carton)
                          </p>
                        )}
                      </div>
                    </div>
 
                    <div className="flex items-center justify-between md:justify-end w-full md:flex-grow gap-4 sm:gap-8 pt-4 md:pt-0 border-t md:border-t-0 border-primary/5">
                      <div className="flex items-center gap-4 bg-secondary/50 rounded-full p-1 px-3 py-1.5 sm:px-4 sm:py-2 border border-primary/5">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="text-primary hover:text-accent transition-colors disabled:opacity-20"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} className="sm:size-4" />
                        </button>
                        <span className="w-4 text-center font-bold text-xs sm:text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="text-primary hover:text-accent transition-colors"
                        >
                          <Plus size={14} className="sm:size-4" />
                        </button>
                      </div>
 
                      <div className="text-right min-w-[100px] sm:min-w-[140px]">
                        <p className="text-lg sm:text-2xl font-serif font-bold text-primary">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                      </div>
 
                      <button 
                        onClick={() => onRemove(item.id)}
                        className="p-2 sm:p-3 text-primary/70 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                      >
                        <Trash2 size={18} className="sm:size-5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Promo Code */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingBag className="text-accent" size={20} />
              <span className="font-serif font-bold text-lg">Code Promo</span>
            </div>
            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="Entrez votre code (ex: BIENVENUE10)" 
                className="flex-grow px-6 py-4 bg-secondary rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium text-sm"
              />
              <button className="bg-[#5c5e46] text-white px-10 py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg text-sm">
                Appliquer
              </button>
            </div>
          </div>
        </div>

        {/* Recap Sidebar */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white p-10 rounded-[3rem] border border-primary/5 shadow-sm sticky top-24">
            <h2 className="text-3xl font-serif font-bold text-primary mb-10">Récapitulatif</h2>
            
            <div className="space-y-6 mb-10 pb-10 border-b border-primary/5">
              <div className="flex justify-between text-primary/70 font-medium">
                <span>Sous-total</span>
                <span>{subtotal.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-primary/70 font-medium">
                <span>Livraison</span>
                <span>{shipping === 0 ? 'Offerte' : `${shipping.toLocaleString()} FCFA`}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs italic text-accent opacity-80">
                  Plus que {(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()} FCFA pour la livraison gratuite !
                </p>
              )}
            </div>

            <div className="flex justify-between items-end mb-12">
              <span className="text-2xl font-serif font-bold text-primary">Total</span>
              <span className="text-4xl font-serif font-bold text-primary">{total.toLocaleString()} FCFA</span>
            </div>

            <button 
              onClick={() => onNavigate('checkout')}
              className="w-full bg-[#5c5e46] text-white py-6 rounded-[2rem] font-bold hover:opacity-90 transition-all shadow-xl shadow-[#5c5e46]/20 flex items-center justify-center gap-3 text-lg"
            >
              Passer la commande
              <ArrowRight size={22} />
            </button>

            <div className="mt-10 flex items-center justify-center gap-6 opacity-40 grayscale">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4 object-contain" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6 object-contain" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/2560px-PayPal.svg.png" alt="PayPal" className="h-5 object-contain" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
