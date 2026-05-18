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


export function AdminProductFormSidebarFields({ ctx }: { ctx: any }) {
  const { ABANDONED_CARTS, ANALYTICS, BLOG_POSTS, CATEGORIES, CATEGORY_DISTRIBUTION, CHAT_MESSAGES, CITIES, CONVERSATIONS, COUPONS, CUSTOMER_GROUPS, DEVICE_DATA, EMAILS, EXPENSES, FAQS, LOGIN_LOGS, LOOKBOOK_POSTS, NAV_ITEMS, NOTIFICATIONS, ORDERS, PACKS, PRODUCTS, PROMO_EVENTS, PUSH_NOTIFICATIONS, REQUEST_LOGS, RETENTION_DATA, REVENUE_BY_PAYMENT, REVIEWS, SALES_DATA, SHIPPING_RULES, SUBSCRIBERS, TAX_RULES, TRAFFIC_SOURCES, USERS, activeMenuItem, activeTab, addBlogPost, addCatalogRule, addCategory, addCity, addCoupon, addCurrency, addCustomerGroup, addEvent, addExpense, addFAQ, addLocalRole, addLookbook, addNavItem, addPack, addProduct, addRMA, addReview, addShippingRule, addTaxRule, allOrders, averageOrderValue, catalogRulesWithDefaults, categoryPage, currentImage, currentSlug, currentUserDoc, customerDetailTab, customerFilter, deleteAbandonedCart, deleteCatalogRule, deleteCategory, deleteChatMessage, deleteCity, deleteConversation, deleteCoupon, deleteCurrency, deleteCustomerGroup, deleteEvent, deleteFAQ, deleteLocalRole, deleteLoginLog, deleteNavItem, deleteNotification, deleteOrder, deletePack, deleteProduct, deleteRequestLog, deleteReview, deleteShippingRule, deleteSiteConfig, deleteSubscriber, deleteTaxRule, deleteUser, editedOrder, editingItem, events, fetchedProducts, filteredMenuItems, formatDate, handleDeleteCatalogRule, handleDeleteCity, handleDeleteEvent, handleDeleteFAQ, handleEditCatalogRule, handleEditCity, handleEditCoupon, handleEditEvent, handleEditFAQ, handleFormSubmit, handleNotificationClick, handleSaveCatalogRule, handleSaveCity, handleSaveCoupon, handleSaveEvent, handleSaveFAQ, handleSearch, handleSeed, handleSendMessage, hasPermission, isAddModalOpen, isAuthLoading, isCatalogRuleEditorOpen, isCityEditorOpen, isCouponEditorOpen, isDataLoading, isEditingOrder, isEventEditorOpen, isFAQEditorOpen, isLoadingAbandoned, isLoadingBlog, isLoadingCatalog, isLoadingCategories, isLoadingCategoryDist, isLoadingDevice, isLoadingEmails, isLoadingExpenses, isLoadingGroups, isLoadingLookbook, isLoadingOrders, isLoadingPacks, isLoadingProducts, isLoadingPush, isLoadingRetention, isLoadingRevenue, isLoadingReviews, isLoadingRoles, isLoadingShipping, isLoadingSubscribers, isLoadingTax, isLoadingTraffic, isLogsLoading, isSaving, isSidebarOpen, isSuperAdmin, isTabAllowed, isUserCustomer, itemsPerPage, localAbandonedCarts, localBlogPosts, localCatalogPriceRules, localCategories, localCurrencies, localCustomerGroups, localExpenses, localLookbook, localNavItems, localOrders, localPacks, localProducts, localRMAs, localReviews, localRoles, localShippingRules, localSystemNotifications, localTaxRules, localUsers, logFilter, menuItems, messageInput, modalType, navItemsWithDefaults, newNote, newRMANote, notificationFilter, notificationPage, onNavigate, orderFilter, overviewOrderFilter, permissions, productFilter, propSetSiteConfig, propSiteConfig, rawSiteConfig, realLogs, requestLogFilter, reviewFilter, roleData, saveAllSiteConfig, saveSiteSection, searchResults, selectedCatalogRule, selectedCity, selectedConversation, selectedCoupon, selectedCustomer, selectedCustomerGroup, selectedEvent, selectedFAQ, selectedOrder, selectedPackProducts, setActiveTab, setCategoryPage, setCurrentImage, setCurrentSlug, setCustomerDetailTab, setCustomerFilter, setEditedOrder, setEditingItem, setEvents, setIsAddModalOpen, setIsCatalogRuleEditorOpen, setIsCityEditorOpen, setIsCouponEditorOpen, setIsEditingOrder, setIsEventEditorOpen, setIsFAQEditorOpen, setIsSaving, setIsSidebarOpen, setLocalAbandonedCarts, setLocalAbandonedCarts2, setLocalBlogPosts, setLocalBlogPosts2, setLocalCategories, setLocalCurrencies, setLocalCustomerGroups, setLocalCustomerGroups2, setLocalEmails, setLocalExpenses, setLocalLookbook, setLocalLookbook2, setLocalOrders, setLocalPacks, setLocalProducts, setLocalPushNotifications, setLocalReviews, setLocalReviews2, setLocalRole, setLocalRoles, setLocalShippingRules, setLocalShippingRules2, setLocalSubscribers, setLocalSystemNotifications, setLocalTaxRules, setLocalTaxRules2, setLocalUser, setLocalUsers, setLogFilter, setMessageInput, setModalType, setNewNote, setNewRMANote, setNotificationFilter, setNotificationPage, setOrderFilter, setOverviewOrderFilter, setProductFilter, setRequestLogFilter, setReviewFilter, setSearchResults, setSelectedCatalogRule, setSelectedCity, setSelectedConversation, setSelectedCoupon, setSelectedCustomer, setSelectedCustomerGroup, setSelectedEvent, setSelectedFAQ, setSelectedOrder, setSelectedPackProducts, setShowNotifications, setSiteConfig, setViewingCustomer, showNotifications, siteConfig, siteConfigs, sortByDate, stats, totalCustomers, totalOrdersCount, totalSales, totalVisitors, updateBlogPost, updateCatalogRule, updateCategory, updateCity, updateCoupon, updateCurrency, updateCustomerGroup, updateEvent, updateExpense, updateFAQ, updateLocalRole, updateLocalUser, updateLookbook, updateNavItem, updatePack, updateProduct, updateRMA, updateReview, updateShippingRule, updateSiteConfig, updateTaxRule, user, userRoleSlug, viewingCustomer } = ctx;
  return (
    <>
              {/* Sidebar Content */}
              <div className="space-y-8">
                <div className="bg-card p-8 rounded-3xl shadow-sm border border-primary/10 space-y-6">
                  <h4 className="text-lg font-bold text-primary border-b border-primary/5 pb-4">Visibilité</h4>
                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-2xl border border-primary/10">
                    <div>
                      <p className="font-bold text-sm text-primary">Statut du produit</p>
                      <p className="text-xs text-primary/60">{editingItem?.isAvailable !== false ? 'Visible sur la boutique' : 'Masqué pour les clients'}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setEditingItem(prev => ({ ...prev, isAvailable: !prev?.isAvailable }))}
                      className={`w-14 h-7 rounded-full relative transition-all duration-300 ${editingItem?.isAvailable !== false ? 'bg-primary' : 'bg-secondary/50'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-card rounded-full shadow-sm transition-all duration-300 ${editingItem?.isAvailable !== false ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="bg-card p-8 rounded-3xl shadow-sm border border-primary/10 space-y-6">
                  <h4 className="text-lg font-bold text-primary border-b border-primary/5 pb-4">Image du Produit</h4>
                  <div className="aspect-[4/5] bg-secondary/50 rounded-2xl border-2 border-dashed border-primary/10 flex flex-col items-center justify-center overflow-hidden relative group">
                    {editingItem?.image ? (
                      <>
                        <img src={editingItem.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" className="bg-card text-primary px-4 py-2 rounded-xl font-bold text-xs">Changer l'image</button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6">
                        <div className="w-12 h-12 bg-card rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-primary/60">
                          <ImageIcon size={24} />
                        </div>
                        <p className="text-sm font-bold text-primary">Ajouter une image</p>
                        <p className="text-xs text-primary/60 mt-1">Glissez-déposez ou cliquez pour parcourir</p>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-primary/60 text-center uppercase tracking-widest font-bold">Format recommandé: 800x1000px</p>
                </div>

                <div className="bg-card p-8 rounded-3xl shadow-sm border border-primary/10 space-y-6">
                  <h4 className="text-lg font-bold text-primary border-b border-primary/5 pb-4">Couleurs</h4>
                  <div className="flex flex-wrap gap-4 items-center">
                    {(editingItem?.colors || []).map((color: string) => (
                      <div key={color} className="relative group">
                        <div 
                          className="w-12 h-12 rounded-full border-2 border-primary ring-2 ring-primary/20 shadow-md transition-all group-hover:scale-105" 
                          style={{ backgroundColor: color }} 
                        />
                        <button 
                          type="button" 
                          onClick={() => {
                            setEditingItem((prev: any) => ({ 
                              ...prev, 
                              colors: (prev?.colors || []).filter((c: string) => c !== color) 
                            }));
                          }}
                          className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-lg flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all z-10"
                          title="Supprimer cette couleur"
                        >
                          <X size={14} strokeWidth={3} />
                        </button>
                      </div>
                    ))}
                    <div className="flex flex-col items-center gap-2">
                       <label className="w-12 h-12 rounded-full border-2 border-dashed border-primary/20 flex items-center justify-center text-primary/40 hover:border-accent hover:text-accent transition-all cursor-pointer relative bg-secondary/30 group">
                        <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        <input 
                          type="color" 
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                          onChange={(e) => {
                            const newColor = e.target.value;
                            const currentColors = editingItem?.colors || [];
                            if (!currentColors.includes(newColor)) {
                              setEditingItem((prev: any) => ({ ...prev, colors: [...currentColors, newColor] }));
                            }
                          }}
                        />
                      </label>
                      <span className="text-[10px] font-bold uppercase tracking-tighter text-primary/30">Ajouter</span>
                    </div>
                  </div>
                </div>
              </div>
    </>
  );
}
