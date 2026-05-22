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


export function AdminProductFormMainFields({ ctx }: { ctx: any }) {
  const { ABANDONED_CARTS, ANALYTICS, BLOG_POSTS, CATEGORIES, CATEGORY_DISTRIBUTION, CHAT_MESSAGES, CITIES, CONVERSATIONS, COUPONS, CUSTOMER_GROUPS, DEVICE_DATA, EMAILS, EXPENSES, FAQS, LOGIN_LOGS, LOOKBOOK_POSTS, NAV_ITEMS, NOTIFICATIONS, ORDERS, PACKS, PRODUCTS, PROMO_EVENTS, PUSH_NOTIFICATIONS, REQUEST_LOGS, RETENTION_DATA, REVENUE_BY_PAYMENT, REVIEWS, SALES_DATA, SHIPPING_RULES, SUBSCRIBERS, TAX_RULES, TRAFFIC_SOURCES, USERS, activeMenuItem, activeTab, addBlogPost, addCatalogRule, addCategory, addCity, addCoupon, addCurrency, addCustomerGroup, addEvent, addExpense, addFAQ, addLocalRole, addLookbook, addNavItem, addPack, addProduct, addRMA, addReview, addShippingRule, addTaxRule, allOrders, averageOrderValue, catalogRulesWithDefaults, categoryPage, currentImage, currentSlug, currentUserDoc, customerDetailTab, customerFilter, deleteAbandonedCart, deleteCatalogRule, deleteCategory, deleteChatMessage, deleteCity, deleteConversation, deleteCoupon, deleteCurrency, deleteCustomerGroup, deleteEvent, deleteFAQ, deleteLocalRole, deleteLoginLog, deleteNavItem, deleteNotification, deleteOrder, deletePack, deleteProduct, deleteRequestLog, deleteReview, deleteShippingRule, deleteSiteConfig, deleteSubscriber, deleteTaxRule, deleteUser, editedOrder, editingItem, events, fetchedProducts, filteredMenuItems, formatDate, handleDeleteCatalogRule, handleDeleteCity, handleDeleteEvent, handleDeleteFAQ, handleEditCatalogRule, handleEditCity, handleEditCoupon, handleEditEvent, handleEditFAQ, handleFormSubmit, handleNotificationClick, handleSaveCatalogRule, handleSaveCity, handleSaveCoupon, handleSaveEvent, handleSaveFAQ, handleSearch, handleSeed, handleSendMessage, hasPermission, isAddModalOpen, isAuthLoading, isCatalogRuleEditorOpen, isCityEditorOpen, isCouponEditorOpen, isDataLoading, isEditingOrder, isEventEditorOpen, isFAQEditorOpen, isLoadingAbandoned, isLoadingBlog, isLoadingCatalog, isLoadingCategories, isLoadingCategoryDist, isLoadingDevice, isLoadingEmails, isLoadingExpenses, isLoadingGroups, isLoadingLookbook, isLoadingOrders, isLoadingPacks, isLoadingProducts, isLoadingPush, isLoadingRetention, isLoadingRevenue, isLoadingReviews, isLoadingRoles, isLoadingShipping, isLoadingSubscribers, isLoadingTax, isLoadingTraffic, isLogsLoading, isSaving, isSidebarOpen, isSuperAdmin, isTabAllowed, isUserCustomer, itemsPerPage, localAbandonedCarts, localBlogPosts, localCatalogPriceRules, localCategories, localCurrencies, localCustomerGroups, localExpenses, localLookbook, localNavItems, localOrders, localPacks, localProducts, localRMAs, localReviews, localRoles, localShippingRules, localSystemNotifications, localTaxRules, localUsers, logFilter, menuItems, messageInput, modalType, navItemsWithDefaults, newNote, newRMANote, notificationFilter, notificationPage, onNavigate, orderFilter, overviewOrderFilter, permissions, productFilter, propSetSiteConfig, propSiteConfig, rawSiteConfig, realLogs, requestLogFilter, reviewFilter, roleData, saveAllSiteConfig, saveSiteSection, searchResults, selectedCatalogRule, selectedCity, selectedConversation, selectedCoupon, selectedCustomer, selectedCustomerGroup, selectedEvent, selectedFAQ, selectedOrder, selectedPackProducts, setActiveTab, setCategoryPage, setCurrentImage, setCurrentSlug, setCustomerDetailTab, setCustomerFilter, setEditedOrder, setEditingItem, setEvents, setIsAddModalOpen, setIsCatalogRuleEditorOpen, setIsCityEditorOpen, setIsCouponEditorOpen, setIsEditingOrder, setIsEventEditorOpen, setIsFAQEditorOpen, setIsSaving, setIsSidebarOpen, setLocalAbandonedCarts, setLocalAbandonedCarts2, setLocalBlogPosts, setLocalBlogPosts2, setLocalCategories, setLocalCurrencies, setLocalCustomerGroups, setLocalCustomerGroups2, setLocalEmails, setLocalExpenses, setLocalLookbook, setLocalLookbook2, setLocalOrders, setLocalPacks, setLocalProducts, setLocalPushNotifications, setLocalReviews, setLocalReviews2, setLocalRole, setLocalRoles, setLocalShippingRules, setLocalShippingRules2, setLocalSubscribers, setLocalSystemNotifications, setLocalTaxRules, setLocalTaxRules2, setLocalUser, setLocalUsers, setLogFilter, setMessageInput, setModalType, setNewNote, setNewRMANote, setNotificationFilter, setNotificationPage, setOrderFilter, setOverviewOrderFilter, setProductFilter, setRequestLogFilter, setReviewFilter, setSearchResults, setSelectedCatalogRule, setSelectedCity, setSelectedConversation, setSelectedCoupon, setSelectedCustomer, setSelectedCustomerGroup, setSelectedEvent, setSelectedFAQ, setSelectedOrder, setSelectedPackProducts, setShowNotifications, setSiteConfig, setViewingCustomer, showNotifications, siteConfig, siteConfigs, sortByDate, stats, totalCustomers, totalOrdersCount, totalSales, totalVisitors, updateBlogPost, updateCatalogRule, updateCategory, updateCity, updateCoupon, updateCurrency, updateCustomerGroup, updateEvent, updateExpense, updateFAQ, updateLocalRole, updateLocalUser, updateLookbook, updateNavItem, updatePack, updateProduct, updateRMA, updateReview, updateShippingRule, updateSiteConfig, updateTaxRule, user, userRoleSlug, viewingCustomer } = ctx;
  return (
    <>
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-card p-8 rounded-3xl shadow-sm border border-primary/10 space-y-6">
                  <h4 className="text-lg font-bold text-primary border-b border-primary/5 pb-4">Informations Générales</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Nom du produit</label>
                        <input 
                          name="name"
                          type="text" 
                          required
                          className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary focus:bg-card text-primary transition-all" 
                          placeholder="Ex: Laine Mérinos Douceur" 
                          defaultValue={editingItem?.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                            setCurrentSlug(slug);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Slug (URL)</label>
                        <input 
                          name="slug"
                          type="text" 
                          className="w-full px-6 py-4 bg-secondary/10 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary text-primary/60 italic" 
                          placeholder="genere-automatiquement" 
                          value={currentSlug}
                          onChange={(e) => setCurrentSlug(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Description détaillée</label>
                      <textarea 
                        name="description"
                        required
                        className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary focus:bg-card text-primary transition-all h-48 resize-none" 
                        placeholder="Décrivez votre produit, ses caractéristiques, ses avantages..."
                        defaultValue={editingItem?.description}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="bg-card p-8 rounded-3xl shadow-sm border border-primary/10 space-y-6">
                  <h4 className="text-lg font-bold text-primary border-b border-primary/5 pb-4">Prix & Stock</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Prix de vente (FCFA)</label>
                      <div className="relative">
                        <input 
                          name="price"
                          type="number" 
                          required
                          className="w-full pl-6 pr-16 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary focus:bg-card transition-all font-bold text-primary" 
                          placeholder="0" 
                          defaultValue={editingItem?.price}
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/60 font-bold text-xs">FCFA</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Prix d'achat (FCFA)</label>
                      <div className="relative">
                        <input 
                          name="purchasePrice"
                          type="number" 
                          required
                          className="w-full pl-6 pr-16 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary focus:bg-card transition-all font-bold text-primary/60" 
                          placeholder="0" 
                          defaultValue={editingItem?.purchasePrice}
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/60 font-bold text-xs">FCFA</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Prix Promotionnel (FCFA)</label>
                      <div className="relative">
                        <input 
                          name="promoPrice"
                          type="number" 
                          className="w-full pl-6 pr-16 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary focus:bg-card transition-all font-bold text-accent" 
                          placeholder="Optionnel" 
                          defaultValue={editingItem?.promoPrice}
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/60 font-bold text-xs">FCFA</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Catégorie</label>
                      <select 
                        name="category"
                        required
                        className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary focus:bg-card text-primary transition-all appearance-none"
                        defaultValue={editingItem?.category}
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/60">État du produit</label>
                      <select 
                        name="condition"
                        required
                        className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary focus:bg-card text-primary transition-all appearance-none"
                        defaultValue={editingItem?.condition || 'new'}
                      >
                        <option value="new">Neuf</option>
                        <option value="second-hand">Deuxième Main</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-card p-8 rounded-3xl shadow-sm border border-primary/10 space-y-6">
                  <div className="flex items-center justify-between border-b border-primary/5 pb-4">
                    <h4 className="text-lg font-bold text-primary">Caractéristiques</h4>
                    <button 
                      type="button" 
                      onClick={() => {
                        const newSpecs = { ...(editingItem?.specs || {}) };
                        newSpecs['Nouvelle_caracteristique_' + Date.now()] = '';
                        setEditingItem(prev => ({ ...(prev || {}), specs: newSpecs }));
                      }}
                      className="text-xs font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center gap-1"
                    >
                      <Plus size={14} /> Ajouter
                    </button>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(editingItem?.specs || {}).map(([key, value], idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <input 
                          type="text" 
                          className="flex-grow w-1/3 px-4 py-3 bg-secondary/50 border border-primary/10 rounded-xl focus:outline-none focus:border-primary focus:bg-card text-primary text-sm font-bold" 
                          placeholder="Nom (ex: Poids)"
                          value={key}
                          onChange={(e) => {
                            const newKey = e.target.value;
                            const newSpecs = { ...(editingItem?.specs || {}) };
                            const oldVal = newSpecs[key];
                            delete newSpecs[key];
                            newSpecs[newKey] = oldVal;
                            setEditingItem(prev => ({ ...prev, specs: newSpecs }));
                          }}
                        />
                        <input 
                          type="text" 
                          className="flex-grow w-2/3 px-4 py-3 bg-secondary/50 border border-primary/10 rounded-xl focus:outline-none focus:border-primary focus:bg-card text-primary text-sm" 
                          placeholder="Valeur (ex: 50g)"
                          value={value as string}
                          onChange={(e) => {
                            const newSpecs = { ...(editingItem?.specs || {}) };
                            newSpecs[key] = e.target.value;
                            setEditingItem(prev => ({ ...prev, specs: newSpecs }));
                          }}
                        />
                        <button 
                          type="button" 
                          onClick={() => {
                            const newSpecs = { ...(editingItem?.specs || {}) };
                            delete newSpecs[key];
                            setEditingItem(prev => ({ ...prev, specs: newSpecs }));
                          }}
                          className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {Object.keys(editingItem?.specs || {}).length === 0 && (
                      <p className="text-sm text-primary/60 text-center italic py-4">
                        Aucune caractéristique ajoutée. Parfait pour préciser le poids, les dimensions, la matière, etc.
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-card p-8 rounded-3xl shadow-sm border border-primary/10 space-y-6">
                  <h4 className="text-lg font-bold text-primary border-b border-primary/5 pb-4">Optimisation SEO</h4>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Titre SEO (Meta Title)</label>
                      <input 
                        name="seoTitle"
                        type="text" 
                        className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary focus:bg-card text-primary transition-all" 
                        placeholder="Titre optimisé pour les moteurs de recherche" 
                        defaultValue={editingItem?.seo?.title}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Description SEO (Meta Description)</label>
                      <textarea 
                        name="seoDescription"
                        className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary focus:bg-card text-primary transition-all h-24 resize-none" 
                        placeholder="Bref résumé pour les résultats Google..."
                        defaultValue={editingItem?.seo?.description}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
    </>
  );
}
