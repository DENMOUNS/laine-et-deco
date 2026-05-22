import React from 'react';
import { X, LogOut } from 'lucide-react';
import { User as FirebaseUser, signOut } from 'firebase/auth';
import { auth } from '../../../backend/firebase';
import { toast } from 'sonner';

interface AdminSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  menuItems: any[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: FirebaseUser | null;
  onNavigate: (view: string) => void;
  setEditingItem: (item: any) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  menuItems,
  activeTab,
  setActiveTab,
  onNavigate,
  setEditingItem,
}) => {
  return (
    <aside
      className={`
      fixed inset-y-0 left-0 z-40 w-72 bg-primary text-white flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 overflow-y-auto custom-scrollbar shadow-2xl shrink-0
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
    `}
    >
      <div className="p-8 flex justify-between items-center flex-shrink-0">
        <div>
          <h1 className="text-2xl font-serif font-bold">Admin Panel</h1>
          <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mt-1">Laine et Déco</p>
        </div>
        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-primary/10 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-grow px-4 space-y-2 mt-4 lg:mt-0">
        {menuItems.map((item) =>
          item.isHeader ? (
            <div key={item.id} className="pt-6 pb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-white/40">
              {item.label}
            </div>
          ) : (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setEditingItem(null);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id || (item.id === 'products' && (activeTab === 'product-create' || activeTab === 'product-edit'))
                  ? 'bg-white text-emerald-900 shadow-xl scale-[1.02] font-bold'
                  : 'text-white/70 hover:text-white hover:bg-white/10 hover:translate-x-1'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          )
        )}
      </nav>

      <div className="p-8 border-t border-white/10">
        <button
          onClick={async () => {
            toast.info('Déconnexion...');
            await signOut(auth);
            setTimeout(() => onNavigate('login'), 1000);
          }}
          className="flex items-center gap-4 text-white/60 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};
