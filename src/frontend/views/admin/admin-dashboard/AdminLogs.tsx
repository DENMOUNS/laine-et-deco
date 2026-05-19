import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { LayoutDashboard, Package, ShoppingBag, Users, BarChart3, Settings, LogOut, TrendingUp, ArrowUpRight, ArrowDownRight, Search, Bell, Plus, Menu, X, History, Coins, Globe, Shield, Activity, Smartphone, Monitor, Star, CheckCircle2, AlertCircle, MessageSquare, Palette, Award, Download, FileText, Send, Table as TableIcon, Ticket, Lock, Eye, MousePointer2, Calendar as CalendarIcon, Image as ImageIcon, Type as TypeIcon, MonitorOff, Info, User, Edit, Trash2, ShoppingCart, RefreshCcw, Tag, Mail, Percent, Truck, ChevronLeft, MapPin, Route, QrCode, Save, HelpCircle, Phone } from 'lucide-react';
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

import { AdminFlashSales } from '../AdminFlashSales';
import { AdminLookbooks } from '../AdminLookbooks';
import { AdminPortfolios } from '../AdminPortfolios';


/** Maps HTTP method + path to a human-readable description */
function getActionDescription(method: string, path: string): string {
  const resource = path?.split('/').filter(Boolean).pop() || '';
  const actions: Record<string, string> = {
    GET: `Lecture ${resource}`,
    POST: `Création ${resource}`,
    PUT: `Mise à jour ${resource}`,
    PATCH: `Modification ${resource}`,
    DELETE: `Suppression ${resource}`,
  };
  return actions[method] || `${method} ${resource}`;
}

/** Maps HTTP status code to standard status text */
function getStatusText(code: number): string {
  const map: Record<number, string> = {
    200: 'OK', 201: 'Created', 204: 'No Content',
    301: 'Redirect', 304: 'Not Modified',
    400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 409: 'Conflict', 429: 'Too Many',
    500: 'Server Error', 502: 'Bad Gateway', 503: 'Unavailable',
  };
  return map[code] || (code < 300 ? 'Success' : code < 400 ? 'Redirect' : code < 500 ? 'Client Error' : 'Server Error');
}

export function AdminLogs({ ctx }: { ctx: any }) {
  const { ABANDONED_CARTS, ANALYTICS, BLOG_POSTS, CATEGORIES, CATEGORY_DISTRIBUTION, CHAT_MESSAGES, CITIES, CONVERSATIONS, COUPONS, CUSTOMER_GROUPS, DEVICE_DATA, EMAILS, EXPENSES, FAQS, LOGIN_LOGS, LOOKBOOK_POSTS, NAV_ITEMS, NOTIFICATIONS, ORDERS, PACKS, PRODUCTS, PROMO_EVENTS, PUSH_NOTIFICATIONS, REQUEST_LOGS, RETENTION_DATA, REVENUE_BY_PAYMENT, REVIEWS, SALES_DATA, SHIPPING_RULES, SUBSCRIBERS, TAX_RULES, TRAFFIC_SOURCES, USERS, activeMenuItem, activeTab, addBlogPost, addCatalogRule, addCategory, addCity, addCoupon, addCurrency, addCustomerGroup, addEvent, addExpense, addFAQ, addLocalRole, addLookbook, addNavItem, addPack, addProduct, addRMA, addReview, addShippingRule, addTaxRule, allOrders, averageOrderValue, catalogRulesWithDefaults, categoryPage, currentImage, currentSlug, currentUserDoc, customerDetailTab, customerFilter, deleteAbandonedCart, deleteCatalogRule, deleteCategory, deleteChatMessage, deleteCity, deleteConversation, deleteCoupon, deleteCurrency, deleteCustomerGroup, deleteEvent, deleteFAQ, deleteLocalRole, deleteLoginLog, deleteNavItem, deleteNotification, deleteOrder, deletePack, deleteProduct, deleteRequestLog, deleteReview, deleteShippingRule, deleteSiteConfig, deleteSubscriber, deleteTaxRule, deleteUser, editedOrder, editingItem, events, fetchedProducts, filteredMenuItems, formatDate, handleDeleteCatalogRule, handleDeleteCity, handleDeleteEvent, handleDeleteFAQ, handleEditCatalogRule, handleEditCity, handleEditCoupon, handleEditEvent, handleEditFAQ, handleFormSubmit, handleNotificationClick, handleSaveCatalogRule, handleSaveCity, handleSaveCoupon, handleSaveEvent, handleSaveFAQ, handleSearch, handleSeed, handleSendMessage, hasPermission, isAddModalOpen, isAuthLoading, isCatalogRuleEditorOpen, isCityEditorOpen, isCouponEditorOpen, isDataLoading, isEditingOrder, isEventEditorOpen, isFAQEditorOpen, isLoadingAbandoned, isLoadingBlog, isLoadingCatalog, isLoadingCategories, isLoadingCategoryDist, isLoadingDevice, isLoadingEmails, isLoadingExpenses, isLoadingGroups, isLoadingLookbook, isLoadingOrders, isLoadingPacks, isLoadingProducts, isLoadingPush, isLoadingRetention, isLoadingRevenue, isLoadingReviews, isLoadingRoles, isLoadingShipping, isLoadingSubscribers, isLoadingTax, isLoadingTraffic, isLogsLoading, isSaving, isSidebarOpen, isSuperAdmin, isTabAllowed, isUserCustomer, itemsPerPage, localAbandonedCarts, localBlogPosts, localCatalogPriceRules, localCategories, localCurrencies, localCustomerGroups, localExpenses, localLookbook, localNavItems, localOrders, localPacks, localProducts, localRMAs, localReviews, localRoles, localShippingRules, localSystemNotifications, localTaxRules, localUsers, logFilter, menuItems, messageInput, modalType, navItemsWithDefaults, newNote, newRMANote, notificationFilter, notificationPage, onNavigate, orderFilter, overviewOrderFilter, permissions, productFilter, propSetSiteConfig, propSiteConfig, rawSiteConfig, realLogs, requestLogFilter, reviewFilter, roleData, saveAllSiteConfig, saveSiteSection, searchResults, selectedCatalogRule, selectedCity, selectedConversation, selectedCoupon, selectedCustomer, selectedCustomerGroup, selectedEvent, selectedFAQ, selectedOrder, selectedPackProducts, setActiveTab, setCategoryPage, setCurrentImage, setCurrentSlug, setCustomerDetailTab, setCustomerFilter, setEditedOrder, setEditingItem, setEvents, setIsAddModalOpen, setIsCatalogRuleEditorOpen, setIsCityEditorOpen, setIsCouponEditorOpen, setIsEditingOrder, setIsEventEditorOpen, setIsFAQEditorOpen, setIsSaving, setIsSidebarOpen, setLocalAbandonedCarts, setLocalAbandonedCarts2, setLocalBlogPosts, setLocalBlogPosts2, setLocalCategories, setLocalCurrencies, setLocalCustomerGroups, setLocalCustomerGroups2, setLocalEmails, setLocalExpenses, setLocalLookbook, setLocalLookbook2, setLocalOrders, setLocalPacks, setLocalProducts, setLocalPushNotifications, setLocalReviews, setLocalReviews2, setLocalRole, setLocalRoles, setLocalShippingRules, setLocalShippingRules2, setLocalSubscribers, setLocalSystemNotifications, setLocalTaxRules, setLocalTaxRules2, setLocalUser, setLocalUsers, setLogFilter, setMessageInput, setModalType, setNewNote, setNewRMANote, setNotificationFilter, setNotificationPage, setOrderFilter, setOverviewOrderFilter, setProductFilter, setRequestLogFilter, setReviewFilter, setSearchResults, setSelectedCatalogRule, setSelectedCity, setSelectedConversation, setSelectedCoupon, setSelectedCustomer, setSelectedCustomerGroup, setSelectedEvent, setSelectedFAQ, setSelectedOrder, setSelectedPackProducts, setShowNotifications, setSiteConfig, setViewingCustomer, showNotifications, siteConfig, siteConfigs, sortByDate, stats, totalCustomers, totalOrdersCount, totalSales, totalVisitors, updateBlogPost, updateCatalogRule, updateCategory, updateCity, updateCoupon, updateCurrency, updateCustomerGroup, updateEvent, updateExpense, updateFAQ, updateLocalRole, updateLocalUser, updateLookbook, updateNavItem, updatePack, updateProduct, updateRMA, updateReview, updateShippingRule, updateSiteConfig, updateTaxRule, user, userRoleSlug, viewingCustomer } = ctx;
  return (
    <>
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
                
              dateFilterKey="createdAt"
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
                            onClick={() => {
                              setSelectedCustomer(user);
                              setActiveTab('customer-detail');
                            }}
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
                    accessor: (log) => {
                      const methodColors: any = {
                        GET: 'text-blue-700 bg-blue-100 border-blue-200',
                        POST: 'text-green-700 bg-green-100 border-green-200',
                        PUT: 'text-yellow-700 bg-yellow-100 border-yellow-200',
                        DELETE: 'text-red-700 bg-red-100 border-red-200',
                        PATCH: 'text-purple-700 bg-purple-100 border-purple-200',
                      };
                      const sC = methodColors[log.method] || 'text-slate-700 bg-slate-100 border-slate-200';
                      return (
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border shadow-sm ${sC}`}>
                          {log.method}
                        </span>
                      );
                    },
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
                    accessor: (log) => {
                      let sC = 'text-slate-700 bg-slate-100 border-slate-200';
                      if (log.statusCode < 300) sC = 'text-green-700 bg-green-100 border-green-200';
                      else if (log.statusCode < 400) sC = 'text-blue-700 bg-blue-100 border-blue-200';
                      else if (log.statusCode < 500) sC = 'text-amber-700 bg-amber-100 border-amber-200';
                      else sC = 'text-red-700 bg-red-100 border-red-200';
                      return (
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold border flex items-center w-fit shadow-sm gap-1 ${sC}`}>
                          {log.statusCode} <span className="opacity-70 font-normal text-[8px] uppercase tracking-wider">{getStatusText(log.statusCode)}</span>
                        </span>
                      );
                    },
                    sortable: true,
                    sortKey: 'statusCode'
                  },
                  { header: 'Appareil', accessor: 'device', className: 'text-[10px] text-primary/60', sortable: true },
                  { header: 'Navigateur', accessor: 'browser', className: 'text-[10px] text-primary/60', sortable: true },
                  { header: 'IP', accessor: 'ip', className: 'font-mono text-[10px] text-primary/60', sortable: true },
                  { header: 'Durée', accessor: (log) => `${log.duration}ms`, className: 'text-[10px] text-primary/60', sortable: true, sortKey: 'duration' },
                  { header: 'Date', accessor: (log) => new Date(log.timestamp).toLocaleString(), className: 'text-primary/60 text-[10px]', sortable: true, sortKey: 'timestamp' },
                { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt || item.date || item.subscribedAt || item.sentAt || new Date().toISOString()), className: 'text-primary/60 text-sm', sortable: true }
              ]}
              />
            </div>
          </div>
        )}
    </>
  );
}
