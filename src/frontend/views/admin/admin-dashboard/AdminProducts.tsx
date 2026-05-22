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
import { StockBar } from '../../../components/ui/StockBar';

import { AdminFlashSales } from '../AdminFlashSales';
import { AdminLookbooks } from '../AdminLookbooks';
import { AdminPortfolios } from '../AdminPortfolios';

export function AdminProducts({ ctx }: { ctx: any }) {
  const { ABANDONED_CARTS, ANALYTICS, BLOG_POSTS, CATEGORIES, CATEGORY_DISTRIBUTION, CHAT_MESSAGES, CITIES, CONVERSATIONS, COUPONS, CUSTOMER_GROUPS, DEVICE_DATA, EMAILS, EXPENSES, FAQS, LOGIN_LOGS, LOOKBOOK_POSTS, NAV_ITEMS, NOTIFICATIONS, ORDERS, PACKS, PRODUCTS, PROMO_EVENTS, PUSH_NOTIFICATIONS, REQUEST_LOGS, RETENTION_DATA, REVENUE_BY_PAYMENT, REVIEWS, SALES_DATA, SHIPPING_RULES, SUBSCRIBERS, TAX_RULES, TRAFFIC_SOURCES, USERS, activeMenuItem, activeTab, addBlogPost, addCatalogRule, addCategory, addCity, addCoupon, addCurrency, addCustomerGroup, addEvent, addExpense, addFAQ, addLocalRole, addLookbook, addNavItem, addPack, addProduct, addRMA, addReview, addShippingRule, addTaxRule, allOrders, averageOrderValue, catalogRulesWithDefaults, categoryPage, currentImage, currentSlug, currentUserDoc, customerDetailTab, customerFilter, deleteAbandonedCart, deleteCatalogRule, deleteCategory, deleteChatMessage, deleteCity, deleteConversation, deleteCoupon, deleteCurrency, deleteCustomerGroup, deleteEvent, deleteFAQ, deleteLocalRole, deleteLoginLog, deleteNavItem, deleteNotification, deleteOrder, deletePack, deleteProduct, deleteRequestLog, deleteReview, deleteShippingRule, deleteSiteConfig, deleteSubscriber, deleteTaxRule, deleteUser, editedOrder, editingItem, events, fetchedProducts, filteredMenuItems, formatDate, handleDeleteCatalogRule, handleDeleteCity, handleDeleteEvent, handleDeleteFAQ, handleEditCatalogRule, handleEditCity, handleEditCoupon, handleEditEvent, handleEditFAQ, handleFormSubmit, handleNotificationClick, handleSaveCatalogRule, handleSaveCity, handleSaveCoupon, handleSaveEvent, handleSaveFAQ, handleSearch, handleSeed, handleSendMessage, hasPermission, isAddModalOpen, isAuthLoading, isCatalogRuleEditorOpen, isCityEditorOpen, isCouponEditorOpen, isDataLoading, isEditingOrder, isEventEditorOpen, isFAQEditorOpen, isLoadingAbandoned, isLoadingBlog, isLoadingCatalog, isLoadingCategories, isLoadingCategoryDist, isLoadingDevice, isLoadingEmails, isLoadingExpenses, isLoadingGroups, isLoadingLookbook, isLoadingOrders, isLoadingPacks, isLoadingProducts, isLoadingPush, isLoadingRetention, isLoadingRevenue, isLoadingReviews, isLoadingRoles, isLoadingShipping, isLoadingSubscribers, isLoadingTax, isLoadingTraffic, isLogsLoading, isSaving, isSidebarOpen, isSuperAdmin, isTabAllowed, isUserCustomer, itemsPerPage, localAbandonedCarts, localBlogPosts, localCatalogPriceRules, localCategories, localCurrencies, localCustomerGroups, localExpenses, localLookbook, localNavItems, localOrders, localPacks, localProducts, localRMAs, localReviews, localRoles, localShippingRules, localSystemNotifications, localTaxRules, localUsers, logFilter, menuItems, messageInput, modalType, navItemsWithDefaults, newNote, newRMANote, notificationFilter, notificationPage, onNavigate, orderFilter, overviewOrderFilter, permissions, productFilter, propSetSiteConfig, propSiteConfig, rawSiteConfig, realLogs, requestLogFilter, reviewFilter, roleData, saveAllSiteConfig, saveSiteSection, searchResults, selectedCatalogRule, selectedCity, selectedConversation, selectedCoupon, selectedCustomer, selectedCustomerGroup, selectedEvent, selectedFAQ, selectedOrder, selectedPackProducts, setActiveTab, setCategoryPage, setCurrentImage, setCurrentSlug, setCustomerDetailTab, setCustomerFilter, setEditedOrder, setEditingItem, setEvents, setIsAddModalOpen, setIsCatalogRuleEditorOpen, setIsCityEditorOpen, setIsCouponEditorOpen, setIsEditingOrder, setIsEventEditorOpen, setIsFAQEditorOpen, setIsSaving, setIsSidebarOpen, setLocalAbandonedCarts, setLocalAbandonedCarts2, setLocalBlogPosts, setLocalBlogPosts2, setLocalCategories, setLocalCurrencies, setLocalCustomerGroups, setLocalCustomerGroups2, setLocalEmails, setLocalExpenses, setLocalLookbook, setLocalLookbook2, setLocalOrders, setLocalPacks, setLocalProducts, setLocalPushNotifications, setLocalReviews, setLocalReviews2, setLocalRole, setLocalRoles, setLocalShippingRules, setLocalShippingRules2, setLocalSubscribers, setLocalSystemNotifications, setLocalTaxRules, setLocalTaxRules2, setLocalUser, setLocalUsers, setLogFilter, setMessageInput, setModalType, setNewNote, setNewRMANote, setNotificationFilter, setNotificationPage, setOrderFilter, setOverviewOrderFilter, setProductFilter, setRequestLogFilter, setReviewFilter, setSearchResults, setSelectedCatalogRule, setSelectedCity, setSelectedConversation, setSelectedCoupon, setSelectedCustomer, setSelectedCustomerGroup, setSelectedEvent, setSelectedFAQ, setSelectedOrder, setSelectedPackProducts, setShowNotifications, setSiteConfig, setViewingCustomer, showNotifications, siteConfig, siteConfigs, sortByDate, stats, totalCustomers, totalOrdersCount, totalSales, totalVisitors, updateBlogPost, updateCatalogRule, updateCategory, updateCity, updateCoupon, updateCurrency, updateCustomerGroup, updateEvent, updateExpense, updateFAQ, updateLocalRole, updateLocalUser, updateLookbook, updateNavItem, updatePack, updateProduct, updateRMA, updateReview, updateShippingRule, updateSiteConfig, updateTaxRule, user, userRoleSlug, viewingCustomer } = ctx;
  return (
    <>
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
              dateFilterKey="createdAt"
              data={sortByDate(localProducts.filter(p => {
                  if (productFilter === 'all') return true;
                  if (productFilter === 'stock_low') return p.stock < 10 && p.stock > 0;
                  if (productFilter === 'stock_out') return p.stock === 0;
                  return p.category === productFilter;
              }))}
              onRowClick={(p) => { setEditingItem(p); setActiveTab('product-edit'); }}
              onDelete={(item) => deleteProduct(item.id!)}
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
                    <div className="flex flex-col gap-1" onClick={e => e.stopPropagation()}>
                      <span className="font-bold text-primary text-sm">{product.stock || 0} p.</span>
                      <select 
                        value={product.in_stock ? 'in' : 'out'} 
                        onChange={(e) => {
                          const in_stock = e.target.value === 'in';
                          updateProduct(product.id, { in_stock });
                          setLocalProducts(prev => prev.map(p => p.id === product.id ? { ...p, in_stock } : p));
                          toast.success(`Statut stock mis à jour: ${in_stock ? 'En stock' : 'En rupture'}`);
                        }}
                        className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-full outline-none cursor-pointer w-24 text-center",
                          product.in_stock ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                        )}
                      >
                        <option value="in">En stock</option>
                        <option value="out">En rupture</option>
                      </select>
                    </div>
                  ),
                  exportValue: (product: Product) => String(product.stock),
                  sortable: true,
                  sortKey: 'stock'
                },
                { header: 'Créé le', accessor: (p: Product) => formatDate(p.createdAt), className: 'text-primary/60 text-sm', sortable: true },
                {
                  header: 'Statut',
                  accessor: (product: Product) => (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const newAvailable = !product.isAvailable;
                        updateProduct(product.id, { isAvailable: newAvailable });
                        setLocalProducts(prev => prev.map(p => p.id === product.id ? { ...p, isAvailable: newAvailable } : p));
                        toast.success(newAvailable ? 'Produit activé' : 'Produit désactivé');
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
                        onClick={(e) => { e.stopPropagation(); setEditingItem(product); setActiveTab('product-edit'); }}
                        className="p-2 text-primary/60 hover:text-primary transition-colors"
                      >
                        <Settings size={16} />
                      </button>
                    </div>
                  )
                }
              ]}
            />
          </div>
        )}
    </>
  );
}
