import React from 'react';
import { Package, Clock, Star, ChevronRight, ShoppingBag, Scissors, Shield } from 'lucide-react';
import { User, Order, KnittingProject, LoginLog, UserProfile } from '../../../types';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';

interface DashboardOverviewProps {
  user: User;
  knittingProjects: KnittingProject[];
  userLogs: LoginLog[];
  orders: Order[];
  userProfile: User;
  setActiveTab: (tab: string) => void;
  setSelectedOrder: (order: Order) => void;
  onNavigate: (view: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  user,
  knittingProjects,
  userLogs,
  orders,
  userProfile,
  setActiveTab,
  setSelectedOrder,
  onNavigate
}) => {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: 'Commandes', value: user.orders, icon: <Package className="text-accent" /> },
          { label: 'Projets en cours', value: knittingProjects.filter(p => p.status === 'in-progress').length, icon: <Scissors className="text-blue-500" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/5 flex items-center gap-6">
            <div className="p-4 bg-secondary rounded-2xl">{stat.icon}</div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-primary">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-card rounded-[3rem] shadow-sm border border-primary/5 p-10">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-serif font-bold text-primary">Dernière Commande</h3>
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('orders')} 
              className="text-accent font-bold text-sm hover:underline flex items-center gap-1 h-auto px-0"
            >
              Voir tout <ChevronRight size={16} />
            </Button>
          </div>
          {orders.length > 0 && (
            <div className="p-6 bg-secondary rounded-[2rem] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-card rounded-xl shadow-sm text-primary">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-primary/70">{orders[0].id}</p>
                    <h4 className="font-bold text-sm text-primary">{orders[0].total.toLocaleString()} FCFA</h4>
                  </div>
                </div>
                <StatusBadge status={orders[0].status} />
              </div>
              <Button 
                variant="outline"
                onClick={() => setSelectedOrder(orders[0])}
                className="w-full py-3 bg-card border border-primary/5 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all h-auto"
              >
                Détails de la commande
              </Button>
            </div>
          )}
        </div>

        <div className="bg-card rounded-[3rem] shadow-sm border border-primary/5 p-10">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-serif font-bold text-primary">Projets Récents</h3>
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('projects')} 
              className="text-accent font-bold text-sm hover:underline flex items-center gap-1 h-auto px-0"
            >
              Voir tout <ChevronRight size={16} />
            </Button>
          </div>
          {knittingProjects.length > 0 ? (
            <div className="p-6 bg-secondary rounded-[2rem] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-card rounded-xl shadow-sm text-primary">
                    <Scissors size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-primary">{knittingProjects[0].name}</h4>
                    <p className="text-[10px] text-primary/70">Rang {knittingProjects[0].rowCount} / {knittingProjects[0].targetRows}</p>
                  </div>
                </div>
                <StatusBadge status={knittingProjects[0].status} />
              </div>
              <Button 
                variant="outline"
                onClick={() => onNavigate('calculator')}
                className="w-full py-3 bg-card border border-primary/5 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all h-auto"
              >
                Calculateur de Laine
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-primary/70">
                <p className="text-sm">Aucun projet en cours.</p>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('custom-order')} 
                  className="mt-2 text-accent font-bold text-xs hover:underline h-auto px-0"
                >
                  Commander Sur Mesure
                </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
