import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Package, ShoppingBag, Users, TrendingUp, 
  BarChart3, Ticket, Calendar as CalendarIcon, Lock, Bell, 
  MessageSquare, Settings, LogOut, X, Coins, History, Star
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  onNavigate: (view: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, onNavigate 
}) => {
  const menuItems = [
    { id: 'overview', label: 'Tableau de bord', icon: <LayoutDashboard size={20} /> },
    { id: 'products', label: 'Produits', icon: <Package size={20} /> },
    { id: 'packs', label: 'Packs', icon: <ShoppingBag size={20} /> },
    { id: 'orders', label: 'Commandes', icon: <ShoppingBag size={20} /> },
    { id: 'finances', label: 'Finances', icon: <TrendingUp size={20} /> },
    { id: 'categories', label: 'Catégories', icon: <LayoutDashboard size={20} /> },
    { id: 'customers', label: 'Clients', icon: <Users size={20} /> },
    { id: 'users', label: 'Utilisateurs', icon: <Users size={20} /> },
    { id: 'logs', label: 'Historique & Logs', icon: <History size={20} /> },
    { id: 'currencies', label: 'Devises', icon: <Coins size={20} /> },
    { id: 'stats', label: 'Statistiques', icon: <BarChart3 size={20} /> },
    { id: 'analytics', label: 'Analytique Avancée', icon: <TrendingUp size={20} /> },
    { id: 'coupons', label: 'Coupons', icon: <Ticket size={20} /> },
    { id: 'events', label: 'Évènements & Promos', icon: <CalendarIcon size={20} /> },
    { id: 'roles', label: 'Rôles', icon: <Lock size={20} /> },
    { id: 'notifications', label: 'Notifications Push', icon: <Bell size={20} /> },
    { id: 'emails', label: 'Emails', icon: <MessageSquare size={20} /> },
    { id: 'reviews', label: 'Avis Clients', icon: <Star size={20} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={20} /> },
    { id: 'site', label: 'Configuration Site', icon: <Settings size={20} /> },
  ];

  return (
    <>
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-primary text-white flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 overflow-y-auto custom-scrollbar shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex justify-between items-center flex-shrink-0">
          <div><h1 className="text-2xl font-serif font-bold">Admin Panel</h1><p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mt-1">Laine & Déco</p></div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <nav className="flex-grow px-4 space-y-2 mt-4 lg:mt-0">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-white text-primary shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              {item.icon}<span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-8 border-t border-white/10">
          <button onClick={() => { toast.info('Déconnexion...'); setTimeout(() => onNavigate('login'), 1000); }} className="flex items-center gap-4 text-white/60 hover:text-white transition-colors"><LogOut size={20} /><span>Déconnexion</span></button>
        </div>
      </aside>
      <AnimatePresence>{isSidebarOpen && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-30 lg:hidden" />)}</AnimatePresence>
    </>
  );
};
