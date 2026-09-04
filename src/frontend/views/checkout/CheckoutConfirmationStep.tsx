import React from 'react';
import { motion } from 'motion/react';
import { User as FirebaseUser } from 'firebase/auth';
import { Lock, Package, MapPin, Phone, Truck, Gift } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { CartItem } from '../../../types';

export interface CheckoutConfirmationStepProps {
  user: FirebaseUser | null;
  formData: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    phone: string;
    coordinates: string;
    paymentMethod: string;
    [key: string]: any;
  };
  giftWrap: any;
  cart: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  onNavigate: (view: string, id?: string, query?: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const CheckoutConfirmationStep: React.FC<CheckoutConfirmationStepProps> = ({
  user,
  formData,
  giftWrap,
  cart,
  subtotal,
  shipping,
  discount,
  total,
  onNavigate,
  onBack,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-10"
    >
      <h2 className="text-4xl font-serif text-primary">Confirmation finale</h2>
      {!user ? (
        <div className="bg-white p-12 rounded-[3rem] border border-accent/20 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-accent">
            <Lock size={32} />
          </div>
          <div className="space-y-4">
            <h4 className="text-2xl font-serif font-bold text-primary">Connexion requise</h4>
            <p className="text-primary/70 max-w-sm mx-auto">
              Vous devez être connecté pour finaliser votre commande. Vos informations de livraison sont
              conservées pendant que vous vous connectez.
            </p>
          </div>
          <Button
            onClick={() => {
              sessionStorage.setItem('returnToCheckout', 'true');
              onNavigate('auth');
            }}
            variant="primary"
            className="px-10 py-4 rounded-2xl w-full max-w-xs font-serif text-lg"
          >
            Se connecter / S'inscrire
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-primary/10 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent to-[#5c5e46]" />
          <div className="p-8 sm:p-10 space-y-8">
            <div className="flex items-center gap-4 border-b border-primary/10 pb-6">
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                <Package size={24} />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-primary">Récapitulatif de votre commande</h3>
                <p className="text-sm text-primary/70">Vérifiez vos informations et le total avant de valider.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3 bg-[#FDFBF7] p-6 rounded-[2rem] border border-primary/5">
                <h4 className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-primary/70 uppercase">
                  <MapPin size={14} className="text-accent" /> Adresse de livraison
                </h4>
                <div>
                  <p className="font-serif text-base font-bold text-primary">
                    {formData.firstName} {formData.lastName}
                  </p>
                  <p className="text-primary/80 text-sm mt-1">{formData.address}</p>
                  <p className="text-primary/80 text-sm">{formData.city}</p>
                  {formData.coordinates && (
                    <p className="text-[10px] text-accent font-mono mt-2 bg-accent/10 px-3 py-1 rounded-lg inline-block border border-accent/20">
                      📍 GPS: {formData.coordinates}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 bg-[#FDFBF7] p-6 rounded-[2rem] border border-primary/5">
                <h4 className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-primary/70 uppercase">
                  <Phone size={14} className="text-accent" /> Contact & Paiement
                </h4>
                <div className="space-y-1">
                  <p className="text-primary/90 text-sm font-medium">Tél: {formData.phone}</p>
                  <p className="text-primary/80 text-sm">{user?.email}</p>
                  <div className="pt-2 mt-2 border-t border-primary/5 flex items-center gap-2">
                    <Truck size={16} className="text-accent" />
                    <span className="text-xs font-bold text-primary">
                      {formData.paymentMethod === 'delivery' ? 'Paiement à la livraison' : 'Paiement en ligne'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gift Wrap Information Card */}
            {giftWrap.enabled && (
              <div className="bg-amber-50/60 p-6 rounded-[2rem] border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-amber-900 uppercase">
                    <Gift size={14} className="text-amber-700" /> Option Coffret Cadeau & Message Calligraphié
                  </h4>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-full">
                    +{(giftWrap.fee || 2000).toLocaleString()} FCFA
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-amber-950/80 pt-1">
                  <div>
                    <span className="text-amber-900/60 font-semibold block text-[10px] uppercase">Destinataire</span>
                    <span className="font-serif font-bold text-sm text-primary">
                      {giftWrap.recipientName || 'Non spécifié'}
                    </span>
                  </div>
                  <div>
                    <span className="text-amber-900/60 font-semibold block text-[10px] uppercase">Expéditeur</span>
                    <span className="font-serif font-bold text-sm text-primary">
                      {giftWrap.senderName || `${formData.firstName} ${formData.lastName}` || 'Non spécifié'}
                    </span>
                  </div>
                </div>

                {giftWrap.message && (
                  <div className="bg-white/80 p-4 rounded-xl border border-amber-200/60 mt-2">
                    <span className="text-[10px] uppercase tracking-wider text-amber-900/60 font-semibold block mb-1">
                      Texte calligraphié sur la carte :
                    </span>
                    <p className="font-serif italic text-primary/90 text-sm leading-relaxed">
                      « {giftWrap.message} »
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Financial summary card */}
            <div className="bg-[#FDFBF7] p-6 rounded-[2.5rem] border border-accent/20 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-accent">Détails financiers</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-primary/80">
                  <span>Sous-total ({cart.reduce((a, c) => a + c.quantity, 0)} articles)</span>
                  <span className="font-medium">{subtotal.toLocaleString()} FCFA</span>
                </div>
                {giftWrap.enabled && (
                  <div className="flex justify-between text-amber-900 font-medium">
                    <span>Coffret cadeau Kraft & Carte</span>
                    <span>+{(giftWrap.fee || 2000).toLocaleString()} FCFA</span>
                  </div>
                )}
                <div className="flex justify-between text-primary/80">
                  <span>Frais de livraison</span>
                  <span className="font-medium">
                    {shipping === 0 ? 'Gratuit' : `${shipping.toLocaleString()} FCFA`}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Réduction</span>
                    <span>-{discount.toLocaleString()} FCFA</span>
                  </div>
                )}
                <div className="pt-3 border-t border-primary/10 flex justify-between items-baseline">
                  <span className="font-serif font-bold text-lg text-primary">Total de la commande</span>
                  <span className="font-serif font-bold text-2xl text-accent">{total.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        <button
          onClick={onBack}
          className="flex-grow bg-white text-primary border border-primary/10 py-6 rounded-[2rem] font-bold hover:bg-primary/5 transition-all text-lg"
        >
          Retour
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting || !user}
          className="flex-grow bg-[#5c5e46] text-white py-6 rounded-[2rem] font-bold hover:opacity-90 transition-all shadow-xl shadow-[#5c5e46]/20 text-lg disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Validation en cours...</span>
            </>
          ) : (
            <span>Valider la commande</span>
          )}
        </button>
      </div>
    </motion.div>
  );
};
