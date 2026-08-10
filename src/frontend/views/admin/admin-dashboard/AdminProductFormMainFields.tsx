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
import { RichTextEditor } from '../../../components/ui/RichTextEditor';
export function AdminProductFormMainFields({ ctx }: { ctx: any }) {
  const { ABANDONED_CARTS, ANALYTICS, BLOG_POSTS, CATEGORIES, CATEGORY_DISTRIBUTION, CHAT_MESSAGES, CITIES, CONVERSATIONS, COUPONS, CUSTOMER_GROUPS, DEVICE_DATA, EMAILS, EXPENSES, FAQS, LOGIN_LOGS, LOOKBOOK_POSTS, NAV_ITEMS, NOTIFICATIONS, ORDERS, PACKS, PRODUCTS, PROMO_EVENTS, PUSH_NOTIFICATIONS, REQUEST_LOGS, RETENTION_DATA, REVENUE_BY_PAYMENT, REVIEWS, SALES_DATA, SHIPPING_RULES, SUBSCRIBERS, TAX_RULES, TRAFFIC_SOURCES, USERS, activeMenuItem, activeTab, addBlogPost, addCatalogRule, addCategory, addCity, addCoupon, addCurrency, addCustomerGroup, addEvent, addExpense, addFAQ, addLocalRole, addLookbook, addNavItem, addPack, addProduct, addRMA, addReview, addShippingRule, addTaxRule, allOrders, averageOrderValue, catalogRulesWithDefaults, categoryPage, currentImage, currentSlug, currentUserDoc, customerDetailTab, customerFilter, deleteAbandonedCart, deleteCatalogRule, deleteCategory, deleteChatMessage, deleteCity, deleteConversation, deleteCoupon, deleteCurrency, deleteCustomerGroup, deleteEvent, deleteFAQ, deleteLocalRole, deleteLoginLog, deleteNavItem, deleteNotification, deleteOrder, deletePack, deleteProduct, deleteRequestLog, deleteReview, deleteShippingRule, deleteSiteConfig, deleteSubscriber, deleteTaxRule, deleteUser, editedOrder, editingItem, events, fetchedProducts, filteredMenuItems, formatDate, handleDeleteCatalogRule, handleDeleteCity, handleDeleteEvent, handleDeleteFAQ, handleEditCatalogRule, handleEditCity, handleEditCoupon, handleEditEvent, handleEditFAQ, handleFormSubmit, handleNotificationClick, handleSaveCatalogRule, handleSaveCity, handleSaveCoupon, handleSaveEvent, handleSaveFAQ, handleSearch, handleSeed, handleSendMessage, hasPermission, isAddModalOpen, isAuthLoading, isCatalogRuleEditorOpen, isCityEditorOpen, isCouponEditorOpen, isDataLoading, isEditingOrder, isEventEditorOpen, isFAQEditorOpen, isLoadingAbandoned, isLoadingBlog, isLoadingCatalog, isLoadingCategories, isLoadingCategoryDist, isLoadingDevice, isLoadingEmails, isLoadingExpenses, isLoadingGroups, isLoadingLookbook, isLoadingOrders, isLoadingPacks, isLoadingProducts, isLoadingPush, isLoadingRetention, isLoadingRevenue, isLoadingReviews, isLoadingRoles, isLoadingShipping, isLoadingSubscribers, isLoadingTax, isLoadingTraffic, isLogsLoading, isSaving, isSidebarOpen, isSuperAdmin, isTabAllowed, isUserCustomer, itemsPerPage, localAbandonedCarts, localBlogPosts, localCatalogPriceRules, localCategories, localCurrencies, localCustomerGroups, localExpenses, localLookbook, localNavItems, localOrders, localPacks, localProducts, localRMAs, localReviews, localRoles, localShippingRules, localSystemNotifications, localTaxRules, localUsers, logFilter, menuItems, messageInput, modalType, navItemsWithDefaults, newNote, newRMANote, notificationFilter, notificationPage, onNavigate, orderFilter, overviewOrderFilter, permissions, productFilter, propSetSiteConfig, propSiteConfig, rawSiteConfig, realLogs, requestLogFilter, reviewFilter, roleData, saveAllSiteConfig, saveSiteSection, searchResults, selectedCatalogRule, selectedCity, selectedConversation, selectedCoupon, selectedCustomer, selectedCustomerGroup, selectedEvent, selectedFAQ, selectedOrder, selectedPackProducts, setActiveTab, setCategoryPage, setCurrentImage, setCurrentSlug, setCustomerDetailTab, setCustomerFilter, setEditedOrder, setEditingItem, setEvents, setIsAddModalOpen, setIsCatalogRuleEditorOpen, setIsCityEditorOpen, setIsCouponEditorOpen, setIsEditingOrder, setIsEventEditorOpen, setIsFAQEditorOpen, setIsSaving, setIsSidebarOpen, setLocalAbandonedCarts, setLocalAbandonedCarts2, setLocalBlogPosts, setLocalBlogPosts2, setLocalCategories, setLocalCurrencies, setLocalCustomerGroups, setLocalCustomerGroups2, setLocalEmails, setLocalExpenses, setLocalLookbook, setLocalLookbook2, setLocalOrders, setLocalPacks, setLocalProducts, setLocalPushNotifications, setLocalReviews, setLocalReviews2, setLocalRole, setLocalRoles, setLocalShippingRules, setLocalShippingRules2, setLocalSubscribers, setLocalSystemNotifications, setLocalTaxRules, setLocalTaxRules2, setLocalUser, setLocalUsers, setLogFilter, setMessageInput, setModalType, setNewNote, setNewRMANote, setNotificationFilter, setNotificationPage, setOrderFilter, setOverviewOrderFilter, setProductFilter, setRequestLogFilter, setReviewFilter, setSearchResults, setSelectedCatalogRule, setSelectedCity, setSelectedConversation, setSelectedCoupon, setSelectedCustomer, setSelectedCustomerGroup, setSelectedEvent, setSelectedFAQ, setSelectedOrder, setSelectedPackProducts, setShowNotifications, setSiteConfig, setViewingCustomer, showNotifications, siteConfig, siteConfigs, sortByDate, stats, totalCustomers, totalOrdersCount, totalSales, totalVisitors, updateBlogPost, updateCatalogRule, updateCategory, updateCity, updateCoupon, updateCurrency, updateCustomerGroup, updateEvent, updateExpense, updateFAQ, updateLocalRole, updateLocalUser, updateLookbook, updateNavItem, updatePack, updateProduct, updateRMA, updateReview, updateShippingRule, updateSiteConfig, updateTaxRule, user, userRoleSlug, viewingCustomer } = ctx;
  const [showBulkSpecsModal, setShowBulkSpecsModal] = React.useState(false);
  const [bulkSpecsText, setBulkSpecsText] = React.useState('');
  const [arrivalDraftId] = React.useState(() => `arrival-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
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
                            const slug = val.toLowerCase()
                              .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // retirer les accents
                              .replace(/[^a-z0-9]+/g, '-')
                              .replace(/(^-|-$)+/g, '');
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
                      <RichTextEditor 
                        name="description"
                        defaultValue={editingItem?.description || ''}
                        className="w-full"
                      />
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
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Stock total</label>
                      <input
                        name="stock"
                        type="number"
                        min={0}
                        className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary focus:bg-card transition-all font-bold text-primary"
                        defaultValue={editingItem?.stock ?? 0}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value) || 0);
                          setEditingItem((prev: any) => {
                            const next = { ...(prev || {}), stock: val };
                            const colorMap = next.stockByColor || {};
                            const totalColors = (Object.values(colorMap) as any[]).reduce((acc, val) => acc + Number(val || 0), 0);
                            if (totalColors > val) {
                              toast.error('Le total des quantités par couleur dépasse le stock total. Ajustez les quantités par couleur.');
                            }
                            return next;
                          });
                        }}
                      />
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
                          onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            const salePrice = editingItem?.price || 0;
                            if (val > 0 && val >= salePrice) {
                              toast.error('Le prix promotionnel doit être inférieur au prix de vente');
                            }
                          }}
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/60 font-bold text-xs">FCFA</span>
                      </div>
                      <p className="text-[10px] text-primary/50 italic">Laissez vide ou à 0 pour désactiver la promotion</p>
                    </div>
                    {editingItem?.promoPrice && editingItem.promoPrice > 0 && (
                      <div className="flex items-center justify-between p-4 bg-accent/10 rounded-2xl border border-accent/20 md:col-span-2">
                        <div>
                          <p className="font-bold text-sm text-accent">Promotion activée</p>
                          <p className="text-xs text-accent/60">Réduction: {Math.round((1 - editingItem.promoPrice / (editingItem.price || 1)) * 100)}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-primary/60">Prix normal</p>
                          <p className="font-bold text-lg text-primary">{editingItem.price} FCFA</p>
                          <p className="text-xs text-accent font-bold mt-1">Prix promo: {editingItem.promoPrice} FCFA</p>
                        </div>
                      </div>
                    )}
                    <div className="md:col-span-2 rounded-2xl border border-amber-200 bg-amber-50/60 p-5 space-y-4">
                      <label className="flex items-center gap-3 text-sm font-bold text-amber-900">
                        <input type="checkbox" name="allowPreorder" defaultChecked={editingItem?.allowPreorder === true} className="h-4 w-4 accent-amber-600" />
                        Autoriser la précommande des arrivages futurs
                      </label>
                      <p className="text-xs text-amber-800/80">Un produit peut rester disponible immédiatement tout en ayant un stock commandé. L’arrivage peut cibler une couleur précise.</p>
                      <input type="hidden" name="arrivalId" value={arrivalDraftId} />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input name="arrivalQuantity" type="number" min="0" placeholder="Quantité commandée" className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl" />
                        <input name="arrivalDate" type="date" className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl" />
                        <input name="arrivalColor" type="text" placeholder="Couleur (optionnel)" className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl" />
                      </div>
                      {Array.isArray(editingItem?.incomingStock) && editingItem.incomingStock.length > 0 && (
                        <div className="space-y-2 text-xs text-amber-900">
                          {editingItem.incomingStock.map((arrival: any) => (
                            <div key={arrival.id} className="flex items-center justify-between rounded-lg bg-white/70 px-3 py-2">
                              <span>{arrival.quantity} unité(s){arrival.color ? ` · ${arrival.color}` : ''} · arrivée le {new Date(arrival.availableAt).toLocaleDateString('fr-FR')}</span>
                              <span className="font-bold">{arrival.status === 'cancelled' ? 'Annulé' : 'Planifié'}</span>
                            </div>
                          ))}
                        </div>
                      )}
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
                        {CATEGORIES.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
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
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-primary/5 pb-4">
                    <h4 className="text-lg font-bold text-primary">Caractéristiques</h4>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => setShowBulkSpecsModal(true)}
                        className="text-xs font-bold uppercase tracking-widest text-accent hover:text-accent/80 transition-colors flex items-center gap-1.5 bg-accent/10 px-3 py-1.5 rounded-xl border border-accent/20"
                      >
                        <FileText size={14} /> Coller en masse
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          const newSpecs = { ...(editingItem?.specs || {}) };
                          newSpecs['Nouvelle_caracteristique_' + Date.now()] = '';
                          setEditingItem((prev: any) => ({ ...(prev || {}), specs: newSpecs }));
                        }}
                        className="text-xs font-bold uppercase tracking-widest text-primary/60 hover:text-primary transition-colors flex items-center gap-1 bg-secondary/50 px-3 py-1.5 rounded-xl border border-primary/10"
                      >
                        <Plus size={14} /> Ajouter 1 à 1
                      </button>
                    </div>
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
                            setEditingItem((prev: any) => ({ ...prev, specs: newSpecs }));
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
                            setEditingItem((prev: any) => ({ ...prev, specs: newSpecs }));
                          }}
                        />
                        <button 
                          type="button" 
                          onClick={() => {
                            const newSpecs = { ...(editingItem?.specs || {}) };
                            delete newSpecs[key];
                            setEditingItem((prev: any) => ({ ...prev, specs: newSpecs }));
                          }}
                          className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {Object.keys(editingItem?.specs || {}).length === 0 && (
                      <p className="text-sm text-primary/60 text-center italic py-4">
                        Aucune caractéristique ajoutée. Utilisez "Coller en masse" pour copier-coller toute votre liste d'un coup !
                      </p>
                    )}
                  </div>
                </div>

                {/* Bulk Specs Paste Modal */}
                {showBulkSpecsModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-card w-full max-w-lg p-6 rounded-3xl border border-primary/10 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                        <h3 className="text-lg font-serif font-bold text-primary flex items-center gap-2">
                          <FileText size={18} className="text-accent" /> Coller les Caractéristiques
                        </h3>
                        <button 
                          type="button"
                          onClick={() => setShowBulkSpecsModal(false)}
                          className="p-1 text-primary/40 hover:text-primary transition-colors"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <p className="text-xs text-primary/70 leading-relaxed">
                        Collez ci-dessous vos caractéristiques au format <strong className="text-primary">Nom : Valeur</strong> (un élément par ligne). Les séparateurs admis sont le deux-points (<code className="bg-secondary px-1 py-0.5 rounded">:</code>), le tiret (<code className="bg-secondary px-1 py-0.5 rounded">-</code>) ou l'égal (<code className="bg-secondary px-1 py-0.5 rounded">=</code>).
                      </p>

                      <textarea
                        rows={6}
                        value={bulkSpecsText}
                        onChange={(e) => setBulkSpecsText(e.target.value)}
                        placeholder={`Exemple :\nMatière : 100% Laine Mérinos\nPoids : 100g\nLongueur - 200m\nOrigine = France`}
                        className="w-full p-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-accent text-sm text-primary font-mono"
                      />

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowBulkSpecsModal(false)}
                          className="px-4 py-2.5 rounded-xl border border-primary/10 text-xs font-bold text-primary/70 hover:bg-secondary transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!bulkSpecsText.trim()) return;
                            const newSpecs = { ...(editingItem?.specs || {}) };
                            const lines = bulkSpecsText.split('\n');
                            let addedCount = 0;

                            lines.forEach((line) => {
                              const trimmed = line.replace(/^[•*\-\s]+/, '').trim();
                              if (!trimmed) return;

                              const match = trimmed.match(/^([^:\-=\t]+)[:\-=\t](.+)$/);
                              if (match) {
                                const key = match[1].trim();
                                const val = match[2].trim();
                                if (key && val) {
                                  newSpecs[key] = val;
                                  addedCount++;
                                }
                              }
                            });

                            if (addedCount > 0) {
                              setEditingItem((prev: any) => ({ ...(prev || {}), specs: newSpecs }));
                              toast.success(`${addedCount} caractéristique(s) ajoutée(s) !`);
                              setBulkSpecsText('');
                              setShowBulkSpecsModal(false);
                            } else {
                              toast.error('Format "Nom : Valeur" non détecté.');
                            }
                          }}
                          className="px-5 py-2.5 rounded-xl bg-accent text-white text-xs font-bold shadow-lg hover:bg-accent/90 transition-all"
                        >
                          Générer les champs
                        </button>
                      </div>
                    </div>
                  </div>
                )}

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
