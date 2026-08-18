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


export function AdminRmaDetail({ ctx }: { ctx: any }) {
  const { ABANDONED_CARTS, ANALYTICS, BLOG_POSTS, CATEGORIES, CATEGORY_DISTRIBUTION, CHAT_MESSAGES, CITIES, CONVERSATIONS, COUPONS, CUSTOMER_GROUPS, DEVICE_DATA, EMAILS, EXPENSES, FAQS, LOGIN_LOGS, LOOKBOOK_POSTS, NAV_ITEMS, NOTIFICATIONS, ORDERS, PACKS, PRODUCTS, PROMO_EVENTS, PUSH_NOTIFICATIONS, REQUEST_LOGS, RETENTION_DATA, REVENUE_BY_PAYMENT, REVIEWS, SALES_DATA, SHIPPING_RULES, SUBSCRIBERS, TAX_RULES, TRAFFIC_SOURCES, USERS, activeMenuItem, activeTab, addBlogPost, addCatalogRule, addCategory, addCity, addCoupon, addCurrency, addCustomerGroup, addEvent, addExpense, addFAQ, addLocalRole, addLookbook, addNavItem, addPack, addProduct, addRMA, addReview, addShippingRule, addTaxRule, allOrders, averageOrderValue, catalogRulesWithDefaults, categoryPage, currentImage, currentSlug, currentUserDoc, customerDetailTab, customerFilter, deleteAbandonedCart, deleteCatalogRule, deleteCategory, deleteChatMessage, deleteCity, deleteConversation, deleteCoupon, deleteCurrency, deleteCustomerGroup, deleteEvent, deleteFAQ, deleteLocalRole, deleteLoginLog, deleteNavItem, deleteNotification, deleteOrder, deletePack, deleteProduct, deleteRequestLog, deleteReview, deleteShippingRule, deleteSiteConfig, deleteSubscriber, deleteTaxRule, deleteUser, editedOrder, editingItem, events, fetchedProducts, filteredMenuItems, formatDate, handleDeleteCatalogRule, handleDeleteCity, handleDeleteEvent, handleDeleteFAQ, handleEditCatalogRule, handleEditCity, handleEditCoupon, handleEditEvent, handleEditFAQ, handleFormSubmit, handleNotificationClick, handleSaveCatalogRule, handleSaveCity, handleSaveCoupon, handleSaveEvent, handleSaveFAQ, handleSearch, handleSeed, handleSendMessage, hasPermission, isAddModalOpen, isAuthLoading, isCatalogRuleEditorOpen, isCityEditorOpen, isCouponEditorOpen, isDataLoading, isEditingOrder, isEventEditorOpen, isFAQEditorOpen, isLoadingAbandoned, isLoadingBlog, isLoadingCatalog, isLoadingCategories, isLoadingCategoryDist, isLoadingDevice, isLoadingEmails, isLoadingExpenses, isLoadingGroups, isLoadingLookbook, isLoadingOrders, isLoadingPacks, isLoadingProducts, isLoadingPush, isLoadingRetention, isLoadingRevenue, isLoadingReviews, isLoadingRoles, isLoadingShipping, isLoadingSubscribers, isLoadingTax, isLoadingTraffic, isLogsLoading, isSaving, isSidebarOpen, isSuperAdmin, isTabAllowed, isUserCustomer, itemsPerPage, localAbandonedCarts, localBlogPosts, localCatalogPriceRules, localCategories, localCurrencies, localCustomerGroups, localExpenses, localLookbook, localNavItems, localOrders, localPacks, localProducts, localRMAs, localReviews, localRoles, localShippingRules, localSystemNotifications, localTaxRules, localUsers, logFilter, menuItems, messageInput, modalType, navItemsWithDefaults, newNote, newRMANote, notificationFilter, notificationPage, onNavigate, orderFilter, overviewOrderFilter, permissions, productFilter, propSetSiteConfig, propSiteConfig, rawSiteConfig, realLogs, requestLogFilter, reviewFilter, roleData, saveAllSiteConfig, saveSiteSection, searchResults, selectedCatalogRule, selectedCity, selectedConversation, selectedCoupon, selectedCustomer, selectedCustomerGroup, selectedEvent, selectedFAQ, selectedOrder, selectedPackProducts, setActiveTab, setCategoryPage, setCurrentImage, setCurrentSlug, setCustomerDetailTab, setCustomerFilter, setEditedOrder, setEditingItem, setEvents, setIsAddModalOpen, setIsCatalogRuleEditorOpen, setIsCityEditorOpen, setIsCouponEditorOpen, setIsEditingOrder, setIsEventEditorOpen, setIsFAQEditorOpen, setIsSaving, setIsSidebarOpen, setLocalAbandonedCarts, setLocalAbandonedCarts2, setLocalBlogPosts, setLocalBlogPosts2, setLocalCategories, setLocalCurrencies, setLocalCustomerGroups, setLocalCustomerGroups2, setLocalEmails, setLocalExpenses, setLocalLookbook, setLocalLookbook2, setLocalOrders, setLocalPacks, setLocalProducts, setLocalPushNotifications, setLocalReviews, setLocalReviews2, setLocalRole, setLocalRoles, setLocalShippingRules, setLocalShippingRules2, setLocalSubscribers, setLocalSystemNotifications, setLocalTaxRules, setLocalTaxRules2, setLocalUser, setLocalUsers, setLogFilter, setMessageInput, setModalType, setNewNote, setNewRMANote, setNotificationFilter, setNotificationPage, setOrderFilter, setOverviewOrderFilter, setProductFilter, setRequestLogFilter, setReviewFilter, setSearchResults, setSelectedCatalogRule, setSelectedCity, setSelectedConversation, setSelectedCoupon, setSelectedCustomer, setSelectedCustomerGroup, setSelectedEvent, setSelectedFAQ, setSelectedOrder, setSelectedPackProducts, setShowNotifications, setSiteConfig, setViewingCustomer, showNotifications, siteConfig, siteConfigs, sortByDate, stats, totalCustomers, totalOrdersCount, totalSales, totalVisitors, updateBlogPost, updateCatalogRule, updateCategory, updateCity, updateCoupon, updateCurrency, updateCustomerGroup, updateEvent, updateExpense, updateFAQ, updateLocalRole, updateLocalUser, updateLookbook, updateNavItem, updatePack, updateProduct, updateRMA, updateReview, updateShippingRule, updateSiteConfig, updateTaxRule, user, userRoleSlug, viewingCustomer } = ctx;
  return (
    <>
{activeTab === 'rma-detail' && editingItem && (
          <div className="space-y-6">
             <div className="flex items-center gap-4 mb-6">
               <button onClick={() => { setActiveTab('rmas'); setEditingItem(null); }} className="p-2 hover:bg-secondary rounded-full transition-colors">
                 <ArrowUpRight className="rotate-180" size={24} />
               </button>
               <h2 className="text-2xl font-serif font-bold">Détail Retour #{editingItem.id}</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card p-8 rounded-[2rem] border border-primary/10 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-primary/60">Client</p>
                                <h3 className="text-xl font-bold text-primary">{editingItem.customer}</h3>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${
                                editingItem.status === 'approved' ? 'bg-green-200 text-green-800' :
                                editingItem.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                                editingItem.status === 'received' ? 'bg-blue-200 text-blue-800' :
                                editingItem.status === 'refunded' ? 'bg-purple-200 text-purple-800' :
                                'bg-red-200 text-red-800'
                            }`}>
                                {editingItem.status}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-1">Commande</p>
                                <button 
                                  onClick={() => {
                                    const order = localOrders.find(o => o.id === editingItem.orderId);
                                    if (order) {
                                      setSelectedOrder(order);
                                      setActiveTab('order-detail');
                                    } else {
                                      toast.error('Commande non trouvée');
                                    }
                                  }}
                                  className="font-mono font-bold text-primary hover:underline"
                                >
                                  {editingItem.orderId}
                                </button>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-1">Date de demande</p>
                                <p className="font-medium">{editingItem.date}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-1">Montant à rembourser</p>
                                <p className="font-bold text-lg text-primary">{editingItem.amount.toLocaleString()} FCFA</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-1">Raison du retour</p>
                                <p className="font-medium">{editingItem.reason}</p>
                            </div>
                        </div>

                        {/* Verification Photo Section */}
                        {editingItem.productPhotoUrl && (
                          <div className="border-t border-primary/10 pt-6 mt-6">
                            <h4 className="font-serif font-bold text-lg mb-2 flex items-center gap-2 text-primary">
                              <ImageIcon size={20} className="text-primary" />
                              Photo de Vérification de l'État du Produit
                            </h4>
                            <p className="text-xs text-primary/60 mb-4">
                              Photo transmise par le client lors de la demande pour attester que l'article n'a pas été abîmé.
                            </p>
                            <div className="rounded-2xl overflow-hidden border border-primary/10 bg-slate-100 max-h-96 flex items-center justify-center p-2">
                              <img 
                                src={editingItem.productPhotoUrl} 
                                alt="Photo de vérification du retour" 
                                className="max-h-92 object-contain rounded-xl shadow-sm"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </div>
                        )}

                        {/* Order Items Preview */}
                        <div className="border-t border-primary/5 pt-6 mt-6">
                          <h4 className="font-serif font-bold text-lg mb-4">Articles de la commande</h4>
                          <div className="space-y-4">
                            {localOrders.find(o => o.id === editingItem.orderId)?.orderDetails?.map((item, i) => (
                              <div key={i} className="flex justify-between items-center bg-secondary p-4 rounded-xl">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-card rounded-lg overflow-hidden border border-primary/10">
                                    <img 
                                      src={localProducts.find(p => p.id === item.productId)?.image} 
                                      alt={item.name} 
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-bold text-sm text-primary">{item.name}</p>
                                    <p className="text-xs text-primary/60">Quantité: {item.quantity}</p>
                                  </div>
                                </div>
                                <p className="font-bold text-sm text-primary">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                              </div>
                            ))}
                          </div>
                        </div>
                    </div>

                    {/* Internal Notes */}
                    <div className="bg-secondary/30 p-8 rounded-[2rem] border border-primary/10 shadow-sm">
                      <h4 className="font-serif font-bold text-lg mb-6 flex items-center gap-2 text-primary">
                        <MessageSquare size={20} className="text-primary" /> Notes Internes
                      </h4>
                      
                      <div className="space-y-4 mb-6">
                        {editingItem.internalNotes && editingItem.internalNotes.length > 0 ? (
                          editingItem.internalNotes.map(note => (
                            <div key={note.id} className="bg-secondary/50 p-4 rounded-2xl border border-primary/10">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-xs text-primary">{note.author}</span>
                                <span className="text-[10px] text-primary/60">{note.date}</span>
                              </div>
                              <p className="text-sm text-primary/80">{note.note}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-primary/40 italic text-center py-4">Aucune note interne pour le moment.</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="Ajouter une note interne..."
                          value={newRMANote}
                          onChange={(e) => setNewRMANote(e.target.value)}
                          className="flex-grow bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const note = e.currentTarget.value;
                              if (!note.trim()) return;
                              
                              const noteObj = {
                                id: Math.random().toString(36).substr(2, 9),
                                date: new Date().toLocaleString(),
                                note,
                                author: 'Admin'
                              };
                              
                              const updatedRMA = { 
                                ...editingItem, 
                                internalNotes: [...(editingItem.internalNotes || []), noteObj] 
                              };
                              
                              updateRMA(editingItem.id, { internalNotes: updatedRMA.internalNotes });
                              setEditingItem(updatedRMA);
                              setNewRMANote('');
                              toast.success('Note ajoutée');
                            }
                          }}
                        />
                        <button 
                          onClick={() => {
                            if (!newRMANote.trim()) return;
                            
                            const noteObj = {
                              id: Math.random().toString(36).substr(2, 9),
                              date: new Date().toLocaleString(),
                              note: newRMANote,
                              author: 'Admin'
                            };
                            
                            const updatedRMA = { 
                              ...editingItem, 
                              internalNotes: [...(editingItem.internalNotes || []), noteObj] 
                            };
                            
                            updateRMA(editingItem.id, { internalNotes: updatedRMA.internalNotes });
                            setEditingItem(updatedRMA);
                            setNewRMANote('');
                            toast.success('Note ajoutée');
                          }}
                          className="bg-primary text-white p-3 rounded-xl hover:bg-accent transition-all"
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </div>
                </div>
                
                <div className="space-y-6">
                    <div className="bg-secondary/30 p-6 rounded-[2rem] border border-primary/10 shadow-sm">
                        <h4 className="font-serif font-bold text-lg mb-4 text-primary">Mettre à jour le statut</h4>
                        <div className="space-y-3">
                            <button 
                                onClick={() => {
                                    toast.success('Retour approuvé avec succès');
                                    updateRMA(editingItem.id, { status: 'approved' });
                                    setActiveTab('rmas');
                                    setEditingItem(null);
                                }}
                                disabled={editingItem.status === 'approved'}
                                className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg ${
                                  editingItem.status === 'approved' 
                                  ? 'bg-primary/10 text-primary/40 cursor-not-allowed' 
                                  : 'bg-green-700/80 text-white hover:bg-green-700 shadow-green-500/10'
                                }`}
                            >
                                Approuver le retour
                            </button>
                            <button 
                                onClick={() => {
                                    toast.success('Retour marqué comme reçu');
                                    updateRMA(editingItem.id, { status: 'received' });
                                    setActiveTab('rmas');
                                    setEditingItem(null);
                                }}
                                disabled={editingItem.status === 'received'}
                                className={`w-full py-3 rounded-xl font-bold transition-all ${
                                  editingItem.status === 'received'
                                  ? 'bg-primary/10 text-primary/40 cursor-not-allowed'
                                  : 'bg-blue-700/80 text-white hover:bg-blue-700 shadow-blue-500/10'
                                }`}
                            >
                                Marquer comme reçu
                            </button>
                            <button 
                                onClick={() => {
                                    toast.success('Remboursement effectué');
                                    updateRMA(editingItem.id, { status: 'refunded' });
                                    setActiveTab('rmas');
                                    setEditingItem(null);
                                }}
                                disabled={editingItem.status === 'refunded'}
                                className={`w-full py-3 rounded-xl font-bold transition-all ${
                                  editingItem.status === 'refunded'
                                  ? 'bg-primary/10 text-primary/40 cursor-not-allowed'
                                  : 'bg-primary text-white hover:bg-accent shadow-lg'
                                }`}
                            >
                                Rembourser
                            </button>
                            <button 
                                onClick={() => {
                                    toast.error('Retour refusé');
                                    updateRMA(editingItem.id, { status: 'rejected' });
                                    setActiveTab('rmas');
                                    setEditingItem(null);
                                }}
                                disabled={editingItem.status === 'rejected'}
                                className={`w-full py-3 rounded-xl font-bold transition-all ${
                                  editingItem.status === 'rejected'
                                  ? 'bg-primary/10 text-primary/40 cursor-not-allowed'
                                  : 'border border-red-500/30 text-red-500 hover:bg-red-500/10'
                                }`}
                            >
                                Refuser
                            </button>
                        </div>
                    </div>

                    <div className="bg-secondary/30 p-6 rounded-[2rem] border border-primary/10 shadow-sm">
                      <h4 className="font-serif font-bold text-lg mb-4 text-primary">Historique Statut</h4>
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${editingItem.status === 'pending' ? 'bg-yellow-600 animate-pulse' : 'bg-green-600'}`} />
                            <div className="w-0.5 h-full bg-primary/10" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-primary">Demande soumise</p>
                            <p className="text-[10px] text-primary/60">{editingItem.date}</p>
                          </div>
                        </div>
                        {['approved', 'received', 'refunded', 'rejected'].includes(editingItem.status) && (
                          <div className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full ${['approved', 'received', 'refunded', 'rejected'].includes(editingItem.status) ? 'bg-green-600' : 'bg-primary/20'}`} />
                              <div className="w-0.5 h-full bg-primary/10" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-primary">Traitement en cours</p>
                              <p className="text-[10px] text-primary/60">Mis à jour récemment</p>
                            </div>
                          </div>
                        )}
                        {editingItem.status === 'refunded' && (
                          <div className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 rounded-full bg-green-600" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-primary">Remboursé</p>
                              <p className="text-[10px] text-primary/60">Finalisé</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                </div>
            </div>
          </div>
        )}
    </>
  );
}
