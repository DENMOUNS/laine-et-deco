import React, { useState, useMemo, useEffect } from 'react';
import { CartItem, Product, ShippingRule, City } from '../../types';
import { toast } from 'sonner';
import { User as FirebaseUser } from 'firebase/auth';
import { collection, serverTimestamp, query, where, getDocs, updateDoc, doc, increment, setDoc, getDoc, limit } from 'firebase/firestore';
import { auth, db } from '../../backend/firebase';
import { AnimatePresence } from 'motion/react';
import { useEntity } from '../hooks/useEntity';
import { useStaticEntity } from '../hooks/useStaticEntity';
import { useCartStore } from '../../stores/cartStore';

import { CheckoutStepsIndicator } from './checkout/CheckoutStepsIndicator';
import { CheckoutDeliveryStep } from './checkout/CheckoutDeliveryStep';
import { CheckoutPaymentStep } from './checkout/CheckoutPaymentStep';
import { CheckoutConfirmationStep } from './checkout/CheckoutConfirmationStep';
import { CheckoutOrderSummary } from './checkout/CheckoutOrderSummary';

interface CheckoutViewProps {
  cart: CartItem[];
  user: FirebaseUser | null;
  onNavigate: (view: string, id?: string, query?: string) => void;
  onComplete: () => void;
  allProducts: Product[];
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ cart, user, onNavigate, onComplete, allProducts }) => {
  const [step, setStep] = useState(1);
  const giftWrap = useCartStore((s) => s.giftWrap);
  const setGiftWrap = useCartStore((s) => s.setGiftWrap);
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
  const { data: userProfiles } = useEntity<any>('user', [], {
    constraints: [where('uid', '==', user?.uid || user?.email || 'guest')],
    deps: [user?.uid, user?.email]
  });

  useEffect(() => {
    if (userProfiles && userProfiles.length > 0) {
      const p = userProfiles[0];
      const fullName = p.name || user?.displayName || '';
      const nameParts = fullName.split(' ');
      const firstName = p.firstName || nameParts[0] || '';
      const lastName = p.lastName || nameParts.slice(1).join(' ') || '';

      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || firstName,
        lastName: prev.lastName || lastName,
        address: prev.address || p.address || '',
        city: prev.city || p.city || '',
        phone: prev.phone || p.phone || p.whatsapp || '',
      }));
    } else if (user?.displayName || user?.email) {
      const fullName = user.displayName || '';
      const nameParts = fullName.split(' ');
      setFormData(prev => ({
        ...prev,
        firstName: prev.firstName || nameParts[0] || '',
        lastName: prev.lastName || nameParts.slice(1).join(' ') || '',
        phone: prev.phone || user.phoneNumber || '',
      }));
    }
  }, [userProfiles, user]);

  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const giftFee = giftWrap.enabled ? (giftWrap.fee || 2000) : 0;

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

  const total = subtotal + shipping + giftFee - discount;

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
            productId: item.type === 'product' ? (item.product?.id || item.id) : item.id,
            type: item.type,
            quantity: item.quantity,
            price: item.price,
            name: item.type === 'product' ? item.product?.name : item.pack?.name,
            image: item.type === 'product' ? item.product?.image : undefined,
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
          giftWrap: giftWrap.enabled ? giftWrap : undefined,
          giftFee,
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Steps Indicator */}
      <CheckoutStepsIndicator step={step} />

      <div className="flex flex-col lg:flex-row gap-16">
        <div className="flex-grow">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <CheckoutDeliveryStep
                formData={formData}
                setFormData={setFormData}
                allCities={allCities}
                shippingRules={shippingRules}
                isGeoEnabled={isGeoEnabled}
                handleGeoToggle={handleGeoToggle}
                giftWrap={giftWrap}
                setGiftWrap={setGiftWrap}
                onNext={() => {
                  setStep(2);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {step === 2 && (
              <CheckoutPaymentStep
                formData={formData}
                setFormData={setFormData}
                handleApplyCoupon={handleApplyCoupon}
                onBack={() => {
                  setStep(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNext={() => {
                  setStep(3);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {step === 3 && (
              <CheckoutConfirmationStep
                user={user}
                formData={formData}
                giftWrap={giftWrap}
                cart={cart}
                subtotal={subtotal}
                shipping={shipping}
                discount={discount}
                total={total}
                onNavigate={onNavigate}
                onBack={() => {
                  setStep(2);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="w-full lg:w-[400px]">
          <div className="sticky top-24">
            <CheckoutOrderSummary
              cart={cart}
              allProducts={allProducts}
              giftWrap={giftWrap}
              subtotal={subtotal}
              shipping={shipping}
              discount={discount}
              total={total}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
