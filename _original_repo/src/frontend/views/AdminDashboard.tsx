import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Bell,
  Plus,
  Menu,
  X,
  History,
  Coins,
  Globe,
  Shield,
  Activity,
  Smartphone,
  Monitor,
  Star,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Palette,
  Award,
  Download,
  FileText,
  Send,
  Table as TableIcon,
  Ticket,
  Lock,
  Eye,
  MousePointer2,
  Calendar as CalendarIcon,
  Image as ImageIcon,
  Type as TypeIcon,
  MonitorOff,
  Info,
  User,
  Edit,
  Trash2,
  ShoppingCart,
  RefreshCcw,
  Tag,
  Mail,
  Percent,
  Truck,
  ChevronLeft,
  MapPin,
  Route,
  QrCode,
  Save,
  HelpCircle
} from 'lucide-react';
import { useEntity } from '../hooks/useEntity';
import { useProducts } from '../hooks/useProducts';

import { AdminFlashSales } from './admin/AdminFlashSales';
import { AdminLookbooks } from './admin/AdminLookbooks';

const formatDate = (date: any) => {
  if (!date) return 'N/A';
  // Handle Firestore Timestamp
  if (typeof date.toDate === 'function') {
    return date.toDate().toLocaleString('fr-FR');
  }
  if (typeof date === 'object' && date.seconds !== undefined) {
    return new Date(date.seconds * 1000).toLocaleString('fr-FR');
  }
  // Handle Date object
  if (date instanceof Date) {
    return date.toLocaleString('fr-FR');
  }
  // Handle ISO string or other string
  if (typeof date === 'string') {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return date;
      return d.toLocaleString('fr-FR');
    } catch (e) {
      return date;
    }
  }
  return 'N/A';
};

import { productSearch, orderSearch, userSearch, getStatusText, getActionDescription } from '../utils/searchUtils';
import { 
  ORDERS as INITIAL_ORDERS, 
  PRODUCTS as INITIAL_PRODUCTS, 
  USERS as INITIAL_USERS, 
  CATEGORIES as INITIAL_CATEGORIES, 
  LOGIN_LOGS as INITIAL_LOGIN_LOGS, 
  REQUEST_LOGS as INITIAL_REQUEST_LOGS, 
  NOTIFICATIONS as INITIAL_NOTIFICATIONS, 
  SALES_DATA as INITIAL_SALES_DATA, 
  SITE_CONFIG as INITIAL_SITE_CONFIG, 
  CHAT_MESSAGES as INITIAL_CHAT_MESSAGES, 
  CONVERSATIONS as INITIAL_CONVERSATIONS, 
  COUPONS as INITIAL_COUPONS, 
  ADMIN_ROLES as INITIAL_ADMIN_ROLES, 
  PROMO_EVENTS as INITIAL_PROMO_EVENTS,
  CATEGORY_DISTRIBUTION as INITIAL_CATEGORY_DISTRIBUTION,
  DEVICE_DATA as INITIAL_DEVICE_DATA,
  TRAFFIC_SOURCES as INITIAL_TRAFFIC_SOURCES,
  RETENTION_DATA as INITIAL_RETENTION_DATA,
  REVENUE_BY_PAYMENT as INITIAL_REVENUE_BY_PAYMENT,
  PACKS as INITIAL_PACKS,
  PUSH_NOTIFICATIONS as INITIAL_PUSH_NOTIFICATIONS,
  EMAILS as INITIAL_EMAILS,
  EXPENSES as INITIAL_EXPENSES,
  LOOKBOOK_POSTS as INITIAL_LOOKBOOK_POSTS,
  BLOG_POSTS as INITIAL_BLOG_POSTS,
  REVIEWS as INITIAL_REVIEWS,
  RMAS as INITIAL_RMAS,
  ABANDONED_CARTS as INITIAL_ABANDONED_CARTS,
  CUSTOMER_GROUPS as INITIAL_CUSTOMER_GROUPS,
  TAX_RULES as INITIAL_TAX_RULES,
  SHIPPING_RULES as INITIAL_SHIPPING_RULES,
  CATALOG_PRICE_RULES as INITIAL_CATALOG_PRICE_RULES,
  SUBSCRIBERS as INITIAL_SUBSCRIBERS,
  BADGES,
  INITIAL_CITIES,
  NAV_ITEMS as INITIAL_NAV_ITEMS,
  FAQ_ITEMS as INITIAL_FAQ_ITEMS
} from '../../constants';
import { CouponEditor } from '../components/dashboard/CouponEditor';
import { CityEditor } from '../components/dashboard/CityEditor';
import { FAQEditor } from '../components/dashboard/FAQEditor';
import { PromoEventEditor } from '../components/dashboard/PromoEventEditor';
import { CatalogPriceRuleEditor } from '../components/dashboard/CatalogPriceRuleEditor';
import { Modal } from '../components/Modal';
import { DataTable } from '../components/DataTable';
import { TabFilter } from '../components/TabFilter';
import { Notification, Product, Category, SiteConfig, ChatMessage, HomeSection, Conversation, Coupon, AdminRole, PromoEvent, Order, User as UserType, LoginLog, RequestLog, Pack, PushNotification, Email, Role, Expense, Review, RMA, AbandonedCart, CustomerGroup, TaxRule, ShippingRule, CatalogPriceRule, NewsletterSubscriber, City, NavItem, FAQ } from '../../types';
import { StatusBadge, getStatusStyles } from '../components/ui/StatusBadge';
import { cn } from '../utils/utils';
import { OrderMap } from '../components/OrderMap';
import { generateInvoicePDF } from '../utils/invoiceUtils';
import { User as FirebaseUser, signOut } from 'firebase/auth';
import { QRCodeSVG } from 'qrcode.react';
import { collection, getDocs, doc, updateDoc, increment, query, where, getDoc, writeBatch, serverTimestamp, addDoc } from 'firebase/firestore';
import { auth, db } from '../../backend/firebase';

import { toast } from 'sonner';
import { Loader } from '../components/Loader';
import { seedFirebase } from '../utils/firebaseSeed';

interface AdminDashboardProps {
  onNavigate: (view: string, id?: string, query?: string) => void;
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  user: FirebaseUser | null;
  isAuthLoading: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, siteConfig: propSiteConfig, setSiteConfig: propSetSiteConfig, user, isAuthLoading }) => {
  const { data: ORDERS, setData: setLocalOrders } = useEntity<Order>('order', INITIAL_ORDERS);
  const { products: fetchedProducts } = useProducts();
  const PRODUCTS = fetchedProducts.length > 0 ? fetchedProducts : INITIAL_PRODUCTS;
  const { data: USERS } = useEntity<UserType>('user', INITIAL_USERS);
  const { data: CATEGORIES, updateEntity: updateCategory, addEntity: addCategory, setData: setLocalCategories } = useEntity<Category>('category', INITIAL_CATEGORIES);
  const { data: NAV_ITEMS, updateEntity: updateNavItem, addEntity: addNavItem, deleteEntity: deleteNavItem } = useEntity<NavItem>('nav_item', INITIAL_NAV_ITEMS);
  const { data: FAQS, updateEntity: updateFAQ, addEntity: addFAQ, deleteEntity: deleteFAQ } = useEntity<FAQ>('faq', INITIAL_FAQ_ITEMS);
  const { data: LOGIN_LOGS, deleteEntity: deleteLoginLog } = useEntity<any>('login_log', INITIAL_LOGIN_LOGS);
  const { data: REQUEST_LOGS, deleteEntity: deleteRequestLog } = useEntity<any>('request_log', INITIAL_REQUEST_LOGS);
  const { data: NOTIFICATIONS } = useEntity<any>('notification', INITIAL_NOTIFICATIONS);
  const { data: SALES_DATA } = useEntity<any>('sales_data', INITIAL_SALES_DATA);
  const { data: siteConfigs, updateEntity: updateSiteConfig } = useEntity<any>('site_config', [INITIAL_SITE_CONFIG]);
  const rawSiteConfig = siteConfigs[0] || propSiteConfig || INITIAL_SITE_CONFIG;
  const siteConfig = {
    ...rawSiteConfig,
    loyaltyConfig: {
      pointsPerPurchase: rawSiteConfig.loyaltyConfig?.pointsPerPurchase ?? 10,
      pointsPerReview: rawSiteConfig.loyaltyConfig?.pointsPerReview ?? 50,
      badges: rawSiteConfig.loyaltyConfig?.badges?.length > 0 ? rawSiteConfig.loyaltyConfig.badges : BADGES
    }
  };
  
  const setSiteConfig = (newConfig: any) => {
    if (typeof newConfig === 'function') {
      const updated = newConfig(siteConfig);
      propSetSiteConfig(updated);
      // No automatic DB update
    } else {
      propSetSiteConfig(newConfig);
      // No automatic DB update
    }
  };

  const saveSiteSection = async (keys: string[], label: string) => {
    try {
      if (siteConfig.id) {
        const updateData: any = { updatedAt: new Date().toISOString() };
        keys.forEach(k => {
          updateData[k] = (siteConfig as any)[k];
        });
        await updateDoc(doc(db, 'site_config', siteConfig.id), updateData);
        toast.success(`${label} : Enregistré avec succès`);
      }
    } catch (err) {
      toast.error('Erreur lors de l’enregistrement');
    }
  };

  const saveAllSiteConfig = async () => {
    try {
      if (siteConfig.id) {
        await updateDoc(doc(db, 'site_config', siteConfig.id), {
          ...siteConfig,
          updatedAt: new Date().toISOString()
        });
        toast.success('Toute la configuration a été enregistrée');
      }
    } catch (err) {
      toast.error('Erreur lors de l’enregistrement global');
    }
  };

  const sortByDate = (data: any[]) => [...data].sort((a, b) => {
    const getVal = (item: any) => {
        if (!item.createdAt) return 0;
        if (item.createdAt.toDate) return item.createdAt.toDate().getTime();
        return new Date(item.createdAt).getTime();
    };
    return getVal(b) - getVal(a);
  });

  const { data: CHAT_MESSAGES } = useEntity<any>('chat_message', INITIAL_CHAT_MESSAGES);
  const { data: CONVERSATIONS } = useEntity<any>('conversation', INITIAL_CONVERSATIONS);
  const { data: COUPONS, updateEntity: updateCoupon, addEntity: addCoupon } = useEntity<Coupon>('coupon', INITIAL_COUPONS);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isCouponEditorOpen, setIsCouponEditorOpen] = useState(false);

  const { data: CITIES, updateEntity: updateCity, addEntity: addCity, deleteEntity: deleteCity } = useEntity<City>('city', INITIAL_CITIES);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isCityEditorOpen, setIsCityEditorOpen] = useState(false);

  const handleEditCity = (city: City) => {
    setSelectedCity(city);
    setIsCityEditorOpen(true);
  };

  const handleSaveCity = (city: City) => {
    if (CITIES.find(c => c.id === city.id)) {
      updateCity(city.id!, city);
    } else {
      addCity(city);
    }
    setIsCityEditorOpen(false);
  };

  const handleDeleteCity = (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette ville ?')) {
      deleteCity(id);
      toast.success('Ville supprimée');
    }
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsCouponEditorOpen(true);
  };

  const handleSaveCoupon = (coupon: Coupon) => {
    if (COUPONS.find(c => c.id === coupon.id)) {
      updateCoupon(coupon.id, coupon);
    } else {
      addCoupon(coupon);
    }
    setIsCouponEditorOpen(false);
  };

  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);
  const [isFAQEditorOpen, setIsFAQEditorOpen] = useState(false);

  const handleEditFAQ = (faq: FAQ) => {
    setSelectedFAQ(faq);
    setIsFAQEditorOpen(true);
  };

  const handleSaveFAQ = (faq: FAQ) => {
    if (FAQS.find(f => f.id === faq.id)) {
      updateFAQ(faq.id!, faq);
    } else {
      addFAQ(faq);
    }
    setIsFAQEditorOpen(false);
  };

  const handleDeleteFAQ = (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette question ?')) {
      deleteFAQ(id);
      toast.success('Question supprimée');
    }
  };

  const { data: ADMIN_ROLES } = useEntity<any>('admin_role', INITIAL_ADMIN_ROLES);
  const { data: PROMO_EVENTS, updateEntity: updateEvent, addEntity: addEvent, deleteEntity: deleteEvent } = useEntity<PromoEvent>('promo_event', INITIAL_PROMO_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<PromoEvent | null>(null);
  const [isEventEditorOpen, setIsEventEditorOpen] = useState(false);

  const handleEditEvent = (event: PromoEvent) => {
    setSelectedEvent(event);
    setIsEventEditorOpen(true);
  };

  const handleSaveEvent = (event: PromoEvent) => {
    if (PROMO_EVENTS.find(e => e.id === event.id)) {
      updateEvent(event.id, event);
    } else {
      addEvent(event);
    }
    setIsEventEditorOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet évènement ?')) {
      deleteEvent(id);
      toast.success('Évènement supprimé');
    }
  };
  const { data: CATEGORY_DISTRIBUTION } = useEntity<any>('category_distribution', INITIAL_CATEGORY_DISTRIBUTION);
  const { data: DEVICE_DATA } = useEntity<any>('device_data', INITIAL_DEVICE_DATA);
  const { data: TRAFFIC_SOURCES } = useEntity<any>('traffic_source', INITIAL_TRAFFIC_SOURCES);
  const { data: RETENTION_DATA } = useEntity<any>('retention_data', INITIAL_RETENTION_DATA);
  const { data: REVENUE_BY_PAYMENT } = useEntity<any>('revenue_by_payment', INITIAL_REVENUE_BY_PAYMENT);
  const { data: PACKS, updateEntity: updatePack, addEntity: addPack, setData: setLocalPacks } = useEntity<Pack>('pack', INITIAL_PACKS);
  const localPacks = PACKS;
  const { data: PUSH_NOTIFICATIONS, setData: setLocalPushNotifications } = useEntity<any>('push_notification', INITIAL_PUSH_NOTIFICATIONS);
  const { data: EMAILS, setData: setLocalEmails } = useEntity<any>('email', INITIAL_EMAILS);
  const { data: EXPENSES } = useEntity<any>('expense', INITIAL_EXPENSES);
  const { data: LOOKBOOK_POSTS, setData: setLocalLookbook } = useEntity<any>('lookbook_post', INITIAL_LOOKBOOK_POSTS);
  const { data: BLOG_POSTS, setData: setLocalBlogPosts } = useEntity<any>('blog_post', INITIAL_BLOG_POSTS);
  const { data: REVIEWS, setData: setLocalReviews } = useEntity<any>('review', INITIAL_REVIEWS);
  const { data: ABANDONED_CARTS, setData: setLocalAbandonedCarts } = useEntity<any>('abandoned_cart', INITIAL_ABANDONED_CARTS);
  const { data: CUSTOMER_GROUPS, setData: setLocalCustomerGroups } = useEntity<any>('customer_group', INITIAL_CUSTOMER_GROUPS);
  const { data: TAX_RULES, setData: setLocalTaxRules } = useEntity<any>('tax_rule', INITIAL_TAX_RULES);
  const { data: SHIPPING_RULES, setData: setLocalShippingRules } = useEntity<any>('shipping_rule', INITIAL_SHIPPING_RULES);
  const { data: CATALOG_PRICE_RULES } = useEntity<any>('catalog_price_rule', INITIAL_CATALOG_PRICE_RULES);
  const { data: SUBSCRIBERS, setData: setLocalSubscribers } = useEntity<NewsletterSubscriber>('subscriber', INITIAL_SUBSCRIBERS);

  const { data: localProducts, setData: setLocalProducts, updateEntity: updateProduct } = useEntity<Product>('product', INITIAL_PRODUCTS);
  const localCategories = CATEGORIES;
  const localOrders = ORDERS;

  const [activeTab, setActiveTab] = useState('overview');
  const [customerDetailTab, setCustomerDetailTab] = useState<'profile' | 'orders' | 'loyalty' | 'messages'>('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [modalType, setModalType] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editedOrder, setEditedOrder] = useState<Order | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<UserType | null>(null);
  const [selectedCustomerGroup, setSelectedCustomerGroup] = useState<CustomerGroup | null>(null);
  const [newNote, setNewNote] = useState('');
  const [events, setEvents] = useState<PromoEvent[]>(INITIAL_PROMO_EVENTS);

  useEffect(() => {
    const autoSeed = async () => {
      if (!db) return;
      try {
        const snapshot = await getDocs(collection(db, 'product'));
        if (snapshot.empty) {
          toast.info('Initialisation automatique des données en cours...');
          setIsSaving(true);
          await seedFirebase();
          toast.success('Base de données initialisée avec succès !');
          setIsSaving(false);
        }
      } catch (e) {
        console.error("Auto-seed failed", e);
        setIsSaving(false);
      }
    };
    if (user && user.email === 'landrymouns@gmail.com') {
      autoSeed();
    }
  }, [user]);

  const handleSeed = async () => {
    if (!db) {
      toast.error("Firebase n'est pas configuré.");
      return;
    }
    try {
      setIsSaving(true);
      await seedFirebase();
      toast.success('Base de données initialisée avec succès !');
    } catch (error) {
      console.error('Error seeding database:', error);
      toast.error(`Erreur lors de l'initialisation de la base de données: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const { data: localSystemNotifications, setData: setLocalSystemNotifications } = useEntity<Notification>('notification', INITIAL_NOTIFICATIONS);
  const { data: localUsers, setData: setLocalUsers, updateEntity: updateLocalUser, setEntity: setLocalUser } = useEntity<UserType>('user', INITIAL_USERS);
  const { data: localRoles, setData: setLocalRoles } = useEntity<any>('admin_role', INITIAL_ADMIN_ROLES);
  const { data: localExpenses, addEntity: addExpense, updateEntity: updateExpense, setData: setLocalExpenses } = useEntity<Expense>('expense', INITIAL_EXPENSES);
  const { data: localLookbook, addEntity: addLookbook, updateEntity: updateLookbook, setData: setLocalLookbook2 } = useEntity<any>('lookbook_post', INITIAL_LOOKBOOK_POSTS);
  const { data: localBlogPosts, addEntity: addBlogPost, updateEntity: updateBlogPost, setData: setLocalBlogPosts2 } = useEntity<any>('blog_post', INITIAL_BLOG_POSTS);
  const { data: realLogs, isLoading: isLogsLoading } = useEntity<any>('log', []);
  
  // New Magento-like states
  const [newRMANote, setNewRMANote] = useState('');
  const { data: localReviews, updateEntity: updateReview, addEntity: addReview, setData: setLocalReviews2 } = useEntity<Review>('review', INITIAL_REVIEWS);
  const { data: localRMAs, updateEntity: updateRMA, addEntity: addRMA } = useEntity<RMA>('rma', INITIAL_RMAS);
  const { data: localAbandonedCarts, setData: setLocalAbandonedCarts2 } = useEntity<AbandonedCart>('abandoned_cart', INITIAL_ABANDONED_CARTS);
  const { data: localCustomerGroups, addEntity: addCustomerGroup, updateEntity: updateCustomerGroup, setData: setLocalCustomerGroups2 } = useEntity<CustomerGroup>('customer_group', INITIAL_CUSTOMER_GROUPS);
  const { data: localTaxRules, addEntity: addTaxRule, updateEntity: updateTaxRule, setData: setLocalTaxRules2 } = useEntity<TaxRule>('tax_rule', INITIAL_TAX_RULES);
  const { data: localShippingRules, addEntity: addShippingRule, updateEntity: updateShippingRule, setData: setLocalShippingRules2 } = useEntity<ShippingRule>('shipping_rule', INITIAL_SHIPPING_RULES);
  const { data: localCatalogPriceRules, updateEntity: updateCatalogRule, addEntity: addCatalogRule, deleteEntity: deleteCatalogRule } = useEntity<CatalogPriceRule>('catalog_price_rule', INITIAL_CATALOG_PRICE_RULES);
  const [selectedCatalogRule, setSelectedCatalogRule] = useState<CatalogPriceRule | null>(null);
  const [isCatalogRuleEditorOpen, setIsCatalogRuleEditorOpen] = useState(false);

  const handleEditCatalogRule = (rule: CatalogPriceRule) => {
    setSelectedCatalogRule(rule);
    setIsCatalogRuleEditorOpen(true);
  };

  const handleSaveCatalogRule = (rule: CatalogPriceRule) => {
    if (localCatalogPriceRules.find(r => r.id === rule.id)) {
      updateCatalogRule(rule.id, rule);
    } else {
      addCatalogRule(rule);
    }
    setIsCatalogRuleEditorOpen(false);
  };

  const handleDeleteCatalogRule = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette règle de prix ?')) {
      deleteCatalogRule(id);
      toast.success('Règle de prix supprimée');
    }
  };

  const [selectedPackProducts, setSelectedPackProducts] = useState<{productId: string, quantity: number}[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Index items for Lucene-like search in Admin Dashboard
  useEffect(() => {
    if (localProducts.length > 0) productSearch.indexItems(localProducts);
    if (localOrders.length > 0) orderSearch.indexItems(localOrders);
    if (localUsers.length > 0) userSearch.indexItems(localUsers);
  }, [localProducts, localOrders, localUsers]);

  useEffect(() => {
    if (editingItem && modalType === 'pack') {
        setSelectedPackProducts(editingItem.products || []);
    } else {
        setSelectedPackProducts([]);
    }
  }, [editingItem, modalType]);

  useEffect(() => {
    if (editingItem && (modalType === 'category' || activeTab === 'product-edit')) {
      setCurrentSlug(editingItem.slug || '');
    } else {
      setCurrentSlug('');
    }
  }, [editingItem, modalType, activeTab]);

  // Filter states
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData(e.currentTarget);
    
    // Simulate server delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      if (modalType === 'category') {
          const nameValue = formData.get('name') as string;
          const slugValue = formData.get('slug') as string;
          const finalSlug = slugValue || (nameValue ? nameValue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '');
          
          const newCategory: any = {
              id: editingItem ? editingItem.id : `cat-${Date.now()}`,
              name: nameValue,
              slug: finalSlug,
              image: formData.get('image') as string || 'https://picsum.photos/seed/cat/300/200',
              count: editingItem ? editingItem.count : 0,
              status: formData.get('status') as 'active' | 'inactive' || 'active'
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newCategory.updatedAt = now;
              newCategory.createdAt = editingItem.createdAt || now;
          } else {
              newCategory.createdAt = now;
              newCategory.updatedAt = now;
          }
          if (editingItem) {
              updateCategory(editingItem.id, newCategory);
          } else {
              addCategory(newCategory);
          }
      } else if (modalType === 'badge') {
        const newBadge: any = {
            id: editingItem.id,
            name: formData.get('name') as string,
            icon: formData.get('icon') as string,
            description: formData.get('description') as string,
            unlocked: editingItem.unlocked,
            badgeType: editingItem.badgeType,
            autoAssignRule: editingItem.autoAssignRule
        };
        const now = new Date().toISOString();
        newBadge.updatedAt = now;
        newBadge.createdAt = editingItem.createdAt || now;
        
        setSiteConfig((prev: any) => ({
            ...prev,
            loyaltyConfig: {
                ...prev.loyaltyConfig,
                badges: prev.loyaltyConfig.badges.map((b: any) => b.id === editingItem.id ? { ...b, ...newBadge } : b)
            }
        }));
      } else if (modalType === 'loyalty-config') {
        const levels = editingItem.levels.map((_: any, index: number) => ({
            groupId: formData.get(`groupId-${index}`) as string,
            minPoints: Number(formData.get(`minPoints-${index}`))
        }));
        setSiteConfig((prev: any) => ({
            ...prev,
            loyaltyConfig: {
                ...prev.loyaltyConfig,
                pointsPerPurchase: Number(formData.get('pointsPerPurchase')),
                pointsPerReview: Number(formData.get('pointsPerReview')),
                levels
            }
        }));
      } else if (modalType === 'pack') {
          const newPack: any = {
              id: editingItem ? editingItem.id : `pack-${Date.now()}`,
              name: formData.get('name') as string,
              description: formData.get('description') as string,
              products: selectedPackProducts,
              discountPercentage: Number(formData.get('discountPercentage')),
              promoCode: formData.get('promoCode') as string || `PACK${Date.now().toString().slice(-4)}`,
              status: editingItem?.status || 'active'
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newPack.updatedAt = now;
              newPack.createdAt = editingItem.createdAt || now;
          } else {
              newPack.createdAt = now;
              newPack.updatedAt = now;
          }
          if (editingItem) {
              setLocalPacks(prev => prev.map(p => p.id === editingItem.id ? { ...p, ...newPack } : p));
          } else {
              setLocalPacks(prev => [...prev, newPack]);
          }
      } else if (modalType === 'user') {
           const newUser: any = {
              id: editingItem ? editingItem.id : `user-${Date.now()}`,
              name: formData.get('name') as string,
              email: formData.get('email') as string,
              role: formData.get('role') as string,
              points: Number(formData.get('points')) || 0,
              joinDate: editingItem ? editingItem.joinDate : new Date().toISOString().split('T')[0],
              orders: editingItem?.orders || 0,
              password: formData.get('password') as string,
              status: editingItem?.status || 'active'
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newUser.updatedAt = now;
              newUser.createdAt = editingItem.createdAt || now;
          } else {
              newUser.createdAt = now;
              newUser.updatedAt = now;
          }
          if (editingItem) {
              setLocalUsers(prev => prev.map(u => u.id === editingItem.id ? { ...u, ...newUser } : u));
              updateLocalUser(editingItem.id, newUser);
              toast.success('Utilisateur mis à jour');
          } else {
              const userUid = newUser.uid || newUser.id;
              setLocalUsers(prev => [...prev, newUser]);
              setLocalUser(userUid, newUser);
              toast.success('Utilisateur créé');
          }
      } else if (modalType === 'role') {
           const newRole: any = {
              id: editingItem ? editingItem.id : `role-${Date.now()}`,
              name: formData.get('name') as string,
              description: formData.get('description') as string,
              status: editingItem?.status || 'active'
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newRole.updatedAt = now;
              newRole.createdAt = editingItem.createdAt || now;
          } else {
              newRole.createdAt = now;
              newRole.updatedAt = now;
          }
          if (editingItem) {
              setLocalRoles(prev => prev.map(r => r.id === editingItem.id ? { ...r, ...newRole } : r));
          } else {
              setLocalRoles(prev => [...prev, newRole]);
          }
      } else if (modalType === 'notification') {
          const sendNow = formData.get('sendNow') === 'on';
          const status = formData.get('status') as string;
          const newNotif: any = {
              id: editingItem ? editingItem.id : `notif-${Date.now()}`,
              title: formData.get('title') as string,
              message: formData.get('message') as string,
              sentAt: sendNow ? new Date().toISOString().split('T')[0] : (editingItem ? editingItem.sentAt : ''),
              status: sendNow ? 'sent' : status,
              target: formData.get('target') as string,
              read: false,
              type: 'info'
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newNotif.updatedAt = now;
              newNotif.createdAt = editingItem.createdAt || now;
          } else {
              newNotif.createdAt = now;
              newNotif.updatedAt = now;
          }
          if (editingItem) {
              setLocalPushNotifications(prev => prev.map(n => (n as any).id === editingItem.id ? { ...n, ...newNotif } : n));
          } else {
              setLocalPushNotifications(prev => [newNotif, ...prev]);
          }
          
          if (sendNow || status === 'sent') {
              window.dispatchEvent(new CustomEvent('push-notification', { detail: newNotif }));
          }
      } else if (modalType === 'email') {
           const newEmail: any = {
              id: editingItem ? editingItem.id : `email-${Date.now()}`,
              subject: formData.get('subject') as string,
              recipient: formData.get('recipient') as string,
              content: formData.get('content') as string,
              status: 'Envoyé',
              sentAt: new Date().toISOString().split('T')[0]
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newEmail.updatedAt = now;
              newEmail.createdAt = editingItem.createdAt || now;
          } else {
              newEmail.createdAt = now;
              newEmail.updatedAt = now;
          }
          if (editingItem) {
              setLocalEmails(prev => prev.map(e => (e as any).id === editingItem.id ? { ...e, ...newEmail } : e));
          } else {
              setLocalEmails(prev => [newEmail, ...prev]);
          }
      } else if (modalType === 'customer') {
           const newUser: any = {
              id: editingItem ? editingItem.id : `user-${Date.now()}`,
              name: formData.get('name') as string,
              email: formData.get('email') as string,
              role: formData.get('role') as string,
              joinDate: new Date().toISOString().split('T')[0],
              orders: 0,
              totalSpent: 0,
              avatar: 'https://i.pravatar.cc/150?u=' + Date.now(),
              status: editingItem?.status || 'active'
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newUser.updatedAt = now;
              newUser.createdAt = editingItem.createdAt || now;
          } else {
              newUser.createdAt = now;
              newUser.updatedAt = now;
          }
          if (editingItem) {
              setLocalUsers(prev => prev.map(u => u.id === editingItem.id ? { ...u, ...newUser } : u));
          } else {
              setLocalUsers(prev => [...prev, newUser]);
          }
      } else if (modalType === 'event') {
           const newEvent: any = {
              id: editingItem ? editingItem.id : `evt-${Date.now()}`,
              name: formData.get('name') as string,
              startDate: formData.get('startDate') as string,
              endDate: formData.get('endDate') as string,
              discountPercentage: Number(formData.get('discountPercentage')),
              applyToAll: formData.get('applyToAll') === 'all',
              isActive: true
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newEvent.updatedAt = now;
              newEvent.createdAt = editingItem.createdAt || now;
          } else {
              newEvent.createdAt = now;
              newEvent.updatedAt = now;
          }
          if (editingItem) {
              updateEvent(editingItem.id, newEvent);
          } else {
              addEvent(newEvent);
          }
      } else if (modalType === 'expense') {
          const newExpense: any = {
              id: editingItem ? editingItem.id : `exp-${Date.now()}`,
              description: formData.get('description') as string,
              amount: Number(formData.get('amount')),
              date: formData.get('date') as string,
              category: formData.get('category') as string,
              status: editingItem?.status || 'pending'
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newExpense.updatedAt = now;
              newExpense.createdAt = editingItem.createdAt || now;
          } else {
              newExpense.createdAt = now;
              newExpense.updatedAt = now;
          }
          if (editingItem) {
              updateExpense(editingItem.id, newExpense);
          } else {
              addExpense(newExpense);
          }
      } else if (modalType === 'lookbook') {
          const newLookbook: any = {
              id: editingItem ? editingItem.id : Date.now(),
              image: formData.get('image') as string || 'https://picsum.photos/seed/look/800/1000',
              caption: formData.get('caption') as string,
              tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(t => t),
              initialLikes: editingItem ? editingItem.initialLikes : 0,
              initialComments: editingItem ? editingItem.initialComments : 0,
              status: editingItem?.status || 'active'
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newLookbook.updatedAt = now;
              newLookbook.createdAt = editingItem.createdAt || now;
          } else {
              newLookbook.createdAt = now;
              newLookbook.updatedAt = now;
          }
          if (editingItem) {
              updateLookbook(editingItem.id, newLookbook);
          } else {
              addLookbook(newLookbook);
          }
      } else if (modalType === 'blog') {
          const newBlog: any = {
              id: editingItem ? editingItem.id : `b${Date.now()}`,
              title: formData.get('title') as string,
              category: formData.get('category') as string,
              date: new Date().toLocaleDateString(),
              image: formData.get('image') as string || 'https://picsum.photos/seed/blog/800/600',
              excerpt: formData.get('excerpt') as string,
              content: formData.get('content') as string,
              status: editingItem?.status || 'published'
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newBlog.updatedAt = now;
              newBlog.createdAt = editingItem.createdAt || now;
          } else {
              newBlog.createdAt = now;
              newBlog.updatedAt = now;
          }
          if (editingItem) {
              updateBlogPost(editingItem.id, newBlog);
          } else {
              addBlogPost(newBlog);
          }
      } else if (modalType === 'customer-group') {
          const newGroup: any = {
              id: editingItem ? editingItem.id : `group-${Date.now()}`,
              name: formData.get('name') as string,
              discountPercentage: Number(formData.get('discountPercentage')),
              status: editingItem?.status || 'active'
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newGroup.updatedAt = now;
              newGroup.createdAt = editingItem.createdAt || now;
          } else {
              newGroup.createdAt = now;
              newGroup.updatedAt = now;
          }
          if (editingItem) {
              updateCustomerGroup(editingItem.id, newGroup);
          } else {
              addCustomerGroup(newGroup);
          }
      } else if (modalType === 'tax') {
          const newTax: any = {
              id: editingItem ? editingItem.id : `tax-${Date.now()}`,
              name: formData.get('name') as string,
              rate: Number(formData.get('rate')),
              country: formData.get('country') as string,
              status: editingItem?.status || 'active'
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newTax.updatedAt = now;
              newTax.createdAt = editingItem.createdAt || now;
          } else {
              newTax.createdAt = now;
              newTax.updatedAt = now;
          }
          if (editingItem) {
              updateTaxRule(editingItem.id, newTax);
          } else {
              addTaxRule(newTax);
          }
      } else if (modalType === 'shipping') {
          const newShipping: any = {
              id: editingItem ? editingItem.id : `ship-${Date.now()}`,
              name: formData.get('name') as string,
              price: Number(formData.get('price')),
              delay: formData.get('delay') as string,
              condition: formData.get('condition') as string,
              status: editingItem?.status || 'active'
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newShipping.updatedAt = now;
              newShipping.createdAt = editingItem.createdAt || now;
          } else {
              newShipping.createdAt = now;
              newShipping.updatedAt = now;
          }
          if (editingItem) {
              updateShippingRule(editingItem.id, newShipping);
          } else {
              addShippingRule(newShipping);
          }
      } else if (modalType === 'nav_item') {
          const newNavItem: any = {
              id: editingItem ? editingItem.id : `nav-${Date.now()}`,
              name: formData.get('name') as string,
              view: formData.get('view') as string,
              order: Number(formData.get('order')),
              status: formData.get('status') as 'active' | 'inactive' || 'active'
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newNavItem.updatedAt = now;
              newNavItem.createdAt = editingItem.createdAt || now;
              updateNavItem(editingItem.id, newNavItem);
          } else {
              newNavItem.createdAt = now;
              newNavItem.updatedAt = now;
              addNavItem(newNavItem);
          }
      } else if (modalType === 'catalog-rule') {
          const newRule: any = {
              id: editingItem ? editingItem.id : `rule-${Date.now()}`,
              name: formData.get('name') as string,
              condition: formData.get('condition') as string,
              discount: Number(formData.get('discount')),
              status: editingItem?.status || 'active'
          };
          const now = new Date().toISOString();
          if (editingItem) {
              newRule.updatedAt = now;
              newRule.createdAt = editingItem.createdAt || now;
          } else {
              newRule.createdAt = now;
              newRule.updatedAt = now;
          }
          if (editingItem) {
              updateCatalogRule(editingItem.id, newRule);
          } else {
              addCatalogRule(newRule);
          }
      } else if (modalType === 'inventory-adjustment') {
          const productId = formData.get('productId') as string;
          const quantityChange = Number(formData.get('quantityChange'));
          const product = localProducts.find(p => p.id === productId);
          
          if (product) {
              const newStock = (product.stock || 0) + quantityChange;
              await updateProduct(productId, { stock: newStock });
              toast.success(`Stock mis à jour pour ${product.name} (+${quantityChange})`);
          }
      }

      toast.success(editingItem ? 'Modifications enregistrées avec succès' : 'Élément ajouté avec succès');
      if (['category-create', 'category-edit'].includes(activeTab)) {
          setActiveTab('categories');
          setEditingItem(null);
      }
      setIsAddModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      toast.error('Une erreur est survenue');
    } finally {
      setIsSaving(false);
    }
  };
  const [orderFilter, setOrderFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [notificationFilter, setNotificationFilter] = useState('all');
  const [reviewFilter, setReviewFilter] = useState('all');
  const [logFilter, setLogFilter] = useState('all');
  const [requestLogFilter, setRequestLogFilter] = useState('all');
  const [messageInput, setMessageInput] = useState('');
  const [currentSlug, setCurrentSlug] = useState('');
  const [viewingCustomer, setViewingCustomer] = useState<UserType | null>(null);

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setLocalSystemNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
    
    // Redirect based on type
    if (notification.type === 'order') {
        if (notification.relatedId) {
            const order = localOrders.find(o => o.id === notification.relatedId);
            if (order) {
                setSelectedOrder(order);
                setActiveTab('order-detail');
            } else {
                setActiveTab('orders');
            }
        } else {
            setActiveTab('orders');
        }
    } else if (notification.type === 'stock') {
        if (notification.relatedId) {
            onNavigate('admin-product-detail', notification.relatedId);
        } else {
            setActiveTab('inventory');
        }
    } else if (notification.type === 'inquiry') {
        setActiveTab('messages');
        if (notification.relatedId) {
            const conv = CONVERSATIONS.find(c => c.userId === notification.relatedId);
            if (conv) {
                setSelectedConversation(conv);
            }
        }
    } else if (notification.type === 'customer') {
        if (notification.relatedId) {
            const customer = USERS.find(u => u.id === notification.relatedId);
            if (customer) {
                setSelectedCustomer(customer);
                setActiveTab('customers');
            } else {
                setActiveTab('customers');
            }
        } else {
            setActiveTab('customers');
        }
    }
  };

  useEffect(() => {
    const handleClientMessage = (event: CustomEvent) => {
      const msg = event.detail;
      if (selectedConversation && selectedConversation.userId === msg.senderId) {
        setSelectedConversation(prev => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...prev.messages, msg],
            lastMessage: msg.message,
            timestamp: msg.timestamp
          };
        });
      }
    };
    window.addEventListener('client-message', handleClientMessage as any);
    return () => window.removeEventListener('client-message', handleClientMessage as any);
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: ChatMessage = {
      id: `m${Date.now()}`,
      senderId: 'u2', // Admin ID
      senderName: 'Admin Laine',
      message: messageInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAdmin: true
    };

    setSelectedConversation(prev => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, newMessage],
        lastMessage: messageInput,
        timestamp: 'À l\'instant'
      };
    });

    // Dispatch event for client to see
    window.dispatchEvent(new CustomEvent('admin-message', { detail: newMessage }));

    setMessageInput('');
    toast.success('Message envoyé');
  };
  const [categoryPage, setCategoryPage] = useState(1);
  const [notificationPage, setNotificationPage] = useState(1);
  const itemsPerPage = 5;
  const [overviewOrderFilter, setOverviewOrderFilter] = useState('all');

  const totalSales = ORDERS.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrdersCount = ORDERS.length;
  const totalCustomers = localUsers.length;
  const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalSales / totalOrdersCount) : 0;

  const stats = [
    { label: 'Ventes Totales', value: `${totalSales.toLocaleString('fr-FR')} FCFA`, change: '+12.5%', isUp: true, icon: <TrendingUp size={20} /> },
    { label: 'Commandes', value: totalOrdersCount.toString(), change: '+5.2%', isUp: true, icon: <ShoppingBag size={20} /> },
    { label: 'Nouveaux Clients', value: totalCustomers.toString(), change: '+2.4%', isUp: true, icon: <Users size={20} /> },
    { label: 'Panier Moyen', value: `${averageOrderValue.toLocaleString('fr-FR')} FCFA`, change: '+8.1%', isUp: true, icon: <BarChart3 size={20} /> },
  ];

  const menuItems = [
    { id: 'overview', label: 'Tableau de bord', icon: <LayoutDashboard size={20} /> },
    
    // Ventes
    { id: 'sales_header', label: 'VENTES', isHeader: true },
    { id: 'orders', label: 'Commandes', icon: <ShoppingBag size={20} /> },
    { id: 'rmas', label: 'Retours (RMA)', icon: <RefreshCcw size={20} /> },
    { id: 'abandoned-carts', label: 'Paniers Abandonnés', icon: <ShoppingCart size={20} /> },
    { id: 'finances', label: 'Finances', icon: <TrendingUp size={20} /> },
    
    // Catalogue
    { id: 'catalog_header', label: 'CATALOGUE', isHeader: true },
    { id: 'products', label: 'Produits', icon: <Package size={20} /> },
    { id: 'categories', label: 'Catégories', icon: <LayoutDashboard size={20} /> },
    { id: 'inventory', label: 'Gestion Stock', icon: <Package size={20} /> },
    { id: 'flash-sales', label: 'Ventes Flash', icon: <Tag size={20} /> },
    { id: 'lookbooks', label: 'Lookbooks', icon: <ImageIcon size={20} /> },
    { id: 'reviews', label: 'Avis Clients', icon: <Star size={20} /> },
    { id: 'catalog-rules', label: 'Règles de Prix', icon: <Tag size={20} /> },
    
    // Contenu
    { id: 'content_header', label: 'CONTENU', isHeader: true },
    { id: 'packs', label: 'Packs', icon: <ShoppingBag size={20} /> },
    { id: 'lookbook', label: 'Lookbook', icon: <ImageIcon size={20} /> },
    { id: 'blog', label: 'Blog', icon: <FileText size={20} /> },
    { id: 'faq', label: 'FAQ', icon: <HelpCircle size={20} /> },
    
    // Clients
    { id: 'customers_header', label: 'CLIENTS', isHeader: true },
    { id: 'customers', label: 'Clients', icon: <Users size={20} /> },
    { id: 'customer-groups', label: 'Groupes Clients', icon: <Users size={20} /> },
    { id: 'loyalty', label: 'Fidélité & Badges', icon: <Award size={20} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={20} /> },
    
    // Marketing
    { id: 'marketing_header', label: 'MARKETING', isHeader: true },
    { id: 'navigation', label: 'Navigation Menu', icon: <Menu size={20} /> },
    { id: 'qr', label: 'QR Landing', icon: <QrCode size={20} /> },
    { id: 'coupons', label: 'Coupons', icon: <Ticket size={20} /> },
    { id: 'events', label: 'Évènements & Promos', icon: <CalendarIcon size={20} /> },
    { id: 'emails', label: 'Emails', icon: <Mail size={20} /> },
    { id: 'newsletter', label: 'Newsletter', icon: <Mail size={20} /> },
    { id: 'push-notifications', label: 'Notifications Push', icon: <Bell size={20} /> },
    
    // Rapports
    { id: 'reports_header', label: 'RAPPORTS', isHeader: true },
    { id: 'stats', label: 'Statistiques', icon: <BarChart3 size={20} /> },
    { id: 'analytics', label: 'Analytique Avancée', icon: <TrendingUp size={20} /> },
    
    // Système
    { id: 'system_header', label: 'SYSTÈME', isHeader: true },
    { id: 'site', label: 'Configuration Site', icon: <Settings size={20} /> },
    { id: 'taxes', label: 'Taxes (TVA)', icon: <Percent size={20} /> },
    { id: 'shipping', label: 'Livraison', icon: <Truck size={20} /> },
    { id: 'cities', label: 'Villes & Tarifs', icon: <MapPin size={20} /> },
    { id: 'import-export', label: 'Import / Export', icon: <Download size={20} /> },
    { id: 'users', label: 'Utilisateurs Admin', icon: <Shield size={20} /> },
    { id: 'roles', label: 'Rôles', icon: <Lock size={20} /> },
    { id: 'logs', label: 'Historique & Logs', icon: <History size={20} /> },
    { id: 'notifications', label: 'Notifications Système', icon: <Bell size={20} /> },
  ];

  return (
    <div className="h-[100dvh] overflow-hidden bg-secondary/50 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-primary text-white flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 overflow-y-auto custom-scrollbar shadow-2xl shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex justify-between items-center flex-shrink-0">
          <div>
            <h1 className="text-2xl font-serif font-bold">Admin Panel</h1>
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mt-1">Atelier de Doleres</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-primary/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-grow px-4 space-y-2 mt-4 lg:mt-0">
          {menuItems.map((item) => (
            item.isHeader ? (
              <div key={item.id} className="pt-6 pb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-white/40">
                {item.label}
              </div>
            ) : (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  (activeTab === item.id || (item.id === 'products' && (activeTab === 'product-create' || activeTab === 'product-edit'))) ? 'bg-card text-primary shadow-lg' : 'text-white/60 hover:text-white hover:bg-primary/5'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </button>
            )
          ))}
        </nav>

        <div className="p-8 border-t border-white/10">
          <button 
            onClick={async () => {
              if (user) {
                await addDoc(collection(db, 'log'), {
                  userId: user.uid,
                  method: 'LOGOUT',
                  path: 'admin',
                  statusCode: 200,
                  duration: 0,
                  timestamp: new Date().toISOString(),
                  device: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
                  browser: navigator.userAgent
                });
              }
              toast.info('Déconnexion...');
              await signOut(auth);
              setTimeout(() => onNavigate('login'), 1000);
            }}
            className="flex items-center gap-4 text-white/60 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow p-4 lg:p-10 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 bg-secondary/80 backdrop-blur-md py-4 -mx-4 px-4 lg:-mx-10 lg:px-10 border-b border-primary/10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="lg:hidden p-2 text-primary/60 hover:text-primary transition-colors bg-card rounded-xl shadow-sm border border-primary/10"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-3xl font-serif text-primary">
                {menuItems.find(m => m.id === activeTab)?.label || (
                  activeTab === 'rma-detail' ? 'Détails du Retour' :
                  activeTab === 'product-edit' ? 'Modifier le Produit' :
                  activeTab === 'product-create' ? 'Créer un Produit' :
                  activeTab === 'customer-detail' ? 'Détails Client' :
                  activeTab === 'order-detail' ? 'Détails Commande' :
                  ''
                )}
              </h2>
              <p className="text-primary/60">Bienvenue, Admin. Voici ce qui se passe aujourd'hui.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60" size={18} />
              <input
                type="text"
                placeholder="Rechercher (CMD, Produit...)"
                className="pl-10 pr-4 py-2 bg-card border border-primary/10 rounded-xl focus:outline-none focus:border-primary w-full md:w-64"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const query = e.currentTarget.value.trim();
                    if (!query) return;

                    const matchedOrders = orderSearch.search(query);
                    const matchedProducts = productSearch.search(query);
                    const matchedUsers = userSearch.search(query);

                    const totalMatches = matchedOrders.length + matchedProducts.length + matchedUsers.length;

                    if (totalMatches === 0) {
                      setSearchResults([]);
                      setActiveTab('search-results');
                      toast.info("Aucun résultat trouvé");
                      return;
                    }

                    // If exactly one match across all types, navigate directly
                    if (totalMatches === 1) {
                      if (matchedOrders.length === 1) {
                        setSelectedOrder(matchedOrders[0]);
                        setActiveTab('order-detail');
                        toast.success(`Commande ${matchedOrders[0].id} trouvée`);
                        return;
                      }
                      if (matchedUsers.length === 1) {
                        setActiveTab('customers');
                        setSelectedCustomer(matchedUsers[0]);
                        toast.success(`Client trouvé: ${matchedUsers[0].name}`);
                        return;
                      }
                      if (matchedProducts.length === 1) {
                        setSearchResults(matchedProducts.map(p => ({ ...p, _searchType: 'product' })));
                        setActiveTab('search-results');
                        toast.success(`Produit trouvé: ${matchedProducts[0].name}`);
                        return;
                      }
                    }

                    // Multiple matches or multiple products, show unified results
                    const allResults = [
                      ...matchedProducts.map(p => ({ ...p, _searchType: 'product' })),
                      ...matchedOrders.map(o => ({ ...o, _searchType: 'order' })),
                      ...matchedUsers.map(u => ({ ...u, _searchType: 'user' }))
                    ];

                    setSearchResults(allResults);
                    setActiveTab('search-results');
                    toast.success(`${allResults.length} résultat(s) trouvé(s)`);
                  }
                }}
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 transition-colors ${showNotifications ? 'text-primary' : 'text-primary/60 hover:text-primary'}`}
              >
                <Bell size={20} />
                {localSystemNotifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-700 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
                    {localSystemNotifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-80 bg-card rounded-3xl shadow-2xl border border-primary/10 z-[60] overflow-hidden"
                  >
                    <div className="p-6 border-b border-primary/5 flex justify-between items-center bg-secondary/50">
                      <h4 className="font-serif font-bold text-primary">Notifications</h4>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-accent bg-primary/5 px-2 py-1 rounded-full">
                        {localSystemNotifications.filter(n => !n.read).length} Nouvelles
                      </span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {localSystemNotifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          onClick={() => {
                            handleNotificationClick(notif);
                            setShowNotifications(false);
                          }}
                          className={`p-6 border-b border-primary/5 flex gap-4 hover:bg-secondary/50 transition-colors cursor-pointer ${!notif.read ? 'bg-primary/5' : ''}`}
                        >
                          <div className={`p-3 rounded-xl flex-shrink-0 ${
                            notif.type === 'order' ? 'bg-green-200 text-green-800' :
                            notif.type === 'stock' ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'
                          }`}>
                            {notif.type === 'order' ? <CheckCircle2 size={18} /> : 
                             notif.type === 'stock' ? <AlertCircle size={18} /> : <MessageSquare size={18} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-primary mb-1">{notif.title}</p>
                            <p className="text-xs text-primary/60 leading-relaxed mb-2">{notif.message}</p>
                            <p className="text-[10px] text-primary/60 font-medium">{notif.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => { setShowNotifications(false); setActiveTab('notifications'); }}
                      className="w-full py-4 text-xs font-bold text-primary hover:bg-secondary/50 transition-colors border-t border-primary/5"
                    >
                      Voir toutes les notifications
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button 
              onClick={() => setActiveTab('user-profile')}
              className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold shadow-md flex-shrink-0 hover:bg-primary transition-all"
            >
              AD
            </button>
          </div>
        </header>

        {/* Modals */}
        <Modal 
          isOpen={(isAddModalOpen || !!editingItem) && !['rma-detail', 'product-edit', 'product-create', 'category-create', 'category-edit'].includes(activeTab)} 
          onClose={() => { setIsAddModalOpen(false); setEditingItem(null); }} 
          title={
            editingItem ? `Modifier ${editingItem.name || editingItem.title || editingItem.subject || 'l\'élément'}` :
            modalType === 'inventory-adjustment' ? 'Réapprovisionnement Stock' :
            modalType === 'category' ? 'Nouvelle Catégorie' : 
            modalType === 'badge' ? 'Modifier le Badge' :
            modalType === 'loyalty-config' ? 'Configuration Fidélité' :
            modalType === 'event' ? 'Créer un Évènement' : 
            modalType === 'pack' ? 'Ajouter un Pack' :
            modalType === 'currency' ? 'Ajouter une Devise' :
            modalType === 'notification' ? 'Nouvelle Notification' :
            modalType === 'lookbook' ? 'Ajouter au Lookbook' :
            modalType === 'blog' ? 'Nouvel Article' : 'Nouvel Email'
          }
        >
          <form className="space-y-6" onSubmit={handleFormSubmit}>
            {modalType === 'inventory-adjustment' && (
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4 p-6 bg-primary/5 rounded-3xl border border-primary/10">
                   <p className="text-sm text-primary/60 italic leading-relaxed">
                     Sélectionnez un produit et indiquez la quantité à ajouter au stock actuel.
                   </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Produit</label>
                  <select name="productId" className="input-field" required>
                    <option value="">-- Sélectionner un produit --</option>
                    {localProducts.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stock actuel: {p.stock})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Quantité à ajouter</label>
                  <input 
                    name="quantityChange" 
                    type="number" 
                    min="1" 
                    className="input-field" 
                    placeholder="Ex: 50" 
                    required 
                  />
                </div>
              </div>
            )}
            {modalType === 'pack' && (
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Nom du pack</label>
                  <input name="name" type="text" className="input-field" defaultValue={editingItem?.name} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Description</label>
                  <textarea name="description" className="input-field" defaultValue={editingItem?.description} required />
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Réduction (%)</label>
                        <input name="discountPercentage" type="number" min="0" max="100" className="input-field" defaultValue={editingItem?.discountPercentage || 10} required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Code Promo (Auto)</label>
                        <input name="promoCode" type="text" className="input-field" defaultValue={editingItem?.promoCode} placeholder="Généré automatiquement si vide" />
                    </div>
                </div>
                <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Produits du Pack (Max 4)</label>
                    <div className="space-y-3">
                        {selectedPackProducts.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-center bg-secondary/50 p-4 rounded-2xl border border-primary/10">
                                <select 
                                    value={item.productId} 
                                    onChange={(e) => {
                                        const newProducts = [...selectedPackProducts];
                                        newProducts[idx].productId = e.target.value;
                                        setSelectedPackProducts(newProducts);
                                    }}
                                    className="flex-grow bg-transparent font-medium focus:outline-none"
                                >
                                    {localProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-primary/60 font-bold">Qté:</span>
                                    <input 
                                        type="number" 
                                        min="1"
                                        value={item.quantity} 
                                        onChange={(e) => {
                                            const newProducts = [...selectedPackProducts];
                                            newProducts[idx].quantity = Number(e.target.value);
                                            setSelectedPackProducts(newProducts);
                                        }}
                                        className="w-16 px-3 py-2 bg-card rounded-xl border border-primary/10 text-center font-bold"
                                    />
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => setSelectedPackProducts(prev => prev.filter((_, i) => i !== idx))}
                                    className="w-8 h-8 rounded-full bg-red-200 text-red-700 flex items-center justify-center hover:bg-red-200 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                    {selectedPackProducts.length < 4 && (
                        <button 
                            type="button" 
                            onClick={() => setSelectedPackProducts(prev => [...prev, { productId: localProducts[0]?.id || '', quantity: 1 }])}
                            className="w-full py-4 border-2 border-dashed border-primary/10 rounded-2xl text-primary/60 font-bold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={20} /> Ajouter un produit
                        </button>
                    )}
                </div>
              </div>
            )}
            {modalType === 'nav_item' && (
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Nom du lien</label>
                  <input name="name" type="text" className="input-field" defaultValue={editingItem?.name} required />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Vue / Chemin</label>
                    <input name="view" type="text" className="input-field" defaultValue={editingItem?.view} placeholder="ex: shop, contact..." required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Ordre d'affichage</label>
                    <input name="order" type="number" className="input-field" defaultValue={editingItem?.order || 1} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Statut</label>
                  <select name="status" className="input-field" defaultValue={editingItem?.status || 'active'}>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>
            )}
            {modalType === 'user' && (
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Nom complet</label>
                  <input name="name" type="text" className="input-field" defaultValue={editingItem?.name} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Email</label>
                  <input name="email" type="email" className="input-field" defaultValue={editingItem?.email} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Mot de passe</label>
                  <input name="password" type="password" className="input-field" placeholder={editingItem ? "Laisser vide pour ne pas changer" : "Mot de passe"} required={!editingItem} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Rôle</label>
                  <select name="role" className="input-field" defaultValue={editingItem?.role}>
                    {localRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    <option value="customer">Client</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Points de fidélité</label>
                  <input name="points" type="number" className="input-field" defaultValue={editingItem?.points || 0} />
                </div>
              </div>
            )}
            {modalType === 'role' && (
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Nom du rôle</label>
                  <input name="name" type="text" className="input-field" defaultValue={editingItem?.name} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Description</label>
                  <textarea name="description" className="input-field" defaultValue={editingItem?.description} required />
                </div>
              </div>
            )}
            {modalType === 'currency' && (
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Code</label>
                  <input name="code" type="text" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl" defaultValue={editingItem?.code} placeholder="USD" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Nom de la devise</label>
                  <input name="name" type="text" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl" defaultValue={editingItem?.name} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Symbole</label>
                  <input name="symbol" type="text" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl" defaultValue={editingItem?.symbol} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Taux</label>
                  <input name="rate" type="number" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl" defaultValue={editingItem?.rate} />
                </div>
              </div>
            )}
            {modalType === 'notification' && (
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Titre</label>
                  <input name="title" type="text" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl" defaultValue={editingItem?.title} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Message</label>
                  <textarea name="message" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl h-32" defaultValue={editingItem?.message} required />
                </div>
                 <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Cible</label>
                  <select name="target" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl" defaultValue={editingItem?.target || 'all'}>
                    <option value="all">Tous les utilisateurs</option>
                    <option value="specific">Utilisateur spécifique</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Statut</label>
                  <select name="status" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl" defaultValue={editingItem?.status || 'draft'}>
                    <option value="draft">Brouillon</option>
                    <option value="scheduled">Planifié</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>
            )}
            {modalType === 'email' && (
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Sujet</label>
                  <input name="subject" type="text" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl" defaultValue={editingItem?.subject} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Destinataire</label>
                  <input name="recipient" type="email" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl" defaultValue={editingItem?.recipient} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Contenu</label>
                  <textarea name="content" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl" defaultValue={editingItem?.content} />
                </div>
              </div>
            )}
            {modalType === 'customer' && (
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Nom complet</label>
                  <input name="name" type="text" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl" defaultValue={editingItem?.name} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Email</label>
                  <input name="email" type="email" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl" defaultValue={editingItem?.email} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Rôle</label>
                  <select name="role" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl" defaultValue={editingItem?.role || 'customer'}>
                    <option value="customer">Client</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>
            )}
            {modalType === 'category' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Nom de la catégorie</label>
                    <input 
                      name="name"
                      type="text" 
                      className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary" 
                      placeholder="Décoration Murale..." 
                      defaultValue={editingItem?.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                        setCurrentSlug(slug);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Slug (URL)</label>
                    <input 
                      name="slug"
                      type="text" 
                      className="w-full px-6 py-4 bg-secondary/10 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary text-primary/60 italic" 
                      placeholder="genere-automatiquement" 
                      value={currentSlug}
                      onChange={(e) => setCurrentSlug(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Image de couverture (URL)</label>
                  <input 
                    name="image"
                    type="text" 
                    className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary" 
                    placeholder="https://..." 
                    defaultValue={editingItem?.image}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Statut</label>
                  <select name="status" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary" defaultValue={editingItem?.status || 'active'}>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>
            )}

            {modalType === 'event' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Nom de l'évènement</label>
                    <input 
                      name="name"
                      type="text" 
                      className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary" 
                      placeholder="Soldes d'Été..." 
                      defaultValue={editingItem?.name}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Date de début</label>
                    <input 
                      name="startDate"
                      type="datetime-local" 
                      className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary" 
                      defaultValue={editingItem?.startDate}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Date de fin</label>
                    <input 
                      name="endDate"
                      type="datetime-local" 
                      className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary" 
                      defaultValue={editingItem?.endDate}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Pourcentage de remise (%)</label>
                    <input 
                      name="discountPercentage"
                      type="number" 
                      className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary" 
                      placeholder="20" 
                      defaultValue={editingItem?.discountPercentage}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Portée</label>
                    <select 
                      name="applyToAll"
                      className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary"
                      defaultValue={editingItem?.applyToAll ? 'all' : 'specific'}
                    >
                      <option value="all">Tous les produits</option>
                      <option value="specific">Produits spécifiques</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {modalType === 'expense' && (
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Description</label>
                  <input name="description" type="text" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary" defaultValue={editingItem?.description} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Montant (FCFA)</label>
                  <input name="amount" type="number" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary" defaultValue={editingItem?.amount} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Date</label>
                  <input name="date" type="date" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary" defaultValue={editingItem?.date} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Catégorie</label>
                  <select name="category" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary" defaultValue={editingItem?.category || 'other'}>
                    <option value="stock">Achat Stock</option>
                    <option value="transport">Transport / Livraison</option>
                    <option value="marketing">Marketing / Pub</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>
            )}

            {modalType === 'lookbook' && (
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Image URL</label>
                  <input name="image" type="text" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary" defaultValue={editingItem?.image} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Légende</label>
                  <textarea name="caption" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary" defaultValue={editingItem?.caption} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Tags (IDs de produits, séparés par des virgules)</label>
                  <input name="tags" type="text" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary" defaultValue={editingItem?.tags?.join(', ')} placeholder="p1, p2, p3" />
                </div>
              </div>
            )}

            {modalType === 'blog' && (
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Titre</label>
                  <input name="title" type="text" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary" defaultValue={editingItem?.title} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Catégorie</label>
                  <input name="category" type="text" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary" defaultValue={editingItem?.category} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Image URL</label>
                  <input name="image" type="text" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary" defaultValue={editingItem?.image} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Extrait</label>
                  <textarea name="excerpt" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary" defaultValue={editingItem?.excerpt} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Contenu</label>
                  <textarea name="content" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary h-32" defaultValue={editingItem?.content} required />
                </div>
              </div>
            )}

            {modalType === 'customer-group' && (
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Nom du groupe</label>
                  <input name="name" type="text" className="input-field" defaultValue={editingItem?.name} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Réduction (%)</label>
                  <input name="discountPercentage" type="number" className="input-field" defaultValue={editingItem?.discountPercentage} required />
                </div>
              </div>
            )}
            {modalType === 'badge' && (
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Nom du badge</label>
                  <input name="name" type="text" className="input-field" defaultValue={editingItem?.name} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Icône (Emoji)</label>
                  <input name="icon" type="text" className="input-field" defaultValue={editingItem?.icon} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Description</label>
                  <input name="description" type="text" className="input-field" defaultValue={editingItem?.description} required />
                </div>
              </div>
            )}
            {modalType === 'loyalty-config' && (
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Points par achat</label>
                  <input name="pointsPerPurchase" type="number" className="input-field" defaultValue={editingItem?.pointsPerPurchase} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Points par avis</label>
                  <input name="pointsPerReview" type="number" className="input-field" defaultValue={editingItem?.pointsPerReview} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Niveaux (Points min par groupe)</label>
                  {editingItem?.levels?.map((level: any, index: number) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <select name={`groupId-${index}`} className="input-field" defaultValue={level.groupId}>
                        {INITIAL_CUSTOMER_GROUPS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                      <input name={`minPoints-${index}`} type="number" className="input-field" defaultValue={level.minPoints} required />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {modalType === 'tax' && (
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Nom de la taxe</label>
                  <input name="name" type="text" className="input-field" defaultValue={editingItem?.name} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Taux (%)</label>
                  <input name="rate" type="number" className="input-field" defaultValue={editingItem?.rate} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Pays</label>
                  <input name="country" type="text" className="input-field" defaultValue={editingItem?.country} required />
                </div>
              </div>
            )}
            {modalType === 'shipping' && (
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Nom de la méthode</label>
                  <input name="name" type="text" className="input-field" defaultValue={editingItem?.name} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Prix (FCFA)</label>
                  <input name="price" type="number" className="input-field" defaultValue={editingItem?.price} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Délai</label>
                  <input name="delay" type="text" className="input-field" defaultValue={editingItem?.delay} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Condition</label>
                  <input name="condition" type="text" className="input-field" defaultValue={editingItem?.condition} placeholder="ex: Pour tout achat > 50 000 FCFA" />
                </div>
              </div>
            )}
            {modalType === 'catalog-rule' && (
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Nom de la règle</label>
                  <input name="name" type="text" className="input-field" defaultValue={editingItem?.name} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Condition</label>
                  <input name="condition" type="text" className="input-field" defaultValue={editingItem?.condition} required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Réduction (%)</label>
                  <input name="discount" type="number" className="input-field" defaultValue={editingItem?.discount} required />
                </div>
              </div>
            )}

            {editingItem && (
              <div className="flex gap-4 text-xs text-primary/60 font-mono bg-secondary/50 p-4 rounded-xl border border-primary/10">
                <div><span className="font-bold text-primary/60">Créé le:</span> {formatDate(editingItem.createdAt)}</div>
                <div><span className="font-bold text-primary/60">Modifié le:</span> {formatDate(editingItem.updatedAt)}</div>
              </div>
            )}

            <div className="pt-6 flex gap-4">
              {editingItem && (
                <button 
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingItem(null);
                    toast.success('Élément supprimé avec succès !');
                  }}
                  className="flex-grow py-4 bg-red-200 text-red-800 rounded-2xl font-bold hover:bg-red-200 transition-all"
                >
                  Supprimer
                </button>
              )}
              <button type="button" onClick={() => { setIsAddModalOpen(false); setEditingItem(null); }} className="flex-grow py-4 bg-secondary/50 text-primary/60 rounded-2xl font-bold hover:bg-secondary/70 transition-all border border-primary/10">
                Annuler
              </button>
              <button 
                type="submit" 
                disabled={isSaving}
                className="flex-grow py-4 bg-primary text-white rounded-2xl font-bold hover:bg-accent transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader text="" /> : (editingItem ? 'Enregistrer les modifications' : 'Confirmer l\'ajout')}
              </button>
            </div>
          </form>
        </Modal>



        {/* Customer Details Modal */}
        <Modal
          isOpen={!!selectedCustomer && activeTab !== 'customer-detail'}
          onClose={() => setSelectedCustomer(null)}
          title={`Profil Client: ${selectedCustomer?.name}`}
        >
          {selectedCustomer && (
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-[2rem] bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold shadow-inner">
                  {selectedCustomer.name[0]}
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-primary">{selectedCustomer.name}</h3>
                  <p className="text-primary/60">{selectedCustomer.email}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest">Actif</span>
                    <span className="px-3 py-1 bg-secondary/50 text-primary/60 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/5">Client depuis {new Date(selectedCustomer.joinDate).getFullYear()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-secondary/50 p-6 rounded-3xl border border-primary/10 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1">Commandes</p>
                  <p className="text-2xl font-bold text-primary">{selectedCustomer.orders}</p>
                </div>
                <div className="bg-secondary/50 p-6 rounded-3xl border border-primary/10 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1">Total Dépensé</p>
                  <p className="text-2xl font-bold text-primary">{(selectedCustomer.orders * 15000).toLocaleString()} FCFA</p>
                </div>
                <div className="bg-secondary/50 p-6 rounded-3xl border border-primary/10 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1">Points</p>
                  <p className="text-2xl font-bold text-accent">450</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary/60">Dernières Commandes</h4>
                <div className="space-y-2">
                  {localOrders.filter(o => o.customer === selectedCustomer.name).map(order => (
                    <div key={order.id} className="flex justify-between items-center p-4 bg-card border border-primary/10 rounded-2xl">
                      <div>
                        <p className="font-bold text-sm text-primary">{order.id}</p>
                        <p className="text-xs text-primary/60">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-primary">{order.total.toLocaleString()} FCFA</p>
                        <span className="text-[10px] font-bold uppercase text-primary/80">{order.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {editingItem && (
                <div className="flex gap-4 text-xs text-primary/60 font-mono bg-secondary/50 p-4 rounded-xl mb-4 border border-primary/5">
                  <div><span className="font-bold text-primary/60">Créé le:</span> {formatDate(editingItem.createdAt)}</div>
                  <div><span className="font-bold text-primary/60">Modifié le:</span> {formatDate(editingItem.updatedAt)}</div>
                </div>
              )}

              <div className="pt-6 flex gap-4">
                <button className="flex-grow py-4 bg-secondary/50 text-primary/60 rounded-2xl font-bold hover:bg-secondary/70 transition-all border border-primary/10">
                  Désactiver le compte
                </button>
                <button className="flex-grow py-4 bg-primary text-white rounded-2xl font-bold hover:bg-accent transition-all shadow-lg">
                  Envoyer un message
                </button>
              </div>
            </div>
          )}
        </Modal>

        {activeTab === 'search-results' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold">Résultats de recherche ({searchResults.length})</h2>
              <button 
                onClick={() => setActiveTab('overview')} 
                className="text-primary/60 hover:text-primary transition-colors flex items-center gap-2"
              >
                <X size={18} /> Fermer
              </button>
            </div>
            
            {searchResults.length === 0 ? (
              <div className="text-center py-24 bg-card rounded-[3rem] border border-primary/10">
                <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/5">
                  <Search size={32} className="text-primary/30" />
                </div>
                <h3 className="text-xl font-serif font-bold text-primary mb-2">Aucun résultat trouvé</h3>
                <p className="text-primary/60">Essayez avec un autre terme de recherche.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map(item => {
                  if (item._searchType === 'product') {
                    return (
                      <div 
                        key={item.id} 
                        onClick={() => onNavigate('admin-product-detail', item.id)}
                        className="bg-card p-4 rounded-[2rem] border border-primary/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
                      >
                        <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-secondary/50 relative border border-primary/5">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                          <div className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-primary shadow-sm border border-primary/10">
                            Produit
                          </div>
                        </div>
                        <div className="space-y-2 px-2 pb-2">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-primary group-hover:text-primary transition-colors line-clamp-1">{item.name}</h3>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-primary font-mono">{item.price.toLocaleString()} FCFA</span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${item.stock > 0 ? 'bg-primary/10 text-primary' : 'bg-secondary/50 text-primary/40 border border-primary/5'}`}>
                              {item.stock > 0 ? 'En stock' : 'Rupture'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  if (item._searchType === 'order') {
                    return (
                      <div 
                        key={item.id} 
                        onClick={() => {
                          setSelectedOrder(item);
                          setActiveTab('order-detail');
                        }}
                        className="bg-card p-6 rounded-[2rem] border border-primary/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                            <ShoppingBag size={24} />
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                            item.status === 'completed' ? 'bg-primary/10 text-primary' :
                            item.status === 'pending' ? 'bg-accent/20 text-accent' :
                            'bg-primary/5 text-primary/70'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-primary mb-1">Commande {item.id}</h3>
                          <p className="text-sm text-primary/60 mb-4">{item.customerName}</p>
                          <div className="flex justify-between items-center pt-4 border-t border-primary/5">
                            <span className="text-xs text-primary/60">{item.date}</span>
                            <span className="font-bold text-primary font-mono">{item.total.toLocaleString()} FCFA</span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (item._searchType === 'user') {
                    return (
                      <div 
                        key={item.id} 
                        onClick={() => {
                          setActiveTab('customers');
                          setSelectedCustomer(item);
                        }}
                        className="bg-card p-6 rounded-[2rem] border border-primary/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group flex items-center gap-4"
                      >
                        <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center text-primary shrink-0 border border-primary/5">
                          <Users size={28} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-primary truncate group-hover:text-primary transition-colors">{item.name}</h3>
                          <p className="text-sm text-primary/60 truncate">{item.email}</p>
                          <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-secondary/50 text-primary/60 rounded-lg border border-primary/5">
                            {item.role}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  
                  return null;
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-card p-6 rounded-3xl shadow-sm border border-primary/10"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-secondary/50 rounded-2xl text-primary border border-primary/5">{stat.icon}</div>
                    <span className={`flex items-center text-xs font-bold ${stat.isUp ? 'text-primary' : 'text-primary/60'}`}>
                      {stat.change}
                      {stat.isUp ? <ArrowUpRight size={14} className="ml-1" /> : <ArrowDownRight size={14} className="ml-1" />}
                    </span>
                  </div>
                  <p className="text-primary/60 text-sm mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-primary">{stat.value}</h3>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              {/* Recent Orders */}
              <div className="xl:col-span-2 min-w-0">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-serif">Commandes Récentes</h3>
                  <TabFilter 
                    options={[
                      { id: 'all', label: 'Toutes' },
                      { id: 'today', label: 'Aujourd\'hui' },
                      { id: 'yesterday', label: 'Hier' },
                    ]}
                    active={overviewOrderFilter}
                    onChange={setOverviewOrderFilter}
                    className="mb-0"
                  />
                </div>
                <DataTable<Order>
                  data={[...localOrders].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 10).filter(o => {
                    if (overviewOrderFilter === 'all') return true;
                    if (overviewOrderFilter === 'today') return o.date.includes('2024'); // Mock today
                    if (overviewOrderFilter === 'yesterday') return o.date.includes('2023'); // Mock yesterday
                    return true;
                  })}
                  onRowClick={(order) => {
                    setSelectedOrder(order);
                    setActiveTab('order-detail');
                  }}
                  columns={[
                    { header: 'ID', accessor: 'id', className: 'font-mono text-xs', sortable: true },
                    { header: 'Client', accessor: 'customer', className: 'font-medium', sortable: true },
                    { header: 'Date Opération', accessor: 'date', className: 'text-primary/60 text-sm', sortable: true },
                    { 
                      header: 'Total', 
                      accessor: (order: Order) => <span className="font-bold text-primary">{order.total.toLocaleString()} FCFA</span>,
                      exportValue: (order: Order) => `${order.total} FCFA`,
                      sortable: true,
                      sortKey: 'total'
                    },
                    { header: 'Statut', accessor: (order: Order) => <StatusBadge status={order.status} />, exportValue: (order: Order) => order.status, sortable: true, sortKey: 'status' },
                    { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm', sortable: true }
                  ]}
                />
              </div>

              {/* Best Sellers */}
              <div className="space-y-10 min-w-0">
                <div className="bg-card rounded-[2.5rem] shadow-sm border border-primary/10 p-8">
                  <h3 className="text-xl font-serif mb-8">Meilleures Ventes</h3>
                  <div className="space-y-6">
                    {PRODUCTS.slice(0, 4).map((product) => (
                      <div key={product.id} className="flex items-center gap-4">
                        <img src={product.image} alt={product.name} className="w-12 h-16 object-cover rounded-lg" referrerPolicy="no-referrer" />
                        <div className="flex-grow">
                          <h4 className="font-medium text-sm line-clamp-1 text-primary">{product.name}</h4>
                          <p className="text-primary/60 text-xs">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-primary">{product.price.toLocaleString()} FCFA</p>
                          <p className="text-[10px] text-primary font-bold">+12%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card rounded-[2.5rem] shadow-sm border border-primary/10 p-8">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-serif text-primary">Alertes Stock</h3>
                    <AlertCircle className="text-primary/60" size={20} />
                  </div>
                  <div className="space-y-4">
                    {PRODUCTS.filter(p => p.stock < 15).map((product) => (
                      <div key={product.id} className="flex items-center gap-4 p-4 bg-secondary/30 rounded-2xl border border-primary/5 shadow-sm">
                        <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-lg" referrerPolicy="no-referrer" />
                        <div className="flex-grow">
                          <h4 className="font-bold text-xs line-clamp-1 text-primary">{product.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-grow h-1 bg-secondary/50 rounded-full overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${(product.stock / 50) * 100}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-primary/80">{product.stock} restants</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 py-3 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-accent transition-all shadow-lg shadow-primary/10">
                    Commander du stock
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card p-8 rounded-[2rem] border border-primary/10 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Produits en Rupture</p>
                <p className="text-3xl font-serif font-bold text-primary">{localProducts.filter(p => p.stock === 0).length}</p>
              </div>
              <div className="bg-card p-8 rounded-[2rem] border border-primary/10 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Stock Faible (&lt; 10)</p>
                <p className="text-3xl font-serif font-bold text-accent">{localProducts.filter(p => p.stock > 0 && p.stock < 10).length}</p>
              </div>
              <div className="bg-card p-8 rounded-[2rem] border border-primary/10 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Valeur du Stock</p>
                <p className="text-3xl font-serif font-bold text-primary">
                  {localProducts.reduce((acc, p) => acc + (p.price * p.stock), 0).toLocaleString()} FCFA
                </p>
              </div>
            </div>

            <div className="bg-card rounded-[2rem] shadow-sm border border-primary/10 overflow-hidden">
              <div className="p-8 border-b border-primary/5 flex justify-between items-center">
                <h3 className="text-xl font-serif font-bold text-primary">État des Stocks</h3>
                <button onClick={() => { setModalType('inventory-adjustment'); setIsAddModalOpen(true); setEditingItem(null); }} className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-accent transition-all">
                  <Plus size={18} /> Réapprovisionner
                </button>
              </div>
              <DataTable 
                data={sortByDate(localProducts)}
                columns={[
                  { header: 'Produit', accessor: 'name', sortable: true },
                  { header: 'Catégorie', accessor: 'category', sortable: true },
                  { header: 'Stock', accessor: (p: any) => (
                    <span className={`font-bold ${p.stock === 0 ? 'text-primary' : p.stock < 10 ? 'text-accent' : 'text-primary/80'}`}>
                      {p.stock} unités
                    </span>
                  ), sortable: true, sortKey: 'stock' },
                  { header: 'Prix', accessor: (p: any) => `${p.price.toLocaleString()} FCFA`, sortable: true, sortKey: 'price' },
                  { 
                    header: 'Statut', 
                    accessor: (product: Product) => (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocalProducts(prev => prev.map(p => p.id === product.id ? { ...p, isAvailable: !p.isAvailable } : p));
                          toast.success(product.isAvailable ? 'Produit désactivé' : 'Produit activé');
                        }}
                        className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors border",
                          getStatusStyles(product.isAvailable ? 'active' : 'inactive')
                        )}
                      >
                        {product.isAvailable ? 'Actif' : 'Inactif'}
                      </button>
                    ),
                    sortable: true,
                    sortKey: 'isAvailable'
                  },
                  {
                    header: 'Actions',
                    accessor: (product: Product) => (
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingItem(product); setModalType('product'); }}
                          className="text-primary font-bold text-sm hover:underline"
                        >
                          Modifier
                        </button>
                      </div>
                    )
                  },
                { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm', sortable: true }
              ]}
                onRowClick={(p) => { setEditingItem(p); setModalType('product'); }}
              />
            </div>
          </div>
        )}

        {activeTab === 'loyalty' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card p-10 rounded-[3rem] border border-primary/10 shadow-sm">
                <h3 className="text-2xl font-serif font-bold text-primary mb-8 flex items-center gap-3">
                  <Star className="text-accent" />
                  Configuration des Points
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-secondary/50 rounded-2xl border border-primary/5">
                    <div>
                      <p className="font-bold text-primary">Points par achat</p>
                      <p className="text-xs text-primary/60">Nombre de points gagnés pour 1000 FCFA dépensés (ex: 10 pour 1% de fidélité)</p>
                    </div>
                    <p className="text-2xl font-bold text-primary">{siteConfig.loyaltyConfig.pointsPerPurchase}</p>
                  </div>
                  <div className="flex items-center justify-between p-6 bg-secondary/50 rounded-2xl border border-primary/5">
                    <div>
                      <p className="font-bold text-primary">Points par avis</p>
                      <p className="text-xs text-primary/60">Points offerts pour chaque avis publié</p>
                    </div>
                    <p className="text-2xl font-bold text-primary">{siteConfig.loyaltyConfig.pointsPerReview}</p>
                  </div>
                  <button 
                    onClick={() => { setEditingItem(siteConfig.loyaltyConfig); setModalType('loyalty-config'); setIsAddModalOpen(true); }}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-accent transition-all"
                  >
                    Modifier la configuration
                  </button>
                </div>
              </div>

              <div className="bg-card p-10 rounded-[3rem] border border-primary/10 shadow-sm">
                <h3 className="text-2xl font-serif font-bold text-primary mb-8 flex items-center gap-3">
                  <Award className="text-accent" />
                  Gestion des Badges
                </h3>
                <div className="space-y-4">
                  {siteConfig.loyaltyConfig.badges.map((badge) => (
                    <div key={badge.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-2xl border border-primary/10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-card rounded-full flex items-center justify-center text-xl shadow-sm border border-primary/5">
                          {badge.icon}
                        </div>
                        <p className="font-bold text-primary">{badge.name}</p>
                      </div>
                      <button 
                        onClick={() => { setEditingItem(badge); setModalType('badge'); setIsAddModalOpen(true); }}
                        className="text-xs font-bold text-primary hover:text-accent"
                      >
                        Modifier
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card rounded-[2rem] shadow-sm border border-primary/10 overflow-hidden">
              <div className="p-8 border-b border-primary/10">
                <h3 className="text-xl font-serif font-bold text-primary">Classement des Clients</h3>
              </div>
              <DataTable 
                data={sortByDate(localUsers)}
                columns={[
                  { header: 'Client', accessor: 'name', sortable: true },
                  { header: 'Email', accessor: 'email', sortable: true },
                  { header: 'Points', accessor: (u: any) => (
                    <span className="font-bold text-accent">{u.points || 0} pts</span>
                  ), sortable: true, sortKey: 'points' },
                  { header: 'Statut', accessor: (u: any) => (
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {u.role === 'admin' ? 'Administrateur' : 'Client'}
                    </span>
                  ), sortable: true, sortKey: 'role' },
                
                { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm', sortable: true }
              ]}
              />
            </div>
          </div>
        )}

        {activeTab === 'customer-groups' && (
          <div className="space-y-8">
            <div className="bg-card rounded-[2rem] shadow-sm border border-primary/10 overflow-hidden">
              <div className="p-8 border-b border-primary/5 flex justify-between items-center">
                <h3 className="text-xl font-serif font-bold text-primary">Groupes de Clients</h3>
                <button onClick={() => { setModalType('customer-group'); setIsAddModalOpen(true); setEditingItem(null); }} className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-accent transition-all">
                  <Plus size={18} /> Créer un groupe
                </button>
              </div>
              <DataTable 
                data={sortByDate(localCustomerGroups)}
                columns={[
                  { header: 'Nom du Groupe', accessor: 'name', sortable: true },
                  { header: 'Réduction (%)', accessor: 'discountPercentage', sortable: true },
                  { header: 'Nombre de Clients', accessor: (g: any) => localUsers.filter(u => u.groupId === g.id).length, sortable: true },
                  {
                    header: 'Actions',
                    accessor: (group: any) => (
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingItem(group); setModalType('customer-group'); setIsAddModalOpen(true); }}
                          className="text-primary font-bold text-sm hover:underline"
                        >
                          Modifier
                        </button>
                      </div>
                    )
                  },
                  { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm', sortable: true }
                ]}
                onRowClick={(g) => { setSelectedCustomerGroup(g); setActiveTab('customer-group-detail'); }}
              />
            </div>
          </div>
        )}

        {activeTab === 'customer-group-detail' && selectedCustomerGroup && (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveTab('customer-groups')} className="p-2 hover:bg-secondary/50 rounded-full transition-colors border border-transparent hover:border-primary/10">
                <ChevronLeft size={24} />
              </button>
              <h2 className="text-3xl font-serif font-bold text-primary">{selectedCustomerGroup.name}</h2>
            </div>
            <div className="bg-card rounded-[2rem] shadow-sm border border-primary/10 overflow-hidden">
              <div className="p-8 border-b border-primary/10">
                <h3 className="text-xl font-serif font-bold text-primary">Clients dans ce groupe</h3>
              </div>
              <DataTable 
                data={sortByDate(localUsers.filter(u => u.groupId === selectedCustomerGroup.id))}
                columns={[
                  { header: 'Nom', accessor: 'name', sortable: true },
                  { header: 'Email', accessor: 'email', sortable: true },
                  { header: 'Points', accessor: (u: any) => `${u.points || 0} pts`, sortable: true },
                  { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm', sortable: true }
                ]}
                onRowClick={(u) => { setSelectedCustomer(u); setActiveTab('customer-detail'); }}
              />
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <TabFilter 
              options={[
                { id: 'all', label: 'Tous' },
                { id: 'pending', label: 'En attente' },
                { id: 'processing', label: 'Traitement' },
                { id: 'shipped', label: 'Expédié' },
                { id: 'delivered', label: 'Livré' },
                { id: 'cancelled', label: 'Annulé' },
              ]}
              active={orderFilter}
              onChange={setOrderFilter}
            />
            <DataTable<Order>
              data={sortByDate(orderFilter === 'all' ? localOrders : localOrders.filter(o => o.status === orderFilter))}
              onRowClick={(order) => {
                setSelectedOrder(order);
                setActiveTab('order-detail');
              }}
              title="Liste des Commandes"
              columns={[
              { header: 'ID', accessor: 'id', className: 'font-mono text-xs', sortable: true },
              { header: 'Client', accessor: 'customer', className: 'font-medium', sortable: true },
              { header: 'Type', accessor: (order: Order) => order.type === 'custom' ? <span className="text-accent font-bold text-xs uppercase tracking-widest">Sur Mesure</span> : <span className="text-primary/60 text-xs uppercase tracking-widest">Standard</span>, sortable: true, sortKey: 'type' },
              { header: 'Date Opération', accessor: 'date', className: 'text-primary/60 text-sm', sortable: true },
              { 
                header: 'Total', 
                accessor: (order: Order) => <span className="font-bold text-primary">{order.total.toLocaleString()} FCFA</span>,
                exportValue: (order: Order) => `${order.total} FCFA`,
                sortable: true,
                sortKey: 'total'
              },
              {
                header: 'Statut',
                accessor: (order: Order) => (
                  <select
                    value={order.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={async (e) => {
                        const newStatus = e.target.value as any;
                        const oldStatus = order.status;
                        
                        setLocalOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
                        
                        // Database update
                        try {
                          // Find the actual doc in firestore
                          const ordersRef = collection(db, 'order');
                          const q = query(ordersRef, where('id', '==', order.id));
                          const snap = await getDocs(q);
                          if (!snap.empty) {
                            const orderDoc = snap.docs[0];
                            await updateDoc(doc(db, 'order', orderDoc.id), { 
                              status: newStatus,
                              updatedAt: new Date().toISOString()
                            });

                            // Logic for Referral Reward when marked as DELIVERED
                            if (newStatus === 'delivered' && oldStatus !== 'delivered' && order.userId) {
                              const userRef = doc(db, 'user', order.userId);
                              const userSnap = await getDoc(userRef);
                              
                              if (userSnap.exists()) {
                                const userData = userSnap.data();
                                const referralCode = userData.referredBy;
                                
                                if (referralCode) {
                                  // Check if this is the first delivered order
                                  const deliveredOrdersQuery = query(
                                    collection(db, 'order'), 
                                    where('userId', '==', order.userId), 
                                    where('status', '==', 'delivered')
                                  );
                                  const deliveredSnap = await getDocs(deliveredOrdersQuery);
                                  
                                  // If this is the only delivered order (size was 0 before this one was marked)
                                  // Or if we check the user doc first-order-reward-given flag
                                  if (deliveredSnap.size <= 1 && !userData.referralRewardGiven) {
                                    // Find referrer by matching first 8 chars of their UID (referral code)
                                    const usersRef = collection(db, 'user');
                                    const allUsersSnap = await getDocs(usersRef);
                                    const referrer = allUsersSnap.docs.find(d => d.id.substring(0, 8) === referralCode);
                                    
                                    if (referrer && referrer.id !== order.userId) {
                                      await updateDoc(doc(db, 'user', referrer.id), {
                                        points: increment(20)
                                      });
                                      // Mark that the reward was given to avoid double counting
                                      await updateDoc(userRef, { referralRewardGiven: true });
                                      toast.success('Récompense de parrainage (20 points) envoyée au parrain !');
                                    }
                                  }
                                }
                              }
                            }
                          }
                          toast.success(`Statut de la commande ${order.id} mis à jour : ${newStatus}`);
                        } catch (err) {
                          console.error(err);
                          toast.error('Erreur lors de la mise à jour en base de données');
                        }
                    }}
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border-none focus:ring-2 focus:ring-primary/20 cursor-pointer",
                      getStatusStyles(order.status)
                    )}
                  >
                    <option value="pending">En attente</option>
                    <option value="processing">Traitement</option>
                    <option value="shipped">Expédié</option>
                    <option value="delivered">Livré</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                ),
                exportValue: (order: Order) => order.status,
                sortable: true,
                sortKey: 'status'
              },
              {
                header: 'Actions',
                accessor: (order: Order) => (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setActiveTab('order-detail'); }}
                    className="text-primary font-bold text-sm hover:underline"
                  >
                    Détails
                  </button>
                )
              },
            { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm', sortable: true }
          ]}
          />
        </div>
      )}

        {activeTab === 'logs' && (
          <div className="space-y-10">
            {/* Request Logs */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif flex items-center gap-3">
                  <Activity className="text-primary" size={24} /> Historique des Requêtes API
                </h3>
                <div className="flex items-center gap-4">
                  <TabFilter 
                    options={[
                      { id: 'all', label: 'Toutes' },
                      { id: 'success', label: 'Succès' },
                      { id: 'error', label: 'Erreurs' },
                    ]}
                    active={requestLogFilter}
                    onChange={setRequestLogFilter}
                    className="mb-0"
                  />
                </div>
              </div>
              <DataTable<any>
                data={sortByDate(realLogs.filter(log => {
                  if (requestLogFilter === 'success') return log.statusCode < 400;
                  if (requestLogFilter === 'error') return log.statusCode >= 400;
                  return true;
                }))}
                title="Logs Serveur SQLite"
                columns={[
                  { 
                    header: 'Utilisateur', 
                    accessor: (log) => {
                      const user = USERS.find(u => u.id === log.userId);
                      if (user) {
                        return (
                          <button 
                            onClick={() => onNavigate(`admin-user-detail:${user.id}`)}
                            className="text-primary font-bold hover:underline flex items-center gap-2"
                          >
                            <User size={12} /> {user.name}
                          </button>
                        );
                      }
                      return <span className="italic text-primary/60">Anonyme</span>;
                    },
                    sortable: true,
                    sortKey: 'userId'
                  },
                  { 
                    header: 'Méthode', 
                    accessor: (log) => (
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                        log.method === 'GET' ? 'text-primary bg-primary/10' : 'text-primary bg-primary/5'
                      }`}>
                        {log.method}
                      </span>
                    ),
                    sortable: true,
                    sortKey: 'method'
                  },
                  { header: 'Chemin', accessor: 'path', className: 'font-mono text-[10px] truncate max-w-[150px]', sortable: true },
                  { 
                    header: 'Action', 
                    accessor: (log) => (
                      <span className="text-[10px] font-medium text-primary/70">
                        {getActionDescription(log.method, log.path)}
                      </span>
                    ),
                    sortable: true,
                    sortKey: 'path'
                  },
                  { 
                    header: 'Statut', 
                    accessor: (log) => (
                      <span className={`text-[10px] font-bold flex items-center gap-1 ${
                        log.statusCode < 400 ? 'text-primary' : 'text-primary/60'
                      }`}>
                        {log.statusCode} <span className="opacity-50 font-normal text-[8px]">{getStatusText(log.statusCode)}</span>
                      </span>
                    ),
                    sortable: true,
                    sortKey: 'statusCode'
                  },
                  { header: 'Appareil', accessor: 'device', className: 'text-[10px] text-primary/60', sortable: true },
                  { header: 'Navigateur', accessor: 'browser', className: 'text-[10px] text-primary/60', sortable: true },
                  { header: 'IP', accessor: 'ip', className: 'font-mono text-[10px] text-primary/60', sortable: true },
                  { header: 'Durée', accessor: (log) => `${log.duration}ms`, className: 'text-[10px] text-primary/60', sortable: true, sortKey: 'duration' },
                  { header: 'Date', accessor: (log) => new Date(log.timestamp).toLocaleString(), className: 'text-primary/60 text-[10px]', sortable: true, sortKey: 'timestamp' },
                { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm', sortable: true }
              ]}
              />
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Taux de Conversion', value: '3.2%', sub: '+0.4% vs mois dernier', color: 'text-primary' },
                { label: 'Clients Fidèles', value: '68%', sub: 'Clients avec > 2 commandes', color: 'text-primary' },
                { label: 'Taux d\'Abandon', value: '24%', sub: '-5% vs mois dernier', color: 'text-primary/60' },
              ].map((card, i) => (
                <div key={i} className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">{card.label}</p>
                  <h4 className={`text-3xl font-bold mb-2 ${card.color}`}>{card.value}</h4>
                  <p className="text-xs text-primary/60">{card.sub}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Sales Trend */}
              <div className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-serif">Évolution des Ventes</h3>
                  <select className="text-xs font-bold uppercase tracking-widest text-primary bg-secondary/50 px-4 py-2 rounded-xl border-none focus:ring-0">
                    <option>6 derniers mois</option>
                    <option>12 derniers mois</option>
                  </select>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={SALES_DATA}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `${value/1000}k`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'Ventes']}
                      />
                      <Area type="monotone" dataKey="sales" stroke="#1A1A1A" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Orders Trend */}
              <div className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-serif">Volume de Commandes</h3>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 text-xs text-primary/60">
                      <div className="w-3 h-3 rounded-full bg-accent" /> Commandes
                    </div>
                  </div>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SALES_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="orders" fill="#B85535" radius={[6, 6, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-card p-8 rounded-[3rem] shadow-sm border border-primary/10">
                <h3 className="text-xl font-serif mb-6 flex items-center gap-3">
                  <Eye className="text-blue-700" size={24} /> Produits les plus consultés
                </h3>
                <div className="space-y-4">
                  {PRODUCTS.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map((p, i) => (
                    <div key={p.id} className="flex items-center gap-4 p-4 bg-secondary/50 rounded-2xl border border-primary/5">
                      <span className="text-lg font-serif font-bold text-primary/20">0{i+1}</span>
                      <img src={p.image} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                      <div className="flex-grow">
                        <h4 className="font-bold text-sm text-primary">{p.name}</h4>
                        <p className="text-xs text-primary/60">{p.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{p.views?.toLocaleString()}</p>
                        <p className="text-[10px] uppercase tracking-widest text-primary/60 font-bold">Vues</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card p-8 rounded-[3rem] shadow-sm border border-primary/10">
                <h3 className="text-xl font-serif mb-6 flex items-center gap-3">
                  <MousePointer2 className="text-primary" size={24} /> Produits les plus vendus
                </h3>
                <div className="space-y-4">
                  {PRODUCTS.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)).slice(0, 5).map((p, i) => (
                    <div key={p.id} className="flex items-center gap-4 p-4 bg-secondary/50 rounded-2xl border border-primary/5">
                      <span className="text-lg font-serif font-bold text-primary/20">0{i+1}</span>
                      <img src={p.image} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                      <div className="flex-grow">
                        <h4 className="font-bold text-sm text-primary">{p.name}</h4>
                        <p className="text-xs text-primary/60">{p.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-accent">{p.salesCount?.toLocaleString()}</p>
                        <p className="text-[10px] uppercase tracking-widest text-primary/60 font-bold">Ventes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Device Distribution */}
              <div className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
                <h3 className="text-xl font-serif mb-8">Appareils Utilisés</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Mobile', value: 65, color: '#B85535' },
                          { name: 'Desktop', value: 30, color: '#1A1A1A' },
                          { name: 'Tablette', value: 5, color: '#94a3b8' },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { name: 'Mobile', value: 65, color: '#B85535' },
                          { name: 'Desktop', value: 30, color: '#1A1A1A' },
                          { name: 'Tablette', value: 5, color: '#94a3b8' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-accent" />
                      <span className="text-sm text-primary/60">Mobile</span>
                    </div>
                    <span className="font-bold text-primary">65%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-sm text-primary/60">Desktop</span>
                    </div>
                    <span className="font-bold text-primary">30%</span>
                  </div>
                </div>
              </div>

              {/* Traffic Sources */}
              <div className="lg:col-span-2 bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
                <h3 className="text-xl font-serif mb-8">Sources de Trafic</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={[
                        { name: 'Recherche Google', value: 4500, color: '#1A1A1A' },
                        { name: 'Réseaux Sociaux', value: 3200, color: '#B85535' },
                        { name: 'Direct', value: 2100, color: '#94a3b8' },
                        { name: 'Email Marketing', value: 1500, color: '#B85535' },
                      ]}
                      margin={{ left: 40 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip cursor={{fill: 'transparent'}} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {[
                          { name: 'Recherche Google', value: 4500, color: '#1A1A1A' },
                          { name: 'Réseaux Sociaux', value: 3200, color: '#B85535' },
                          { name: 'Direct', value: 2100, color: '#94a3b8' },
                          { name: 'Email Marketing', value: 1500, color: '#B85535' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Customer Retention Chart */}
            <div className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
              <h3 className="text-xl font-serif mb-8 text-primary">Rétention des Clients</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={SALES_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="orders" stroke="#B85535" strokeWidth={3} dot={{ r: 4, fill: '#B85535', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card p-8 rounded-[3rem] shadow-sm border border-primary/10">
              <h3 className="text-xl font-serif mb-8 text-primary">Performance des Ventes</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={SALES_DATA}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    />
                    <Area type="monotone" dataKey="sales" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-serif flex items-center gap-3 text-primary">
                <CalendarIcon className="text-accent" size={24} /> Évènements Promotionnels
              </h3>
              <button 
                onClick={() => { setSelectedEvent(null); setIsEventEditorOpen(true); }}
                className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-md"
              >
                <Plus size={18} /> Créer un évènement
              </button>
            </div>
            <DataTable<PromoEvent>
              data={sortByDate(PROMO_EVENTS)}
              title="Évènements Promotionnels"
              columns={[
                { header: 'Nom', accessor: 'name', className: 'font-bold', sortable: true },
                { 
                  header: 'Période', 
                  accessor: (e) => (
                    <div className="text-xs text-primary/60">
                      <div>Du {formatDate(e.startDate)}</div>
                      <div>Au {formatDate(e.endDate)}</div>
                    </div>
                  ),
                  sortable: true,
                  sortKey: 'startDate'
                },
                { 
                  header: 'Remise', 
                  accessor: (e) => <span className="text-accent font-bold">-{e.discountPercentage}%</span>,
                  sortable: true,
                  sortKey: 'discountPercentage'
                },
                { 
                  header: 'Portée', 
                  accessor: (e) => e.applyToAll ? 'Tous les produits' : `${e.productIds?.length || 0} produits`,
                  sortable: true,
                  sortKey: 'applyToAll'
                },
                {
                  header: 'Statut',
                  accessor: (e) => <StatusBadge status={e.status} />,
                  sortable: true,
                  sortKey: 'status'
                },
                {
                  header: 'Actions',
                  accessor: (e) => (
                    <div className="flex gap-2">
                      <button onClick={() => handleEditEvent(e)} className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"><Edit size={16} /></button>
                      <button onClick={() => handleDeleteEvent(e.id)} className="p-2 text-primary/60 hover:bg-primary/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  )
                },
              { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm', sortable: true }
            ]}
            />
            <PromoEventEditor 
              event={selectedEvent}
              isOpen={isEventEditorOpen}
              onClose={() => setIsEventEditorOpen(false)}
              onSave={handleSaveEvent}
            />
          </div>
        )}

        {activeTab === 'site' && (
          <div className="space-y-12">
            <div className="flex justify-between items-center bg-card p-6 rounded-3xl border border-primary/10">
              <div>
                <h2 className="text-2xl font-serif text-primary">Configuration du Site</h2>
                <p className="text-sm text-primary/60">Gérez l'apparence et les fonctionnalités globales</p>
              </div>
              <button 
                onClick={saveAllSiteConfig}
                className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-accent transition-all shadow-lg"
              >
                <Save size={20} /> Tout Enregistrer
              </button>
            </div>

            {/* Branding & Colors */}
            <section className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/5 text-primary rounded-2xl"><Palette size={24} /></div>
                  <div>
                    <h3 className="text-xl font-serif text-primary">Identité & Couleurs</h3>
                    <p className="text-xs text-primary/60">Personnalisez l'apparence de votre boutique</p>
                  </div>
                </div>
                <button 
                  onClick={() => saveSiteSection(['primaryColor', 'accentColor', 'branding'], 'Identité & Couleurs')}
                  className="px-4 py-2 bg-secondary text-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/5 transition-colors"
                >
                  Enregistrer Section
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Logo du site</label>
                    <div className="flex items-center gap-4 p-4 bg-secondary/50 border border-dashed border-primary/10 rounded-2xl">
                      <div className="w-16 h-16 bg-card rounded-xl flex items-center justify-center text-primary/20">
                        <ImageIcon size={24} />
                      </div>
                      <button className="text-xs font-bold text-primary hover:underline">Changer le logo</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Couleur Primaire</label>
                      <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-2xl border border-primary/10">
                        <input 
                          type="color" 
                          value={siteConfig.primaryColor} 
                          onChange={(e) => setSiteConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="w-10 h-10 rounded-lg border-none bg-transparent cursor-pointer"
                        />
                        <span className="text-xs font-mono font-bold text-primary">{siteConfig.primaryColor}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Couleur Accent</label>
                      <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-2xl border border-primary/10">
                        <input 
                          type="color" 
                          value={siteConfig.accentColor} 
                          onChange={(e) => setSiteConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                          className="w-10 h-10 rounded-lg border-none bg-transparent cursor-pointer"
                        />
                        <span className="text-xs font-mono font-bold text-primary">{siteConfig.accentColor}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-secondary/50 p-8 rounded-3xl border border-primary/10">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-6">Aperçu en direct</h4>
                  <div className="space-y-4">
                    <div className="h-4 w-32 rounded-full" style={{ backgroundColor: siteConfig.primaryColor }} />
                    <div className="h-10 w-full rounded-2xl" style={{ backgroundColor: siteConfig.primaryColor }} />
                    <div className="flex gap-2">
                      <div className="h-8 w-24 rounded-xl" style={{ backgroundColor: siteConfig.accentColor }} />
                      <div className="h-8 w-24 rounded-xl bg-card border border-primary/10" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Hero Section */}
            <section className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/5 text-accent rounded-2xl"><Monitor size={24} /></div>
                  <div>
                    <h3 className="text-xl font-serif text-primary">Section Hero (Accueil)</h3>
                    <p className="text-xs text-primary/60">Modifiez le message d'accueil et l'image principale</p>
                  </div>
                </div>
                <button 
                  onClick={() => saveSiteSection(['hero'], 'Section Hero')}
                  className="px-4 py-2 bg-secondary text-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/5 transition-colors"
                >
                  Enregistrer Section
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Titre d'accroche (H1)</label>
                    <textarea 
                      className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary h-32 text-primary" 
                      value={siteConfig.hero.title}
                      onChange={(e) => setSiteConfig(prev => ({ ...prev, hero: { ...prev.hero, title: e.target.value } }))}
                    ></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Description (H2)</label>
                    <textarea 
                      className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary h-24 text-primary" 
                      value={siteConfig.hero.description}
                      onChange={(e) => setSiteConfig(prev => ({ ...prev, hero: { ...prev.hero, description: e.target.value } }))}
                      placeholder="Une sélection unique de..."
                    ></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Texte du bouton (CTA)</label>
                    <input 
                      type="text" 
                      className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary text-primary" 
                      value={siteConfig.hero.ctaText}
                      onChange={(e) => setSiteConfig(prev => ({ ...prev, hero: { ...prev.hero, ctaText: e.target.value } }))}
                      placeholder="Découvrir la collection"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Image de fond (URL)</label>
                    <input 
                      type="text" 
                      className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary text-primary" 
                      value={siteConfig.hero.backgroundImage}
                      onChange={(e) => setSiteConfig(prev => ({ ...prev, hero: { ...prev.hero, backgroundImage: e.target.value } }))}
                    />
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="p-8 bg-secondary/20 rounded-3xl border border-primary/10">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-6">Aperçu Hero</h4>
                    <div className="relative h-64 rounded-2xl overflow-hidden bg-primary shadow-inner">
                      <img src={siteConfig.hero.backgroundImage} className="w-full h-full object-cover opacity-50" />
                      <div className="absolute inset-0 p-8 flex flex-col justify-center gap-2">
                        <h5 className="text-white font-serif text-lg leading-tight line-clamp-2">{siteConfig.hero.title}</h5>
                        <p className="text-white/70 text-xs line-clamp-2">{siteConfig.hero.description}</p>
                        <div className="mt-4 px-4 py-2 bg-white text-primary rounded-full text-[10px] font-bold w-fit uppercase">
                          {siteConfig.hero.ctaText}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Pourquoi nous choisir (Features) */}
            <section className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
               <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/5 text-primary rounded-2xl"><Award size={24} /></div>
                  <div>
                    <h3 className="text-xl font-serif text-primary">Pourquoi nous choisir ?</h3>
                    <p className="text-xs text-primary/60">Gérez les 4 points forts affichés sur la page d'accueil</p>
                  </div>
                </div>
                <button 
                  onClick={() => saveSiteSection(['features'], 'Pourquoi nous choisir')}
                  className="px-4 py-2 bg-secondary text-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/5 transition-colors"
                >
                  Enregistrer Section
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(siteConfig.features || [
                  { iconName: "Package", title: "Qualité Premium", description: "Laines 100% naturelles" },
                  { iconName: "Truck", title: "Livraison Rapide", description: "Offerte dès 200 000 FCFA" },
                  { iconName: "ShieldCheck", title: "Paiement Sécurisé", description: "Transaction 100% protégée" },
                  { iconName: "Heart", title: "Fait avec Amour", description: "Sélection artisanale" },
                ]).map((feature, index) => (
                  <div key={index} className="p-6 bg-secondary/30 rounded-3xl border border-primary/10 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Titre</label>
                         <input 
                           type="text" 
                           className="w-full px-4 py-2 bg-card border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-sm" 
                           value={feature.title}
                           onChange={(e) => {
                             const newFeatures = [...(siteConfig.features || [])];
                             if (newFeatures[index]) {
                               newFeatures[index].title = e.target.value;
                               setSiteConfig(prev => ({ ...prev, features: newFeatures }));
                             }
                           }}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Icône Lucide</label>
                         <input 
                           type="text" 
                           className="w-full px-4 py-2 bg-card border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-sm" 
                           value={feature.iconName}
                           onChange={(e) => {
                             const newFeatures = [...(siteConfig.features || [])];
                             if (newFeatures[index]) {
                               newFeatures[index].iconName = e.target.value;
                               setSiteConfig(prev => ({ ...prev, features: newFeatures }));
                             }
                           }}
                         />
                      </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Description</label>
                       <input 
                         type="text" 
                         className="w-full px-4 py-2 bg-card border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-sm" 
                         value={feature.description}
                         onChange={(e) => {
                           const newFeatures = [...(siteConfig.features || [])];
                           if (newFeatures[index]) {
                             newFeatures[index].description = e.target.value;
                             setSiteConfig(prev => ({ ...prev, features: newFeatures }));
                           }
                         }}
                       />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Annonce Banner Configuration */}
            <section className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/5 text-primary rounded-2xl"><Bell size={24} /></div>
                  <div>
                    <h3 className="text-xl font-serif text-primary">Bannière d'Annonce (Haut)</h3>
                    <p className="text-xs text-primary/60">Gérez le message Promotionnel tout en haut du site</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <button 
                    onClick={() => saveSiteSection(['showAdBanner', 'adBannerText'], 'Bannière d\'Annonce')}
                    className="px-4 py-2 bg-secondary text-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/5 transition-colors"
                  >
                    Enregistrer Section
                  </button>
                  <button 
                    onClick={() => setSiteConfig(prev => ({ ...prev, showAdBanner: !prev.showAdBanner }))}
                    className={`w-14 h-8 rounded-full relative transition-colors ${siteConfig.showAdBanner ? 'bg-primary' : 'bg-secondary/50'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-card rounded-full transition-all ${siteConfig.showAdBanner ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              </div>
              
              {siteConfig.showAdBanner && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Texte de l'annonce</label>
                    <input 
                      type="text" 
                      className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary text-primary" 
                      value={siteConfig.adBannerText}
                      onChange={(e) => setSiteConfig(prev => ({ ...prev, adBannerText: e.target.value }))}
                      placeholder="Ex: 🎉 Livraison gratuite ce weekend avec le code FREE..."
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Barre Défilante (Marquee) Configuration */}
            <section className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/5 text-primary rounded-2xl"><TypeIcon size={24} /></div>
                  <div>
                    <h3 className="text-xl font-serif text-primary">Barre Défilante (Haut de page)</h3>
                    <p className="text-xs text-primary/60">Gérez les messages qui défilent tout en haut de votre site</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <button 
                    onClick={() => saveSiteSection(['marqueeItems'], 'Barre Défilante')}
                    className="px-4 py-2 bg-secondary text-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/5 transition-colors"
                  >
                    Enregistrer Section
                  </button>
                  <button 
                    onClick={() => {
                      const newItems = [...(siteConfig.marqueeItems || []), { id: Date.now().toString(), text: 'NOUVEAU MESSAGE', iconName: 'Star' }];
                      setSiteConfig(prev => ({ ...prev, marqueeItems: newItems }));
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-secondary rounded-full font-bold uppercase tracking-widest text-xs hover:bg-accent transition-colors"
                  >
                    <Plus size={16} /> Ajouter un message
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {(siteConfig.marqueeItems || []).map((item, index) => (
                  <div key={item.id} className="flex gap-4 items-center bg-secondary/30 p-4 rounded-2xl border border-primary/10">
                    <div className="flex-1 space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Texte</label>
                       <input 
                          type="text" 
                          className="w-full px-4 py-2 bg-white border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-sm" 
                          value={item.text}
                          onChange={(e) => {
                            const newItems = [...(siteConfig.marqueeItems || [])];
                            newItems[index].text = e.target.value;
                            setSiteConfig(prev => ({ ...prev, marqueeItems: newItems }));
                          }}
                        />
                    </div>
                    <div className="w-48 space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Nom Icône (ex: Heart, Package)</label>
                       <input 
                          type="text" 
                          className="w-full px-4 py-2 bg-white border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-sm" 
                          value={item.iconName}
                          onChange={(e) => {
                            const newItems = [...(siteConfig.marqueeItems || [])];
                            newItems[index].iconName = e.target.value;
                            setSiteConfig(prev => ({ ...prev, marqueeItems: newItems }));
                          }}
                        />
                    </div>
                    <button 
                      onClick={() => {
                        const newItems = (siteConfig.marqueeItems || []).filter(i => i.id !== item.id);
                        setSiteConfig(prev => ({ ...prev, marqueeItems: newItems }));
                      }}
                      className="mt-6 p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Home Page Configuration */}
            <section className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/5 text-primary rounded-2xl"><LayoutDashboard size={24} /></div>
                <div>
                  <h3 className="text-xl font-serif text-primary">Configuration de l'Accueil</h3>
                  <p className="text-xs text-primary/60">Gérez les éléments mis en avant sur votre page d'accueil</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Catégories Vedettes</label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(cat => (
                        <button 
                          key={cat.id}
                          onClick={() => {
                            const newCats = siteConfig.homeFeaturedCategories.includes(cat.id)
                              ? siteConfig.homeFeaturedCategories.filter(id => id !== cat.id)
                              : [...siteConfig.homeFeaturedCategories, cat.id];
                            setSiteConfig(prev => ({ ...prev, homeFeaturedCategories: newCats }));
                          }}
                          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                            siteConfig.homeFeaturedCategories.includes(cat.id) 
                              ? 'bg-primary text-white shadow-md' 
                              : 'bg-secondary/50 text-primary/60 hover:bg-secondary/70'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Produits Vedettes</label>
                    <div className="grid grid-cols-2 gap-3">
                      {localProducts.slice(0, 6).map(prod => (
                        <button 
                          key={prod.id}
                          onClick={() => {
                            const newProds = siteConfig.homeFeaturedProducts.includes(prod.id)
                              ? siteConfig.homeFeaturedProducts.filter(id => id !== prod.id)
                              : [...siteConfig.homeFeaturedProducts, prod.id];
                            setSiteConfig(prev => ({ ...prev, homeFeaturedProducts: newProds }));
                          }}
                          className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                            siteConfig.homeFeaturedProducts.includes(prod.id)
                              ? 'border-primary bg-primary/5'
                              : 'border-primary/10 bg-card hover:border-primary/20'
                          }`}
                        >
                          <img src={prod.image} className="w-8 h-8 rounded-lg object-cover" referrerPolicy="no-referrer" />
                          <span className="text-[10px] font-bold line-clamp-1">{prod.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-secondary/50 p-8 rounded-3xl border border-primary/10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-primary">Afficher le Slider</p>
                      <p className="text-xs text-primary/60">Activer/Désactiver la bannière principale</p>
                    </div>
                    <button 
                      onClick={() => setSiteConfig(prev => ({ ...prev, showSlider: !prev.showSlider }))}
                      className={`w-14 h-8 rounded-full relative transition-colors ${siteConfig.showSlider ? 'bg-primary' : 'bg-secondary/50'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-card rounded-full transition-all ${siteConfig.showSlider ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className="p-4 bg-card rounded-2xl border border-primary/10">
                    <p className="text-xs text-primary/60 italic leading-relaxed">
                      Sélectionnez les catégories et produits que vous souhaitez mettre en avant sur la page d'accueil. Ces éléments apparaîtront dans les sections dédiées.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Custom Sections */}
            <section className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/5 text-accent rounded-2xl"><TableIcon size={24} /></div>
                  <div>
                    <h3 className="text-xl font-serif text-primary">Sections Personnalisées</h3>
                    <p className="text-xs text-primary/60">Ajoutez des blocs de contenu spécifiques à l'accueil</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const newSection = {
                      id: `cs-${Date.now()}`,
                      title: 'Nouvelle Section',
                      type: 'products' as const,
                      itemIds: []
                    };
                    setSiteConfig(prev => ({ ...prev, customSections: [...prev.customSections, newSection] }));
                  }}
                  className="bg-primary text-white px-6 py-3 rounded-2xl text-xs font-bold hover:bg-accent transition-all shadow-lg flex items-center gap-2"
                >
                  <Plus size={16} /> Ajouter une section
                </button>
              </div>
              
              <div className="space-y-6">
                {siteConfig.customSections.length > 0 ? (
                  siteConfig.customSections.map((section, idx) => (
                    <div key={section.id} className="p-8 bg-secondary/50 rounded-[2.5rem] border border-primary/10 space-y-6 relative group">
                      <button 
                        onClick={() => {
                          const newSections = siteConfig.customSections.filter(s => s.id !== section.id);
                          setSiteConfig(prev => ({ ...prev, customSections: newSections }));
                        }}
                        className="absolute top-6 right-6 text-primary/20 hover:text-primary transition-colors"
                      >
                        <X size={20} />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Titre de la section</label>
                            <input 
                              type="text" 
                              value={section.title}
                              onChange={(e) => {
                                const newSections = [...siteConfig.customSections];
                                newSections[idx].title = e.target.value;
                                setSiteConfig(prev => ({ ...prev, customSections: newSections }));
                              }}
                              className="w-full px-6 py-4 bg-card border border-primary/10 rounded-2xl focus:outline-none focus:border-primary font-serif text-lg text-primary"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Type de contenu</label>
                            <div className="flex gap-2">
                              {['products', 'categories'].map(type => (
                                <button
                                  key={type}
                                  onClick={() => {
                                    const newSections = [...siteConfig.customSections];
                                    newSections[idx].type = type as any;
                                    newSections[idx].itemIds = [];
                                    setSiteConfig(prev => ({ ...prev, customSections: newSections }));
                                  }}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                    section.type === type ? 'bg-primary text-white' : 'bg-card text-primary/60 border border-primary/10'
                                  }`}
                                >
                                  {type === 'products' ? 'Produits' : 'Catégories'}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Sélectionner les éléments</label>
                          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-4 bg-card rounded-2xl border border-primary/10">
                            {(section.type === 'products' ? localProducts : CATEGORIES).map((item: any) => (
                              <button 
                                key={item.id}
                                onClick={() => {
                                  const newSections = [...siteConfig.customSections];
                                  const itemIds = section.itemIds.includes(item.id)
                                    ? section.itemIds.filter(id => id !== item.id)
                                    : [...section.itemIds, item.id];
                                  newSections[idx].itemIds = itemIds;
                                  setSiteConfig(prev => ({ ...prev, customSections: newSections }));
                                }}
                                className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                                  section.itemIds.includes(item.id) ? 'bg-primary text-white' : 'bg-secondary/50 text-primary/60'
                                }`}
                              >
                                {item.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-secondary/50 rounded-[2.5rem] border border-dashed border-primary/10">
                    <p className="text-primary/60 italic">Aucune section personnalisée configurée.</p>
                  </div>
                )}
              </div>
            </section>

            {/* SEO Global */}
            <section className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/5 text-primary rounded-2xl"><Globe size={24} /></div>
                <div>
                  <h3 className="text-xl font-serif text-primary">SEO & Référencement</h3>
                  <p className="text-xs text-primary/60">Optimisez la visibilité de vos pages sur Google</p>
                </div>
              </div>
              <div className="space-y-8">
                {['home', 'shop', 'contact', 'about'].map((page) => (
                  <div key={page} className="p-6 bg-secondary/50 rounded-3xl border border-primary/10">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                      <TypeIcon size={14} /> Page {page === 'home' ? 'Accueil' : page === 'shop' ? 'Boutique' : page === 'contact' ? 'Contact' : 'À Propos'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Meta Title</label>
                        <input 
                          type="text" 
                          className="w-full px-6 py-4 bg-card border border-primary/10 rounded-2xl focus:outline-none focus:border-primary text-primary" 
                          value={(siteConfig.seo as any)[page].title}
                          onChange={(e) => {
                            const newSeo = { ...siteConfig.seo };
                            (newSeo as any)[page].title = e.target.value;
                            setSiteConfig(prev => ({ ...prev, seo: newSeo }));
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Meta Description</label>
                        <textarea 
                          className="w-full px-6 py-4 bg-card border border-primary/10 rounded-2xl focus:outline-none focus:border-primary h-20 text-primary" 
                          value={(siteConfig.seo as any)[page].description}
                          onChange={(e) => {
                            const newSeo = { ...siteConfig.seo };
                            (newSeo as any)[page].description = e.target.value;
                            setSiteConfig(prev => ({ ...prev, seo: newSeo }));
                          }}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Loyalty Program Configuration */}
            <section className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/5 text-primary rounded-2xl"><Star size={24} /></div>
                <div>
                  <h3 className="text-xl font-serif text-primary">Programme de Fidélité</h3>
                  <p className="text-xs text-primary/60">Configurez les points pour les achats et les avis</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Points par achat (pour 1000 FCFA)</label>
                    <input 
                      type="number" 
                      className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary text-primary" 
                      value={siteConfig.loyaltyConfig.pointsPerPurchase}
                      onChange={(e) => setSiteConfig(prev => ({ 
                        ...prev, 
                        loyaltyConfig: { ...prev.loyaltyConfig, pointsPerPurchase: parseInt(e.target.value) || 0 } 
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Points par avis produit</label>
                    <input 
                      type="number" 
                      className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary text-primary" 
                      value={siteConfig.loyaltyConfig.pointsPerReview}
                      onChange={(e) => setSiteConfig(prev => ({ 
                        ...prev, 
                        loyaltyConfig: { ...prev.loyaltyConfig, pointsPerReview: parseInt(e.target.value) || 0 } 
                      }))}
                    />
                  </div>
                </div>
                <div className="bg-secondary/50 p-8 rounded-3xl border border-primary/10 flex flex-col justify-center">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-primary/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                          <ShoppingBag size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary">Achat de 50 000 FCFA</p>
                          <p className="text-[10px] text-primary/40 text-xs font-bold uppercase tracking-widest">Calculé en direct</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-primary">+{siteConfig.loyaltyConfig.pointsPerPurchase * 50} pts</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-primary/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                          <Star size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary">Avis déposé</p>
                          <p className="text-[10px] text-primary/40 text-xs font-bold uppercase tracking-widest">Par produit</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-primary">+{siteConfig.loyaltyConfig.pointsPerReview} pts</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/5 bg-primary/5">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/10 text-primary rounded-2xl"><MonitorOff size={24} /></div>
                <div>
                  <h3 className="text-xl font-serif text-primary">Mode Maintenance</h3>
                  <p className="text-xs text-primary/40">Désactivez temporairement l'accès au site pour les clients</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-card border border-primary/5 rounded-3xl shadow-sm">
                    <div>
                      <p className="font-bold text-primary">Activer la maintenance</p>
                      <p className="text-xs text-primary/60">Redirige les clients vers une page d'attente</p>
                    </div>
                    <button 
                      onClick={() => setSiteConfig(prev => ({ ...prev, maintenance: { ...prev.maintenance, isActive: !prev.maintenance.isActive } }))}
                      className={`w-14 h-8 rounded-full relative transition-colors ${siteConfig.maintenance.isActive ? 'bg-primary' : 'bg-secondary/50'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-card rounded-full transition-all ${siteConfig.maintenance.isActive ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Message personnalisé</label>
                    <textarea 
                      className="w-full px-6 py-4 bg-card border border-primary/10 rounded-2xl focus:outline-none focus:border-primary h-32 text-primary" 
                      value={siteConfig.maintenance.message}
                      onChange={(e) => setSiteConfig(prev => ({ ...prev, maintenance: { ...prev.maintenance, message: e.target.value } }))}
                    ></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Date de fin prévue (Optionnel)</label>
                    <input 
                      type="datetime-local" 
                      className="w-full px-6 py-4 bg-card border border-primary/10 rounded-2xl focus:outline-none focus:border-primary text-primary" 
                      value={siteConfig.maintenance.endDate}
                      onChange={(e) => setSiteConfig(prev => ({ ...prev, maintenance: { ...prev.maintenance, endDate: e.target.value } }))}
                    />
                  </div>
                </div>
                <div className="bg-card p-8 rounded-3xl border border-primary/5 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <AlertCircle size={32} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-serif font-bold text-primary">Aperçu Client</h4>
                    <p className="text-xs text-primary/60 leading-relaxed">
                      {siteConfig.maintenance.isActive 
                        ? "Les clients verront ce message et ne pourront pas naviguer sur le site." 
                        : "Le site est actuellement accessible à tous."}
                    </p>
                  </div>
                  {siteConfig.maintenance.isActive && (
                    <div className="p-4 bg-primary/10 rounded-2xl border border-primary/5 w-full italic text-sm text-primary">
                      "{siteConfig.maintenance.message}"
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Newsletter Popup Configuration */}
            <section className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/5 text-primary rounded-2xl"><Mail size={24} /></div>
                <div>
                  <h3 className="text-xl font-serif text-primary">Popup Newsletter</h3>
                  <p className="text-xs text-primary/60">Configurez la fenêtre surgissante d'inscription</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-secondary/50 rounded-3xl border border-primary/10">
                    <div>
                      <p className="font-bold text-primary">Activer le popup</p>
                      <p className="text-xs text-primary/60">Affiche une invitation à s'inscrire</p>
                    </div>
                    <button 
                      onClick={() => setSiteConfig(prev => ({ 
                        ...prev, 
                        newsletterPopup: { ...prev.newsletterPopup, isActive: !prev.newsletterPopup.isActive } 
                      }))}
                      className={`w-14 h-8 rounded-full relative transition-colors ${siteConfig.newsletterPopup.isActive ? 'bg-primary' : 'bg-secondary/50'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-card rounded-full transition-all ${siteConfig.newsletterPopup.isActive ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Titre du popup</label>
                    <input 
                      type="text" 
                      className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary text-primary" 
                      value={siteConfig.newsletterPopup.title}
                      onChange={(e) => setSiteConfig(prev => ({ 
                        ...prev, 
                        newsletterPopup: { ...prev.newsletterPopup, title: e.target.value } 
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Message</label>
                    <textarea 
                      className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary h-24 text-primary" 
                      value={siteConfig.newsletterPopup.message}
                      onChange={(e) => setSiteConfig(prev => ({ 
                        ...prev, 
                        newsletterPopup: { ...prev.newsletterPopup, message: e.target.value } 
                      }))}
                    ></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Délai d'apparition (ms)</label>
                    <input 
                      type="number" 
                      className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary text-primary" 
                      value={siteConfig.newsletterPopup.delay}
                      onChange={(e) => setSiteConfig(prev => ({ 
                        ...prev, 
                        newsletterPopup: { ...prev.newsletterPopup, delay: parseInt(e.target.value) || 0 } 
                      }))}
                    />
                  </div>
                </div>
                <div className="bg-secondary/50 p-8 rounded-3xl border border-primary/10 flex flex-col items-center justify-center">
                  <div className="w-full max-w-sm bg-card p-8 rounded-[2rem] shadow-2xl border border-primary/10 space-y-6 relative">
                    <div className="absolute top-4 right-4 text-primary/20"><X size={20} /></div>
                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto">
                      <Mail size={24} />
                    </div>
                    <div className="text-center space-y-2">
                      <h4 className="text-xl font-serif text-primary">{siteConfig.newsletterPopup.title}</h4>
                      <p className="text-sm text-primary/60">{siteConfig.newsletterPopup.message}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="h-12 bg-secondary/50 rounded-xl border border-primary/10" />
                      <div className="h-12 bg-primary rounded-xl" />
                    </div>
                  </div>
                  <p className="mt-6 text-xs text-primary/60 font-bold uppercase tracking-widest">Aperçu du Popup</p>
                </div>
              </div>
            </section>

            <div className="flex justify-end pt-6">
              <button 
                onClick={async () => {
                  setIsSaving(true);
                  try {
                    await updateSiteConfig(siteConfig.id!, siteConfig);
                    toast.success('Configuration enregistrée avec succès !');
                  } catch (error) {
                    toast.error('Erreur lors de l\'enregistrement');
                  } finally {
                    setIsSaving(false);
                  }
                }}
                className="bg-primary text-white px-12 py-4 rounded-2xl font-bold hover:bg-accent transition-all shadow-xl flex items-center gap-3"
              >
                {isSaving ? <Loader text="" /> : <CheckCircle2 size={20} />}
                Enregistrer toutes les modifications
              </button>
            </div>
          </div>
        )}



        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <TabFilter 
                options={[
                  { id: 'all', label: 'Tous' },
                  { id: 'stock_low', label: 'Stock Faible' },
                  { id: 'stock_out', label: 'Rupture' },
                ]}
                active={productFilter}
                onChange={setProductFilter}
              />
              <button 
                onClick={() => { setEditingItem(null); setActiveTab('product-create'); }}
                className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg"
              >
                <Plus size={18} /> Ajouter un produit
              </button>
            </div>
            <DataTable<Product>
              data={sortByDate(localProducts.filter(p => {
                  if (productFilter === 'all') return true;
                  if (productFilter === 'stock_low') return p.stock < 10 && p.stock > 0;
                  if (productFilter === 'stock_out') return p.stock === 0;
                  return p.category === productFilter;
              }))}
              onRowClick={(p) => { setEditingItem(p); setActiveTab('product-edit'); }}
              title="Catalogue Produits"
              columns={[
                {
                  header: 'Produit',
                  accessor: (product: Product) => (
                    <div className="flex items-center gap-4">
                      <img src={product.image} alt={product.name} className="w-10 h-12 object-cover rounded-lg" referrerPolicy="no-referrer" />
                      <div className="flex flex-col">
                        <span className="font-medium text-primary">{product.name}</span>
                        {!product.isAvailable && <span className="text-[10px] text-primary/40 font-bold uppercase">Désactivé</span>}
                      </div>
                    </div>
                  ),
                  exportValue: (product: Product) => product.name,
                  sortable: true,
                  sortKey: 'name'
                },
                { header: 'Catégorie', accessor: 'category' as any, className: 'text-primary/60 text-sm', sortable: true },
                { 
                  header: 'Prix', 
                  accessor: (product: Product) => (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <input 
                            type="number" 
                            defaultValue={product.price}
                            onBlur={(e) => {
                                const newPrice = Number(e.target.value);
                                if (newPrice !== product.price) {
                                    setLocalProducts(prev => prev.map(p => p.id === product.id ? { ...p, price: newPrice } : p));
                                    toast.success(`Prix de ${product.name} mis à jour`);
                                }
                            }}
                            className="w-24 bg-transparent border-b border-dashed border-primary/10 focus:border-primary focus:outline-none font-bold text-right text-primary"
                        />
                        <span className="text-xs font-bold text-primary/60">FCFA</span>
                    </div>
                  ),
                  exportValue: (product: Product) => `${product.price} FCFA`,
                  sortable: true,
                  sortKey: 'price'
                },
                {
                  header: 'Stock',
                  accessor: (product: Product) => (
                    <div className="flex items-center gap-2">
                       <div className="flex-grow bg-secondary/50 h-1.5 rounded-full overflow-hidden w-24">
                        <div 
                          className={`h-full rounded-full ${product.stock < 10 ? 'bg-primary' : 'bg-primary/40'}`} 
                          style={{ width: `${Math.min(product.stock, 100)}%` }} 
                        />
                      </div>
                      <span className="text-xs font-bold text-primary">{product.stock}</span>
                    </div>
                  ),
                  exportValue: (product: Product) => String(product.stock),
                  sortable: true,
                  sortKey: 'stock'
                },
                {
                  header: 'Note',
                  accessor: (product: Product) => (
                    <div className="flex items-center gap-1 text-primary/60">
                      <Star size={14} fill="currentColor" />
                      <span className="text-sm font-bold text-primary">{product.rating}</span>
                    </div>
                  ),
                  exportValue: (product: Product) => String(product.rating),
                  sortable: true,
                  sortKey: 'rating'
                },
                { header: 'Créé le', accessor: (p: Product) => formatDate(p.createdAt), className: 'text-primary/60 text-sm', sortable: true },
                {
                  header: 'Actions',
                  accessor: (product: Product) => (
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingItem(product); setActiveTab('product-edit'); }}
                        className="p-2 text-primary/60 hover:text-primary transition-colors"
                      >
                        <Settings size={16} />
                      </button>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setLocalProducts(prev => prev.map(p => p.id === product.id ? { ...p, isAvailable: !p.isAvailable } : p));
                          toast.success(product.isAvailable ? 'Produit désactivé' : 'Produit activé');
                        }}
                        className={`p-2 transition-colors ${product.isAvailable ? 'text-primary/40 hover:text-primary' : 'text-primary hover:text-primary/80'}`}
                      >
                        {product.isAvailable ? <X size={16} /> : <CheckCircle2 size={16} />}
                      </button>
                    </div>
                  )
                }
              ]}
            />
          </div>
        )}

        {(activeTab === 'product-create' || activeTab === 'product-edit') && (
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveTab('products')}
                  className="p-2 bg-card rounded-xl shadow-sm border border-primary/10 text-primary/60 hover:text-primary transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h3 className="text-2xl font-serif text-primary">
                    {activeTab === 'product-create' ? 'Nouveau Produit' : `Modifier: ${editingItem?.name}`}
                  </h3>
                  <p className="text-primary/60 text-sm">Gérez les informations détaillées de votre produit.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveTab('products')}
                  className="px-6 py-2.5 text-primary/60 font-bold hover:text-primary transition-colors"
                >
                  Annuler
                </button>
                <button 
                  form="product-form"
                  type="submit"
                  className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-accent transition-all flex items-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  {activeTab === 'product-create' ? 'Créer le produit' : 'Enregistrer les modifications'}
                </button>
              </div>
            </div>

            <form id="product-form" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const nameValue = formData.get('name') as string;
              const slugValue = formData.get('slug') as string;
              const finalSlug = slugValue || (nameValue ? nameValue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '');
              
              const newProduct: any = {
                id: editingItem ? editingItem.id : `prod-${Date.now()}`,
                name: nameValue,
                slug: finalSlug,
                price: Number(formData.get('price')),
                purchasePrice: Number(formData.get('purchasePrice')),
                promoPrice: formData.get('promoPrice') ? Number(formData.get('promoPrice')) : undefined,
                stock: editingItem?.stock || 0,
                category: formData.get('category') as string,
                image: editingItem?.image || 'https://picsum.photos/seed/wool/300/300',
                description: formData.get('description') as string,
                colors: editingItem?.colors || ['#FFFFFF'],
                seo: {
                    title: formData.get('seoTitle') as string,
                    description: formData.get('seoDescription') as string
                },
                isAvailable: editingItem?.isAvailable ?? true,
                rating: editingItem?.rating || 5
              };
              const now = new Date().toISOString();
              if (editingItem) {
                  newProduct.updatedAt = now;
                  newProduct.createdAt = editingItem.createdAt || now;
                  setLocalProducts(prev => prev.map(p => p.id === editingItem.id ? { ...p, ...newProduct } : p));
                  toast.success('Produit mis à jour avec succès');
              } else {
                  newProduct.createdAt = now;
                  newProduct.updatedAt = now;
                  setLocalProducts(prev => [...prev, newProduct]);
                  toast.success('Produit créé avec succès');
              }
              setActiveTab('products');
            }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-card p-8 rounded-3xl shadow-sm border border-primary/10 space-y-6">
                  <h4 className="text-lg font-bold text-primary border-b border-primary/5 pb-4">Informations Générales</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Nom du produit</label>
                        <input 
                          name="name"
                          type="text" 
                          required
                          className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary focus:bg-card text-primary transition-all" 
                          placeholder="Ex: Laine Mérinos Douceur" 
                          defaultValue={editingItem?.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                            setCurrentSlug(slug);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Slug (URL)</label>
                        <input 
                          name="slug"
                          type="text" 
                          className="w-full px-6 py-4 bg-secondary/10 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary text-primary/60 italic" 
                          placeholder="genere-automatiquement" 
                          value={currentSlug}
                          onChange={(e) => setCurrentSlug(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Description détaillée</label>
                      <textarea 
                        name="description"
                        required
                        className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary focus:bg-card text-primary transition-all h-48 resize-none" 
                        placeholder="Décrivez votre produit, ses caractéristiques, ses avantages..."
                        defaultValue={editingItem?.description}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="bg-card p-8 rounded-3xl shadow-sm border border-primary/10 space-y-6">
                  <h4 className="text-lg font-bold text-primary border-b border-primary/5 pb-4">Prix & Stock</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Prix de vente (FCFA)</label>
                      <div className="relative">
                        <input 
                          name="price"
                          type="number" 
                          required
                          className="w-full pl-6 pr-16 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary focus:bg-card transition-all font-bold text-primary" 
                          placeholder="0" 
                          defaultValue={editingItem?.price}
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/60 font-bold text-xs">FCFA</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Prix d'achat (FCFA)</label>
                      <div className="relative">
                        <input 
                          name="purchasePrice"
                          type="number" 
                          required
                          className="w-full pl-6 pr-16 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary focus:bg-card transition-all font-bold text-primary/60" 
                          placeholder="0" 
                          defaultValue={editingItem?.purchasePrice}
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/60 font-bold text-xs">FCFA</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Prix Promotionnel (FCFA)</label>
                      <div className="relative">
                        <input 
                          name="promoPrice"
                          type="number" 
                          className="w-full pl-6 pr-16 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary focus:bg-card transition-all font-bold text-accent" 
                          placeholder="Optionnel" 
                          defaultValue={editingItem?.promoPrice}
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/60 font-bold text-xs">FCFA</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Catégorie</label>
                      <select 
                        name="category"
                        required
                        className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary focus:bg-card text-primary transition-all appearance-none"
                        defaultValue={editingItem?.category}
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-card p-8 rounded-3xl shadow-sm border border-primary/10 space-y-6">
                  <h4 className="text-lg font-bold text-primary border-b border-primary/5 pb-4">Optimisation SEO</h4>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Titre SEO (Meta Title)</label>
                      <input 
                        name="seoTitle"
                        type="text" 
                        className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary focus:bg-card text-primary transition-all" 
                        placeholder="Titre optimisé pour les moteurs de recherche" 
                        defaultValue={editingItem?.seo?.title}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Description SEO (Meta Description)</label>
                      <textarea 
                        name="seoDescription"
                        className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary focus:bg-card text-primary transition-all h-24 resize-none" 
                        placeholder="Bref résumé pour les résultats Google..."
                        defaultValue={editingItem?.seo?.description}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Content */}
              <div className="space-y-8">
                <div className="bg-card p-8 rounded-3xl shadow-sm border border-primary/10 space-y-6">
                  <h4 className="text-lg font-bold text-primary border-b border-primary/5 pb-4">Visibilité</h4>
                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-2xl border border-primary/10">
                    <div>
                      <p className="font-bold text-sm text-primary">Statut du produit</p>
                      <p className="text-xs text-primary/60">{editingItem?.isAvailable !== false ? 'Visible sur la boutique' : 'Masqué pour les clients'}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setEditingItem(prev => ({ ...prev, isAvailable: !prev?.isAvailable }))}
                      className={`w-14 h-7 rounded-full relative transition-all duration-300 ${editingItem?.isAvailable !== false ? 'bg-primary' : 'bg-secondary/50'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-card rounded-full shadow-sm transition-all duration-300 ${editingItem?.isAvailable !== false ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="bg-card p-8 rounded-3xl shadow-sm border border-primary/10 space-y-6">
                  <h4 className="text-lg font-bold text-primary border-b border-primary/5 pb-4">Image du Produit</h4>
                  <div className="aspect-[4/5] bg-secondary/50 rounded-2xl border-2 border-dashed border-primary/10 flex flex-col items-center justify-center overflow-hidden relative group">
                    {editingItem?.image ? (
                      <>
                        <img src={editingItem.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" className="bg-card text-primary px-4 py-2 rounded-xl font-bold text-xs">Changer l'image</button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6">
                        <div className="w-12 h-12 bg-card rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-primary/60">
                          <ImageIcon size={24} />
                        </div>
                        <p className="text-sm font-bold text-primary">Ajouter une image</p>
                        <p className="text-xs text-primary/60 mt-1">Glissez-déposez ou cliquez pour parcourir</p>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-primary/60 text-center uppercase tracking-widest font-bold">Format recommandé: 800x1000px</p>
                </div>

                <div className="bg-card p-8 rounded-3xl shadow-sm border border-primary/10 space-y-6">
                  <h4 className="text-lg font-bold text-primary border-b border-primary/5 pb-4">Couleurs</h4>
                  <div className="flex flex-wrap gap-3">
                    {['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#F5F5DC', '#8B4513'].map(color => (
                      <button 
                        key={color} 
                        type="button" 
                        onClick={() => {
                          const currentColors = editingItem?.colors || [];
                          const newColors = currentColors.includes(color) 
                            ? currentColors.filter(c => c !== color)
                            : [...currentColors, color];
                          setEditingItem(prev => ({ ...prev, colors: newColors }));
                        }}
                        className={`w-10 h-10 rounded-full border-2 shadow-sm hover:scale-110 transition-all ${editingItem?.colors?.includes(color) ? 'border-primary ring-2 ring-primary/20' : 'border-card'}`} 
                        style={{ backgroundColor: color }} 
                      />
                    ))}
                    <button type="button" className="w-10 h-10 rounded-full border-2 border-dashed border-primary/10 flex items-center justify-center text-primary/60 hover:border-primary hover:text-primary transition-all">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'finances' && (
          <div className="space-y-10">
            {/* Financial Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[
                { 
                  label: "Chiffre d'Affaires", 
                  value: localOrders.reduce((acc, o) => acc + o.total, 0), 
                  color: "text-primary",
                  icon: <TrendingUp size={20} />
                },
                { 
                  label: "Coût d'Achat (Estimé)", 
                  value: localOrders.reduce((acc, o) => {
                    return acc + (o.orderDetails?.reduce((sum, item) => {
                      const product = localProducts.find(p => p.id === item.productId);
                      return sum + ((product?.purchasePrice || 0) * item.quantity);
                    }, 0) || 0);
                  }, 0), 
                  color: "text-primary/80",
                  icon: <ShoppingBag size={20} />
                },
                { 
                  label: "Dépenses Totales", 
                  value: localExpenses.reduce((acc, e) => acc + e.amount, 0), 
                  color: "text-primary/60",
                  icon: <ArrowDownRight size={20} />
                },
                { 
                  label: "Bénéfice Net", 
                  value: localOrders.reduce((acc, o) => acc + o.total, 0) - 
                         localOrders.reduce((acc, o) => {
                           return acc + (o.orderDetails?.reduce((sum, item) => {
                             const product = localProducts.find(p => p.id === item.productId);
                             return sum + ((product?.purchasePrice || 0) * item.quantity);
                           }, 0) || 0);
                         }, 0) - 
                         localExpenses.reduce((acc, e) => acc + e.amount, 0), 
                  color: "text-accent",
                  icon: <Coins size={20} />
                },
              ].map((stat, i) => (
                <div key={i} className="bg-card p-6 rounded-3xl shadow-sm border border-primary/10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-secondary/50 rounded-2xl text-primary">{stat.icon}</div>
                  </div>
                  <p className="text-primary/60 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className={`text-2xl font-bold ${stat.color}`}>{stat.value.toLocaleString()} FCFA</h3>
                </div>
              ))}
            </div>

            {/* Flux de Trésorerie & Marge par Produit */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
                <h3 className="text-xl font-serif font-bold mb-6 text-primary">Flux de Trésorerie (Mensuel)</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Jan', revenus: 1200000, depenses: 800000 },
                      { name: 'Fév', revenus: 1500000, depenses: 900000 },
                      { name: 'Mar', revenus: 1800000, depenses: 1100000 },
                      { name: 'Avr', revenus: 1400000, depenses: 850000 },
                      { name: 'Mai', revenus: 2100000, depenses: 1200000 },
                      { name: 'Juin', revenus: 1900000, depenses: 1000000 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--primary)" strokeOpacity={0.05} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--primary)', fontSize: 12, opacity: 0.6}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--primary)', fontSize: 12, opacity: 0.6}} tickFormatter={(val) => `${val/1000}k`} />
                      <Tooltip cursor={{fill: 'var(--secondary)'}} contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '16px', border: '1px solid var(--primary-10)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar dataKey="revenus" name="Revenus" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar dataKey="depenses" name="Dépenses" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10 min-w-0">
                <h3 className="text-xl font-serif font-bold mb-6 text-primary">Marge Nette par Produit (Top 5)</h3>
                <div className="overflow-x-auto min-w-0">
                  <DataTable
                    data={localProducts
                      .filter(p => p.purchasePrice)
                      .map(p => ({
                        ...p,
                        margin: p.price - (p.purchasePrice || 0),
                        marginPercent: ((p.price - (p.purchasePrice || 0)) / p.price) * 100
                      }))
                      .sort((a, b) => b.margin - a.margin)
                      .slice(0, 5)}
                    searchable={false}
                    defaultItemsPerPage={5}
                    columns={[
                      {
                        header: 'Produit',
                        accessor: (p: any) => (
                          <div className="flex items-center gap-3">
                            <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover" referrerPolicy="no-referrer" />
                            <span className="truncate max-w-[150px] font-bold text-primary">{p.name}</span>
                          </div>
                        ),
                        exportValue: (p: any) => p.name
                      },
                      { header: 'Prix Vente', accessor: (p: any) => `${p.price.toLocaleString()} F`, className: 'text-right' },
                      { header: 'Coût Achat', accessor: (p: any) => `${p.purchasePrice?.toLocaleString()} F`, className: 'text-right text-primary/60' },
                      { header: 'Marge Nette', accessor: (p: any) => <span className="font-bold text-primary">+{p.margin.toLocaleString()} F</span>, className: 'text-right' },
                      { 
                        header: '% Marge', 
                        accessor: (p: any) => (
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${p.marginPercent > 50 ? 'bg-primary/10 text-primary' : p.marginPercent > 30 ? 'bg-primary/5 text-primary/70' : 'bg-accent/10 text-accent'}`}>
                            {p.marginPercent.toFixed(0)}%
                          </span>
                        ), 
                        className: 'text-right' 
                      }
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Expenses Table */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif text-primary">Journal des Dépenses</h3>
                <button 
                  onClick={() => { setModalType('expense'); setIsAddModalOpen(true); }}
                  className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-md"
                >
                  <Plus size={18} /> Ajouter une dépense
                </button>
              </div>
              <DataTable<Expense>
                data={sortByDate(localExpenses)}
                title="Dépenses"
                onRowClick={(expense) => { setEditingItem(expense); setModalType('expense'); setIsAddModalOpen(true); }}
                columns={[
                  { header: 'Date Opération', accessor: 'date', className: 'text-primary/60 text-sm', sortable: true },
                  { header: 'Description', accessor: 'description', className: 'font-medium text-primary', sortable: true },
                  { 
                    header: 'Catégorie', 
                    accessor: (e) => (
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        e.category === 'stock' ? 'bg-primary/10 text-primary' :
                        e.category === 'transport' ? 'bg-primary/5 text-primary/70' :
                        e.category === 'marketing' ? 'bg-accent/10 text-accent' : 'bg-secondary/50 text-primary/60'
                      }`}>
                        {e.category === 'stock' ? 'Achat Stock' :
                         e.category === 'transport' ? 'Transport' :
                         e.category === 'marketing' ? 'Marketing' : 'Autre'}
                      </span>
                    ),
                    exportValue: (e) => e.category,
                    sortable: true,
                    sortKey: 'category'
                  },
                  { 
                    header: 'Montant', 
                    accessor: (e) => <span className="font-bold text-accent">-{e.amount.toLocaleString()} FCFA</span>,
                    exportValue: (e) => `-${e.amount} FCFA`,
                    sortable: true,
                    sortKey: 'amount'
                  },
                  { 
                    header: 'Statut', 
                    accessor: (expense: Expense) => (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocalExpenses(prev => prev.map(exp => exp.id === expense.id ? { ...exp, status: exp.status === 'verified' ? 'pending' : 'verified' } : exp));
                        toast.success(`Dépense ${expense.description} ${expense.status === 'verified' ? 'mise en attente' : 'vérifiée'}`);
                      }}
                      className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors border",
                        getStatusStyles(expense.status || 'pending')
                      )}
                    >
                      {expense.status || 'pending'}
                    </button>
                    ),
                    sortable: true,
                    sortKey: 'status'
                  },
                  {
                    header: 'Actions',
                    accessor: (e) => (
                      <div className="flex gap-2">
                        <button onClick={(ev) => { ev.stopPropagation(); setEditingItem(e); setModalType('expense'); setIsAddModalOpen(true); }} className="p-2 text-primary/60 hover:text-primary transition-colors"><Settings size={16} /></button>
                        <button onClick={(ev) => { ev.stopPropagation(); setLocalExpenses(prev => prev.filter(exp => exp.id !== e.id)); toast.success('Dépense supprimée'); }} className="p-2 text-primary/60 hover:text-accent transition-colors"><Trash2 size={16} /></button>
                      </div>
                    )
                  },
                { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm', sortable: true }
              ]}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Expenses Chart */}
              <div className="lg:col-span-2 bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
                <h3 className="text-xl font-serif mb-8 text-primary">Répartition des Dépenses</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Stock', value: localExpenses.filter(e => e.category === 'stock').reduce((acc, e) => acc + e.amount, 0) },
                      { name: 'Transport', value: localExpenses.filter(e => e.category === 'transport').reduce((acc, e) => acc + e.amount, 0) },
                      { name: 'Marketing', value: localExpenses.filter(e => e.category === 'marketing').reduce((acc, e) => acc + e.amount, 0) },
                      { name: 'Autre', value: localExpenses.filter(e => e.category === 'other').reduce((acc, e) => acc + e.amount, 0) },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--primary)" strokeOpacity={0.1} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--primary)', fillOpacity: 0.6, fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--primary)', fillOpacity: 0.6, fontSize: 12}} />
                      <Tooltip 
                        cursor={{fill: 'var(--secondary)', fillOpacity: 0.5}}
                        contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '16px', border: '1px solid var(--primary-10)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: 'var(--primary)' }}
                        formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'Montant']}
                      />
                      <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Profit Chart */}
              <div className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
                <h3 className="text-xl font-serif mb-8 text-primary">Rentabilité</h3>
                <div className="h-80 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Coûts', value: localOrders.reduce((acc, o) => {
                            return acc + (o.orderDetails?.reduce((sum, item) => {
                              const product = localProducts.find(p => p.id === item.productId);
                              return sum + ((product?.purchasePrice || 0) * item.quantity);
                            }, 0) || 0);
                          }, 0) + localExpenses.reduce((acc, e) => acc + e.amount, 0), color: 'var(--accent)' },
                          { name: 'Bénéfice', value: Math.max(0, localOrders.reduce((acc, o) => acc + o.total, 0) - 
                            localOrders.reduce((acc, o) => {
                              return acc + (o.orderDetails?.reduce((sum, item) => {
                                const product = localProducts.find(p => p.id === item.productId);
                                return sum + ((product?.purchasePrice || 0) * item.quantity);
                              }, 0) || 0);
                            }, 0) - 
                            localExpenses.reduce((acc, e) => acc + e.amount, 0)), color: 'var(--primary)' },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { color: 'var(--accent)' },
                          { color: 'var(--primary)' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '16px', border: '1px solid var(--primary-10)' }}
                        itemStyle={{ color: 'var(--primary)' }}
                        formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'Montant']} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex justify-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-accent" />
                        <span className="text-sm text-primary/60">Coûts</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-sm text-primary/60">Bénéfice</span>
                    </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rmas' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-serif text-primary">Demandes de Retour (RMA)</h3>
            </div>
            <DataTable<RMA>
              data={sortByDate(localRMAs)}
              title="Retours"
              onRowClick={(rma) => { setEditingItem(rma); setActiveTab('rma-detail'); }}
              columns={[
                { header: 'ID', accessor: 'id', className: 'font-mono text-xs text-primary/60', sortable: true },
                { header: 'Commande', accessor: 'orderId', className: 'font-bold text-primary', sortable: true },
                { header: 'Client', accessor: 'customer', className: 'font-medium text-primary', sortable: true },
                { header: 'Raison', accessor: 'reason', className: 'text-sm text-primary/60', sortable: true },
                { 
                  header: 'Statut', 
                  accessor: (rma) => (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      rma.status === 'approved' ? 'bg-primary/20 text-primary' :
                      rma.status === 'pending' ? 'bg-secondary/50 text-primary/60' :
                      rma.status === 'received' ? 'bg-primary/15 text-primary' :
                      rma.status === 'refunded' ? 'bg-primary/10 text-primary' :
                      'bg-accent/10 text-accent'
                    }`}>
                      {rma.status}
                    </span>
                  ),
                  exportValue: (rma) => rma.status,
                  sortable: true,
                  sortKey: 'status'
                },
                { header: 'Date Opération', accessor: 'date', className: 'text-sm text-primary/60', sortable: true },
                { 
                  header: 'Montant', 
                  accessor: (rma) => <span className="font-bold text-primary">{rma.amount.toLocaleString()} FCFA</span>,
                  exportValue: (rma) => rma.amount.toString(),
                  sortable: true,
                  sortKey: 'amount'
                },
              { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm', sortable: true }
            ]}
            />
          </div>
        )}

        {activeTab === 'abandoned-carts' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-serif text-primary">Paniers Abandonnés</h3>
            </div>
            <DataTable<AbandonedCart>
              data={sortByDate(localAbandonedCarts)}
              title="Paniers"
              onRowClick={() => {}}
              columns={[
                { header: 'ID', accessor: 'id', className: 'font-mono text-xs text-primary/60', sortable: true },
                { header: 'Client', accessor: 'customer', className: 'font-bold text-primary', sortable: true },
                { header: 'Email', accessor: 'email', className: 'text-sm text-primary/60', sortable: true },
                { header: 'Articles', accessor: 'items', className: 'font-medium text-primary', sortable: true },
                { 
                  header: 'Total', 
                  accessor: (cart) => <span className="font-bold text-primary">{cart.total.toLocaleString()} FCFA</span>,
                  exportValue: (cart) => cart.total.toString(),
                  sortable: true,
                  sortKey: 'total'
                },
                { header: 'Date Opération', accessor: 'date', className: 'text-sm text-primary/60', sortable: true },
                { 
                  header: 'Statut', 
                  accessor: (cart) => (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      cart.status === 'recovered' ? 'bg-primary/20 text-primary' :
                      cart.status === 'reminded' ? 'bg-primary/15 text-primary' :
                      'bg-accent/10 text-accent'
                    }`}>
                      {cart.status}
                    </span>
                  ),
                  exportValue: (cart) => cart.status,
                  sortable: true,
                  sortKey: 'status'
                },
                {
                  header: 'Actions',
                  accessor: (cart) => (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success(`Email de relance envoyé à ${cart.email}`);
                        setLocalAbandonedCarts(prev => prev.map(c => c.id === cart.id ? { ...c, status: 'reminded' } : c));
                      }}
                      className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-colors"
                      disabled={cart.status !== 'abandoned'}
                    >
                      Relancer
                    </button>
                  )
                },
                { header: 'Créé le', accessor: (c: AbandonedCart) => formatDate(c.createdAt), className: 'text-primary/60 text-sm' }
              ]}
            />
          </div>
        )}

        {activeTab === 'catalog-rules' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-serif text-primary">Règles de Prix Catalogue</h3>
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg">
                <Plus size={18} /> Nouvelle Règle
              </button>
            </div>
            <DataTable<CatalogPriceRule>
              data={sortByDate(localCatalogPriceRules)}
              title="Règles Actives"
              columns={[
                { header: 'Nom', accessor: 'name', className: 'font-bold text-primary' },
                { 
                  header: 'Réduction', 
                  accessor: (rule) => <span className="font-bold text-accent">-{rule.discountPercentage}%</span>,
                  exportValue: (rule) => rule.discountPercentage.toString()
                },
                { header: 'Début', accessor: (rule) => formatDate(rule.startDate), className: 'text-sm text-primary/60' },
                { header: 'Fin', accessor: (rule) => formatDate(rule.endDate), className: 'text-sm text-primary/60' },
                { 
                  header: 'Statut', 
                  accessor: (rule: CatalogPriceRule) => (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        updateCatalogRule(rule.id, { ...rule, status: rule.status === 'active' ? 'inactive' : 'active' });
                        toast.success(`Règle ${rule.name} ${rule.status === 'active' ? 'désactivée' : 'activée'}`);
                      }}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
                        rule.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-secondary/50 text-primary/60'
                      }`}
                    >
                      {rule.status || 'active'}
                    </button>
                  )
                },
                {
                  header: 'Actions',
                  accessor: (rule: CatalogPriceRule) => (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditCatalogRule(rule)}
                        className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCatalogRule(rule.id)}
                        className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )
                },
              { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm', sortable: true }
            ]}
            />
            <CatalogPriceRuleEditor 
              rule={selectedCatalogRule}
              isOpen={isCatalogRuleEditorOpen}
              onClose={() => setIsCatalogRuleEditorOpen(false)}
              onSave={handleSaveCatalogRule}
            />
          </div>
        )}



        {activeTab === 'taxes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-serif text-primary">Règles de Taxes (TVA)</h3>
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg">
                <Plus size={18} /> Nouvelle Règle
              </button>
            </div>
            <DataTable<TaxRule>
              data={sortByDate(localTaxRules)}
              title="Taxes"
              onRowClick={() => {}}
              columns={[
                { header: 'Nom', accessor: 'name', className: 'font-bold text-primary' },
                { header: 'Pays', accessor: 'country', className: 'font-medium text-primary' },
                { 
                  header: 'Taux', 
                  accessor: (tax) => <span className="font-bold text-primary">{tax.rate}%</span>,
                  exportValue: (tax) => tax.rate.toString()
                },
                { 
                  header: 'Statut', 
                  accessor: (tax: TaxRule) => (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocalTaxRules(prev => prev.map(t => t.id === tax.id ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' } : t));
                        toast.success(`Taxe ${tax.name} ${tax.status === 'active' ? 'désactivée' : 'activée'}`);
                      }}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
                        tax.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-secondary/50 text-primary/60'
                      }`}
                    >
                      {tax.status || 'active'}
                    </button>
                  )
                },
                {
                  header: 'Actions',
                  accessor: (tax: TaxRule) => (
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingItem(tax); setModalType('tax'); }}
                        className="text-primary font-bold text-sm hover:underline"
                      >
                        Modifier
                      </button>
                    </div>
                  )
                },
              { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm', sortable: true }
            ]}
            />
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-serif text-primary">Méthodes de Livraison</h3>
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg">
                <Plus size={18} /> Nouvelle Méthode
              </button>
            </div>
            <DataTable<ShippingRule>
              data={sortByDate(localShippingRules)}
              title="Livraison"
              onRowClick={() => {}}
              columns={[
                { header: 'Nom', accessor: 'name', className: 'font-bold text-primary' },
                { header: 'Condition', accessor: 'condition', className: 'text-sm text-primary/60' },
                { 
                  header: 'Prix', 
                  accessor: (shipping) => <span className="font-bold text-primary">{shipping.price === 0 ? 'Gratuit' : `${shipping.price.toLocaleString()} FCFA`}</span>,
                  exportValue: (shipping) => shipping.price.toString()
                },
                { 
                  header: 'Statut', 
                  accessor: (shipping: ShippingRule) => (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocalShippingRules(prev => prev.map(s => s.id === shipping.id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s));
                        toast.success(`Livraison ${shipping.name} ${shipping.status === 'active' ? 'désactivée' : 'activée'}`);
                      }}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
                        shipping.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-secondary/50 text-primary/60'
                      }`}
                    >
                      {shipping.status || 'active'}
                    </button>
                  )
                },
                {
                  header: 'Actions',
                  accessor: (shipping: ShippingRule) => (
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingItem(shipping); setModalType('shipping'); }}
                        className="text-primary font-bold text-sm hover:underline"
                      >
                        Modifier
                      </button>
                    </div>
                  )
                },
              { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm', sortable: true }
            ]}
            />
          </div>
        )}

        {activeTab === 'import-export' && (
          <div className="space-y-10">
            <div className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/15 text-primary rounded-2xl"><Download size={24} /></div>
                <div>
                  <h3 className="text-xl font-serif text-primary">Import / Export de Données</h3>
                  <p className="text-xs text-primary/60">Gérez votre catalogue en masse via CSV</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 border-2 border-dashed border-primary/10 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 hover:border-primary hover:bg-secondary/50 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    accept=".csv" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        toast.success(`Fichier ${e.target.files[0].name} importé avec succès !`);
                        // Simulation of import delay
                        setTimeout(() => {
                          toast.success("50 produits ajoutés/mis à jour.");
                        }, 1500);
                      }
                    }}
                  />
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <Plus size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">Importer des Produits</h4>
                    <p className="text-xs text-primary/60 mt-1">Glissez-déposez votre fichier CSV ici</p>
                  </div>
                  <button className="px-6 py-2 bg-card border border-primary/10 rounded-xl text-sm font-bold text-primary hover:border-primary transition-colors pointer-events-none">
                    Parcourir
                  </button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-primary">Exporter des Données</h4>
                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8,ID,Nom,Prix,Stock\n" + localProducts.map(p => `${p.id},${p.name},${p.price},${p.stock}`).join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "catalogue_produits.csv");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        toast.success("Catalogue exporté !");
                      }}
                      className="w-full flex justify-between items-center p-4 bg-secondary/50 border border-primary/10 rounded-2xl hover:border-primary transition-colors"
                    >
                      <span className="font-medium text-sm text-primary">Catalogue Produits (.csv)</span>
                      <Download size={18} className="text-primary/60" />
                    </button>
                    <button 
                      onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8,ID,Nom,Email,Commandes\n" + localUsers.map(u => `${u.id},${u.name},${u.email},${u.orders}`).join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "base_clients.csv");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        toast.success("Base clients exportée !");
                      }}
                      className="w-full flex justify-between items-center p-4 bg-secondary/50 border border-primary/10 rounded-2xl hover:border-primary transition-colors"
                    >
                      <span className="font-medium text-sm text-primary">Base Clients (.csv)</span>
                      <Download size={18} className="text-primary/60" />
                    </button>
                    <button 
                      onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8,ID,Client,Total,Statut\n" + localOrders.map(o => `${o.id},${o.customer},${o.total},${o.status}`).join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "commandes.csv");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        toast.success("Commandes exportées !");
                      }}
                      className="w-full flex justify-between items-center p-4 bg-secondary/50 border border-primary/10 rounded-2xl hover:border-primary transition-colors"
                    >
                      <span className="font-medium text-sm text-primary">Commandes du mois (.csv)</span>
                      <Download size={18} className="text-primary/60" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-10">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-serif font-bold text-primary">Gestion des Catégories</h3>
              <button 
                onClick={() => { setModalType('category'); setEditingItem(null); setActiveTab('category-create'); }}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg"
              >
                <Plus size={18} /> Nouvelle catégorie
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localCategories.slice((categoryPage - 1) * itemsPerPage, categoryPage * itemsPerPage).map(cat => (
                <div 
                  key={cat.id} 
                  onClick={() => { setEditingItem(cat); setModalType('category'); setActiveTab('category-edit'); }}
                  className="bg-card flex items-center gap-4 p-6 border border-primary/10 rounded-[2rem] shadow-sm hover:border-accent transition-all group cursor-pointer"
                >
                  <img src={cat.image} alt={cat.name} className="w-20 h-20 object-cover rounded-2xl shadow-sm" referrerPolicy="no-referrer" />
                  <div className="flex-grow">
                    <h4 className="font-serif font-bold text-primary">{cat.name}</h4>
                    <p className="text-xs text-primary/60 font-medium">{cat.count} produits</p>
                    <div className="mt-2">
                       <StatusBadge status={cat.status || 'active'} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="p-2 text-primary/20 group-hover:text-primary transition-colors">
                      <Settings size={18} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success(`Catégorie ${cat.name} supprimée (simulé)`);
                        setLocalCategories(prev => prev.filter(c => c.id !== cat.id));
                      }}
                      className="p-2 text-primary/20 group-hover:text-accent transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {localCategories.length > itemsPerPage && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: Math.ceil(localCategories.length / itemsPerPage) }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setCategoryPage(n)}
                    className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${categoryPage === n ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-card border border-primary/10 text-primary/60 hover:border-primary hover:text-primary'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {(activeTab === 'category-create' || activeTab === 'category-edit') && (
           <div className="space-y-6 max-w-2xl mx-auto">
             <div className="flex justify-between items-center">
               <h2 className="text-2xl font-serif font-bold text-primary">
                 {activeTab === 'category-create' ? 'Créer une Catégorie' : 'Modifier la Catégorie'}
               </h2>
               <button 
                 onClick={() => { setActiveTab('categories'); setEditingItem(null); setModalType(''); }}
                 className="text-primary/60 hover:text-primary font-bold text-sm"
               >
                 Annuler
               </button>
             </div>
             
             <form className="space-y-6 bg-card p-10 rounded-[2rem] border border-primary/10 shadow-sm" onSubmit={handleFormSubmit}>
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Nom de la catégorie</label>
                 <input 
                   name="name"
                   type="text" 
                   className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary" 
                   placeholder="Décoration Murale..." 
                   defaultValue={editingItem?.name}
                   required
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Image de couverture (URL)</label>
                 <input 
                   name="image"
                   type="text" 
                   className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary" 
                   placeholder="https://..." 
                   defaultValue={editingItem?.image}
                   required
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Statut</label>
                 <select 
                   name="status" 
                   className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary" 
                   defaultValue={editingItem?.status || 'active'}
                 >
                   <option value="active">Actif</option>
                   <option value="inactive">Inactif</option>
                 </select>
               </div>

               <div className="pt-6">
                 <button 
                   type="submit" 
                   disabled={isSaving}
                   className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-accent transition-all shadow-lg flex items-center justify-center gap-2"
                 >
                   {isSaving ? <Loader text="" /> : (activeTab === 'category-create' ? 'Créer la catégorie' : 'Enregistrer les modifications')}
                 </button>
               </div>
             </form>
           </div>
        )}
 
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <TabFilter 
              options={[
                { id: 'all', label: 'Tous' },
                { id: '5', label: '5 Étoiles' },
                { id: '4', label: '4 Étoiles' },
                { id: '3', label: '3 Étoiles' },
                { id: 'low', label: 'Basses notes' },
              ]}
              active={reviewFilter}
              onChange={setReviewFilter}
            />
            <DataTable<any>
              data={sortByDate(localReviews.filter(r => {
                if (reviewFilter === 'all') return true;
                if (reviewFilter === 'low') return r.rating <= 2;
                return r.rating === parseInt(reviewFilter);
              }))}
              title="Avis Clients"
              columns={[
                { header: 'Produit', accessor: 'productName', className: 'font-medium' },
                { header: 'Client', accessor: 'userName', className: 'font-medium' },
                {
                  header: 'Note',
                  accessor: (review: any) => (
                    <div className="flex items-center gap-1 text-primary">
                      <Star size={14} fill="currentColor" />
                      <span className="text-sm font-bold text-primary">{review.rating}</span>
                    </div>
                  ),
                  exportValue: (review: any) => String(review.rating)
                },
                { header: 'Commentaire', accessor: 'comment', className: 'text-primary/60 text-sm max-w-xs truncate' },
                { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm' },
                {
                  header: 'Actions',
                  accessor: (review: any) => (
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocalReviews(prev => prev.map(r => r.id === review.id ? { ...r, status: 'approved' } : r));
                          toast.success('Avis approuvé');
                        }}
                        className="text-primary font-bold text-sm hover:underline"
                      >
                        Approuver
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocalReviews(prev => prev.map(r => r.id === review.id ? { ...r, status: 'rejected' } : r));
                          toast.error('Avis rejeté');
                        }}
                        className="text-accent font-bold text-sm hover:underline"
                      >
                        Rejeter
                      </button>
                    </div>
                  )
                },
              ]}
            />
          </div>
        )}
 
        {activeTab === 'order-detail' && selectedOrder && (
          <div className="space-y-8 pb-12">
            {/* Header with Back Button and Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    setActiveTab('orders');
                    setSelectedOrder(null);
                    setIsEditingOrder(false);
                    setEditedOrder(null);
                  }} 
                  className="p-2 bg-card rounded-full shadow-sm hover:bg-secondary/50 transition-colors border border-primary/10"
                >
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-primary">Détails de la Commande</h2>
                  <p className="text-sm text-primary/60">ID: {selectedOrder.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!isEditingOrder ? (
                  <button 
                    onClick={() => { setIsEditingOrder(true); setEditedOrder(selectedOrder); }}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary/50 text-primary/80 rounded-lg hover:bg-secondary/80 transition-colors text-sm font-bold border border-primary/10"
                  >
                    <Edit size={16} /> Modifier
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setIsEditingOrder(false); setEditedOrder(null); }}
                      className="px-4 py-2 bg-secondary/50 text-primary/80 rounded-lg hover:bg-secondary/80 transition-colors text-sm font-bold border border-primary/10"
                    >
                      Annuler
                    </button>
                    <button 
                      onClick={() => {
                        if (editedOrder) {
                          setLocalOrders(prev => prev.map(o => o.id === editedOrder.id ? { ...editedOrder, updatedAt: new Date().toISOString() } : o));
                          setSelectedOrder(editedOrder);
                          setIsEditingOrder(false);
                          toast.success('Commande mise à jour avec succès');
                        }
                      }}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors text-sm font-bold shadow-md"
                    >
                      Enregistrer
                    </button>
                  </div>
                )}
                <button 
                  onClick={() => {
                    generateInvoicePDF(selectedOrder);
                  }}
                  className={`px-4 py-2 rounded-xl font-bold transition-all shadow-md text-sm flex items-center gap-2 bg-primary text-white hover:bg-accent`}
                >
                  <Download size={16} /> Facture
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Main Order Content */}
                <div className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-primary/60">Contenu de la commande</h4>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                          {(isEditingOrder ? editedOrder : selectedOrder)?.type || 'standard'}
                        </span>
                      </div>
                      <div className="space-y-4">
                        {(() => {
                          const currentOrder = isEditingOrder ? editedOrder : selectedOrder;
                          const items = currentOrder?.orderDetails || (Array.isArray(currentOrder?.items) ? currentOrder?.items : []);
                          
                          if (!items || items.length === 0) {
                            return (
                              <div className="p-8 text-center bg-secondary/30 rounded-3xl border border-primary/5">
                                <Package size={32} className="mx-auto text-primary/20 mb-3" />
                                <p className="text-sm text-primary/40 italic">Aucun produit listé dans cette commande.</p>
                              </div>
                            );
                          }

                          return items.map((item, i) => {
                            const product = PRODUCTS.find(p => p.id === item.productId || p.id === item.id);
                            return (
                              <div key={i} className="group relative flex justify-between items-center p-4 bg-secondary/30 border border-primary/5 rounded-2xl hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-4 flex-grow">
                                  {product?.image || item.image ? (
                                    <img src={product?.image || item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover border border-primary/10 shadow-sm" />
                                  ) : (
                                    <div className="w-14 h-14 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                                      <Package size={24} className="text-primary/40" />
                                    </div>
                                  )}
                                  <div className="flex-grow">
                                    <div className="flex items-center gap-2">
                                      <p className="font-bold text-sm text-primary">{item.name}</p>
                                      <span className="text-[9px] px-1.5 py-0.5 bg-primary/5 text-primary/60 rounded border border-primary/5 font-mono uppercase">
                                        {item.type || 'produit'}
                                      </span>
                                    </div>
                                    {isEditingOrder ? (
                                      <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs text-primary/60">Qté:</span>
                                        <input 
                                          type="number" 
                                          min="1"
                                          value={item.quantity}
                                          onChange={(e) => {
                                            const newQty = parseInt(e.target.value) || 1;
                                            setEditedOrder(prev => {
                                              if (!prev) return prev;
                                              const newDetails = [...(prev.orderDetails || [])];
                                              if (newDetails[i]) {
                                                newDetails[i] = { ...newDetails[i], quantity: newQty };
                                              }
                                              const newTotal = newDetails.reduce((sum, d) => sum + (d.price * d.quantity), 0);
                                              return { ...prev, orderDetails: newDetails, total: newTotal, items: newDetails.reduce((sum, d) => sum + d.quantity, 0) };
                                            });
                                          }}
                                          className="w-16 p-1 border border-primary/10 rounded text-sm bg-card text-primary"
                                        />
                                        <button 
                                          onClick={() => {
                                            setEditedOrder(prev => {
                                              if (!prev || !prev.orderDetails) return prev;
                                              const newDetails = prev.orderDetails.filter((_, idx) => idx !== i);
                                              const newTotal = newDetails.reduce((sum, d) => sum + (d.price * d.quantity), 0);
                                              return { ...prev, orderDetails: newDetails, total: newTotal, items: newDetails.reduce((sum, d) => sum + d.quantity, 0) };
                                            });
                                          }}
                                          className="text-accent p-1 hover:bg-accent/10 rounded transition-colors"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    ) : (
                                      <p className="text-xs text-primary/60 mt-1">
                                        Quantité: <span className="font-bold text-primary/80">{item.quantity}</span> x {item.price.toLocaleString()} FCFA
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <p className="font-bold text-primary">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                                </div>
                              </div>
                            );
                          });
                        })()}

                        {/* Summary Section */}
                        <div className="pt-6 mt-4 border-t border-primary/10 space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-primary/60">Sous-total Articles</span>
                            <span className="font-bold text-primary">
                              {(() => {
                                const currentOrder = isEditingOrder ? editedOrder : selectedOrder;
                                const items = currentOrder?.orderDetails || (Array.isArray(currentOrder?.items) ? currentOrder?.items : []);
                                const subtotal = items.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
                                return subtotal.toLocaleString();
                              })()} FCFA
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-primary/60">Frais de livraison</span>
                            <span className="font-bold text-primary">
                              {((isEditingOrder ? editedOrder : selectedOrder)?.shippingFee || 0).toLocaleString()} FCFA
                            </span>
                          </div>
                          
                          {(() => {
                            const currentOrder = isEditingOrder ? editedOrder : selectedOrder;
                            const items = currentOrder?.orderDetails || (Array.isArray(currentOrder?.items) ? currentOrder?.items : []);
                            const subtotal = items.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
                            const discount = (subtotal + (currentOrder?.shippingFee || 0)) - (currentOrder?.total || 0);
                            if (discount > 0) {
                              return (
                                <div className="flex justify-between items-center text-sm p-2 bg-accent/5 rounded-xl border border-accent/10">
                                  <div className="flex items-center gap-2 text-accent">
                                    <Tag size={14} />
                                    <span className="font-bold text-[10px] uppercase tracking-wider">Réduction</span>
                                  </div>
                                  <div className="flex gap-2 text-accent font-bold">
                                     -{discount.toLocaleString()} FCFA
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}

                          {(isEditingOrder ? editedOrder : selectedOrder)?.type === 'b2b' && (
                            <div className="flex justify-between items-center text-sm text-primary/60">
                              <p>TVA (19.25%)</p>
                              <p>{(isEditingOrder ? editedOrder : selectedOrder)?.taxAmount?.toLocaleString() || 0} FCFA</p>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center pt-4 border-t border-primary/5">
                            <p className="font-serif text-xl font-bold text-primary">Total Final</p>
                            <p className="text-3xl font-bold text-accent">{(isEditingOrder ? editedOrder : selectedOrder)?.total.toLocaleString()} FCFA</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-4">Informations Client</h4>
                        <div className="bg-secondary/30 p-6 rounded-3xl border border-primary/5 relative">
                          <p className="font-bold text-lg text-primary mb-2">{selectedOrder.customer}</p>
                          
                          {isEditingOrder ? (
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-bold text-primary/60">Adresse de livraison</label>
                                <textarea 
                                  value={editedOrder?.address || ''}
                                  onChange={(e) => setEditedOrder(prev => prev ? { ...prev, address: e.target.value } : null)}
                                  className="w-full mt-1 p-2 border border-primary/10 rounded-lg text-sm bg-card text-primary focus:border-primary focus:outline-none"
                                  rows={3}
                                />
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-primary/60">{(() => {
                              let addr = selectedOrder.address || 'Adresse non renseignée';
                              // Support multiple formats of coordinates in the address string
                              const formats = [
                                /\(Coordonnées:\s*([0-9.-]+)\s*,\s*([0-9.-]+)\)/,
                                /Lat:\s*[0-9.-]+,\s*Lon:\s*[0-9.-]+/i,
                                /GPS:\s*[0-9.-]+,\s*[0-9.-]+/i
                              ];
                              
                              formats.forEach(regex => {
                                const match = addr.match(regex);
                                if (match) {
                                  addr = addr.replace(match[0], '').replace(/^[,\s]+|[,\s]+$/g, '').trim();
                                }
                              });
                              
                              return addr || 'Adresse non renseignée';
                            })()}</p>
                          )}

                          <div className="mt-4 flex gap-2">
                            <span className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary">
                              {selectedOrder.paymentMethod}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusStyles(selectedOrder.status)}`}>
                              {selectedOrder.status}
                            </span>
                          </div>
                          
                          <button 
                            onClick={() => {
                              const user = USERS.find(u => u.name === selectedOrder.customer);
                              if (user) {
                                setSelectedCustomer(user);
                                setActiveTab('customer-detail');
                              } else {
                                toast.error("Profil client introuvable");
                              }
                            }}
                            className="absolute top-6 right-6 p-3 bg-card rounded-full shadow-sm text-primary hover:text-accent hover:shadow-md transition-all border border-primary/10"
                            title="Voir le profil client"
                          >
                            <User size={20} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-4">Statut & Expédition</h4>
                        <div className="bg-secondary/30 p-6 rounded-3xl border border-primary/5 space-y-4">
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-primary/60">Statut de la commande</label>
                            <select 
                              className="bg-card border border-primary/10 rounded-lg px-3 py-2 text-sm font-bold text-primary focus:outline-none focus:border-primary"
                              value={isEditingOrder ? editedOrder?.status : selectedOrder.status}
                              onChange={(e) => {
                                  const newStatus = e.target.value as any;
                                  if (isEditingOrder) {
                                    setEditedOrder(prev => prev ? { ...prev, status: newStatus } : null);
                                  } else {
                                    const updatedOrder = { ...selectedOrder, status: newStatus, updatedAt: new Date().toISOString() };
                                    setLocalOrders(prev => prev.map(o => o.id === selectedOrder.id ? updatedOrder : o));
                                    setSelectedOrder(updatedOrder);
                                    toast.success(`Statut mis à jour : ${newStatus}`);
                                  }
                              }}
                            >
                                <option value="pending">En attente</option>
                                <option value="processing">Traitement</option>
                                <option value="shipped">Expédiée</option>
                                <option value="delivered">Livrée</option>
                                <option value="cancelled">Annulée</option>
                            </select>
                          </div>

                          {isEditingOrder ? (
                            <div className="pt-4 border-t border-primary/5">
                              <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-3">
                                <Truck size={18} className="text-primary" />
                                <div>
                                  <p className="text-xs font-bold text-primary">Livraison Interne</p>
                                  <p className="text-[10px] text-primary/60">Livré directement par notre équipe.</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="pt-4 border-t border-primary/5">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-primary/60">Mode de livraison:</span>
                                <span className="font-bold text-primary flex items-center gap-2">
                                  <Truck size={14} /> Livraison Interne
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline / Logs of the order could go here */}
              </div>

              <div className="space-y-8">
                {/* Map Section */}
                {(() => {
                  let coords: [number, number] | null = null;
                  if (Array.isArray(selectedOrder.coordinates)) {
                    coords = selectedOrder.coordinates as [number, number];
                  } else if (typeof selectedOrder.coordinates === 'string' && selectedOrder.coordinates.includes(',')) {
                    const parts = selectedOrder.coordinates.split(',');
                    coords = [parseFloat(parts[0]), parseFloat(parts[1])];
                  }
                  
                  if (!coords && selectedOrder.address) {
                    const match = selectedOrder.address.match(/\(Coordonnées:\s*([0-9.-]+)\s*,\s*([0-9.-]+)\)/);
                    if (match) {
                      coords = [parseFloat(match[1]), parseFloat(match[2])];
                    }
                  }

                  if (!coords || isNaN(coords[0]) || isNaN(coords[1])) {
                    return null;
                  }

                  return (
                    <div className="bg-card p-6 rounded-[2.5rem] shadow-sm border border-primary/10 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-primary/60">Localisation de livraison</h4>
                      <div className="h-[250px] rounded-2xl overflow-hidden border border-primary/5 shadow-inner">
                        <OrderMap 
                          customerLocation={coords} 
                          customerName={selectedOrder.customer}
                        />
                      </div>
                      <div className="p-3 bg-primary/5 rounded-xl border border-primary/5 flex gap-3">
                        <Info size={16} className="text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] text-primary/70 leading-relaxed italic">
                          L'itinéraire affiché est une estimation basée sur les coordonnées GPS.
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Internal Notes */}
                <div className="bg-card p-6 rounded-[2.5rem] shadow-sm border border-primary/10 space-y-6">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary/60">Notes Internes</h4>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                    {selectedOrder.internalNotes && selectedOrder.internalNotes.length > 0 ? (
                      selectedOrder.internalNotes.map((note, idx) => {
                        const noteData = typeof note === 'string' ? { id: idx.toString(), note, author: 'Système', date: new Date().toISOString() } : note;
                        return (
                          <div key={noteData.id} className="bg-secondary/30 p-4 rounded-2xl border border-primary/5 space-y-2">
                            <p className="text-sm text-primary/80">{noteData.note}</p>
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-primary/40">
                              <span>{noteData.author}</span>
                              <span>{formatDate(noteData.date)}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-primary/40 italic text-center py-4">Aucune note pour le moment.</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-4 border-t border-primary/5">
                    <input 
                      type="text" 
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Ajouter une note..."
                      className="flex-grow p-3 text-sm bg-secondary/30 border border-primary/5 rounded-xl focus:outline-none focus:border-primary/20 text-primary"
                    />
                    <button 
                      onClick={() => {
                        if (!newNote.trim()) return;
                        const noteObj = {
                          id: `note-${Date.now()}`,
                          date: new Date().toISOString(),
                          note: newNote,
                          author: 'Admin'
                        };
                        const updatedOrder = { 
                          ...selectedOrder, 
                          internalNotes: [...(selectedOrder.internalNotes || []), noteObj],
                          updatedAt: new Date().toISOString()
                        };
                        setLocalOrders(prev => prev.map(o => o.id === selectedOrder.id ? updatedOrder : o));
                        setSelectedOrder(updatedOrder);
                        setNewNote('');
                        toast.success('Note ajoutée');
                      }}
                      className="p-3 bg-primary text-white rounded-xl hover:bg-accent transition-colors shadow-md"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-8">
            <div className="bg-card rounded-[3rem] shadow-sm border border-primary/10 overflow-hidden flex flex-col h-[75vh] lg:flex-row">
              {/* Conversations List */}
              <div className={`w-full lg:w-80 border-r border-primary/10 flex flex-col ${selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
                <div className="p-6 border-b border-primary/5 bg-secondary/30">
                  <h3 className="font-serif font-bold text-primary flex items-center gap-2">
                    <MessageSquare size={18} className="text-primary" /> Discussions
                  </h3>
                </div>
                <div className="flex-grow overflow-y-auto">
                  {CONVERSATIONS.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-6 text-left border-b border-primary/5 transition-all hover:bg-secondary/50 flex gap-4 items-start ${
                        selectedConversation?.id === conv.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-secondary/50 flex-shrink-0 flex items-center justify-center font-bold text-primary">
                        {conv.userName.charAt(0)}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-bold text-sm text-primary truncate">{conv.userName}</h4>
                          <span className="text-[10px] text-primary/60">{conv.timestamp}</span>
                        </div>
                        <p className="text-xs text-primary/60 truncate">{conv.lastMessage}</p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat View */}
              <div className={`flex-grow flex flex-col ${!selectedConversation ? 'hidden lg:flex items-center justify-center bg-secondary/20' : 'flex'}`}>
                {selectedConversation ? (
                  <>
                    <div className="p-6 border-b border-primary/5 flex justify-between items-center bg-secondary/30">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setSelectedConversation(null)}
                          className="lg:hidden p-2 text-primary/60 hover:text-primary"
                        >
                          <X size={20} />
                        </button>
                        <div>
                          <h3 className="font-serif font-bold text-primary">{selectedConversation.userName}</h3>
                          <p className="text-[10px] text-primary font-bold uppercase tracking-widest">En ligne</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-primary/60 hover:text-primary transition-colors">
                          <Search size={18} />
                        </button>
                        <button className="p-2 text-primary/60 hover:text-primary transition-colors">
                          <Settings size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto p-8 space-y-6 bg-secondary/10">
                      {selectedConversation.messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-6 rounded-[2rem] shadow-sm ${
                            msg.isAdmin 
                              ? 'bg-primary text-primary-foreground rounded-tr-none' 
                              : 'bg-card border border-primary/10 text-primary rounded-tl-none'
                          }`}>
                            <div className="flex justify-between items-center mb-2 gap-4">
                              <span className="text-xs font-bold">{msg.senderName}</span>
                              <span className={`text-[10px] ${msg.isAdmin ? 'text-primary-foreground/60' : 'text-primary/60'}`}>{msg.timestamp}</span>
                            </div>
                            <p className="text-sm leading-relaxed">{msg.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-6 bg-card border-t border-primary/10">
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendMessage();
                        }}
                        className="flex gap-4"
                      >
                        <input 
                          type="text" 
                          placeholder="Tapez votre réponse..." 
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          className="flex-grow px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary"
                        />
                        <button 
                          type="submit"
                          className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold hover:bg-accent transition-all shadow-lg"
                        >
                          Envoyer
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-12">
                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageSquare size={32} className="text-primary/20" />
                    </div>
                    <h3 className="text-xl font-serif text-primary/60">Sélectionnez une conversation</h3>
                    <p className="text-sm text-primary/20 mt-2">Choisissez un client dans la liste pour commencer à discuter.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'navigation' && (
          <div className="space-y-8">
            <div className="bg-card rounded-[2rem] shadow-sm border border-primary/10 overflow-hidden">
              <div className="p-8 border-b border-primary/5 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-serif font-bold text-primary">Menu de Navigation</h3>
                  <p className="text-xs text-primary/60">Gérez les liens de la barre de navigation principale</p>
                </div>
                <button 
                  onClick={() => { setModalType('nav_item'); setIsAddModalOpen(true); setEditingItem(null); }} 
                  className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-accent transition-all"
                >
                  <Plus size={18} /> Ajouter un lien
                </button>
              </div>
              <DataTable<NavItem> 
                data={[...NAV_ITEMS].sort((a, b) => a.order - b.order)}
                columns={[
                  { header: 'Ordre', accessor: 'order', sortable: true },
                  { header: 'Nom', accessor: 'name', sortable: true },
                  { header: 'Vue / Lien', accessor: 'view', sortable: true },
                  { 
                    header: 'Statut', 
                    accessor: (item) => (
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${item.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-secondary text-primary/40'}`}>
                        {item.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    ),
                    sortable: true,
                    sortKey: 'status'
                  },
                  {
                    header: 'Actions',
                    accessor: (item: NavItem) => (
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingItem(item); setModalType('nav_item'); setIsAddModalOpen(true); }}
                          className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); if (confirm('Supprimer ce lien ?')) deleteNavItem(item.id); }}
                          className="p-2 text-primary/60 hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )
                  },
                  { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm', sortable: true }
                ]}
              />
            </div>
          </div>
        )}

        {activeTab === 'qr' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif text-primary">Configuration du QR Code Landing</h2>
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-secondary">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="font-bold text-lg text-primary">Paramètres de la page</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Numéro WhatsApp (Format: +33...)</label>
                        <input 
                          type="text" 
                          className="input-field" 
                          value={siteConfig.qrConfig?.whatsappNumber || ''} 
                          onChange={(e) => {
                            const newConfig = { ...siteConfig, qrConfig: { ...siteConfig.qrConfig!, whatsappNumber: e.target.value } };
                            updateSiteConfig(siteConfig.id!, newConfig);
                          }}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Message type WhatsApp</label>
                        <textarea 
                          className="input-field h-24" 
                          value={siteConfig.qrConfig?.whatsappMessage || ''} 
                          onChange={(e) => {
                            const newConfig = { ...siteConfig, qrConfig: { ...siteConfig.qrConfig!, whatsappMessage: e.target.value } };
                            updateSiteConfig(siteConfig.id!, newConfig);
                          }}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Message d'accueil sur la page</label>
                        <textarea 
                          className="input-field h-24" 
                          value={siteConfig.qrConfig?.welcomeMessage || ''} 
                          onChange={(e) => {
                            const newConfig = { ...siteConfig, qrConfig: { ...siteConfig.qrConfig!, welcomeMessage: e.target.value } };
                            updateSiteConfig(siteConfig.id!, newConfig);
                          }}
                        />
                    </div>
                  </div>
                </div>
                
                <div className="bg-secondary/20 p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-6">
                  <h3 className="font-bold text-lg text-primary">Le QR Code</h3>
                  <p className="text-sm text-primary/60">Scannez ce code pour tester la page. Vous pouvez le télécharger pour l'imprimer sur vos flyers ou packagings.</p>
                  
                  <div className="bg-white p-4 rounded-2xl shadow-sm">
                    <QRCodeSVG 
                      id="qr-code-svg"
                      value={`${window.location.origin}/?view=qr-landing`} 
                      size={200} 
                      fgColor={siteConfig.primaryColor}
                    />
                  </div>
                  
                  <button 
                    onClick={() => {
                        const svg = document.getElementById('qr-code-svg');
                        if (svg) {
                          const svgData = new XMLSerializer().serializeToString(svg);
                          const canvas = document.createElement('canvas');
                          const ctx = canvas.getContext('2d');
                          const img = new Image();
                          img.onload = () => {
                            canvas.width = img.width;
                            canvas.height = img.height;
                            ctx?.drawImage(img, 0, 0);
                            const pngFile = canvas.toDataURL('image/png');
                            const downloadLink = document.createElement('a');
                            downloadLink.download = 'QR-Atelier.png';
                            downloadLink.href = `${pngFile}`;
                            downloadLink.click();
                          };
                          img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                        }
                    }}
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all"
                  >
                    <Download size={18} /> Télécharger QR (PNG)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif text-primary">Gestion des Coupons</h2>
              <button 
                onClick={() => { setSelectedCoupon(null); setIsCouponEditorOpen(true); }}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg"
              >
                <Plus size={18} /> Nouveau Coupon
              </button>
            </div>
            <DataTable<Coupon> 
              data={sortByDate(COUPONS)}
              title="Coupons de Réduction"
              columns={[
                { header: 'Code', accessor: 'code', className: 'font-mono font-bold text-primary', sortable: true },
                { 
                  header: 'Réduction', 
                  accessor: (c: Coupon) => (
                    c.type === 'free_shipping' ? 'Livraison Gratuite' : 
                    `${c.discount}${c.type === 'percentage' ? '%' : ' FCFA'}`
                  ),
                  exportValue: (c: Coupon) => c.type === 'free_shipping' ? 'Livraison Gratuite' : `${c.discount}${c.type === 'percentage' ? '%' : ' FCFA'}`,
                  sortable: true,
                  sortKey: 'discount'
                },
                { header: 'Expiration', accessor: 'expiryDate' as any, sortable: true },
                { 
                  header: 'Utilisation', 
                  accessor: (c: Coupon) => (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-primary/60">
                        <span>{c.usageCount} / {c.usageLimit}</span>
                        <span>{Math.round((c.usageCount / c.usageLimit) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all" 
                          style={{ width: `${(c.usageCount / c.usageLimit) * 100}%` }}
                        />
                      </div>
                    </div>
                  ),
                  exportValue: (c: Coupon) => `${c.usageCount} / ${c.usageLimit}`,
                  sortable: true,
                  sortKey: 'usageCount'
                },
                { 
                  header: 'Statut', 
                  accessor: (c: Coupon) => (
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${c.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-secondary/50 text-primary/60'}`}>
                      {c.status}
                    </span>
                  ),
                  sortable: true
                },
                { 
                  header: 'Actions', 
                  accessor: (c: Coupon) => (
                    <button onClick={() => handleEditCoupon(c)} className="text-primary hover:text-accent">
                      <Edit size={16} />
                    </button>
                  )
                },
                { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm', sortable: true }
              ]}
            />
            <CouponEditor 
              coupon={selectedCoupon} 
              isOpen={isCouponEditorOpen} 
              onClose={() => setIsCouponEditorOpen(false)} 
              onSave={handleSaveCoupon}
            />
          </div>
        )}

        {activeTab === 'cities' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif text-primary">Gestion des Villes & Tarifs</h2>
              <div className="flex gap-3">
                <button 
                  onClick={async () => {
                    if (window.confirm('Voulez-vous réinitialiser toutes les villes aux valeurs par défaut ?')) {
                      try {
                        const batch = writeBatch(db!);
                        INITIAL_CITIES.forEach(city => {
                          const docRef = doc(db!, 'city', city.id!);
                          batch.set(docRef, { ...city, updatedAt: serverTimestamp() });
                        });
                        await batch.commit();
                        toast.success('Villes réinitialisées');
                      } catch (err) {
                        toast.error('Erreur lors de la réinitialisation');
                      }
                    }
                  }}
                  className="bg-secondary text-primary px-4 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/5 transition-all"
                >
                  <RefreshCcw size={18} /> Réinitialiser
                </button>
                <button 
                  onClick={() => { setSelectedCity(null); setIsCityEditorOpen(true); }}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg"
                >
                  <Plus size={18} /> Nouvelle Ville
                </button>
              </div>
            </div>
            <DataTable<City> 
              data={sortByDate(CITIES)}
              title="Liste des Villes"
              columns={[
                { header: 'Nom', accessor: 'name', className: 'font-bold text-primary', sortable: true },
                { header: 'Slug', accessor: 'slug', className: 'font-mono text-xs text-primary/60', sortable: true },
                { 
                  header: 'Prix de livraison', 
                  accessor: (c: City) => `${c.deliveryPrice.toLocaleString()} FCFA`,
                  exportValue: (c: City) => String(c.deliveryPrice),
                  sortable: true,
                  sortKey: 'deliveryPrice',
                  className: 'font-bold text-primary'
                },
                { 
                  header: 'Statut', 
                  accessor: (c: City) => (
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  ),
                  sortable: true
                },
                { 
                  header: 'Actions', 
                  accessor: (c: City) => (
                    <div className="flex gap-2">
                      <button onClick={() => handleEditCity(c)} className="text-primary hover:text-accent">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteCity(c.id!)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )
                },
                { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm', sortable: true }
              ]}
            />
            <CityEditor 
              city={selectedCity} 
              isOpen={isCityEditorOpen} 
              onClose={() => setIsCityEditorOpen(false)} 
              onSave={handleSaveCity}
            />
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button 
                onClick={() => { setModalType('role'); setIsAddModalOpen(true); }}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg"
              >
                + Ajouter un Rôle
              </button>
            </div>
            <DataTable<Role>
              data={sortByDate(localRoles)}
              onRowClick={(role) => { setEditingItem(role); setModalType('role'); }}
              title="Gestion des Rôles"
              columns={[
                { header: 'Nom', accessor: 'name', className: 'font-bold', sortable: true },
                { header: 'Description', accessor: 'description', className: 'text-primary/60', sortable: true },
                { 
                  header: 'Statut', 
                  accessor: (role: Role) => (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocalRoles(prev => prev.map(r => r.id === role.id ? { ...r, status: r.status === 'active' ? 'inactive' : 'active' } : r));
                        toast.success(`Rôle ${role.name} ${role.status === 'active' ? 'désactivé' : 'activé'}`);
                      }}
                      className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors border",
                        getStatusStyles(role.status || 'active')
                      )}
                    >
                      {role.status || 'active'}
                    </button>
                  ),
                  sortable: true,
                  sortKey: 'status'
                },
                {
                    header: 'Actions',
                    accessor: (role: Role) => (
                        <div className="flex gap-2">
                            <button onClick={(e) => { e.stopPropagation(); setEditingItem(role); setModalType('role'); }} className="text-primary hover:text-accent font-bold text-sm">Modifier</button>
                        </div>
                    )
                },
              { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm', sortable: true }
            ]}
            />
          </div>
        )}

        {activeTab === 'flash-sales' && (
          <AdminFlashSales products={localProducts} />
        )}

        {activeTab === 'lookbooks' && (
          <AdminLookbooks products={localProducts} />
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif">Gestion des Clients</h2>
              <TabFilter 
                options={[
                  { id: 'all', label: 'Tous' },
                  { id: 'active', label: 'Actifs' },
                  { id: 'inactive', label: 'Inactifs' },
                ]}
                active={customerFilter}
                onChange={setCustomerFilter}
                className="mb-0"
              />
            </div>
            <DataTable<UserType>
              data={sortByDate(localUsers.filter(u => u.role === 'customer'))}
              onRowClick={(user) => { setSelectedCustomer(user); setActiveTab('customer-detail'); }}
              title="Liste des Clients"
              columns={[
                {
                  header: 'Client',
                  accessor: (user: UserType) => (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-primary">{user.name}</p>
                        <p className="text-xs text-primary/60">{user.email}</p>
                      </div>
                    </div>
                  ),
                  sortable: true,
                  sortKey: 'name'
                },
                { header: 'Commandes', accessor: 'orders', className: 'text-center font-bold text-primary', sortable: true },
                { header: 'Date d\'inscription', accessor: 'joinDate', className: 'text-primary/60 text-sm', sortable: true },
                { 
                  header: 'Statut', 
                  accessor: (user) => <StatusBadge status={user.status || 'active'} />,
                  exportValue: (user) => user.status || 'active',
                  sortable: true,
                  sortKey: 'status'
                },
                {
                    header: 'Actions',
                    accessor: (user: UserType) => (
                        <button onClick={(e) => { e.stopPropagation(); setSelectedCustomer(user); setActiveTab('customer-detail'); }} className="text-primary hover:text-accent font-bold text-sm">Voir Détails</button>
                    )
                },
                { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm', sortable: true }
              ]}
            />
          </div>
        )}

        {activeTab === 'customer-detail' && selectedCustomer && (
          <div className="space-y-8 pb-12">
            {/* Header with Back Button and Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveTab('customers')} 
                  className="p-2 bg-card rounded-full shadow-sm hover:bg-secondary/50 transition-colors border border-primary/10"
                >
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-primary">Détails du Client</h2>
                  <p className="text-sm text-primary/60">ID: {selectedCustomer.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    const newStatus = (selectedCustomer.status || 'active') === 'active' ? 'inactive' : 'active';
                    setLocalUsers(prev => prev.map(u => u.id === selectedCustomer.id ? { ...u, status: newStatus } : u));
                    setSelectedCustomer(prev => prev ? { ...prev, status: newStatus } : null);
                    toast.success(`Client ${newStatus === 'active' ? 'activé' : 'désactivé'}`);
                  }}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border ${
                    (selectedCustomer.status || 'active') === 'active' 
                      ? 'bg-accent/20 text-accent border-accent/10 hover:bg-accent/30' 
                      : 'bg-primary/20 text-primary border-primary/10 hover:bg-primary/30'
                  }`}
                >
                  {(selectedCustomer.status || 'active') === 'active' ? 'Désactiver' : 'Activer'}
                </button>
                <button 
                  onClick={() => toast.success('Email de réinitialisation envoyé')}
                  className="px-4 py-2 bg-card border border-primary/10 rounded-xl text-sm font-bold hover:bg-secondary/50 transition-all"
                >
                  Réinitialiser MDP
                </button>
              </div>
            </div>

            {/* Tabs Sub-navigation */}
            <div className="flex border-b border-primary/10 overflow-x-auto no-scrollbar">
              {[
                { id: 'profile', label: 'Profil', icon: User },
                { id: 'orders', label: 'Commandes', icon: ShoppingBag },
                { id: 'loyalty', label: 'Fidélité', icon: Award },
                { id: 'messages', label: 'Messages', icon: MessageSquare },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCustomerDetailTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                    customerDetailTab === tab.id 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-primary/60 hover:text-primary'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {customerDetailTab === 'profile' && (
                <>
                  {/* Profile Card */}
                  <div className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10 space-y-6 h-fit">
                    <div className="flex flex-col items-center text-center">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold mb-4 border-2 border-primary/20">
                          {selectedCustomer.name[0]}
                        </div>
                        <div className={`absolute bottom-4 right-0 w-6 h-6 rounded-full border-4 border-card ${
                          (selectedCustomer.status || 'active') === 'active' ? 'bg-primary' : 'bg-accent'
                        }`}></div>
                      </div>
                      <h3 className="text-xl font-bold text-primary">{selectedCustomer.name}</h3>
                      <p className="text-primary/60">{selectedCustomer.email}</p>
                      <div className="mt-4 flex gap-2">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          (selectedCustomer.status || 'active') === 'active' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'
                        }`}>
                          {selectedCustomer.status || 'active'}
                        </span>
                        <span className="px-4 py-1.5 bg-primary/15 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest">
                          Client
                        </span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-primary/10 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-primary/60 text-sm">Inscrit le</span>
                        <span className="font-medium text-primary">{selectedCustomer.joinDate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-primary/60 text-sm">Commandes</span>
                        <span className="font-bold text-primary">{selectedCustomer.orders}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-primary/60 text-sm">Total Dépensé</span>
                        <span className="font-bold text-primary">{(selectedCustomer.orders * 15000).toLocaleString()} FCFA</span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-primary/10">
                      <div className="bg-secondary/50 p-4 rounded-2xl">
                        <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Note Interne</p>
                        <textarea 
                          className="w-full bg-transparent border-none focus:ring-0 text-sm text-primary/60 resize-none h-20"
                          placeholder="Ajouter une note sur ce client..."
                          value={selectedCustomer.internalNotes || ''}
                          onChange={(e) => {
                            const newNotes = e.target.value;
                            setSelectedCustomer(prev => prev ? { ...prev, internalNotes: newNotes } : null);
                            setLocalUsers(prev => prev.map(u => u.id === selectedCustomer.id ? { ...u, internalNotes: newNotes } : u));
                          }}
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Edit Form */}
                  <div className="lg:col-span-2 bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
                    <h3 className="text-xl font-serif font-bold mb-6 text-primary">Informations Personnelles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Nom Complet</label>
                        <input 
                          type="text" 
                          value={selectedCustomer.name}
                          onChange={(e) => {
                            const newName = e.target.value;
                            setSelectedCustomer(prev => prev ? { ...prev, name: newName } : null);
                            setLocalUsers(prev => prev.map(u => u.id === selectedCustomer.id ? { ...u, name: newName } : u));
                          }}
                          className="w-full px-4 py-3 bg-secondary/50 border border-primary/10 rounded-xl focus:outline-none focus:border-primary font-medium text-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Email</label>
                        <input 
                          type="email" 
                          value={selectedCustomer.email}
                          onChange={(e) => {
                            const newEmail = e.target.value;
                            setSelectedCustomer(prev => prev ? { ...prev, email: newEmail } : null);
                            setLocalUsers(prev => prev.map(u => u.id === selectedCustomer.id ? { ...u, email: newEmail } : u));
                          }}
                          className="w-full px-4 py-3 bg-secondary/50 border border-primary/10 rounded-xl focus:outline-none focus:border-primary font-medium text-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Téléphone</label>
                        <input 
                          type="tel" 
                          value={selectedCustomer.phone || ''}
                          onChange={(e) => {
                            const newPhone = e.target.value;
                            setSelectedCustomer(prev => prev ? { ...prev, phone: newPhone } : null);
                            setLocalUsers(prev => prev.map(u => u.id === selectedCustomer.id ? { ...u, phone: newPhone } : u));
                          }}
                          placeholder="+225 07..."
                          className="w-full px-4 py-3 bg-secondary/50 border border-primary/10 rounded-xl focus:outline-none focus:border-primary font-medium text-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Adresse de Livraison</label>
                        <input 
                          type="text" 
                          placeholder="Abidjan, Cocody..."
                          className="w-full px-4 py-3 bg-secondary/50 border border-primary/10 rounded-xl focus:outline-none focus:border-primary font-medium text-primary"
                        />
                      </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-primary/10">
                      <h3 className="text-xl font-serif font-bold mb-6 flex items-center gap-2 text-primary">
                        <History size={20} className="text-accent" />
                        Sécurité
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="p-4 bg-secondary/50 rounded-2xl border border-primary/10">
                            <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-1">Dernière Connexion</p>
                            <p className="font-medium text-primary">Il y a 2 heures</p>
                         </div>
                         <div className="p-4 bg-secondary/50 rounded-2xl border border-primary/10">
                            <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-1">Dernier Changement MDP</p>
                            <p className="font-medium text-primary">{selectedCustomer.passwordHistory?.[0] || 'Jamais'}</p>
                         </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-4">
                      <button 
                        onClick={() => toast.success('Modifications enregistrées')}
                        className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:bg-accent transition-all shadow-lg"
                      >
                        Enregistrer les modifications
                      </button>
                    </div>
                  </div>
                </>
              )}

              {customerDetailTab === 'orders' && (() => {
                const customerOrders = localOrders.filter(o => o.customer === selectedCustomer.name);
                const totalSpent = customerOrders.reduce((acc, o) => acc + o.total, 0);
                const averageCart = customerOrders.length > 0 ? totalSpent / customerOrders.length : 0;
                const lastOrder = customerOrders.length > 0 ? [...customerOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;

                return (
                <div className="lg:col-span-3 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-card p-6 rounded-3xl border border-primary/10 shadow-sm">
                      <p className="text-primary/60 text-sm font-medium mb-1">Total Commandes</p>
                      <p className="text-3xl font-serif font-bold text-primary">{customerOrders.length}</p>
                    </div>
                    <div className="bg-card p-6 rounded-3xl border border-primary/10 shadow-sm">
                      <p className="text-primary/60 text-sm font-medium mb-1">Panier Moyen</p>
                      <p className="text-3xl font-serif font-bold text-primary">{averageCart.toLocaleString()} FCFA</p>
                    </div>
                    <div className="bg-card p-6 rounded-3xl border border-primary/10 shadow-sm">
                      <p className="text-primary/60 text-sm font-medium mb-1">Dernière Commande</p>
                      <p className="text-xl font-serif font-bold text-primary">{lastOrder ? formatDate(lastOrder.date) : 'Aucune'}</p>
                    </div>
                  </div>

                  <DataTable<Order>
                    data={customerOrders}
                    title="Historique des Commandes"
                    columns={[
                      { header: 'ID Commande', accessor: 'id', className: 'font-mono text-xs' },
                      { header: 'Date', accessor: 'date' },
                      { 
                        header: 'Statut', 
                        accessor: (order) => <StatusBadge status={order.status} />
                      },
                      { header: 'Articles', accessor: 'items', className: 'text-center' },
                      { header: 'Total', accessor: (order) => `${order.total.toLocaleString()} FCFA`, className: 'font-bold text-primary' },
                      {
                        header: 'Actions',
                        accessor: (order) => (
                          <button 
                            onClick={() => { setSelectedOrder(order); setActiveTab('order-detail'); }}
                            className="p-2 hover:bg-secondary/50 rounded-lg transition-colors text-primary/60 hover:text-primary"
                          >
                            <Eye size={18} />
                          </button>
                        )
                      }
                    ]}
                  />
                </div>
                );
              })()}

              {customerDetailTab === 'loyalty' && (
                <div className="lg:col-span-3 space-y-8">
                  <div className="bg-gradient-to-br from-primary to-accent p-12 rounded-[3rem] text-primary-foreground relative overflow-hidden shadow-xl">
                    <div className="relative z-10">
                      <p className="text-primary-foreground/70 font-bold uppercase tracking-widest text-sm mb-2">Programme de Fidélité</p>
                      <h3 className="text-4xl font-serif font-bold mb-6">Statut {selectedCustomer.loyaltyTier || 'Bronze'}</h3>
                      <div className="flex items-end gap-4">
                        <p className="text-6xl font-bold">{(selectedCustomer.points || 0).toLocaleString()}</p>
                        <p className="text-xl mb-2 opacity-80">Points</p>
                      </div>
                      <div className="mt-8 max-w-md">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Prochain palier : {selectedCustomer.loyaltyTier === 'Platinum' ? 'Maximum atteint' : 'Suivant'}</span>
                          <span>{Math.min(100, ((selectedCustomer.points || 0) % 1000) / 10).toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-foreground" style={{ width: `${Math.min(100, ((selectedCustomer.points || 0) % 1000) / 10)}%` }}></div>
                        </div>
                      </div>
                    </div>
                    <Award size={200} className="absolute -right-10 -bottom-10 text-primary-foreground/10 rotate-12" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-card p-8 rounded-[2.5rem] border border-primary/10 shadow-sm">
                      <h4 className="text-lg font-serif font-bold mb-6 text-primary">Badges Débloqués</h4>
                      <div className="grid grid-cols-4 gap-4">
                        {(selectedCustomer.badges || []).length > 0 ? (
                          selectedCustomer.badges?.map((badge) => (
                            <div key={badge.id} className="flex flex-col items-center gap-2">
                              <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center text-accent border border-primary/10">
                                <span className="text-2xl">{badge.icon}</span>
                              </div>
                              <span className="text-[10px] font-bold text-primary/60 uppercase text-center">{badge.name}</span>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-4 text-center py-8 text-primary/60 italic">Aucun badge débloqué</div>
                        )}
                      </div>
                    </div>
                    <div className="bg-card p-8 rounded-[2.5rem] border border-primary/10 shadow-sm">
                      <h4 className="text-lg font-serif font-bold mb-6 text-primary">Avantages Actifs</h4>
                      <ul className="space-y-4">
                        <li className="flex items-center gap-3 text-primary/60">
                          <CheckCircle2 size={20} className="text-primary" />
                          Livraison gratuite illimitée
                        </li>
                        {selectedCustomer.loyaltyTier === 'Gold' || selectedCustomer.loyaltyTier === 'Platinum' ? (
                          <li className="flex items-center gap-3 text-primary/60">
                            <CheckCircle2 size={20} className="text-primary" />
                            -10% sur toute la boutique
                          </li>
                        ) : null}
                        {selectedCustomer.loyaltyTier === 'Platinum' ? (
                          <li className="flex items-center gap-3 text-primary/60">
                            <CheckCircle2 size={20} className="text-primary" />
                            Accès anticipé aux nouvelles collections
                          </li>
                        ) : null}
                        <li className="flex items-center gap-3 text-primary/60">
                          <CheckCircle2 size={20} className="text-primary" />
                          Service client prioritaire
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {customerDetailTab === 'messages' && (() => {
                const conversation = CONVERSATIONS.find(c => c.userId === selectedCustomer.id);
                return (
                <div className="lg:col-span-3 bg-card rounded-[2.5rem] border border-primary/10 shadow-sm overflow-hidden flex flex-col h-[600px]">
                  <div className="p-6 border-b border-primary/10 flex justify-between items-center bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {selectedCustomer.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-primary">{selectedCustomer.name}</p>
                        <p className="text-xs text-primary/60 flex items-center gap-1">
                          <span className="w-2 h-2 bg-primary/40 rounded-full"></span>
                          En ligne
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        if (conversation) {
                          setSelectedConversation(conversation);
                          setActiveTab('messages');
                        }
                      }}
                      className="text-primary font-bold text-sm hover:underline"
                    >
                      Voir tout l'historique
                    </button>
                  </div>
                  
                  <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-secondary/30">
                    {conversation ? (
                      <>
                        <div className="flex justify-center">
                          <span className="px-4 py-1 bg-card rounded-full text-[10px] font-bold text-primary/60 uppercase tracking-widest border border-primary/10">Conversation ID: {conversation.id}</span>
                        </div>
                        
                        {conversation.messages.map((msg) => (
                          <div key={msg.id} className={`flex gap-4 max-w-[80%] ${msg.isAdmin ? 'ml-auto flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              msg.isAdmin ? 'bg-accent text-accent-foreground' : 'bg-primary/10 text-primary'
                            }`}>
                              {msg.isAdmin ? 'A' : selectedCustomer.name[0]}
                            </div>
                            <div className={`p-4 rounded-2xl shadow-sm border ${
                              msg.isAdmin 
                                ? 'bg-primary text-primary-foreground border-primary rounded-tr-none' 
                                : 'bg-card text-primary/60 border-primary/10 rounded-tl-none'
                            }`}>
                              <p className="text-sm">{msg.message}</p>
                              <p className={`text-[10px] mt-2 font-medium ${msg.isAdmin ? 'text-primary-foreground/70' : 'text-primary/60'}`}>
                                {msg.timestamp}
                              </p>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-primary/60 space-y-4">
                        <MessageSquare size={48} className="opacity-20" />
                        <p>Aucune conversation trouvée avec ce client.</p>
                        <button 
                          onClick={() => toast.info('Nouvelle conversation initiée')}
                          className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm"
                        >
                          Démarrer une discussion
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-6 border-t border-primary/10 bg-card">
                    <div className="flex gap-4">
                      <input 
                        type="text" 
                        placeholder="Écrire un message..."
                        className="flex-1 px-6 py-3 bg-secondary/50 border border-primary/10 rounded-xl focus:outline-none focus:border-primary"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            toast.success('Message envoyé');
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <button 
                        onClick={() => toast.success('Message envoyé')}
                        className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-accent transition-all shadow-lg"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </div>
                );
              })()}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button 
                onClick={() => { setModalType('user'); setIsAddModalOpen(true); }}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg"
              >
                + Ajouter un Utilisateur
              </button>
            </div>
            <DataTable<UserType>
              data={sortByDate(localUsers.filter(u => u.role !== 'customer'))}
              onRowClick={(user) => onNavigate('admin-user-detail', user.id)}
              title="Liste des Utilisateurs"
              columns={[
                {
                  header: 'Utilisateur',
                  accessor: (user: UserType) => (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/5 text-accent flex items-center justify-center font-bold">
                        {user.name[0]}
                      </div>
                      <span className="font-medium text-primary">{user.name}</span>
                    </div>
                  ),
                },
                { header: 'Email', accessor: 'email', className: 'text-primary/60' },
                { 
                  header: 'Points', 
                  accessor: (u: UserType) => (
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-accent">{(u.points || 0).toLocaleString()}</span>
                        <span className="text-[10px] text-primary/40 uppercase font-bold tracking-tighter">pts</span>
                    </div>
                  ),
                  sortable: true,
                  sortKey: 'points'
                },
                { 
                  header: 'Rôle', 
                  accessor: (u: UserType) => localRoles.find(r => r.id === u.role)?.name || (u.role === 'customer' ? 'Client' : u.role), 
                  className: 'font-bold uppercase text-xs tracking-widest text-primary' 
                },
                { header: 'Date d\'ajout', accessor: 'joinDate', className: 'text-primary/60' },
                {
                    header: 'Actions',
                    accessor: (user: UserType) => (
                        <div className="flex gap-2">
                            <button onClick={(e) => { e.stopPropagation(); setEditingItem(user); setModalType('user'); }} className="text-primary hover:text-accent font-bold text-sm">Modifier</button>
                        </div>
                    )
                },
                { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm', sortable: true }
              ]}
            />
          </div>
        )}

        {activeTab === 'packs' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button 
                onClick={() => { setModalType('pack'); setIsAddModalOpen(true); }}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg"
              >
                + Ajouter un Pack
              </button>
            </div>
            <DataTable<Pack>
              data={sortByDate(localPacks)}
              onRowClick={(p) => { setEditingItem(p); setModalType('pack'); }}
              title="Packs"
              columns={[
                { header: 'ID', accessor: 'id', className: 'font-mono text-xs', sortable: true },
                { header: 'Nom', accessor: 'name', className: 'font-bold', sortable: true },
                { 
                  header: 'Produits', 
                  accessor: (p: Pack) => p.products.length, 
                  className: 'text-center font-bold',
                  sortable: true,
                  sortKey: 'products'
                },
                { header: 'Code Promo', accessor: 'promoCode', className: 'font-mono text-accent', sortable: true },
                { 
                  header: 'Réduction', 
                  accessor: (p) => `${p.discountPercentage}%`, 
                  className: 'text-right',
                  sortable: true,
                  sortKey: 'discountPercentage'
                },
                { 
                  header: 'Statut', 
                  accessor: (pack: Pack) => (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocalPacks(prev => prev.map(p => p.id === pack.id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p));
                        toast.success(`Pack ${pack.name} ${pack.status === 'active' ? 'désactivé' : 'activé'}`);
                      }}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
                        pack.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-secondary/50 text-primary/60'
                      }`}
                    >
                      {pack.status || 'active'}
                    </button>
                  ),
                  sortable: true,
                  sortKey: 'status'
                },
                {
                  header: 'Actions',
                  accessor: (pack: Pack) => (
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingItem(pack); setModalType('pack'); }}
                        className="text-primary font-bold text-sm hover:underline"
                      >
                        Modifier
                      </button>
                    </div>
                  )
                },
                { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm', sortable: true }
              ]}
            />
          </div>
        )}

        {activeTab === 'lookbook' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button 
                onClick={() => { setModalType('lookbook'); setIsAddModalOpen(true); }}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg"
              >
                + Ajouter au Lookbook
              </button>
            </div>
            <DataTable<any>
              data={sortByDate(localLookbook)}
              onRowClick={(l) => { setEditingItem(l); setModalType('lookbook'); }}
              title="Lookbook"
              columns={[
                { header: 'ID', accessor: 'id', className: 'font-mono text-xs' },
                { header: 'Image', accessor: (l) => <img src={l.image} alt="Lookbook" className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" /> },
                { header: 'Légende', accessor: 'caption', className: 'line-clamp-1 max-w-[200px]' },
                { header: 'Tags', accessor: (l) => l.tags.length, className: 'text-center font-bold' },
                { header: 'J\'aime', accessor: 'initialLikes', className: 'text-right' },
                { 
                  header: 'Statut', 
                  accessor: (look: any) => (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocalLookbook(prev => prev.map(l => l.id === look.id ? { ...l, status: l.status === 'active' ? 'inactive' : 'active' } : l));
                        toast.success(`Look ${look.id} ${look.status === 'active' ? 'désactivé' : 'activé'}`);
                      }}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
                        look.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-secondary/50 text-primary/60'
                      }`}
                    >
                      {look.status || 'active'}
                    </button>
                  )
                },
                {
                  header: 'Actions',
                  accessor: (look: any) => (
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingItem(look); setModalType('lookbook'); }}
                        className="text-primary font-bold text-sm hover:underline"
                      >
                        Modifier
                      </button>
                    </div>
                  )
                },
                { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm', sortable: true }
              ]}
            />
          </div>
        )}

        {activeTab === 'blog' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button 
                onClick={() => { setModalType('blog'); setIsAddModalOpen(true); }}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg"
              >
                + Nouvel Article
              </button>
            </div>
            <DataTable<any>
              data={sortByDate(localBlogPosts)}
              onRowClick={(b) => { setEditingItem(b); setModalType('blog'); }}
              title="Blog"
              columns={[
                { header: 'ID', accessor: 'id', className: 'font-mono text-xs' },
                { header: 'Titre', accessor: 'title', className: 'font-bold' },
                { header: 'Catégorie', accessor: 'category' },
                { header: 'Date Opération', accessor: 'date' },
                { 
                  header: 'Statut', 
                  accessor: (post: any) => (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocalBlogPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p));
                        toast.success(`Article ${post.title} ${post.status === 'active' ? 'désactivé' : 'activé'}`);
                      }}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
                        post.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-secondary/50 text-primary/60'
                      }`}
                    >
                      {post.status || 'active'}
                    </button>
                  )
                },
                {
                  header: 'Actions',
                  accessor: (post: any) => (
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingItem(post); setModalType('blog'); }}
                        className="text-primary font-bold text-sm hover:underline"
                      >
                        Modifier
                      </button>
                    </div>
                  )
                },
                { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm', sortable: true }
              ]}
            />
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-serif">Notifications Système</h3>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    setLocalSystemNotifications(prev => prev.map(n => ({ ...n, read: true })));
                    toast.success('Toutes les notifications ont été marquées comme lues');
                  }}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Tout marquer comme lu
                </button>
                <TabFilter 
                  options={[
                    { id: 'all', label: 'Toutes' },
                    { id: 'read', label: 'Lues' },
                    { id: 'unread', label: 'Non lues' },
                  ]}
                  active={notificationFilter}
                  onChange={setNotificationFilter}
                  className="mb-0"
                />
              </div>
            </div>
            <div className="bg-card rounded-[2.5rem] shadow-sm border border-primary/10 overflow-hidden">
                {localSystemNotifications
                  .filter(n => {
                    if (notificationFilter === 'all') return true;
                    if (notificationFilter === 'read') return n.read;
                    if (notificationFilter === 'unread') return !n.read;
                    return true;
                  })
                  .map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-6 border-b border-primary/5 flex gap-4 hover:bg-secondary/50 transition-colors cursor-pointer ${!notif.read ? 'bg-primary/5' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notif.type === 'order' ? 'bg-primary/20 text-primary' : 
                      notif.type === 'stock' ? 'bg-accent/20 text-accent' : 'bg-primary/10 text-primary'
                    }`}>
                      {notif.type === 'order' ? <CheckCircle2 size={20} /> : 
                       notif.type === 'stock' ? <AlertCircle size={20} /> : <MessageSquare size={20} />}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`font-bold text-sm ${!notif.read ? 'text-primary' : 'text-primary/60'}`}>{notif.title}</h4>
                        <span className="text-[10px] font-bold text-primary/40">{notif.timestamp}</span>
                      </div>
                      <p className="text-xs text-primary/60 leading-relaxed">{notif.message}</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocalSystemNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: !n.read } : n));
                      }}
                      className={`self-center p-2 rounded-full transition-colors ${notif.read ? 'text-primary/20 hover:bg-secondary/50' : 'text-primary hover:bg-primary/5'}`}
                      title={notif.read ? "Marquer comme non lu" : "Marquer comme lu"}
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  </div>
                ))}
                {localSystemNotifications.length === 0 && (
                  <div className="p-12 text-center text-primary/60">
                    <Bell size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Aucune notification pour le moment</p>
                  </div>
                )}
            </div>
          </div>
        )}

        {activeTab === 'newsletter' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif">Gestion de la Newsletter</h2>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    toast.info('Fonctionnalité d\'exportation en cours de préparation');
                  }}
                  className="bg-card text-primary/60 px-6 py-3 rounded-xl font-bold flex items-center gap-2 border border-primary/10 hover:bg-secondary/50 transition-all shadow-sm"
                >
                  <Download size={18} /> Exporter CSV
                </button>
                <button 
                  onClick={() => {
                    toast.info('Envoi groupé en cours de préparation');
                  }}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg"
                >
                  <Mail size={18} /> Envoyer une Campagne
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card p-6 rounded-3xl border border-primary/10 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Total Abonnés</p>
                <p className="text-3xl font-serif text-primary">{SUBSCRIBERS.length}</p>
              </div>
              <div className="bg-card p-6 rounded-3xl border border-primary/10 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Actifs</p>
                <p className="text-3xl font-serif text-primary">{SUBSCRIBERS.filter(s => s.status === 'active').length}</p>
              </div>
              <div className="bg-card p-6 rounded-3xl border border-primary/10 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Désabonnés</p>
                <p className="text-3xl font-serif text-accent">{SUBSCRIBERS.filter(s => s.status === 'unsubscribed').length}</p>
              </div>
            </div>

            <DataTable<NewsletterSubscriber>
              data={sortByDate(SUBSCRIBERS)}
              title="Liste des Abonnés"
              columns={[
                { header: 'Email', accessor: 'email', className: 'font-bold text-primary' },
                { header: 'Date d\'inscription', accessor: 'subscribedAt', className: 'text-primary/60' },
                { 
                  header: 'Statut', 
                  accessor: (sub) => <StatusBadge status={sub.status} />,
                  exportValue: (sub) => sub.status
                },
                {
                  header: 'Actions',
                  accessor: (sub) => (
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocalSubscribers(prev => prev.map(s => s.id === sub.id ? { ...s, status: s.status === 'active' ? 'unsubscribed' : 'active' } : s));
                          toast.success(`Statut de ${sub.email} mis à jour`);
                        }}
                        className="text-primary font-bold text-sm hover:underline"
                      >
                        {sub.status === 'active' ? 'Désabonner' : 'Réactiver'}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocalSubscribers(prev => prev.filter(s => s.id !== sub.id));
                          toast.error('Abonné supprimé');
                        }}
                        className="text-accent font-bold text-sm hover:underline"
                      >
                        Supprimer
                      </button>
                    </div>
                  )
                },
                { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm', sortable: true }
              ]}
            />
          </div>
        )}

        {activeTab === 'push-notifications' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button 
                onClick={() => { setModalType('notification'); setIsAddModalOpen(true); }}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg"
              >
                + Ajouter une Notification Push
              </button>
            </div>
            <DataTable<PushNotification>
              data={sortByDate(PUSH_NOTIFICATIONS)}
              onRowClick={(n) => { setEditingItem(n); setModalType('notification'); }}
              title="Notifications Push (Marketing)"
              columns={[
                { header: 'ID', accessor: 'id', className: 'font-mono text-xs text-primary/60' },
                { header: 'Titre', accessor: 'title', className: 'font-bold text-primary' },
                { header: 'Message', accessor: 'message', className: 'text-primary/60' },
                { 
                  header: 'Statut', 
                  accessor: (n) => (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      n.status === 'sent' ? 'bg-primary/20 text-primary' : 
                      n.status === 'scheduled' ? 'bg-primary/10 text-primary' :
                      n.status === 'inactive' ? 'bg-secondary/50 text-primary/60' :
                      'bg-accent/20 text-accent'
                    }`}>
                      {n.status === 'sent' ? 'Envoyé' : 
                       n.status === 'scheduled' ? 'Planifié' :
                       n.status === 'inactive' ? 'Inactif' : 'Brouillon'}
                    </span>
                  ),
                  exportValue: (n) => n.status
                },
                { header: 'Date d\'envoi', accessor: 'sentAt', className: 'text-primary/60' },
                {
                  header: 'Actions',
                  accessor: (n) => (
                    <div className="flex gap-2">
                      {n.status === 'draft' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocalPushNotifications(prev => prev.map(notif => {
                              if (notif.id === n.id) {
                                const updated: PushNotification = { ...notif, status: 'sent', sentAt: new Date().toISOString().split('T')[0] };
                                window.dispatchEvent(new CustomEvent('push-notification', { detail: updated }));
                                return updated;
                              }
                              return notif;
                            }));
                            toast.success('Notification envoyée !');
                          }}
                          className="text-primary font-bold text-sm hover:underline"
                        >
                          Envoyer
                        </button>
                      )}
                      {n.status === 'scheduled' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocalPushNotifications(prev => prev.map(notif => {
                              if (notif.id === n.id) {
                                return { ...notif, status: 'inactive' };
                              }
                              return notif;
                            }));
                            toast.success('Notification désactivée !');
                          }}
                          className="text-accent font-bold text-sm hover:underline"
                        >
                          Désactiver
                        </button>
                      )}
                      {n.status === 'inactive' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocalPushNotifications(prev => prev.map(notif => {
                              if (notif.id === n.id) {
                                return { ...notif, status: 'scheduled' };
                              }
                              return notif;
                            }));
                            toast.success('Notification réactivée !');
                          }}
                          className="text-primary font-bold text-sm hover:underline"
                        >
                          Activer
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingItem(n); setModalType('notification'); }}
                        className="text-primary/60 font-bold text-sm hover:underline"
                      >
                        Modifier
                      </button>
                    </div>
                  )
                },
                { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm', sortable: true }
              ]}
            />
          </div>
        )}
        {activeTab === 'faq' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-serif font-bold text-primary">Gestion Foire Aux Questions (FAQ)</h3>
                <p className="text-xs text-primary/60">Gérez les questions fréquentes affichées sur le site</p>
              </div>
              <button 
                onClick={() => { setSelectedFAQ(null); setIsFAQEditorOpen(true); }}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg"
              >
                <Plus size={18} /> Ajouter une Question
              </button>
            </div>
            <DataTable<FAQ> 
              data={FAQS}
              title="FAQ"
              columns={[
                { header: 'Ordre', accessor: 'order', sortable: true },
                { header: 'Question', accessor: 'question', className: 'font-bold text-primary line-clamp-1 max-w-[300px]', sortable: true },
                { header: 'Catégorie', accessor: 'category', className: 'text-primary/60', sortable: true },
                { 
                  header: 'Statut', 
                  accessor: (faq) => (
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${faq.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-secondary text-primary/40'}`}>
                      {faq.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  ),
                  sortable: true,
                  sortKey: 'status'
                },
                {
                  header: 'Actions',
                  accessor: (faq: FAQ) => (
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEditFAQ(faq); }}
                        className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteFAQ(faq.id); }}
                        className="p-2 text-primary/60 hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )
                },
                { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm', sortable: true }
              ]}
              onRowClick={handleEditFAQ}
            />
            {isFAQEditorOpen && (
              <FAQEditor 
                faq={selectedFAQ} 
                onSave={handleSaveFAQ} 
                onClose={() => setIsFAQEditorOpen(false)} 
              />
            )}
          </div>
        )}
        {activeTab === 'emails' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button 
                onClick={() => { setModalType('email'); setIsAddModalOpen(true); }}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg"
              >
                + Ajouter un Email
              </button>
            </div>
            <DataTable<Email>
              data={sortByDate(EMAILS)}
              onRowClick={(e) => { setEditingItem(e); setModalType('email'); }}
              title="Gestion Emails"
              columns={[
                { header: 'ID', accessor: 'id', className: 'font-mono text-xs text-primary/60' },
                { header: 'Sujet', accessor: 'subject', className: 'font-bold text-primary' },
                { header: 'Destinataire', accessor: 'recipient', className: 'text-primary/60' },
                { header: 'Statut', accessor: 'status', className: 'font-bold text-primary' },
                { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt), className: 'text-primary/60 text-sm', sortable: true }
              ]}
            />
          </div>
        )}
        
        {activeTab === 'customer-groups' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif text-primary">Groupes Clients</h2>
              <button 
                onClick={() => { setModalType('customer-group'); setIsAddModalOpen(true); }}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg"
              >
                <Plus size={18} /> Nouveau Groupe
              </button>
            </div>
            <DataTable<CustomerGroup> 
              data={sortByDate(localCustomerGroups)}
              title="Groupes de Clients"
              columns={[
                { header: 'Nom', accessor: 'name', className: 'font-bold text-primary' },
                { header: 'Réduction', accessor: (g: CustomerGroup) => `${g.discountPercentage}%`, className: 'font-bold text-primary' },
                { 
                  header: 'Statut', 
                  accessor: (group: CustomerGroup) => (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocalCustomerGroups(prev => prev.map(g => g.id === group.id ? { ...g, status: g.status === 'active' ? 'inactive' : 'active' } : g));
                        toast.success(`Groupe ${group.name} ${group.status === 'active' ? 'désactivé' : 'activé'}`);
                      }}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
                        group.status === 'active' ? 'bg-primary/20 text-primary' : 'bg-secondary/50 text-primary/60'
                      }`}
                    >
                      {group.status || 'active'}
                    </button>
                  )
                },
                {
                  header: 'Actions',
                  accessor: (group: CustomerGroup) => (
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingItem(group); setModalType('customer-group'); }}
                        className="text-primary font-bold text-sm hover:underline"
                      >
                        Modifier
                      </button>
                    </div>
                  )
                },
                { header: 'Créé le', accessor: (g: CustomerGroup) => formatDate(g.createdAt), className: 'text-primary/60 text-sm' }
              ]}
            />
          </div>
        )}

        {activeTab === 'user-profile' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
               <button onClick={() => setActiveTab('overview')} className="p-2 hover:bg-secondary/50 rounded-full transition-colors">
                 <ArrowUpRight className="rotate-180" size={24} />
               </button>
               <h2 className="text-2xl font-serif font-bold">Mon Profil</h2>
            </div>
            <div className="bg-card p-8 rounded-[2rem] border border-primary/10 shadow-sm max-w-2xl mx-auto">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-32 h-32 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-4xl font-bold shadow-lg mb-4">
                  AD
                </div>
                <h3 className="text-2xl font-serif font-bold text-primary">Admin Laine</h3>
                <p className="text-primary/60">Administrateur Principal</p>
                <span className="mt-2 px-4 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-bold uppercase tracking-widest">Actif</span>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Email</label>
                    <p className="font-medium text-primary">admin@laine-deco.com</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Téléphone</label>
                    <p className="font-medium text-primary">+225 07 07 07 07 07</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Rôle</label>
                    <p className="font-medium text-primary">Super Admin</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Dernière connexion</label>
                    <p className="font-medium text-primary">{new Date().toLocaleDateString()} à {new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-primary/10">
                   <button className="w-full py-4 bg-secondary/50 text-primary/60 rounded-2xl font-bold hover:bg-secondary/70 transition-all">
                     Modifier le mot de passe
                   </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'product-create' || activeTab === 'product-edit') && (
          <div className="space-y-6">
             <div className="flex items-center gap-4 mb-6">
               <button onClick={() => { setActiveTab('products'); setEditingItem(null); }} className="p-2 hover:bg-secondary/50 rounded-full transition-colors">
                 <ArrowUpRight className="rotate-180" size={24} />
               </button>
               <h2 className="text-2xl font-serif font-bold">{activeTab === 'product-create' ? 'Créer un Produit' : 'Modifier le Produit'}</h2>
            </div>
            
            <div className="bg-card p-8 rounded-[2rem] border border-primary/10 shadow-sm max-w-4xl mx-auto">
              <form className="space-y-8" onSubmit={(e) => {
                  handleFormSubmit(e).then(() => {
                      setActiveTab('products');
                      setEditingItem(null);
                  });
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="font-serif font-bold text-lg border-b border-primary/10 pb-2">Informations Générales</h4>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Nom du produit</label>
                      <input 
                        name="name"
                        type="text" 
                        className="input-field" 
                        placeholder="Laine Mérinos..." 
                        defaultValue={editingItem?.name}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Catégorie</label>
                      <select name="category" className="input-field" defaultValue={editingItem?.category || localCategories[0]?.name}>
                        {localCategories.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Description</label>
                      <textarea 
                        name="description" 
                        className="input-field h-32" 
                        placeholder="Description détaillée..."
                        defaultValue={editingItem?.description}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <h4 className="font-serif font-bold text-lg border-b border-primary/10 pb-2">Prix & Stock</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Prix (FCFA)</label>
                          <input 
                            name="price"
                            type="number" 
                            className="input-field" 
                            placeholder="5000" 
                            defaultValue={editingItem?.price}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Prix Promo</label>
                          <input 
                            name="promoPrice"
                            type="number" 
                            className="input-field" 
                            placeholder="Optionnel" 
                            defaultValue={editingItem?.promoPrice}
                          />
                        </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Prix d'achat (Marge)</label>
                      <input 
                        name="purchasePrice"
                        type="number" 
                        className="input-field" 
                        placeholder="Coût revient" 
                        defaultValue={editingItem?.purchasePrice}
                      />
                    </div>
                    <div className="space-y-2 bg-secondary/50 p-4 rounded-xl border border-primary/10">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/60 flex items-center gap-2">
                        <Package size={14} /> Stock Disponible
                      </label>
                      <input 
                        name="stock"
                        type="number" 
                        className="input-field text-lg font-bold text-primary" 
                        placeholder="0" 
                        defaultValue={editingItem?.stock}
                        required
                      />
                      <p className="text-[10px] text-primary/60 mt-1">Gérez votre stock directement ici.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                    <h4 className="font-serif font-bold text-lg border-b border-primary/10 pb-2">SEO & Médias</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Titre SEO</label>
                              <input name="seoTitle" type="text" className="input-field" defaultValue={editingItem?.seo?.title} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Description SEO</label>
                              <textarea name="seoDescription" className="input-field" defaultValue={editingItem?.seo?.description} />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Image URL</label>
                            <input name="image" type="text" className="input-field" defaultValue={editingItem?.image} placeholder="https://..." />
                            {editingItem?.image && (
                                <div className="mt-4 rounded-xl overflow-hidden border border-primary/10 h-40 w-full">
                                    <img src={editingItem.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {editingItem && (
                  <div className="flex gap-4 text-xs text-primary/60 font-mono bg-secondary/50 p-4 rounded-xl mb-4 border border-primary/10">
                    <div><span className="font-bold text-primary/60">Créé le:</span> {formatDate(editingItem.createdAt)}</div>
                    <div><span className="font-bold text-primary/60">Modifié le:</span> {formatDate(editingItem.updatedAt)}</div>
                  </div>
                )}
                <div className="flex gap-4 pt-6 border-t border-primary/10">
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('products')}
                    className="flex-grow py-4 bg-secondary/50 text-primary/60 rounded-2xl font-bold hover:bg-secondary/70 transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="flex-grow py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-accent transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader text="" /> : (activeTab === 'product-edit' ? 'Enregistrer les modifications' : 'Créer le Produit')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'rma-detail' && editingItem && (
          <div className="space-y-6">
             <div className="flex items-center gap-4 mb-6">
               <button onClick={() => { setActiveTab('rmas'); setEditingItem(null); }} className="p-2 hover:bg-secondary rounded-full transition-colors">
                 <ArrowUpRight className="rotate-180" size={24} />
               </button>
               <h2 className="text-2xl font-serif font-bold">Détail Retour #{editingItem.id}</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card p-8 rounded-[2rem] border border-primary/10 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-primary/60">Client</p>
                                <h3 className="text-xl font-bold text-primary">{editingItem.customer}</h3>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${
                                editingItem.status === 'approved' ? 'bg-green-200 text-green-800' :
                                editingItem.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                                editingItem.status === 'received' ? 'bg-blue-200 text-blue-800' :
                                editingItem.status === 'refunded' ? 'bg-purple-200 text-purple-800' :
                                'bg-red-200 text-red-800'
                            }`}>
                                {editingItem.status}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-1">Commande</p>
                                <button 
                                  onClick={() => {
                                    const order = localOrders.find(o => o.id === editingItem.orderId);
                                    if (order) {
                                      setSelectedOrder(order);
                                      setActiveTab('order-detail');
                                    } else {
                                      toast.error('Commande non trouvée');
                                    }
                                  }}
                                  className="font-mono font-bold text-primary hover:underline"
                                >
                                  {editingItem.orderId}
                                </button>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-1">Date de demande</p>
                                <p className="font-medium">{editingItem.date}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-1">Montant à rembourser</p>
                                <p className="font-bold text-lg text-primary">{editingItem.amount.toLocaleString()} FCFA</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-1">Raison du retour</p>
                                <p className="font-medium">{editingItem.reason}</p>
                            </div>
                        </div>

                        {/* Order Items Preview */}
                        <div className="border-t border-primary/5 pt-6 mt-6">
                          <h4 className="font-serif font-bold text-lg mb-4">Articles de la commande</h4>
                          <div className="space-y-4">
                            {localOrders.find(o => o.id === editingItem.orderId)?.orderDetails?.map((item, i) => (
                              <div key={i} className="flex justify-between items-center bg-secondary p-4 rounded-xl">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-card rounded-lg overflow-hidden border border-primary/10">
                                    <img 
                                      src={localProducts.find(p => p.id === item.productId)?.image} 
                                      alt={item.name} 
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-bold text-sm text-primary">{item.name}</p>
                                    <p className="text-xs text-primary/60">Quantité: {item.quantity}</p>
                                  </div>
                                </div>
                                <p className="font-bold text-sm text-primary">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                              </div>
                            ))}
                          </div>
                        </div>
                    </div>

                    {/* Internal Notes */}
                    <div className="bg-secondary/30 p-8 rounded-[2rem] border border-primary/10 shadow-sm">
                      <h4 className="font-serif font-bold text-lg mb-6 flex items-center gap-2 text-primary">
                        <MessageSquare size={20} className="text-primary" /> Notes Internes
                      </h4>
                      
                      <div className="space-y-4 mb-6">
                        {editingItem.internalNotes && editingItem.internalNotes.length > 0 ? (
                          editingItem.internalNotes.map(note => (
                            <div key={note.id} className="bg-secondary/50 p-4 rounded-2xl border border-primary/10">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-xs text-primary">{note.author}</span>
                                <span className="text-[10px] text-primary/60">{note.date}</span>
                              </div>
                              <p className="text-sm text-primary/80">{note.note}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-primary/40 italic text-center py-4">Aucune note interne pour le moment.</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="Ajouter une note interne..."
                          value={newRMANote}
                          onChange={(e) => setNewRMANote(e.target.value)}
                          className="flex-grow bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const note = e.currentTarget.value;
                              if (!note.trim()) return;
                              
                              const noteObj = {
                                id: Math.random().toString(36).substr(2, 9),
                                date: new Date().toLocaleString(),
                                note,
                                author: 'Admin'
                              };
                              
                              const updatedRMA = { 
                                ...editingItem, 
                                internalNotes: [...(editingItem.internalNotes || []), noteObj] 
                              };
                              
                              updateRMA(editingItem.id, { internalNotes: updatedRMA.internalNotes });
                              setEditingItem(updatedRMA);
                              setNewRMANote('');
                              toast.success('Note ajoutée');
                            }
                          }}
                        />
                        <button 
                          onClick={() => {
                            if (!newRMANote.trim()) return;
                            
                            const noteObj = {
                              id: Math.random().toString(36).substr(2, 9),
                              date: new Date().toLocaleString(),
                              note: newRMANote,
                              author: 'Admin'
                            };
                            
                            const updatedRMA = { 
                              ...editingItem, 
                              internalNotes: [...(editingItem.internalNotes || []), noteObj] 
                            };
                            
                            updateRMA(editingItem.id, { internalNotes: updatedRMA.internalNotes });
                            setEditingItem(updatedRMA);
                            setNewRMANote('');
                            toast.success('Note ajoutée');
                          }}
                          className="bg-primary text-white p-3 rounded-xl hover:bg-accent transition-all"
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </div>
                </div>
                
                <div className="space-y-6">
                    <div className="bg-secondary/30 p-6 rounded-[2rem] border border-primary/10 shadow-sm">
                        <h4 className="font-serif font-bold text-lg mb-4 text-primary">Mettre à jour le statut</h4>
                        <div className="space-y-3">
                            <button 
                                onClick={() => {
                                    toast.success('Retour approuvé avec succès');
                                    updateRMA(editingItem.id, { status: 'approved' });
                                    setActiveTab('rmas');
                                    setEditingItem(null);
                                }}
                                disabled={editingItem.status === 'approved'}
                                className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg ${
                                  editingItem.status === 'approved' 
                                  ? 'bg-primary/10 text-primary/40 cursor-not-allowed' 
                                  : 'bg-green-700/80 text-white hover:bg-green-700 shadow-green-500/10'
                                }`}
                            >
                                Approuver le retour
                            </button>
                            <button 
                                onClick={() => {
                                    toast.success('Retour marqué comme reçu');
                                    updateRMA(editingItem.id, { status: 'received' });
                                    setActiveTab('rmas');
                                    setEditingItem(null);
                                }}
                                disabled={editingItem.status === 'received'}
                                className={`w-full py-3 rounded-xl font-bold transition-all ${
                                  editingItem.status === 'received'
                                  ? 'bg-primary/10 text-primary/40 cursor-not-allowed'
                                  : 'bg-blue-700/80 text-white hover:bg-blue-700 shadow-blue-500/10'
                                }`}
                            >
                                Marquer comme reçu
                            </button>
                            <button 
                                onClick={() => {
                                    toast.success('Remboursement effectué');
                                    updateRMA(editingItem.id, { status: 'refunded' });
                                    setActiveTab('rmas');
                                    setEditingItem(null);
                                }}
                                disabled={editingItem.status === 'refunded'}
                                className={`w-full py-3 rounded-xl font-bold transition-all ${
                                  editingItem.status === 'refunded'
                                  ? 'bg-primary/10 text-primary/40 cursor-not-allowed'
                                  : 'bg-primary text-white hover:bg-accent shadow-lg'
                                }`}
                            >
                                Rembourser
                            </button>
                            <button 
                                onClick={() => {
                                    toast.error('Retour refusé');
                                    updateRMA(editingItem.id, { status: 'rejected' });
                                    setActiveTab('rmas');
                                    setEditingItem(null);
                                }}
                                disabled={editingItem.status === 'rejected'}
                                className={`w-full py-3 rounded-xl font-bold transition-all ${
                                  editingItem.status === 'rejected'
                                  ? 'bg-primary/10 text-primary/40 cursor-not-allowed'
                                  : 'border border-red-500/30 text-red-500 hover:bg-red-500/10'
                                }`}
                            >
                                Refuser
                            </button>
                        </div>
                    </div>

                    <div className="bg-secondary/30 p-6 rounded-[2rem] border border-primary/10 shadow-sm">
                      <h4 className="font-serif font-bold text-lg mb-4 text-primary">Historique Statut</h4>
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${editingItem.status === 'pending' ? 'bg-yellow-600 animate-pulse' : 'bg-green-600'}`} />
                            <div className="w-0.5 h-full bg-primary/10" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-primary">Demande soumise</p>
                            <p className="text-[10px] text-primary/60">{editingItem.date}</p>
                          </div>
                        </div>
                        {['approved', 'received', 'refunded', 'rejected'].includes(editingItem.status) && (
                          <div className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full ${['approved', 'received', 'refunded', 'rejected'].includes(editingItem.status) ? 'bg-green-600' : 'bg-primary/20'}`} />
                              <div className="w-0.5 h-full bg-primary/10" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-primary">Traitement en cours</p>
                              <p className="text-[10px] text-primary/60">Mis à jour récemment</p>
                            </div>
                          </div>
                        )}
                        {editingItem.status === 'refunded' && (
                          <div className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 rounded-full bg-green-600" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-primary">Remboursé</p>
                              <p className="text-[10px] text-primary/60">Finalisé</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                </div>
            </div>
          </div>
        )}

        <footer className="mt-12 pt-8 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center text-xs text-primary/60">
          <p>© {new Date().getFullYear()} Atelier de Doleres Admin. Tous droits réservés.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary transition-colors">Support Technique</a>
            <a href="#" className="hover:text-primary transition-colors">Documentation</a>
            <span className="font-mono opacity-50">v1.0.0</span>
          </div>
        </footer>
      </main>
    </div>
  );
};
