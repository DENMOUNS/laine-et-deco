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
import { User as UserType } from '../../../../types';

import { AdminFlashSales } from '../AdminFlashSales';
import { AdminPortfolios } from '../AdminPortfolios';

export function AdminCustomers({ ctx }: { ctx: any }) {
  const { ABANDONED_CARTS, ANALYTICS, BLOG_POSTS, CATEGORIES, CATEGORY_DISTRIBUTION, CHAT_MESSAGES, CITIES, CONVERSATIONS, COUPONS, CUSTOMER_GROUPS, DEVICE_DATA, EMAILS, EXPENSES, FAQS, LOGIN_LOGS, LOOKBOOK_POSTS, NAV_ITEMS, NOTIFICATIONS, ORDERS, PACKS, PRODUCTS, PROMO_EVENTS, PUSH_NOTIFICATIONS, REQUEST_LOGS, RETENTION_DATA, REVENUE_BY_PAYMENT, REVIEWS, SALES_DATA, SHIPPING_RULES, SUBSCRIBERS, TAX_RULES, TRAFFIC_SOURCES, USERS, activeMenuItem, activeTab, addBlogPost, addCatalogRule, addCategory, addCity, addCoupon, addCurrency, addCustomerGroup, addEvent, addExpense, addFAQ, addLocalRole, addLookbook, addNavItem, addPack, addProduct, addRMA, addReview, addShippingRule, addTaxRule, allOrders, averageOrderValue, catalogRulesWithDefaults, categoryPage, currentImage, currentSlug, currentUserDoc, customerDetailTab, customerFilter, deleteAbandonedCart, deleteCatalogRule, deleteCategory, deleteChatMessage, deleteCity, deleteConversation, deleteCoupon, deleteCurrency, deleteCustomerGroup, deleteEvent, deleteFAQ, deleteLocalRole, deleteLoginLog, deleteNavItem, deleteNotification, deleteOrder, deletePack, deleteProduct, deleteRequestLog, deleteReview, deleteShippingRule, deleteSiteConfig, deleteSubscriber, deleteTaxRule, deleteUser, editedOrder, editingItem, events, fetchedProducts, filteredMenuItems, formatDate, handleDeleteCatalogRule, handleDeleteCity, handleDeleteEvent, handleDeleteFAQ, handleEditCatalogRule, handleEditCity, handleEditCoupon, handleEditEvent, handleEditFAQ, handleFormSubmit, handleNotificationClick, handleSaveCatalogRule, handleSaveCity, handleSaveCoupon, handleSaveEvent, handleSaveFAQ, handleSearch, handleSeed, handleSendMessage, hasPermission, isAddModalOpen, isAuthLoading, isCatalogRuleEditorOpen, isCityEditorOpen, isCouponEditorOpen, isDataLoading, isEditingOrder, isEventEditorOpen, isFAQEditorOpen, isLoadingAbandoned, isLoadingBlog, isLoadingCatalog, isLoadingCategories, isLoadingCategoryDist, isLoadingDevice, isLoadingEmails, isLoadingExpenses, isLoadingGroups, isLoadingLookbook, isLoadingOrders, isLoadingPacks, isLoadingProducts, isLoadingPush, isLoadingRetention, isLoadingRevenue, isLoadingReviews, isLoadingRoles, isLoadingShipping, isLoadingSubscribers, isLoadingTax, isLoadingTraffic, isLogsLoading, isSaving, isSidebarOpen, isSuperAdmin, isTabAllowed, isUserCustomer, itemsPerPage, localAbandonedCarts, localBlogPosts, localCatalogPriceRules, localCategories, localCurrencies, localCustomerGroups, localExpenses, localLookbook, localNavItems, localOrders, localPacks, localProducts, localRMAs, localReviews, localRoles, localShippingRules, localSystemNotifications, localTaxRules, localUsers, logFilter, menuItems, messageInput, modalType, navItemsWithDefaults, newNote, newRMANote, notificationFilter, notificationPage, onNavigate, orderFilter, overviewOrderFilter, permissions, productFilter, propSetSiteConfig, propSiteConfig, rawSiteConfig, realLogs, requestLogFilter, reviewFilter, roleData, saveAllSiteConfig, saveSiteSection, searchResults, selectedCatalogRule, selectedCity, selectedConversation, selectedCoupon, selectedCustomer, selectedCustomerGroup, selectedEvent, selectedFAQ, selectedOrder, selectedPackProducts, setActiveTab, setCategoryPage, setCurrentImage, setCurrentSlug, setCustomerDetailTab, setCustomerFilter, setEditedOrder, setEditingItem, setEvents, setIsAddModalOpen, setIsCatalogRuleEditorOpen, setIsCityEditorOpen, setIsCouponEditorOpen, setIsEditingOrder, setIsEventEditorOpen, setIsFAQEditorOpen, setIsSaving, setIsSidebarOpen, setLocalAbandonedCarts, setLocalAbandonedCarts2, setLocalBlogPosts, setLocalBlogPosts2, setLocalCategories, setLocalCurrencies, setLocalCustomerGroups, setLocalCustomerGroups2, setLocalEmails, setLocalExpenses, setLocalLookbook, setLocalLookbook2, setLocalOrders, setLocalPacks, setLocalProducts, setLocalPushNotifications, setLocalReviews, setLocalReviews2, setLocalRole, setLocalRoles, setLocalShippingRules, setLocalShippingRules2, setLocalSubscribers, setLocalSystemNotifications, setLocalTaxRules, setLocalTaxRules2, setLocalUser, setLocalUsers, setLogFilter, setMessageInput, setModalType, setNewNote, setNewRMANote, setNotificationFilter, setNotificationPage, setOrderFilter, setOverviewOrderFilter, setProductFilter, setRequestLogFilter, setReviewFilter, setSearchResults, setSelectedCatalogRule, setSelectedCity, setSelectedConversation, setSelectedCoupon, setSelectedCustomer, setSelectedCustomerGroup, setSelectedEvent, setSelectedFAQ, setSelectedOrder, setSelectedPackProducts, setShowNotifications, setSiteConfig, setViewingCustomer, showNotifications, siteConfig, siteConfigs, sortByDate, stats, totalCustomers, totalOrdersCount, totalSales, totalVisitors, updateBlogPost, updateCatalogRule, updateCategory, updateCity, updateCoupon, updateCurrency, updateCustomerGroup, updateEvent, updateExpense, updateFAQ, updateLocalRole, updateLocalUser, updateLookbook, updateNavItem, updatePack, updateProduct, updateRMA, updateReview, updateShippingRule, updateSiteConfig, updateTaxRule, user, userRoleSlug, viewingCustomer } = ctx;
  const isSystemUsersTab = activeTab === 'system_users';
  const isCustomersTab = activeTab === 'customers' || activeTab === 'users';

  const getPoints = (u: any) => {
    const ordersList = allOrders || ORDERS || [];
    const completedCount = ordersList.filter((o: any) => (o.userId === u.id || o.userId === u.uid) && o.status === 'completed').length;
    return completedCount * 10;
  };

  // Filter and map users with calculated points
  const filteredUsers = (localUsers || [])
    .filter((u: any) => {
      const userRole = u.role || 'customer';
      if (isSystemUsersTab) {
        return userRole !== 'customer';
      }
      if (isCustomersTab) {
        return userRole === 'customer';
      }
      return true;
    })
    .map((u: any) => ({
      ...u,
      points: getPoints(u)
    }));

  // Pre-sort filtered users
  if (isCustomersTab) {
    filteredUsers.sort((a: any, b: any) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      const dateA = new Date(a.createdAt || a.joinDate || 0).getTime();
      const dateB = new Date(b.createdAt || b.joinDate || 0).getTime();
      return dateB - dateA;
    });
  } else {
    filteredUsers.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || a.joinDate || 0).getTime();
      const dateB = new Date(b.createdAt || b.joinDate || 0).getTime();
      return dateB - dateA;
    });
  }

  return (
    <>
      {(isCustomersTab || isSystemUsersTab) && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif">
                {isSystemUsersTab ? 'Utilisateurs Système' : 'Liste des Clients'}
              </h2>
              <div className="flex gap-4">
                {isSuperAdmin && (
                   <button 
                     onClick={() => { setModalType('user'); setIsAddModalOpen(true); }}
                     className="bg-primary text-primary-foreground px-4 py-2 rounded-xl font-bold hover:bg-primary/90 transition-all text-sm h-[40px]"
                   >
                     + Ajouter {isSystemUsersTab ? 'un Utilisateur Système' : 'un Client'}
                   </button>
                )}
              </div>
            </div>
            <DataTable<any>
              dateFilterKey="createdAt"
              searchable={true}
              defaultSort={isCustomersTab ? { key: 'points', direction: 'desc' } : { key: 'createdAt', direction: 'desc' }}
              data={filteredUsers}
              onRowClick={(user) => {
                setSelectedCustomer(user); 
                setActiveTab('customer-detail'); 
              }}
              onDelete={(item) => deleteUser(item.id!)}
              title={isSystemUsersTab ? "Liste des Utilisateurs Système" : "Liste des Clients"}
              columns={[
                {
                  header: 'Utilisateur',
                  accessor: (user: UserType) => (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/5 shadow-sm">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt={user.name || user.email} className="w-full h-full object-cover" />
                        ) : (
                          ((user.name?.[0] || user.email?.[0] || 'U')).toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-primary">{user.name || 'Sans nom'}</p>
                        <p className="text-xs text-primary/60">{user.email}</p>
                      </div>
                    </div>
                  ),
                  sortable: true,
                  sortKey: 'name'
                },
                ...(isSystemUsersTab ? [
                  { 
                    header: 'Rôle', 
                    accessor: (user: UserType) => (
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary capitalize">
                        {user.role || 'customer'}
                      </span>
                    ),
                    sortable: true,
                    sortKey: 'role'
                  }
                ] : [
                  {
                    header: 'Points de Fidélité',
                    accessor: (user: any) => (
                      <span className="px-3 py-1 bg-amber-500/10 text-amber-700 font-bold text-xs rounded-full flex items-center gap-1.5 w-fit">
                        <Coins size={12} className="text-amber-600" />
                        <span>{user.points} pts</span>
                      </span>
                    ),
                    sortable: true,
                    sortKey: 'points'
                  }
                ]),
                { header: 'Commandes', accessor: 'orders', className: 'text-center font-bold text-primary', sortable: true },
                { header: 'Date d\'inscription', accessor: 'joinDate', className: 'text-primary/60 text-sm', sortable: true },
                { 
                  header: 'Statut', 
                  accessor: (user) => <StatusBadge status={user.status || 'active'} />,
                  exportValue: (user) => user.status || 'active',
                  sortable: true,
                  sortKey: 'status'
                },
                {
                    header: 'Actions',
                    accessor: (user: UserType) => (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => {
                              window.dispatchEvent(new CustomEvent('app:start-call-to-user', { 
                                detail: { 
                                  targetUserId: user.id || user.uid, 
                                  targetUserName: user.name || user.email 
                                } 
                              }));
                              toast.info(`Appel vocal initié vers ${user.name || user.email}...`);
                            }} 
                            title="Passer un appel vocal à cet utilisateur"
                            className="bg-green-600/10 text-green-700 hover:bg-green-600 hover:text-white p-2 rounded-xl transition-all flex items-center gap-1 font-bold text-xs"
                          >
                            <Phone size={14} /> Appeler
                          </button>
                          <button onClick={() => { setSelectedCustomer(user); setActiveTab('customer-detail'); }} className="text-primary hover:text-accent font-bold text-xs bg-secondary/80 hover:bg-secondary px-3 py-2 rounded-xl transition-all">
                            Voir Détails
                          </button>
                        </div>
                    )
                },
                { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt || item.date || item.subscribedAt || item.sentAt || new Date().toISOString()), className: 'text-primary/60 text-sm', sortable: true }
              ]}
            />
          </div>
        )}
    </>
  );
}
