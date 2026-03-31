import { useState, useEffect } from 'react';
import { 
  ORDERS, PRODUCTS, USERS, CATEGORIES, CURRENCIES, 
  PROMO_EVENTS, PACKS, PUSH_NOTIFICATIONS, EMAILS, 
  ADMIN_ROLES, EXPENSES 
} from '../constants';
import { 
  Product, Category, SiteConfig, PromoEvent, Order, 
  User as UserType, Pack, PushNotification, Email, 
  Currency, Role, Expense, Conversation 
} from '../types';
import { toast } from 'sonner';

export const useAdminData = (initialSiteConfig: SiteConfig) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'product' | 'category' | 'currency' | 'site' | 'event' | 'pack' | 'notification' | 'email' | 'customer' | 'user' | 'role' | 'expense'>('product');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [events, setEvents] = useState<PromoEvent[]>(PROMO_EVENTS);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<UserType | null>(null);
  const [localProducts, setLocalProducts] = useState<Product[]>(PRODUCTS);
  const [localCategories, setLocalCategories] = useState<Category[]>(CATEGORIES);
  const [localOrders, setLocalOrders] = useState<Order[]>(ORDERS);
  const [localPacks, setLocalPacks] = useState<Pack[]>(PACKS);
  const [localNotifications, setLocalNotifications] = useState<PushNotification[]>(PUSH_NOTIFICATIONS);
  const [localEmails, setLocalEmails] = useState<Email[]>(EMAILS);
  const [localCurrencies, setLocalCurrencies] = useState<Currency[]>(CURRENCIES);
  const [localUsers, setLocalUsers] = useState<UserType[]>(USERS);
  const [localRoles, setLocalRoles] = useState<Role[]>(ADMIN_ROLES.map(r => ({ id: r.id, name: r.name, description: 'Role description' })));
  const [localExpenses, setLocalExpenses] = useState<Expense[]>(EXPENSES);
  const [selectedPackProducts, setSelectedPackProducts] = useState<{productId: string, quantity: number}[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(initialSiteConfig);

  // Filter states
  const [orderFilter, setOrderFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [notificationFilter, setNotificationFilter] = useState('all');
  const [reviewFilter, setReviewFilter] = useState('all');
  const [logFilter, setLogFilter] = useState('all');
  const [requestLogFilter, setRequestLogFilter] = useState('all');
  const [messageInput, setMessageInput] = useState('');
  
  // Pagination states
  const [orderPage, setOrderPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [customerPage, setCustomerPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);
  const [notificationPage, setNotificationPage] = useState(1);
  const [logPage, setLogPage] = useState(1);
  const [requestLogPage, setRequestLogPage] = useState(1);
  const itemsPerPage = 8;

  const handleDelete = (type: string, id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      if (type === 'product') setLocalProducts(prev => prev.filter(p => p.id !== id));
      else if (type === 'category') setLocalCategories(prev => prev.filter(c => c.id !== id));
      else if (type === 'order') setLocalOrders(prev => prev.filter(o => o.id !== id));
      else if (type === 'pack') setLocalPacks(prev => prev.filter(p => p.id !== id));
      else if (type === 'user') setLocalUsers(prev => prev.filter(u => u.id !== id));
      else if (type === 'expense') setLocalExpenses(prev => prev.filter(e => e.id !== id));
      toast.success('Élément supprimé');
    }
  };

  return {
    activeTab, setActiveTab,
    isSidebarOpen, setIsSidebarOpen,
    showNotifications, setShowNotifications,
    isAddModalOpen, setIsAddModalOpen,
    modalType, setModalType,
    editingItem, setEditingItem,
    isSaving, setIsSaving,
    events, setEvents,
    selectedConversation, setSelectedConversation,
    selectedOrder, setSelectedOrder,
    selectedCustomer, setSelectedCustomer,
    localProducts, setLocalProducts,
    localCategories, setLocalCategories,
    localOrders, setLocalOrders,
    localPacks, setLocalPacks,
    localNotifications, setLocalNotifications,
    localEmails, setLocalEmails,
    localCurrencies, setLocalCurrencies,
    localUsers, setLocalUsers,
    localRoles, setLocalRoles,
    localExpenses, setLocalExpenses,
    selectedPackProducts, setSelectedPackProducts,
    siteConfig, setSiteConfig,
    orderFilter, setOrderFilter,
    productFilter, setProductFilter,
    customerFilter, setCustomerFilter,
    notificationFilter, setNotificationFilter,
    reviewFilter, setReviewFilter,
    logFilter, setLogFilter,
    requestLogFilter, setRequestLogFilter,
    messageInput, setMessageInput,
    orderPage, setOrderPage,
    productPage, setProductPage,
    customerPage, setCustomerPage,
    categoryPage, setCategoryPage,
    notificationPage, setNotificationPage,
    logPage, setLogPage,
    requestLogPage, setRequestLogPage,
    itemsPerPage,
    handleDelete
  };
};
