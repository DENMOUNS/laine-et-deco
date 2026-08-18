import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { LayoutDashboard, Package, ShoppingBag, Users, BarChart3, Settings, LogOut, TrendingUp, ArrowUpRight, ArrowDownRight, Search, Bell, Plus, Menu, X, History, Coins, Globe, Shield, Activity, Smartphone, Monitor, Star, CheckCircle2, AlertCircle, MessageSquare, Palette, Award, Download, FileText, Send, Table as TableIcon, Ticket, Lock, Eye, MousePointer2, Calendar as CalendarIcon, Image as ImageIcon, Type as TypeIcon, MonitorOff, Info, User, Edit, Trash2, ShoppingCart, RefreshCcw, Tag, Mail, Percent, Truck, ChevronLeft, MapPin, Route, QrCode, Save, HelpCircle, Phone, Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { doc, updateDoc, increment, query, where, getDoc, writeBatch, addDoc } from 'firebase/firestore';
import { auth, db } from '../../../../backend/firebase';
import { BADGES, ADMIN_ROLES as INITIAL_ADMIN_ROLES } from '../../../../constants';
import { DataTable } from '../../../components/DataTable';
import { TabFilter } from '../../../components/TabFilter';
import { StatusBadge, getStatusStyles } from '../../../components/ui/StatusBadge';
import { Loader } from '../../../components/Loader';
import { OrderMap } from '../../../components/OrderMap';
import { CouponEditor } from '../../../components/dashboard/CouponEditor';
import { CityEditor } from '../../../components/dashboard/CityEditor';
import { FAQEditor } from '../../../components/dashboard/FAQEditor';
import { PromoEventEditor } from '../../../components/dashboard/PromoEventEditor';
import { CatalogPriceRuleEditor } from '../../../components/dashboard/CatalogPriceRuleEditor';
import { RichTextEditor } from '../../../components/ui/RichTextEditor';
import { cn } from '../../../utils/utils';
import { translateContentWithAi } from '../../../utils/aiTranslator';

import { AdminFlashSales } from '../AdminFlashSales';
import { AdminLookbooks } from '../AdminLookbooks';
import { AdminPortfolios } from '../AdminPortfolios';

import { Modal } from '../../../components/Modal';
import { ImageUpload } from '../../../components/ui/ImageUpload';

export function AdminBlogModalFields({ ctx }: { ctx: any }) {
  const { ABANDONED_CARTS, ANALYTICS, BLOG_POSTS, CATEGORIES, CATEGORY_DISTRIBUTION, CHAT_MESSAGES, CITIES, CONVERSATIONS, COUPONS, CUSTOMER_GROUPS, DEVICE_DATA, EMAILS, EXPENSES, FAQS, LOGIN_LOGS, LOOKBOOK_POSTS, NAV_ITEMS, NOTIFICATIONS, ORDERS, PACKS, PRODUCTS, PROMO_EVENTS, PUSH_NOTIFICATIONS, REQUEST_LOGS, RETENTION_DATA, REVENUE_BY_PAYMENT, REVIEWS, SALES_DATA, SHIPPING_RULES, SUBSCRIBERS, TAX_RULES, TRAFFIC_SOURCES, USERS, activeMenuItem, activeTab, addBlogPost, addCatalogRule, addCategory, addCity, addCoupon, addCurrency, addCustomerGroup, addEvent, addExpense, addFAQ, addLocalRole, addLookbook, addNavItem, addPack, addProduct, addRMA, addReview, addShippingRule, addTaxRule, allOrders, averageOrderValue, catalogRulesWithDefaults, categoryPage, currentImage, currentSlug, currentUserDoc, customerDetailTab, customerFilter, deleteAbandonedCart, deleteCatalogRule, deleteCategory, deleteChatMessage, deleteCity, deleteConversation, deleteCoupon, deleteCurrency, deleteCustomerGroup, deleteEvent, deleteFAQ, deleteLocalRole, deleteLoginLog, deleteNavItem, deleteNotification, deleteOrder, deletePack, deleteProduct, deleteRequestLog, deleteReview, deleteShippingRule, deleteSiteConfig, deleteSubscriber, deleteTaxRule, deleteUser, editedOrder, editingItem, events, fetchedProducts, filteredMenuItems, formatDate, handleDeleteCatalogRule, handleDeleteCity, handleDeleteEvent, handleDeleteFAQ, handleEditCatalogRule, handleEditCity, handleEditCoupon, handleEditEvent, handleEditFAQ, handleFormSubmit, handleNotificationClick, handleSaveCatalogRule, handleSaveCity, handleSaveCoupon, handleSaveEvent, handleSaveFAQ, handleSearch, handleSeed, handleSendMessage, hasPermission, isAddModalOpen, isAuthLoading, isCatalogRuleEditorOpen, isCityEditorOpen, isCouponEditorOpen, isDataLoading, isEditingOrder, isEventEditorOpen, isFAQEditorOpen, isLoadingAbandoned, isLoadingBlog, isLoadingCatalog, isLoadingCategories, isLoadingCategoryDist, isLoadingDevice, isLoadingEmails, isLoadingExpenses, isLoadingGroups, isLoadingLookbook, isLoadingOrders, isLoadingPacks, isLoadingProducts, isLoadingPush, isLoadingRetention, isLoadingRevenue, isLoadingReviews, isLoadingRoles, isLoadingShipping, isLoadingSubscribers, isLoadingTax, isLoadingTraffic, isLogsLoading, isSaving, isSidebarOpen, isSuperAdmin, isTabAllowed, isUserCustomer, itemsPerPage, localAbandonedCarts, localBlogCategories, localBlogPosts, localCatalogPriceRules, localCategories, localCurrencies, localCustomerGroups, localExpenses, localLookbook, localNavItems, localOrders, localPacks, localProducts, localRMAs, localReviews, localRoles, localShippingRules, localSystemNotifications, localTaxRules, localUsers, logFilter, menuItems, messageInput, modalType, navItemsWithDefaults, newNote, newRMANote, notificationFilter, notificationPage, onNavigate, orderFilter, overviewOrderFilter, permissions, productFilter, propSetSiteConfig, propSiteConfig, rawSiteConfig, realLogs, requestLogFilter, reviewFilter, roleData, saveAllSiteConfig, saveSiteSection, searchResults, selectedCatalogRule, selectedCity, selectedConversation, selectedCoupon, selectedCustomer, selectedCustomerGroup, selectedEvent, selectedFAQ, selectedOrder, selectedPackProducts, setActiveTab, setCategoryPage, setCurrentImage, setCurrentSlug, setCustomerDetailTab, setCustomerFilter, setEditedOrder, setEditingItem, setEvents, setIsAddModalOpen, setIsCatalogRuleEditorOpen, setIsCityEditorOpen, setIsCouponEditorOpen, setIsEditingOrder, setIsEventEditorOpen, setIsFAQEditorOpen, setIsSaving, setIsSidebarOpen, setLocalAbandonedCarts, setLocalAbandonedCarts2, setLocalBlogPosts, setLocalBlogPosts2, setLocalCategories, setLocalCurrencies, setLocalCustomerGroups, setLocalCustomerGroups2, setLocalEmails, setLocalExpenses, setLocalLookbook, setLocalLookbook2, setLocalOrders, setLocalPacks, setLocalProducts, setLocalPushNotifications, setLocalReviews, setLocalReviews2, setLocalRole, setLocalRoles, setLocalShippingRules, setLocalShippingRules2, setLocalSubscribers, setLocalSystemNotifications, setLocalTaxRules, setLocalTaxRules2, setLocalUser, setLocalUsers, setLogFilter, setMessageInput, setModalType, setNewNote, setNewRMANote, setNotificationFilter, setNotificationPage, setOrderFilter, setOverviewOrderFilter, setProductFilter, setRequestLogFilter, setReviewFilter, setSearchResults, setSelectedCatalogRule, setSelectedCity, setSelectedConversation, setSelectedCoupon, setSelectedCustomer, setSelectedCustomerGroup, setSelectedEvent, setSelectedFAQ, setSelectedOrder, setSelectedPackProducts, setShowNotifications, setSiteConfig, setViewingCustomer, showNotifications, siteConfig, siteConfigs, sortByDate, stats, totalCustomers, totalOrdersCount, totalSales, totalVisitors, updateBlogPost, updateCatalogRule, updateCategory, updateCity, updateCoupon, updateCurrency, updateCustomerGroup, updateEvent, updateExpense, updateFAQ, updateLocalRole, updateLocalUser, updateLookbook, updateNavItem, updatePack, updateProduct, updateRMA, updateReview, updateShippingRule, updateSiteConfig, updateTaxRule, user, userRoleSlug, viewingCustomer } = ctx;

  const [titleEn, setTitleEn] = React.useState(editingItem?.title_en || '');
  const [excerptEn, setExcerptEn] = React.useState(editingItem?.excerpt_en || '');
  const [contentEn, setContentEn] = React.useState(editingItem?.content_en || '');
  const [isTranslating, setIsTranslating] = React.useState(false);

  const handleTranslate = async (e: React.MouseEvent) => {
    const parent = (e.currentTarget.closest('.grid') as HTMLElement);
    const titleFr = (parent?.querySelector('input[name="title"]') as HTMLInputElement)?.value || editingItem?.title;
    const excerptFr = (parent?.querySelector('textarea[name="excerpt"]') as HTMLTextAreaElement)?.value || editingItem?.excerpt;
    const contentFr = (parent?.querySelector('input[name="content"]') as HTMLInputElement)?.value || editingItem?.content;

    if (!titleFr && !excerptFr && !contentFr) {
      toast.error('Veuillez renseigner au moins un champ en français.');
      return;
    }
    setIsTranslating(true);
    try {
      const res = await translateContentWithAi({
        title: titleFr,
        excerpt: excerptFr,
        content: contentFr,
      }, 'en', 'fr');
      if (res) {
        if (res.title) setTitleEn(res.title);
        if (res.excerpt) setExcerptEn(res.excerpt);
        if (res.content) setContentEn(res.content);
        toast.success('Traduction de l\'article générée par l\'IA !');
      }
    } catch {
      toast.error('Erreur lors de la traduction.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <>
{modalType === 'blog' && (
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center justify-between bg-accent/5 p-4 rounded-2xl border border-accent/20">
                  <div className="flex items-center gap-2">
                    <Globe size={18} className="text-accent" />
                    <span className="text-sm font-bold">Traduction multilingue automatique</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleTranslate}
                    disabled={isTranslating}
                    className="px-4 py-2 bg-accent text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-accent/90 transition-all cursor-pointer"
                  >
                    <Sparkles size={14} className={isTranslating ? 'animate-spin' : ''} />
                    {isTranslating ? 'Traduction en cours...' : 'Traduire tout en Anglais'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Titre (Français) *</label>
                    <input name="title" type="text" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary font-medium" defaultValue={editingItem?.title} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-1">
                      <Globe size={13} /> Titre (Anglais)
                    </label>
                    <input 
                      name="title_en" 
                      type="text" 
                      className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-accent font-medium" 
                      value={titleEn} 
                      onChange={(e) => setTitleEn(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Catégorie</label>
                  <select name="category" defaultValue={editingItem?.category || ''} className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary" required>
                    <option value="">Sélectionner une catégorie</option>
                    {(localBlogCategories || []).filter((c:any)=> (c.status || 'active') === 'active').map((category:any) => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Image</label>
                  <ImageUpload name="image" defaultValue={editingItem?.image} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Extrait (Français) *</label>
                    <textarea name="excerpt" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary" defaultValue={editingItem?.excerpt} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-1">
                      <Globe size={13} /> Extrait (Anglais)
                    </label>
                    <textarea 
                      name="excerpt_en" 
                      className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-accent" 
                      value={excerptEn}
                      onChange={(e) => setExcerptEn(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Contenu (Français)</label>
                  <RichTextEditor name="content" defaultValue={editingItem?.content || ''} className="w-full" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-1">
                    <Globe size={13} /> Contenu (Anglais)
                  </label>
                  <RichTextEditor name="content_en" defaultValue={editingItem?.content_en || contentEn || ''} key={contentEn} className="w-full" />
                </div>
              </div>
            )}
    </>
  );
}
