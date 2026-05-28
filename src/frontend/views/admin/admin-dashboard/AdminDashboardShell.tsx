import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminHeader } from '../../../components/dashboard/AdminHeader';
import { AdminSidebar } from '../../../components/dashboard/AdminSidebar';
import { Loader } from '../../../components/Loader';
import {
  AdminSearchResults,
  AdminOverview,
  AdminInventory,
  AdminLoyalty,
  AdminCustomerGroups,
  AdminOrders,
  AdminLogs,
  AdminStats,
  AdminEvents,
  AdminSite,
  AdminProducts,
  AdminProductForm,
  AdminPayments,
  AdminExpenses,
  AdminRmas,
  AdminAbandonedCarts,
  AdminPromoRules,
  AdminTaxes,
  AdminShipping,
  AdminImportExport,
  AdminCategories,
  AdminCategoryForm,
  AdminReviews,
  AdminMessages,
  AdminNavItems,
  AdminQr,
  AdminCoupons,
  AdminCities,
  AdminRoles,
  AdminFlashSalesTab,
  AdminLookbooksTab,
  AdminPortfoliosTab,
  AdminCustomers,
  AdminPacks,
  AdminLookbook,
  AdminBlog,
  AdminNotifications,
  AdminNewsletter,
  AdminPushNotifications,
  AdminFaq,
  AdminEmails,
  AdminUserProfile,
  AdminDashboardModals,
  AdminOrderDetail,
  AdminCustomerDetail,
  AdminRmaDetail,
  AdminSiteLogos,
  AdminSiteColors,
  AdminHeroBanners,
  AdminAnnouncementBanners,
  AdminScrollingBanners,
  AdminSeoPages,
  AdminLoyaltyConfig,
  AdminMaintenanceConfig,
  AdminNewsletterConfig,
  AdminInvoiceConfig
} from './';

export function AdminDashboardShell({ ctx }: { ctx: any }) {
  const { ABANDONED_CARTS, ANALYTICS, BLOG_POSTS, CATEGORIES, CATEGORY_DISTRIBUTION, CHAT_MESSAGES, CITIES, CONVERSATIONS, COUPONS, CUSTOMER_GROUPS, DEVICE_DATA, EMAILS, EXPENSES, FAQS, LOGIN_LOGS, LOOKBOOK_POSTS, NAV_ITEMS, NOTIFICATIONS, ORDERS, PACKS, PRODUCTS, PROMO_EVENTS, PUSH_NOTIFICATIONS, REQUEST_LOGS, RETENTION_DATA, REVENUE_BY_PAYMENT, REVIEWS, SALES_DATA, SHIPPING_RULES, SUBSCRIBERS, TAX_RULES, TRAFFIC_SOURCES, USERS, activeMenuItem, activeTab, addBlogPost, addCatalogRule, addCategory, addCity, addCoupon, addCurrency, addCustomerGroup, addEvent, addExpense, addFAQ, addLocalRole, addLookbook, addNavItem, addPack, addProduct, addRMA, addReview, addShippingRule, addTaxRule, allOrders, averageOrderValue, catalogRulesWithDefaults, categoryPage, currentImage, currentSlug, currentUserDoc, customerDetailTab, customerFilter, deleteAbandonedCart, deleteCatalogRule, deleteCategory, deleteChatMessage, deleteCity, deleteConversation, deleteCoupon, deleteCurrency, deleteCustomerGroup, deleteEvent, deleteFAQ, deleteLocalRole, deleteLoginLog, deleteNavItem, deleteNotification, deleteOrder, deletePack, deleteProduct, deleteRequestLog, deleteReview, deleteShippingRule, deleteSiteConfig, deleteSubscriber, deleteTaxRule, deleteUser, editedOrder, editingItem, events, fetchedProducts, filteredMenuItems, formatDate, handleDeleteCatalogRule, handleDeleteCity, handleDeleteEvent, handleDeleteFAQ, handleEditCatalogRule, handleEditCity, handleEditCoupon, handleEditEvent, handleEditFAQ, handleFormSubmit, handleNotificationClick, handleSaveCatalogRule, handleSaveCity, handleSaveCoupon, handleSaveEvent, handleSaveFAQ, handleSearch, handleSeed, handleSendMessage, hasPermission, isAddModalOpen, isAuthLoading, isCatalogRuleEditorOpen, isCityEditorOpen, isCouponEditorOpen, isDataLoading, isEditingOrder, isEventEditorOpen, isFAQEditorOpen, isLoadingAbandoned, isLoadingBlog, isLoadingCatalog, isLoadingCategories, isLoadingCategoryDist, isLoadingDevice, isLoadingEmails, isLoadingExpenses, isLoadingGroups, isLoadingLookbook, isLoadingOrders, isLoadingPacks, isLoadingProducts, isLoadingPush, isLoadingRetention, isLoadingRevenue, isLoadingReviews, isLoadingRoles, isLoadingShipping, isLoadingSubscribers, isLoadingTax, isLoadingTraffic, isLogsLoading, isSaving, isSidebarOpen, isSuperAdmin, isTabAllowed, isUserCustomer, itemsPerPage, localAbandonedCarts, localBlogPosts, localCatalogPriceRules, localCategories, localCurrencies, localCustomerGroups, localExpenses, localLookbook, localNavItems, localOrders, localPacks, localProducts, localRMAs, localReviews, localRoles, localShippingRules, localSystemNotifications, localTaxRules, localUsers, logFilter, menuItems, messageInput, modalType, navItemsWithDefaults, newNote, newRMANote, notificationFilter, notificationPage, onNavigate, orderFilter, overviewOrderFilter, permissions, productFilter, propSetSiteConfig, propSiteConfig, rawSiteConfig, realLogs, requestLogFilter, reviewFilter, roleData, saveAllSiteConfig, saveSiteSection, searchResults, selectedCatalogRule, selectedCity, selectedConversation, selectedCoupon, selectedCustomer, selectedCustomerGroup, selectedEvent, selectedFAQ, selectedOrder, selectedPackProducts, setActiveTab, setCategoryPage, setCurrentImage, setCurrentSlug, setCustomerDetailTab, setCustomerFilter, setEditedOrder, setEditingItem, setEvents, setIsAddModalOpen, setIsCatalogRuleEditorOpen, setIsCityEditorOpen, setIsCouponEditorOpen, setIsEditingOrder, setIsEventEditorOpen, setIsFAQEditorOpen, setIsSaving, setIsSidebarOpen, setLocalAbandonedCarts, setLocalAbandonedCarts2, setLocalBlogPosts, setLocalBlogPosts2, setLocalCategories, setLocalCurrencies, setLocalCustomerGroups, setLocalCustomerGroups2, setLocalEmails, setLocalExpenses, setLocalLookbook, setLocalLookbook2, setLocalOrders, setLocalPacks, setLocalProducts, setLocalPushNotifications, setLocalReviews, setLocalReviews2, setLocalRole, setLocalRoles, setLocalShippingRules, setLocalShippingRules2, setLocalSubscribers, setLocalSystemNotifications, setLocalTaxRules, setLocalTaxRules2, setLocalUser, setLocalUsers, setLogFilter, setMessageInput, setModalType, setNewNote, setNewRMANote, setNotificationFilter, setNotificationPage, setOrderFilter, setOverviewOrderFilter, setProductFilter, setRequestLogFilter, setReviewFilter, setSearchResults, setSelectedCatalogRule, setSelectedCity, setSelectedConversation, setSelectedCoupon, setSelectedCustomer, setSelectedCustomerGroup, setSelectedEvent, setSelectedFAQ, setSelectedOrder, setSelectedPackProducts, setShowNotifications, setSiteConfig, setViewingCustomer, showNotifications, siteConfig, siteConfigs, sortByDate, stats, totalCustomers, totalOrdersCount, totalSales, totalVisitors, updateBlogPost, updateCatalogRule, updateCategory, updateCity, updateCoupon, updateCurrency, updateCustomerGroup, updateEvent, updateExpense, updateFAQ, updateLocalRole, updateLocalUser, updateLookbook, updateNavItem, updatePack, updateProduct, updateRMA, updateReview, updateShippingRule, updateSiteConfig, updateTaxRule, user, userRoleSlug, viewingCustomer } = ctx;
  const safeFilteredMenuItems = filteredMenuItems || [];
  const safeNotifications = localSystemNotifications || [];

  if (isDataLoading) {
    return (
      <div className="h-[100dvh] overflow-hidden bg-[#fbf9f6] flex flex-col lg:flex-row">
        <AdminSidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          menuItems={safeFilteredMenuItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          onNavigate={onNavigate}
          setEditingItem={setEditingItem}
        />
        <main className="flex-grow overflow-y-auto bg-[#fbf9f6] flex flex-col">
          <AdminHeader
            activeTab={activeTab}
            menuItems={safeFilteredMenuItems}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
            localSystemNotifications={safeNotifications}
            handleNotificationClick={handleNotificationClick}
            setActiveTab={setActiveTab}
            onSearch={() => {}}
          />
          <div className="flex-grow flex items-center justify-center">
            <Loader text="Initialisation du Tableau de Bord..." />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#fbf9f6] flex flex-col lg:flex-row">
      <AdminSidebar 
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        menuItems={safeFilteredMenuItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onNavigate={onNavigate}
        setEditingItem={setEditingItem}
      />

      {/* Overlay for mobile sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto bg-[#fbf9f6] custom-scrollbar">
        <AdminHeader 
          activeTab={activeTab}
          menuItems={safeFilteredMenuItems}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          localSystemNotifications={safeNotifications}
          handleNotificationClick={handleNotificationClick}
          setActiveTab={setActiveTab}
          onSearch={handleSearch}
        />

        <div className="px-6 lg:px-10 pb-10">
        {/* Global Access Control Check */}
        {userRoleSlug === 'customer' && (
          <div className="flex-grow flex items-center justify-center p-10 mt-20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-12 rounded-[3rem] shadow-2xl border border-primary/10 max-w-md text-center"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock size={40} />
              </div>
              <h2 className="text-3xl font-serif font-bold text-primary mb-4">Accès Refusé</h2>
              <p className="text-primary/60 mb-8 leading-relaxed">
                Désolé, votre rôle actuel ("{userRoleSlug}") ne dispose pas des permissions nécessaires pour accéder au panneau d'administration. 
                Seuls les administrateurs et gestionnaires peuvent accéder à cette section.
              </p>
              <button 
                onClick={() => onNavigate('/')}
                className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-accent transition-all shadow-lg"
              >
                Retour à la boutique
              </button>
            </motion.div>
          </div>
        )}

        {(userRoleSlug !== 'customer' && !isTabAllowed) && (
          <div className="flex-grow flex flex-col items-center justify-center p-10 mt-20 h-full">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6">
              <Lock size={32} />
            </div>
            <h3 className="text-2xl font-bold text-primary mb-2">Section non autorisée</h3>
            <p className="text-primary/60 text-center max-w-sm mb-6">
              Votre rôle actuel ne vous permet pas d'accéder à l'onglet "<b>{activeMenuItem?.label}</b>".
            </p>
            {safeFilteredMenuItems.length > 0 && (
              <button 
                onClick={() => {
                  const firstTab = safeFilteredMenuItems.find(i => !i.isHeader);
                  if (firstTab) setActiveTab(firstTab.id);
                }}
                className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-accent transition-all"
              >
                Aller au Tableau de Bord
              </button>
            )}
          </div>
        )}

        {(userRoleSlug !== 'customer' && isTabAllowed) && (
          <div className="admin-dashboard-content-area">
            <AdminDashboardModals ctx={ctx} />

<AdminSearchResults ctx={ctx} />

        <AdminOverview ctx={ctx} />

        <AdminInventory ctx={ctx} />

        <AdminLoyalty ctx={ctx} />

        <AdminCustomerGroups ctx={ctx} />

        {activeTab === 'customer-group-detail' && selectedCustomerGroup && (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <button onClick={() => setActiveTab('customer-groups')} className="p-2 hover:bg-secondary/50 rounded-full transition-colors border border-transparent hover:border-primary/10">
                <ChevronLeft size={24} />
              </button>
              <h2 className="text-3xl font-serif font-bold text-primary">{selectedCustomerGroup.name}</h2>
            </div>
            <div className="bg-card rounded-[2rem] shadow-sm border border-primary/10 overflow-hidden">
              <div className="p-8 border-b border-primary/10">
                <h3 className="text-xl font-serif font-bold text-primary">Clients dans ce groupe</h3>
              </div>
              <DataTable
              dateFilterKey="createdAt"
              data={sortByDate(localUsers.filter(u => u.groupId === selectedCustomerGroup.id))}
                columns={[
                  { header: 'Nom', accessor: 'name', sortable: true },
                  { header: 'Email', accessor: 'email', sortable: true },
                  { header: 'Points', accessor: (u: any) => `${u.points || 0} pts`, sortable: true },
                  { header: 'Créé le', accessor: (item: any) => formatDate(item.createdAt || item.date || item.subscribedAt || item.sentAt || new Date().toISOString()), className: 'text-primary/60 text-sm', sortable: true }
                ]}
                onRowClick={(u) => { setSelectedCustomer(u); setActiveTab('customer-detail'); }}
              />
            </div>
          </div>
        )}

        <AdminOrders ctx={ctx} />

        <AdminLogs ctx={ctx} />

        <AdminStats ctx={ctx} />

        <AdminEvents ctx={ctx} />

        <AdminSite ctx={ctx} />



        <AdminProducts ctx={ctx} />

        <AdminProductForm ctx={ctx} />

        <AdminPayments ctx={ctx} />

        <AdminExpenses ctx={ctx} />

        <AdminRmas ctx={ctx} />

        <AdminAbandonedCarts ctx={ctx} />

        <AdminPromoRules ctx={ctx} />



        <AdminTaxes ctx={ctx} />

        <AdminShipping ctx={ctx} />

        <AdminImportExport ctx={ctx} />

        <AdminCategories ctx={ctx} />

        <AdminCategoryForm ctx={ctx} />
 
        <AdminReviews ctx={ctx} />
 
        <AdminOrderDetail ctx={ctx} />

        <AdminMessages ctx={ctx} />
        <AdminNavItems ctx={ctx} />

        <AdminQr ctx={ctx} />
        <AdminSite ctx={ctx} />
        {activeTab === 'site_logos' && <AdminSiteLogos ctx={ctx} />}
        {activeTab === 'site_colors' && <AdminSiteColors ctx={ctx} />}
        {activeTab === 'hero_banners' && <AdminHeroBanners ctx={ctx} />}
        {activeTab === 'announcement_banners' && <AdminAnnouncementBanners ctx={ctx} />}
        {activeTab === 'scrolling_banners' && <AdminScrollingBanners ctx={ctx} />}
        {activeTab === 'seo_pages' && <AdminSeoPages ctx={ctx} />}
        {activeTab === 'loyalty_config' && <AdminLoyaltyConfig ctx={ctx} />}
        {activeTab === 'maintenance_config' && <AdminMaintenanceConfig ctx={ctx} />}
        {activeTab === 'newsletter_config' && <AdminNewsletterConfig ctx={ctx} />}
        <AdminInvoiceConfig ctx={ctx} />
        <AdminCoupons ctx={ctx} />

        <AdminCities ctx={ctx} />

        <AdminRoles ctx={ctx} />

        <AdminFlashSalesTab ctx={ctx} />

        <AdminLookbooksTab ctx={ctx} />
        
        <AdminPortfoliosTab ctx={ctx} />

        <AdminCustomers ctx={ctx} />

        <AdminCustomerDetail ctx={ctx} />

        <AdminPacks ctx={ctx} />

        <AdminLookbook ctx={ctx} />

        <AdminBlog ctx={ctx} />

        <AdminNotifications ctx={ctx} />

        <AdminNewsletter ctx={ctx} />

        <AdminPushNotifications ctx={ctx} />
        <AdminFaq ctx={ctx} />
        <AdminEmails ctx={ctx} />
        
        <AdminCustomerGroups ctx={ctx} />

        <AdminUserProfile ctx={ctx} />

        <AdminRmaDetail ctx={ctx} />
      </div>
    )}
        
        <footer className="mt-12 pt-8 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center text-xs text-primary/60">
          <p>© {new Date().getFullYear()} Laine et Déco Admin. Tous droits réservés.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-primary transition-colors">Support Technique</a>
            <a href="#" className="hover:text-primary transition-colors">Documentation</a>
            <span className="font-mono opacity-50">v1.0.0</span>
          </div>
        </footer>
        </div>
      </main>
    </div>
  );
};
