export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
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

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  stock: number;
  rating: number;
  isNew?: boolean;
  isSale?: boolean;
  material?: string;
  colors?: string[];
  reviews?: Review[];
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
  orderDetails?: { productId: string; quantity: number; price: number; name: string }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  joinDate: string;
  orders: number;
  phone?: string;
  avatar?: string;
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
}
