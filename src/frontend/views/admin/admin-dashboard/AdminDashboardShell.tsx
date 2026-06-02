import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminHeader } from '../../../components/dashboard/AdminHeader';
import { AdminSidebar } from '../../../components/dashboard/AdminSidebar';
import { Loader } from '../../../components/Loader';
import {
  AdminDashboardModals,
  AdminSearchResults,
  AdminOverview,
  AdminInventory,
  AdminLoyalty,
  AdminCustomerGroups,
  AdminOrders,
  AdminStats,
  AdminEvents,
  AdminSite,
  AdminProducts,
  AdminProductForm,
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
  AdminInvoiceConfig,
  AdminSiteLogos as _AdminSiteLogos
} from './index';

import { Lock, ChevronLeft } from 'lucide-react';
import { DataTable } from '../../../components/DataTable';
import { formatFirestoreDate as formatDate } from '../../../../services/adminService';
import { useAdminStore } from '../../../../stores/adminStore';
import { useAdminDashboardContext } from './useAdminDashboardContext';

interface Props {
  ctx: any;
}

export const AdminDashboardShell: React.FC<Props> = ({ ctx }) => {
  const {
    activeTab,
    activeMenuItem,
    isDataLoading,
    isTabAllowed,
    userRoleSlug,
    filteredMenuItems,
    setActiveTab,
    selectedCustomerGroup,
    localUsers
  } = ctx;

  const isSidebarOpen = useAdminStore((s) => s.isSidebarOpen);
  const setIsSidebarOpen = useAdminStore((s) => s.setIsSidebarOpen);

  const onNavigate = ctx.onNavigate;
  const showNotifications = ctx.showNotifications;
  const setShowNotifications = ctx.setShowNotifications;
  const safeNotifications = ctx.localSystemNotifications;

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'search-results':
        return <AdminSearchResults ctx={ctx} />;
      case 'overview':
        return <AdminOverview ctx={ctx} />;
      case 'inventory':
      case 'inventory-detail':
        return <AdminInventory ctx={ctx} />;
      case 'loyalty':
        return <AdminLoyalty ctx={ctx} />;
      case 'customer-groups':
        return <AdminCustomerGroups ctx={ctx} />;
      case 'orders':
        return <AdminOrders ctx={ctx} />;
      case 'stats':
        return <AdminStats ctx={ctx} />;
      case 'events':
        return <AdminEvents ctx={ctx} />;
      case 'site':
        return <AdminSite ctx={ctx} />;
      case 'products':
        return <AdminProducts ctx={ctx} />;
      case 'product-create':
      case 'product-edit':
        return <AdminProductForm ctx={ctx} />;
      case 'expenses':
        return <AdminExpenses ctx={ctx} />;
      case 'rmas':
        return <AdminRmas ctx={ctx} />;
      case 'abandoned-carts':
        return <AdminAbandonedCarts ctx={ctx} />;
      case 'promo-rules':
        return <AdminPromoRules ctx={ctx} />;
      case 'taxes':
        return <AdminTaxes ctx={ctx} />;
      case 'shipping':
        return <AdminShipping ctx={ctx} />;
      case 'import-export':
        return <AdminImportExport ctx={ctx} />;
      case 'categories':
        return <AdminCategories ctx={ctx} />;
      case 'category-create':
      case 'category-edit':
        return <AdminCategoryForm ctx={ctx} />;
      case 'reviews':
        return <AdminReviews ctx={ctx} />;
      case 'messages':
        return <AdminMessages ctx={ctx} />;
      case 'nav-items':
        return <AdminNavItems ctx={ctx} />;
      case 'qr':
        return <AdminQr ctx={ctx} />;
      case 'coupons':
        return <AdminCoupons ctx={ctx} />;
      case 'cities':
        return <AdminCities ctx={ctx} />;
      case 'roles':
        return <AdminRoles ctx={ctx} />;
      case 'flash-sales':
        return <AdminFlashSalesTab ctx={ctx} />;
      case 'lookbooks':
        return <AdminLookbooksTab ctx={ctx} />;
      case 'portfolios':
        return <AdminPortfoliosTab ctx={ctx} />;
      case 'customers':
        return <AdminCustomers ctx={ctx} />;
      case 'customer-detail':
        return <AdminCustomerDetail ctx={ctx} />;
      case 'packs':
        return <AdminPacks ctx={ctx} />;
      case 'lookbook':
        return <AdminLookbook ctx={ctx} />;
      case 'blog':
        return <AdminBlog ctx={ctx} />;
      case 'notifications':
        return <AdminNotifications ctx={ctx} />;
      case 'newsletter':
        return <AdminNewsletter ctx={ctx} />;
      case 'push-notifications':
        return <AdminPushNotifications ctx={ctx} />;
      case 'faq':
        return <AdminFaq ctx={ctx} />;
      case 'emails':
        return <AdminEmails ctx={ctx} />;
      case 'user-profile':
        return <AdminUserProfile ctx={ctx} />;
      case 'order-detail':
        return <AdminOrderDetail ctx={ctx} />;
      case 'rma-detail':
        return <AdminRmaDetail ctx={ctx} />;
      case 'site_logos':
        return <AdminSiteLogos ctx={ctx} />;
      case 'site_colors':
        return <AdminSiteColors ctx={ctx} />;
      case 'hero_banners':
        return <AdminHeroBanners ctx={ctx} />;
      case 'announcement_banners':
        return <AdminAnnouncementBanners ctx={ctx} />;
      case 'scrolling_banners':
        return <AdminScrollingBanners ctx={ctx} />;
      case 'seo_pages':
        return <AdminSeoPages ctx={ctx} />;
      case 'loyalty_config':
        return <AdminLoyaltyConfig ctx={ctx} />;
      case 'maintenance_config':
        return <AdminMaintenanceConfig ctx={ctx} />;
      case 'newsletter_config':
        return <AdminNewsletterConfig ctx={ctx} />;
      case 'invoice_config':
        return <AdminInvoiceConfig ctx={ctx} />;
      default:
        return (
          <div className="py-24 text-center text-primary/70">Onglet non reconnu ou contenu indisponible.</div>
        );
    }
  };

  if (isDataLoading) {
    return (
      <div className="h-[100dvh] overflow-hidden bg-[#fbf9f6] flex flex-col lg:flex-row">
        <AdminSidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          menuItems={filteredMenuItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={ctx.user}
          onNavigate={onNavigate}
          setEditingItem={ctx.setEditingItem}
        />
        <main className="flex-grow overflow-y-auto bg-[#fbf9f6] flex flex-col">
          <AdminHeader
            activeTab={activeTab}
            menuItems={filteredMenuItems}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
            localSystemNotifications={safeNotifications}
            handleNotificationClick={ctx.handleNotificationClick}
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
        menuItems={filteredMenuItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={ctx.user}
        onNavigate={onNavigate}
        setEditingItem={ctx.setEditingItem}
      />

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

      <main className="flex-grow overflow-y-auto bg-[#fbf9f6] custom-scrollbar">
        <AdminHeader
          activeTab={activeTab}
          menuItems={filteredMenuItems}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          localSystemNotifications={safeNotifications}
          handleNotificationClick={ctx.handleNotificationClick}
          setActiveTab={setActiveTab}
          onSearch={ctx.handleSearch}
        />

        <div className="px-6 lg:px-10 pb-10">
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
                <p className="text-primary/60 mb-8 leading-relaxed">Désolé, votre rôle actuel ("{userRoleSlug}") ne dispose pas des permissions nécessaires pour accéder au panneau d'administration. Seuls les administrateurs et gestionnaires peuvent accéder à cette section.</p>
                <button onClick={() => onNavigate('/')} className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-accent transition-all shadow-lg">Retour à la boutique</button>
              </motion.div>
            </div>
          )}

          {(userRoleSlug !== 'customer' && !isTabAllowed) && (
            <div className="flex-grow flex flex-col items-center justify-center p-10 mt-20 h-full">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6">
                <Lock size={32} />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-2">Section non autorisée</h3>
              <p className="text-primary/60 text-center max-w-sm mb-6">Votre rôle actuel ne vous permet pas d'accéder à l'onglet "<b>{activeMenuItem?.label}</b>".</p>
              {filteredMenuItems.length > 0 && (
                <button onClick={() => { const firstTab = filteredMenuItems.find(i => !i.isHeader); if (firstTab) setActiveTab(firstTab.id); }} className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-accent transition-all">Aller au Tableau de Bord</button>
              )}
            </div>
          )}

          {(userRoleSlug !== 'customer' && isTabAllowed) && (
            <div className="admin-dashboard-content-area">
              <AdminDashboardModals ctx={ctx} />
              {renderActiveTab()}
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
