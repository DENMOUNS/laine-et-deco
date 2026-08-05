import { create } from 'zustand';
import { toast } from 'sonner';
import { updateDoc, doc, getDocs, collection, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../backend/firebase';
import { SiteConfig, Order, Product, Category, NavItem, FAQ, Coupon, City, PromoEvent, Pack, Expense, Review, RMA, CatalogPriceRule, ShippingRule, TaxRule, Currency, NewsletterSubscriber, Notification, AbandonedCart, CustomerGroup } from '../types';

/**
 * Admin Dashboard Store
 * Manages admin UI state and admin-level operations.
 * Data fetching remains in useEntity hooks (within the dashboard context),
 * but UI state and site config management moves here.
 */

interface AdminUIState {
  activeTab: string;
  isSidebarOpen: boolean;
  isAddModalOpen: boolean;
  editingItem: any | null;
  modalType: string;
  isSaving: boolean;
  showNotifications: boolean;
  searchResults: any[];

  // Filters
  orderFilter: string;
  productFilter: string;
  customerFilter: string;
  notificationFilter: string;
  reviewFilter: string;
  logFilter: string;
  requestLogFilter: string;
  overviewOrderFilter: string;

  // Pagination
  categoryPage: number;
  notificationPage: number;
  itemsPerPage: number;

  // Selections
  selectedOrder: Order | null;
  isEditingOrder: boolean;
  editedOrder: Order | null;
  selectedConversation: any | null;
  selectedCustomer: any | null;
  selectedCustomerGroup: CustomerGroup | null;
  selectedCoupon: Coupon | null;
  isCouponEditorOpen: boolean;
  selectedCity: City | null;
  isCityEditorOpen: boolean;
  selectedFAQ: FAQ | null;
  isFAQEditorOpen: boolean;
  selectedEvent: PromoEvent | null;
  isEventEditorOpen: boolean;
  selectedCatalogRule: CatalogPriceRule | null;
  isCatalogRuleEditorOpen: boolean;
  selectedPackProducts: { productId: string; quantity: number }[];
  customerDetailTab: 'profile' | 'orders' | 'loyalty' | 'messages';
  viewingCustomer: any | null;

  // Form state
  currentSlug: string;
  currentImage: string;
  messageInput: string;
  newNote: string;
  newRMANote: string;
}

interface AdminActions {
  // Tab navigation
  setActiveTab: (tab: string) => void;

  // UI toggles
  setIsSidebarOpen: (open: boolean) => void;
  setIsAddModalOpen: (open: boolean) => void;
  setShowNotifications: (show: boolean) => void;
  setIsSaving: (saving: boolean) => void;

  // Modal
  openModal: (type: string, item?: any) => void;
  closeModal: () => void;

  // Filters
  setOrderFilter: (filter: string) => void;
  setProductFilter: (filter: string) => void;
  setCustomerFilter: (filter: string) => void;
  setNotificationFilter: (filter: string) => void;
  setReviewFilter: (filter: string) => void;
  setLogFilter: (filter: string) => void;
  setRequestLogFilter: (filter: string) => void;
  setOverviewOrderFilter: (filter: string) => void;

  // Pagination
  setCategoryPage: (page: number) => void;
  setNotificationPage: (page: number) => void;

  // Selections
  setSelectedOrder: (order: Order | null) => void;
  setIsEditingOrder: (editing: boolean) => void;
  setEditedOrder: (order: Order | null) => void;
  setSelectedConversation: (conv: any) => void;
  setSelectedCustomer: (customer: any) => void;
  setSelectedCustomerGroup: (group: CustomerGroup | null) => void;
  setSelectedCoupon: (coupon: Coupon | null) => void;
  setIsCouponEditorOpen: (open: boolean) => void;
  setSelectedCity: (city: City | null) => void;
  setIsCityEditorOpen: (open: boolean) => void;
  setSelectedFAQ: (faq: FAQ | null) => void;
  setIsFAQEditorOpen: (open: boolean) => void;
  setSelectedEvent: (event: PromoEvent | null) => void;
  setIsEventEditorOpen: (open: boolean) => void;
  setSelectedCatalogRule: (rule: CatalogPriceRule | null) => void;
  setIsCatalogRuleEditorOpen: (open: boolean) => void;
  setSelectedPackProducts: (products: { productId: string; quantity: number }[]) => void;
  setCustomerDetailTab: (tab: 'profile' | 'orders' | 'loyalty' | 'messages') => void;
  setViewingCustomer: (customer: any) => void;
  setSearchResults: (results: any[]) => void;

  // Form state
  setCurrentSlug: (slug: string) => void;
  setCurrentImage: (image: string) => void;
  setMessageInput: (input: string) => void;
  setNewNote: (note: string) => void;
  setNewRMANote: (note: string) => void;

  setEditingItem: (item: any | null) => void;
  setModalType: (type: string) => void;

  // Reset
  resetModal: () => void;
}

type AdminStore = AdminUIState & AdminActions;

export const useAdminStore = create<AdminStore>((set) => ({
  // ── Initial State ──
  activeTab: 'overview',
  isSidebarOpen: false,
  isAddModalOpen: false,
  editingItem: null,
  modalType: '',
  isSaving: false,
  showNotifications: false,
  searchResults: [],

  orderFilter: 'all',
  productFilter: 'all',
  customerFilter: 'all',
  notificationFilter: 'all',
  reviewFilter: 'all',
  logFilter: 'all',
  requestLogFilter: 'all',
  overviewOrderFilter: 'all',

  categoryPage: 1,
  notificationPage: 1,
  itemsPerPage: 5,

  selectedOrder: null,
  isEditingOrder: false,
  editedOrder: null,
  selectedConversation: null,
  selectedCustomer: null,
  selectedCustomerGroup: null,
  selectedCoupon: null,
  isCouponEditorOpen: false,
  selectedCity: null,
  isCityEditorOpen: false,
  selectedFAQ: null,
  isFAQEditorOpen: false,
  selectedEvent: null,
  isEventEditorOpen: false,
  selectedCatalogRule: null,
  isCatalogRuleEditorOpen: false,
  selectedPackProducts: [],
  customerDetailTab: 'profile',
  viewingCustomer: null,

  currentSlug: '',
  currentImage: '',
  messageInput: '',
  newNote: '',
  newRMANote: '',

  // ── Actions ──
  setActiveTab: (tab) => set({ activeTab: tab }),
  setIsSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setIsAddModalOpen: (open) => set({ isAddModalOpen: open }),
  setShowNotifications: (show) => set({ showNotifications: show }),
  setIsSaving: (saving) => set({ isSaving: saving }),

  openModal: (type, item = null) =>
    set({ modalType: type, editingItem: item, isAddModalOpen: true }),
  closeModal: () =>
    set({ isAddModalOpen: false, editingItem: null, modalType: '' }),

  setOrderFilter: (filter) => set({ orderFilter: filter }),
  setProductFilter: (filter) => set({ productFilter: filter }),
  setCustomerFilter: (filter) => set({ customerFilter: filter }),
  setNotificationFilter: (filter) => set({ notificationFilter: filter }),
  setReviewFilter: (filter) => set({ reviewFilter: filter }),
  setLogFilter: (filter) => set({ logFilter: filter }),
  setRequestLogFilter: (filter) => set({ requestLogFilter: filter }),
  setOverviewOrderFilter: (filter) => set({ overviewOrderFilter: filter }),

  setCategoryPage: (page) => set({ categoryPage: page }),
  setNotificationPage: (page) => set({ notificationPage: page }),

  setSelectedOrder: (order) => set({ selectedOrder: order }),
  setIsEditingOrder: (editing) => set({ isEditingOrder: editing }),
  setEditedOrder: (order) => set({ editedOrder: order }),
  setSelectedConversation: (conv) => set({ selectedConversation: conv }),
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
  setSelectedCustomerGroup: (group) => set({ selectedCustomerGroup: group }),
  setSelectedCoupon: (coupon) => set({ selectedCoupon: coupon }),
  setIsCouponEditorOpen: (open) => set({ isCouponEditorOpen: open }),
  setSelectedCity: (city) => set({ selectedCity: city }),
  setIsCityEditorOpen: (open) => set({ isCityEditorOpen: open }),
  setSelectedFAQ: (faq) => set({ selectedFAQ: faq }),
  setIsFAQEditorOpen: (open) => set({ isFAQEditorOpen: open }),
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  setIsEventEditorOpen: (open) => set({ isEventEditorOpen: open }),
  setSelectedCatalogRule: (rule) => set({ selectedCatalogRule: rule }),
  setIsCatalogRuleEditorOpen: (open) => set({ isCatalogRuleEditorOpen: open }),
  setSelectedPackProducts: (products) => set({ selectedPackProducts: products }),
  setCustomerDetailTab: (tab) => set({ customerDetailTab: tab }),
  setViewingCustomer: (customer) => set({ viewingCustomer: customer }),
  setSearchResults: (results) => set({ searchResults: results }),

  setEditingItem: (item) => set({ editingItem: item }),
  setModalType: (type) => set({ modalType: type }),

  setCurrentSlug: (slug) => set({ currentSlug: slug }),
  setCurrentImage: (image) => set({ currentImage: image }),
  setMessageInput: (input) => set({ messageInput: input }),
  setNewNote: (note) => set({ newNote: note }),
  setNewRMANote: (note) => set({ newRMANote: note }),

  resetModal: () =>
    set({
      isAddModalOpen: false,
      editingItem: null,
      modalType: '',
      selectedPackProducts: [],
      currentSlug: '',
      currentImage: '',
    }),
}));
