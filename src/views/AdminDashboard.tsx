import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SiteConfig } from '../types';
import { useAdminData } from '../hooks/useAdminData';
import { AdminSidebar } from './Admin/AdminSidebar';
import { AdminHeader } from './Admin/AdminHeader';
import { AdminModals } from './Admin/AdminModals';
import { AdminContent } from './Admin/AdminContent';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onNavigate, 
  siteConfig: initialSiteConfig, 
  setSiteConfig: setGlobalSiteConfig 
}) => {
  const adminData = useAdminData(initialSiteConfig);
  const {
    activeTab, setActiveTab,
    isSidebarOpen, setIsSidebarOpen,
    showNotifications, setShowNotifications,
    isAddModalOpen, setIsAddModalOpen,
    modalType, setModalType,
    editingItem, setEditingItem,
    isSaving, setIsSaving,
    events, setEvents,
    selectedConversation, setSelectedConversation,
    selectedOrder, setSelectedOrder,
    selectedCustomer, setSelectedCustomer,
    localProducts, setLocalProducts,
    localCategories, setLocalCategories,
    localOrders, setLocalOrders,
    localPacks, setLocalPacks,
    localNotifications, setLocalNotifications,
    localEmails, setLocalEmails,
    localCurrencies, setLocalCurrencies,
    localUsers, setLocalUsers,
    localRoles, setLocalRoles,
    localExpenses, setLocalExpenses,
    selectedPackProducts, setSelectedPackProducts,
    siteConfig, setSiteConfig,
  } = adminData;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        onNavigate={onNavigate} 
      />

      <div className="flex-grow flex flex-col min-w-0">
        <AdminHeader 
          setIsSidebarOpen={setIsSidebarOpen} 
          showNotifications={showNotifications} 
          setShowNotifications={setShowNotifications} 
        />

        <main className="flex-grow p-4 lg:p-10 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AdminContent activeTab={activeTab} adminData={adminData} />
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="p-8 border-t border-slate-100 bg-white text-center">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">
            &copy; 2026 Landry Shop Admin Panel &bull; Version 2.5.0
          </p>
        </footer>
      </div>

      <AdminModals 
        isAddModalOpen={isAddModalOpen}
        setIsAddModalOpen={setIsAddModalOpen}
        modalType={modalType}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
        isSaving={isSaving}
        setIsSaving={setIsSaving}
        localProducts={localProducts}
        setLocalProducts={setLocalProducts}
        localCategories={localCategories}
        setLocalCategories={setLocalCategories}
        localCurrencies={localCurrencies}
        setLocalCurrencies={setLocalCurrencies}
        localEvents={events}
        setLocalEvents={setEvents}
        localPacks={localPacks}
        setLocalPacks={setLocalPacks}
        localNotifications={localNotifications}
        setLocalNotifications={setLocalNotifications}
        localEmails={localEmails}
        setLocalEmails={setLocalEmails}
        localUsers={localUsers}
        setLocalUsers={setLocalUsers}
        localRoles={localRoles}
        setLocalRoles={setLocalRoles}
        localExpenses={localExpenses}
        setLocalExpenses={setLocalExpenses}
        selectedPackProducts={selectedPackProducts}
        setSelectedPackProducts={setSelectedPackProducts}
      />
    </div>
  );
};

export default AdminDashboard;
