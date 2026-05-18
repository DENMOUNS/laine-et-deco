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

export function AdminImportExport({ ctx }: { ctx: any }) {
  const { ABANDONED_CARTS, ANALYTICS, BLOG_POSTS, CATEGORIES, CATEGORY_DISTRIBUTION, CHAT_MESSAGES, CITIES, CONVERSATIONS, COUPONS, CUSTOMER_GROUPS, DEVICE_DATA, EMAILS, EXPENSES, FAQS, LOGIN_LOGS, LOOKBOOK_POSTS, NAV_ITEMS, NOTIFICATIONS, ORDERS, PACKS, PRODUCTS, PROMO_EVENTS, PUSH_NOTIFICATIONS, REQUEST_LOGS, RETENTION_DATA, REVENUE_BY_PAYMENT, REVIEWS, SALES_DATA, SHIPPING_RULES, SUBSCRIBERS, TAX_RULES, TRAFFIC_SOURCES, USERS, activeMenuItem, activeTab, addBlogPost, addCatalogRule, addCategory, addCity, addCoupon, addCurrency, addCustomerGroup, addEvent, addExpense, addFAQ, addLocalRole, addLookbook, addNavItem, addPack, addProduct, addRMA, addReview, addShippingRule, addTaxRule, allOrders, averageOrderValue, catalogRulesWithDefaults, categoryPage, currentImage, currentSlug, currentUserDoc, customerDetailTab, customerFilter, deleteAbandonedCart, deleteCatalogRule, deleteCategory, deleteChatMessage, deleteCity, deleteConversation, deleteCoupon, deleteCurrency, deleteCustomerGroup, deleteEvent, deleteFAQ, deleteLocalRole, deleteLoginLog, deleteNavItem, deleteNotification, deleteOrder, deletePack, deleteProduct, deleteRequestLog, deleteReview, deleteShippingRule, deleteSiteConfig, deleteSubscriber, deleteTaxRule, deleteUser, editedOrder, editingItem, events, fetchedProducts, filteredMenuItems, formatDate, handleDeleteCatalogRule, handleDeleteCity, handleDeleteEvent, handleDeleteFAQ, handleEditCatalogRule, handleEditCity, handleEditCoupon, handleEditEvent, handleEditFAQ, handleFormSubmit, handleNotificationClick, handleSaveCatalogRule, handleSaveCity, handleSaveCoupon, handleSaveEvent, handleSaveFAQ, handleSearch, handleSeed, handleSendMessage, hasPermission, isAddModalOpen, isAuthLoading, isCatalogRuleEditorOpen, isCityEditorOpen, isCouponEditorOpen, isDataLoading, isEditingOrder, isEventEditorOpen, isFAQEditorOpen, isLoadingAbandoned, isLoadingBlog, isLoadingCatalog, isLoadingCategories, isLoadingCategoryDist, isLoadingDevice, isLoadingEmails, isLoadingExpenses, isLoadingGroups, isLoadingLookbook, isLoadingOrders, isLoadingPacks, isLoadingProducts, isLoadingPush, isLoadingRetention, isLoadingRevenue, isLoadingReviews, isLoadingRoles, isLoadingShipping, isLoadingSubscribers, isLoadingTax, isLoadingTraffic, isLogsLoading, isSaving, isSidebarOpen, isSuperAdmin, isTabAllowed, isUserCustomer, itemsPerPage, localAbandonedCarts, localBlogPosts, localCatalogPriceRules, localCategories, localCurrencies, localCustomerGroups, localExpenses, localLookbook, localNavItems, localOrders, localPacks, localProducts, localRMAs, localReviews, localRoles, localShippingRules, localSystemNotifications, localTaxRules, localUsers, logFilter, menuItems, messageInput, modalType, navItemsWithDefaults, newNote, newRMANote, notificationFilter, notificationPage, onNavigate, orderFilter, overviewOrderFilter, permissions, productFilter, propSetSiteConfig, propSiteConfig, rawSiteConfig, realLogs, requestLogFilter, reviewFilter, roleData, saveAllSiteConfig, saveSiteSection, searchResults, selectedCatalogRule, selectedCity, selectedConversation, selectedCoupon, selectedCustomer, selectedCustomerGroup, selectedEvent, selectedFAQ, selectedOrder, selectedPackProducts, setActiveTab, setCategoryPage, setCurrentImage, setCurrentSlug, setCustomerDetailTab, setCustomerFilter, setEditedOrder, setEditingItem, setEvents, setIsAddModalOpen, setIsCatalogRuleEditorOpen, setIsCityEditorOpen, setIsCouponEditorOpen, setIsEditingOrder, setIsEventEditorOpen, setIsFAQEditorOpen, setIsSaving, setIsSidebarOpen, setLocalAbandonedCarts, setLocalAbandonedCarts2, setLocalBlogPosts, setLocalBlogPosts2, setLocalCategories, setLocalCurrencies, setLocalCustomerGroups, setLocalCustomerGroups2, setLocalEmails, setLocalExpenses, setLocalLookbook, setLocalLookbook2, setLocalOrders, setLocalPacks, setLocalProducts, setLocalPushNotifications, setLocalReviews, setLocalReviews2, setLocalRole, setLocalRoles, setLocalShippingRules, setLocalShippingRules2, setLocalSubscribers, setLocalSystemNotifications, setLocalTaxRules, setLocalTaxRules2, setLocalUser, setLocalUsers, setLogFilter, setMessageInput, setModalType, setNewNote, setNewRMANote, setNotificationFilter, setNotificationPage, setOrderFilter, setOverviewOrderFilter, setProductFilter, setRequestLogFilter, setReviewFilter, setSearchResults, setSelectedCatalogRule, setSelectedCity, setSelectedConversation, setSelectedCoupon, setSelectedCustomer, setSelectedCustomerGroup, setSelectedEvent, setSelectedFAQ, setSelectedOrder, setSelectedPackProducts, setShowNotifications, setSiteConfig, setViewingCustomer, showNotifications, siteConfig, siteConfigs, sortByDate, stats, totalCustomers, totalOrdersCount, totalSales, totalVisitors, updateBlogPost, updateCatalogRule, updateCategory, updateCity, updateCoupon, updateCurrency, updateCustomerGroup, updateEvent, updateExpense, updateFAQ, updateLocalRole, updateLocalUser, updateLookbook, updateNavItem, updatePack, updateProduct, updateRMA, updateReview, updateShippingRule, updateSiteConfig, updateTaxRule, user, userRoleSlug, viewingCustomer } = ctx;
  return (
    <>
      {activeTab === 'import-export' && (
          <div className="space-y-10">
            <div className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/15 text-primary rounded-2xl"><Download size={24} /></div>
                <div>
                  <h3 className="text-xl font-serif text-primary">Import / Export de Données</h3>
                  <p className="text-xs text-primary/60">Gérez votre catalogue en masse via CSV</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 border-2 border-dashed border-primary/10 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 hover:border-primary hover:bg-secondary/50 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    accept=".csv" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        toast.success(`Fichier ${e.target.files[0].name} importé avec succès !`);
                        // Simulation of import delay
                        setTimeout(() => {
                          toast.success("50 produits ajoutés/mis à jour.");
                        }, 1500);
                      }
                    }}
                  />
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                    <Plus size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">Importer des Produits</h4>
                    <p className="text-xs text-primary/60 mt-1">Glissez-déposez votre fichier CSV ici</p>
                  </div>
                  <button className="px-6 py-2 bg-card border border-primary/10 rounded-xl text-sm font-bold text-primary hover:border-primary transition-colors pointer-events-none">
                    Parcourir
                  </button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-primary">Exporter des Données</h4>
                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8,ID,Nom,Prix,Stock\n" + localProducts.map(p => `${p.id},${p.name},${p.price},${p.stock}`).join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "catalogue_produits.csv");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        toast.success("Catalogue exporté !");
                      }}
                      className="w-full flex justify-between items-center p-4 bg-secondary/50 border border-primary/10 rounded-2xl hover:border-primary transition-colors"
                    >
                      <span className="font-medium text-sm text-primary">Catalogue Produits (.csv)</span>
                      <Download size={18} className="text-primary/60" />
                    </button>
                    <button 
                      onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8,ID,Nom,Email,Commandes\n" + localUsers.map(u => `${u.id},${u.name},${u.email},${u.orders}`).join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "base_clients.csv");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        toast.success("Base clients exportée !");
                      }}
                      className="w-full flex justify-between items-center p-4 bg-secondary/50 border border-primary/10 rounded-2xl hover:border-primary transition-colors"
                    >
                      <span className="font-medium text-sm text-primary">Base Clients (.csv)</span>
                      <Download size={18} className="text-primary/60" />
                    </button>
                    <button 
                      onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8,ID,Client,Total,Statut\n" + localOrders.map(o => `${o.id},${o.customer},${o.total},${o.status}`).join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "commandes.csv");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        toast.success("Commandes exportées !");
                      }}
                      className="w-full flex justify-between items-center p-4 bg-secondary/50 border border-primary/10 rounded-2xl hover:border-primary transition-colors"
                    >
                      <span className="font-medium text-sm text-primary">Commandes du mois (.csv)</span>
                      <Download size={18} className="text-primary/60" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  );
}
