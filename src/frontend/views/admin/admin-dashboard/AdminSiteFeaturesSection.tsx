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



export function AdminSiteFeaturesSection({ ctx }: { ctx: any }) {
  const { ABANDONED_CARTS, ANALYTICS, BLOG_POSTS, CATEGORIES, CATEGORY_DISTRIBUTION, CHAT_MESSAGES, CITIES, CONVERSATIONS, COUPONS, CUSTOMER_GROUPS, DEVICE_DATA, EMAILS, EXPENSES, FAQS, LOGIN_LOGS, LOOKBOOK_POSTS, NAV_ITEMS, NOTIFICATIONS, ORDERS, PACKS, PRODUCTS, PROMO_EVENTS, PUSH_NOTIFICATIONS, REQUEST_LOGS, RETENTION_DATA, REVENUE_BY_PAYMENT, REVIEWS, SALES_DATA, SHIPPING_RULES, SUBSCRIBERS, TAX_RULES, TRAFFIC_SOURCES, USERS, activeMenuItem, activeTab, addBlogPost, addCatalogRule, addCategory, addCity, addCoupon, addCurrency, addCustomerGroup, addEvent, addExpense, addFAQ, addLocalRole, addLookbook, addNavItem, addPack, addProduct, addRMA, addReview, addShippingRule, addTaxRule, allOrders, averageOrderValue, catalogRulesWithDefaults, categoryPage, currentImage, currentSlug, currentUserDoc, customerDetailTab, customerFilter, deleteAbandonedCart, deleteCatalogRule, deleteCategory, deleteChatMessage, deleteCity, deleteConversation, deleteCoupon, deleteCurrency, deleteCustomerGroup, deleteEvent, deleteFAQ, deleteLocalRole, deleteLoginLog, deleteNavItem, deleteNotification, deleteOrder, deletePack, deleteProduct, deleteRequestLog, deleteReview, deleteShippingRule, deleteSiteConfig, deleteSubscriber, deleteTaxRule, deleteUser, editedOrder, editingItem, events, fetchedProducts, filteredMenuItems, formatDate, handleDeleteCatalogRule, handleDeleteCity, handleDeleteEvent, handleDeleteFAQ, handleEditCatalogRule, handleEditCity, handleEditCoupon, handleEditEvent, handleEditFAQ, handleFormSubmit, handleNotificationClick, handleSaveCatalogRule, handleSaveCity, handleSaveCoupon, handleSaveEvent, handleSaveFAQ, handleSearch, handleSeed, handleSendMessage, hasPermission, isAddModalOpen, isAuthLoading, isCatalogRuleEditorOpen, isCityEditorOpen, isCouponEditorOpen, isDataLoading, isEditingOrder, isEventEditorOpen, isFAQEditorOpen, isLoadingAbandoned, isLoadingBlog, isLoadingCatalog, isLoadingCategories, isLoadingCategoryDist, isLoadingDevice, isLoadingEmails, isLoadingExpenses, isLoadingGroups, isLoadingLookbook, isLoadingOrders, isLoadingPacks, isLoadingProducts, isLoadingPush, isLoadingRetention, isLoadingRevenue, isLoadingReviews, isLoadingRoles, isLoadingShipping, isLoadingSubscribers, isLoadingTax, isLoadingTraffic, isLogsLoading, isSaving, isSidebarOpen, isSuperAdmin, isTabAllowed, isUserCustomer, itemsPerPage, localAbandonedCarts, localBlogPosts, localCatalogPriceRules, localCategories, localCurrencies, localCustomerGroups, localExpenses, localLookbook, localNavItems, localOrders, localPacks, localProducts, localRMAs, localReviews, localRoles, localShippingRules, localSystemNotifications, localTaxRules, localUsers, logFilter, menuItems, messageInput, modalType, navItemsWithDefaults, newNote, newRMANote, notificationFilter, notificationPage, onNavigate, orderFilter, overviewOrderFilter, permissions, productFilter, propSetSiteConfig, propSiteConfig, rawSiteConfig, realLogs, requestLogFilter, reviewFilter, roleData, saveAllSiteConfig, saveSiteSection, searchResults, selectedCatalogRule, selectedCity, selectedConversation, selectedCoupon, selectedCustomer, selectedCustomerGroup, selectedEvent, selectedFAQ, selectedOrder, selectedPackProducts, setActiveTab, setCategoryPage, setCurrentImage, setCurrentSlug, setCustomerDetailTab, setCustomerFilter, setEditedOrder, setEditingItem, setEvents, setIsAddModalOpen, setIsCatalogRuleEditorOpen, setIsCityEditorOpen, setIsCouponEditorOpen, setIsEditingOrder, setIsEventEditorOpen, setIsFAQEditorOpen, setIsSaving, setIsSidebarOpen, setLocalAbandonedCarts, setLocalAbandonedCarts2, setLocalBlogPosts, setLocalBlogPosts2, setLocalCategories, setLocalCurrencies, setLocalCustomerGroups, setLocalCustomerGroups2, setLocalEmails, setLocalExpenses, setLocalLookbook, setLocalLookbook2, setLocalOrders, setLocalPacks, setLocalProducts, setLocalPushNotifications, setLocalReviews, setLocalReviews2, setLocalRole, setLocalRoles, setLocalShippingRules, setLocalShippingRules2, setLocalSubscribers, setLocalSystemNotifications, setLocalTaxRules, setLocalTaxRules2, setLocalUser, setLocalUsers, setLogFilter, setMessageInput, setModalType, setNewNote, setNewRMANote, setNotificationFilter, setNotificationPage, setOrderFilter, setOverviewOrderFilter, setProductFilter, setRequestLogFilter, setReviewFilter, setSearchResults, setSelectedCatalogRule, setSelectedCity, setSelectedConversation, setSelectedCoupon, setSelectedCustomer, setSelectedCustomerGroup, setSelectedEvent, setSelectedFAQ, setSelectedOrder, setSelectedPackProducts, setShowNotifications, setSiteConfig, setViewingCustomer, showNotifications, siteConfig, siteConfigs, sortByDate, stats, totalCustomers, totalOrdersCount, totalSales, totalVisitors, updateBlogPost, updateCatalogRule, updateCategory, updateCity, updateCoupon, updateCurrency, updateCustomerGroup, updateEvent, updateExpense, updateFAQ, updateLocalRole, updateLocalUser, updateLookbook, updateNavItem, updatePack, updateProduct, updateRMA, updateReview, updateShippingRule, updateSiteConfig, updateTaxRule, user, userRoleSlug, viewingCustomer } = ctx;

  const featureToggles = [
    { key: 'lookbook', title: 'Lookbook', description: 'Masque la page Lookbook et la section d’inspiration sur l’accueil.' },
    { key: 'blog', title: 'Blog', description: 'Masque le blog et ses articles publics.' },
    { key: 'about', title: 'À propos', description: 'Masque la page À propos et ses liens publics.' },
    { key: 'team', title: 'Équipe', description: 'Masque la page Équipe.' },
    { key: 'contact', title: 'Contact', description: 'Masque la page de contact.' },
    { key: 'faq', title: 'FAQ', description: 'Masque la page FAQ.' },
    { key: 'calculator', title: 'Calculateur de laine', description: 'Masque la page du calculateur.' },
    { key: 'volumeCalculator', title: 'Calculateur de volume', description: 'Masque la page du calculateur de volume.' },
    { key: 'knittingCompanion', title: 'Compagnon tricot', description: 'Masque la page Compagnon tricot.' },
    { key: 'patternGenerator', title: 'Générateur IA', description: 'Masque la page Générateur IA.' },
    { key: 'customOrder', title: 'Sur mesure', description: 'Masque la page Sur mesure.' },
    { key: 'comparison', title: 'Comparateur', description: 'Masque le comparateur et ses liens publics.' },
    { key: 'wishlist', title: 'Liste de souhaits', description: 'Masque la wishlist et ses liens publics.' },
    { key: 'community', title: 'Communauté', description: 'Masque la page communauté.' },
  ];

  return (
    <>
<section className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
               <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/5 text-primary rounded-2xl"><Award size={24} /></div>
                  <div>
                    <h3 className="text-xl font-serif text-primary">Fonctionnalités publiques</h3>
                    <p className="text-xs text-primary/60">Activez ou désactivez les pages et modules visibles côté client</p>
                  </div>
                </div>
                <button 
                  onClick={() => saveSiteSection(['featureFlags'], 'Fonctionnalités publiques')}
                  className="px-4 py-2 bg-secondary text-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/5 transition-colors"
                >
                  Enregistrer Section
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                {featureToggles.map((feature) => {
                  const isEnabled = siteConfig.featureFlags?.[feature.key] ?? true;
                  return (
                    <label key={feature.key} className="flex items-start justify-between gap-4 rounded-3xl border border-primary/10 bg-secondary/20 p-4">
                      <div>
                        <p className="font-semibold text-primary">{feature.title}</p>
                        <p className="text-sm text-primary/60 mt-1">{feature.description}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => {
                          setSiteConfig((prev: any) => ({
                            ...prev,
                            featureFlags: {
                              ...(prev.featureFlags || {}),
                              [feature.key]: e.target.checked,
                            },
                          }));
                        }}
                        className="mt-1 h-5 w-5 rounded border-primary/30 text-accent focus:ring-accent"
                      />
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/5 text-primary rounded-2xl"><Award size={24} /></div>
                  <div>
                    <h3 className="text-xl font-serif text-primary">Pourquoi nous choisir ?</h3>
                    <p className="text-xs text-primary/60">Gérez les 4 points forts affichés sur la page d'accueil</p>
                  </div>
                </div>
                <button 
                  onClick={() => saveSiteSection(['features'], 'Pourquoi nous choisir')}
                  className="px-4 py-2 bg-secondary text-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/5 transition-colors"
                >
                  Enregistrer Section
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(siteConfig.features || [
                  { iconName: "Package", title: "Qualité Premium", description: "Laines 100% naturelles" },
                  { iconName: "Truck", title: "Livraison Rapide", description: "Offerte dès 200 000 FCFA" },
                  { iconName: "ShieldCheck", title: "Paiement Sécurisé", description: "Transaction 100% protégée" },
                  { iconName: "Heart", title: "Fait avec Amour", description: "Sélection artisanale" },
                ]).map((feature, index) => (
                  <div key={index} className="p-6 bg-secondary/30 rounded-3xl border border-primary/10 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Titre</label>
                         <input 
                           type="text" 
                           className="w-full px-4 py-2 bg-card border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-sm" 
                           value={feature.title}
                           onChange={(e) => {
                             const newFeatures = [...(siteConfig.features || [])];
                             if (newFeatures[index]) {
                               newFeatures[index].title = e.target.value;
                               setSiteConfig(prev => ({ ...prev, features: newFeatures }));
                             }
                           }}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Icône Lucide</label>
                         <input 
                           type="text" 
                           className="w-full px-4 py-2 bg-card border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-sm" 
                           value={feature.iconName}
                           onChange={(e) => {
                             const newFeatures = [...(siteConfig.features || [])];
                             if (newFeatures[index]) {
                               newFeatures[index].iconName = e.target.value;
                               setSiteConfig(prev => ({ ...prev, features: newFeatures }));
                             }
                           }}
                         />
                      </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Description</label>
                       <input 
                         type="text" 
                         className="w-full px-4 py-2 bg-card border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-sm" 
                         value={feature.description}
                         onChange={(e) => {
                           const newFeatures = [...(siteConfig.features || [])];
                           if (newFeatures[index]) {
                             newFeatures[index].description = e.target.value;
                             setSiteConfig(prev => ({ ...prev, features: newFeatures }));
                           }
                         }}
                       />
                    </div>
                  </div>
                ))}
              </div>
            </section>
    </>
  );
}
