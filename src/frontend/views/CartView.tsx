import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft, Truck, Package, Gift, Sparkles, CheckCircle2, ShieldCheck, MessageCircle, X } from 'lucide-react';
import { CartItem, Product } from '../../types';
import { formatAvailabilityDate, getProductAvailability } from '../utils/stockAvailability';
import { useCartStore } from '../../stores/cartStore';
import { GiftWrapSection } from '../components/GiftWrapSection';
import { toast } from 'sonner';

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
}) => {
  const giftWrap = useCartStore((s) => s.giftWrap);
  const setGiftWrap = useCartStore((s) => s.setGiftWrap);

  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent?: number; discountAmount?: number } | null>(null);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const giftWrapFee = giftWrap.enabled ? (giftWrap.fee || 2000) : 0;
  const FREE_SHIPPING_THRESHOLD = 50000; // 50 000 FCFA seuil de livraison offerte
  
  const discount = appliedPromo 
    ? (appliedPromo.discountPercent ? Math.round(subtotal * (appliedPromo.discountPercent / 100)) : (appliedPromo.discountAmount || 0))
    : 0;

  const estimatedTotal = Math.max(0, subtotal - discount + giftWrapFee);
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleApplyPromo = () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) {
      toast.error("Veuillez saisir un code promotionnel.");
      return;
    }

    if (code === 'BIENVENUE10' || code === 'PROMO10') {
      setAppliedPromo({ code, discountPercent: 10 });
      toast.success(`Code ${code} appliqué : -10% sur votre panier !`);
      setPromoCodeInput('');
    } else if (code === 'REDUC15' || code === 'TRICOT15') {
      setAppliedPromo({ code, discountPercent: 15 });
      toast.success(`Code ${code} appliqué : -15% sur votre panier !`);
      setPromoCodeInput('');
    } else if (code === 'MERCERIE1000') {
      setAppliedPromo({ code, discountAmount: 1000 });
      toast.success(`Code ${code} appliqué : -1 000 FCFA de remise !`);
      setPromoCodeInput('');
    } else {
      toast.error(`Code promo "${code}" invalide ou expiré.`);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    toast.info("Code promotionnel retiré.");
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 min-h-[70vh] flex flex-col items-center justify-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-28 h-28 sm:w-32 sm:h-32 bg-primary/5 rounded-full flex items-center justify-center mb-6 sm:mb-8 text-primary/60"
        >
          <ShoppingBag size={54} />
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-serif text-primary mb-3 text-center">Votre panier est vide</h1>
        <p className="text-primary/70 text-center max-w-md mb-8 text-sm sm:text-base">
          Découvrez nos collections de laines, de crochets, d'aiguilles et d'accessoires d'artisanat pour composer votre projet créatif.
        </p>
        <button 
          onClick={() => onNavigate('shop')}
          className="bg-primary text-white px-7 py-3.5 sm:px-8 sm:py-4 rounded-full font-bold hover:bg-accent transition-all shadow-lg flex items-center gap-2 text-sm sm:text-base cursor-pointer"
        >
          <ArrowLeft size={18} />
          Explorer la boutique
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="flex items-center justify-between mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-primary">Votre Panier</h1>
        <span className="text-xs sm:text-sm font-bold bg-primary/10 text-primary px-3 py-1.5 rounded-full">
          {cart.reduce((s, i) => s + i.quantity, 0)} article(s)
        </span>
      </div>

      {/* Barre d'objectifs de livraison offerte */}
      <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/80 shadow-xs">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold mb-2">
          <span className="flex items-center gap-2 text-stone-800">
            <Truck size={16} className={remainingForFreeShipping === 0 ? "text-emerald-600" : "text-accent"} />
            {remainingForFreeShipping === 0 ? (
              <strong className="text-emerald-700">Félicitations ! Livraison gratuite débloquée !</strong>
            ) : (
              <span>
                Plus que <strong className="text-accent">{remainingForFreeShipping.toLocaleString('fr-FR')} FCFA</strong> pour la <strong>livraison gratuite</strong>
              </span>
            )}
          </span>
          <span className="text-stone-500 font-mono text-xs">{progressToFreeShipping}%</span>
        </div>
        <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 rounded-full ${remainingForFreeShipping === 0 ? 'bg-emerald-600' : 'bg-accent'}`}
            style={{ width: `${progressToFreeShipping}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Main Content */}
        <div className="w-full lg:w-2/3 space-y-6 sm:space-y-8">
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
                    className="bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center gap-4 sm:gap-6 hover:border-stone-300 transition-all"
                  >
                    <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto">
                      <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden bg-secondary flex-shrink-0 border border-stone-100">
                        <img 
                          src={image} 
                          alt={name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      
                      <div className="flex-grow">
                        <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-primary/70 mb-0.5">{category}</p>
                        <h3 className="text-base sm:text-lg font-serif font-bold text-primary mb-1 leading-snug">{name}</h3>
                        {item.configuration && (
                          <div className="mb-2 text-xs leading-relaxed text-primary/70">
                            <p><strong>Ouvrage :</strong> {item.configuration.modelName}</p>
                            <p><strong>Laine :</strong> {item.configuration.yarnName} · <strong>Couleur :</strong> {item.configuration.color}</p>
                          </div>
                        )}
                        <p className="text-accent font-bold text-sm sm:text-base">{item.price.toLocaleString('fr-FR')} FCFA</p>
                        {item.type === 'pack' && (
                          <p className="text-[10px] text-primary/70 font-bold mt-1 uppercase tracking-widest leading-none flex items-center gap-1.5">
                             <Package size={12} /> Pack composé
                          </p>
                        )}
                        {item.type === 'product' && (item.preorderQuantity || 0) > 0 && (
                          <p className="text-[10px] text-amber-700 font-bold mt-1">
                            {item.fulfillmentMode === 'mixed' ? 'Commande mixte : ' : ''}
                            {item.preorderQuantity} en précommande
                            {item.expectedAvailabilityDate ? ` dès le ${formatAvailabilityDate(item.expectedAvailabilityDate)}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
 
                    <div className="flex items-center justify-between md:justify-end w-full md:flex-grow gap-4 sm:gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-stone-100">
                      <div className="flex items-center gap-3 bg-stone-100 rounded-full p-1 px-3 py-1.5 border border-stone-200">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="text-stone-700 hover:text-accent transition-colors disabled:opacity-25 cursor-pointer"
                          disabled={item.quantity <= 1}
                          aria-label="Diminuer la quantité"
                        >
                          <Minus size={14} />
                        </button>
                        <input 
                          type="number"
                          min="1"
                          max={item.type === 'product' && item.product ? getProductAvailability(item.product).total : undefined}
                          value={item.quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val >= 1) {
                              const delta = val - item.quantity;
                              if (delta !== 0) {
                                onUpdateQuantity(item.id, delta);
                              }
                            }
                          }}
                          className="w-8 text-center font-bold text-xs sm:text-sm bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button 
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="text-stone-700 hover:text-accent transition-colors disabled:opacity-25 cursor-pointer"
                          disabled={item.type === 'product' && item.product ? item.quantity >= getProductAvailability(item.product).total : false}
                          title={item.type === 'product' && item.product && item.quantity >= getProductAvailability(item.product).total ? 'Limite de stock et de précommande atteinte' : undefined}
                          aria-label="Augmenter la quantité"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
 
                      <div className="text-right min-w-[90px] sm:min-w-[120px]">
                        <p className="text-base sm:text-xl font-serif font-bold text-stone-900">{(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</p>
                      </div>
 
                      <button 
                        onClick={() => {
                          onRemove(item.id);
                          toast.info(`${name} retiré du panier.`);
                        }}
                        className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all cursor-pointer"
                        aria-label="Supprimer cet article"
                      >
                        <Trash2 size={16} className="sm:size-5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Gift Wrap & Calligraphy Card Section */}
          <GiftWrapSection
            giftWrap={giftWrap}
            onChange={setGiftWrap}
          />

          {/* Promo Code Input */}
          <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-stone-200/80 shadow-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <ShoppingBag className="text-accent" size={18} />
              <span className="font-serif font-bold text-base sm:text-lg text-stone-900">Code Promotionnel ou Carte Cadeau</span>
            </div>
            
            {appliedPromo ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span className="text-xs sm:text-sm font-bold text-emerald-900">
                    Code <span className="font-mono bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-800">{appliedPromo.code}</span> appliqué ({appliedPromo.discountPercent ? `-${appliedPromo.discountPercent}%` : `-${appliedPromo.discountAmount?.toLocaleString('fr-FR')} FCFA`})
                  </span>
                </div>
                <button
                  onClick={handleRemovePromo}
                  className="text-stone-400 hover:text-stone-700 p-1 hover:bg-emerald-100 rounded-full transition-colors cursor-pointer"
                  title="Retirer le code promo"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                  placeholder="Entrez votre code (ex: BIENVENUE10, REDUC15)" 
                  className="flex-grow px-5 py-3.5 bg-stone-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all font-medium text-xs sm:text-sm border border-stone-200 uppercase tracking-wider"
                />
                <button 
                  onClick={handleApplyPromo}
                  className="w-full sm:w-auto bg-stone-900 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-accent transition-all shadow-xs text-xs sm:text-sm whitespace-nowrap cursor-pointer"
                >
                  Appliquer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recap Sidebar */}
        <div className="w-full lg:w-1/3">
          <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-stone-200/80 shadow-xs sticky top-24 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">Récapitulatif</h2>
            
            <div className="space-y-3 pb-6 border-b border-stone-100 text-sm">
              <div className="flex justify-between text-stone-600 font-medium">
                <span>Sous-total articles</span>
                <span className="font-semibold text-stone-900">{subtotal.toLocaleString('fr-FR')} FCFA</span>
              </div>

              {appliedPromo && discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200/60">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={14} />
                    Remise code ({appliedPromo.code})
                  </span>
                  <span className="font-bold">-{discount.toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}

              {giftWrap.enabled && (
                <div className="flex justify-between text-amber-900 font-medium bg-amber-50/80 p-2.5 rounded-lg border border-amber-200/70 text-xs">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Gift size={14} className="text-amber-700 shrink-0" />
                    Emballage Kraft & Carte
                  </span>
                  <span className="font-bold">+{(giftWrap.fee || 2000).toLocaleString('fr-FR')} FCFA</span>
                </div>
              )}

              <div className="flex justify-between text-stone-600 font-medium">
                <span>Livraison</span>
                <span className="font-semibold text-stone-900">
                  {remainingForFreeShipping === 0 ? (
                    <span className="text-emerald-700 font-bold uppercase tracking-wider text-xs">Offerte</span>
                  ) : (
                    <span className="text-xs text-stone-500 italic">Calculée à la caisse</span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-lg font-serif font-bold text-stone-900">Total estimé</span>
              <span className="text-2xl sm:text-3xl font-serif font-bold text-accent">{estimatedTotal.toLocaleString('fr-FR')} FCFA</span>
            </div>

            <button 
              onClick={() => onNavigate('checkout')}
              className="w-full bg-[#2C372B] hover:bg-accent text-white py-4 sm:py-4.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 text-base sm:text-lg cursor-pointer"
            >
              Passer la commande
              <ArrowRight size={18} />
            </button>

            {/* Badges de Réassurance */}
            <div className="pt-4 border-t border-stone-100 space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-stone-600 font-medium">
                <Truck size={15} className="text-accent shrink-0" />
                <span>Livraison soignée partout au Cameroun</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-stone-600 font-medium">
                <ShieldCheck size={15} className="text-accent shrink-0" />
                <span>Paiement 100% sécurisé (OM, MOMO, Cash)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-stone-600 font-medium">
                <MessageCircle size={15} className="text-emerald-600 shrink-0" />
                <span>Besoin d'aide ? Conseil direct sur WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

