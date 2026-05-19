/**
 * Cart Business Logic Service
 * Pure functions — no React, no Firebase, no side effects.
 */

import { CartItem, Product, Pack, ShippingRule, City, Coupon } from '../types';

// ── Price Calculations ──

export const FREE_SHIPPING_THRESHOLD = 200000;

export function calculateSubtotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function calculateShipping(
  subtotal: number,
  city: string,
  shippingRules: ShippingRule[],
  allCities: City[],
  appliedCoupon?: Coupon | null
): number {
  // Free shipping via coupon
  if (appliedCoupon?.freeShipping || appliedCoupon?.type === 'free_shipping') {
    return 0;
  }

  const activeRules = shippingRules.filter((r) => r.status === 'active');

  // Check threshold rules first (e.g., free shipping over 200000)
  for (const rule of activeRules.filter((r) => r.type === 'threshold')) {
    if (rule.condition && rule.condition.includes('Total >')) {
      const threshold = parseInt(rule.condition.replace(/[^\d]/g, ''), 10);
      if (subtotal > threshold) {
        return rule.price;
      }
    }
  }

  // Check specific city delivery price
  if (city) {
    const selectedCity = allCities.find(
      (c) => c.name === city || c.slug === city
    );
    if (selectedCity && selectedCity.status === 'active') {
      return selectedCity.deliveryPrice;
    }

    // Fallback to zone rules matching selected city
    const zoneRule = activeRules.find(
      (r) =>
        r.type === 'zone' &&
        r.condition &&
        r.condition.toLowerCase() === city.toLowerCase()
    );
    if (zoneRule) {
      return zoneRule.price;
    }
  }

  return 0;
}

export function calculateTotal(
  subtotal: number,
  shipping: number,
  discount: number
): number {
  return subtotal + shipping - discount;
}

export function calculateFreeShippingProgress(subtotal: number): number {
  return Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
}

export function calculateAmountToFreeShipping(subtotal: number): number {
  return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
}

export function isFreeShipping(subtotal: number): boolean {
  return subtotal >= FREE_SHIPPING_THRESHOLD;
}

// ── Coupon Validation ──

export interface CouponValidationResult {
  valid: boolean;
  discount: number;
  error?: string;
  coupon?: Coupon;
}

export function validateAndApplyCoupon(
  code: string,
  allCoupons: Coupon[],
  subtotal: number,
  userId?: string
): CouponValidationResult {
  const coupon = allCoupons.find(
    (c) => c.code === code && c.status === 'active'
  );

  if (!coupon) {
    return { valid: false, discount: 0, error: 'Coupon invalide ou expiré.' };
  }

  // Check user restriction
  if (coupon.restrictedToUserId && coupon.restrictedToUserId !== userId) {
    return { valid: false, discount: 0, error: 'Ce coupon est personnel.' };
  }

  // Check usage limit
  if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, discount: 0, error: 'Usage maximum atteint.' };
  }

  // Calculate discount
  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = subtotal * (coupon.discount / 100);
  } else if (coupon.type === 'fixed') {
    discount = coupon.discount;
  }
  // free_shipping type: discount stays 0, but shipping becomes free

  return { valid: true, discount, coupon };
}

// ── Pack Price ──

export function calculatePackPrice(pack: Pack, products: Product[]): number {
  const subtotal = pack.products.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  return subtotal * (1 - pack.discountPercentage / 100);
}

// ── Cart Count ──

export function getCartCount(cart: CartItem[]): number {
  return cart.reduce((acc, item) => acc + item.quantity, 0);
}
