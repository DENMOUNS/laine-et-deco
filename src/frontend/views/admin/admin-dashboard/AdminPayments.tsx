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

export function AdminPayments({ ctx }: { ctx: any }) {
  const { ABANDONED_CARTS, ANALYTICS, BLOG_POSTS, CATEGORIES, CATEGORY_DISTRIBUTION, CHAT_MESSAGES, CITIES, CONVERSATIONS, COUPONS, CUSTOMER_GROUPS, DEVICE_DATA, EMAILS, EXPENSES, FAQS, LOGIN_LOGS, LOOKBOOK_POSTS, NAV_ITEMS, NOTIFICATIONS, ORDERS, PACKS, PRODUCTS, PROMO_EVENTS, PUSH_NOTIFICATIONS, REQUEST_LOGS, RETENTION_DATA, REVENUE_BY_PAYMENT, REVIEWS, SALES_DATA, SHIPPING_RULES, SUBSCRIBERS, TAX_RULES, TRAFFIC_SOURCES, USERS, activeMenuItem, activeTab, addBlogPost, addCatalogRule, addCategory, addCity, addCoupon, addCurrency, addCustomerGroup, addEvent, addExpense, addFAQ, addLocalRole, addLookbook, addNavItem, addPack, addProduct, addRMA, addReview, addShippingRule, addTaxRule, allOrders, averageOrderValue, catalogRulesWithDefaults, categoryPage, currentImage, currentSlug, currentUserDoc, customerDetailTab, customerFilter, deleteAbandonedCart, deleteCatalogRule, deleteCategory, deleteChatMessage, deleteCity, deleteConversation, deleteCoupon, deleteCurrency, deleteCustomerGroup, deleteEvent, deleteFAQ, deleteLocalRole, deleteLoginLog, deleteNavItem, deleteNotification, deleteOrder, deletePack, deleteProduct, deleteRequestLog, deleteReview, deleteShippingRule, deleteSiteConfig, deleteSubscriber, deleteTaxRule, deleteUser, editedOrder, editingItem, events, fetchedProducts, filteredMenuItems, formatDate, handleDeleteCatalogRule, handleDeleteCity, handleDeleteEvent, handleDeleteFAQ, handleEditCatalogRule, handleEditCity, handleEditCoupon, handleEditEvent, handleEditFAQ, handleFormSubmit, handleNotificationClick, handleSaveCatalogRule, handleSaveCity, handleSaveCoupon, handleSaveEvent, handleSaveFAQ, handleSearch, handleSeed, handleSendMessage, hasPermission, isAddModalOpen, isAuthLoading, isCatalogRuleEditorOpen, isCityEditorOpen, isCouponEditorOpen, isDataLoading, isEditingOrder, isEventEditorOpen, isFAQEditorOpen, isLoadingAbandoned, isLoadingBlog, isLoadingCatalog, isLoadingCategories, isLoadingCategoryDist, isLoadingDevice, isLoadingEmails, isLoadingExpenses, isLoadingGroups, isLoadingLookbook, isLoadingOrders, isLoadingPacks, isLoadingProducts, isLoadingPush, isLoadingRetention, isLoadingRevenue, isLoadingReviews, isLoadingRoles, isLoadingShipping, isLoadingSubscribers, isLoadingTax, isLoadingTraffic, isLogsLoading, isSaving, isSidebarOpen, isSuperAdmin, isTabAllowed, isUserCustomer, itemsPerPage, localAbandonedCarts, localBlogPosts, localCatalogPriceRules, localCategories, localCurrencies, localCustomerGroups, localExpenses, localLookbook, localNavItems, localOrders, localPacks, localProducts, localRMAs, localReviews, localRoles, localShippingRules, localSystemNotifications, localTaxRules, localUsers, logFilter, menuItems, messageInput, modalType, navItemsWithDefaults, newNote, newRMANote, notificationFilter, notificationPage, onNavigate, orderFilter, overviewOrderFilter, permissions, productFilter, propSetSiteConfig, propSiteConfig, rawSiteConfig, realLogs, requestLogFilter, reviewFilter, roleData, saveAllSiteConfig, saveSiteSection, searchResults, selectedCatalogRule, selectedCity, selectedConversation, selectedCoupon, selectedCustomer, selectedCustomerGroup, selectedEvent, selectedFAQ, selectedOrder, selectedPackProducts, setActiveTab, setCategoryPage, setCurrentImage, setCurrentSlug, setCustomerDetailTab, setCustomerFilter, setEditedOrder, setEditingItem, setEvents, setIsAddModalOpen, setIsCatalogRuleEditorOpen, setIsCityEditorOpen, setIsCouponEditorOpen, setIsEditingOrder, setIsEventEditorOpen, setIsFAQEditorOpen, setIsSaving, setIsSidebarOpen, setLocalAbandonedCarts, setLocalAbandonedCarts2, setLocalBlogPosts, setLocalBlogPosts2, setLocalCategories, setLocalCurrencies, setLocalCustomerGroups, setLocalCustomerGroups2, setLocalEmails, setLocalExpenses, setLocalLookbook, setLocalLookbook2, setLocalOrders, setLocalPacks, setLocalProducts, setLocalPushNotifications, setLocalReviews, setLocalReviews2, setLocalRole, setLocalRoles, setLocalShippingRules, setLocalShippingRules2, setLocalSubscribers, setLocalSystemNotifications, setLocalTaxRules, setLocalTaxRules2, setLocalUser, setLocalUsers, setLogFilter, setMessageInput, setModalType, setNewNote, setNewRMANote, setNotificationFilter, setNotificationPage, setOrderFilter, setOverviewOrderFilter, setProductFilter, setRequestLogFilter, setReviewFilter, setSearchResults, setSelectedCatalogRule, setSelectedCity, setSelectedConversation, setSelectedCoupon, setSelectedCustomer, setSelectedCustomerGroup, setSelectedEvent, setSelectedFAQ, setSelectedOrder, setSelectedPackProducts, setShowNotifications, setSiteConfig, setViewingCustomer, showNotifications, siteConfig, siteConfigs, sortByDate, stats, totalCustomers, totalOrdersCount, totalSales, totalVisitors, updateBlogPost, updateCatalogRule, updateCategory, updateCity, updateCoupon, updateCurrency, updateCustomerGroup, updateEvent, updateExpense, updateFAQ, updateLocalRole, updateLocalUser, updateLookbook, updateNavItem, updatePack, updateProduct, updateRMA, updateReview, updateShippingRule, updateSiteConfig, updateTaxRule, user, userRoleSlug, viewingCustomer } = ctx;
  return (
    <>
      {activeTab === 'payments' && (
          <div className="space-y-10">
            {/* Financial Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[
                { 
                  label: "Chiffre d'Affaires", 
                  value: localOrders.reduce((acc, o) => acc + o.total, 0), 
                  color: "text-primary",
                  icon: <TrendingUp size={20} />
                },
                { 
                  label: "Bénéfice Net (Estimé)", 
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
                { 
                  label: "Panier Moyen", 
                  value: localOrders.length > 0 ? Math.round(localOrders.reduce((acc, o) => acc + o.total, 0) / localOrders.length) : 0, 
                  color: "text-primary/80",
                  icon: <ShoppingBag size={20} />
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Flux de Trésorerie */}
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
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#10b981" strokeOpacity={0.05} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--primary)', fontSize: 12, opacity: 0.6}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--primary)', fontSize: 12, opacity: 0.6}} tickFormatter={(val) => `${val/1000}k`} />
                      <Tooltip cursor={{fill: 'var(--secondary)'}} contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '16px', border: '1px solid var(--primary-10)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar dataKey="revenus" name="Revenus" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                      <Bar dataKey="depenses" name="Dépenses" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Revenue by Payment Method */}
              <div className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
                <h3 className="text-xl font-serif font-bold mb-6 text-primary">Répartition par Paiement</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={REVENUE_BY_PAYMENT}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {REVENUE_BY_PAYMENT.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : index === 1 ? "#6366f1" : "#f59e0b"} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #f3f4f6' }}
                        formatter={(value: number) => [`${value}%`, 'Part']} 
                      />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Currencies Management */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif text-primary">Gestion des Devises</h3>
                <button 
                  onClick={() => { setModalType('currency'); setIsAddModalOpen(true); }}
                  className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-md"
                >
                  <Plus size={18} /> Ajouter une devise
                </button>
              </div>
              <DataTable<Currency>
                data={localCurrencies}
                columns={[
                  { header: 'Code', accessor: 'code', className: 'font-bold text-primary' },
                  { header: 'Nom', accessor: 'name' },
                  { header: 'Symbole', accessor: 'symbol', className: 'text-center' },
                  { header: 'Taux (vs FCFA)', accessor: (c) => `1 ${c.code} = ${c.rate.toLocaleString()} FCFA`, className: 'text-right' },
                  { 
                    header: 'Statut', 
                    accessor: (c) => (
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${c.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-red-100 text-red-600'}`}>
                        {c.status === 'active' ? 'Actif' : 'Inactif'}
                      </span>
                    )
                  },
                  {
                    header: 'Actions',
                    accessor: (c) => (
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingItem(c); setModalType('currency'); setIsAddModalOpen(true); }} className="p-2 text-primary/60 hover:text-primary transition-colors"><Settings size={16} /></button>
                        <button onClick={() => { deleteCurrency(c.id!); toast.success('Devise supprimée'); }} className="p-2 text-primary/60 hover:text-accent transition-colors"><Trash2 size={16} /></button>
                      </div>
                    )
                  }
                ]}
              />
            </div>
          </div>
        )}
    </>
  );
}
