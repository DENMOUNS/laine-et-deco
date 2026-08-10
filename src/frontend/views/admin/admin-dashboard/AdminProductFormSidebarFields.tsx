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
import { compressImageDataUrl } from '../../../utils/imageCompression';


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
                      <p className="text-xs text-primary/60">{editingItem?.isAvailable ?? false ? 'Visible sur la boutique' : 'Masqué pour les clients'}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setEditingItem((prev: any) => ({ ...prev, isAvailable: !(prev?.isAvailable ?? false) }))}
                      className={`w-14 h-7 rounded-full relative transition-all duration-300 ${editingItem?.isAvailable ?? false ? 'bg-primary' : 'bg-secondary/50'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-card rounded-full shadow-sm transition-all duration-300 ${editingItem?.isAvailable ?? false ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="bg-card p-8 rounded-3xl shadow-sm border border-primary/10 space-y-6">
                  <h4 className="text-lg font-bold text-primary border-b border-primary/5 pb-4">Image du Produit</h4>
                  <div className="aspect-[4/5] bg-secondary/50 rounded-2xl border-2 border-dashed border-primary/10 flex flex-col items-center justify-center overflow-hidden relative group cursor-pointer hover:border-primary/40 transition-all shadow-inner">
                    {(currentImage || editingItem?.image) ? (
                      <>
                        <img src={currentImage || editingItem?.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <span className="bg-white text-primary px-6 py-2 rounded-xl font-bold text-sm shadow-xl">Changer l'image</span>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImage('');
                              if (editingItem) setEditingItem((prev: any) => ({ ...prev, image: '' }));
                            }}
                            className="bg-rose-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl hover:bg-rose-600 transition-colors"
                          >
                            Supprimer
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-10 text-primary/40 group-hover:text-primary/60 transition-colors">
                        <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                          <ImageIcon size={32} />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest">Sélectionner une photo</p>
                        <p className="text-[10px] mt-2 italic">Format portrait recommandé (800x1000px)</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      multiple
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (!files.length) return;
                        toast.loading(`Compression de ${files.length} image(s)…`, { id: 'main-image-upload' });
                        try {
                          const dataUrls = await Promise.all(
                            files.map((file) =>
                              new Promise<string>((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onloadend = async () => {
                                  try {
                                    const compressed = await compressImageDataUrl(reader.result as string);
                                    resolve(compressed);
                                  } catch {
                                    resolve(reader.result as string);
                                  }
                                };
                                reader.onerror = reject;
                                reader.readAsDataURL(file);
                              })
                            )
                          );

                          const [first, ...rest] = dataUrls;
                          setCurrentImage(first);
                          setEditingItem((prev: any) => ({
                            ...(prev || {}),
                            image: first,
                            images: [...(prev?.images || []), ...rest],
                          }));
                          toast.success(`${dataUrls.length} image(s) traitée(s)`, { id: 'main-image-upload' });
                        } catch {
                          toast.error('Erreur lors de l\'upload', { id: 'main-image-upload' });
                        }
                        e.target.value = '';
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-primary/60 text-center uppercase tracking-widest font-bold">L'image est uploadée depuis votre appareil</p>
                </div>

                <div className="bg-card p-8 rounded-3xl shadow-sm border border-primary/10 space-y-6">
                  <div className="flex items-center justify-between border-b border-primary/5 pb-4">
                    <div>
                      <h4 className="text-lg font-bold text-primary">Galerie de sous-images</h4>
                      <p className="text-xs text-primary/50 mt-0.5">Vues supplémentaires du produit — sélectionnez plusieurs à la fois</p>
                    </div>
                    <label className="text-xs font-bold uppercase tracking-widest text-accent hover:text-accent/80 transition-colors flex items-center gap-1.5 bg-accent/10 px-3 py-1.5 rounded-xl border border-accent/20 cursor-pointer">
                      <Plus size={14} /> Ajouter des images
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (!files.length) return;
                          toast.loading(`Compression de ${files.length} image(s)…`, { id: 'gallery-upload' });
                          try {
                            const dataUrls = await Promise.all(
                              files.map((file) =>
                                new Promise<string>((resolve, reject) => {
                                  const reader = new FileReader();
                                  reader.onloadend = async () => {
                                    try {
                                      const compressed = await compressImageDataUrl(reader.result as string);
                                      resolve(compressed);
                                    } catch { resolve(reader.result as string); }
                                  };
                                  reader.onerror = reject;
                                  reader.readAsDataURL(file);
                                })
                              )
                            );
                            setEditingItem((prev: any) => ({
                              ...prev,
                              images: [...(prev?.images || []), ...dataUrls],
                            }));
                            toast.success(`${dataUrls.length} image(s) ajoutée(s) à la galerie`, { id: 'gallery-upload' });
                          } catch {
                            toast.error('Erreur lors de l\'upload', { id: 'gallery-upload' });
                          }
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {(editingItem?.images || []).map((imgUrl: string, idx: number) => (
                      <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-primary/10 bg-secondary/30">
                        <img
                          src={imgUrl}
                          alt={`Sous-image ${idx + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setEditingItem((prev: any) => ({
                              ...prev,
                              images: (prev?.images || []).filter((_: string, i: number) => i !== idx),
                            }))
                          }
                          className="absolute top-1 right-1 bg-rose-500/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          title="Supprimer"
                        >
                          <X size={12} strokeWidth={3} />
                        </button>
                        <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          #{idx + 1}
                        </div>
                        {/* Color assignment selector */}
                        <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <select
                            value={(() => {
                              const map = editingItem?.imagesByColor || {};
                              for (const c of Object.keys(map)) {
                                if (map[c]?.includes(imgUrl)) return c;
                              }
                              return '';
                            })()}
                            onChange={(e) => {
                              const newColor = e.target.value;
                              setEditingItem((prev: any) => {
                                const next = { ...(prev || {}) };
                                next.imagesByColor = { ...(next.imagesByColor || {}) };
                                // remove from previous
                                for (const c of Object.keys(next.imagesByColor)) {
                                  next.imagesByColor[c] = (next.imagesByColor[c] || []).filter((u: string) => u !== imgUrl);
                                  if (next.imagesByColor[c].length === 0) delete next.imagesByColor[c];
                                }
                                if (newColor) {
                                  next.imagesByColor[newColor] = Array.from(new Set([...(next.imagesByColor[newColor] || []), imgUrl]));
                                }
                                return next;
                              });
                            }}
                            className="bg-white text-xs rounded-md px-2 py-1"
                          >
                            <option value="">Aucune</option>
                            {(editingItem?.colors || []).map((c: string) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                    {(editingItem?.images?.length || 0) === 0 && (
                      <div className="col-span-3 py-6 text-center">
                        <ImageIcon size={32} className="mx-auto text-primary/20 mb-2" />
                        <p className="text-xs text-primary/40 italic">
                          Aucune sous-image. Cliquez sur "Ajouter des images" pour en sélectionner plusieurs d'un coup.
                        </p>
                      </div>
                    )}
                  </div>
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
                            setEditingItem((prev: any) => {
                              const next = { ...(prev || {}) };
                              next.colors = (next.colors || []).filter((c: string) => c !== color);
                              if (next.imagesByColor && next.imagesByColor[color]) {
                                delete next.imagesByColor[color];
                              }
                              if (next.stockByColor && next.stockByColor[color]) {
                                delete next.stockByColor[color];
                              }
                              return next;
                            });
                          }}
                          className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-lg flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all z-10"
                          title="Supprimer cette couleur"
                        >
                          <X size={14} strokeWidth={3} />
                        </button>
                        <div className="absolute -bottom-9 left-0 w-full flex items-center justify-center gap-2">
                          <input
                            type="number"
                            min={0}
                            value={editingItem?.stockByColor?.[color] ?? 1}
                            onChange={(e) => {
                              const newVal = Math.max(0, Number(e.target.value) || 0);
                              setEditingItem((prev: any) => {
                                const next = { ...(prev || {}) };
                                next.stockByColor = { ...(next.stockByColor || {}) };
                                // sum of other colors
                                const otherSum = Object.entries(next.stockByColor).reduce((acc: number, [k, v]: any) => {
                                  if (k === color) return acc;
                                  return acc + Number(v || 0);
                                }, 0);
                                const totalStock = Number(next.stock || 0);
                                const allowed = Math.max(0, totalStock - otherSum);
                                const finalVal = Math.min(newVal || 0, allowed);
                                next.stockByColor[color] = finalVal || 0;
                                if (newVal > allowed) {
                                  toast.error('Le total des quantités par couleur ne peut pas dépasser le stock total.');
                                }
                                return next;
                              });
                            }}
                            className="w-14 text-xs px-2 py-1 rounded-md border border-primary/10 bg-secondary/20"
                            title="Quantité pour cette couleur"
                          />
                        </div>
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
                              setEditingItem((prev: any) => {
                                const next = { ...(prev || {}) };
                                next.colors = [...(next.colors || []), newColor];
                                next.stockByColor = { ...(next.stockByColor || {}) };
                                if (!next.stockByColor[newColor]) next.stockByColor[newColor] = 1;
                                return next;
                              });
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
