/**
 * Product Business Logic Service
 * Pure functions — no React, no Firebase, no side effects.
 * 
 * Consolidates filtering/sorting/search logic that was duplicated
 * across HomeView and ShopView.
 */

import { Product, PromoEvent, Category } from '../types';

// ── Filtering ──

export interface ProductFilters {
  category: string;       // 'Tous' or category name
  material: string;       // 'Tous' or material name
  brand: string;          // 'Tous' or brand name
  condition: string;      // 'Tous', 'new', 'second-hand'
  onlyNewArrivals: boolean;
  maxPrice: number;
  searchQuery: string;
}

export const DEFAULT_FILTERS: ProductFilters = {
  category: 'Tous',
  material: 'Tous',
  brand: 'Tous',
  condition: 'Tous',
  onlyNewArrivals: false,
  maxPrice: 300000,
  searchQuery: '',
};

export function filterProducts(
  products: Product[],
  filters: ProductFilters,
  categories: Category[] = []
): Product[] {
  return products.filter((p) => {
    const matchesCategory =
      filters.category === 'Tous' ||
      p.category === filters.category ||
      categories.find((c) => c.name === p.category)?.slug === filters.category;

    const matchesMaterial =
      filters.material === 'Tous' || p.material === filters.material;

    const matchesBrand =
      filters.brand === 'Tous' || p.brand === filters.brand;

    const matchesCondition =
      filters.condition === 'Tous' || p.condition === filters.condition;

    const matchesNew = !filters.onlyNewArrivals || p.isNew;

    const matchesPrice = p.price <= filters.maxPrice;

    return (
      matchesCategory &&
      matchesMaterial &&
      matchesBrand &&
      matchesCondition &&
      matchesNew &&
      matchesPrice
    );
  });
}

// ── Sorting ──

export type SortOption =
  | 'Nouveautés'
  | 'Prix croissant'
  | 'Prix décroissant'
  | 'Mieux notés';

export function sortProducts(
  products: Product[],
  sortBy: SortOption
): Product[] {
  const sorted = [...products];
  switch (sortBy) {
    case 'Prix croissant':
      return sorted.sort((a, b) => a.price - b.price);
    case 'Prix décroissant':
      return sorted.sort((a, b) => b.price - a.price);
    case 'Mieux notés':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'Nouveautés':
    default:
      return sorted.sort(
        (a, b) => (a.isNew ? -1 : 1) - (b.isNew ? -1 : 1)
      );
  }
}

// ── Derived Data ──

export function getUniqueMaterials(products: Product[]): string[] {
  return Array.from(
    new Set(products.map((p) => p.material).filter((m): m is string => !!m))
  );
}

export function getUniqueBrands(products: Product[]): string[] {
  return Array.from(
    new Set(products.map((p) => p.brand).filter((b): b is string => !!b))
  );
}

export function countByMaterial(
  products: Product[],
  material: string
): number {
  return products.filter((p) => p.material === material).length;
}

export function countByBrand(products: Product[], brand: string): number {
  return products.filter((p) => p.brand === brand).length;
}

// ── Pagination ──

export interface PaginationResult<T> {
  items: T[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

export function paginate<T>(
  items: T[],
  page: number,
  itemsPerPage: number
): PaginationResult<T> {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const safePage = Math.min(Math.max(1, page), Math.max(1, totalPages));
  const startIndex = (safePage - 1) * itemsPerPage;

  return {
    items: items.slice(startIndex, startIndex + itemsPerPage),
    totalPages,
    currentPage: safePage,
    totalItems,
  };
}

// ── Promo Price ──

export function getEffectivePrice(
  product: Product,
  events: PromoEvent[]
): { price: number; originalPrice?: number; hasDiscount: boolean } {
  const now = new Date();

  for (const event of events) {
    if (event.status !== 'active') continue;
    if (new Date(event.startDate) > now || new Date(event.endDate) < now) continue;

    const applies =
      event.applyToAll ||
      (event.productIds && event.productIds.includes(product.id));

    if (applies) {
      const discountedPrice =
        product.price * (1 - event.discountPercentage / 100);
      return {
        price: Math.round(discountedPrice),
        originalPrice: product.price,
        hasDiscount: true,
      };
    }
  }

  if (product.promoPrice && product.promoPrice < product.price) {
    return {
      price: product.promoPrice,
      originalPrice: product.price,
      hasDiscount: true,
    };
  }

  return { price: product.price, hasDiscount: false };
}

// ── Featured products ──

export function getFeaturedProducts(
  products: Product[],
  featuredIds: string[]
): Product[] {
  return products.filter((p) => featuredIds.includes(p.id));
}

export function getFeaturedCategories(
  categories: Category[],
  featuredIds: string[]
): Category[] {
  return categories.filter((c) => featuredIds.includes(c.id));
}
