import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { LayoutDashboard, Package, ShoppingBag, Users, BarChart3, Settings, LogOut, TrendingUp, ArrowUpRight, ArrowDownRight, Search, Bell, Plus, Menu, X, History, Coins, Globe, Shield, Activity, Smartphone, Monitor, Star, CheckCircle2, AlertCircle, MessageSquare, Palette, Award, Download, FileText, Send, Table as TableIcon, Ticket, Lock, Eye, MousePointer2, Calendar as CalendarIcon, Image as ImageIcon, Type as TypeIcon, MonitorOff, Info, User, Edit, Trash2, ShoppingCart, RefreshCcw, Tag, Mail, Percent, Truck, ChevronLeft, MapPin, Route, QrCode, Save, HelpCircle, Phone, Calendar } from 'lucide-react';
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
import { cn } from '../../../utils/utils';
import { formatNotificationDate, formatTimeAgo } from '../../../utils/notificationFormatter';

import { AdminFlashSales } from '../AdminFlashSales';
import { AdminPortfolios } from '../AdminPortfolios';

export function AdminNotifications({ ctx }: { ctx: any }) {
  const markAllNotificationsAsRead = ctx.markAllNotificationsAsRead;
  const { ABANDONED_CARTS, ANALYTICS, BLOG_POSTS, CATEGORIES, CATEGORY_DISTRIBUTION, CHAT_MESSAGES, CITIES, CONVERSATIONS, COUPONS, CUSTOMER_GROUPS, DEVICE_DATA, EMAILS, EXPENSES, FAQS, LOGIN_LOGS, LOOKBOOK_POSTS, NAV_ITEMS, NOTIFICATIONS, ORDERS, PACKS, PRODUCTS, PROMO_EVENTS, PUSH_NOTIFICATIONS, REQUEST_LOGS, RETENTION_DATA, REVENUE_BY_PAYMENT, REVIEWS, SALES_DATA, SHIPPING_RULES, SUBSCRIBERS, TAX_RULES, TRAFFIC_SOURCES, USERS, activeMenuItem, activeTab, addBlogPost, addCatalogRule, addCategory, addCity, addCoupon, addCurrency, addCustomerGroup, addEvent, addExpense, addFAQ, addLocalRole, addLookbook, addNavItem, addPack, addProduct, addRMA, addReview, addShippingRule, addTaxRule, allOrders, averageOrderValue, catalogRulesWithDefaults, categoryPage, currentImage, currentSlug, currentUserDoc, customerDetailTab, customerFilter, deleteAbandonedCart, deleteCatalogRule, deleteCategory, deleteChatMessage, deleteCity, deleteConversation, deleteCoupon, deleteCurrency, deleteCustomerGroup, deleteEvent, deleteFAQ, deleteLocalRole, deleteLoginLog, deleteNavItem, deleteNotification, deleteOrder, deletePack, deleteProduct, deleteRequestLog, deleteReview, deleteShippingRule, deleteSiteConfig, deleteSubscriber, deleteTaxRule, deleteUser, editedOrder, editingItem, events, fetchedProducts, filteredMenuItems, formatDate, handleDeleteCatalogRule, handleDeleteCity, handleDeleteEvent, handleDeleteFAQ, handleEditCatalogRule, handleEditCity, handleEditCoupon, handleEditEvent, handleEditFAQ, handleFormSubmit, handleNotificationClick, handleSaveCatalogRule, handleSaveCity, handleSaveCoupon, handleSaveEvent, handleSaveFAQ, handleSearch, handleSeed, handleSendMessage, hasPermission, isAddModalOpen, isAuthLoading, isCatalogRuleEditorOpen, isCityEditorOpen, isCouponEditorOpen, isDataLoading, isEditingOrder, isEventEditorOpen, isFAQEditorOpen, isLoadingAbandoned, isLoadingBlog, isLoadingCatalog, isLoadingCategories, isLoadingCategoryDist, isLoadingDevice, isLoadingEmails, isLoadingExpenses, isLoadingGroups, isLoadingLookbook, isLoadingOrders, isLoadingPacks, isLoadingProducts, isLoadingPush, isLoadingRetention, isLoadingRevenue, isLoadingReviews, isLoadingRoles, isLoadingShipping, isLoadingSubscribers, isLoadingTax, isLoadingTraffic, isLogsLoading, isSaving, isSidebarOpen, isSuperAdmin, isTabAllowed, isUserCustomer, itemsPerPage, localAbandonedCarts, localBlogPosts, localCatalogPriceRules, localCategories, localCurrencies, localCustomerGroups, localExpenses, localLookbook, localNavItems, localOrders, localPacks, localProducts, localRMAs, localReviews, localRoles, localShippingRules, localSystemNotifications, localTaxRules, localUsers, logFilter, menuItems, messageInput, modalType, navItemsWithDefaults, newNote, newRMANote, notificationFilter, notificationPage, onNavigate, orderFilter, overviewOrderFilter, permissions, productFilter, propSetSiteConfig, propSiteConfig, rawSiteConfig, realLogs, requestLogFilter, reviewFilter, roleData, saveAllSiteConfig, saveSiteSection, searchResults, selectedCatalogRule, selectedCity, selectedConversation, selectedCoupon, selectedCustomer, selectedCustomerGroup, selectedEvent, selectedFAQ, selectedOrder, selectedPackProducts, setActiveTab, setCategoryPage, setCurrentImage, setCurrentSlug, setCustomerDetailTab, setCustomerFilter, setEditedOrder, setEditingItem, setEvents, setIsAddModalOpen, setIsCatalogRuleEditorOpen, setIsCityEditorOpen, setIsCouponEditorOpen, setIsEditingOrder, setIsEventEditorOpen, setIsFAQEditorOpen, setIsSaving, setIsSidebarOpen, setLocalAbandonedCarts, setLocalAbandonedCarts2, setLocalBlogPosts, setLocalBlogPosts2, setLocalCategories, setLocalCurrencies, setLocalCustomerGroups, setLocalCustomerGroups2, setLocalEmails, setLocalExpenses, setLocalLookbook, setLocalLookbook2, setLocalOrders, setLocalPacks, setLocalProducts, setLocalPushNotifications, setLocalReviews, setLocalReviews2, setLocalRole, setLocalRoles, setLocalShippingRules, setLocalShippingRules2, setLocalSubscribers, setLocalSystemNotifications, setLocalTaxRules, setLocalTaxRules2, setLocalUser, setLocalUsers, setLogFilter, setMessageInput, setModalType, setNewNote, setNewRMANote, setNotificationFilter, setNotificationPage, setOrderFilter, setOverviewOrderFilter, setProductFilter, setRequestLogFilter, setReviewFilter, setSearchResults, setSelectedCatalogRule, setSelectedCity, setSelectedConversation, setSelectedCoupon, setSelectedCustomer, setSelectedCustomerGroup, setSelectedEvent, setSelectedFAQ, setSelectedOrder, setSelectedPackProducts, setShowNotifications, setSiteConfig, setViewingCustomer, showNotifications, siteConfig, siteConfigs, sortByDate, stats, totalCustomers, totalOrdersCount, totalSales, totalVisitors, updateBlogPost, updateCatalogRule, updateCategory, updateCity, updateCoupon, updateCurrency, updateCustomerGroup, updateEvent, updateExpense, updateFAQ, updateLocalRole, updateLocalUser, updateLookbook, updateNavItem, updatePack, updateProduct, updateRMA, updateReview, updateShippingRule, updateSiteConfig, updateTaxRule, user, userRoleSlug, viewingCustomer } = ctx;

  const [dateFilterType, setDateFilterType] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  // Filtre par date
  const isWithinDateRange = (notificationDate: string) => {
    const date = new Date(notificationDate);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (dateFilterType) {
      case 'today':
        return date >= startOfToday && date <= now;
      case 'week':
        return date >= startOfWeek && date <= now;
      case 'month':
        return date >= startOfMonth && date <= now;
      case 'custom':
        if (!customDateRange.start || !customDateRange.end) return true;
        const start = new Date(customDateRange.start);
        const end = new Date(customDateRange.end);
        end.setDate(end.getDate() + 1); // Inclure tout le jour de fin
        return date >= start && date <= end;
      case 'all':
      default:
        return true;
    }
  };

  const filteredNotifications = useMemo(() => {
    return localSystemNotifications.filter(n => {
      // Filtre par statut de lecture
      if (notificationFilter === 'all') return isWithinDateRange(n.timestamp);
      if (notificationFilter === 'read') return n.read && isWithinDateRange(n.timestamp);
      if (notificationFilter === 'unread') return !n.read && isWithinDateRange(n.timestamp);
      return isWithinDateRange(n.timestamp);
    });
  }, [localSystemNotifications, notificationFilter, dateFilterType, customDateRange]);

  const sortedNotifications = useMemo(() => {
    return [...filteredNotifications].sort((a: any, b: any) => {
      const timeA = new Date(a.createdAt || a.timestamp || 0).getTime();
      const timeB = new Date(b.createdAt || b.timestamp || 0).getTime();
      return timeB - timeA;
    });
  }, [filteredNotifications]);

  const [page, setPage] = useState(1);
  const NOTIF_ITEMS_PER_PAGE = 25;
  const totalPages = Math.max(1, Math.ceil(sortedNotifications.length / NOTIF_ITEMS_PER_PAGE));
  const currentPageNotifications = useMemo(() => {
    const start = (page - 1) * NOTIF_ITEMS_PER_PAGE;
    return sortedNotifications.slice(start, start + NOTIF_ITEMS_PER_PAGE);
  }, [sortedNotifications, page]);

  return (
    <>
      {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <h3 className="text-xl font-serif">Notifications Système</h3>
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => {
                    if (markAllNotificationsAsRead) {
                      markAllNotificationsAsRead();
                    } else {
                      setLocalSystemNotifications((prev: any[]) => prev.map(n => ({ ...n, read: true })));
                      toast.success('Toutes les notifications ont été marquées comme lues');
                    }
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

            {/* Filtres de date */}
            <div className="bg-card rounded-2xl shadow-sm border border-primary/10 p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setDateFilterType('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                      dateFilterType === 'all'
                        ? 'bg-primary text-white'
                        : 'bg-secondary/30 text-primary hover:bg-secondary/50'
                    }`}
                  >
                    Toutes les dates
                  </button>
                  <button
                    onClick={() => setDateFilterType('today')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                      dateFilterType === 'today'
                        ? 'bg-primary text-white'
                        : 'bg-secondary/30 text-primary hover:bg-secondary/50'
                    }`}
                  >
                    Aujourd'hui
                  </button>
                  <button
                    onClick={() => setDateFilterType('week')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                      dateFilterType === 'week'
                        ? 'bg-primary text-white'
                        : 'bg-secondary/30 text-primary hover:bg-secondary/50'
                    }`}
                  >
                    Cette semaine
                  </button>
                  <button
                    onClick={() => setDateFilterType('month')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                      dateFilterType === 'month'
                        ? 'bg-primary text-white'
                        : 'bg-secondary/30 text-primary hover:bg-secondary/50'
                    }`}
                  >
                    Ce mois
                  </button>
                  <button
                    onClick={() => setDateFilterType('custom')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                      dateFilterType === 'custom'
                        ? 'bg-primary text-white'
                        : 'bg-secondary/30 text-primary hover:bg-secondary/50'
                    }`}
                  >
                    <Calendar size={16} className="inline mr-1" /> Personnalisée
                  </button>
                </div>
              </div>

              {dateFilterType === 'custom' && (
                <div className="mt-4 flex gap-3">
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-primary/60 mb-1">Du</label>
                    <input
                      type="date"
                      value={customDateRange.start}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="px-3 py-2 border border-primary/10 rounded-lg text-sm bg-secondary/30 text-primary"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-bold text-primary/60 mb-1">Au</label>
                    <input
                      type="date"
                      value={customDateRange.end}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="px-3 py-2 border border-primary/10 rounded-lg text-sm bg-secondary/30 text-primary"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-card rounded-[2.5rem] shadow-sm border border-primary/10 overflow-hidden">
                {currentPageNotifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={() => {
                      // Marquer comme lu
                      const newNotif = { ...notif, read: true, readAt: new Date().toISOString() };
                      setLocalSystemNotifications((prev: any[]) => prev.map(n => n.id === notif.id ? newNotif : n));

                      // Naviguer selon le type
                      if (notif.type === 'order' && notif.relatedId) {
                        const order = localOrders.find((o: any) => o.id === notif.relatedId);
                        if (order) {
                          setSelectedOrder(order);
                          setActiveTab('order-detail');
                          toast.success('Notification marquée comme lue');
                        }
                      } else if (notif.type === 'product' && notif.relatedId) {
                        const product = localProducts.find((p: any) => p.id === notif.relatedId);
                        if (product) {
                          setEditingItem(product);
                          setActiveTab('products');
                          toast.success('Notification marquée comme lue');
                        }
                      } else if (notif.type === 'stock' && notif.relatedId) {
                        const product = localProducts.find((p: any) => p.id === notif.relatedId);
                        if (product) {
                          setEditingItem(product);
                          setActiveTab('inventory');
                          toast.success('Notification marquée comme lue - Alerte de stock');
                        }
                      } else {
                        toast.success('Notification marquée comme lue');
                      }
                    }}
                    className={`p-6 border-b border-primary/5 flex gap-4 hover:bg-secondary/50 transition-colors cursor-pointer group ${!notif.read ? 'bg-primary/5' : ''}`}
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
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-primary/40 whitespace-nowrap" title={formatNotificationDate(notif.timestamp)}>
                            {formatTimeAgo(notif.timestamp)}
                          </span>
                          <span className="text-[10px] font-bold text-primary/40 whitespace-nowrap">
                            {formatNotificationDate(notif.timestamp)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-primary/60 leading-relaxed">{notif.message}</p>
                      {notif.readAt && (
                        <p className="text-[10px] text-primary/40 mt-2">
                          Lue le {formatNotificationDate(notif.readAt)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {sortedNotifications.length === 0 && (
                  <div className="p-12 text-center text-primary/60">
                    <Bell size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Aucune notification pour les critères sélectionnés</p>
                  </div>
                )}
                {totalPages > 1 && (
                  <div className="p-4 border-t border-primary/10 flex justify-between items-center bg-secondary/10">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="px-4 py-2 text-xs font-bold bg-white text-primary border border-primary/10 rounded-xl disabled:opacity-40 hover:bg-primary/5 transition-all"
                    >
                      Précédent
                    </button>
                    <span className="text-xs font-bold text-primary/70">
                      Page {page} sur {totalPages} ({sortedNotifications.length} notification{sortedNotifications.length > 1 ? 's' : ''})
                    </span>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className="px-4 py-2 text-xs font-bold bg-white text-primary border border-primary/10 rounded-xl disabled:opacity-40 hover:bg-primary/5 transition-all"
                    >
                      Suivant
                    </button>
                  </div>
                )}
            </div>
          </div>
        )}
    </>
  );
}
