import React from 'react';
import { AdminOverview } from './AdminOverview';
import { AdminProducts } from './AdminProducts';
import { AdminOrders } from './AdminOrders';
import { AdminCustomers } from './AdminCustomers';
import { AdminFinances } from './AdminFinances';
import { AdminCategories } from './AdminCategories';
import { AdminNotifications } from './AdminNotifications';
import { AdminReviews } from './AdminReviews';
import { AdminMessages } from './AdminMessages';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminCoupons } from './AdminCoupons';
import { AdminRoles } from './AdminRoles';
import { AdminUsers } from './AdminUsers';
import { AdminPacks } from './AdminPacks';
import { AdminEmails } from './AdminEmails';
import { AdminSite } from './AdminSite';
import { AdminLogs } from './AdminLogs';
import { AdminStats } from './AdminStats';
import { AdminEvents } from './AdminEvents';
import { AdminSettings } from './AdminSettings';

export const AdminContent = ({ activeTab, adminData }: { activeTab: string, adminData: any }) => {
  const {
    localOrders, localProducts, localExpenses, localCategories, localNotifications,
    localEmails, localUsers, localRoles, localPacks, siteConfig, setSiteConfig,
    orderFilter, setOrderFilter, productFilter, setProductFilter, customerFilter,
    setCustomerFilter, notificationFilter, setNotificationFilter, reviewFilter,
    setReviewFilter, logFilter, setLogFilter, requestLogFilter, setRequestLogFilter,
    messageInput, setMessageInput, orderPage, setOrderPage, productPage, setProductPage,
    customerPage, setCustomerPage, categoryPage, setCategoryPage, notificationPage,
    setNotificationPage, logPage, setLogPage, requestLogPage, setRequestLogPage,
    itemsPerPage, setModalType, setIsAddModalOpen, setEditingItem, handleDelete,
    selectedConversation, setSelectedConversation, selectedOrder, setSelectedOrder,
    selectedCustomer, setSelectedCustomer, setLocalCategories, setLocalNotifications,
    events, setEvents
  } = adminData;

  switch (activeTab) {
    case 'overview': return <AdminOverview localOrders={localOrders} localProducts={localProducts} />;
    case 'products': return (
      <AdminProducts 
        localProducts={localProducts} 
        productFilter={productFilter} 
        setProductFilter={setProductFilter}
        productPage={productPage}
        setProductPage={setProductPage}
        itemsPerPage={itemsPerPage}
        setModalType={setModalType}
        setIsAddModalOpen={setIsAddModalOpen}
        setEditingItem={setEditingItem}
        handleDelete={handleDelete}
      />
    );
    case 'orders': return (
      <AdminOrders 
        localOrders={localOrders} 
        orderFilter={orderFilter} 
        setOrderFilter={setOrderFilter}
        orderPage={orderPage}
        setOrderPage={setOrderPage}
        itemsPerPage={itemsPerPage}
        setSelectedOrder={setSelectedOrder}
        handleDelete={handleDelete}
      />
    );
    case 'customers': return (
      <AdminCustomers 
        localUsers={localUsers} 
        customerFilter={customerFilter} 
        setCustomerFilter={setCustomerFilter}
        customerPage={customerPage}
        setCustomerPage={setCustomerPage}
        itemsPerPage={itemsPerPage}
        setSelectedCustomer={setSelectedCustomer}
        setModalType={setModalType}
        setIsAddModalOpen={setIsAddModalOpen}
        setEditingItem={setEditingItem}
      />
    );
    case 'finances': return (
      <AdminFinances 
        localOrders={localOrders} 
        localProducts={localProducts} 
        localExpenses={localExpenses}
        setModalType={setModalType}
        setIsAddModalOpen={setIsAddModalOpen}
        setEditingItem={setEditingItem}
      />
    );
    case 'categories': return (
      <AdminCategories 
        localCategories={localCategories} 
        categoryPage={categoryPage}
        setCategoryPage={setCategoryPage}
        itemsPerPage={itemsPerPage}
        setModalType={setModalType}
        setIsAddModalOpen={setIsAddModalOpen}
        setEditingItem={setEditingItem}
        setLocalCategories={setLocalCategories}
      />
    );
    case 'notifications': return (
      <AdminNotifications 
        notifications={[]}
        notificationFilter={notificationFilter}
        setNotificationFilter={setNotificationFilter}
        notificationPage={notificationPage}
        setNotificationPage={setNotificationPage}
        itemsPerPage={itemsPerPage}
        localNotifications={localNotifications}
        setLocalNotifications={setLocalNotifications}
        setModalType={setModalType}
        setIsAddModalOpen={setIsAddModalOpen}
        setEditingItem={setEditingItem}
      />
    );
    case 'reviews': return <AdminReviews localProducts={localProducts} reviewFilter={reviewFilter} setReviewFilter={setReviewFilter} />;
    case 'messages': return (
      <AdminMessages 
        selectedConversation={selectedConversation}
        setSelectedConversation={setSelectedConversation}
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        handleSendMessage={() => {}}
      />
    );
    case 'analytics': return <AdminAnalytics />;
    case 'coupons': return <AdminCoupons />;
    case 'roles': return (
      <AdminRoles 
        localRoles={localRoles} 
        setModalType={setModalType}
        setIsAddModalOpen={setIsAddModalOpen}
        setEditingItem={setEditingItem}
      />
    );
    case 'users': return (
      <AdminUsers 
        localUsers={localUsers} 
        localRoles={localRoles}
        setModalType={setModalType}
        setIsAddModalOpen={setIsAddModalOpen}
        setEditingItem={setEditingItem}
      />
    );
    case 'packs': return (
      <AdminPacks 
        localPacks={localPacks} 
        setModalType={setModalType}
        setIsAddModalOpen={setIsAddModalOpen}
        setEditingItem={setEditingItem}
      />
    );
    case 'emails': return (
      <AdminEmails 
        localEmailTemplates={localEmails} 
        setModalType={setModalType}
        setIsAddModalOpen={setIsAddModalOpen}
        setEditingItem={setEditingItem}
      />
    );
    case 'site': return <AdminSite siteConfig={siteConfig} setSiteConfig={setSiteConfig} />;
    case 'logs': return (
      <AdminLogs 
        logFilter={logFilter} 
        setLogFilter={setLogFilter}
        logPage={logPage}
        setLogPage={setLogPage}
        requestLogFilter={requestLogFilter}
        setRequestLogFilter={setRequestLogFilter}
        requestLogPage={requestLogPage}
        setRequestLogPage={setRequestLogPage}
        itemsPerPage={itemsPerPage}
      />
    );
    case 'stats': return <AdminStats />;
    case 'events': return (
      <AdminEvents 
        events={events} 
        setModalType={setModalType}
        setIsAddModalOpen={setIsAddModalOpen}
        setEditingItem={setEditingItem}
      />
    );
    case 'settings': return <AdminSettings siteConfig={siteConfig} setSiteConfig={setSiteConfig} />;
    default: return <AdminOverview localOrders={localOrders} localProducts={localProducts} />;
  }
};
