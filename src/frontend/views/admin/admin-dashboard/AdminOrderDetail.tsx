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


export function AdminOrderDetail({ ctx }: { ctx: any }) {
  const { ABANDONED_CARTS, ANALYTICS, BLOG_POSTS, CATEGORIES, CATEGORY_DISTRIBUTION, CHAT_MESSAGES, CITIES, CONVERSATIONS, COUPONS, CUSTOMER_GROUPS, DEVICE_DATA, EMAILS, EXPENSES, FAQS, LOGIN_LOGS, LOOKBOOK_POSTS, NAV_ITEMS, NOTIFICATIONS, ORDERS, PACKS, PRODUCTS, PROMO_EVENTS, PUSH_NOTIFICATIONS, REQUEST_LOGS, RETENTION_DATA, REVENUE_BY_PAYMENT, REVIEWS, SALES_DATA, SHIPPING_RULES, SUBSCRIBERS, TAX_RULES, TRAFFIC_SOURCES, USERS, activeMenuItem, activeTab, addBlogPost, addCatalogRule, addCategory, addCity, addCoupon, addCurrency, addCustomerGroup, addEvent, addExpense, addFAQ, addLocalRole, addLookbook, addNavItem, addPack, addProduct, addRMA, addReview, addShippingRule, addTaxRule, allOrders, averageOrderValue, catalogRulesWithDefaults, categoryPage, currentImage, currentSlug, currentUserDoc, customerDetailTab, customerFilter, deleteAbandonedCart, deleteCatalogRule, deleteCategory, deleteChatMessage, deleteCity, deleteConversation, deleteCoupon, deleteCurrency, deleteCustomerGroup, deleteEvent, deleteFAQ, deleteLocalRole, deleteLoginLog, deleteNavItem, deleteNotification, deleteOrder, deletePack, deleteProduct, deleteRequestLog, deleteReview, deleteShippingRule, deleteSiteConfig, deleteSubscriber, deleteTaxRule, deleteUser, editedOrder, editingItem, events, fetchedProducts, filteredMenuItems, formatDate, handleDeleteCatalogRule, handleDeleteCity, handleDeleteEvent, handleDeleteFAQ, handleEditCatalogRule, handleEditCity, handleEditCoupon, handleEditEvent, handleEditFAQ, handleFormSubmit, handleNotificationClick, handleSaveCatalogRule, handleSaveCity, handleSaveCoupon, handleSaveEvent, handleSaveFAQ, handleSearch, handleSeed, handleSendMessage, hasPermission, isAddModalOpen, isAuthLoading, isCatalogRuleEditorOpen, isCityEditorOpen, isCouponEditorOpen, isDataLoading, isEditingOrder, isEventEditorOpen, isFAQEditorOpen, isLoadingAbandoned, isLoadingBlog, isLoadingCatalog, isLoadingCategories, isLoadingCategoryDist, isLoadingDevice, isLoadingEmails, isLoadingExpenses, isLoadingGroups, isLoadingLookbook, isLoadingOrders, isLoadingPacks, isLoadingProducts, isLoadingPush, isLoadingRetention, isLoadingRevenue, isLoadingReviews, isLoadingRoles, isLoadingShipping, isLoadingSubscribers, isLoadingTax, isLoadingTraffic, isLogsLoading, isSaving, isSidebarOpen, isSuperAdmin, isTabAllowed, isUserCustomer, itemsPerPage, localAbandonedCarts, localBlogPosts, localCatalogPriceRules, localCategories, localCurrencies, localCustomerGroups, localExpenses, localLookbook, localNavItems, localOrders, localPacks, localProducts, localRMAs, localReviews, localRoles, localShippingRules, localSystemNotifications, localTaxRules, localUsers, logFilter, menuItems, messageInput, modalType, navItemsWithDefaults, newNote, newRMANote, notificationFilter, notificationPage, onNavigate, orderFilter, overviewOrderFilter, permissions, productFilter, propSetSiteConfig, propSiteConfig, rawSiteConfig, realLogs, requestLogFilter, reviewFilter, roleData, saveAllSiteConfig, saveSiteSection, searchResults, selectedCatalogRule, selectedCity, selectedConversation, selectedCoupon, selectedCustomer, selectedCustomerGroup, selectedEvent, selectedFAQ, selectedOrder, selectedPackProducts, setActiveTab, setCategoryPage, setCurrentImage, setCurrentSlug, setCustomerDetailTab, setCustomerFilter, setEditedOrder, setEditingItem, setEvents, setIsAddModalOpen, setIsCatalogRuleEditorOpen, setIsCityEditorOpen, setIsCouponEditorOpen, setIsEditingOrder, setIsEventEditorOpen, setIsFAQEditorOpen, setIsSaving, setIsSidebarOpen, setLocalAbandonedCarts, setLocalAbandonedCarts2, setLocalBlogPosts, setLocalBlogPosts2, setLocalCategories, setLocalCurrencies, setLocalCustomerGroups, setLocalCustomerGroups2, setLocalEmails, setLocalExpenses, setLocalLookbook, setLocalLookbook2, setLocalOrders, setLocalPacks, setLocalProducts, setLocalPushNotifications, setLocalReviews, setLocalReviews2, setLocalRole, setLocalRoles, setLocalShippingRules, setLocalShippingRules2, setLocalSubscribers, setLocalSystemNotifications, setLocalTaxRules, setLocalTaxRules2, setLocalUser, setLocalUsers, setLogFilter, setMessageInput, setModalType, setNewNote, setNewRMANote, setNotificationFilter, setNotificationPage, setOrderFilter, setOverviewOrderFilter, setProductFilter, setRequestLogFilter, setReviewFilter, setSearchResults, setSelectedCatalogRule, setSelectedCity, setSelectedConversation, setSelectedCoupon, setSelectedCustomer, setSelectedCustomerGroup, setSelectedEvent, setSelectedFAQ, setSelectedOrder, setSelectedPackProducts, setShowNotifications, setSiteConfig, setViewingCustomer, showNotifications, siteConfig, siteConfigs, sortByDate, stats, totalCustomers, totalOrdersCount, totalSales, totalVisitors, updateBlogPost, updateCatalogRule, updateCategory, updateCity, updateCoupon, updateCurrency, updateCustomerGroup, updateEvent, updateExpense, updateFAQ, updateLocalRole, updateLocalUser, updateLookbook, updateNavItem, updatePack, updateProduct, updateRMA, updateReview, updateShippingRule, updateSiteConfig, updateTaxRule, user, userRoleSlug, viewingCustomer } = ctx;
  return (
    <>
{activeTab === 'order-detail' && selectedOrder && (
          <div className="space-y-8 pb-12">
            {/* Header with Back Button and Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    setActiveTab('orders');
                    setSelectedOrder(null);
                    setIsEditingOrder(false);
                    setEditedOrder(null);
                  }} 
                  className="p-2 bg-card rounded-full shadow-sm hover:bg-secondary/50 transition-colors border border-primary/10"
                >
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-primary">Détails de la Commande</h2>
                  <p className="text-sm text-primary/60">ID: {selectedOrder.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!isEditingOrder ? (
                  <button 
                    onClick={() => { setIsEditingOrder(true); setEditedOrder(selectedOrder); }}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary/50 text-primary/80 rounded-lg hover:bg-secondary/80 transition-colors text-sm font-bold border border-primary/10"
                  >
                    <Edit size={16} /> Modifier
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setIsEditingOrder(false); setEditedOrder(null); }}
                      className="px-4 py-2 bg-secondary/50 text-primary/80 rounded-lg hover:bg-secondary/80 transition-colors text-sm font-bold border border-primary/10"
                    >
                      Annuler
                    </button>
                    <button 
                      onClick={() => {
                        if (editedOrder) {
                          setLocalOrders(prev => prev.map(o => o.id === editedOrder.id ? { ...editedOrder, updatedAt: new Date().toISOString() } : o));
                          setSelectedOrder(editedOrder);
                          setIsEditingOrder(false);
                          toast.success('Commande mise à jour avec succès');
                        }
                      }}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent transition-colors text-sm font-bold shadow-md"
                    >
                      Enregistrer
                    </button>
                  </div>
                )}
                <button 
                  onClick={() => {
                    generateInvoicePDF(selectedOrder);
                  }}
                  className={`px-4 py-2 rounded-xl font-bold transition-all shadow-md text-sm flex items-center gap-2 bg-primary text-white hover:bg-accent`}
                >
                  <Download size={16} /> Facture
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Main Order Content */}
                <div className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-primary/60">Contenu de la commande</h4>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                          {(isEditingOrder ? editedOrder : selectedOrder)?.type || 'standard'}
                        </span>
                      </div>
                      <div className="space-y-4">
                        {(() => {
                          const currentOrder = isEditingOrder ? editedOrder : selectedOrder;
                          const items = currentOrder?.orderDetails || (Array.isArray(currentOrder?.items) ? currentOrder?.items : []);
                          
                          if (!items || items.length === 0) {
                            return (
                              <div className="p-8 text-center bg-secondary/30 rounded-3xl border border-primary/5">
                                <Package size={32} className="mx-auto text-primary/20 mb-3" />
                                <p className="text-sm text-primary/40 italic">Aucun produit listé dans cette commande.</p>
                              </div>
                            );
                          }

                          return items.map((item, i) => {
                            const product = PRODUCTS.find(p => p.id === item.productId || p.id === item.id);
                            return (
                              <div key={i} className="group relative flex justify-between items-center p-4 bg-secondary/30 border border-primary/5 rounded-2xl hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-4 flex-grow">
                                  {product?.image || item.image ? (
                                    <img src={product?.image || item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover border border-primary/10 shadow-sm" />
                                  ) : (
                                    <div className="w-14 h-14 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                                      <Package size={24} className="text-primary/40" />
                                    </div>
                                  )}
                                  <div className="flex-grow">
                                    <div className="flex items-center gap-2">
                                      <p className="font-bold text-sm text-primary">{item.name}</p>
                                      <span className="text-[9px] px-1.5 py-0.5 bg-primary/5 text-primary/60 rounded border border-primary/5 font-mono uppercase">
                                        {item.type || 'produit'}
                                      </span>
                                    </div>
                                    {isEditingOrder ? (
                                      <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs text-primary/60">Qté:</span>
                                        <input 
                                          type="number" 
                                          min="1"
                                          value={item.quantity}
                                          onChange={(e) => {
                                            const newQty = parseInt(e.target.value) || 1;
                                            setEditedOrder(prev => {
                                              if (!prev) return prev;
                                              const newDetails = [...(prev.orderDetails || [])];
                                              if (newDetails[i]) {
                                                newDetails[i] = { ...newDetails[i], quantity: newQty };
                                              }
                                              const newTotal = newDetails.reduce((sum, d) => sum + (d.price * d.quantity), 0);
                                              return { ...prev, orderDetails: newDetails, total: newTotal, items: newDetails.reduce((sum, d) => sum + d.quantity, 0) };
                                            });
                                          }}
                                          className="w-16 p-1 border border-primary/10 rounded text-sm bg-card text-primary"
                                        />
                                        <button 
                                          onClick={() => {
                                            setEditedOrder(prev => {
                                              if (!prev || !prev.orderDetails) return prev;
                                              const newDetails = prev.orderDetails.filter((_, idx) => idx !== i);
                                              const newTotal = newDetails.reduce((sum, d) => sum + (d.price * d.quantity), 0);
                                              return { ...prev, orderDetails: newDetails, total: newTotal, items: newDetails.reduce((sum, d) => sum + d.quantity, 0) };
                                            });
                                          }}
                                          className="text-accent p-1 hover:bg-accent/10 rounded transition-colors"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    ) : (
                                      <p className="text-xs text-primary/60 mt-1">
                                        Quantité: <span className="font-bold text-primary/80">{item.quantity}</span> x {item.price.toLocaleString()} FCFA
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right ml-4">
                                  <p className="font-bold text-primary">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                                </div>
                              </div>
                            );
                          });
                        })()}

                        {/* Summary Section */}
                        <div className="pt-6 mt-4 border-t border-primary/10 space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-primary/60">Sous-total Articles</span>
                            <span className="font-bold text-primary">
                              {(() => {
                                const currentOrder = isEditingOrder ? editedOrder : selectedOrder;
                                const items = currentOrder?.orderDetails || (Array.isArray(currentOrder?.items) ? currentOrder?.items : []);
                                const subtotal = items.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
                                return subtotal.toLocaleString();
                              })()} FCFA
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-primary/60">Frais de livraison</span>
                            <span className="font-bold text-primary">
                              {((isEditingOrder ? editedOrder : selectedOrder)?.shippingFee || 0).toLocaleString()} FCFA
                            </span>
                          </div>
                          
                          {(() => {
                            const currentOrder = isEditingOrder ? editedOrder : selectedOrder;
                            const items = currentOrder?.orderDetails || (Array.isArray(currentOrder?.items) ? currentOrder?.items : []);
                            const subtotal = items.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
                            const discount = (subtotal + (currentOrder?.shippingFee || 0)) - (currentOrder?.total || 0);
                            if (discount > 0) {
                              return (
                                <div className="flex justify-between items-center text-sm p-2 bg-accent/5 rounded-xl border border-accent/10">
                                  <div className="flex items-center gap-2 text-accent">
                                    <Tag size={14} />
                                    <span className="font-bold text-[10px] uppercase tracking-wider">Réduction</span>
                                  </div>
                                  <div className="flex gap-2 text-accent font-bold">
                                     -{discount.toLocaleString()} FCFA
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}

                          {(isEditingOrder ? editedOrder : selectedOrder)?.type === 'b2b' && (
                            <div className="flex justify-between items-center text-sm text-primary/60">
                              <p>TVA (19.25%)</p>
                              <p>{(isEditingOrder ? editedOrder : selectedOrder)?.taxAmount?.toLocaleString() || 0} FCFA</p>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center pt-4 border-t border-primary/5">
                            <p className="font-serif text-xl font-bold text-primary">Total Final</p>
                            <p className="text-3xl font-bold text-accent">{(isEditingOrder ? editedOrder : selectedOrder)?.total.toLocaleString()} FCFA</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-4">Informations Client</h4>
                        <div className="bg-secondary/30 p-6 rounded-3xl border border-primary/5 relative">
                          <div className="flex items-center gap-4 mb-4">
                            {(() => {
                              const customerUser = USERS.find(u => u.id === selectedOrder.userId || (u as any).uid === selectedOrder.userId || u.name === selectedOrder.customer);
                              if (customerUser?.profileImage) {
                                return <img src={customerUser.profileImage} className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm" alt={selectedOrder.customer} />;
                              }
                              return (
                                <div className="w-14 h-14 rounded-2xl bg-white/50 flex items-center justify-center border border-primary/10">
                                  <User size={24} className="text-primary/30" />
                                </div>
                              );
                            })()}
                            <div>
                               <p className="font-bold text-lg text-primary leading-tight">{selectedOrder.customer}</p>
                               {selectedOrder.email && <p className="text-[10px] text-primary/40 font-mono">{selectedOrder.email}</p>}
                            </div>
                          </div>
                          
                          {isEditingOrder ? (
                            <div className="space-y-3">
                              <div>
                                <label className="text-xs font-bold text-primary/60">Adresse de livraison</label>
                                <textarea 
                                  value={editedOrder?.address || ''}
                                  onChange={(e) => setEditedOrder(prev => prev ? { ...prev, address: e.target.value } : null)}
                                  className="w-full mt-1 p-2 border border-primary/10 rounded-lg text-sm bg-card text-primary focus:border-primary focus:outline-none"
                                  rows={3}
                                />
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-primary/60">{(() => {
                              let addr = selectedOrder.address || 'Adresse non renseignée';
                              // Support multiple formats of coordinates in the address string
                              const formats = [
                                /\(Coordonnées:\s*([0-9.-]+)\s*,\s*([0-9.-]+)\)/,
                                /Lat:\s*[0-9.-]+,\s*Lon:\s*[0-9.-]+/i,
                                /GPS:\s*[0-9.-]+,\s*[0-9.-]+/i
                              ];
                              
                              formats.forEach(regex => {
                                const match = addr.match(regex);
                                if (match) {
                                  addr = addr.replace(match[0], '').replace(/^[,\s]+|[,\s]+$/g, '').trim();
                                }
                              });
                              
                              return addr || 'Adresse non renseignée';
                            })()}</p>
                          )}

                          <div className="mt-4 flex gap-2">
                            <span className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary">
                              {selectedOrder.paymentMethod}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusStyles(selectedOrder.status)}`}>
                              {selectedOrder.status}
                            </span>
                          </div>
                          
                          <button 
                            onClick={() => {
                              const user = USERS.find(u => u.id === selectedOrder.userId || (u as any).uid === selectedOrder.userId || u.name === selectedOrder.customer);
                              if (user) {
                                setSelectedCustomer(user);
                                setActiveTab('customer-detail');
                              } else {
                                toast.error("Profil client introuvable");
                              }
                            }}
                            className="absolute top-6 right-6 p-3 bg-card rounded-full shadow-sm text-primary hover:text-accent hover:shadow-md transition-all border border-primary/10"
                            title="Voir le profil client"
                          >
                            <User size={20} />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-4">Statut & Expédition</h4>
                        <div className="bg-secondary/30 p-6 rounded-3xl border border-primary/5 space-y-4">
                          <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-primary/60">Statut de la commande</label>
                            <select 
                              className="bg-card border border-primary/10 rounded-lg px-3 py-2 text-sm font-bold text-primary focus:outline-none focus:border-primary"
                              value={isEditingOrder ? editedOrder?.status : selectedOrder.status}
                              onChange={(e) => {
                                  const newStatus = e.target.value as any;
                                  if (isEditingOrder) {
                                    setEditedOrder(prev => prev ? { ...prev, status: newStatus } : null);
                                  } else {
                                    const updatedOrder = { ...selectedOrder, status: newStatus, updatedAt: new Date().toISOString() };
                                    setLocalOrders(prev => prev.map(o => o.id === selectedOrder.id ? updatedOrder : o));
                                    setSelectedOrder(updatedOrder);
                                    toast.success(`Statut mis à jour : ${newStatus}`);
                                  }
                              }}
                            >
                                <option value="pending">En attente</option>
                                <option value="processing">Traitement</option>
                                <option value="shipped">Expédiée</option>
                                <option value="delivered">Livrée</option>
                                <option value="cancelled">Annulée</option>
                            </select>
                          </div>

                          {isEditingOrder ? (
                            <div className="pt-4 border-t border-primary/5">
                              <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-3">
                                <Truck size={18} className="text-primary" />
                                <div>
                                  <p className="text-xs font-bold text-primary">Livraison Interne</p>
                                  <p className="text-[10px] text-primary/60">Livré directement par notre équipe.</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="pt-4 border-t border-primary/5">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-primary/60">Mode de livraison:</span>
                                <span className="font-bold text-primary flex items-center gap-2">
                                  <Truck size={14} /> Livraison Interne
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline / Logs of the order could go here */}
              </div>

              <div className="space-y-8">
                {/* Map Section */}
                {(() => {
                  let coords: [number, number] | null = null;
                  if (Array.isArray(selectedOrder.coordinates)) {
                    coords = selectedOrder.coordinates as [number, number];
                  } else if (typeof selectedOrder.coordinates === 'string' && selectedOrder.coordinates.includes(',')) {
                    const parts = selectedOrder.coordinates.split(',');
                    coords = [parseFloat(parts[0]), parseFloat(parts[1])];
                  }
                  
                  if (!coords && selectedOrder.address) {
                    const match = selectedOrder.address.match(/\(Coordonnées:\s*([0-9.-]+)\s*,\s*([0-9.-]+)\)/);
                    if (match) {
                      coords = [parseFloat(match[1]), parseFloat(match[2])];
                    }
                  }

                  if (!coords || isNaN(coords[0]) || isNaN(coords[1])) {
                    return null;
                  }

                  return (
                    <div className="bg-card p-6 rounded-[2.5rem] shadow-sm border border-primary/10 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-primary/60">Localisation de livraison</h4>
                      <div className="h-[250px] rounded-2xl overflow-hidden border border-primary/5 shadow-inner">
                        <OrderMap 
                          customerLocation={coords} 
                          customerName={selectedOrder.customer}
                        />
                      </div>
                      <div className="p-3 bg-primary/5 rounded-xl border border-primary/5 flex gap-3">
                        <Info size={16} className="text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-[10px] text-primary/70 leading-relaxed italic">
                          L'itinéraire affiché est une estimation basée sur les coordonnées GPS.
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Internal Notes */}
                <div className="bg-card p-6 rounded-[2.5rem] shadow-sm border border-primary/10 space-y-6">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-primary/60">Notes Internes</h4>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                    {selectedOrder.internalNotes && selectedOrder.internalNotes.length > 0 ? (
                      selectedOrder.internalNotes.map((note, idx) => {
                        const noteData = typeof note === 'string' ? { id: idx.toString(), note, author: 'Système', date: new Date().toISOString() } : note;
                        return (
                          <div key={noteData.id} className="bg-secondary/30 p-4 rounded-2xl border border-primary/5 space-y-2">
                            <p className="text-sm text-primary/80">{noteData.note}</p>
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-primary/40">
                              <span>{noteData.author}</span>
                              <span>{formatDate(noteData.date)}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-primary/40 italic text-center py-4">Aucune note pour le moment.</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 pt-4 border-t border-primary/5">
                    <input 
                      type="text" 
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Ajouter une note..."
                      className="flex-grow p-3 text-sm bg-secondary/30 border border-primary/5 rounded-xl focus:outline-none focus:border-primary/20 text-primary"
                    />
                    <button 
                      onClick={() => {
                        if (!newNote.trim()) return;
                        const noteObj = {
                          id: `note-${Date.now()}`,
                          date: new Date().toISOString(),
                          note: newNote,
                          author: 'Admin'
                        };
                        const updatedOrder = { 
                          ...selectedOrder, 
                          internalNotes: [...(selectedOrder.internalNotes || []), noteObj],
                          updatedAt: new Date().toISOString()
                        };
                        setLocalOrders(prev => prev.map(o => o.id === selectedOrder.id ? updatedOrder : o));
                        setSelectedOrder(updatedOrder);
                        setNewNote('');
                        toast.success('Note ajoutée');
                      }}
                      className="p-3 bg-primary text-white rounded-xl hover:bg-accent transition-colors shadow-md"
                    >
                      <Plus size={18} />
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
