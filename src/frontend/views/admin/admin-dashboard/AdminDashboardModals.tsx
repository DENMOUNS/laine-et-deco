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

import { Modal } from '../../../components/Modal';

import { AdminInventoryAdjustmentModalFields } from './AdminInventoryAdjustmentModalFields';
import { AdminQuickStockAdjustModalFields } from './AdminQuickStockAdjustModalFields';
import { AdminPackModalFields } from './AdminPackModalFields';
import { AdminNav_itemModalFields } from './AdminNav_itemModalFields';
import { AdminUserModalFields } from './AdminUserModalFields';
import { AdminRoleModalFields } from './AdminRoleModalFields';
import { AdminCurrencyModalFields } from './AdminCurrencyModalFields';
import { AdminNotificationModalFields } from './AdminNotificationModalFields';
import { AdminEmailModalFields } from './AdminEmailModalFields';
import { AdminCustomerModalFields } from './AdminCustomerModalFields';
import { AdminCategoryModalFields } from './AdminCategoryModalFields';
import { AdminEventModalFields } from './AdminEventModalFields';
import { AdminExpenseModalFields } from './AdminExpenseModalFields';
import { AdminLookbookModalFields } from './AdminLookbookModalFields';
import { AdminBlogModalFields } from './AdminBlogModalFields';
import { AdminBlogCategoryModalFields } from './AdminBlogCategoryModalFields';
import { AdminCustomerGroupModalFields } from './AdminCustomerGroupModalFields';
import { AdminBadgeModalFields } from './AdminBadgeModalFields';
import { AdminLoyaltyConfigModalFields } from './AdminLoyaltyConfigModalFields';
import { AdminTaxModalFields } from './AdminTaxModalFields';
import { AdminShippingModalFields } from './AdminShippingModalFields';
import { AdminCatalogRuleModalFields } from './AdminCatalogRuleModalFields';
export function AdminDashboardModals({ ctx }: { ctx: any }) {
  const { ABANDONED_CARTS, ANALYTICS, BLOG_POSTS, CATEGORIES, CATEGORY_DISTRIBUTION, CHAT_MESSAGES, CITIES, CONVERSATIONS, COUPONS, CUSTOMER_GROUPS, DEVICE_DATA, EMAILS, EXPENSES, FAQS, LOGIN_LOGS, LOOKBOOK_POSTS, NAV_ITEMS, NOTIFICATIONS, ORDERS, PACKS, PRODUCTS, PROMO_EVENTS, PUSH_NOTIFICATIONS, REQUEST_LOGS, RETENTION_DATA, REVENUE_BY_PAYMENT, REVIEWS, SALES_DATA, SHIPPING_RULES, SUBSCRIBERS, TAX_RULES, TRAFFIC_SOURCES, USERS, activeMenuItem, activeTab, addBlogPost, addBlogCategory, addCatalogRule, addCategory, addCity, addCoupon, addCurrency, addCustomerGroup, addEvent, addExpense, addFAQ, addLocalRole, addLookbook, addNavItem, addPack, addProduct, addRMA, addReview, addShippingRule, addTaxRule, allOrders, averageOrderValue, catalogRulesWithDefaults, categoryPage, currentImage, currentSlug, currentUserDoc, customerDetailTab, customerFilter, deleteAbandonedCart, deleteBlogCategory, deleteCatalogRule, deleteCategory, deleteChatMessage, deleteCity, deleteConversation, deleteCoupon, deleteCurrency, deleteCustomerGroup, deleteEvent, deleteFAQ, deleteLocalRole, deleteLoginLog, deleteNavItem, deleteNotification, deleteOrder, deletePack, deleteProduct, deleteRequestLog, deleteReview, deleteShippingRule, deleteSiteConfig, deleteSubscriber, deleteTaxRule, deleteUser, editedOrder, editingItem, events, fetchedProducts, filteredMenuItems, formatDate, handleDeleteCatalogRule, handleDeleteCity, handleDeleteEvent, handleDeleteFAQ, handleEditCatalogRule, handleEditCity, handleEditCoupon, handleEditEvent, handleEditFAQ, handleFormSubmit, handleNotificationClick, handleSaveCatalogRule, handleSaveCity, handleSaveCoupon, handleSaveEvent, handleSaveFAQ, handleSearch, handleSeed, handleSendMessage, hasPermission, isAddModalOpen, isAuthLoading, isCatalogRuleEditorOpen, isCityEditorOpen, isCouponEditorOpen, isDataLoading, isEditingOrder, isEventEditorOpen, isFAQEditorOpen, isLoadingAbandoned, isLoadingBlog, isLoadingCatalog, isLoadingCategories, isLoadingCategoryDist, isLoadingDevice, isLoadingEmails, isLoadingExpenses, isLoadingGroups, isLoadingLookbook, isLoadingOrders, isLoadingPacks, isLoadingProducts, isLoadingPush, isLoadingRetention, isLoadingRevenue, isLoadingReviews, isLoadingRoles, isLoadingShipping, isLoadingSubscribers, isLoadingTax, isLoadingTraffic, isLogsLoading, isSaving, isSidebarOpen, isSuperAdmin, isTabAllowed, isUserCustomer, itemsPerPage, localAbandonedCarts, localBlogPosts, localCatalogPriceRules, localCategories, localCurrencies, localCustomerGroups, localExpenses, localLookbook, localNavItems, localOrders, localPacks, localProducts, localRMAs, localReviews, localRoles, localShippingRules, localSystemNotifications, localTaxRules, localUsers, logFilter, menuItems, messageInput, modalType, navItemsWithDefaults, newNote, newRMANote, notificationFilter, notificationPage, onNavigate, orderFilter, overviewOrderFilter, permissions, productFilter, propSetSiteConfig, propSiteConfig, rawSiteConfig, realLogs, requestLogFilter, reviewFilter, roleData, saveAllSiteConfig, saveSiteSection, searchResults, selectedCatalogRule, selectedCity, selectedConversation, selectedCoupon, selectedCustomer, selectedCustomerGroup, selectedEvent, selectedFAQ, selectedOrder, selectedPackProducts, setActiveTab, setCategoryPage, setCurrentImage, setCurrentSlug, setCustomerDetailTab, setCustomerFilter, setEditedOrder, setEditingItem, setEvents, setIsAddModalOpen, setIsCatalogRuleEditorOpen, setIsCityEditorOpen, setIsCouponEditorOpen, setIsEditingOrder, setIsEventEditorOpen, setIsFAQEditorOpen, setIsSaving, setIsSidebarOpen, setLocalAbandonedCarts, setLocalAbandonedCarts2, setLocalBlogPosts, setLocalBlogPosts2, setLocalCategories, setLocalCurrencies, setLocalCustomerGroups, setLocalCustomerGroups2, setLocalEmails, setLocalExpenses, setLocalLookbook, setLocalLookbook2, setLocalOrders, setLocalPacks, setLocalProducts, setLocalPushNotifications, setLocalReviews, setLocalReviews2, setLocalRole, setLocalRoles, setLocalShippingRules, setLocalShippingRules2, setLocalSubscribers, setLocalSystemNotifications, setLocalTaxRules, setLocalTaxRules2, setLocalUser, setLocalUsers, setLogFilter, setMessageInput, setModalType, setNewNote, setNewRMANote, setNotificationFilter, setNotificationPage, setOrderFilter, setOverviewOrderFilter, setProductFilter, setRequestLogFilter, setReviewFilter, setSearchResults, setSelectedCatalogRule, setSelectedCity, setSelectedConversation, setSelectedCoupon, setSelectedCustomer, setSelectedCustomerGroup, setSelectedEvent, setSelectedFAQ, setSelectedOrder, setSelectedPackProducts, setShowNotifications, setSiteConfig, setViewingCustomer, showNotifications, siteConfig, siteConfigs, sortByDate, stats, totalCustomers, totalOrdersCount, totalSales, totalVisitors, updateBlogPost, updateCatalogRule, updateCategory, updateCity, updateCoupon, updateCurrency, updateCustomerGroup, updateEvent, updateExpense, updateFAQ, updateLocalRole, updateLocalUser, updateLookbook, updateNavItem, updatePack, updateProduct, updateRMA, updateReview, updateShippingRule, updateSiteConfig, updateTaxRule, user, userRoleSlug, viewingCustomer } = ctx;
  return (
    <>
            {/* Modals */}
        <Modal 
          isOpen={isAddModalOpen && !['rma-detail', 'product-edit', 'product-create', 'category-create', 'category-edit', 'inventory-detail'].includes(activeTab)} 
          onClose={() => { setIsAddModalOpen(false); setEditingItem(null); }} 
          title={
            editingItem ? `Modifier ${editingItem.name || editingItem.title || editingItem.subject || 'l\'élément'}` :
            modalType === 'inventory-adjustment' ? 'Réapprovisionnement Stock' :
            modalType === 'quick-stock-adjust' ? `Ajuster le Stock - ${editingItem?.name || ''}` :
            modalType === 'category' ? 'Nouvelle Catégorie' :
            modalType === 'shipping' ? 'Nouvelle Règle de Livraison' :
            modalType === 'badge' ? 'Modifier le Badge' :
            modalType === 'loyalty-config' ? 'Configuration Fidélité' :
            modalType === 'event' ? 'Créer un Évènement' :
            modalType === 'pack' ? 'Ajouter un Pack' :
            modalType === 'currency' ? 'Ajouter une Devise' :
            modalType === 'notification' ? 'Nouvelle Notification' :
            modalType === 'lookbook' ? 'Ajouter au Lookbook' :
            modalType === 'blog' ? 'Nouvel Article' :
            modalType === 'blog-category' ? 'Nouvelle catégorie blog' :
            modalType === 'role' ? 'Nouveau Rôle' :
            modalType === 'user' ? 'Nouvel Utilisateur' : 'Nouvel Email'
          }
        >
          <form className="space-y-6" onSubmit={handleFormSubmit}>
            <AdminInventoryAdjustmentModalFields ctx={ctx} />
            <AdminQuickStockAdjustModalFields ctx={ctx} />
            <AdminPackModalFields ctx={ctx} />
            <AdminNav_itemModalFields ctx={ctx} />
            <AdminUserModalFields ctx={ctx} />
            <AdminRoleModalFields ctx={ctx} />
            <AdminCurrencyModalFields ctx={ctx} />
            <AdminNotificationModalFields ctx={ctx} />
            <AdminEmailModalFields ctx={ctx} />
            <AdminCustomerModalFields ctx={ctx} />
            <AdminCategoryModalFields ctx={ctx} />

            <AdminEventModalFields ctx={ctx} />

            <AdminExpenseModalFields ctx={ctx} />

            <AdminLookbookModalFields ctx={ctx} />

            <AdminBlogModalFields ctx={ctx} />
            <AdminBlogCategoryModalFields ctx={ctx} />

            <AdminCustomerGroupModalFields ctx={ctx} />
            <AdminBadgeModalFields ctx={ctx} />
            <AdminLoyaltyConfigModalFields ctx={ctx} />
            <AdminTaxModalFields ctx={ctx} />
            <AdminShippingModalFields ctx={ctx} />
            <AdminCatalogRuleModalFields ctx={ctx} />

            {editingItem && modalType !== 'blog' && (
              <div className="flex gap-4 text-xs text-primary/60 font-mono bg-secondary/50 p-4 rounded-xl border border-primary/10">
                <div><span className="font-bold text-primary/60">Créé le:</span> {formatDate(editingItem.createdAt)}</div>
                <div><span className="font-bold text-primary/60">Modifié le:</span> {formatDate(editingItem.updatedAt)}</div>
              </div>
            )}

            <div className="pt-6 flex gap-4">
              {editingItem && (
                <button 
                  type="button"
                  onClick={() => {
                    if (!window.confirm(`Supprimer "${editingItem.name || editingItem.title || 'cet élément'}" ?`)) return;
                    if (modalType === 'shipping') {
                      deleteShippingRule(editingItem.id);
                    } else if (modalType === 'tax') {
                      deleteTaxRule(editingItem.id);
                    } else if (modalType === 'customer-group') {
                      deleteCustomerGroup(editingItem.id);
                    } else if (modalType === 'category') {
                      deleteCategory(editingItem.id);
                    } else if (modalType === 'blog-category') {
                      deleteBlogCategory(editingItem.id);
                    } else if (modalType === 'nav_item') {
                      deleteNavItem(editingItem.id);
                    }
                    setIsAddModalOpen(false);
                    setEditingItem(null);
                    toast.success('Élément supprimé avec succès !');
                  }}
                  className="flex-grow py-4 bg-red-200 text-red-800 rounded-2xl font-bold hover:bg-red-300 transition-all"
                >
                  Supprimer
                </button>
              )}
              <button type="button" onClick={() => { setIsAddModalOpen(false); setEditingItem(null); }} className="flex-grow py-4 bg-secondary/50 text-primary/60 rounded-2xl font-bold hover:bg-secondary/70 transition-all border border-primary/10">
                Annuler
              </button>
              <button 
                type="submit" 
                disabled={isSaving}
                className="flex-grow py-4 bg-primary text-white rounded-2xl font-bold hover:bg-accent transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader text="" /> : (editingItem ? 'Enregistrer les modifications' : 'Confirmer l\'ajout')}
              </button>
            </div>
          </form>
        </Modal>



        {/* Customer Details Modal */}
        <Modal
          isOpen={!!selectedCustomer && activeTab !== 'customer-detail'}
          onClose={() => setSelectedCustomer(null)}
          title={`Profil Client: ${selectedCustomer?.name}`}
        >
          {selectedCustomer && (
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-[2rem] bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold shadow-inner">
                  {selectedCustomer.name[0]}
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-primary">{selectedCustomer.name}</h3>
                  <p className="text-primary/60">{selectedCustomer.email}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest">Actif</span>
                    <span className="px-3 py-1 bg-secondary/50 text-primary/60 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/5">Client depuis {new Date(selectedCustomer.joinDate).getFullYear()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-secondary/50 p-6 rounded-3xl border border-primary/10 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1">Commandes</p>
                  <p className="text-2xl font-bold text-primary">{selectedCustomer.orders}</p>
                </div>
                <div className="bg-secondary/50 p-6 rounded-3xl border border-primary/10 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1">Total Dépensé</p>
                  <p className="text-2xl font-bold text-primary">{(selectedCustomer.orders * 15000).toLocaleString()} FCFA</p>
                </div>
                <div className="bg-secondary/50 p-6 rounded-3xl border border-primary/10 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mb-1">Points</p>
                  <p className="text-2xl font-bold text-accent">450</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-primary/60">Dernières Commandes</h4>
                <div className="space-y-2">
                  {localOrders.filter(o => o.customer === selectedCustomer.name).map(order => (
                    <div key={order.id} className="flex justify-between items-center p-4 bg-card border border-primary/10 rounded-2xl">
                      <div>
                        <p className="font-bold text-sm text-primary">{order.id}</p>
                        <p className="text-xs text-primary/60">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-primary">{order.total.toLocaleString()} FCFA</p>
                        <span className="text-[10px] font-bold uppercase text-primary/80">{order.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {editingItem && (
                <div className="flex gap-4 text-xs text-primary/60 font-mono bg-secondary/50 p-4 rounded-xl mb-4 border border-primary/5">
                  <div><span className="font-bold text-primary/60">Créé le:</span> {formatDate(editingItem.createdAt)}</div>
                  <div><span className="font-bold text-primary/60">Modifié le:</span> {formatDate(editingItem.updatedAt)}</div>
                </div>
              )}

              <div className="pt-6 flex gap-4">
                <button className="flex-grow py-4 bg-secondary/50 text-primary/60 rounded-2xl font-bold hover:bg-secondary/70 transition-all border border-primary/10">
                  Désactiver le compte
                </button>
                <button className="flex-grow py-4 bg-primary text-white rounded-2xl font-bold hover:bg-accent transition-all shadow-lg">
                  Envoyer un message
                </button>
              </div>
            </div>
          )}
        </Modal>

        
    </>
  );
}
