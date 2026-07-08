
import React from 'react';
import { Menu, Search, Bell, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Notification } from '../../../types';

interface AdminHeaderProps {
  activeTab: string;
  menuItems: any[];
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  localSystemNotifications: Notification[];
  handleNotificationClick: (notif: Notification) => void;
  setActiveTab: (tab: string) => void;
  onSearch: (query: string) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  menuItems,
  setIsSidebarOpen,
  showNotifications,
  setShowNotifications,
  localSystemNotifications,
  handleNotificationClick,
  setActiveTab,
  onSearch
}) => {
  const notifications = Array.isArray(localSystemNotifications) ? localSystemNotifications : [];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-primary/5 py-4 px-6 lg:px-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="lg:hidden p-2 text-primary/60 hover:text-primary transition-colors bg-card rounded-xl shadow-sm border border-primary/10"
        >
          <Menu size={24} />
        </button>
        <div>
          <h2 className="text-3xl font-serif text-primary">
            {menuItems.find(m => m.id === activeTab)?.label || (
              activeTab === 'rma-detail' ? 'Détails du Retour' :
              activeTab === 'product-edit' ? 'Modifier le Produit' :
              activeTab === 'product-create' ? 'Créer un Produit' :
              activeTab === 'customer-detail' ? 'Détails Client' :
              activeTab === 'order-detail' ? 'Détails Commande' :
              ''
            )}
          </h2>
          <p className="text-primary/60 text-sm">Laine et Déco — Gestion Professionnelle</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="relative flex-grow md:flex-grow-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60" size={18} />
          <input
            type="text"
            placeholder="Rechercher (CMD, Produit...)"
            className="pl-10 pr-4 py-2 bg-card border border-primary/10 rounded-xl focus:outline-none focus:border-primary w-full md:w-64"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearch(e.currentTarget.value.trim());
              }
            }}
          />
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 transition-colors ${showNotifications ? 'text-primary' : 'text-primary/60 hover:text-primary'}`}
          >
            <Bell size={20} />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-700 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-4 w-80 bg-card rounded-3xl shadow-2xl border border-primary/10 z-[60] overflow-hidden"
              >
                <div className="p-6 border-b border-primary/5 flex justify-between items-center bg-secondary/50">
                  <h4 className="font-serif font-bold text-primary">Notifications</h4>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent bg-primary/5 px-2 py-1 rounded-full">
                    {notifications.filter(n => !n.read).length} Nouvelles
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      onClick={() => {
                        handleNotificationClick(notif);
                        setShowNotifications(false);
                      }}
                      className={`p-6 border-b border-primary/5 flex gap-4 hover:bg-secondary/50 transition-colors cursor-pointer ${!notif.read ? 'bg-primary/5' : ''}`}
                    >
                      <div className={`p-3 rounded-xl flex-shrink-0 ${
                        notif.type === 'order' ? 'bg-green-200 text-green-800' :
                        notif.type === 'stock' ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'
                      }`}>
                        {notif.type === 'order' ? <CheckCircle2 size={18} /> : 
                         notif.type === 'stock' ? <AlertCircle size={18} /> : <MessageSquare size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary mb-1">{notif.title}</p>
                        <p className="text-xs text-primary/60 leading-relaxed mb-2">{notif.message}</p>
                        <p className="text-[10px] text-primary/60 font-medium">{notif.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => { setShowNotifications(false); setActiveTab('notifications'); }}
                  className="w-full py-4 text-xs font-bold text-primary hover:bg-secondary/50 transition-colors border-t border-primary/5"
                >
                  Voir toutes les notifications
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button 
          onClick={() => setActiveTab('user-profile')}
          className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold shadow-md flex-shrink-0 hover:bg-primary transition-all"
        >
          AD
        </button>
      </div>
    </header>
  );
};
