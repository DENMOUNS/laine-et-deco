import { Review, SEOMeta } from "../../types";

export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  promoPrice?: number;
  category: string;
  image: string;
  description: string;
  stock: number;
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
  seo?: SEOMeta;
}
