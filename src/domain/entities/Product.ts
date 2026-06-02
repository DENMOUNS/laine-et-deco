import { Review, SEOMeta } from "../../types";
import { BaseEntity } from "./BaseEntity";

export interface Product extends BaseEntity {
  name: string;
  price: number;
  oldPrice?: number;
  promoPrice?: number;
  purchasePrice?: number;
  category: string;
  image: string;
  description: string;
  stock: number;
  /** Alias of stock — kept for backward-compat with legacy data */
  quantity?: number;
  /** Derived flag: true when stock > 0. Always kept in sync with stock. */
  in_stock?: boolean;
  rating: number;
  isNew?: boolean;
  isSale?: boolean;
  isAvailable: boolean;
  material?: string;
  colors?: string[];
  reviews?: Review[];
  views?: number;
  salesCount?: number;
  brand?: string;
  condition?: string;
  specs?: Record<string, any>;
  seo?: SEOMeta;
}
