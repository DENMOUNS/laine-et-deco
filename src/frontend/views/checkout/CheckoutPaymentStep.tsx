import React from 'react';
import { motion } from 'motion/react';
import { Truck, CreditCard, ShoppingBag } from 'lucide-react';

export interface CheckoutPaymentStepProps {
  formData: {
    paymentMethod: string;
    couponCode: string;
    [key: string]: any;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleApplyCoupon: () => void;
  onBack: () => void;
  onNext: () => void;
}

export const CheckoutPaymentStep: React.FC<CheckoutPaymentStepProps> = ({
  formData,
  setFormData,
  handleApplyCoupon,
  onBack,
  onNext,
}) => {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-10"
    >
      <h2 className="text-4xl font-serif text-primary">Mode de paiement</h2>
      <div className="space-y-4">
        {[
          {
            id: 'delivery',
            label: 'Paiement à la livraison',
            icon: Truck,
            disabled: false,
            description: 'Payez en espèces lors de la réception de votre colis.',
          },
          {
            id: 'mobile',
            label: 'Mobile Money',
            icon: CreditCard,
            disabled: true,
            description: 'Bientôt disponible (Orange Money, MTN MoMo)',
          },
          {
            id: 'card',
            label: 'Carte Bancaire',
            icon: CreditCard,
            disabled: true,
            description: 'Bientôt disponible',
          },
        ].map((method) => (
          <label
            key={method.id}
            className={`flex items-center p-6 rounded-[2.5rem] cursor-pointer transition-all border ${
              formData.paymentMethod === method.id
                ? 'bg-accent/5 border-accent shadow-sm'
                : 'bg-white border-primary/5 hover:border-primary/20'
            } ${method.disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
          >
            <input
              type="radio"
              name="payment"
              value={method.id}
              checked={formData.paymentMethod === method.id}
              onChange={() => !method.disabled && setFormData({ ...formData, paymentMethod: method.id })}
              className="hidden"
              disabled={method.disabled}
            />
            <div
              className={`w-6 h-6 rounded-full border-2 mr-6 flex items-center justify-center ${
                formData.paymentMethod === method.id ? 'border-accent' : 'border-primary/20'
              }`}
            >
              {formData.paymentMethod === method.id && <div className="w-3 h-3 rounded-full bg-accent" />}
            </div>
            <div className="flex-grow">
              <h4 className="font-serif font-bold text-primary">{method.label}</h4>
              <p className="text-xs text-primary/70">{method.description}</p>
            </div>
            <method.icon className={formData.paymentMethod === method.id ? 'text-accent' : 'text-primary/70'} />
          </label>
        ))}
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingBag className="text-accent" size={20} />
          <span className="font-serif font-bold text-lg">Code coupon</span>
        </div>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Code coupon"
            value={formData.couponCode}
            onChange={(e) => setFormData({ ...formData, couponCode: e.target.value })}
            className="flex-grow px-6 py-4 bg-secondary rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium text-sm"
          />
          <button
            onClick={handleApplyCoupon}
            className="bg-[#5c5e46] text-white px-10 py-4 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg text-sm"
          >
            Appliquer
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        <button
          onClick={onBack}
          className="flex-grow bg-white text-primary border border-primary/10 py-6 rounded-[2rem] font-bold hover:bg-primary/5 transition-all text-lg"
        >
          Retour
        </button>
        <button
          onClick={onNext}
          className="flex-grow bg-[#5c5e46] text-white py-6 rounded-[2rem] font-bold hover:opacity-90 transition-all shadow-xl shadow-[#5c5e46]/20 text-lg"
        >
          Définir la commande
        </button>
      </div>
    </motion.div>
  );
};
