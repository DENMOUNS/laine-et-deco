import React from 'react';
import { 
  Search, Bell, Menu, User as UserIcon, Settings, 
  LogOut, MessageSquare, Package, ShoppingBag 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminHeaderProps {
  setIsSidebarOpen: (open: boolean) => void;
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  onNavigate: (view: string) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  setIsSidebarOpen, showNotifications, setShowNotifications, onNavigate 
}) => {
  return (
    <header className="h-24 bg-white border-b border-gray-100 px-8 flex items-center justify-between flex-shrink-0 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-6">
        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"><Menu size={20} /></button>
        <div className="relative group hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
          <input type="text" placeholder="Rechercher..." className="pl-12 pr-6 py-3 bg-gray-50 border-none rounded-full w-80 focus:ring-2 focus:ring-primary/20 transition-all text-sm" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button onClick={() => setShowNotifications(!showNotifications)} className="p-3 bg-gray-50 rounded-full hover:bg-gray-100 transition-all relative group">
            <Bell size={20} className="text-gray-600 group-hover:text-primary transition-colors" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          </button>
          <AnimatePresence>
            {showNotifications && (
              <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 mt-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-bold text-gray-900">Notifications</h3>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full uppercase tracking-tighter">3 Nouvelles</span>
                </div>
                <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                  {[
                    { id: 1, title: 'Nouvelle commande #4521', time: 'Il y a 2 min', icon: <ShoppingBag size={16} />, color: 'bg-blue-500', desc: 'Un client vient de commander un Pack Débutant.' },
                    { id: 2, title: 'Stock faible : Laine Mérinos', time: 'Il y a 15 min', icon: <Package size={16} />, color: 'bg-amber-500', desc: 'Il ne reste que 5 unités en stock.' },
                    { id: 3, title: 'Nouveau message client', time: 'Il y a 1h', icon: <MessageSquare size={16} />, color: 'bg-green-500', desc: 'Sophie Martin demande des conseils sur les aiguilles.' },
                  ].map((notif) => (
                    <div key={notif.id} className="p-5 hover:bg-gray-50 transition-colors border-b border-gray-50 cursor-pointer group">
                      <div className="flex gap-4">
                        <div className={`w-10 h-10 rounded-xl ${notif.color} text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform`}>{notif.icon}</div>
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-sm font-bold text-gray-900">{notif.title}</p>
                            <span className="text-[10px] font-bold text-gray-400 uppercase">{notif.time}</span>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed">{notif.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-gray-50/50 text-center border-t border-gray-50">
                  <button className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">Voir toutes les notifications</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="h-10 w-[1px] bg-gray-100 mx-2"></div>
        <div className="flex items-center gap-4 pl-2 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors leading-none">Admin User</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Super Admin</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border-2 border-transparent group-hover:border-primary/20 transition-all shadow-sm overflow-hidden">
            <UserIcon size={24} />
          </div>
        </div>
      </div>
    </header>
  );
};
