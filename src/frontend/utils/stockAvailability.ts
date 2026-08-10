import type { Product, StockArrival } from '../../types';

export interface ProductAvailability {
  immediate: number;
  preorder: number;
  total: number;
  nextArrivalDate?: string;
}

const activeArrivals = (product: Product, color?: string): StockArrival[] =>
  (product.incomingStock || [])
    .filter((arrival) => arrival.status !== 'cancelled' && arrival.status !== 'received')
    .filter((arrival) => !arrival.availableAt || new Date(arrival.availableAt).getTime() > Date.now())
    .filter((arrival) => !color || !arrival.color || arrival.color === color)
    .filter((arrival) => Math.max(0, Number(arrival.quantity) - Number(arrival.reservedQuantity || 0)) > 0)
    .sort((a, b) => new Date(a.availableAt).getTime() - new Date(b.availableAt).getTime());

export const getProductAvailability = (product: Product, color?: string): ProductAvailability => {
  const hasColorStock = Boolean(color && product.stockByColor && Object.prototype.hasOwnProperty.call(product.stockByColor, color));
  const immediate = Math.max(0, Number(hasColorStock ? product.stockByColor?.[color!] : product.stock) || 0);
  if (!product.allowPreorder) return { immediate, preorder: 0, total: immediate };

  const arrivals = activeArrivals(product, color);
  const preorder = arrivals.reduce(
    (sum, arrival) => sum + Math.max(0, Number(arrival.quantity) - Number(arrival.reservedQuantity || 0)),
    0,
  );
  return {
    immediate,
    preorder,
    total: immediate + preorder,
    nextArrivalDate: arrivals[0]?.availableAt,
  };
};

export const getFulfillment = (product: Product, quantity: number, color?: string) => {
  const availability = getProductAvailability(product, color);
  const preorderQuantity = Math.max(0, quantity - availability.immediate);
  return {
    preorderQuantity,
    expectedAvailabilityDate: preorderQuantity > 0 ? availability.nextArrivalDate : undefined,
    fulfillmentMode: preorderQuantity === 0 ? 'immediate' as const : quantity > preorderQuantity ? 'mixed' as const : 'preorder' as const,
  };
};

export const formatAvailabilityDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
