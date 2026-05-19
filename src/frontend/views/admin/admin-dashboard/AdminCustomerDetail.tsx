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


export function AdminCustomerDetail({ ctx }: { ctx: any }) {
  const { ABANDONED_CARTS, ANALYTICS, BLOG_POSTS, CATEGORIES, CATEGORY_DISTRIBUTION, CHAT_MESSAGES, CITIES, CONVERSATIONS, COUPONS, CUSTOMER_GROUPS, DEVICE_DATA, EMAILS, EXPENSES, FAQS, LOGIN_LOGS, LOOKBOOK_POSTS, NAV_ITEMS, NOTIFICATIONS, ORDERS, PACKS, PRODUCTS, PROMO_EVENTS, PUSH_NOTIFICATIONS, REQUEST_LOGS, RETENTION_DATA, REVENUE_BY_PAYMENT, REVIEWS, SALES_DATA, SHIPPING_RULES, SUBSCRIBERS, TAX_RULES, TRAFFIC_SOURCES, USERS, activeMenuItem, activeTab, addBlogPost, addCatalogRule, addCategory, addCity, addCoupon, addCurrency, addCustomerGroup, addEvent, addExpense, addFAQ, addLocalRole, addLookbook, addNavItem, addPack, addProduct, addRMA, addReview, addShippingRule, addTaxRule, allOrders, averageOrderValue, catalogRulesWithDefaults, categoryPage, currentImage, currentSlug, currentUserDoc, customerDetailTab, customerFilter, deleteAbandonedCart, deleteCatalogRule, deleteCategory, deleteChatMessage, deleteCity, deleteConversation, deleteCoupon, deleteCurrency, deleteCustomerGroup, deleteEvent, deleteFAQ, deleteLocalRole, deleteLoginLog, deleteNavItem, deleteNotification, deleteOrder, deletePack, deleteProduct, deleteRequestLog, deleteReview, deleteShippingRule, deleteSiteConfig, deleteSubscriber, deleteTaxRule, deleteUser, editedOrder, editingItem, events, fetchedProducts, filteredMenuItems, formatDate, handleDeleteCatalogRule, handleDeleteCity, handleDeleteEvent, handleDeleteFAQ, handleEditCatalogRule, handleEditCity, handleEditCoupon, handleEditEvent, handleEditFAQ, handleFormSubmit, handleNotificationClick, handleSaveCatalogRule, handleSaveCity, handleSaveCoupon, handleSaveEvent, handleSaveFAQ, handleSearch, handleSeed, handleSendMessage, hasPermission, isAddModalOpen, isAuthLoading, isCatalogRuleEditorOpen, isCityEditorOpen, isCouponEditorOpen, isDataLoading, isEditingOrder, isEventEditorOpen, isFAQEditorOpen, isLoadingAbandoned, isLoadingBlog, isLoadingCatalog, isLoadingCategories, isLoadingCategoryDist, isLoadingDevice, isLoadingEmails, isLoadingExpenses, isLoadingGroups, isLoadingLookbook, isLoadingOrders, isLoadingPacks, isLoadingProducts, isLoadingPush, isLoadingRetention, isLoadingRevenue, isLoadingReviews, isLoadingRoles, isLoadingShipping, isLoadingSubscribers, isLoadingTax, isLoadingTraffic, isLogsLoading, isSaving, isSidebarOpen, isSuperAdmin, isTabAllowed, isUserCustomer, itemsPerPage, localAbandonedCarts, localBlogPosts, localCatalogPriceRules, localCategories, localCurrencies, localCustomerGroups, localExpenses, localLookbook, localNavItems, localOrders, localPacks, localProducts, localRMAs, localReviews, localRoles, localShippingRules, localSystemNotifications, localTaxRules, localUsers, logFilter, menuItems, messageInput, modalType, navItemsWithDefaults, newNote, newRMANote, notificationFilter, notificationPage, onNavigate, orderFilter, overviewOrderFilter, permissions, productFilter, propSetSiteConfig, propSiteConfig, rawSiteConfig, realLogs, requestLogFilter, reviewFilter, roleData, saveAllSiteConfig, saveSiteSection, searchResults, selectedCatalogRule, selectedCity, selectedConversation, selectedCoupon, selectedCustomer, selectedCustomerGroup, selectedEvent, selectedFAQ, selectedOrder, selectedPackProducts, setActiveTab, setCategoryPage, setCurrentImage, setCurrentSlug, setCustomerDetailTab, setCustomerFilter, setEditedOrder, setEditingItem, setEvents, setIsAddModalOpen, setIsCatalogRuleEditorOpen, setIsCityEditorOpen, setIsCouponEditorOpen, setIsEditingOrder, setIsEventEditorOpen, setIsFAQEditorOpen, setIsSaving, setIsSidebarOpen, setLocalAbandonedCarts, setLocalAbandonedCarts2, setLocalBlogPosts, setLocalBlogPosts2, setLocalCategories, setLocalCurrencies, setLocalCustomerGroups, setLocalCustomerGroups2, setLocalEmails, setLocalExpenses, setLocalLookbook, setLocalLookbook2, setLocalOrders, setLocalPacks, setLocalProducts, setLocalPushNotifications, setLocalReviews, setLocalReviews2, setLocalRole, setLocalRoles, setLocalShippingRules, setLocalShippingRules2, setLocalSubscribers, setLocalSystemNotifications, setLocalTaxRules, setLocalTaxRules2, setLocalUser, setLocalUsers, setLogFilter, setMessageInput, setModalType, setNewNote, setNewRMANote, setNotificationFilter, setNotificationPage, setOrderFilter, setOverviewOrderFilter, setProductFilter, setRequestLogFilter, setReviewFilter, setSearchResults, setSelectedCatalogRule, setSelectedCity, setSelectedConversation, setSelectedCoupon, setSelectedCustomer, setSelectedCustomerGroup, setSelectedEvent, setSelectedFAQ, setSelectedOrder, setSelectedPackProducts, setShowNotifications, setSiteConfig, setViewingCustomer, showNotifications, siteConfig, siteConfigs, sortByDate, stats, totalCustomers, totalOrdersCount, totalSales, totalVisitors, updateBlogPost, updateCatalogRule, updateCategory, updateCity, updateCoupon, updateCurrency, updateCustomerGroup, updateEvent, updateExpense, updateFAQ, updateLocalRole, updateLocalUser, updateLookbook, updateNavItem, updatePack, updateProduct, updateRMA, updateReview, updateShippingRule, updateSiteConfig, updateTaxRule, user, userRoleSlug, viewingCustomer } = ctx;
  return (
    <>
{activeTab === 'customer-detail' && selectedCustomer && (
          <div className="space-y-8 pb-12">
            {/* Header with Back Button and Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveTab('customers')} 
                  className="p-2 bg-card rounded-full shadow-sm hover:bg-secondary/50 transition-colors border border-primary/10"
                >
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-primary">
                    {selectedCustomer.role === 'customer' ? 'Détails du Client' : 'Détails de l\'Utilisateur'}
                  </h2>
                  <p className="text-sm text-primary/60">ID: {selectedCustomer.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    const newStatus = (selectedCustomer.status || 'active') === 'active' ? 'inactive' : 'active';
                    setLocalUsers(prev => prev.map(u => u.id === selectedCustomer.id ? { ...u, status: newStatus } : u));
                    setSelectedCustomer(prev => prev ? { ...prev, status: newStatus } : null);
                    toast.success(`${selectedCustomer.role === 'customer' ? 'Client' : 'Utilisateur'} ${newStatus === 'active' ? 'activé' : 'désactivé'}`);
                  }}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border ${
                    (selectedCustomer.status || 'active') === 'active' 
                      ? 'bg-accent/20 text-accent border-accent/10 hover:bg-accent/30' 
                      : 'bg-primary/20 text-primary border-primary/10 hover:bg-primary/30'
                  }`}
                >
                  {(selectedCustomer.status || 'active') === 'active' ? 'Désactiver' : 'Activer'}
                </button>
                <button 
                  onClick={() => toast.success('Email de réinitialisation envoyé')}
                  className="px-4 py-2 bg-card border border-primary/10 rounded-xl text-sm font-bold hover:bg-secondary/50 transition-all"
                >
                  Réinitialiser MDP
                </button>
              </div>
            </div>

            {/* Tabs Sub-navigation */}
            <div className="flex border-b border-primary/10 overflow-x-auto no-scrollbar">
              {[
                { id: 'profile', label: 'Profil', icon: User },
                { id: 'orders', label: 'Commandes', icon: ShoppingBag },
                { id: 'loyalty', label: 'Fidélité', icon: Award },
                { id: 'messages', label: 'Messages', icon: MessageSquare },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCustomerDetailTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                    customerDetailTab === tab.id 
                      ? 'border-primary text-primary' 
                      : 'border-transparent text-primary/60 hover:text-primary'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {customerDetailTab === 'profile' && (
                <>
                  {/* Profile Card */}
                  <div className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10 space-y-6 h-fit">
                    <div className="flex flex-col items-center text-center">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold mb-4 border-2 border-primary/20 shadow-md">
                          {selectedCustomer.profileImage ? (
                            <img src={selectedCustomer.profileImage} alt={selectedCustomer.name} className="w-full h-full object-cover" />
                          ) : (
                            selectedCustomer.name[0]
                          )}
                        </div>
                        <div className={`absolute bottom-4 right-0 w-6 h-6 rounded-full border-4 border-card ${
                          (selectedCustomer.status || 'active') === 'active' ? 'bg-primary' : 'bg-accent'
                        }`}></div>
                      </div>
                      <h3 className="text-xl font-bold text-primary">{selectedCustomer.name}</h3>
                      <p className="text-primary/60">{selectedCustomer.email}</p>
                      <div className="mt-4 flex gap-2">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          (selectedCustomer.status || 'active') === 'active' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'
                        }`}>
                          {selectedCustomer.status || 'active'}
                        </span>
                        <span className="px-4 py-1.5 bg-primary/15 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest">
                          {selectedCustomer.role === 'customer' ? 'Client' : 'Administrateur'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-primary/10 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-primary/60 text-sm">Inscrit le</span>
                        <span className="font-medium text-primary">{selectedCustomer.joinDate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-primary/60 text-sm">Commandes</span>
                        <span className="font-bold text-primary">{selectedCustomer.orders}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-primary/60 text-sm">Total Dépensé</span>
                        <span className="font-bold text-primary">{(selectedCustomer.orders * 15000).toLocaleString()} FCFA</span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-primary/10">
                      <div className="bg-secondary/50 p-4 rounded-2xl">
                        <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Note Interne</p>
                        <textarea 
                          className="w-full bg-transparent border-none focus:ring-0 text-sm text-primary/60 resize-none h-20"
                          placeholder={selectedCustomer.role === 'customer' ? 'Ajouter une note sur ce client...' : 'Ajouter une note sur cet utilisateur...'}
                          value={selectedCustomer.internalNotes || ''}
                          onChange={(e) => {
                            const newNotes = e.target.value;
                            setSelectedCustomer(prev => prev ? { ...prev, internalNotes: newNotes } : null);
                            setLocalUsers(prev => prev.map(u => u.id === selectedCustomer.id ? { ...u, internalNotes: newNotes } : u));
                          }}
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Edit Form */}
                  <div className="lg:col-span-2 bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
                    <h3 className="text-xl font-serif font-bold mb-6 text-primary">Informations Personnelles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Nom Complet</label>
                        <input 
                          type="text" 
                          value={selectedCustomer.name}
                          onChange={(e) => {
                            const newName = e.target.value;
                            setSelectedCustomer(prev => prev ? { ...prev, name: newName } : null);
                            setLocalUsers(prev => prev.map(u => u.id === selectedCustomer.id ? { ...u, name: newName } : u));
                          }}
                          className="w-full px-4 py-3 bg-secondary/50 border border-primary/10 rounded-xl focus:outline-none focus:border-primary font-medium text-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Email</label>
                        <input 
                          type="email" 
                          value={selectedCustomer.email}
                          onChange={(e) => {
                            const newEmail = e.target.value;
                            setSelectedCustomer(prev => prev ? { ...prev, email: newEmail } : null);
                            setLocalUsers(prev => prev.map(u => u.id === selectedCustomer.id ? { ...u, email: newEmail } : u));
                          }}
                          className="w-full px-4 py-3 bg-secondary/50 border border-primary/10 rounded-xl focus:outline-none focus:border-primary font-medium text-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Téléphone</label>
                        <input 
                          type="tel" 
                          value={selectedCustomer.phone || ''}
                          onChange={(e) => {
                            const newPhone = e.target.value;
                            setSelectedCustomer(prev => prev ? { ...prev, phone: newPhone } : null);
                            setLocalUsers(prev => prev.map(u => u.id === selectedCustomer.id ? { ...u, phone: newPhone } : u));
                          }}
                          placeholder="+225 07..."
                          className="w-full px-4 py-3 bg-secondary/50 border border-primary/10 rounded-xl focus:outline-none focus:border-primary font-medium text-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Rôle</label>
                        <select
                          value={selectedCustomer.role}
                          onChange={(e) => {
                            const newRole = e.target.value;
                            setSelectedCustomer(prev => prev ? { ...prev, role: newRole } : null);
                            setLocalUsers(prev => prev.map(u => u.id === selectedCustomer.id ? { ...u, role: newRole } : u));
                            updateLocalUser(selectedCustomer.id, { role: newRole } as any);
                          }}
                          className="w-full px-4 py-3 bg-secondary/50 border border-primary/10 rounded-xl focus:outline-none focus:border-primary font-medium text-primary"
                        >
                           {!localRoles.some((r: any) => r.id === 'customer') && <option value="customer">Client (customer)</option>}
                           {!localRoles.some((r: any) => r.id === 'admin') && <option value="admin">Administrateur système (admin)</option>}
                           {Array.from(new Map(localRoles.map((r: any) => [r.id, r])).values()).map((r: any) => (
                              <option key={r.id} value={r.id}>{r.name} ({r.id})</option>
                           ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Adresse de Livraison</label>
                        <input 
                          type="text" 
                          placeholder="Abidjan, Cocody..."
                          className="w-full px-4 py-3 bg-secondary/50 border border-primary/10 rounded-xl focus:outline-none focus:border-primary font-medium text-primary"
                        />
                      </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-primary/10">
                      <h3 className="text-xl font-serif font-bold mb-6 flex items-center gap-2 text-primary">
                        <History size={20} className="text-accent" />
                        Sécurité
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="p-4 bg-secondary/50 rounded-2xl border border-primary/10">
                            <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-1">Dernière Connexion</p>
                            <p className="font-medium text-primary">Il y a 2 heures</p>
                         </div>
                         <div className="p-4 bg-secondary/50 rounded-2xl border border-primary/10">
                            <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-1">Dernier Changement MDP</p>
                            <p className="font-medium text-primary">{selectedCustomer.passwordHistory?.[0] || 'Jamais'}</p>
                         </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-4">
                      <button 
                        onClick={() => toast.success('Modifications enregistrées')}
                        className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:bg-accent transition-all shadow-lg"
                      >
                        Enregistrer les modifications
                      </button>
                    </div>
                  </div>
                </>
              )}

              {customerDetailTab === 'orders' && (() => {
                const customerOrders = localOrders.filter(o => o.customer === selectedCustomer.name);
                const totalSpent = customerOrders.reduce((acc, o) => acc + o.total, 0);
                const averageCart = customerOrders.length > 0 ? totalSpent / customerOrders.length : 0;
                const lastOrder = customerOrders.length > 0 ? [...customerOrders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;

                return (
                <div className="lg:col-span-3 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-card p-6 rounded-3xl border border-primary/10 shadow-sm">
                      <p className="text-primary/60 text-sm font-medium mb-1">Total Commandes</p>
                      <p className="text-3xl font-serif font-bold text-primary">{customerOrders.length}</p>
                    </div>
                    <div className="bg-card p-6 rounded-3xl border border-primary/10 shadow-sm">
                      <p className="text-primary/60 text-sm font-medium mb-1">Panier Moyen</p>
                      <p className="text-3xl font-serif font-bold text-primary">{averageCart.toLocaleString()} FCFA</p>
                    </div>
                    <div className="bg-card p-6 rounded-3xl border border-primary/10 shadow-sm">
                      <p className="text-primary/60 text-sm font-medium mb-1">Dernière Commande</p>
                      <p className="text-xl font-serif font-bold text-primary">{lastOrder ? formatDate(lastOrder.date) : 'Aucune'}</p>
                    </div>
                  </div>

                  <DataTable<Order>
                    
              dateFilterKey="createdAt"
              data={customerOrders}
                    title="Historique des Commandes"
                    columns={[
                      { header: 'ID Commande', accessor: 'id', className: 'font-mono text-xs' },
                      { header: 'Date', accessor: 'date' },
                      { 
                        header: 'Statut', 
                        accessor: (order) => <StatusBadge status={order.status} />
                      },
                      { header: 'Articles', accessor: 'items', className: 'text-center' },
                      { header: 'Total', accessor: (order) => `${order.total.toLocaleString()} FCFA`, className: 'font-bold text-primary' },
                      {
                        header: 'Actions',
                        accessor: (order) => (
                          <button 
                            onClick={() => { setSelectedOrder(order); setActiveTab('order-detail'); }}
                            className="p-2 hover:bg-secondary/50 rounded-lg transition-colors text-primary/60 hover:text-primary"
                          >
                            <Eye size={18} />
                          </button>
                        )
                      }
                    ]}
                  />
                </div>
                );
              })()}

              {customerDetailTab === 'loyalty' && (
                <div className="lg:col-span-3 space-y-8">
                  <div className="bg-gradient-to-br from-primary to-accent p-12 rounded-[3rem] text-primary-foreground relative overflow-hidden shadow-xl">
                    <div className="relative z-10">
                      <p className="text-primary-foreground/70 font-bold uppercase tracking-widest text-sm mb-2">Programme de Fidélité</p>
                      <h3 className="text-4xl font-serif font-bold mb-6">Statut {selectedCustomer.loyaltyTier || 'Bronze'}</h3>
                      <div className="flex items-end gap-4">
                        <p className="text-6xl font-bold">{(selectedCustomer.points || 0).toLocaleString()}</p>
                        <p className="text-xl mb-2 opacity-80">Points</p>
                      </div>
                      <div className="mt-8 max-w-md">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Prochain palier : {selectedCustomer.loyaltyTier === 'Platinum' ? 'Maximum atteint' : 'Suivant'}</span>
                          <span>{Math.min(100, ((selectedCustomer.points || 0) % 1000) / 10).toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-foreground" style={{ width: `${Math.min(100, ((selectedCustomer.points || 0) % 1000) / 10)}%` }}></div>
                        </div>
                      </div>
                    </div>
                    <Award size={200} className="absolute -right-10 -bottom-10 text-primary-foreground/10 rotate-12" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-card p-8 rounded-[2.5rem] border border-primary/10 shadow-sm">
                      <h4 className="text-lg font-serif font-bold mb-6 text-primary">Badges Débloqués</h4>
                      <div className="grid grid-cols-4 gap-4">
                        {(selectedCustomer.badges || []).length > 0 ? (
                          selectedCustomer.badges?.map((badge) => (
                            <div key={badge.id} className="flex flex-col items-center gap-2">
                              <div className="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center text-accent border border-primary/10">
                                <span className="text-2xl">{badge.icon}</span>
                              </div>
                              <span className="text-[10px] font-bold text-primary/60 uppercase text-center">{badge.name}</span>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-4 text-center py-8 text-primary/60 italic">Aucun badge débloqué</div>
                        )}
                      </div>
                    </div>
                    <div className="bg-card p-8 rounded-[2.5rem] border border-primary/10 shadow-sm">
                      <h4 className="text-lg font-serif font-bold mb-6 text-primary">Avantages Actifs</h4>
                      <ul className="space-y-4">
                        <li className="flex items-center gap-3 text-primary/60">
                          <CheckCircle2 size={20} className="text-primary" />
                          Livraison gratuite illimitée
                        </li>
                        {selectedCustomer.loyaltyTier === 'Gold' || selectedCustomer.loyaltyTier === 'Platinum' ? (
                          <li className="flex items-center gap-3 text-primary/60">
                            <CheckCircle2 size={20} className="text-primary" />
                            -10% sur toute la boutique
                          </li>
                        ) : null}
                        {selectedCustomer.loyaltyTier === 'Platinum' ? (
                          <li className="flex items-center gap-3 text-primary/60">
                            <CheckCircle2 size={20} className="text-primary" />
                            Accès anticipé aux nouvelles collections
                          </li>
                        ) : null}
                        <li className="flex items-center gap-3 text-primary/60">
                          <CheckCircle2 size={20} className="text-primary" />
                          Service client prioritaire
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {customerDetailTab === 'messages' && (() => {
                const conversation = CONVERSATIONS.find(c => c.userId === selectedCustomer.id);
                return (
                <div className="lg:col-span-3 bg-card rounded-[2.5rem] border border-primary/10 shadow-sm overflow-hidden flex flex-col h-[600px]">
                  <div className="p-6 border-b border-primary/10 flex justify-between items-center bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                        {selectedCustomer.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-primary">{selectedCustomer.name}</p>
                        <p className="text-xs text-primary/60 flex items-center gap-1">
                          <span className="w-2 h-2 bg-primary/40 rounded-full"></span>
                          En ligne
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        if (conversation) {
                          setSelectedConversation(conversation);
                          setActiveTab('messages');
                        }
                      }}
                      className="text-primary font-bold text-sm hover:underline"
                    >
                      Voir tout l'historique
                    </button>
                  </div>
                  
                  <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-secondary/30">
                    {conversation ? (
                      <>
                        <div className="flex justify-center">
                          <span className="px-4 py-1 bg-card rounded-full text-[10px] font-bold text-primary/60 uppercase tracking-widest border border-primary/10">Conversation ID: {conversation.id}</span>
                        </div>
                        
                        {conversation.messages.map((msg) => (
                          <div key={msg.id} className={`flex gap-4 max-w-[80%] ${msg.isAdmin ? 'ml-auto flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              msg.isAdmin ? 'bg-accent text-accent-foreground' : 'bg-primary/10 text-primary'
                            }`}>
                              {msg.isAdmin ? 'A' : selectedCustomer.name[0]}
                            </div>
                            <div className={`p-4 rounded-2xl shadow-sm border ${
                              msg.isAdmin 
                                ? 'bg-primary text-primary-foreground border-primary rounded-tr-none' 
                                : 'bg-card text-primary/60 border-primary/10 rounded-tl-none'
                            }`}>
                              <p className="text-sm">{msg.message}</p>
                              <p className={`text-[10px] mt-2 font-medium ${msg.isAdmin ? 'text-primary-foreground/70' : 'text-primary/60'}`}>
                                {msg.timestamp}
                              </p>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-primary/60 space-y-4">
                        <MessageSquare size={48} className="opacity-20" />
                        <p>Aucune conversation trouvée avec cet {selectedCustomer.role === 'customer' ? 'client' : 'utilisateur'}.</p>
                        <button 
                          onClick={() => toast.info('Nouvelle conversation initiée')}
                          className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm"
                        >
                          Démarrer une discussion
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="p-6 border-t border-primary/10 bg-card">
                    <div className="flex gap-4">
                      <input 
                        type="text" 
                        placeholder="Écrire un message..."
                        className="flex-1 px-6 py-3 bg-secondary/50 border border-primary/10 rounded-xl focus:outline-none focus:border-primary"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            toast.success('Message envoyé');
                            e.currentTarget.value = '';
                          }
                        }}
                      />
                      <button 
                        onClick={() => toast.success('Message envoyé')}
                        className="p-3 bg-primary text-primary-foreground rounded-xl hover:bg-accent transition-all shadow-lg"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                  </div>
                </div>
                );
              })()}
            </div>
          </div>
        )}
    </>
  );
}
