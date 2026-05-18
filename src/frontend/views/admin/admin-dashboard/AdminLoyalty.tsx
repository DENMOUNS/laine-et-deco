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
import { generateInvoicePDF } from '../../../utils/invoiceUtils';
import { AdminFlashSales } from '../AdminFlashSales';
import { AdminLookbooks } from '../AdminLookbooks';
import { AdminPortfolios } from '../AdminPortfolios';

export function AdminLoyalty({ ctx }: { ctx: any }) {
  const { ABANDONED_CARTS, ANALYTICS, BLOG_POSTS, CATEGORIES, CATEGORY_DISTRIBUTION, CHAT_MESSAGES, CITIES, CONVERSATIONS, COUPONS, CUSTOMER_GROUPS, DEVICE_DATA, EMAILS, EXPENSES, FAQS, LOGIN_LOGS, LOOKBOOK_POSTS, NAV_ITEMS, NOTIFICATIONS, ORDERS, PACKS, PRODUCTS, PROMO_EVENTS, PUSH_NOTIFICATIONS, REQUEST_LOGS, RETENTION_DATA, REVENUE_BY_PAYMENT, REVIEWS, SALES_DATA, SHIPPING_RULES, SUBSCRIBERS, TAX_RULES, TRAFFIC_SOURCES, USERS, activeMenuItem, activeTab, addBlogPost, addCatalogRule, addCategory, addCity, addCoupon, addCurrency, addCustomerGroup, addEvent, addExpense, addFAQ, addLocalRole, addLookbook, addNavItem, addPack, addProduct, addRMA, addReview, addShippingRule, addTaxRule, allOrders, averageOrderValue, catalogRulesWithDefaults, categoryPage, currentImage, currentSlug, currentUserDoc, customerDetailTab, customerFilter, deleteAbandonedCart, deleteCatalogRule, deleteCategory, deleteChatMessage, deleteCity, deleteConversation, deleteCoupon, deleteCurrency, deleteCustomerGroup, deleteEvent, deleteFAQ, deleteLocalRole, deleteLoginLog, deleteNavItem, deleteNotification, deleteOrder, deletePack, deleteProduct, deleteRequestLog, deleteReview, deleteShippingRule, deleteSiteConfig, deleteSubscriber, deleteTaxRule, deleteUser, editedOrder, editingItem, events, fetchedProducts, filteredMenuItems, formatDate, handleDeleteCatalogRule, handleDeleteCity, handleDeleteEvent, handleDeleteFAQ, handleEditCatalogRule, handleEditCity, handleEditCoupon, handleEditEvent, handleEditFAQ, handleFormSubmit, handleNotificationClick, handleSaveCatalogRule, handleSaveCity, handleSaveCoupon, handleSaveEvent, handleSaveFAQ, handleSearch, handleSeed, handleSendMessage, hasPermission, isAddModalOpen, isAuthLoading, isCatalogRuleEditorOpen, isCityEditorOpen, isCouponEditorOpen, isDataLoading, isEditingOrder, isEventEditorOpen, isFAQEditorOpen, isLoadingAbandoned, isLoadingBlog, isLoadingCatalog, isLoadingCategories, isLoadingCategoryDist, isLoadingDevice, isLoadingEmails, isLoadingExpenses, isLoadingGroups, isLoadingLookbook, isLoadingOrders, isLoadingPacks, isLoadingProducts, isLoadingPush, isLoadingRetention, isLoadingRevenue, isLoadingReviews, isLoadingRoles, isLoadingShipping, isLoadingSubscribers, isLoadingTax, isLoadingTraffic, isLogsLoading, isSaving, isSidebarOpen, isSuperAdmin, isTabAllowed, isUserCustomer, itemsPerPage, localAbandonedCarts, localBlogPosts, localCatalogPriceRules, localCategories, localCurrencies, localCustomerGroups, localExpenses, localLookbook, localNavItems, localOrders, localPacks, localProducts, localRMAs, localReviews, localRoles, localShippingRules, localSystemNotifications, localTaxRules, localUsers, logFilter, menuItems, messageInput, modalType, navItemsWithDefaults, newNote, newRMANote, notificationFilter, notificationPage, onNavigate, orderFilter, overviewOrderFilter, permissions, productFilter, propSetSiteConfig, propSiteConfig, rawSiteConfig, realLogs, requestLogFilter, reviewFilter, roleData, saveAllSiteConfig, saveSiteSection, searchResults, selectedCatalogRule, selectedCity, selectedConversation, selectedCoupon, selectedCustomer, selectedCustomerGroup, selectedEvent, selectedFAQ, selectedOrder, selectedPackProducts, setActiveTab, setCategoryPage, setCurrentImage, setCurrentSlug, setCustomerDetailTab, setCustomerFilter, setEditedOrder, setEditingItem, setEvents, setIsAddModalOpen, setIsCatalogRuleEditorOpen, setIsCityEditorOpen, setIsCouponEditorOpen, setIsEditingOrder, setIsEventEditorOpen, setIsFAQEditorOpen, setIsSaving, setIsSidebarOpen, setLocalAbandonedCarts, setLocalAbandonedCarts2, setLocalBlogPosts, setLocalBlogPosts2, setLocalCategories, setLocalCurrencies, setLocalCustomerGroups, setLocalCustomerGroups2, setLocalEmails, setLocalExpenses, setLocalLookbook, setLocalLookbook2, setLocalOrders, setLocalPacks, setLocalProducts, setLocalPushNotifications, setLocalReviews, setLocalReviews2, setLocalRole, setLocalRoles, setLocalShippingRules, setLocalShippingRules2, setLocalSubscribers, setLocalSystemNotifications, setLocalTaxRules, setLocalTaxRules2, setLocalUser, setLocalUsers, setLogFilter, setMessageInput, setModalType, setNewNote, setNewRMANote, setNotificationFilter, setNotificationPage, setOrderFilter, setOverviewOrderFilter, setProductFilter, setRequestLogFilter, setReviewFilter, setSearchResults, setSelectedCatalogRule, setSelectedCity, setSelectedConversation, setSelectedCoupon, setSelectedCustomer, setSelectedCustomerGroup, setSelectedEvent, setSelectedFAQ, setSelectedOrder, setSelectedPackProducts, setShowNotifications, setSiteConfig, setViewingCustomer, showNotifications, siteConfig, siteConfigs, sortByDate, stats, totalCustomers, totalOrdersCount, totalSales, totalVisitors, updateBlogPost, updateCatalogRule, updateCategory, updateCity, updateCoupon, updateCurrency, updateCustomerGroup, updateEvent, updateExpense, updateFAQ, updateLocalRole, updateLocalUser, updateLookbook, updateNavItem, updatePack, updateProduct, updateRMA, updateReview, updateShippingRule, updateSiteConfig, updateTaxRule, user, userRoleSlug, viewingCustomer } = ctx;
  return (
    <>
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
              dateFilterKey="createdAt"
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
                
                { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt || item.date || item.subscribedAt || item.sentAt || new Date().toISOString()), className: 'text-primary/60 text-sm', sortable: true }
              ]}
              />
            </div>
          </div>
        )}
    </>
  );
}
