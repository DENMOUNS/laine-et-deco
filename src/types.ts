export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[]; // Multiple photos for reviews
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  author: string;
  category: string;
}

export interface Currency {
  id: string;
  code: string;
  symbol: string;
  rate: number; // relative to a base
  name: string;
}

export interface LoginLog {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  ip: string;
  device: string;
}

export interface RequestLog {
  id: string;
  method: string;
  path: string;
  status: number;
  timestamp: string;
  duration: string;
}

export interface SEOMeta {
  title: string;
  description: string;
  ogImage?: string;
}

export interface PromoEvent {
  id: string;
  name: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  discountPercentage: number;
  applyToAll: boolean;
  productIds?: string[];
  status: 'active' | 'scheduled' | 'expired';
}

export interface MaintenanceConfig {
  isActive: boolean;
  message: string;
  endDate?: string; // ISO string
}

export interface BrandingConfig {
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  promoPrice?: number; // Added for strikethrough pricing
  category: string;
  image: string;
  description: string;
  stock: number;
  rating: number;
  isNew?: boolean;
  isSale?: boolean;
  isAvailable: boolean; // Added for stock management toggle
  material?: string;
  colors?: string[];
  reviews?: Review[];
  views?: number;
  salesCount?: number;
  brand?: string;
  seo?: SEOMeta; // Added for SEO
  purchasePrice?: number; // Added for Finance Management
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: 'stock' | 'transport' | 'marketing' | 'other';
}

export interface Category {
  id: string;
  name: string;
  image: string;
  count: number;
}

export interface Order {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: number;
  paymentMethod?: string;
  address?: string;
  coordinates?: [number, number];
  orderDetails?: { productId: string; quantity: number; price: number; name: string }[];
  trackingSteps?: { status: string; date: string; description: string; completed: boolean }[]; // Added for tracking
}

export interface Role {
  id: string;
  name: string;
  description: string;
  // permissions: string[]; // Removed as per request
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string; // 'admin', 'customer', or custom role ID
  joinDate: string;
  orders: number; // Only relevant for customers
  phone?: string;
  avatar?: string;
  password?: string; // In a real app, this wouldn't be here, but for mock CRUD
}

export interface Notification {
  id: string;
  type: 'order' | 'stock' | 'inquiry';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface Invoice {
  id: string;
  orderId: string;
  date: string;
  amount: number;
  status: 'paid' | 'unpaid';
}

export interface SalesStat {
  name: string;
  sales: number;
  orders: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  isAdmin: boolean;
}

export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface HomeSection {
  id: string;
  title: string;
  type: 'products' | 'categories' | 'banner';
  itemIds: string[]; // IDs of products or categories
}

export interface SiteConfig {
  primaryColor: string;
  accentColor: string;
  homeFeaturedProducts: string[]; // IDs
  homeFeaturedCategories: string[]; // IDs
  showSlider: boolean;
  sliderItems: { id: string; image: string; title: string; subtitle: string }[];
  customSections: HomeSection[];
  maintenance: MaintenanceConfig;
  branding: BrandingConfig;
  seo: {
    home: SEOMeta;
    shop: SEOMeta;
    contact: SEOMeta;
    about: SEOMeta;
  };
  hero: {
    title: string;
    backgroundImage: string;
  };
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  status: 'active' | 'expired';
}

export interface AdminRole {
  id: string;
  name: string;
  permissions: string[]; // e.g., ['products.view', 'products.edit', 'orders.view']
}

export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface Pack {
  id: string;
  name: string;
  description: string;
  products: { productId: string; quantity: number }[]; // Max 4 products
  promoCode: string;
  discountPercentage: number;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  sentAt: string;
  status: 'draft' | 'sent';
}

export interface Email {
  id: string;
  subject: string;
  recipient: string;
  content: string;
  sentAt: string;
  status: 'sent' | 'draft';
}
