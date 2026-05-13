export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  rate: number; // exchange rate vs base currency (FCFA)
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface NavItem {
  id: string;
  name: string;
  view: string;
  order: number;
  status: 'active' | 'inactive';
  position?: 'top' | 'side';
  createdAt?: string;
  updatedAt?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface KnittingProject {
  id: string;
  name: string;
  startDate: string;
  rowCount: number;
  targetRows: number;
  timeSpent: number; // in seconds
  needleSize: string;
  yarn: string;
  notes: string;
  status: 'in-progress' | 'completed';
  lastUpdated: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WoolCalculation {
  id: string;
  date: string;
  projectType: string;
  size?: string;
  yarnWeight: string;
  result: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface VolumeCalculation {
  id: string;
  date: string;
  shape: string;
  material: string;
  volume: number;
  details: {
    total: number;
    partA: number;
    partB: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[]; // Multiple photos for reviews
  productId?: string;
  productName?: string;
  customer?: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
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
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginLog {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  ip: string;
  device: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RequestLog {
  id: string;
  method: string;
  path: string;
  status: number;
  timestamp: string;
  duration: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SEOMeta {
  title: string;
  description: string;
  ogImage?: string;
  createdAt?: string;
  updatedAt?: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface MaintenanceConfig {
  isActive: boolean;
  message: string;
  endDate?: string; // ISO string
  createdAt?: string;
  updatedAt?: string;
}

export interface BrandingConfig {
  logo?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  slug?: string;
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
  specs?: Record<string, string>; // Technical specifications for electronics
  warranty?: string; // Warranty information
  isElectronic?: boolean; // Flag for electronic products
  condition?: 'new' | 'second-hand'; // Added for condition distinction
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: 'stock' | 'transport' | 'marketing' | 'other';
  status?: 'verified' | 'pending' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  image: string;
  count: number;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface RMA {
  id: string;
  orderId: string;
  customer: string;
  reason: string;
  status: 'pending' | 'approved' | 'received' | 'refunded' | 'rejected';
  date: string;
  amount: number;
  internalNotes?: { id: string; date: string; note: string; author: string }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AbandonedCart {
  id: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  items: number;
  status: 'abandoned' | 'recovered' | 'reminded';
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerGroup {
  id: string;
  name: string;
  discountPercentage: number;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface TaxRule {
  id: string;
  name: string;
  rate: number;
  country: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface ShippingRule {
  id: string;
  name: string;
  condition: string;
  price: number;
  status: 'active' | 'inactive';
  type?: 'zone' | 'threshold';
  createdAt?: string;
  updatedAt?: string;
}

export interface CatalogPriceRule {
  id: string;
  name: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string; // Unique ID for this cart entry (can be product ID or pack ID)
  type: 'product' | 'pack';
  product?: Product;
  pack?: Pack;
  quantity: number;
  price: number; // Unit price at the time of adding
}

export interface OrderItem {
  id: string;
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  type?: 'product' | 'pack';
}

export interface InternalNote {
  id: string;
  date: string;
  note: string;
  author: string;
}

export interface Order {
  id: string;
  customer: string;
  customerName?: string;
  phone?: string;
  userId: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'completed';
  items: any;
  type?: 'standard' | 'custom' | 'bundle' | 'b2b';
  paymentMethod?: string;
  address?: string;
  orderDetails?: OrderItem[];
  carrier?: string;
  trackingNumber?: string;
  taxAmount?: number;
  shippingFee?: number;
  internalNotes?: (string | InternalNote)[];
  coordinates?: { lat: number; lng: number } | [number, number] | string;
  trackingSteps?: { status: string; description: string; date: string; completed: boolean }[];
  invoiceUrl?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface Pattern {
  id: string;
  name: string;
  content: string; // Markdown content
  createdAt: string;
  projectType: string;
  skillLevel: string;
  woolName?: string;
  updatedAt?: string;
}

export interface City {
  id?: string;
  name: string;
  slug: string;
  deliveryPrice: number;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string; // 'admin', 'customer', or custom role ID
  joinDate: string;
  orders: number; // Only relevant for customers
  status?: 'active' | 'inactive';
  phone?: string;
  avatar?: string;
  password?: string; // In a real app, this wouldn't be here, but for mock CRUD
  passwordHistory?: string[]; // Array of timestamps when password was changed
  savedPatterns?: Pattern[];
  points?: number;
  loyaltyTier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  badges?: Badge[];
  internalNotes?: string;
  groupId?: string;
  referredBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  type: 'order' | 'stock' | 'inquiry' | 'customer';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  date: string;
  amount: number;
  status: 'paid' | 'unpaid';
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesStat {
  name: string;
  sales: number;
  orders: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  isAdmin: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  messages: ChatMessage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface HomeSection {
  id: string;
  title: string;
  type: 'products' | 'categories' | 'banner';
  itemIds: string[]; // IDs of products or categories
  createdAt?: string;
  updatedAt?: string;
}

export interface CommunityPost {
  id: string;
  userName: string;
  userImage: string;
  image: string;
  description: string;
  likes: number;
  productsUsed: string[]; // Product IDs
  createdAt?: string;
  updatedAt?: string;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
  badgeType?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'special';
  autoAssignRule?: {
    type: 'points' | 'orders' | 'spent';
    threshold: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  points: number;
  badges: Badge[];
  orders: string[]; // Order IDs
  createdAt?: string;
  updatedAt?: string;
}

export interface LoyaltyLevel {
  groupId: string;
  minPoints: number;
}

export interface LoyaltyConfig {
  pointsPerPurchase: number;
  pointsPerReview: number;
  badges: Badge[];
  levels: LoyaltyLevel[];
}

export interface SiteConfig {
  id?: string;
  primaryColor: string;
  accentColor: string;
  showAdBanner: boolean;
  adBannerText: string;
  loyaltyConfig: LoyaltyConfig;
  homeFeaturedProducts: string[]; // IDs
  homeFeaturedCategories: string[]; // IDs
  showSlider: boolean;
  sliderItems: { id: string; image: string; title: string; subtitle: string }[];
  customSections: HomeSection[];
  maintenance: MaintenanceConfig;
  branding: BrandingConfig;
  features?: {
    iconName: string;
    title: string;
    description: string;
  }[];
  seo: {
    home: SEOMeta;
    shop: SEOMeta;
    contact: SEOMeta;
    about: SEOMeta;
  };
  hero: {
    title: string;
    description: string;
    backgroundImages: string[];
    ctaText: string;
  };
  newsletterPopup?: {
    isActive: boolean;
    title: string;
    message: string;
    delay?: number; // seconds
    image?: string;
  };
  qrConfig?: {
    welcomeMessage: string;
    whatsappNumber: string;
    whatsappMessage: string;
  };
  marqueeItems?: {
    id: string;
    text: string;
    iconName: string;
  }[];
  theme?: 'light' | 'dark';
  createdAt?: string;
  updatedAt?: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  fee: number;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: 'percentage' | 'fixed' | 'free_shipping';
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  status: 'active' | 'expired';
  restrictedToUserId?: string;
  freeShipping?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminRole {
  id: string;
  name: string;
  permissions: string[]; // e.g., ['products.view', 'products.edit', 'orders.view']
  createdAt?: string;
  updatedAt?: string;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pack {
  id: string;
  name: string;
  description: string;
  products: { productId: string; quantity: number }[]; // Max 4 products
  promoCode: string;
  discountPercentage: number;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  sentAt: string;
  status: 'draft' | 'sent' | 'scheduled' | 'inactive';
  target?: string;
  targetType?: 'all' | 'role' | 'loyalty';
  targetValue?: string | number;
  type?: 'info' | 'order' | 'stock';
  createdAt?: string;
  updatedAt?: string;
}

export interface Email {
  id: string;
  subject: string;
  recipient: string;
  content: string;
  sentAt: string;
  status: 'sent' | 'draft';
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
  createdAt?: string;
  updatedAt?: string;
}

export interface FlashSaleItem {
  productId: string;
  flashPrice: number;
  totalQuantity: number;
  soldQuantity: number;
}

export interface FlashSale {
  id: string;
  name: string;
  endDate: string;
  status: 'active' | 'inactive';
  items: FlashSaleItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Lookbook {
  id: string;
  title: string;
  image: string;
  description?: string;
  status: 'active' | 'inactive';
  products: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomOrder {
  id: string;
  userId: string;
  userName: string;
  email: string;
  description: string;
  status: 'pending' | 'reviewed' | 'responded' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  tech: string[];
  link?: string;
  image?: string;
}

export interface PortfolioExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  isCurrent?: boolean;
  description: string;
}

export interface PortfolioEducation {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface PortfolioCertification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link?: string;
}

export type ExpertiseCategory = 'Frontend' | 'Backend' | 'Database' | 'Methodologie' | 'API' | 'Outils' | 'Expertise' | 'Gestion de Projet' | 'Communication' | 'Design' | 'Organisation';

export interface MemberPortfolio {
  id: string; // 'landry' or 'doleres'
  profileType: 'developer' | 'manager';
  name: string;
  role: string;
  bio: string;
  email: string;
  github?: string;
  linkedin?: string;
  avatar?: string;
  phone?: string;
  expertise: {
    category: ExpertiseCategory;
    skills: { name: string; iconUrl: string }[];
  }[];
  cvUrl?: string;
  projects: PortfolioProject[];
  experience: PortfolioExperience[];
  education: PortfolioEducation[];
  certifications: PortfolioCertification[];
  updatedAt?: any;
}

