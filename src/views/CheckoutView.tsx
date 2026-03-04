import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CreditCard, Truck, ShieldCheck, CheckCircle2, Smartphone, MapPin, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { toast } from 'sonner';
import { Loader } from '../components/Loader';

interface CheckoutViewProps {
  cart: { product: Product; quantity: number }[];
  onNavigate: (view: string) => void;
  onComplete: () => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ cart, onNavigate, onComplete }) => {
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [useLocation, setUseLocation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 50000 ? 0 : 5000;
  const total = subtotal + shipping;

  const handleConfirmOrder = () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setStep(3);
      onComplete();
      toast.success('Commande confirmée avec succès !', {
        description: 'Votre commande est en cours de préparation.',
        duration: 5000,
      });
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {isProcessing && <Loader fullScreen text="Traitement de votre commande..." />}
      <button 
        onClick={() => onNavigate('cart')}
        className="flex items-center gap-2 text-primary/40 hover:text-primary font-bold text-xs uppercase tracking-widest mb-12 transition-colors"
      >
        <ArrowLeft size={16} /> Retour au panier
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-12">
          {/* Steps Indicator */}
          <div className="flex justify-between relative mb-16 px-2">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-primary/5 -translate-y-1/2 z-0 rounded-full" />
            <motion.div 
              initial={{ width: '0%' }}
              animate={{ width: `${((step - 1) / 2) * 100}%` }}
              className="absolute top-1/2 left-0 h-1 bg-accent -translate-y-1/2 z-0 rounded-full transition-all duration-500"
            />
            {[1, 2, 3].map((s) => (
              <div key={s} className="relative z-10 flex flex-col items-center gap-3">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
                  step >= s ? 'bg-accent text-white shadow-lg shadow-accent/20 scale-110' : 'bg-white border-2 border-primary/10 text-primary/30'
                }`}>
                  {step > s ? <CheckCircle2 size={20} className="sm:w-6 sm:h-6" /> : s}
                </div>
                <span className={`text-[8px] sm:text-[10px] uppercase tracking-widest font-bold transition-colors duration-500 ${step >= s ? 'text-primary' : 'text-primary/30'}`}>
                  {s === 1 && 'Livraison'}
                  {s === 2 && 'Paiement'}
                  {s === 3 && 'Confirmation'}
                </span>
              </div>
            ))}
          </div>

          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <h2 className="text-3xl font-serif">Informations de livraison</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/40">Prénom</label>
                  <input type="text" className="w-full px-6 py-4 bg-white border border-primary/10 rounded-2xl focus:outline-none focus:border-accent" placeholder="Jean" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/40">Nom</label>
                  <input type="text" className="w-full px-6 py-4 bg-white border border-primary/10 rounded-2xl focus:outline-none focus:border-accent" placeholder="Dupont" />
                </div>
                <div className="col-span-1 sm:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/40">Adresse</label>
                  <input type="text" className="w-full px-6 py-4 bg-white border border-primary/10 rounded-2xl focus:outline-none focus:border-accent" placeholder="123 Rue de la Laine" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/40">Code Postal</label>
                  <input type="text" className="w-full px-6 py-4 bg-white border border-primary/10 rounded-2xl focus:outline-none focus:border-accent" placeholder="75000" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/40">Ville</label>
                  <input type="text" className="w-full px-6 py-4 bg-white border border-primary/10 rounded-2xl focus:outline-none focus:border-accent" placeholder="Paris" />
                </div>
                <div className="col-span-1 sm:col-span-2 p-6 bg-slate-50 rounded-2xl border border-primary/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-xl text-primary shadow-sm">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Géolocalisation pour la livraison</p>
                        <p className="text-xs text-primary/40">Partagez votre position pour une livraison plus précise</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        if (!useLocation) {
                          setIsLocating(true);
                          navigator.geolocation.getCurrentPosition(
                            (pos) => {
                              setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                              setIsLocating(false);
                              setUseLocation(true);
                            },
                            (err) => {
                              console.error(err);
                              setIsLocating(false);
                              alert("Impossible d'obtenir votre position. Veuillez vérifier vos permissions.");
                            }
                          );
                        } else {
                          setUseLocation(false);
                          setLocation(null);
                        }
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${useLocation ? 'bg-accent' : 'bg-slate-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${useLocation ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  
                  {isLocating && (
                    <div className="flex items-center gap-2 text-xs text-primary/60 animate-pulse">
                      <Loader2 size={14} className="animate-spin" />
                      Récupération de votre position...
                    </div>
                  )}

                  {location && useLocation && (
                    <div className="text-[10px] font-mono text-green-600 bg-green-50 p-2 rounded-lg border border-green-100">
                      Position enregistrée : {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setStep(2)}
                className="w-full bg-primary text-white py-5 rounded-2xl font-bold hover:bg-accent transition-all duration-300"
              >
                Continuer vers le paiement
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <h2 className="text-3xl font-serif">Méthode de paiement</h2>
              <div className="space-y-4">
                <div className="p-6 border-2 border-accent rounded-2xl flex items-center gap-4 bg-accent/5">
                  <Truck className="text-accent" />
                  <div className="flex-grow">
                    <p className="font-bold">Paiement à la livraison</p>
                    <p className="text-xs text-primary/60">Payez en espèces dès réception de votre colis</p>
                  </div>
                  <CheckCircle2 className="text-accent" />
                </div>
                
                <div className="p-6 border border-primary/10 rounded-2xl flex items-center gap-4 opacity-50 cursor-not-allowed bg-slate-50">
                  <CreditCard className="text-primary/40" />
                  <div className="flex-grow">
                    <p className="font-bold text-primary/40">Carte de crédit</p>
                    <p className="text-xs text-primary/30">Bientôt disponible</p>
                  </div>
                </div>

                <div className="p-6 border border-primary/10 rounded-2xl flex items-center gap-4 opacity-50 cursor-not-allowed bg-slate-50">
                  <Smartphone className="text-primary/40" />
                  <div className="flex-grow">
                    <p className="font-bold text-primary/40">Mobile Money (Orange/MTN)</p>
                    <p className="text-xs text-primary/30">Bientôt disponible</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleConfirmOrder}
                className="w-full bg-primary text-white py-5 rounded-2xl font-bold hover:bg-accent transition-all duration-300"
              >
                Confirmer la commande ({total.toLocaleString()} FCFA)
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 space-y-6">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-4xl font-serif">Commande Confirmée !</h2>
              <p className="text-primary/60 max-w-md mx-auto">Merci pour votre achat. Vous recevrez un email de confirmation d'ici quelques minutes.</p>
              <div className="pt-8">
                <button 
                  onClick={() => onNavigate('home')}
                  className="bg-primary text-white px-10 py-4 rounded-full font-bold hover:bg-accent transition-all"
                >
                  Retour à l'accueil
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-primary/5 sticky top-32">
            <h2 className="text-2xl font-serif mb-8">Votre commande</h2>
            <div className="space-y-6 mb-8 max-h-64 overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={item.product.id} className="flex gap-4">
                  <img src={item.product.image} alt={item.product.name} className="w-12 h-16 object-cover rounded-lg" referrerPolicy="no-referrer" />
                  <div className="flex-grow">
                    <h4 className="text-sm font-medium line-clamp-1">{item.product.name}</h4>
                    <p className="text-xs text-primary/40">Qté: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold">{(item.product.price * item.quantity).toLocaleString()} FCFA</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 text-sm border-t border-primary/5 pt-6">
              <div className="flex justify-between text-primary/60">
                <span>Sous-total</span>
                <span className="text-primary font-medium">{subtotal.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-primary/60">
                <span>Livraison</span>
                <span className="text-primary font-medium">{shipping === 0 ? 'Gratuite' : `${shipping.toLocaleString()} FCFA`}</span>
              </div>
              <div className="flex justify-between text-lg font-serif pt-4 border-t border-primary/5 mt-4">
                <span>Total</span>
                <span className="text-primary font-bold">{total.toLocaleString()} FCFA</span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-xs text-primary/60">
                <ShieldCheck size={16} className="text-green-500" />
                Paiement 100% sécurisé
              </div>
              <div className="flex items-center gap-3 text-xs text-primary/60">
                <Truck size={16} className="text-primary/40" />
                Livraison suivie par Colissimo
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
