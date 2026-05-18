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

export function AdminOrders({ ctx }: { ctx: any }) {
  const { ABANDONED_CARTS, ANALYTICS, BLOG_POSTS, CATEGORIES, CATEGORY_DISTRIBUTION, CHAT_MESSAGES, CITIES, CONVERSATIONS, COUPONS, CUSTOMER_GROUPS, DEVICE_DATA, EMAILS, EXPENSES, FAQS, LOGIN_LOGS, LOOKBOOK_POSTS, NAV_ITEMS, NOTIFICATIONS, ORDERS, PACKS, PRODUCTS, PROMO_EVENTS, PUSH_NOTIFICATIONS, REQUEST_LOGS, RETENTION_DATA, REVENUE_BY_PAYMENT, REVIEWS, SALES_DATA, SHIPPING_RULES, SUBSCRIBERS, TAX_RULES, TRAFFIC_SOURCES, USERS, activeMenuItem, activeTab, addBlogPost, addCatalogRule, addCategory, addCity, addCoupon, addCurrency, addCustomerGroup, addEvent, addExpense, addFAQ, addLocalRole, addLookbook, addNavItem, addPack, addProduct, addRMA, addReview, addShippingRule, addTaxRule, allOrders, averageOrderValue, catalogRulesWithDefaults, categoryPage, currentImage, currentSlug, currentUserDoc, customerDetailTab, customerFilter, deleteAbandonedCart, deleteCatalogRule, deleteCategory, deleteChatMessage, deleteCity, deleteConversation, deleteCoupon, deleteCurrency, deleteCustomerGroup, deleteEvent, deleteFAQ, deleteLocalRole, deleteLoginLog, deleteNavItem, deleteNotification, deleteOrder, deletePack, deleteProduct, deleteRequestLog, deleteReview, deleteShippingRule, deleteSiteConfig, deleteSubscriber, deleteTaxRule, deleteUser, editedOrder, editingItem, events, fetchedProducts, filteredMenuItems, formatDate, handleDeleteCatalogRule, handleDeleteCity, handleDeleteEvent, handleDeleteFAQ, handleEditCatalogRule, handleEditCity, handleEditCoupon, handleEditEvent, handleEditFAQ, handleFormSubmit, handleNotificationClick, handleSaveCatalogRule, handleSaveCity, handleSaveCoupon, handleSaveEvent, handleSaveFAQ, handleSearch, handleSeed, handleSendMessage, hasPermission, isAddModalOpen, isAuthLoading, isCatalogRuleEditorOpen, isCityEditorOpen, isCouponEditorOpen, isDataLoading, isEditingOrder, isEventEditorOpen, isFAQEditorOpen, isLoadingAbandoned, isLoadingBlog, isLoadingCatalog, isLoadingCategories, isLoadingCategoryDist, isLoadingDevice, isLoadingEmails, isLoadingExpenses, isLoadingGroups, isLoadingLookbook, isLoadingOrders, isLoadingPacks, isLoadingProducts, isLoadingPush, isLoadingRetention, isLoadingRevenue, isLoadingReviews, isLoadingRoles, isLoadingShipping, isLoadingSubscribers, isLoadingTax, isLoadingTraffic, isLogsLoading, isSaving, isSidebarOpen, isSuperAdmin, isTabAllowed, isUserCustomer, itemsPerPage, localAbandonedCarts, localBlogPosts, localCatalogPriceRules, localCategories, localCurrencies, localCustomerGroups, localExpenses, localLookbook, localNavItems, localOrders, localPacks, localProducts, localRMAs, localReviews, localRoles, localShippingRules, localSystemNotifications, localTaxRules, localUsers, logFilter, menuItems, messageInput, modalType, navItemsWithDefaults, newNote, newRMANote, notificationFilter, notificationPage, onNavigate, orderFilter, overviewOrderFilter, permissions, productFilter, propSetSiteConfig, propSiteConfig, rawSiteConfig, realLogs, requestLogFilter, reviewFilter, roleData, saveAllSiteConfig, saveSiteSection, searchResults, selectedCatalogRule, selectedCity, selectedConversation, selectedCoupon, selectedCustomer, selectedCustomerGroup, selectedEvent, selectedFAQ, selectedOrder, selectedPackProducts, setActiveTab, setCategoryPage, setCurrentImage, setCurrentSlug, setCustomerDetailTab, setCustomerFilter, setEditedOrder, setEditingItem, setEvents, setIsAddModalOpen, setIsCatalogRuleEditorOpen, setIsCityEditorOpen, setIsCouponEditorOpen, setIsEditingOrder, setIsEventEditorOpen, setIsFAQEditorOpen, setIsSaving, setIsSidebarOpen, setLocalAbandonedCarts, setLocalAbandonedCarts2, setLocalBlogPosts, setLocalBlogPosts2, setLocalCategories, setLocalCurrencies, setLocalCustomerGroups, setLocalCustomerGroups2, setLocalEmails, setLocalExpenses, setLocalLookbook, setLocalLookbook2, setLocalOrders, setLocalPacks, setLocalProducts, setLocalPushNotifications, setLocalReviews, setLocalReviews2, setLocalRole, setLocalRoles, setLocalShippingRules, setLocalShippingRules2, setLocalSubscribers, setLocalSystemNotifications, setLocalTaxRules, setLocalTaxRules2, setLocalUser, setLocalUsers, setLogFilter, setMessageInput, setModalType, setNewNote, setNewRMANote, setNotificationFilter, setNotificationPage, setOrderFilter, setOverviewOrderFilter, setProductFilter, setRequestLogFilter, setReviewFilter, setSearchResults, setSelectedCatalogRule, setSelectedCity, setSelectedConversation, setSelectedCoupon, setSelectedCustomer, setSelectedCustomerGroup, setSelectedEvent, setSelectedFAQ, setSelectedOrder, setSelectedPackProducts, setShowNotifications, setSiteConfig, setViewingCustomer, showNotifications, siteConfig, siteConfigs, sortByDate, stats, totalCustomers, totalOrdersCount, totalSales, totalVisitors, updateBlogPost, updateCatalogRule, updateCategory, updateCity, updateCoupon, updateCurrency, updateCustomerGroup, updateEvent, updateExpense, updateFAQ, updateLocalRole, updateLocalUser, updateLookbook, updateNavItem, updatePack, updateProduct, updateRMA, updateReview, updateShippingRule, updateSiteConfig, updateTaxRule, user, userRoleSlug, viewingCustomer } = ctx;
  return (
    <>
      {activeTab === 'orders' && (
          <div className="space-y-6">
            <TabFilter 
              options={[
                { id: 'all', label: 'Tous' },
                { id: 'pending', label: 'En attente' },
                { id: 'processing', label: 'Traitement' },
                { id: 'shipped', label: 'Expédié' },
                { id: 'delivered', label: 'Livré' },
                { id: 'cancelled', label: 'Annulé' },
              ]}
              active={orderFilter}
              onChange={setOrderFilter}
            />
            <DataTable<Order>
              dateFilterKey="createdAt"
              data={sortByDate(orderFilter === 'all' ? allOrders : allOrders.filter(o => o.status === orderFilter))}
              onRowClick={(order) => {
                setSelectedOrder(order);
                setActiveTab('order-detail');
              }}
              onDelete={(item) => deleteOrder(item.id!)}
              title="Liste des Commandes"
              columns={[
              { header: 'Client', accessor: 'customer', className: 'font-medium', sortable: true },
              { header: 'Type', accessor: (order: Order) => order.type === 'custom' ? <span className="text-accent font-bold text-xs uppercase tracking-widest">Sur Mesure</span> : <span className="text-primary/60 text-xs uppercase tracking-widest">Standard</span>, sortable: true, sortKey: 'type' },
              { header: 'Date Opération', accessor: 'date', className: 'text-primary/60 text-sm', sortable: true },
              { 
                header: 'Total', 
                accessor: (order: Order) => <span className="font-bold text-primary">{order.total.toLocaleString()} FCFA</span>,
                exportValue: (order: Order) => `${order.total} FCFA`,
                sortable: true,
                sortKey: 'total'
              },
              {
                header: 'Statut',
                accessor: (order: Order) => (
                  <select
                    value={order.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={async (e) => {
                        const newStatus = e.target.value as any;
                        const oldStatus = order.status;
                        
                        setLocalOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
                        
                        // Database update
                        try {
                          const colName = 'order';
                          
                          // Custom orders use document ID as id, but wait, both are now 'order'. 
                          // Standard orders search by custom 'id' field
                          const ordersRef = collection(db, colName);
                          const q = query(ordersRef, where('id', '==', order.id));
                          const snap = await getDocs(q);
                          if (!snap.empty) {
                            const orderDoc = snap.docs[0];
                            await updateDoc(doc(db, colName, orderDoc.id), { 
                              status: newStatus,
                              updatedAt: new Date().toISOString()
                            });
                          } else {
                            // document ID
                            await updateDoc(doc(db, colName, order.id), { 
                              status: newStatus,
                              updatedAt: new Date().toISOString()
                            });
                          }

                          // Logic for Referral Reward when marked as DELIVERED
                          if (newStatus === 'delivered' && oldStatus !== 'delivered' && order.userId) {
                            const userRef = doc(db, 'user', order.userId);
                            const userSnap = await getDoc(userRef);
                            
                            if (userSnap.exists()) {
                              const userData = userSnap.data();
                              const referralCode = userData.referredBy;
                              
                              if (referralCode) {
                                // Check if this is the first delivered order
                                const deliveredOrdersQuery = query(
                                  collection(db, 'order'), 
                                  where('userId', '==', order.userId), 
                                  where('status', '==', 'delivered')
                                );
                                const deliveredSnap = await getDocs(deliveredOrdersQuery);
                                
                                if (deliveredSnap.size <= 1 && !userData.referralRewardGiven) {
                                  // Find referrer by matching first 8 chars of their UID (referral code)
                                  const usersRef = collection(db, 'user');
                                  const allUsersSnap = await getDocs(usersRef);
                                  const referrer = allUsersSnap.docs.find(d => d.id.substring(0, 8) === referralCode);
                                  
                                  if (referrer && referrer.id !== order.userId) {
                                    await updateDoc(doc(db, referrer.id), {
                                      points: increment(20)
                                    });
                                    await updateDoc(userRef, { referralRewardGiven: true });
                                    toast.success('Récompense de parrainage (20 points) envoyée au parrain !');
                                  }
                                }
                              }
                            }
                          }
                          toast.success(`Statut de la commande ${order.id} mis à jour : ${newStatus}`);
                        } catch (err) {
                          console.error(err);
                          toast.error('Erreur lors de la mise à jour en base de données');
                        }
                    }}
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border-none focus:ring-2 focus:ring-primary/20 cursor-pointer",
                      getStatusStyles(order.status)
                    )}
                  >
                    <option value="pending">En attente</option>
                    <option value="processing">Traitement</option>
                    <option value="shipped">Expédié</option>
                    <option value="delivered">Livré</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                ),
                exportValue: (order: Order) => order.status,
                sortable: true,
                sortKey: 'status'
              },
              {
                header: 'Actions',
                accessor: (order: Order) => (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setActiveTab('order-detail'); }}
                    className="text-primary font-bold text-sm hover:underline"
                  >
                    Détails
                  </button>
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
