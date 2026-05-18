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

export function AdminExpenses({ ctx }: { ctx: any }) {
  const { ABANDONED_CARTS, ANALYTICS, BLOG_POSTS, CATEGORIES, CATEGORY_DISTRIBUTION, CHAT_MESSAGES, CITIES, CONVERSATIONS, COUPONS, CUSTOMER_GROUPS, DEVICE_DATA, EMAILS, EXPENSES, FAQS, LOGIN_LOGS, LOOKBOOK_POSTS, NAV_ITEMS, NOTIFICATIONS, ORDERS, PACKS, PRODUCTS, PROMO_EVENTS, PUSH_NOTIFICATIONS, REQUEST_LOGS, RETENTION_DATA, REVENUE_BY_PAYMENT, REVIEWS, SALES_DATA, SHIPPING_RULES, SUBSCRIBERS, TAX_RULES, TRAFFIC_SOURCES, USERS, activeMenuItem, activeTab, addBlogPost, addCatalogRule, addCategory, addCity, addCoupon, addCurrency, addCustomerGroup, addEvent, addExpense, addFAQ, addLocalRole, addLookbook, addNavItem, addPack, addProduct, addRMA, addReview, addShippingRule, addTaxRule, allOrders, averageOrderValue, catalogRulesWithDefaults, categoryPage, currentImage, currentSlug, currentUserDoc, customerDetailTab, customerFilter, deleteAbandonedCart, deleteCatalogRule, deleteCategory, deleteChatMessage, deleteCity, deleteConversation, deleteCoupon, deleteCurrency, deleteCustomerGroup, deleteEvent, deleteFAQ, deleteLocalRole, deleteLoginLog, deleteNavItem, deleteNotification, deleteOrder, deletePack, deleteProduct, deleteRequestLog, deleteReview, deleteShippingRule, deleteSiteConfig, deleteSubscriber, deleteTaxRule, deleteUser, editedOrder, editingItem, events, fetchedProducts, filteredMenuItems, formatDate, handleDeleteCatalogRule, handleDeleteCity, handleDeleteEvent, handleDeleteFAQ, handleEditCatalogRule, handleEditCity, handleEditCoupon, handleEditEvent, handleEditFAQ, handleFormSubmit, handleNotificationClick, handleSaveCatalogRule, handleSaveCity, handleSaveCoupon, handleSaveEvent, handleSaveFAQ, handleSearch, handleSeed, handleSendMessage, hasPermission, isAddModalOpen, isAuthLoading, isCatalogRuleEditorOpen, isCityEditorOpen, isCouponEditorOpen, isDataLoading, isEditingOrder, isEventEditorOpen, isFAQEditorOpen, isLoadingAbandoned, isLoadingBlog, isLoadingCatalog, isLoadingCategories, isLoadingCategoryDist, isLoadingDevice, isLoadingEmails, isLoadingExpenses, isLoadingGroups, isLoadingLookbook, isLoadingOrders, isLoadingPacks, isLoadingProducts, isLoadingPush, isLoadingRetention, isLoadingRevenue, isLoadingReviews, isLoadingRoles, isLoadingShipping, isLoadingSubscribers, isLoadingTax, isLoadingTraffic, isLogsLoading, isSaving, isSidebarOpen, isSuperAdmin, isTabAllowed, isUserCustomer, itemsPerPage, localAbandonedCarts, localBlogPosts, localCatalogPriceRules, localCategories, localCurrencies, localCustomerGroups, localExpenses, localLookbook, localNavItems, localOrders, localPacks, localProducts, localRMAs, localReviews, localRoles, localShippingRules, localSystemNotifications, localTaxRules, localUsers, logFilter, menuItems, messageInput, modalType, navItemsWithDefaults, newNote, newRMANote, notificationFilter, notificationPage, onNavigate, orderFilter, overviewOrderFilter, permissions, productFilter, propSetSiteConfig, propSiteConfig, rawSiteConfig, realLogs, requestLogFilter, reviewFilter, roleData, saveAllSiteConfig, saveSiteSection, searchResults, selectedCatalogRule, selectedCity, selectedConversation, selectedCoupon, selectedCustomer, selectedCustomerGroup, selectedEvent, selectedFAQ, selectedOrder, selectedPackProducts, setActiveTab, setCategoryPage, setCurrentImage, setCurrentSlug, setCustomerDetailTab, setCustomerFilter, setEditedOrder, setEditingItem, setEvents, setIsAddModalOpen, setIsCatalogRuleEditorOpen, setIsCityEditorOpen, setIsCouponEditorOpen, setIsEditingOrder, setIsEventEditorOpen, setIsFAQEditorOpen, setIsSaving, setIsSidebarOpen, setLocalAbandonedCarts, setLocalAbandonedCarts2, setLocalBlogPosts, setLocalBlogPosts2, setLocalCategories, setLocalCurrencies, setLocalCustomerGroups, setLocalCustomerGroups2, setLocalEmails, setLocalExpenses, setLocalLookbook, setLocalLookbook2, setLocalOrders, setLocalPacks, setLocalProducts, setLocalPushNotifications, setLocalReviews, setLocalReviews2, setLocalRole, setLocalRoles, setLocalShippingRules, setLocalShippingRules2, setLocalSubscribers, setLocalSystemNotifications, setLocalTaxRules, setLocalTaxRules2, setLocalUser, setLocalUsers, setLogFilter, setMessageInput, setModalType, setNewNote, setNewRMANote, setNotificationFilter, setNotificationPage, setOrderFilter, setOverviewOrderFilter, setProductFilter, setRequestLogFilter, setReviewFilter, setSearchResults, setSelectedCatalogRule, setSelectedCity, setSelectedConversation, setSelectedCoupon, setSelectedCustomer, setSelectedCustomerGroup, setSelectedEvent, setSelectedFAQ, setSelectedOrder, setSelectedPackProducts, setShowNotifications, setSiteConfig, setViewingCustomer, showNotifications, siteConfig, siteConfigs, sortByDate, stats, totalCustomers, totalOrdersCount, totalSales, totalVisitors, updateBlogPost, updateCatalogRule, updateCategory, updateCity, updateCoupon, updateCurrency, updateCustomerGroup, updateEvent, updateExpense, updateFAQ, updateLocalRole, updateLocalUser, updateLookbook, updateNavItem, updatePack, updateProduct, updateRMA, updateReview, updateShippingRule, updateSiteConfig, updateTaxRule, user, userRoleSlug, viewingCustomer } = ctx;
  return (
    <>
      {activeTab === 'expenses' && (
          <div className="space-y-10">
            {/* Expense Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { 
                  label: "Dépenses Totales", 
                  value: localExpenses.reduce((acc, e) => acc + e.amount, 0), 
                  color: "text-primary/80",
                  icon: <ArrowDownRight size={20} />
                },
                { 
                  label: "Coût d'Achat Stock", 
                  value: localExpenses.filter(e => e.category === 'stock').reduce((acc, e) => acc + e.amount, 0), 
                  color: "text-primary/60",
                  icon: <Package size={20} />
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
              dateFilterKey="createdAt"
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
                  }
              ]}
              />
            </div>

            {/* Breakdown Chart */}
            <div className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
              <h3 className="text-xl font-serif mb-8 text-primary">Répartition des Dépenses</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Stock', value: localExpenses.filter(e => e.category === 'stock').reduce((acc, e) => acc + e.amount, 0) },
                    { name: 'Transport', value: localExpenses.filter(e => e.category === 'transport').reduce((acc, e) => acc + e.amount, 0) },
                    { name: 'Marketing', value: localExpenses.filter(e => e.category === 'marketing').reduce((acc, e) => acc + e.amount, 0) },
                    { name: 'Autre', value: localExpenses.filter(e => e.category === 'other').reduce((acc, e) => acc + e.amount, 0) },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#10b981" strokeOpacity={0.1} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--primary)', fillOpacity: 0.6, fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--primary)', fillOpacity: 0.6, fontSize: 12}} />
                    <Tooltip 
                      cursor={{fill: 'var(--secondary)', fillOpacity: 0.5}}
                      contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '16px', border: '1px solid var(--primary-10)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: 'var(--primary)' }}
                      formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'Montant']}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                      {[
                        { name: 'Stock', color: '#10b981' },
                        { name: 'Transport', color: '#6366f1' },
                        { name: 'Marketing', color: '#f59e0b' },
                        { name: 'Autre', color: '#ef4444' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
