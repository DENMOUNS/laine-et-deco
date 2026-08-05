import React, { useState, useEffect, useMemo } from 'react';
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
  HelpCircle,
  Phone
} from 'lucide-react';
import { onSnapshot } from 'firebase/firestore';
import { db } from '../../../../backend/firebase';
import { useEntity } from '../../../hooks/useEntity';
import { useAdminStore } from '../../../../stores/adminStore';
import {
  formatFirestoreDate as formatDate,
  sortByDate,
  normalizeSiteConfig,
  saveSiteSection as saveSiteSectionFn,
  saveAllSiteConfig as saveAllSiteConfigFn,
  calculateAdminStats,
  getUserPermissions,
  filterMenuByPermissions,
  autoSeedIfEmpty,
  handleEntityEdit,
  handleEntitySave,
  handleEntityDelete,
  applyNavItemDefaults,
  applyCatalogRuleDefaults
} from '../../../../services/adminService';
import { updateEntity as updateEntityBackend } from '../../../services/dashboardApi';

import { productSearch, orderSearch, userSearch, getStatusText, getActionDescription } from '../../../utils/searchUtils';
import { 
  ORDERS as INITIAL_ORDERS, 
  USERS as INITIAL_USERS, 
  CATEGORIES as INITIAL_CATEGORIES, 
  LOGIN_LOGS as INITIAL_LOGIN_LOGS, 
  NOTIFICATIONS as INITIAL_NOTIFICATIONS, 
  SALES_DATA as INITIAL_SALES_DATA, 
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
  FAQ_ITEMS as INITIAL_FAQ_ITEMS,
  CURRENCIES as INITIAL_CURRENCIES
} from '../../../../constants';
import { DEFAULT_SITE_CONFIG as INITIAL_SITE_CONFIG } from '../../../../siteDefaults';
import { CouponEditor } from '../../../components/dashboard/CouponEditor';
import { CityEditor } from '../../../components/dashboard/CityEditor';
import { FAQEditor } from '../../../components/dashboard/FAQEditor';
import { PromoEventEditor } from '../../../components/dashboard/PromoEventEditor';
import { CatalogPriceRuleEditor } from '../../../components/dashboard/CatalogPriceRuleEditor';
import { Modal } from '../../../components/Modal';
import { AdminHeader } from '../../../components/dashboard/AdminHeader';
import { AdminSidebar } from '../../../components/dashboard/AdminSidebar';
import { getAdminMenuItems } from '../../../components/dashboard/AdminMenu';
import { DataTable } from '../../../components/DataTable';
import { TabFilter } from '../../../components/TabFilter';
import { Notification, Product, Category, SiteConfig, ChatMessage, HomeSection, Conversation, Coupon, AdminRole, PromoEvent, Order, User as UserType, LoginLog, Pack, PushNotification, Email, Role, Expense, Review, RMA, AbandonedCart, CustomerGroup, TaxRule, ShippingRule, CatalogPriceRule, NewsletterSubscriber, City, NavItem, FAQ, Currency } from '../../../../types';
import { StatusBadge, getStatusStyles } from '../../../components/ui/StatusBadge';
import { cn } from '../../../utils/utils';
import { OrderMap } from '../../../components/OrderMap';

import { User as FirebaseUser, signOut } from 'firebase/auth';
import { QRCodeSVG } from 'qrcode.react';
import { collection, getDocs, doc, updateDoc, increment, query, where, getDoc, writeBatch, serverTimestamp, addDoc, setDoc } from 'firebase/firestore';

import { toast } from 'sonner';
import { Loader } from '../../../components/Loader';

import { AdminSearchResults } from './AdminSearchResults';
import { AdminOverview } from './AdminOverview';
import { AdminInventory } from './AdminInventory';
import { AdminLoyalty } from './AdminLoyalty';
import { AdminCustomerGroups } from './AdminCustomerGroups';
import { AdminOrders } from './AdminOrders';
import { AdminLogs } from './AdminLogs';
import { AdminStats } from './AdminStats';
import { AdminEvents } from './AdminEvents';
import { AdminSite } from './AdminSite';
import { AdminProducts } from './AdminProducts';
import { AdminProductForm } from './AdminProductForm';
import { AdminExpenses } from './AdminExpenses';
import { AdminRmas } from './AdminRmas';
import { AdminAbandonedCarts } from './AdminAbandonedCarts';
import { AdminPromoRules } from './AdminPromoRules';
import { AdminTaxes } from './AdminTaxes';
import { AdminShipping } from './AdminShipping';
import { AdminImportExport } from './AdminImportExport';
import { AdminCategories } from './AdminCategories';
import { AdminCategoryForm } from './AdminCategoryForm';
import { AdminReviews } from './AdminReviews';
import { AdminMessages } from './AdminMessages';
import { AdminNavItems } from './AdminNavItems';
import { AdminQr } from './AdminQr';
import { AdminCoupons } from './AdminCoupons';
import { AdminCities } from './AdminCities';
import { AdminRoles } from './AdminRoles';
import { AdminFlashSalesTab } from './AdminFlashSalesTab';
import { AdminLookbooksTab } from './AdminLookbooksTab';
import { AdminPortfoliosTab } from './AdminPortfoliosTab';
import { AdminCustomers } from './AdminCustomers';
import { AdminPacks } from './AdminPacks';
import { AdminLookbook } from './AdminLookbook';
import { AdminBlog } from './AdminBlog';
import { AdminNotifications } from './AdminNotifications';
import { AdminNewsletter } from './AdminNewsletter';
import { AdminPushNotifications } from './AdminPushNotifications';
import { AdminFaq } from './AdminFaq';
import { AdminEmails } from './AdminEmails';
import { AdminUserProfile } from './AdminUserProfile';
import { AdminDashboardModals } from './AdminDashboardModals';

import { AdminOrderDetail } from './AdminOrderDetail';
import { AdminCustomerDetail } from './AdminCustomerDetail';
import { AdminRmaDetail } from './AdminRmaDetail';
import { createAdminFormSubmitHandler } from './createAdminFormSubmitHandler';

interface AdminDashboardProps {
  onNavigate: (view: string, id?: string, query?: string) => void;
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  user: FirebaseUser | null;
  isAuthLoading: boolean;
}


interface AdminDashboardProps {
  onNavigate: (view: string, id?: string, query?: string) => void;
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  user: FirebaseUser | null;
  isAuthLoading: boolean;
}


export function useAdminDashboardContext({ onNavigate, siteConfig: propSiteConfig, setSiteConfig: propSetSiteConfig, user, isAuthLoading }: AdminDashboardProps) {
  const activeTab = useAdminStore((s) => s.activeTab);
  const isActiveTab = (tabs: string[]) => tabs.includes(activeTab);

  const { data: ORDERS, setData: setLocalOrders, deleteEntity: deleteOrder, isLoading: isLoadingOrders } = useEntity<Order>('order', [], {
    enabled: isActiveTab(['order-detail', 'search-results', 'customers', 'customer-detail', 'notifications', 'messages'])
  });
  const allOrders = useMemo(() => {
    return ORDERS;
  }, [ORDERS]);

  // NOTE: l'ancien appel `useProducts({ isAdmin: true })` ici a été supprimé.
  // Il déclenchait une lecture complète (non filtrée par onglet) de la collection
  // 'product' à CHAQUE montage du dashboard admin, alors que sa donnée (PRODUCTS /
  // fetchedProducts) n'était utilisée nulle part — code mort. Ces noms sont ré-exposés
  // plus bas, aliasés sur `localProducts` (déjà chargé via useEntity) pour ne rien casser.
  // Fusionné : une seule lecture temps réel de 'user' (auparavant USERS et localUsers
  // ouvraient chacun leur propre listener onSnapshot sur la même collection).
  const {
    data: USERS,
    setData: setLocalUsers,
    deleteEntity: deleteUser,
    updateEntity: updateLocalUser,
    setEntity: setLocalUser,
  } = useEntity<UserType>('user', [], {
    enabled: isActiveTab(['customers', 'customer-detail', 'customer-groups', 'customer-group-detail', 'overview', 'search-results', 'notifications', 'messages', 'stats'])
  });
  const localUsers = Array.isArray(USERS) ? USERS : (USERS && typeof USERS === 'object' ? Object.values(USERS) : []);

  // Profil de l'utilisateur CONNECTÉ : listener dédié, TOUJOURS actif (indépendant de
  // l'onglet admin affiché). Le fetch `USERS` ci-dessus n'est activé que sur certains
  // onglets (customers, overview, stats, ...) pour limiter les lectures Firestore ; or
  // le rôle de l'utilisateur connecté (super-admin/admin/...) doit être connu sur TOUS
  // les onglets pour le contrôle d'accès du panneau admin (cf. AdminDashboardShell).
  // Sans ce listener séparé, arriver directement sur un onglet non listé (ex: /admin/qr)
  // empêchait tout chargement du document utilisateur : le rôle retombait par défaut sur
  // 'customer' et bloquait l'accès admin même pour un super-admin.
  const [ownUserDoc, setOwnUserDoc] = useState<UserType | null>(null);
  const [isOwnUserDocLoading, setIsOwnUserDocLoading] = useState(true);
  useEffect(() => {
    if (!user?.uid) {
      setOwnUserDoc(null);
      setIsOwnUserDocLoading(false);
      return;
    }
    setIsOwnUserDocLoading(true);
    const unsubscribe = onSnapshot(
      doc(db, 'user', user.uid),
      (snapshot) => {
        setOwnUserDoc(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as UserType) : null);
        setIsOwnUserDocLoading(false);
      },
      () => {
        setOwnUserDoc(null);
        setIsOwnUserDocLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user?.uid]);
  const { data: CATEGORIES, updateEntity: updateCategory, addEntity: addCategory, deleteEntity: deleteCategory, setData: setLocalCategories, isLoading: isLoadingCategories } = useEntity<Category>('category', [], {
    enabled: isActiveTab(['products', 'product-create', 'product-edit', 'inventory'])
  });
  const { data: NAV_ITEMS, updateEntity: updateNavItem, addEntity: addNavItem, deleteEntity: deleteNavItem } = useEntity<NavItem>('nav_item', [], {
    enabled: isActiveTab(['nav-items', 'site', 'stats'])
  });
  const { data: FAQS, updateEntity: updateFAQ, addEntity: addFAQ, deleteEntity: deleteFAQ } = useEntity<FAQ>('faq', [], {
    enabled: isActiveTab(['faq', 'site', 'stats'])
  });
  const { data: LOGIN_LOGS, deleteEntity: deleteLoginLog } = useEntity<any>('login_log', [], { enabled: false });
  // Fusionné : NOTIFICATIONS et localSystemNotifications lisaient toutes les deux, en
  // permanence (enabled: true), la même collection 'notification' — deux listeners
  // temps réel ouverts pour la durée de toute la session admin. Un seul suffit.
  const {
    data: NOTIFICATIONS,
    setData: setLocalSystemNotifications,
    deleteEntity: deleteNotification,
  } = useEntity<Notification>('notification', [], {
    enabled: true
  });
  const localSystemNotifications = NOTIFICATIONS;
  const { data: SALES_DATA } = useEntity<any>('sales_data', [], {
    enabled: isActiveTab(['stats'])
  });
  const { data: siteConfigs, updateEntity: updateSiteConfig, deleteEntity: deleteSiteConfig } = useEntity<any>('site_config', [], {
    enabled: true
  });
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
        await updateEntityBackend('site_config', siteConfig.id, updateData);
        toast.success(`${label} : Enregistré avec succès`);
      }
    } catch (err) {
      toast.error('Erreur lors de l’enregistrement');
    }
  };

  const saveAllSiteConfig = async () => {
    try {
      if (siteConfig.id) {
        await updateEntityBackend('site_config', siteConfig.id, {
          ...siteConfig,
          updatedAt: new Date().toISOString()
        });
        toast.success('Toute la configuration a été enregistrée');
      }
    } catch (err) {
      toast.error('Erreur lors de l’enregistrement global');
    }
  };

  // sortByDate is now imported from adminService

  const { data: CHAT_MESSAGES, deleteEntity: deleteChatMessage } = useEntity<any>('chat_message', [], {
    enabled: isActiveTab(['messages'])
  });
  const { data: CONVERSATIONS, deleteEntity: deleteConversation } = useEntity<any>('conversation', [], {
    enabled: isActiveTab(['messages'])
  });
  const { data: COUPONS, updateEntity: updateCoupon, addEntity: addCoupon, deleteEntity: deleteCoupon } = useEntity<Coupon>('coupon', [], {
    enabled: isActiveTab(['coupons', 'promo-rules', 'flash-sales'])
  });
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isCouponEditorOpen, setIsCouponEditorOpen] = useState(false);

  const { data: CITIES, updateEntity: updateCity, addEntity: addCity, deleteEntity: deleteCity } = useEntity<City>('city', [], {
    enabled: isActiveTab(['cities'])
  });
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

  const { data: localRoles, updateEntity: updateLocalRole, addEntity: addLocalRole, setEntity: setLocalRole, deleteEntity: deleteLocalRole, setData: setLocalRoles, isLoading: isLoadingRoles } = useEntity<any>('admin_role', [], {
    enabled: isActiveTab(['roles', 'users', 'customer-detail'])
  });
  const { data: PROMO_EVENTS, updateEntity: updateEvent, addEntity: addEvent, deleteEntity: deleteEvent } = useEntity<PromoEvent>('promo_event', [], {
    enabled: isActiveTab(['flash-sales', 'promo-rules'])
  });
  const events = PROMO_EVENTS;
  const setEvents = () => { console.warn("setEvents is deprecated, use updateEvent/addEvent/deleteEvent instead") };
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
  const { data: CATEGORY_DISTRIBUTION, isLoading: isLoadingCategoryDist } = useEntity<any>('category_distribution', [], {
    enabled: isActiveTab(['stats'])
  });
  const { data: DEVICE_DATA, isLoading: isLoadingDevice } = useEntity<any>('device_data', [], {
    enabled: isActiveTab(['stats'])
  });
  const { data: TRAFFIC_SOURCES, isLoading: isLoadingTraffic } = useEntity<any>('traffic_source', [], {
    enabled: isActiveTab(['stats'])
  });
  const { data: RETENTION_DATA, isLoading: isLoadingRetention } = useEntity<any>('retention_data', [], {
    enabled: isActiveTab(['stats'])
  });
  const { data: REVENUE_BY_PAYMENT, isLoading: isLoadingRevenue } = useEntity<any>('revenue_by_payment', [], {
    enabled: isActiveTab(['stats'])
  });
  const { data: PACKS, updateEntity: updatePack, addEntity: addPack, deleteEntity: deletePack, setData: setLocalPacks, isLoading: isLoadingPacks } = useEntity<Pack>('pack', [], {
    enabled: false
  });
  const localPacks = PACKS;
  const { data: PUSH_NOTIFICATIONS, setData: setLocalPushNotifications, isLoading: isLoadingPush } = useEntity<any>('push_notification', [], {
    enabled: isActiveTab(['notifications'])
  });
  const { data: EMAILS, setData: setLocalEmails, isLoading: isLoadingEmails } = useEntity<any>('email', [], {
    enabled: isActiveTab(['newsletter', 'emails', 'newsletter_config'])
  });
  // Fusionné : EXPENSES + localExpenses lisaient toutes les deux 'expense'
  // avec exactement la même condition enabled(['expenses']).
  const {
    data: EXPENSES,
    setData: setLocalExpenses,
    addEntity: addExpense,
    updateEntity: updateExpense,
    isLoading: isLoadingExpenses,
  } = useEntity<Expense>('expense', INITIAL_EXPENSES, {
    enabled: isActiveTab(['expenses'])
  });
  const localExpenses = EXPENSES;
  // Fusionné : LOOKBOOK_POSTS + localLookbook lisaient toutes les deux 'lookbook_post'
  // avec exactement la même condition enabled(['lookbook']).
  const {
    data: LOOKBOOK_POSTS,
    setData: setLocalLookbook,
    addEntity: addLookbook,
    updateEntity: updateLookbook,
    isLoading: isLoadingLookbook,
  } = useEntity<any>('lookbook_post', INITIAL_LOOKBOOK_POSTS, {
    enabled: isActiveTab(['lookbook'])
  });
  const localLookbook = LOOKBOOK_POSTS;
  const setLocalLookbook2 = setLocalLookbook;
  // Fusionné : BLOG_POSTS + localBlogPosts lisaient toutes les deux 'blog_post'
  // avec exactement la même condition enabled(['blog']).
  const {
    data: BLOG_POSTS,
    setData: setLocalBlogPosts,
    addEntity: addBlogPost,
    updateEntity: updateBlogPost,
    isLoading: isLoadingBlog,
  } = useEntity<any>('blog_post', INITIAL_BLOG_POSTS, {
    enabled: isActiveTab(['blog'])
  });
  const localBlogPosts = BLOG_POSTS;
  const setLocalBlogPosts2 = setLocalBlogPosts;
  // Fusionné : REVIEWS + localReviews lisaient toutes les deux 'review'
  // avec exactement la même condition enabled(['reviews']).
  const {
    data: REVIEWS,
    setData: setLocalReviews,
    deleteEntity: deleteReview,
    updateEntity: updateReview,
    addEntity: addReview,
    isLoading: isLoadingReviews,
  } = useEntity<Review>('review', INITIAL_REVIEWS, {
    enabled: isActiveTab(['reviews'])
  });
  const localReviews = REVIEWS;
  const setLocalReviews2 = setLocalReviews;
  // Fusionné : ABANDONED_CARTS + localAbandonedCarts lisaient toutes les deux
  // 'abandoned_cart' avec exactement la même condition enabled(['abandoned-carts']).
  const {
    data: ABANDONED_CARTS,
    setData: setLocalAbandonedCarts,
    deleteEntity: deleteAbandonedCart,
    isLoading: isLoadingAbandoned,
  } = useEntity<AbandonedCart>('abandoned_cart', INITIAL_ABANDONED_CARTS, {
    enabled: isActiveTab(['abandoned-carts'])
  });
  const localAbandonedCarts = ABANDONED_CARTS;
  const setLocalAbandonedCarts2 = setLocalAbandonedCarts;
  // Fusionné : CUSTOMER_GROUPS + localCustomerGroups lisaient toutes les deux
  // 'customer_group' avec exactement la même condition enabled.
  const {
    data: CUSTOMER_GROUPS,
    setData: setLocalCustomerGroups,
    deleteEntity: deleteCustomerGroup,
    addEntity: addCustomerGroup,
    updateEntity: updateCustomerGroup,
    isLoading: isLoadingGroups,
  } = useEntity<CustomerGroup>('customer_group', INITIAL_CUSTOMER_GROUPS, {
    enabled: isActiveTab(['customer-groups', 'customer-group-detail'])
  });
  const localCustomerGroups = CUSTOMER_GROUPS;
  const setLocalCustomerGroups2 = setLocalCustomerGroups;
  // Fusionné : TAX_RULES + localTaxRules lisaient toutes les deux 'tax_rule'
  // avec exactement la même condition enabled(['taxes']).
  const {
    data: TAX_RULES,
    setData: setLocalTaxRules,
    deleteEntity: deleteTaxRule,
    addEntity: addTaxRule,
    updateEntity: updateTaxRule,
    isLoading: isLoadingTax,
  } = useEntity<TaxRule>('tax_rule', INITIAL_TAX_RULES, {
    enabled: isActiveTab(['taxes'])
  });
  const localTaxRules = TAX_RULES;
  const setLocalTaxRules2 = setLocalTaxRules;
  // Fusionné : SHIPPING_RULES + localShippingRules lisaient toutes les deux
  // 'shipping_rule' avec exactement la même condition enabled(['shipping']).
  const {
    data: SHIPPING_RULES,
    setData: setLocalShippingRules,
    deleteEntity: deleteShippingRule,
    addEntity: addShippingRule,
    updateEntity: updateShippingRule,
    isLoading: isLoadingShipping,
  } = useEntity<ShippingRule>('shipping_rule', INITIAL_SHIPPING_RULES, {
    enabled: isActiveTab(['shipping'])
  });
  const localShippingRules = SHIPPING_RULES;
  const setLocalShippingRules2 = setLocalShippingRules;
  const localNavItems = NAV_ITEMS; // Use the one from useEntity
  // const { data: CATALOG_PRICE_RULES, isLoading: isLoadingCatalog } = useEntity<any>('catalog_price_rule', INITIAL_CATALOG_PRICE_RULES); // REMOVED DUPLICATE
  const { data: SUBSCRIBERS, setData: setLocalSubscribers, deleteEntity: deleteSubscriber, isLoading: isLoadingSubscribers } = useEntity<NewsletterSubscriber>('subscriber', [], {
    enabled: isActiveTab(['newsletter', 'emails', 'newsletter_config'])
  });


  const { data: localProducts, setData: setLocalProducts, updateEntity: updateProduct, addEntity: addProduct, deleteEntity: deleteProduct, isLoading: isLoadingProducts } = useEntity<Product>('product', [], {
    enabled: isActiveTab(['overview', 'products', 'product-create', 'product-edit', 'inventory', 'search-results', 'notifications', 'messages', 'stats'])
  });
  // PRODUCTS / fetchedProducts : alias sur localProducts (voir note plus haut sur la
  // suppression du useProducts({isAdmin:true}) mort). Conservés pour ne rien casser.
  const PRODUCTS = localProducts;
  const fetchedProducts = localProducts;
  const localOrders = allOrders;
  const localCategories = CATEGORIES;

  // ── UI State from Zustand adminStore ──
  const setActiveTab = useAdminStore((s) => s.setActiveTab);
  const customerDetailTab = useAdminStore((s) => s.customerDetailTab);
  const setCustomerDetailTab = useAdminStore((s) => s.setCustomerDetailTab);
  const isSidebarOpen = useAdminStore((s) => s.isSidebarOpen);
  const setIsSidebarOpen = useAdminStore((s) => s.setIsSidebarOpen);
  const isAddModalOpen = useAdminStore((s) => s.isAddModalOpen);
  const setIsAddModalOpen = useAdminStore((s) => s.setIsAddModalOpen);
  const editingItem = useAdminStore((s) => s.editingItem);
  const setEditingItem = (itemOrFn: any) => {
    if (typeof itemOrFn === 'function') {
      useAdminStore.setState((state) => ({ editingItem: itemOrFn(state.editingItem) }));
    } else {
      useAdminStore.setState({ editingItem: itemOrFn });
    }
  };
  const modalType = useAdminStore((s) => s.modalType);
  const setModalType = (type: string) => useAdminStore.setState({ modalType: type });
  const isSaving = useAdminStore((s) => s.isSaving);
  const setIsSaving = useAdminStore((s) => s.setIsSaving);
  const showNotifications = useAdminStore((s) => s.showNotifications);
  const setShowNotifications = useAdminStore((s) => s.setShowNotifications);
  const selectedOrder = useAdminStore((s) => s.selectedOrder);
  const setSelectedOrder = useAdminStore((s) => s.setSelectedOrder);
  const isEditingOrder = useAdminStore((s) => s.isEditingOrder);
  const setIsEditingOrder = useAdminStore((s) => s.setIsEditingOrder);
  const editedOrder = useAdminStore((s) => s.editedOrder);
  const setEditedOrder = useAdminStore((s) => s.setEditedOrder);
  const selectedConversation = useAdminStore((s) => s.selectedConversation);
  const setSelectedConversation = useAdminStore((s) => s.setSelectedConversation);
  const selectedCustomer = useAdminStore((s) => s.selectedCustomer);
  const setSelectedCustomer = useAdminStore((s) => s.setSelectedCustomer);
  const selectedCustomerGroup = useAdminStore((s) => s.selectedCustomerGroup);
  const setSelectedCustomerGroup = useAdminStore((s) => s.setSelectedCustomerGroup);
  const newNote = useAdminStore((s) => s.newNote);
  const setNewNote = useAdminStore((s) => s.setNewNote);

  // 🚀 Les données proviennent uniquement de Firestore via les hooks useEntity
  // Pas de données seed, pas d'initialisation - données réelles uniquement

  // 'notification' : voir NOTIFICATIONS/localSystemNotifications fusionnés plus haut.
  // 'user' : voir USERS/localUsers fusionnés plus haut (une seule lecture Firestore).
  // 'expense' : voir EXPENSES/localExpenses fusionnés plus haut.
  // 'lookbook_post' : voir LOOKBOOK_POSTS/localLookbook fusionnés plus haut.
  // 'blog_post' : voir BLOG_POSTS/localBlogPosts fusionnés plus haut.
  const { data: realLogs, isLoading: isLogsLoading } = useEntity<any>('log', [], {
    enabled: isActiveTab(['logs'])
  });
  
  // New Magento-like states (UI state from store)
  const newRMANote = useAdminStore((s) => s.newRMANote);
  const setNewRMANote = useAdminStore((s) => s.setNewRMANote);
  // 'review' : voir REVIEWS/localReviews fusionnés plus haut.
  const { data: localRMAs, updateEntity: updateRMA, addEntity: addRMA } = useEntity<RMA>('rma', [], {
    enabled: isActiveTab(['rmas'])
  });
  // 'abandoned_cart' : voir ABANDONED_CARTS/localAbandonedCarts fusionnés plus haut.
  // 'customer_group' : voir CUSTOMER_GROUPS/localCustomerGroups fusionnés plus haut.
  // 'tax_rule' : voir TAX_RULES/localTaxRules fusionnés plus haut.
  // 'shipping_rule' : voir SHIPPING_RULES/localShippingRules fusionnés plus haut.
  const { data: localCurrencies, addEntity: addCurrency, updateEntity: updateCurrency, deleteEntity: deleteCurrency, setData: setLocalCurrencies } = useEntity<Currency>('currency', [], {
    enabled: isActiveTab(['payments'])
  });
  const { data: localCatalogPriceRules, updateEntity: updateCatalogRule, addEntity: addCatalogRule, deleteEntity: deleteCatalogRule, isLoading: isLoadingCatalog } = useEntity<CatalogPriceRule>('catalog_price_rule', [], {
    enabled: isActiveTab(['promo-rules'])
  });                
  const selectedCatalogRule = useAdminStore((s) => s.selectedCatalogRule);
  const setSelectedCatalogRule = useAdminStore((s) => s.setSelectedCatalogRule);
  const isCatalogRuleEditorOpen = useAdminStore((s) => s.isCatalogRuleEditorOpen);
  const setIsCatalogRuleEditorOpen = useAdminStore((s) => s.setIsCatalogRuleEditorOpen);

  // Fallbacks for data to ensure fields exist
  const navItemsWithDefaults = useMemo(() => {
    const data = NAV_ITEMS;
    return data.map(item => ({
      ...item,
      order: item.order ?? 1,
      status: item.status ?? 'active',
      createdAt: item.createdAt || new Date().toISOString()
    }));
  }, [NAV_ITEMS]);
  
  const catalogRulesWithDefaults = useMemo(() => {
    const data = localCatalogPriceRules;
    return data.map(rule => ({
      ...rule,
      createdAt: rule.createdAt || new Date().toISOString()
    }));
  }, [localCatalogPriceRules]);

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

  const selectedPackProducts = useAdminStore((s) => s.selectedPackProducts);
  const setSelectedPackProducts = useAdminStore((s) => s.setSelectedPackProducts);
  const searchResults = useAdminStore((s) => s.searchResults);
  const setSearchResults = useAdminStore((s) => s.setSearchResults);

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
      setCurrentImage(editingItem.image || '');
    } else {
      setCurrentSlug('');
      setCurrentImage('');
    }
  }, [editingItem, modalType, activeTab]);

  // Filter states (from Zustand store)
  const handleFormSubmit = createAdminFormSubmitHandler(() => dashboardContext);
  const orderFilter = useAdminStore((s) => s.orderFilter);
  const setOrderFilter = useAdminStore((s) => s.setOrderFilter);
  const productFilter = useAdminStore((s) => s.productFilter);
  const setProductFilter = useAdminStore((s) => s.setProductFilter);
  const customerFilter = useAdminStore((s) => s.customerFilter);
  const setCustomerFilter = useAdminStore((s) => s.setCustomerFilter);
  const notificationFilter = useAdminStore((s) => s.notificationFilter);
  const setNotificationFilter = useAdminStore((s) => s.setNotificationFilter);
  const reviewFilter = useAdminStore((s) => s.reviewFilter);
  const setReviewFilter = useAdminStore((s) => s.setReviewFilter);
  const logFilter = useAdminStore((s) => s.logFilter);
  const setLogFilter = useAdminStore((s) => s.setLogFilter);
  const messageInput = useAdminStore((s) => s.messageInput);
  const setMessageInput = useAdminStore((s) => s.setMessageInput);
  const currentSlug = useAdminStore((s) => s.currentSlug);
  const setCurrentSlug = useAdminStore((s) => s.setCurrentSlug);
  const currentImage = useAdminStore((s) => s.currentImage);
  const setCurrentImage = useAdminStore((s) => s.setCurrentImage);
  const viewingCustomer = useAdminStore((s) => s.viewingCustomer);
  const setViewingCustomer = useAdminStore((s) => s.setViewingCustomer);
  const overviewOrderFilter = useAdminStore((s) => s.overviewOrderFilter);
  const setOverviewOrderFilter = useAdminStore((s) => s.setOverviewOrderFilter);

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
    } else if (notification.type === 'product' || notification.type === 'stock') {
        if (notification.relatedId) {
            const product = localProducts.find(p => p.id === notification.relatedId);
            if (product) {
                setEditingItem(product);
                setModalType('product');
                setIsAddModalOpen(true);
            } else {
                setActiveTab('products');
            }
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
    } else if (notification.type === 'customer' || notification.type === 'user') {
        if (notification.relatedId) {
            const customer = localUsers.find(u => u.id === notification.relatedId);
            if (customer) {
                setSelectedCustomer(customer);
                setActiveTab('customer-detail');
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
  const categoryPage = useAdminStore((s) => s.categoryPage);
  const setCategoryPage = useAdminStore((s) => s.setCategoryPage);
  const notificationPage = useAdminStore((s) => s.notificationPage);
  const setNotificationPage = useAdminStore((s) => s.setNotificationPage);
  const itemsPerPage = useAdminStore((s) => s.itemsPerPage);

  const totalSales = ORDERS.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrdersCount = ORDERS.length;
  const totalCustomers = localUsers.length;
  const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalSales / totalOrdersCount) : 0;

  const stats = [
    { label: 'Ventes Totales', value: `${totalSales.toLocaleString('fr-FR')} FCFA`, change: '+12.5%', isUp: true, icon: <TrendingUp size={20} /> },
    { label: 'Commandes', value: totalOrdersCount.toString(), change: '+5.2%', isUp: true, icon: <ShoppingBag size={20} /> },
    { label: 'Panier Moyen', value: `${averageOrderValue.toLocaleString('fr-FR')} FCFA`, change: '+8.1%', isUp: true, icon: <BarChart3 size={20} /> },
  ];

  const menuItems = getAdminMenuItems();

  // Priorité au listener dédié (toujours actif) ; repli sur la liste `localUsers`
  // (tab-gated) si celle-ci est déjà chargée et que le listener dédié n'a pas encore
  // répondu, pour éviter un flash "customer" pendant le tout premier rendu.
  const currentUserDoc = ownUserDoc ?? localUsers.find(u => u.id === user?.uid);
  const userRoleSlug = currentUserDoc?.role || 'customer';
  
  const roleData = localRoles.find((r: any) => 
    (r.slug || r.id) === userRoleSlug
  );
  
  const permissions = roleData?.permissions || [];
  const isSuperAdmin = userRoleSlug === 'super-admin' || permissions.includes('all');

  const hasPermission = (permission?: string) => {
    if (isSuperAdmin) return true;
    if (!permission) return true;
    if (permission === 'super-admin') return isSuperAdmin;
    return permissions.includes(permission);
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (item.isHeader) {
      const index = menuItems.indexOf(item);
      let hasPermittedChild = false;
      for (let i = index + 1; i < menuItems.length; i++) {
        if (menuItems[i].isHeader) break;
        if (hasPermission(menuItems[i].permission)) {
          hasPermittedChild = true;
          break;
        }
      }
      return hasPermittedChild;
    }
    return hasPermission(item.permission);
  });

  const activeMenuItem = menuItems.find(item => item.id === activeTab);
  const isTabAllowed = activeMenuItem ? hasPermission(activeMenuItem.permission) : true;
  const isUserCustomer = userRoleSlug === 'customer';

  const isDataLoading = isLoadingOrders || isLoadingProducts || isLoadingCategories || isLoadingRoles;

  // Redirection automatique vers le premier onglet autorisé si l'onglet actuel est interdit
  useEffect(() => {
    if (!isDataLoading && !isTabAllowed && filteredMenuItems.length > 0) {
      const firstAllowedTab = filteredMenuItems.find(item => !item.isHeader);
      if (firstAllowedTab) {
        setActiveTab(firstAllowedTab.id);
      }
    }
  }, [isTabAllowed, filteredMenuItems, isDataLoading, activeTab]);

  const handleSearch = (query: string) => {
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
  };

  const dashboardContext = {
    ABANDONED_CARTS,
    BLOG_POSTS,
    CATEGORIES,
    CATEGORY_DISTRIBUTION,
    CHAT_MESSAGES,
    CITIES,
    CONVERSATIONS,
    COUPONS,
    CUSTOMER_GROUPS,
    DEVICE_DATA,
    EMAILS,
    EXPENSES,
    FAQS,
    LOGIN_LOGS,
    LOOKBOOK_POSTS,
    NAV_ITEMS,
    NOTIFICATIONS,
    ORDERS,
    PACKS,
    PRODUCTS,
    PROMO_EVENTS,
    PUSH_NOTIFICATIONS,
    RETENTION_DATA,
    REVENUE_BY_PAYMENT,
    REVIEWS,
    SALES_DATA,
    SHIPPING_RULES,
    SUBSCRIBERS,
    TAX_RULES,
    TRAFFIC_SOURCES,
    localUsers,
    activeMenuItem,
    activeTab,
    addBlogPost,
    addCatalogRule,
    addCategory,
    addCity,
    addCoupon,
    addCurrency,
    addCustomerGroup,
    addEvent,
    addExpense,
    addFAQ,
    addLocalRole,
    addLookbook,
    addNavItem,
    addPack,
    addProduct,
    addRMA,
    addReview,
    addShippingRule,
    addTaxRule,
    allOrders,
    averageOrderValue,
    catalogRulesWithDefaults,
    categoryPage,
    currentImage,
    currentSlug,
    currentUserDoc,
    customerDetailTab,
    customerFilter,
    deleteAbandonedCart,
    deleteCatalogRule,
    deleteCategory,
    deleteChatMessage,
    deleteCity,
    deleteConversation,
    deleteCoupon,
    deleteCurrency,
    deleteCustomerGroup,
    deleteEvent,
    deleteFAQ,
    deleteLocalRole,
    deleteLoginLog,
    deleteNavItem,
    deleteNotification,
    deleteOrder,
    deletePack,
    deleteProduct,
    deleteReview,
    deleteShippingRule,
    deleteSiteConfig,
    deleteSubscriber,
    deleteTaxRule,
    deleteUser,
    editedOrder,
    editingItem,
    events,
    fetchedProducts,
    filteredMenuItems,
    formatDate,
    handleDeleteCatalogRule,
    handleDeleteCity,
    handleDeleteEvent,
    handleDeleteFAQ,
    handleEditCatalogRule,
    handleEditCity,
    handleEditCoupon,
    handleEditEvent,
    handleEditFAQ,
    handleFormSubmit,
    handleNotificationClick,
    handleSaveCatalogRule,
    handleSaveCity,
    handleSaveCoupon,
    handleSaveEvent,
    handleSaveFAQ,
    handleSearch,
    handleSendMessage,
    hasPermission,
    isAddModalOpen,
    isAuthLoading,
    isOwnUserDocLoading,
    isCatalogRuleEditorOpen,
    isCityEditorOpen,
    isCouponEditorOpen,
    isDataLoading,
    isEditingOrder,
    isEventEditorOpen,
    isFAQEditorOpen,
    isLoadingAbandoned,
    isLoadingBlog,
    isLoadingCatalog,
    isLoadingCategories,
    isLoadingCategoryDist,
    isLoadingDevice,
    isLoadingEmails,
    isLoadingExpenses,
    isLoadingGroups,
    isLoadingLookbook,
    isLoadingOrders,
    isLoadingPacks,
    isLoadingProducts,
    isLoadingPush,
    isLoadingRetention,
    isLoadingRevenue,
    isLoadingReviews,
    isLoadingRoles,
    isLoadingShipping,
    isLoadingSubscribers,
    isLoadingTax,
    isLoadingTraffic,
    isLogsLoading,
    isSaving,
    isSidebarOpen,
    isSuperAdmin,
    isTabAllowed,
    isUserCustomer,
    itemsPerPage,
    localAbandonedCarts,
    localBlogPosts,
    localCatalogPriceRules,
    localCategories,
    localCurrencies,
    localCustomerGroups,
    localExpenses,
    localLookbook,
    localNavItems,
    localOrders,
    localPacks,
    localProducts,
    localRMAs,
    localReviews,
    localRoles,
    localShippingRules,
    localSystemNotifications,
    localTaxRules,
    localUsers,
    logFilter,
    menuItems,
    messageInput,
    modalType,
    navItemsWithDefaults,
    newNote,
    newRMANote,
    notificationFilter,
    notificationPage,
    onNavigate,
    orderFilter,
    overviewOrderFilter,
    permissions,
    productFilter,
    propSetSiteConfig,
    propSiteConfig,
    rawSiteConfig,
    realLogs,
    reviewFilter,
    roleData,
    saveAllSiteConfig,
    saveSiteSection,
    searchResults,
    selectedCatalogRule,
    selectedCity,
    selectedConversation,
    selectedCoupon,
    selectedCustomer,
    selectedCustomerGroup,
    selectedEvent,
    selectedFAQ,
    selectedOrder,
    selectedPackProducts,
    setActiveTab,
    setCategoryPage,
    setCurrentImage,
    setCurrentSlug,
    setCustomerDetailTab,
    setCustomerFilter,
    setEditedOrder,
    setEditingItem,
    setEvents,
    setIsAddModalOpen,
    setIsCatalogRuleEditorOpen,
    setIsCityEditorOpen,
    setIsCouponEditorOpen,
    setIsEditingOrder,
    setIsEventEditorOpen,
    setIsFAQEditorOpen,
    setIsSaving,
    setIsSidebarOpen,
    setLocalAbandonedCarts,
    setLocalAbandonedCarts2,
    setLocalBlogPosts,
    setLocalBlogPosts2,
    setLocalCategories,
    setLocalCurrencies,
    setLocalCustomerGroups,
    setLocalCustomerGroups2,
    setLocalEmails,
    setLocalExpenses,
    setLocalLookbook,
    setLocalLookbook2,
    setLocalOrders,
    setLocalPacks,
    setLocalProducts,
    setLocalPushNotifications,
    setLocalReviews,
    setLocalReviews2,
    setLocalRole,
    setLocalRoles,
    setLocalShippingRules,
    setLocalShippingRules2,
    setLocalSubscribers,
    setLocalSystemNotifications,
    setLocalTaxRules,
    setLocalTaxRules2,
    setLocalUser,
    setLocalUsers,
    setLogFilter,
    setMessageInput,
    setModalType,
    setNewNote,
    setNewRMANote,
    setNotificationFilter,
    setNotificationPage,
    setOrderFilter,
    setOverviewOrderFilter,
    setProductFilter,
    setReviewFilter,
    setSearchResults,
    setSelectedCatalogRule,
    setSelectedCity,
    setSelectedConversation,
    setSelectedCoupon,
    setSelectedCustomer,
    setSelectedCustomerGroup,
    setSelectedEvent,
    setSelectedFAQ,
    setSelectedOrder,
    setSelectedPackProducts,
    setShowNotifications,
    setSiteConfig,
    setViewingCustomer,
    showNotifications,
    siteConfig,
    siteConfigs,
    sortByDate,
    stats,
    totalCustomers,
    totalOrdersCount,
    totalSales,
    updateBlogPost,
    updateCatalogRule,
    updateCategory,
    updateCity,
    updateCoupon,
    updateCurrency,
    updateCustomerGroup,
    updateEvent,
    updateExpense,
    updateFAQ,
    updateLocalRole,
    updateLocalUser,
    updateLookbook,
    updateNavItem,
    updatePack,
    updateProduct,
    updateRMA,
    updateReview,
    updateShippingRule,
    updateSiteConfig,
    updateTaxRule,
    user,
    userRoleSlug,
    viewingCustomer
  };

  return dashboardContext;
}
