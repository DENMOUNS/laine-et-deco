import React, { useState, useMemo, useEffect } from 'react';
import { CartItem, Product, ShippingRule, City } from '../../types';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';
import { MapPin, CreditCard, ShoppingBag, Truck, Package, Lock, Phone, CheckCircle } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { collection, serverTimestamp, query, where, getDocs, updateDoc, doc, increment, setDoc, getDoc, limit } from 'firebase/firestore';
import { auth, db } from '../../backend/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { useEntity } from '../hooks/useEntity';
import { useStaticEntity } from '../hooks/useStaticEntity';


interface CheckoutViewProps {
  cart: CartItem[];
  user: FirebaseUser | null;
  onNavigate: (view: string, id?: string, query?: string) => void;
  onComplete: () => void;
  allProducts: Product[];
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ cart, user, onNavigate, onComplete, allProducts }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '', 
    address: '', 
    city: '',
    phone: '', 
    coordinates: '',
    paymentMethod: 'delivery', 
    couponCode: '' 
  });
  const [isGeoEnabled, setIsGeoEnabled] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: shippingRules } = useStaticEntity<ShippingRule>('shipping_rule');
  const { data: allCoupons } = useEntity<any>('coupon');
  const { data: allCities } = useStaticEntity<City>('city');

  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Check for referral discount if it's the first order
  useEffect(() => {
    const referralCode = sessionStorage.getItem('referralCode');
    if (referralCode && user && discount === 0 && !appliedCoupon) {
      // 5% discount for referred users
      setDiscount(subtotal * 0.05);
      toast.success('Réduction de parrainage (-5%) appliquée !');
    }
  }, [user, subtotal, discount, appliedCoupon]);
  
  const shipping = useMemo(() => {
    if (appliedCoupon?.freeShipping || appliedCoupon?.type === 'free_shipping') {
      return 0;
    }

    const activeRules = Array.isArray(shippingRules)
      ? shippingRules.filter(r => r.status === 'active')
      : [];
    
    // 1. Check threshold rules first (e.g., Free shipping over 200000)
    for (const rule of activeRules.filter(r => r.type === 'threshold')) {
      if (rule.condition && rule.condition.includes('Total >')) {
        const threshold = parseInt(rule.condition.replace(/[^\d]/g, ''), 10);
        if (subtotal > threshold) {
          return rule.price;
        }
      }
    }

    // 2. Check specific city delivery price (from Cities module)
    if (formData.city) {
      const selectedCity = allCities.find(c => c.name === formData.city || c.slug === formData.city);
      if (selectedCity && selectedCity.status === 'active') {
        return selectedCity.deliveryPrice;
      }

      // 3. Fallback to zone rules matching selected city
      const zoneRule = activeRules.find(r => r.type === 'zone' && r.condition && r.condition.toLowerCase() === formData.city.toLowerCase());
      if (zoneRule) {
        return zoneRule.price;
      }
    }

    // 4. Apply 'default' rule if one exists
    const defaultRule = activeRules.find(r => r.type === 'default' || r.condition === 'default');
    if (defaultRule) {
      return defaultRule.price;
    }
    
    return 0; // No matching rule
  }, [subtotal, formData.city, shippingRules, allCities, appliedCoupon]);

  const total = subtotal + shipping - discount;

  const handleApplyCoupon = () => {
    const coupon = allCoupons.find((c: any) => c.code === formData.couponCode && c.status === 'active');
    
    if (!coupon) {
      toast.error('Coupon invalide ou expiré.');
      return;
    }

    // Check user restriction
    if (coupon.restrictedToUserId && coupon.restrictedToUserId !== user?.uid) {
      toast.error('Ce coupon est personnel.');
      return;
    }

    // Check usage limit
    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
      toast.error('Usage maximum atteint.');
      return;
    }

    // Apply discount
    if (coupon.type === 'percentage') {
      setDiscount(subtotal * (coupon.discount / 100));
    } else if (coupon.type === 'fixed') {
      setDiscount(coupon.discount);
    } else if (coupon.type === 'free_shipping') {
      setDiscount(0);
    }
    
    setAppliedCoupon(coupon);
    toast.success('Coupon appliqué !');
  };

  const handleGeoToggle = (enabled: boolean) => {
    setIsGeoEnabled(enabled);
    if (enabled && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({ 
            ...prev, 
            coordinates: `${position.coords.latitude}, ${position.coords.longitude}`
          }));
          toast.success('Position récupérée avec succès !');
        },
        () => {
          toast.error('Impossible de récupérer votre position.');
          setIsGeoEnabled(false);
        }
      );
    } else {
      setFormData(prev => ({ ...prev, coordinates: '' }));
    }
  };

  const buildOrderInvoiceData = async (orderBase: any) => {
    const safeGetConfig = async (collectionName: string, id: string) => {
      try {
        if (collectionName === 'site_logo') {
          const activeQuery = query(collection(db, collectionName), where('status', '==', 'active'), limit(1));
          const activeSnap = await getDocs(activeQuery);
          if (!activeSnap.empty) return activeSnap.docs[0].data();
          return {};
        }
        // Try by document ID first
        const directSnap = await getDoc(doc(db, collectionName, id));
        if (directSnap.exists()) return directSnap.data();
        // Fallback: query by 'id' field (legacy seed data pattern)
        const legacyQuery = query(collection(db, collectionName), where('id', '==', id), limit(1));
        const legacySnap = await getDocs(legacyQuery);
        if (!legacySnap.empty) return legacySnap.docs[0].data();
      } catch (e) {
        console.warn(`[invoiceData] Unable to snapshot ${collectionName}/${id}:`, e);
      }
      return {};
    };

    // Use allSettled so a missing config never blocks order creation
    const [invoiceResult, colorResult, logoResult] = await Promise.allSettled([
      safeGetConfig('invoice_config', 'global'),
      safeGetConfig('site_color', 'default-color'),
      safeGetConfig('site_logo', 'active-logo'),
    ]);

    const invoiceConfig = invoiceResult.status === 'fulfilled' ? invoiceResult.value : {};
    const colorConfig   = colorResult.status   === 'fulfilled' ? colorResult.value   : {};
    const logoConfig    = logoResult.status    === 'fulfilled' ? logoResult.value    : {};

    return {
      version: 2,
      copiedAt: new Date().toISOString(),
      orderId: orderBase.id,
      customerName: orderBase.customerName || orderBase.customer || 'Client',
      address: orderBase.address || '',
      phone: orderBase.phone || '',
      paymentMethod: orderBase.paymentMethod || '',
      items: orderBase.orderDetails || [],
      subtotal,
      shippingFee: shipping,
      discount,
      total: orderBase.total,
      // Self-contained config snapshot — used by invoiceUtils to skip network reads
      config: {
        companyName: logoConfig.name || invoiceConfig.companyName || 'Laine & Déco',
        logo: logoConfig.image || logoConfig.lien || '',
        phone: invoiceConfig.phone || '',
        email: invoiceConfig.email || '',
        paymentPhone: invoiceConfig.paymentPhone || '',
        paymentName: invoiceConfig.paymentName || '',
        address: invoiceConfig.address || '',
        message1: invoiceConfig.message1 || '',
        message2: invoiceConfig.message2 || '',
        footerMessage: invoiceConfig.footerMessage || 'Merci pour votre confiance !',
        taxId: invoiceConfig.taxId || '',
      },
      primaryColor: colorConfig.primaryColor || '#2c3e35',
    };
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Veuillez vous connecter pour passer commande.');
      onNavigate('auth');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Session utilisateur expirée');
      const checkoutResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'same-origin',
        body: JSON.stringify({
          items: cart.map((item) => ({
            id: item.id,
            productId: item.type === 'product' ? item.product?.id : item.id,
            type: item.type,
            quantity: item.quantity,
            name: item.type === 'product' ? item.product?.name : item.pack?.name,
            components: item.type === 'pack' ? item.pack?.products : undefined,
            configuration: item.configuration,
          })),
          customer: `${formData.firstName} ${formData.lastName}`,
          customerName: `${formData.firstName} ${formData.lastName}`,
          address: `${formData.address}, ${formData.city}`,
          phone: formData.phone,
          coordinates: formData.coordinates,
          paymentMethod: formData.paymentMethod,
          discount,
          shippingFee: shipping,
        }),
      });
      const checkoutBody = await checkoutResponse.json().catch(() => null);
      if (!checkoutResponse.ok) throw new Error(checkoutBody?.error || 'Impossible de réserver le stock');
      
      // Update coupon usage
      if (appliedCoupon) {
        const couponRef = doc(db, 'coupon', appliedCoupon.id);
        await updateDoc(couponRef, {
          usageCount: increment(1)
        });
      }

      // Points awarding (1% of total)
      const pointsEarned = Math.floor(total * 0.01);
      
      // Update current user points - Using direct doc reference with UID
      try {
        const userDocRef = doc(db, 'user', user.uid);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists()) {
          await updateDoc(userDocRef, {
            points: increment(pointsEarned),
            orders: increment(1)
          });
        } else {
          // If the profile doesn't exist yet, create it
          await setDoc(userDocRef, {
            uid: user.uid,
            name: `${formData.firstName} ${formData.lastName}`.trim() || user.displayName || 'Utilisateur',
            email: user.email,
            role: 'customer',
            points: pointsEarned,
            orders: 1,
            joinDate: new Date().toISOString().split('T')[0],
            status: 'active',
            createdAt: serverTimestamp()
          });
        }
      } catch (userErr) {
        console.warn("Failed to update user profile points:", userErr);
      }
      
      toast.success(`Commande validée ! Vous avez gagné ${pointsEarned} points.`);
      onComplete();
      onNavigate('order-success');
    } catch (err) {
      toast.error('Une erreur est survenue lors de la validation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const OrderSummary = () => (
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
                    const productDetail = allProducts.find(prod => prod.id === p.productId);
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
      <div className="mb-10">
        <label className="text-[10px] font-bold tracking-widest text-primary/70 uppercase mb-2 block">Code Promo</label>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Ex: LAINE10" 
            className="flex-grow px-5 py-3 bg-secondary rounded-2xl border border-transparent focus:border-accent/30 focus:outline-none transition-all text-sm font-medium"
          />
          <Button variant="secondary" className="px-6 py-3 rounded-2xl text-xs font-bold whitespace-nowrap h-auto">
            Appliquer
          </Button>
        </div>
      </div>

      <div className="space-y-4 mb-10 pb-10 border-b border-primary/5">
        <div className="flex justify-between text-primary/70 font-medium">
          <span>Sous-total</span>
          <span>{subtotal.toLocaleString()} FCFA</span>
        </div>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Steps Indicator */}
      <div className="max-w-4xl mx-auto mb-20">
        <div className="relative flex justify-between">
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-primary/10 -translate-y-1/2 -z-10" />
          {[
            { id: 1, label: 'LIVRAISON' },
            { id: 2, label: 'PAIEMENT' },
            { id: 3, label: 'CONFIRMATION' }
          ].map((s, i) => (
            <div key={s.id} className="flex flex-col items-center gap-3 bg-[#f8f5f0] px-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                s.id === step 
                  ? 'bg-accent text-white scale-110 shadow-lg shadow-accent/20' 
                  : s.id < step 
                    ? 'bg-[#5c5e46] text-white' 
                    : 'bg-white border border-primary/10 text-primary/70'
              }`}>
                {s.id}
              </div>
              <span className={`text-[10px] font-bold tracking-[0.2em] transition-colors ${
                s.id === step ? 'text-accent' : 'text-primary/70'
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        <div className="flex-grow">
          <AnimatePresence mode="wait">
            {step === 1 && (
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
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                      className="w-full px-6 py-4 rounded-2xl bg-white border border-primary/10 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-primary/70 uppercase">Nom</label>
                    <input 
                      type="text" 
                      placeholder="Dupont" 
                      value={formData.lastName} 
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                      className="w-full px-6 py-4 rounded-2xl bg-white border border-primary/10 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium" 
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-primary/70 uppercase">Nom du quartier</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Deido, Bonamoussadi" 
                      value={formData.address} 
                      onChange={(e) => setFormData({...formData, address: e.target.value})} 
                      className="w-full px-6 py-4 rounded-2xl bg-white border border-primary/10 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-primary/70 uppercase">Ville</label>
                    <div className="relative">
                      <select 
                        value={formData.city} 
                        onChange={(e) => setFormData({...formData, city: e.target.value})} 
                        className="w-full px-6 py-4 rounded-2xl bg-white border border-primary/10 focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all font-medium appearance-none" 
                      >
                        <option value="" disabled>Sélectionnez votre ville</option>
                        {allCities.filter(c => c.status === 'active').sort((a, b) => a.name.localeCompare(b.name)).map(city => (
                          <option key={city.id} value={city.name}>{city.name} ({city.deliveryPrice.toLocaleString()} FCFA)</option>
                        ))}
                        {/* Fallback to INITIAL_SHIPPING_RULES zones if no cities found */}
                        {allCities.length === 0 && shippingRules.filter(r => r.status === 'active' && r.type === 'zone').map(zone => (
                          <option key={zone.id} value={zone.condition}>{zone.condition}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none text-primary/70">
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-widest text-primary/70 uppercase">Téléphone</label>
                    <input 
                      type="tel" 
                      placeholder="6xx xxx xxx" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({...formData, phone: e.target.value})} 
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

                <button 
                  onClick={() => {
                    setStep(2);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full bg-[#5c5e46] text-white py-6 rounded-[2rem] font-bold hover:opacity-90 transition-all shadow-xl shadow-[#5c5e46]/20 text-lg"
                >
                  Continuer vers le paiement
                </button>
              </motion.div>
            )}

            {step === 2 && (
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
                    { id: 'delivery', label: 'Paiement à la livraison', icon: Truck, disabled: false, description: 'Payez en espèces lors de la réception de votre colis.' },
                    { id: 'mobile', label: 'Mobile Money', icon: CreditCard, disabled: true, description: 'Bientôt disponible (Orange Money, MTN MoMo)' },
                    { id: 'card', label: 'Carte Bancaire', icon: CreditCard, disabled: true, description: 'Bientôt disponible' },
                  ].map(method => (
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
                        onChange={() => !method.disabled && setFormData({...formData, paymentMethod: method.id})} 
                        className="hidden" 
                        disabled={method.disabled} 
                      />
                      <div className={`w-6 h-6 rounded-full border-2 mr-6 flex items-center justify-center ${
                        formData.paymentMethod === method.id ? 'border-accent' : 'border-primary/20'
                      }`}>
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
                      onChange={(e) => setFormData({...formData, couponCode: e.target.value})} 
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
                    onClick={() => {
                      setStep(1);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-grow bg-white text-primary border border-primary/10 py-6 rounded-[2rem] font-bold hover:bg-primary/5 transition-all text-lg"
                  >
                    Retour
                  </button>
                  <button 
                    onClick={() => {
                      setStep(3);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-grow bg-[#5c5e46] text-white py-6 rounded-[2rem] font-bold hover:opacity-90 transition-all shadow-xl shadow-[#5c5e46]/20 text-lg"
                  >
                    Définir la commande
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
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
                        Vous devez être connecté pour finaliser votre commande. 
                        Vos informations de livraison sont conservées pendant que vous vous connectez.
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
                            <p className="font-serif text-base font-bold text-primary">{formData.firstName} {formData.lastName}</p>
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

                      {/* Votre commande summary card */}
                      <div className="bg-[#FDFBF7] p-6 rounded-[2.5rem] border border-accent/20 space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-accent">Détails financiers</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between text-primary/80">
                            <span>Sous-total ({cart.reduce((a, c) => a + c.quantity, 0)} articles)</span>
                            <span className="font-medium">{subtotal.toLocaleString()} FCFA</span>
                          </div>
                          <div className="flex justify-between text-primary/80">
                            <span>Frais de livraison</span>
                            <span className="font-medium">{shipping === 0 ? 'Gratuit' : `${shipping.toLocaleString()} FCFA`}</span>
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
                    onClick={() => {
                      setStep(2);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-grow bg-white text-primary border border-primary/10 py-6 rounded-[2rem] font-bold hover:bg-primary/5 transition-all text-lg"
                  >
                    Retour
                  </button>
                  <button 
                    onClick={handleSubmit} 
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
            )}
          </AnimatePresence>
        </div>

        <div className="w-full lg:w-[400px]">
          <div className="sticky top-24">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
};
