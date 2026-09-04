import React from 'react';
import { Package, Gift, Truck } from 'lucide-react';
import { CartItem, Product } from '../../../types';
import { Button } from '../../components/ui/Button';

export interface CheckoutOrderSummaryProps {
  cart: CartItem[];
  allProducts: Product[];
  giftWrap: any;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  promoInput?: string;
  setPromoInput?: (val: string) => void;
  onApplyPromo?: () => void;
}

export const CheckoutOrderSummary: React.FC<CheckoutOrderSummaryProps> = ({
  cart,
  allProducts,
  giftWrap,
  subtotal,
  shipping,
  discount,
  total,
  promoInput,
  setPromoInput,
  onApplyPromo,
}) => {
  return (
    <div className="bg-white p-10 rounded-[3rem] border border-primary/5 shadow-sm">
      <h2 className="text-3xl font-serif font-bold text-primary mb-10">Votre commande</h2>

      <div className="space-y-6 mb-10 pb-10 border-b border-primary/5 max-h-[500px] overflow-y-auto pr-4">
        {cart.map((item, i) => {
          const name = item.type === 'product' ? item.product?.name : item.pack?.name;
          const image = item.type === 'product' ? item.product?.image : 'https://picsum.photos/seed/pack/200';
          const packProducts = item.type === 'pack' ? item.pack?.products : [];

          return (
            <div key={i} className="space-y-3">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
                  <img src={image} alt={name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <h4 className="font-serif font-bold text-sm text-primary line-clamp-1">{name}</h4>
                  <p className="text-xs text-primary/70">Qté: {item.quantity}</p>
                  {item.type === 'pack' && (
                    <div className="flex flex-col gap-1 mt-1">
                      <span className="text-[8px] font-bold text-accent uppercase tracking-widest">Pack Créatif</span>
                      <span className="text-[8px] font-bold text-primary/70 uppercase tracking-widest flex items-center gap-1">
                        <Package size={8} /> Carton scellé
                      </span>
                    </div>
                  )}
                </div>
                <p className="font-bold text-sm text-primary">{(item.price * item.quantity).toLocaleString()} FCFA</p>
              </div>

              {item.type === 'pack' && packProducts && packProducts.length > 0 && (
                <div className="ml-20 space-y-1.5 pt-2 border-t border-primary/5">
                  <p className="text-[9px] font-bold text-primary/70 uppercase tracking-widest mb-1">Contenu :</p>
                  {packProducts.map((p, idx) => {
                    const productDetail = allProducts.find((prod) => prod.id === p.productId);
                    return (
                      <div key={idx} className="flex justify-between items-center text-[10px]">
                        <span className="text-primary/70 font-medium">• {productDetail?.name || 'Produit inconnu'}</span>
                        <span className="text-primary/70">x{p.quantity || 1}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Promo Code */}
      {setPromoInput && onApplyPromo && (
        <div className="mb-10">
          <label className="text-[10px] font-bold tracking-widest text-primary/70 uppercase mb-2 block">Code Promo</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ex: LAINE10"
              value={promoInput || ''}
              onChange={(e) => setPromoInput(e.target.value)}
              className="flex-grow px-5 py-3 bg-secondary rounded-2xl border border-transparent focus:border-accent/30 focus:outline-none transition-all text-sm font-medium"
            />
            <Button
              onClick={onApplyPromo}
              variant="secondary"
              className="px-6 py-3 rounded-2xl text-xs font-bold whitespace-nowrap h-auto"
            >
              Appliquer
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-10 pb-10 border-b border-primary/5">
        <div className="flex justify-between text-primary/70 font-medium">
          <span>Sous-total articles</span>
          <span>{subtotal.toLocaleString()} FCFA</span>
        </div>
        {giftWrap.enabled && (
          <div className="flex justify-between text-amber-900 font-medium bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 text-xs">
            <span className="flex items-center gap-1.5 font-bold">
              <Gift size={13} className="text-amber-700 shrink-0" />
              Coffret Kraft + Carte Calligraphiée
            </span>
            <span className="font-bold">+{(giftWrap.fee || 2000).toLocaleString()} FCFA</span>
          </div>
        )}
        <div className="flex justify-between text-primary/70 font-medium">
          <span>Livraison</span>
          <span>{shipping === 0 ? 'Offerte' : `${shipping.toLocaleString()} FCFA`}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-accent font-bold">
            <span>Réduction</span>
            <span>-{discount.toLocaleString()} FCFA</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-end mb-10">
        <span className="text-2xl font-serif font-bold text-primary">Total</span>
        <span className="text-3xl font-serif font-bold text-primary">{total.toLocaleString()} FCFA</span>
      </div>

      <div className="space-y-4 pt-4 border-t border-primary/5">
        <div className="flex items-center gap-3 text-xs font-medium text-[#5c5e46]">
          <div className="w-5 h-5 rounded-full bg-[#5c5e46]/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          Paiement 100% sécurisé
        </div>
        <div className="flex items-center gap-3 text-xs font-medium text-primary/70">
          <Truck size={16} />
          Livraison effectuée par nos soins
        </div>
      </div>
    </div>
  );
};
