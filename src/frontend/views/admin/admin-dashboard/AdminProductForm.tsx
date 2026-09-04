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

import { AdminProductFormMainFields } from './AdminProductFormMainFields';
import { AdminProductFormSidebarFields } from './AdminProductFormSidebarFields';
import { compressAndUploadImagesInPayload } from '../../../utils/imageCompression';
export function AdminProductForm({ ctx }: { ctx: any }) {
  const { ABANDONED_CARTS, ANALYTICS, BLOG_POSTS, CATEGORIES, CATEGORY_DISTRIBUTION, CHAT_MESSAGES, CITIES, CONVERSATIONS, COUPONS, CUSTOMER_GROUPS, DEVICE_DATA, EMAILS, EXPENSES, FAQS, LOGIN_LOGS, LOOKBOOK_POSTS, NAV_ITEMS, NOTIFICATIONS, ORDERS, PACKS, PRODUCTS, PROMO_EVENTS, PUSH_NOTIFICATIONS, REQUEST_LOGS, RETENTION_DATA, REVENUE_BY_PAYMENT, REVIEWS, SALES_DATA, SHIPPING_RULES, SUBSCRIBERS, TAX_RULES, TRAFFIC_SOURCES, USERS, activeMenuItem, activeTab, addBlogPost, addCatalogRule, addCategory, addCity, addCoupon, addCurrency, addCustomerGroup, addEvent, addExpense, addFAQ, addLocalRole, addLookbook, addNavItem, addPack, addProduct, addRMA, addReview, addShippingRule, addTaxRule, allOrders, averageOrderValue, catalogRulesWithDefaults, categoryPage, currentImage, currentSlug, currentUserDoc, customerDetailTab, customerFilter, deleteAbandonedCart, deleteCatalogRule, deleteCategory, deleteChatMessage, deleteCity, deleteConversation, deleteCoupon, deleteCurrency, deleteCustomerGroup, deleteEvent, deleteFAQ, deleteLocalRole, deleteLoginLog, deleteNavItem, deleteNotification, deleteOrder, deletePack, deleteProduct, deleteRequestLog, deleteReview, deleteShippingRule, deleteSiteConfig, deleteSubscriber, deleteTaxRule, deleteUser, editedOrder, editingItem, events, fetchedProducts, filteredMenuItems, formatDate, handleDeleteCatalogRule, handleDeleteCity, handleDeleteEvent, handleDeleteFAQ, handleEditCatalogRule, handleEditCity, handleEditCoupon, handleEditEvent, handleEditFAQ, handleFormSubmit, handleNotificationClick, handleSaveCatalogRule, handleSaveCity, handleSaveCoupon, handleSaveEvent, handleSaveFAQ, handleSearch, handleSeed, handleSendMessage, hasPermission, isAddModalOpen, isAuthLoading, isCatalogRuleEditorOpen, isCityEditorOpen, isCouponEditorOpen, isDataLoading, isEditingOrder, isEventEditorOpen, isFAQEditorOpen, isLoadingAbandoned, isLoadingBlog, isLoadingCatalog, isLoadingCategories, isLoadingCategoryDist, isLoadingDevice, isLoadingEmails, isLoadingExpenses, isLoadingGroups, isLoadingLookbook, isLoadingOrders, isLoadingPacks, isLoadingProducts, isLoadingPush, isLoadingRetention, isLoadingRevenue, isLoadingReviews, isLoadingRoles, isLoadingShipping, isLoadingSubscribers, isLoadingTax, isLoadingTraffic, isLogsLoading, isSaving, isSidebarOpen, isSuperAdmin, isTabAllowed, isUserCustomer, itemsPerPage, localAbandonedCarts, localBlogPosts, localCatalogPriceRules, localCategories, localCurrencies, localCustomerGroups, localExpenses, localLookbook, localNavItems, localOrders, localPacks, localProducts, localRMAs, localReviews, localRoles, localShippingRules, localSystemNotifications, localTaxRules, localUsers, logFilter, menuItems, messageInput, modalType, navItemsWithDefaults, newNote, newRMANote, notificationFilter, notificationPage, onNavigate, orderFilter, overviewOrderFilter, permissions, productFilter, propSetSiteConfig, propSiteConfig, rawSiteConfig, realLogs, requestLogFilter, reviewFilter, roleData, saveAllSiteConfig, saveSiteSection, searchResults, selectedCatalogRule, selectedCity, selectedConversation, selectedCoupon, selectedCustomer, selectedCustomerGroup, selectedEvent, selectedFAQ, selectedOrder, selectedPackProducts, setActiveTab, setCategoryPage, setCurrentImage, setCurrentSlug, setCustomerDetailTab, setCustomerFilter, setEditedOrder, setEditingItem, setEvents, setIsAddModalOpen, setIsCatalogRuleEditorOpen, setIsCityEditorOpen, setIsCouponEditorOpen, setIsEditingOrder, setIsEventEditorOpen, setIsFAQEditorOpen, setIsSaving, setIsSidebarOpen, setLocalAbandonedCarts, setLocalAbandonedCarts2, setLocalBlogPosts, setLocalBlogPosts2, setLocalCategories, setLocalCurrencies, setLocalCustomerGroups, setLocalCustomerGroups2, setLocalEmails, setLocalExpenses, setLocalLookbook, setLocalLookbook2, setLocalOrders, setLocalPacks, setLocalProducts, setLocalPushNotifications, setLocalReviews, setLocalReviews2, setLocalRole, setLocalRoles, setLocalShippingRules, setLocalShippingRules2, setLocalSubscribers, setLocalSystemNotifications, setLocalTaxRules, setLocalTaxRules2, setLocalUser, setLocalUsers, setLogFilter, setMessageInput, setModalType, setNewNote, setNewRMANote, setNotificationFilter, setNotificationPage, setOrderFilter, setOverviewOrderFilter, setProductFilter, setRequestLogFilter, setReviewFilter, setSearchResults, setSelectedCatalogRule, setSelectedCity, setSelectedConversation, setSelectedCoupon, setSelectedCustomer, setSelectedCustomerGroup, setSelectedEvent, setSelectedFAQ, setSelectedOrder, setSelectedPackProducts, setShowNotifications, setSiteConfig, setViewingCustomer, showNotifications, siteConfig, siteConfigs, sortByDate, stats, totalCustomers, totalOrdersCount, totalSales, totalVisitors, updateBlogPost, updateCatalogRule, updateCategory, updateCity, updateCoupon, updateCurrency, updateCustomerGroup, updateEvent, updateExpense, updateFAQ, updateLocalRole, updateLocalUser, updateLookbook, updateNavItem, updatePack, updateProduct, updateRMA, updateReview, updateShippingRule, updateSiteConfig, updateTaxRule, user, userRoleSlug, viewingCustomer } = ctx;
  return (
    <>
      {(activeTab === 'product-create' || activeTab === 'product-edit') && (
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => { setActiveTab('products'); setEditingItem(null); }}
                  className="p-2 bg-card rounded-xl shadow-sm border border-primary/10 text-primary/60 hover:text-primary transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <div>
                  <h3 className="text-2xl font-serif text-primary">
                    {activeTab === 'product-create' ? 'Nouveau Produit' : `Modifier: ${editingItem?.name}`}
                  </h3>
                  <p className="text-primary/60 text-sm">Gérez les informations détaillées de votre produit.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setActiveTab('products'); setEditingItem(null); }}
                  className="px-6 py-2.5 text-primary/60 font-bold hover:text-primary transition-colors"
                >
                  Annuler
                </button>
                <button 
                  form="product-form"
                  type="submit"
                  disabled={isSaving}
                  className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-accent transition-all flex items-center gap-2"
                >
                  {isSaving ? <Loader text="" /> : (
                    <>
                      <CheckCircle2 size={18} />
                      {activeTab === 'product-create' ? 'Créer le produit' : 'Enregistrer les modifications'}
                    </>
                  )}
                </button>
              </div>
            </div>

            <form id="product-form" onSubmit={async (e) => {
              e.preventDefault();
              setIsSaving(true);
              try {
                const formData = new FormData(e.currentTarget);
                const nameValue = formData.get('name') as string;
                const slugValue = (formData.get('slug') as string || '').trim();
                const finalSlug = slugValue || (nameValue ? nameValue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') : '');
                const arrivalQuantity = Math.max(0, Number(formData.get('arrivalQuantity')) || 0);
                const arrivalDate = String(formData.get('arrivalDate') || '');
                const arrivalId = String(formData.get('arrivalId') || '');
                const previousArrivals = Array.isArray(editingItem?.incomingStock) ? editingItem.incomingStock : [];
                const incomingStock = arrivalQuantity > 0 && arrivalDate
                  ? [
                      ...previousArrivals.filter((arrival: any) => arrival.id !== arrivalId),
                      {
                        id: arrivalId || `arrival-${Date.now()}`,
                        quantity: arrivalQuantity,
                        color: String(formData.get('arrivalColor') || '').trim() || undefined,
                        availableAt: new Date(`${arrivalDate}T00:00:00`).toISOString(),
                        reservedQuantity: previousArrivals.find((arrival: any) => arrival.id === arrivalId)?.reservedQuantity || 0,
                        status: 'planned',
                        updatedAt: new Date().toISOString(),
                      },
                    ]
                  : previousArrivals;

                // Vérification d'unicité du slug dans la table produit
                const slugConflict = localProducts.find(
                  (p: any) => p.slug === finalSlug && p.id !== editingItem?.id
                );
                if (slugConflict) {
                  toast.error(`Le slug "${finalSlug}" est déjà utilisé par le produit "${slugConflict.name}". Choisissez un autre nom ou modifiez le slug.`);
                  return;
                }

                const nameEnValue = (formData.get('name_en') as string || '').trim();
                const descriptionEnValue = (formData.get('description_en') as string || '').trim();
                const seoTitleEnValue = (formData.get('seoTitle_en') as string || '').trim();
                const seoDescriptionEnValue = (formData.get('seoDescription_en') as string || '').trim();

                const newProduct: any = {
                  // Do not generate a client-side id for creations — let the server assign the document id.
                  id: (activeTab === 'product-edit' && editingItem?.id) ? editingItem.id : undefined,
                  name: nameValue,
                  name_en: nameEnValue || editingItem?.name_en || '',
                  slug: finalSlug,
                  price: Number(formData.get('price')),
                  purchasePrice: Number(formData.get('purchasePrice')),
                  promoPrice: formData.get('promoPrice') ? Number(formData.get('promoPrice')) : undefined,
                  stock: editingItem?.stock || 0,
                  category: formData.get('category') as string,
                  condition: formData.get('condition') as string || 'new',
                  image: editingItem?.image || 'https://picsum.photos/seed/wool/300/300',
                  // Sous-images optionnelles (galerie)
                  images: editingItem?.images || [],
                  // Images associées aux couleurs (variant images)
                  imagesByColor: editingItem?.imagesByColor || {},
                  // Quantités par couleur
                  stockByColor: editingItem?.stockByColor || {},
                  allowPreorder: formData.get('allowPreorder') === 'on',
                  incomingStock,
                  description: formData.get('description') as string,
                  description_en: descriptionEnValue || editingItem?.description_en || '',
                  colors: editingItem?.colors || ['#FFFFFF'],
                  seo: {
                      title: formData.get('seoTitle') as string,
                      description: formData.get('seoDescription') as string,
                      title_en: seoTitleEnValue || editingItem?.seo?.title_en || '',
                      description_en: seoDescriptionEnValue || editingItem?.seo?.description_en || ''
                  },
                  isAvailable: editingItem?.isAvailable ?? false,
                  rating: editingItem?.rating || 5,
                  specs: editingItem?.specs || {},
                  in_stock: (editingItem?.stock || 0) > 0
                };
                const now = new Date().toISOString();
                
                // Upload to server and optimize images inside payload to guarantee tiny Firestore documents
                let finalProduct;
                try {
                  toast.loading('Enregistrement et optimisation des images...', { id: 'product-image-comp' });
                  finalProduct = await compressAndUploadImagesInPayload(newProduct, 'products');
                } catch (e) {
                  console.warn('Image optimization failed, saving raw:', e);
                  finalProduct = newProduct;
                } finally {
                  toast.dismiss('product-image-comp');
                }

                if (activeTab === 'product-edit') {
                    const updatePayload = { ...finalProduct };
                    delete updatePayload.id;
                    delete updatePayload.stock;
                    delete updatePayload.quantity;
                    updatePayload.updatedAt = now;

                    try {
                      await updateProduct(finalProduct.id, updatePayload);
                      setLocalProducts((prev: any[]) => prev.map((p: any) => p.id === finalProduct.id ? { ...p, ...updatePayload } : p));
                      toast.success('Produit mis à jour avec succès');
                    } catch (err: any) {
                      toast.error(err?.message || 'Erreur lors de la mise à jour du produit');
                      return;
                    }
                } else {
                    finalProduct.createdAt = now;
                    finalProduct.updatedAt = now;
                    try {
                      // Let backend create the document and return the real id
                      const createdId = await addProduct(finalProduct);
                      finalProduct.id = createdId;
                      // Add to local list using server id to avoid duplicates
                      setLocalProducts((prev: any[]) => [...prev, finalProduct]);
                      toast.success('Produit créé avec succès');
                    } catch (err: any) {
                      toast.error('Échec de la création du produit');
                      return;
                    }
                }
                setActiveTab('products');
                setEditingItem(null);
              } finally {
                setIsSaving(false);
              }
            }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <AdminProductFormMainFields ctx={ctx} />
              <AdminProductFormSidebarFields ctx={ctx} />
            </form>
          </div>
        )}
    </>
  );
}
