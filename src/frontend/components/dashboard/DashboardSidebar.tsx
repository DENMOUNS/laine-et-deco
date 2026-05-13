import React from 'react';
import { LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { User } from '../../../types';
import { Button } from '../ui/Button';

interface DashboardSidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNavigate: (view: string) => void;
  menuItems: { id: string; label: string; icon: React.ReactNode }[];
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onNavigate,
  menuItems
}) => {
  return (
    <aside className="w-full lg:w-72 space-y-8">
      <div className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/5 text-center">
        <div className="w-24 h-24 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
          {user.name[0]}
        </div>
        <h2 className="text-xl font-serif font-bold text-primary">{user.name}</h2>
        <p className="text-sm text-primary/70 mb-6">{user.email}</p>
        <Button 
          variant="secondary"
          onClick={() => {
            toast.info('Déconnexion...');
            setTimeout(() => onNavigate('login'), 1000);
          }}
          className="w-full py-3 bg-secondary text-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-500 transition-all h-auto"
        >
          <LogOut size={18} /> Déconnexion
        </Button>
      </div>

      <nav className="bg-card p-4 rounded-[2.5rem] shadow-sm border border-primary/5 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeTab === item.id ? "primary" : "ghost"}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all h-auto justify-start ${
              activeTab === item.id ? 'bg-primary text-white shadow-md' : 'text-primary/70 hover:text-primary hover:bg-primary/5'
            }`}
          >
            {item.icon}
            <span className="font-bold text-sm">{item.label}</span>
          </Button>
        ))}
      </nav>
    </aside>
  );
};
