import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  Scissors, 
  Star, 
  Clock, 
  Settings, 
  Shield, 
  MessageSquare,
  LogOut,
  ChevronRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Order, KnittingProject, LoginLog, UserProfile, User, Invoice, Product, Coupon } from '../../types';
import { useEntity } from '../hooks/useEntity';
import { where } from 'firebase/firestore';
import { User as FirebaseUser, signOut } from 'firebase/auth';
import { auth } from '../../backend/firebase';
import { toast } from 'sonner';

import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import { DashboardOverview } from '../components/dashboard/DashboardOverview';
import { DashboardOrders } from '../components/dashboard/DashboardOrders';
import { DashboardProjects } from '../components/dashboard/DashboardProjects';
import { DashboardLoyalty } from '../components/dashboard/DashboardLoyalty';
import { DashboardProfile } from '../components/dashboard/DashboardProfile';
import { DashboardPayments } from '../components/dashboard/DashboardPayments';
import { DashboardTools } from '../components/dashboard/DashboardTools';
import { OrderDetailsModal } from '../components/dashboard/OrderDetailsModal';
import { Loader } from '../components/Loader';

interface CustomerDashboardProps {
  user: FirebaseUser | null;
  onNavigate: (view: string, id?: string, query?: string) => void;
  initialTab?: string;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ user, onNavigate, initialTab = 'overview' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [orderFilter, setOrderFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch only this user's data
  const { data: orders, isLoading: isOrdersLoading } = useEntity<Order>('order', [], {
    constraints: [where('userId', '==', user?.uid || 'guest')],
    deps: [user?.uid]
  });

  const { data: knittingProjects, isLoading: isProjectsLoading } = useEntity<KnittingProject>('knitting_project', [], {
    constraints: [where('userId', '==', user?.uid || 'guest')],
    deps: [user?.uid]
  });

  const { data: userLogs, isLoading: isLogsLoading } = useEntity<LoginLog>('login_log', [], {
    constraints: [where('userId', '==', user?.uid || 'guest')],
    deps: [user?.uid]
  });

  const { data: invoices, isLoading: isInvoicesLoading } = useEntity<Invoice>('invoice', [], {
    constraints: [where('userId', '==', user?.uid || 'guest')],
    deps: [user?.uid]
  });

  const { data: allProducts } = useEntity<Product>('product', []);

  const { data: users, isLoading: isProfileLoading, updateEntity: updateProfile, setEntity: setProfile } = useEntity<User>('user', [], {
    constraints: [where('uid', '==', user?.uid || 'guest')],
    deps: [user?.uid]
  });

  const { addEntity: addCoupon } = useEntity<Coupon>('coupon');

  const userProfile: User = users[0] || {
    id: user?.uid || '',
    name: user?.displayName || 'Client',
    email: user?.email || '',
    points: 0,
    role: 'customer',
    joinDate: new Date().toISOString(),
    status: 'active',
    orders: 0
  };

  // AWARD 10,000 POINTS FOR TESTING
  React.useEffect(() => {
    if (user?.email === 'landrymouns@gmail.com' && (!userProfile.points || userProfile.points < 10000)) {
      setProfile(user.uid, { 
        ...userProfile,
        points: 10000,
        uid: user.uid,
        email: user.email,
        name: user.displayName || 'Landry M.',
        status: 'active',
        role: 'admin',
        updatedAt: new Date().toISOString() 
      });
      toast.info('Boost de 10 000 points activé pour vos tests !');
    }
  }, [user?.email, userProfile.points, user?.uid]);

  const handleRedeemPoints = async (cost: number, rewardId: string) => {
    if (userProfile.points < cost) {
      toast.error('Points insuffisants');
      return;
    }

    try {
      // Deduct points
      await updateProfile(userProfile.id, { points: userProfile.points - cost });

      // Generate localized coupon
      const shortId = userProfile.id.substring(0, 5).toUpperCase();
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const code = `LOYAL-${rewardId.toUpperCase()}-${shortId}-${randomSuffix}`;
      
      const newCoupon: Partial<Coupon> = {
        code,
        status: 'active',
        usageLimit: 1,
        usageCount: 0,
        restrictedToUserId: user?.uid,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      };

      if (rewardId === 'free-shipping') {
        newCoupon.type = 'free_shipping';
        newCoupon.discount = 0;
        newCoupon.freeShipping = true;
      } else if (rewardId === '10k-coupon') {
        newCoupon.type = 'fixed';
        newCoupon.discount = 10000;
        newCoupon.freeShipping = false;
      } else if (rewardId === 'mega-reward') {
        newCoupon.type = 'fixed';
        newCoupon.discount = 15000;
        newCoupon.freeShipping = true;
      }

      await addCoupon(newCoupon);
      toast.success(`Récompense échangée ! Votre code : ${code}. Il est disponible uniquement pour votre compte.`);
    } catch (err) {
      toast.error("Erreur lors de l'échange");
    }
  };

  const dashboardUser: User = {
    id: user?.uid || '',
    name: user?.displayName || 'Client',
    email: user?.email || '',
    role: 'customer',
    joinDate: user?.metadata.creationTime || new Date().toISOString(),
    orders: orders.length,
    points: userProfile.points || 0
  };

  const handleLogout = async () => {
    try {
      // Log the logout event before signing out
      if (user) {
        const { collection, addDoc } = await import('firebase/firestore');
        const { db } = await import('../../backend/firebase');
        await addDoc(collection(db, 'log'), {
          userId: user.uid,
          method: 'LOGOUT',
          path: 'auth',
          statusCode: 200,
          duration: 0,
          timestamp: new Date().toISOString(),
          device: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
          browser: navigator.userAgent
        });
      }

      await signOut(auth);
      onNavigate('home');
      toast.success('Déconnexion réussie');
    } catch (err) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader text="Vérification de l'authentification..." />
        </div>
      </div>
    );
  }

  const isDataLoading = isOrdersLoading || isProjectsLoading || isLogsLoading || isProfileLoading || isInvoicesLoading;

  const renderContent = () => {
    if (isDataLoading) return <Loader fullScreen text="Chargement de vos données..." />;

    switch (activeTab) {
      case 'overview':
        return (
          <DashboardOverview 
            user={dashboardUser} 
            knittingProjects={knittingProjects}
            userLogs={userLogs}
            orders={orders}
            userProfile={userProfile}
            setActiveTab={setActiveTab}
            setSelectedOrder={setSelectedOrder}
            onNavigate={onNavigate}
          />
        );
      case 'orders':
        return (
          <DashboardOrders 
            orders={orders} 
            orderFilter={orderFilter}
            setOrderFilter={setOrderFilter}
            setSelectedOrder={setSelectedOrder}
          />
        );
      case 'projects':
        return (
          <DashboardProjects 
            knittingProjects={knittingProjects}
            onNavigate={onNavigate}
            onDeleteProject={() => {}}
          />
        );
      case 'loyalty':
        return <DashboardLoyalty userProfile={userProfile} badges={[]} onRedeemPoints={handleRedeemPoints} />;
      case 'profile':
        return <DashboardProfile user={dashboardUser} onUpdateUser={() => {}} />;
      case 'payments':
        return (
          <DashboardPayments 
            orders={orders} 
            invoices={invoices} 
            paymentFilter="all" 
            setPaymentFilter={() => {}} 
          />
        );
      case 'tools':
        return (
          <DashboardTools 
            onNavigate={onNavigate} 
            woolCalculations={[]}
            volumeCalculations={[]}
            onDeleteWoolCalculation={() => {}}
            onDeleteVolumeCalculation={() => {}}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30 pb-20">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10">
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-card p-8 rounded-[3rem] shadow-sm border border-primary/5 text-center">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-accent rounded-full mb-6 flex items-center justify-center text-white text-3xl font-serif italic shadow-xl">
                {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
              </div>
              <h2 className="text-xl font-serif font-bold text-primary">{user.displayName || 'Client'}</h2>
              <p className="text-xs text-primary/40 mb-6 truncate">{user.email}</p>
              <div className="flex justify-center gap-2">
                <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-bold uppercase tracking-widest border border-accent/20">
                  {dashboardUser.loyaltyTier || 'Bronze'} Member
                </span>
                <span className="px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/10">
                  {userProfile.points} Points
                </span>
              </div>
            </div>

            <nav className="bg-card p-4 rounded-[3rem] shadow-sm border border-primary/5 space-y-1">
              {[
                { id: 'overview', label: 'Tableau de bord', icon: <TrendingUp size={20} /> },
                { id: 'orders', label: 'Mes Commandes', icon: <Package size={20} /> },
                { id: 'projects', label: 'Compagnon Tricot', icon: <Scissors size={20} /> },
                { id: 'loyalty', label: 'Programme Fidélité', icon: <Star size={20} /> },
                { id: 'profile', label: 'Profil & Sécurité', icon: <Settings size={20} /> },
                { id: 'tools', label: 'Outils Créatifs', icon: <MessageSquare size={20} /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
                    activeTab === item.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                    : 'text-primary/60 hover:bg-primary/5 hover:text-primary'
                  }`}
                >
                  <span className={activeTab === item.id ? 'text-accent' : 'text-primary/40'}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
              <div className="pt-4 mt-4 border-t border-primary/5">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
                >
                  <LogOut size={20} />
                  Déconnexion
                </button>
              </div>
            </nav>
          </div>

          {/* Main Display Area */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <OrderDetailsModal 
            selectedOrder={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
            onNavigate={onNavigate}
            products={allProducts}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
