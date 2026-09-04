import React from 'react';
import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';
import { City, ShippingRule } from '../../../types';
import { GiftWrapSection } from '../../components/GiftWrapSection';

export interface CheckoutDeliveryStepProps {
  formData: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    phone: string;
    coordinates: string;
    paymentMethod: string;
    couponCode: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  allCities: City[];
  shippingRules: ShippingRule[];
  isGeoEnabled: boolean;
  handleGeoToggle: (enable: boolean) => void;
  giftWrap: any;
  setGiftWrap: (wrap: any) => void;
  onNext: () => void;
}

export const CheckoutDeliveryStep: React.FC<CheckoutDeliveryStepProps> = ({
  formData,
  setFormData,
  allCities,
  shippingRules,
  isGeoEnabled,
  handleGeoToggle,
  giftWrap,
  setGiftWrap,
  onNext,
}) => {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-10"
    >
      <h2 className="text-4xl font-serif text-primary">Informations de livraison</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-widest text-primary/70 uppercase">Prénom</label>
          <input
            type="text"
            placeholder="Jean"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-full px-6 py-4 rounded-2xl bg-white border border-primary/10 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-widest text-primary/70 uppercase">Nom</label>
          <input
            type="text"
            placeholder="Dupont"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-full px-6 py-4 rounded-2xl bg-white border border-primary/10 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-bold tracking-widest text-primary/70 uppercase">Nom du quartier</label>
          <input
            type="text"
            placeholder="Ex: Deido, Bonamoussadi"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-6 py-4 rounded-2xl bg-white border border-primary/10 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-widest text-primary/70 uppercase">Ville</label>
          <div className="relative">
            <select
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-6 py-4 rounded-2xl bg-white border border-primary/10 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium appearance-none"
            >
              <option value="" disabled>
                Sélectionnez votre ville
              </option>
              {allCities
                .filter((c) => c.status === 'active')
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name} ({city.deliveryPrice.toLocaleString()} FCFA)
                  </option>
                ))}
              {allCities.length === 0 &&
                shippingRules
                  .filter((r) => r.status === 'active' && r.type === 'zone')
                  .map((zone) => (
                    <option key={zone.id} value={zone.condition}>
                      {zone.condition}
                    </option>
                  ))}
            </select>
            <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none text-primary/70">
              <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M1 1.5L6 6.5L11 1.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold tracking-widest text-primary/70 uppercase">Téléphone</label>
          <input
            type="tel"
            placeholder="6xx xxx xxx"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-6 py-4 rounded-2xl bg-white border border-primary/10 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-bold tracking-widest text-primary/70 uppercase">Coordonnées GPS</label>
          <input
            type="text"
            readOnly
            placeholder="Position non définie"
            value={formData.coordinates}
            className="w-full px-6 py-4 rounded-2xl bg-primary/5 border border-primary/10 text-primary/70 cursor-not-allowed font-mono text-xs"
          />
        </div>
      </div>

      <div className="bg-primary/5 p-8 rounded-[2.5rem] flex items-center justify-between border border-primary/10">
        <div className="flex gap-4 items-center">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm text-primary/70">
            <MapPin size={24} />
          </div>
          <div>
            <h4 className="font-serif font-bold text-primary">Géolocalisation pour la livraison</h4>
            <p className="text-sm text-primary/70">Partagez votre position pour une livraison plus précise</p>
          </div>
        </div>
        <button
          onClick={() => handleGeoToggle(!isGeoEnabled)}
          className={`w-14 h-8 rounded-full transition-colors relative ${isGeoEnabled ? 'bg-accent' : 'bg-primary/10'}`}
        >
          <motion.div
            animate={{ x: isGeoEnabled ? 28 : 4 }}
            initial={false}
            className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
          />
        </button>
      </div>

      {/* Gift Wrap & Message Option in Checkout */}
      <div className="pt-2">
        <GiftWrapSection giftWrap={giftWrap} onChange={setGiftWrap} />
      </div>

      <button
        onClick={onNext}
        className="w-full bg-[#5c5e46] text-white py-6 rounded-[2rem] font-bold hover:opacity-90 transition-all shadow-xl shadow-[#5c5e46]/20 text-lg"
      >
        Continuer vers le paiement
      </button>
    </motion.div>
  );
};
