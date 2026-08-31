import type { BaseEntity } from './domain/entities/BaseEntity';

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

export interface NavItem extends BaseEntity {
  id: string;
  name: string;
  name_en?: string;
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
  question_en?: string;
  answer: string;
  answer_en?: string;
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
  title_en?: string;
  excerpt: string;
  excerpt_en?: string;
  content: string;
  content_en?: string;
  image: string;
  date: string;
  author: string;
  authorBio?: string;
  tags?: string[];
  category: string;
  category_en?: string;
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

export interface PromoEvent extends BaseEntity {
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
  name_en?: string;
  slug?: string;
  price: number;
  salePrice?: number; // Prix de vente (peut être différent du prix unitaire)
  oldPrice?: number;
  promoPrice?: number; // Prix promotionnel (affichage avec strikethrough)
  isInPromotion?: boolean; // Flag pour indiquer si le produit est en promotion
  category: string;
  category_en?: string;
  image: string;
  /** Galerie de sous-images optionnelles (vues supplémentaires du produit) */
  images?: string[];
  /** Mapping des images par couleur: clé = couleur (hex ou nom), valeur = liste d'urls */
  imagesByColor?: Record<string, string[]>;
  /** Quantités par couleur (variant stock) */
  stockByColor?: Record<string, number>;
  /** Arrivages futurs réservables en précommande, éventuellement par couleur. */
  incomingStock?: StockArrival[];
  /** Autorise la précommande des quantités des arrivages futurs. */
  allowPreorder?: boolean;
  description: string;
  description_en?: string;
  stock: number;
  /** Alias of stock — kept for backward-compat with legacy data */
  quantity?: number;
  /** Derived flag: true when stock > 0. Always kept in sync with stock. */
  in_stock?: boolean;
  rating: number;
  isNew?: boolean;
  isSale?: boolean;
  isAvailable: boolean; // Added for stock management toggle
  material?: string;
  material_en?: string;
  colors?: string[];
  specs?: Record<string, any>; // Technical specifications
  reviews?: Review[];
  views?: number;
  salesCount?: number;
  brand?: string;
  brand_en?: string;
  seo?: SEOMeta; // Added for SEO
  purchasePrice?: number; // Added for Finance Management
  warranty?: string; // Warranty information
  isElectronic?: boolean; // Flag for electronic products
  condition?: 'new' | 'second-hand'; // Added for condition distinction
  createdAt?: string;
  updatedAt?: string;
}

export interface StockArrival {
  id: string;
  quantity: number;
  /** Couleur concernée ; absent = arrivage commun au produit. */
  color?: string;
  availableAt: string;
  reservedQuantity?: number;
  status?: 'planned' | 'partial' | 'received' | 'cancelled';
  note?: string;
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
  name_en?: string;
  description?: string;
  description_en?: string;
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
  productPhotoUrl?: string;
  photos?: string[];
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
  type?: 'zone' | 'threshold' | 'default';
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
  preorderQuantity?: number;
  expectedAvailabilityDate?: string;
  fulfillmentMode?: 'immediate' | 'preorder' | 'mixed';
  configuration?: ConfiguratorSelection;
}

export interface ConfiguratorSelection {
  modelId: string;
  modelName: string;
  modelImage: string;
  modelSvg?: string;
  characteristics?: string[];
  yarnProductId: string;
  yarnName: string;
  color: string;
  colorHex?: string;
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

export enum OrderType {
  NORMAL = 'normal',
  CUSTOM = 'custom',
  BUNDLE = 'bundle',
  B2B = 'b2b'
}

export type GiftOccasion = 'birthday' | 'love' | 'craft' | 'wedding' | 'gratitude' | 'holiday';

export interface GiftWrapOption {
  enabled: boolean;
  message: string;
  occasion?: GiftOccasion;
  recipientName?: string;
  senderName?: string;
  ribbonColor?: 'satin-gold' | 'satin-burgundy' | 'satin-emerald' | 'satin-cream';
  fee: number; // default 2000 FCFA
}

export interface Order {
  id: string;
  customer: string;
  customerName?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  userId: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'completed';
  items: any;
  type?: OrderType | string;
  paymentMethod?: string;
  address?: string;
  orderDetails?: OrderItem[];
  carrier?: string;
  trackingNumber?: string;
  taxAmount?: number;
  shippingFee?: number;
  subtotal?: number;
  discount?: number;
  giftWrap?: GiftWrapOption;
  giftFee?: number;
  internalNotes?: (string | InternalNote)[];
  coordinates?: { lat: number; lng: number } | [number, number] | string;
  trackingSteps?: { status: string; description: string; date: string; completed: boolean }[];
  invoiceUrl?: string;
  invoiceData?: any;
  createdAt?: any;
  updatedAt?: any;
  description?: string;
  material?: string;
  dimensions?: string;
  budget?: number;
}

export interface Role {
  id: string;
  name: string;
  slug?: string;
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
  profileImage?: string;
  role: string; // 'admin', 'customer', or custom role ID
  joinDate: string;
  orders: number; // Only relevant for customers
  status?: 'active' | 'inactive';
  phone?: string;
  whatsapp?: string;
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
  type: 'order' | 'stock' | 'product' | 'inquiry' | 'customer';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedId?: string;
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

export interface SiteConfig extends BaseEntity {
  id?: string;
  primaryColor: string;
  accentColor: string;
  showAdBanner: boolean;
  adBannerText: string;
  adBannerText_en?: string;
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
  featureFlags?: Record<string, boolean>;
  giftWrapConfig?: {
    enabled: boolean;
    fee: number;
  };
  seo: {
    home: SEOMeta;
    shop: SEOMeta;
    contact: SEOMeta;
    about: SEOMeta;
    team: SEOMeta;
    cart: SEOMeta;
    wishlist: SEOMeta;
    comparison: SEOMeta;
    lookbook: SEOMeta;
    'custom-order': SEOMeta;
    'knitting-companion': SEOMeta;
    'pattern-generator': SEOMeta;
    blog: SEOMeta;
    calculator: SEOMeta;
    'volume-calculator': SEOMeta;
    faq: SEOMeta;
    loyalty: SEOMeta;
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
  slug?: string;
  description?: string;
  status?: string;
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
  name_en?: string;
  description: string;
  description_en?: string;
  products: { productId: string; quantity: number }[]; // Up to 20 products
  promoCode: string;
  discountPercentage: number;
  coverImage?: string; // Optional cover image for the pack
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
  discountPercentage?: number; // Optional percentage for automatic price calculation
  totalQuantity: number;
  soldQuantity: number;
}

export interface FlashSale {
  id: string;
  name: string;
  name_en?: string;
  endDate: string;
  status: 'active' | 'inactive';
  items: FlashSaleItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PromotionItem {
  productId: string;
  promoPrice: number;
  discountPercentage?: number;
}

export interface Promotion {
  id: string;
  name: string;
  name_en?: string;
  description?: string;
  description_en?: string;
  startDate?: string;
  endDate: string;
  status: 'active' | 'inactive';
  items: PromotionItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Lookbook {
  id: string;
  title: string;
  title_en?: string;
  image: string;
  description?: string;
  description_en?: string;
  status: 'active' | 'inactive';
  products: string[];
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
  id: string; // member id
  profileType?: 'developer' | 'manager';
  name: string;
  role: string;
  role_en?: string;
  bio: string;
  bio_en?: string;
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
  externalPortfolioUrl?: string;
  updatedAt?: any;
}


export interface SiteLogo extends BaseEntity {
  id?: string;
  image?: string;
  lien?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteColor extends BaseEntity {
  id?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface HeroBannerConfig extends BaseEntity {
  id?: string;
  image: string;
  title: string;
  title_en?: string;
  subtitle: string;
  subtitle_en?: string;
  ctaText: string;
  ctaText_en?: string;
  /** Lien de destination du bouton CTA. Vide = boutique par défaut. */
  link?: string;
  order?: number;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface AnnouncementBannerConfig extends BaseEntity {
  id?: string;
  message: string;
  message_en?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface ScrollingBannerConfig extends BaseEntity {
  id?: string;
  text: string;
  text_en?: string;
  iconName: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface MarqueeItem extends BaseEntity {
  id: string;
  text: string;
  text_en?: string;
  iconName: string;
  order?: number;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface SeoPageConfig extends BaseEntity {
  id?: string;
  page: string;
  metaTitle: string;
  metaDescription: string;
  ogImage?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface LoyaltyProgramConfig extends BaseEntity {
  id?: string;
  config: LoyaltyConfig;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface MaintenanceModeConfig extends BaseEntity {
  id?: string;
  isActive: boolean;
  message: string;
  endDate?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface NewsletterPopupConfig extends BaseEntity {
  id?: string;
  isActive: boolean;
  title: string;
  title_en?: string;
  message: string;
  message_en?: string;
  delay: number;
  image: string;
  button1Text: string;
  button1Text_en?: string;
  button2Text: string;
  button2Text_en?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomSectionConfig extends BaseEntity {
  id?: string;
  title: string;
  title_en?: string;
  type: 'products' | 'categories' | 'banner';
  itemIds: string[];
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}
