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

export function AdminSearchResults({ ctx }: { ctx: any }) {
  const { ABANDONED_CARTS, ANALYTICS, BLOG_POSTS, CATEGORIES, CATEGORY_DISTRIBUTION, CHAT_MESSAGES, CITIES, CONVERSATIONS, COUPONS, CUSTOMER_GROUPS, DEVICE_DATA, EMAILS, EXPENSES, FAQS, LOGIN_LOGS, LOOKBOOK_POSTS, NAV_ITEMS, NOTIFICATIONS, ORDERS, PACKS, PRODUCTS, PROMO_EVENTS, PUSH_NOTIFICATIONS, REQUEST_LOGS, RETENTION_DATA, REVENUE_BY_PAYMENT, REVIEWS, SALES_DATA, SHIPPING_RULES, SUBSCRIBERS, TAX_RULES, TRAFFIC_SOURCES, USERS, activeMenuItem, activeTab, addBlogPost, addCatalogRule, addCategory, addCity, addCoupon, addCurrency, addCustomerGroup, addEvent, addExpense, addFAQ, addLocalRole, addLookbook, addNavItem, addPack, addProduct, addRMA, addReview, addShippingRule, addTaxRule, allOrders, averageOrderValue, catalogRulesWithDefaults, categoryPage, currentImage, currentSlug, currentUserDoc, customerDetailTab, customerFilter, deleteAbandonedCart, deleteCatalogRule, deleteCategory, deleteChatMessage, deleteCity, deleteConversation, deleteCoupon, deleteCurrency, deleteCustomerGroup, deleteEvent, deleteFAQ, deleteLocalRole, deleteLoginLog, deleteNavItem, deleteNotification, deleteOrder, deletePack, deleteProduct, deleteRequestLog, deleteReview, deleteShippingRule, deleteSiteConfig, deleteSubscriber, deleteTaxRule, deleteUser, editedOrder, editingItem, events, fetchedProducts, filteredMenuItems, formatDate, handleDeleteCatalogRule, handleDeleteCity, handleDeleteEvent, handleDeleteFAQ, handleEditCatalogRule, handleEditCity, handleEditCoupon, handleEditEvent, handleEditFAQ, handleFormSubmit, handleNotificationClick, handleSaveCatalogRule, handleSaveCity, handleSaveCoupon, handleSaveEvent, handleSaveFAQ, handleSearch, handleSeed, handleSendMessage, hasPermission, isAddModalOpen, isAuthLoading, isCatalogRuleEditorOpen, isCityEditorOpen, isCouponEditorOpen, isDataLoading, isEditingOrder, isEventEditorOpen, isFAQEditorOpen, isLoadingAbandoned, isLoadingBlog, isLoadingCatalog, isLoadingCategories, isLoadingCategoryDist, isLoadingDevice, isLoadingEmails, isLoadingExpenses, isLoadingGroups, isLoadingLookbook, isLoadingOrders, isLoadingPacks, isLoadingProducts, isLoadingPush, isLoadingRetention, isLoadingRevenue, isLoadingReviews, isLoadingRoles, isLoadingShipping, isLoadingSubscribers, isLoadingTax, isLoadingTraffic, isLogsLoading, isSaving, isSidebarOpen, isSuperAdmin, isTabAllowed, isUserCustomer, itemsPerPage, localAbandonedCarts, localBlogPosts, localCatalogPriceRules, localCategories, localCurrencies, localCustomerGroups, localExpenses, localLookbook, localNavItems, localOrders, localPacks, localProducts, localRMAs, localReviews, localRoles, localShippingRules, localSystemNotifications, localTaxRules, localUsers, logFilter, menuItems, messageInput, modalType, navItemsWithDefaults, newNote, newRMANote, notificationFilter, notificationPage, onNavigate, orderFilter, overviewOrderFilter, permissions, productFilter, propSetSiteConfig, propSiteConfig, rawSiteConfig, realLogs, requestLogFilter, reviewFilter, roleData, saveAllSiteConfig, saveSiteSection, searchResults, selectedCatalogRule, selectedCity, selectedConversation, selectedCoupon, selectedCustomer, selectedCustomerGroup, selectedEvent, selectedFAQ, selectedOrder, selectedPackProducts, setActiveTab, setCategoryPage, setCurrentImage, setCurrentSlug, setCustomerDetailTab, setCustomerFilter, setEditedOrder, setEditingItem, setEvents, setIsAddModalOpen, setIsCatalogRuleEditorOpen, setIsCityEditorOpen, setIsCouponEditorOpen, setIsEditingOrder, setIsEventEditorOpen, setIsFAQEditorOpen, setIsSaving, setIsSidebarOpen, setLocalAbandonedCarts, setLocalAbandonedCarts2, setLocalBlogPosts, setLocalBlogPosts2, setLocalCategories, setLocalCurrencies, setLocalCustomerGroups, setLocalCustomerGroups2, setLocalEmails, setLocalExpenses, setLocalLookbook, setLocalLookbook2, setLocalOrders, setLocalPacks, setLocalProducts, setLocalPushNotifications, setLocalReviews, setLocalReviews2, setLocalRole, setLocalRoles, setLocalShippingRules, setLocalShippingRules2, setLocalSubscribers, setLocalSystemNotifications, setLocalTaxRules, setLocalTaxRules2, setLocalUser, setLocalUsers, setLogFilter, setMessageInput, setModalType, setNewNote, setNewRMANote, setNotificationFilter, setNotificationPage, setOrderFilter, setOverviewOrderFilter, setProductFilter, setRequestLogFilter, setReviewFilter, setSearchResults, setSelectedCatalogRule, setSelectedCity, setSelectedConversation, setSelectedCoupon, setSelectedCustomer, setSelectedCustomerGroup, setSelectedEvent, setSelectedFAQ, setSelectedOrder, setSelectedPackProducts, setShowNotifications, setSiteConfig, setViewingCustomer, showNotifications, siteConfig, siteConfigs, sortByDate, stats, totalCustomers, totalOrdersCount, totalSales, totalVisitors, updateBlogPost, updateCatalogRule, updateCategory, updateCity, updateCoupon, updateCurrency, updateCustomerGroup, updateEvent, updateExpense, updateFAQ, updateLocalRole, updateLocalUser, updateLookbook, updateNavItem, updatePack, updateProduct, updateRMA, updateReview, updateShippingRule, updateSiteConfig, updateTaxRule, user, userRoleSlug, viewingCustomer } = ctx;
  return (
    <>
      {activeTab === 'search-results' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold">Résultats de recherche ({searchResults.length})</h2>
              <button 
                onClick={() => setActiveTab('overview')} 
                className="text-primary/60 hover:text-primary transition-colors flex items-center gap-2"
              >
                <X size={18} /> Fermer
              </button>
            </div>
            
            {searchResults.length === 0 ? (
              <div className="text-center py-24 bg-card rounded-[3rem] border border-primary/10">
                <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/5">
                  <Search size={32} className="text-primary/30" />
                </div>
                <h3 className="text-xl font-serif font-bold text-primary mb-2">Aucun résultat trouvé</h3>
                <p className="text-primary/60">Essayez avec un autre terme de recherche.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map(item => {
                  if (item._searchType === 'product') {
                    return (
                      <div 
                        key={item.id} 
                        onClick={() => onNavigate('admin-product-detail', item.id)}
                        className="bg-card p-4 rounded-[2rem] border border-primary/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group"
                      >
                        <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-secondary/50 relative border border-primary/5">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                          <div className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-primary shadow-sm border border-primary/10">
                            Produit
                          </div>
                        </div>
                        <div className="space-y-2 px-2 pb-2">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-primary group-hover:text-primary transition-colors line-clamp-1">{item.name}</h3>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-primary font-mono">{item.price.toLocaleString()} FCFA</span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${item.stock > 0 ? 'bg-primary/10 text-primary' : 'bg-secondary/50 text-primary/40 border border-primary/5'}`}>
                              {item.stock > 0 ? 'En stock' : 'Rupture'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  if (item._searchType === 'order') {
                    return (
                      <div 
                        key={item.id} 
                        onClick={() => {
                          setSelectedOrder(item);
                          setActiveTab('order-detail');
                        }}
                        className="bg-card p-6 rounded-[2rem] border border-primary/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                            <ShoppingBag size={24} />
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                            item.status === 'completed' ? 'bg-primary/10 text-primary' :
                            item.status === 'pending' ? 'bg-accent/20 text-accent' :
                            'bg-primary/5 text-primary/70'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-primary mb-1">Commande {item.id}</h3>
                          <p className="text-sm text-primary/60 mb-4">{item.customerName}</p>
                          <div className="flex justify-between items-center pt-4 border-t border-primary/5">
                            <span className="text-xs text-primary/60">{item.date}</span>
                            <span className="font-bold text-primary font-mono">{item.total.toLocaleString()} FCFA</span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (item._searchType === 'user') {
                    return (
                      <div 
                        key={item.id} 
                        onClick={() => {
                          setActiveTab('customers');
                          setSelectedCustomer(item);
                        }}
                        className="bg-card p-6 rounded-[2rem] border border-primary/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group flex items-center gap-4"
                      >
                        <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center text-primary shrink-0 border border-primary/5">
                          <Users size={28} />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-primary truncate group-hover:text-primary transition-colors">{item.name}</h3>
                          <p className="text-sm text-primary/60 truncate">{item.email}</p>
                          <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-secondary/50 text-primary/60 rounded-lg border border-primary/5">
                            {item.role}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  
                  return null;
                })}
              </div>
            )}
          </div>
        )}
    </>
  );
}
