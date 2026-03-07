import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Bell,
  Plus,
  Menu,
  X,
  History,
  Coins,
  Globe,
  Shield,
  Activity,
  Smartphone,
  Monitor,
  Star,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Palette,
  Download,
  FileText,
  Table as TableIcon,
  Ticket,
  Lock,
  Eye,
  MousePointer2,
  Calendar as CalendarIcon,
  Image as ImageIcon,
  Type as TypeIcon,
  MonitorOff,
  Info
} from 'lucide-react';
import { 
  ORDERS, 
  PRODUCTS, 
  USERS, 
  CATEGORIES, 
  LOGIN_LOGS, 
  REQUEST_LOGS, 
  CURRENCIES, 
  NOTIFICATIONS, 
  SALES_DATA, 
  SITE_CONFIG, 
  CHAT_MESSAGES, 
  CONVERSATIONS, 
  COUPONS, 
  ADMIN_ROLES, 
  PROMO_EVENTS,
  CATEGORY_DISTRIBUTION,
  DEVICE_DATA,
  TRAFFIC_SOURCES,
  RETENTION_DATA,
  REVENUE_BY_PAYMENT
} from '../constants';
import { Modal } from '../components/Modal';
import { DataTable } from '../components/DataTable';
import { TabFilter } from '../components/TabFilter';
import { Notification, Product, Category, SiteConfig, ChatMessage, HomeSection, Conversation, Coupon, AdminRole, PromoEvent, Order, User as UserType, LoginLog, RequestLog } from '../types';
import { OrderMap } from '../components/OrderMap';
import { generateInvoicePDF } from '../utils/invoiceUtils';

import { toast } from 'sonner';
import { Loader } from '../components/Loader';

interface AdminDashboardProps {
  onNavigate: (view: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'product' | 'category' | 'currency' | 'site' | 'event'>('product');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(SITE_CONFIG);
  const [events, setEvents] = useState<PromoEvent[]>(PROMO_EVENTS);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<UserType | null>(null);
  const [localProducts, setLocalProducts] = useState<Product[]>(PRODUCTS);
  const [localCategories, setLocalCategories] = useState<Category[]>(CATEGORIES);
  const [localOrders, setLocalOrders] = useState<Order[]>(ORDERS);
  const [localUsers, setLocalUsers] = useState<UserType[]>(USERS);

  // Filter states
  const [orderFilter, setOrderFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [notificationFilter, setNotificationFilter] = useState('all');
  const [reviewFilter, setReviewFilter] = useState('all');
  const [logFilter, setLogFilter] = useState('all');
  const [requestLogFilter, setRequestLogFilter] = useState('all');
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    const handleClientMessage = (event: CustomEvent) => {
      const msg = event.detail;
      if (selectedConversation && selectedConversation.userId === msg.senderId) {
        setSelectedConversation(prev => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [...prev.messages, msg],
            lastMessage: msg.message,
            timestamp: msg.timestamp
          };
        });
      }
    };
    window.addEventListener('client-message', handleClientMessage as any);
    return () => window.removeEventListener('client-message', handleClientMessage as any);
  }, [selectedConversation]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: ChatMessage = {
      id: `m${Date.now()}`,
      senderId: 'u2', // Admin ID
      senderName: 'Admin Laine',
      message: messageInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAdmin: true
    };

    setSelectedConversation(prev => {
      if (!prev) return null;
      return {
        ...prev,
        messages: [...prev.messages, newMessage],
        lastMessage: messageInput,
        timestamp: 'À l\'instant'
      };
    });

    // Dispatch event for client to see
    window.dispatchEvent(new CustomEvent('admin-message', { detail: newMessage }));

    setMessageInput('');
    toast.success('Message envoyé');
  };
  const [categoryPage, setCategoryPage] = useState(1);
  const [notificationPage, setNotificationPage] = useState(1);
  const itemsPerPage = 5;
  const [overviewOrderFilter, setOverviewOrderFilter] = useState('all');

  const stats = [
    { label: 'Ventes Totales', value: '12,450,000 FCFA', change: '+12.5%', isUp: true, icon: <TrendingUp size={20} /> },
    { label: 'Commandes', value: '156', change: '+5.2%', isUp: true, icon: <ShoppingBag size={20} /> },
    { label: 'Nouveaux Clients', value: '42', change: '-2.4%', isUp: false, icon: <Users size={20} /> },
    { label: 'Panier Moyen', value: '79,800 FCFA', change: '+8.1%', isUp: true, icon: <BarChart3 size={20} /> },
  ];

  const menuItems = [
    { id: 'overview', label: 'Tableau de bord', icon: <LayoutDashboard size={20} /> },
    { id: 'products', label: 'Produits', icon: <Package size={20} /> },
    { id: 'orders', label: 'Commandes', icon: <ShoppingBag size={20} /> },
    { id: 'categories', label: 'Catégories', icon: <LayoutDashboard size={20} /> },
    { id: 'customers', label: 'Clients', icon: <Users size={20} /> },
    { id: 'logs', label: 'Historique & Logs', icon: <History size={20} /> },
    { id: 'currencies', label: 'Devises', icon: <Coins size={20} /> },
    { id: 'stats', label: 'Statistiques', icon: <BarChart3 size={20} /> },
    { id: 'analytics', label: 'Analytique Avancée', icon: <TrendingUp size={20} /> },
    { id: 'coupons', label: 'Coupons', icon: <Ticket size={20} /> },
    { id: 'events', label: 'Évènements & Promos', icon: <CalendarIcon size={20} /> },
    { id: 'roles', label: 'Rôles & Permissions', icon: <Lock size={20} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
    { id: 'reviews', label: 'Avis Clients', icon: <Star size={20} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={20} /> },
    { id: 'site', label: 'Configuration Site', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden bg-primary text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-serif font-bold">Laine&Déco Admin</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-primary text-white flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 overflow-y-auto custom-scrollbar shadow-2xl
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex justify-between items-center flex-shrink-0">
          <div>
            <h1 className="text-2xl font-serif font-bold">Admin Panel</h1>
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mt-1">Laine & Déco</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-grow px-4 space-y-2 mt-4 lg:mt-0">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id ? 'bg-white text-primary shadow-lg' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/10">
          <button 
            onClick={() => {
              toast.info('Déconnexion...');
              setTimeout(() => onNavigate('login'), 1000);
            }}
            className="flex items-center gap-4 text-white/60 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
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

      {/* Main Content */}
      <main className="flex-grow p-4 lg:p-10 overflow-y-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="lg:hidden p-2 text-slate-400 hover:text-primary transition-colors bg-white rounded-xl shadow-sm border border-slate-100"
            >
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-3xl font-serif text-slate-900">
                {menuItems.find(m => m.id === activeTab)?.label}
              </h2>
              <p className="text-slate-400">Bienvenue, Admin. Voici ce qui se passe aujourd'hui.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-primary w-full md:w-64"
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 transition-colors ${showNotifications ? 'text-primary' : 'text-slate-400 hover:text-primary'}`}
              >
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-50" />
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 z-[60] overflow-hidden"
                  >
                    <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                      <h4 className="font-serif font-bold text-slate-900">Notifications</h4>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-2 py-1 rounded-full">3 Nouvelles</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {NOTIFICATIONS.map((notif) => (
                        <div key={notif.id} className={`p-6 border-b border-slate-50 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer ${!notif.read ? 'bg-primary/5' : ''}`}>
                          <div className={`p-3 rounded-xl flex-shrink-0 ${
                            notif.type === 'order' ? 'bg-green-100 text-green-600' :
                            notif.type === 'stock' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {notif.type === 'order' ? <CheckCircle2 size={18} /> : 
                             notif.type === 'stock' ? <AlertCircle size={18} /> : <MessageSquare size={18} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 mb-1">{notif.title}</p>
                            <p className="text-xs text-slate-500 leading-relaxed mb-2">{notif.message}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{notif.timestamp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-4 text-xs font-bold text-primary hover:bg-slate-50 transition-colors border-t border-slate-50">
                      Voir toutes les notifications
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold shadow-md flex-shrink-0">
              AD
            </div>
          </div>
        </header>

        {/* Modals */}
        <Modal 
          isOpen={isAddModalOpen || !!editingItem} 
          onClose={() => { setIsAddModalOpen(false); setEditingItem(null); }} 
          title={
            editingItem ? `Modifier ${editingItem.name || 'l\'élément'}` :
            modalType === 'product' ? 'Ajouter un Produit' : 
            modalType === 'category' ? 'Nouvelle Catégorie' : 
            modalType === 'event' ? 'Créer un Évènement' : 'Ajouter une Devise'
          }
        >
          <form className="space-y-6" onSubmit={(e) => { 
            e.preventDefault(); 
            const formData = new FormData(e.currentTarget);
            const name = formData.get('name') as string;
            
            if (editingItem) {
              toast.success(`${editingItem.name || 'L\'élément'} a été mis à jour avec succès !`);
            } else {
              toast.success('Nouvel élément ajouté avec succès !');
            }
            
            setIsAddModalOpen(false); 
            setEditingItem(null); 
          }}>
            {modalType === 'product' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Nom du produit</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-primary" 
                    placeholder="Laine Mérinos..." 
                    defaultValue={editingItem?.name}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Catégorie</label>
                  <select 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-primary"
                    defaultValue={editingItem?.category}
                  >
                    {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Prix (FCFA)</label>
                  <input 
                    type="number" 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-primary" 
                    placeholder="8500" 
                    defaultValue={editingItem?.price}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Prix Promo (Optionnel)</label>
                  <input 
                    type="number" 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-primary" 
                    placeholder="7500" 
                    defaultValue={editingItem?.promoPrice}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Stock Initial</label>
                  <input 
                    type="number" 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-primary" 
                    placeholder="50" 
                    defaultValue={editingItem?.stock}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Disponibilité</label>
                  <div className="flex items-center gap-4 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <span className="text-sm font-medium text-slate-600">En stock</span>
                    <button 
                      type="button"
                      onClick={() => setEditingItem(prev => ({ ...prev, isAvailable: !prev?.isAvailable }))}
                      className={`w-12 h-6 rounded-full relative transition-colors ${editingItem?.isAvailable !== false ? 'bg-green-500' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingItem?.isAvailable !== false ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
                <div className="col-span-2 space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-primary">SEO & Visibilité</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Meta Title</label>
                      <input 
                        type="text" 
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-primary" 
                        placeholder="Titre pour Google..." 
                        defaultValue={editingItem?.seo?.title}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Meta Description</label>
                      <textarea 
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-primary h-20" 
                        placeholder="Description pour les résultats de recherche..."
                        defaultValue={editingItem?.seo?.description}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Couleurs Disponibles</label>
                  <div className="flex flex-wrap gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    {['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00'].map(color => (
                      <button 
                        key={color} 
                        type="button" 
                        className={`w-10 h-10 rounded-full border-2 shadow-sm hover:scale-110 transition-transform ${editingItem?.colors?.includes(color) ? 'border-primary' : 'border-white'}`} 
                        style={{ backgroundColor: color }} 
                      />
                    ))}
                    <button type="button" className="w-10 h-10 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-primary hover:text-primary transition-all">
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Description</label>
                  <textarea 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-primary h-32" 
                    placeholder="Description détaillée du produit..."
                    defaultValue={editingItem?.description}
                  ></textarea>
                </div>
              </div>
            )}

            {modalType === 'category' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Nom de la catégorie</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-primary" 
                    placeholder="Décoration Murale..." 
                    defaultValue={editingItem?.name}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Image de couverture (URL)</label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-primary" 
                    placeholder="https://..." 
                    defaultValue={editingItem?.image}
                  />
                </div>
              </div>
            )}

            {modalType === 'event' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Nom de l'évènement</label>
                    <input 
                      type="text" 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-primary" 
                      placeholder="Soldes d'Été..." 
                      defaultValue={editingItem?.name}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Date de début</label>
                    <input 
                      type="datetime-local" 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-primary" 
                      defaultValue={editingItem?.startDate}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Date de fin</label>
                    <input 
                      type="datetime-local" 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-primary" 
                      defaultValue={editingItem?.endDate}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Pourcentage de remise (%)</label>
                    <input 
                      type="number" 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-primary" 
                      placeholder="20" 
                      defaultValue={editingItem?.discountPercentage}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Portée</label>
                    <select 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-primary"
                      defaultValue={editingItem?.applyToAll ? 'all' : 'specific'}
                    >
                      <option value="all">Tous les produits</option>
                      <option value="specific">Produits spécifiques</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 flex gap-4">
              <button type="button" onClick={() => { setIsAddModalOpen(false); setEditingItem(null); }} className="flex-grow py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                Annuler
              </button>
              <button type="submit" className="flex-grow py-4 bg-primary text-white rounded-2xl font-bold hover:bg-accent transition-all shadow-lg">
                {editingItem ? 'Enregistrer les modifications' : 'Confirmer l\'ajout'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Order Details Modal */}
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Détails de la commande ${selectedOrder?.id}`}
          maxWidth="max-w-4xl"
        >
          {selectedOrder && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Informations Client</h4>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                      <p className="font-bold text-lg text-slate-900">{selectedOrder.customer}</p>
                      <p className="text-sm text-slate-500 mt-1">{selectedOrder.address || 'Adresse non renseignée'}</p>
                      <div className="mt-4 flex gap-2">
                        <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-600">
                          {selectedOrder.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Articles</h4>
                    <div className="space-y-3">
                      {selectedOrder.orderDetails?.map((item, i) => (
                        <div key={i} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                          <div>
                            <p className="font-bold text-sm">{item.name}</p>
                            <p className="text-xs text-slate-400">Quantité: {item.quantity}</p>
                          </div>
                          <p className="font-bold text-primary">{item.price.toLocaleString()} FCFA</p>
                        </div>
                      ))}
                      <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                        <p className="font-serif text-lg font-bold">Total</p>
                        <p className="text-xl font-bold text-accent">{selectedOrder.total.toLocaleString()} FCFA</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Localisation & Itinéraire</h4>
                  <div className="h-[400px] rounded-3xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50">
                    <OrderMap 
                      customerLocation={selectedOrder.coordinates || [4.0511, 9.7679]} 
                      customerName={selectedOrder.customer}
                    />
                  </div>
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3">
                    <Info size={20} className="text-blue-500 flex-shrink-0" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                      L'itinéraire affiché est une estimation basée sur les coordonnées GPS fournies. 
                      Le livreur peut adapter le trajet en fonction du trafic réel.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="px-8 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Fermer
                </button>
                <button 
                  onClick={() => generateInvoicePDF(selectedOrder)}
                  className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-accent transition-all shadow-lg"
                >
                  Imprimer la facture
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Customer Details Modal */}
        <Modal
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          title={`Profil Client: ${selectedCustomer?.name}`}
        >
          {selectedCustomer && (
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-[2rem] bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold shadow-inner">
                  {selectedCustomer.name[0]}
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-slate-900">{selectedCustomer.name}</h3>
                  <p className="text-slate-400">{selectedCustomer.email}</p>
                  <div className="mt-2 flex gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest">Actif</span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-widest">Client depuis {new Date(selectedCustomer.joinDate).getFullYear()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Commandes</p>
                  <p className="text-2xl font-bold text-slate-900">{selectedCustomer.orders}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total Dépensé</p>
                  <p className="text-2xl font-bold text-primary">{(selectedCustomer.orders * 15000).toLocaleString()} FCFA</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Points</p>
                  <p className="text-2xl font-bold text-accent">450</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Dernières Commandes</h4>
                <div className="space-y-2">
                  {localOrders.filter(o => o.customer === selectedCustomer.name).map(order => (
                    <div key={order.id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-2xl">
                      <div>
                        <p className="font-bold text-sm">{order.id}</p>
                        <p className="text-xs text-slate-400">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">{order.total.toLocaleString()} FCFA</p>
                        <span className="text-[10px] font-bold uppercase text-green-500">{order.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button className="flex-grow py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                  Désactiver le compte
                </button>
                <button className="flex-grow py-4 bg-primary text-white rounded-2xl font-bold hover:bg-accent transition-all shadow-lg">
                  Envoyer un message
                </button>
              </div>
            </div>
          )}
        </Modal>

        {activeTab === 'overview' && (
          <div className="space-y-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-slate-50 rounded-2xl text-primary">{stat.icon}</div>
                    <span className={`flex items-center text-xs font-bold ${stat.isUp ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.change}
                      {stat.isUp ? <ArrowUpRight size={14} className="ml-1" /> : <ArrowDownRight size={14} className="ml-1" />}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              {/* Recent Orders */}
              <div className="xl:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-serif">Commandes Récentes</h3>
                  <TabFilter 
                    options={[
                      { id: 'all', label: 'Toutes' },
                      { id: 'today', label: 'Aujourd\'hui' },
                      { id: 'yesterday', label: 'Hier' },
                    ]}
                    active={overviewOrderFilter}
                    onChange={setOverviewOrderFilter}
                    className="mb-0"
                  />
                </div>
                <DataTable<Order>
                  data={localOrders.slice(0, 10).filter(o => {
                    if (overviewOrderFilter === 'all') return true;
                    if (overviewOrderFilter === 'today') return o.date.includes('2024'); // Mock today
                    if (overviewOrderFilter === 'yesterday') return o.date.includes('2023'); // Mock yesterday
                    return true;
                  })}
                  title="Commandes Récentes"
                  onRowClick={(order) => setSelectedOrder(order)}
                  columns={[
                    { header: 'ID', accessor: 'id', className: 'font-mono text-xs' },
                    { header: 'Client', accessor: 'customer', className: 'font-medium' },
                    { header: 'Date', accessor: 'date', className: 'text-slate-400 text-sm' },
                    { 
                      header: 'Total', 
                      accessor: (order: Order) => <span className="font-bold">{order.total.toLocaleString()} FCFA</span>,
                      exportValue: (order: Order) => `${order.total} FCFA`
                    },
                    {
                      header: 'Statut',
                      accessor: (order: Order) => (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-600' : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {order.status}
                        </span>
                      ),
                      exportValue: (order: Order) => order.status
                    }
                  ]}
                />
              </div>

              {/* Best Sellers */}
              <div className="space-y-10">
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
                  <h3 className="text-xl font-serif mb-8">Meilleures Ventes</h3>
                  <div className="space-y-6">
                    {PRODUCTS.slice(0, 4).map((product) => (
                      <div key={product.id} className="flex items-center gap-4">
                        <img src={product.image} alt={product.name} className="w-12 h-16 object-cover rounded-lg" referrerPolicy="no-referrer" />
                        <div className="flex-grow">
                          <h4 className="font-medium text-sm line-clamp-1">{product.name}</h4>
                          <p className="text-slate-400 text-xs">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">{product.price.toLocaleString()} FCFA</p>
                          <p className="text-[10px] text-green-500 font-bold">+12%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-red-100 p-8 bg-red-50/30">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-serif text-red-900">Alertes Stock</h3>
                    <AlertCircle className="text-red-500" size={20} />
                  </div>
                  <div className="space-y-4">
                    {PRODUCTS.filter(p => p.stock < 15).map((product) => (
                      <div key={product.id} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-red-50 shadow-sm">
                        <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-lg" referrerPolicy="no-referrer" />
                        <div className="flex-grow">
                          <h4 className="font-bold text-xs line-clamp-1">{product.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-grow h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-red-500" style={{ width: `${(product.stock / 50) * 100}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-red-600">{product.stock} restants</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-6 py-3 bg-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-200">
                    Commander du stock
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <TabFilter 
              options={[
                { id: 'all', label: 'Tous' },
                { id: 'pending', label: 'En attente' },
                { id: 'processing', label: 'Traitement' },
                { id: 'shipped', label: 'Expédié' },
                { id: 'delivered', label: 'Livré' },
                { id: 'cancelled', label: 'Annulé' },
              ]}
              active={orderFilter}
              onChange={setOrderFilter}
            />
            <DataTable<Order>
              data={orderFilter === 'all' ? localOrders : localOrders.filter(o => o.status === orderFilter)}
              onRowClick={(order) => setSelectedOrder(order)}
              title="Liste des Commandes"
              columns={[
              { header: 'ID', accessor: 'id', className: 'font-mono text-xs' },
              { header: 'Client', accessor: 'customer', className: 'font-medium' },
              { header: 'Date', accessor: 'date', className: 'text-slate-400 text-sm' },
              { 
                header: 'Total', 
                accessor: (order: Order) => <span className="font-bold">{order.total.toLocaleString()} FCFA</span>,
                exportValue: (order: Order) => `${order.total} FCFA`
              },
              {
                header: 'Statut',
                accessor: (order: Order) => (
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                    order.status === 'shipped' ? 'bg-purple-100 text-purple-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {order.status}
                  </span>
                ),
                exportValue: (order: Order) => order.status
              },
              {
                header: 'Actions',
                accessor: (order: Order) => (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                    className="text-primary font-bold text-sm hover:underline"
                  >
                    Détails
                  </button>
                )
              }
            ]}
          />
        </div>
      )}

        {activeTab === 'logs' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              {/* Login History */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-serif flex items-center gap-3">
                    <Shield className="text-accent" size={24} /> Connexions
                  </h3>
                  <TabFilter 
                    options={[
                      { id: 'all', label: 'Tous' },
                      { id: 'iPhone', label: 'Mobile' },
                      { id: 'Mac', label: 'Desktop' },
                    ]}
                    active={logFilter}
                    onChange={setLogFilter}
                    className="mb-0"
                  />
                </div>
                <DataTable<LoginLog>
                  data={LOGIN_LOGS.filter(l => logFilter === 'all' || l.device.includes(logFilter))}
                  title="Historique des Connexions"
                  columns={[
                    { 
                      header: 'Utilisateur', 
                      accessor: (log) => (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-50 rounded-lg text-primary">
                            {log.device.includes('iPhone') ? <Smartphone size={16} /> : <Monitor size={16} />}
                          </div>
                          <span className="font-bold">{log.userName}</span>
                        </div>
                      ),
                      exportValue: (log) => log.userName
                    },
                    { header: 'Appareil', accessor: 'device', className: 'text-slate-400 text-xs' },
                    { header: 'Date', accessor: 'timestamp', className: 'text-slate-400 text-xs' },
                    { header: 'IP', accessor: 'ip', className: 'font-mono text-[10px]' },
                    { 
                      header: 'Statut', 
                      accessor: () => <span className="text-[10px] font-bold uppercase text-green-500">Succès</span>,
                      exportValue: () => 'Succès'
                    }
                  ]}
                />
              </div>

              {/* Request Logs */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-serif flex items-center gap-3">
                    <Activity className="text-primary" size={24} /> Requêtes API
                  </h3>
                  <TabFilter 
                    options={[
                      { id: 'all', label: 'Toutes' },
                      { id: 'success', label: 'Succès' },
                      { id: 'error', label: 'Erreurs' },
                    ]}
                    active={requestLogFilter}
                    onChange={setRequestLogFilter}
                    className="mb-0"
                  />
                </div>
                <DataTable<RequestLog>
                  data={REQUEST_LOGS.filter(req => {
                    if (requestLogFilter === 'all') return true;
                    if (requestLogFilter === 'success') return req.status < 400;
                    if (requestLogFilter === 'error') return req.status >= 400;
                    return true;
                  })}
                  title="Logs des Requêtes"
                  columns={[
                    { header: 'Méthode', accessor: 'method', className: 'font-bold text-primary' },
                    { header: 'Path', accessor: 'path', className: 'font-mono text-slate-500 text-xs' },
                    { 
                      header: 'Status', 
                      accessor: (req) => <span className={req.status >= 400 ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>{req.status}</span>,
                      exportValue: (req) => String(req.status)
                    },
                    { header: 'Temps', accessor: 'duration', className: 'text-slate-400 text-xs' },
                    { header: 'Date', accessor: 'timestamp', className: 'text-slate-400 text-[10px]' }
                  ]}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Sales Trend */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-serif">Évolution des Ventes</h3>
                  <select className="text-xs font-bold uppercase tracking-widest text-primary bg-slate-50 px-4 py-2 rounded-xl border-none focus:ring-0">
                    <option>6 derniers mois</option>
                    <option>12 derniers mois</option>
                  </select>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={SALES_DATA}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5A5A40" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#5A5A40" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(value) => `${value/1000}k`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`${value.toLocaleString()} FCFA`, 'Ventes']}
                      />
                      <Area type="monotone" dataKey="sales" stroke="#5A5A40" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Orders Trend */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-serif">Volume de Commandes</h3>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <div className="w-3 h-3 rounded-full bg-accent" /> Commandes
                    </div>
                  </div>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={SALES_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="orders" fill="#F27D26" radius={[6, 6, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Taux de Conversion', value: '3.2%', sub: '+0.4% vs mois dernier', color: 'text-blue-600' },
                { label: 'Clients Fidèles', value: '68%', sub: 'Clients avec > 2 commandes', color: 'text-green-600' },
                { label: 'Taux d\'Abandon', value: '24%', sub: '-5% vs mois dernier', color: 'text-red-600' },
              ].map((card, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{card.label}</p>
                  <h4 className={`text-3xl font-bold mb-2 ${card.color}`}>{card.value}</h4>
                  <p className="text-xs text-slate-400">{card.sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Device Distribution */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-xl font-serif mb-8">Appareils Utilisés</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Mobile', value: 65, color: '#F27D26' },
                          { name: 'Desktop', value: 30, color: '#5A5A40' },
                          { name: 'Tablette', value: 5, color: '#94a3b8' },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { name: 'Mobile', value: 65, color: '#F27D26' },
                          { name: 'Desktop', value: 30, color: '#5A5A40' },
                          { name: 'Tablette', value: 5, color: '#94a3b8' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-accent" />
                      <span className="text-sm text-slate-600">Mobile</span>
                    </div>
                    <span className="font-bold">65%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-sm text-slate-600">Desktop</span>
                    </div>
                    <span className="font-bold">30%</span>
                  </div>
                </div>
              </div>

              {/* Traffic Sources */}
              <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-xl font-serif mb-8">Sources de Trafic</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={[
                        { name: 'Recherche Google', value: 4500, color: '#5A5A40' },
                        { name: 'Réseaux Sociaux', value: 3200, color: '#F27D26' },
                        { name: 'Direct', value: 2100, color: '#94a3b8' },
                        { name: 'Email Marketing', value: 1500, color: '#F27D26' },
                      ]}
                      margin={{ left: 40 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip cursor={{fill: 'transparent'}} />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {[
                          { name: 'Recherche Google', value: 4500, color: '#5A5A40' },
                          { name: 'Réseaux Sociaux', value: 3200, color: '#F27D26' },
                          { name: 'Direct', value: 2100, color: '#94a3b8' },
                          { name: 'Email Marketing', value: 1500, color: '#F27D26' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Customer Retention Chart */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-serif mb-8">Rétention des Clients</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={SALES_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="orders" stroke="#F27D26" strokeWidth={3} dot={{ r: 4, fill: '#F27D26', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-serif flex items-center gap-3 text-slate-900">
                <CalendarIcon className="text-accent" size={24} /> Évènements Promotionnels
              </h3>
              <button 
                onClick={() => { setModalType('event'); setIsAddModalOpen(true); }}
                className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-md"
              >
                <Plus size={18} /> Créer un évènement
              </button>
            </div>
            <DataTable<PromoEvent>
              data={events}
              title="Évènements Promotionnels"
              columns={[
                { header: 'Nom', accessor: 'name', className: 'font-bold' },
                { 
                  header: 'Période', 
                  accessor: (e) => (
                    <div className="text-xs text-slate-500">
                      <div>Du {new Date(e.startDate).toLocaleString()}</div>
                      <div>Au {new Date(e.endDate).toLocaleString()}</div>
                    </div>
                  )
                },
                { header: 'Remise', accessor: (e) => <span className="text-accent font-bold">-{e.discountPercentage}%</span> },
                { 
                  header: 'Portée', 
                  accessor: (e) => e.applyToAll ? 'Tous les produits' : `${e.productIds?.length || 0} produits`
                },
                {
                  header: 'Statut',
                  accessor: (e) => (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      e.status === 'active' ? 'bg-green-100 text-green-600' :
                      e.status === 'scheduled' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {e.status === 'active' ? 'En cours' : e.status === 'scheduled' ? 'Planifié' : 'Terminé'}
                    </span>
                  )
                },
                {
                  header: 'Actions',
                  accessor: (e) => (
                    <div className="flex gap-2">
                      <button onClick={() => { setModalType('event'); setEditingItem(e); }} className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors"><Settings size={16} /></button>
                      <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><X size={16} /></button>
                    </div>
                  )
                }
              ]}
            />
          </div>
        )}

        {activeTab === 'site' && (
          <div className="space-y-12">
            {/* Branding & Colors */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/5 text-primary rounded-2xl"><Palette size={24} /></div>
                <div>
                  <h3 className="text-xl font-serif">Identité & Couleurs</h3>
                  <p className="text-xs text-slate-400">Personnalisez l'apparence de votre boutique</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Logo du site</label>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                      <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-slate-300">
                        <ImageIcon size={24} />
                      </div>
                      <button className="text-xs font-bold text-primary hover:underline">Changer le logo</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Couleur Primaire</label>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <input 
                          type="color" 
                          value={siteConfig.primaryColor} 
                          onChange={(e) => setSiteConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                          className="w-10 h-10 rounded-lg border-none bg-transparent cursor-pointer"
                        />
                        <span className="text-xs font-mono font-bold">{siteConfig.primaryColor}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Couleur Accent</label>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <input 
                          type="color" 
                          value={siteConfig.accentColor} 
                          onChange={(e) => setSiteConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                          className="w-10 h-10 rounded-lg border-none bg-transparent cursor-pointer"
                        />
                        <span className="text-xs font-mono font-bold">{siteConfig.accentColor}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Aperçu en direct</h4>
                  <div className="space-y-4">
                    <div className="h-4 w-32 rounded-full" style={{ backgroundColor: siteConfig.primaryColor }} />
                    <div className="h-10 w-full rounded-2xl" style={{ backgroundColor: siteConfig.primaryColor }} />
                    <div className="flex gap-2">
                      <div className="h-8 w-24 rounded-xl" style={{ backgroundColor: siteConfig.accentColor }} />
                      <div className="h-8 w-24 rounded-xl bg-white border border-slate-200" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Hero Section */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-accent/5 text-accent rounded-2xl"><Monitor size={24} /></div>
                <div>
                  <h3 className="text-xl font-serif">Section Hero (Accueil)</h3>
                  <p className="text-xs text-slate-400">Modifiez le message d'accueil et l'image principale</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Titre d'accroche (H1)</label>
                    <textarea 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-primary h-32" 
                      value={siteConfig.hero.title}
                      onChange={(e) => setSiteConfig(prev => ({ ...prev, hero: { ...prev.hero, title: e.target.value } }))}
                    ></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Image de fond (URL)</label>
                    <input 
                      type="text" 
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:border-primary" 
                      value={siteConfig.hero.backgroundImage}
                      onChange={(e) => setSiteConfig(prev => ({ ...prev, hero: { ...prev.hero, backgroundImage: e.target.value } }))}
                    />
                  </div>
                </div>
                <div className="relative aspect-video rounded-3xl overflow-hidden shadow-lg group">
                  <img src={siteConfig.hero.backgroundImage} alt="Hero Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-8">
                    <h1 className="text-white text-2xl font-serif text-center">{siteConfig.hero.title}</h1>
                  </div>
                </div>
              </div>
            </section>

            {/* SEO Global */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Globe size={24} /></div>
                <div>
                  <h3 className="text-xl font-serif">SEO & Référencement</h3>
                  <p className="text-xs text-slate-400">Optimisez la visibilité de vos pages sur Google</p>
                </div>
              </div>
              <div className="space-y-8">
                {['home', 'shop', 'contact', 'about'].map((page) => (
                  <div key={page} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                      <TypeIcon size={14} /> Page {page === 'home' ? 'Accueil' : page === 'shop' ? 'Boutique' : page === 'contact' ? 'Contact' : 'À Propos'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Meta Title</label>
                        <input 
                          type="text" 
                          className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:border-primary" 
                          value={(siteConfig.seo as any)[page].title}
                          onChange={(e) => {
                            const newSeo = { ...siteConfig.seo };
                            (newSeo as any)[page].title = e.target.value;
                            setSiteConfig(prev => ({ ...prev, seo: newSeo }));
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Meta Description</label>
                        <textarea 
                          className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:border-primary h-20" 
                          value={(siteConfig.seo as any)[page].description}
                          onChange={(e) => {
                            const newSeo = { ...siteConfig.seo };
                            (newSeo as any)[page].description = e.target.value;
                            setSiteConfig(prev => ({ ...prev, seo: newSeo }));
                          }}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Maintenance Mode */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-red-100 bg-red-50/10">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-red-100 text-red-600 rounded-2xl"><MonitorOff size={24} /></div>
                <div>
                  <h3 className="text-xl font-serif text-red-900">Mode Maintenance</h3>
                  <p className="text-xs text-red-400">Désactivez temporairement l'accès au site pour les clients</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-6 bg-white border border-red-100 rounded-3xl shadow-sm">
                    <div>
                      <p className="font-bold text-slate-900">Activer la maintenance</p>
                      <p className="text-xs text-slate-400">Redirige les clients vers une page d'attente</p>
                    </div>
                    <button 
                      onClick={() => setSiteConfig(prev => ({ ...prev, maintenance: { ...prev.maintenance, isActive: !prev.maintenance.isActive } }))}
                      className={`w-14 h-8 rounded-full relative transition-colors ${siteConfig.maintenance.isActive ? 'bg-red-500' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${siteConfig.maintenance.isActive ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Message personnalisé</label>
                    <textarea 
                      className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:border-red-500 h-32" 
                      value={siteConfig.maintenance.message}
                      onChange={(e) => setSiteConfig(prev => ({ ...prev, maintenance: { ...prev.maintenance, message: e.target.value } }))}
                    ></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Date de fin prévue (Optionnel)</label>
                    <input 
                      type="datetime-local" 
                      className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl focus:outline-none focus:border-red-500" 
                      value={siteConfig.maintenance.endDate}
                      onChange={(e) => setSiteConfig(prev => ({ ...prev, maintenance: { ...prev.maintenance, endDate: e.target.value } }))}
                    />
                  </div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-red-100 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
                    <AlertCircle size={32} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-serif font-bold text-red-900">Aperçu Client</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {siteConfig.maintenance.isActive 
                        ? "Les clients verront ce message et ne pourront pas naviguer sur le site." 
                        : "Le site est actuellement accessible à tous."}
                    </p>
                  </div>
                  {siteConfig.maintenance.isActive && (
                    <div className="p-4 bg-red-50 rounded-2xl border border-red-100 w-full italic text-sm text-red-700">
                      "{siteConfig.maintenance.message}"
                    </div>
                  )}
                </div>
              </div>
            </section>

            <div className="flex justify-end pt-6">
              <button 
                onClick={() => {
                  setIsSaving(true);
                  setTimeout(() => {
                    setIsSaving(false);
                    toast.success('Configuration enregistrée avec succès !');
                  }, 1500);
                }}
                className="bg-primary text-white px-12 py-4 rounded-2xl font-bold hover:bg-accent transition-all shadow-xl flex items-center gap-3"
              >
                {isSaving ? <Loader text="" /> : <CheckCircle2 size={20} />}
                Enregistrer toutes les modifications
              </button>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="space-y-6">
            <TabFilter 
              options={[
                { id: 'all', label: 'Tous' },
                { id: 'active', label: 'Actifs' },
                { id: 'new', label: 'Nouveaux' },
              ]}
              active={customerFilter}
              onChange={setCustomerFilter}
            />
            <DataTable<UserType>
              data={localUsers.filter(u => u.role === 'customer').filter(u => {
                if (customerFilter === 'all') return true;
                if (customerFilter === 'active') return u.orders > 5;
                if (customerFilter === 'new') return u.joinDate.includes('2024');
                return true;
              })}
              onRowClick={(user) => setSelectedCustomer(user)}
              title="Liste des Clients"
              columns={[
              {
                header: 'Client',
                accessor: (user: UserType) => (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {user.name[0]}
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                ),
                exportValue: (user: UserType) => user.name
              },
              { header: 'Email', accessor: 'email' as any, className: 'text-slate-400 text-sm' },
              { header: 'Inscrit le', accessor: 'joinDate' as any, className: 'text-slate-400 text-sm' },
              { header: 'Commandes', accessor: 'orders' as any, className: 'font-bold' },
              {
                header: 'Dernière Connexion',
                accessor: (user: UserType) => (
                  <span className="text-xs text-slate-400">
                    {LOGIN_LOGS.find(l => l.userId === user.id)?.timestamp || 'N/A'}
                  </span>
                ),
                exportValue: (user: UserType) => LOGIN_LOGS.find(l => l.userId === user.id)?.timestamp || 'N/A'
              },
              {
                header: 'Actions',
                accessor: (user: UserType) => (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedCustomer(user); }}
                    className="text-accent font-bold text-sm hover:underline"
                  >
                    Détails
                  </button>
                )
              }
            ]}
          />
        </div>
      )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <TabFilter 
                options={[
                  { id: 'all', label: 'Tous' },
                  ...CATEGORIES.map(c => ({ id: c.name, label: c.name }))
                ]}
                active={productFilter}
                onChange={setProductFilter}
              />
              <button 
                onClick={() => { setModalType('product'); setIsAddModalOpen(true); }}
                className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg"
              >
                <Plus size={18} /> Ajouter un produit
              </button>
            </div>
            <DataTable<Product>
              data={productFilter === 'all' ? localProducts : localProducts.filter(p => p.category === productFilter)}
              onRowClick={(p) => { setEditingItem(p); setModalType('product'); }}
              title="Catalogue Produits"
              columns={[
                {
                  header: 'Produit',
                  accessor: (product: Product) => (
                    <div className="flex items-center gap-4">
                      <img src={product.image} alt={product.name} className="w-10 h-12 object-cover rounded-lg" referrerPolicy="no-referrer" />
                      <div className="flex flex-col">
                        <span className="font-medium">{product.name}</span>
                        {!product.isAvailable && <span className="text-[10px] text-red-500 font-bold uppercase">Désactivé</span>}
                      </div>
                    </div>
                  ),
                  exportValue: (product: Product) => product.name
                },
                { header: 'Catégorie', accessor: 'category' as any, className: 'text-slate-400 text-sm' },
                { 
                  header: 'Prix', 
                  accessor: (product: Product) => <span className="font-bold">{product.price.toLocaleString()} FCFA</span>,
                  exportValue: (product: Product) => `${product.price} FCFA`
                },
                {
                  header: 'Stock',
                  accessor: (product: Product) => (
                    <div className="flex items-center gap-2">
                      <div className="flex-grow bg-slate-100 h-1.5 rounded-full overflow-hidden w-24">
                        <div 
                          className={`h-full rounded-full ${product.stock < 10 ? 'bg-red-500' : 'bg-green-500'}`} 
                          style={{ width: `${Math.min(product.stock, 100)}%` }} 
                        />
                      </div>
                      <span className="text-xs font-bold">{product.stock}</span>
                    </div>
                  ),
                  exportValue: (product: Product) => String(product.stock)
                },
                {
                  header: 'Note',
                  accessor: (product: Product) => (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star size={14} fill="currentColor" />
                      <span className="text-sm font-bold text-slate-900">{product.rating}</span>
                    </div>
                  ),
                  exportValue: (product: Product) => String(product.rating)
                },
                {
                  header: 'Actions',
                  accessor: (product: Product) => (
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setEditingItem(product); setModalType('product'); }}
                        className="p-2 text-slate-400 hover:text-primary transition-colors"
                      >
                        <Settings size={16} />
                      </button>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setLocalProducts(prev => prev.map(p => p.id === product.id ? { ...p, isAvailable: !p.isAvailable } : p));
                          toast.success(product.isAvailable ? 'Produit désactivé' : 'Produit activé');
                        }}
                        className={`p-2 transition-colors ${product.isAvailable ? 'text-slate-400 hover:text-red-500' : 'text-green-500 hover:text-green-600'}`}
                      >
                        {product.isAvailable ? <X size={16} /> : <CheckCircle2 size={16} />}
                      </button>
                    </div>
                  )
                }
              ]}
            />
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-10">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-serif font-bold text-primary">Gestion des Catégories</h3>
              <button 
                onClick={() => { setModalType('category'); setIsAddModalOpen(true); }}
                className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg"
              >
                <Plus size={18} /> Nouvelle catégorie
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {localCategories.slice((categoryPage - 1) * itemsPerPage, categoryPage * itemsPerPage).map(cat => (
                <div 
                  key={cat.id} 
                  onClick={() => { setEditingItem(cat); setModalType('category'); }}
                  className="bg-white flex items-center gap-4 p-6 border border-slate-100 rounded-[2rem] shadow-sm hover:border-accent transition-all group cursor-pointer"
                >
                  <img src={cat.image} alt={cat.name} className="w-20 h-20 object-cover rounded-2xl shadow-sm" referrerPolicy="no-referrer" />
                  <div className="flex-grow">
                    <h4 className="font-serif font-bold text-slate-900">{cat.name}</h4>
                    <p className="text-xs text-slate-400 font-medium">{cat.count} produits</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="p-2 text-slate-300 group-hover:text-primary transition-colors">
                      <Settings size={18} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.success(`Catégorie ${cat.name} supprimée (simulé)`);
                        setLocalCategories(prev => prev.filter(c => c.id !== cat.id));
                      }}
                      className="p-2 text-slate-300 group-hover:text-red-500 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {localCategories.length > itemsPerPage && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: Math.ceil(localCategories.length / itemsPerPage) }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setCategoryPage(n)}
                    className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${categoryPage === n ? 'bg-primary text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-400 hover:border-primary hover:text-primary'}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'notifications' && (
          <div className="space-y-10">
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-serif flex items-center gap-3">
                  <Bell className="text-primary" size={24} /> Centre de Notifications
                </h3>
                <button className="text-xs font-bold text-primary hover:underline">Tout marquer comme lu</button>
              </div>
              <div className="px-8 pt-6">
                <TabFilter 
                  options={[
                    { id: 'all', label: 'Toutes' },
                    { id: 'order', label: 'Commandes' },
                    { id: 'stock', label: 'Stock' },
                    { id: 'inquiry', label: 'Demandes' },
                  ]}
                  active={notificationFilter}
                  onChange={(val) => { setNotificationFilter(val); setNotificationPage(1); }}
                />
              </div>
              <div className="divide-y divide-slate-50">
                {NOTIFICATIONS.filter(n => notificationFilter === 'all' || n.type === notificationFilter)
                  .slice((notificationPage - 1) * itemsPerPage, notificationPage * itemsPerPage)
                  .map((notif) => (
                  <div key={notif.id} className={`p-8 flex gap-6 hover:bg-slate-50 transition-colors cursor-pointer ${!notif.read ? 'bg-primary/5' : ''}`}>
                    <div className={`p-4 rounded-2xl flex-shrink-0 ${
                      notif.type === 'order' ? 'bg-green-100 text-green-600' :
                      notif.type === 'stock' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {notif.type === 'order' ? <CheckCircle2 size={24} /> : 
                       notif.type === 'stock' ? <AlertCircle size={24} /> : <MessageSquare size={24} />}
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg text-slate-900">{notif.title}</h4>
                        <span className="text-xs text-slate-400 font-medium">{notif.timestamp}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed mb-4">{notif.message}</p>
                      <div className="flex gap-3">
                        <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:border-primary transition-colors">Détails</button>
                        {!notif.read && <button className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-accent transition-colors">Marquer comme lu</button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {NOTIFICATIONS.filter(n => notificationFilter === 'all' || n.type === notificationFilter).length > itemsPerPage && (
                <div className="p-8 border-t border-slate-50 flex justify-center gap-2">
                  {Array.from({ length: Math.ceil(NOTIFICATIONS.filter(n => notificationFilter === 'all' || n.type === notificationFilter).length / itemsPerPage) }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      onClick={() => setNotificationPage(n)}
                      className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${notificationPage === n ? 'bg-primary text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-400 hover:border-primary hover:text-primary'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <TabFilter 
              options={[
                { id: 'all', label: 'Tous' },
                { id: '5', label: '5 Étoiles' },
                { id: '4', label: '4 Étoiles' },
                { id: '3', label: '3 Étoiles' },
                { id: 'low', label: 'Basses notes' },
              ]}
              active={reviewFilter}
              onChange={setReviewFilter}
            />
            <DataTable<any>
              data={localProducts.flatMap(p => (p.reviews || []).map(r => ({ ...r, productName: p.name, productId: p.id }))).filter(r => {
                if (reviewFilter === 'all') return true;
                if (reviewFilter === 'low') return r.rating <= 2;
                return r.rating === parseInt(reviewFilter);
              })}
              title="Avis Clients"
              columns={[
                { header: 'Produit', accessor: 'productName', className: 'font-medium' },
                { header: 'Client', accessor: 'userName', className: 'font-medium' },
                {
                  header: 'Note',
                  accessor: (review: any) => (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star size={14} fill="currentColor" />
                      <span className="text-sm font-bold text-slate-900">{review.rating}</span>
                    </div>
                  ),
                  exportValue: (review: any) => String(review.rating)
                },
                { header: 'Commentaire', accessor: 'comment' as any, className: 'text-slate-400 text-sm max-w-xs truncate' },
                { header: 'Date', accessor: 'date' as any, className: 'text-slate-400 text-sm' },
                {
                  header: 'Actions',
                  accessor: (review: any) => (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => toast.success('Avis approuvé')}
                        className="text-primary font-bold text-sm hover:underline"
                      >
                        Approuver
                      </button>
                      <button 
                        onClick={() => toast.success('Avis supprimé')}
                        className="text-red-500 font-bold text-sm hover:underline"
                      >
                        Supprimer
                      </button>
                    </div>
                  )
                }
              ]}
            />
          </div>
        )}
        {activeTab === 'messages' && (
          <div className="space-y-8">
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[75vh] lg:flex-row">
              {/* Conversations List */}
              <div className={`w-full lg:w-80 border-r border-slate-100 flex flex-col ${selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
                <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                  <h3 className="font-serif font-bold text-slate-900 flex items-center gap-2">
                    <MessageSquare size={18} className="text-primary" /> Discussions
                  </h3>
                </div>
                <div className="flex-grow overflow-y-auto">
                  {CONVERSATIONS.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-6 text-left border-b border-slate-50 transition-all hover:bg-slate-50 flex gap-4 items-start ${
                        selectedConversation?.id === conv.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center font-bold text-primary">
                        {conv.userName.charAt(0)}
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="font-bold text-sm text-slate-900 truncate">{conv.userName}</h4>
                          <span className="text-[10px] text-slate-400">{conv.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{conv.lastMessage}</p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat View */}
              <div className={`flex-grow flex flex-col ${!selectedConversation ? 'hidden lg:flex items-center justify-center bg-slate-50/30' : 'flex'}`}>
                {selectedConversation ? (
                  <>
                    <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setSelectedConversation(null)}
                          className="lg:hidden p-2 text-slate-400 hover:text-primary"
                        >
                          <X size={20} />
                        </button>
                        <div>
                          <h3 className="font-serif font-bold text-slate-900">{selectedConversation.userName}</h3>
                          <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">En ligne</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                          <Search size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                          <Settings size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto p-8 space-y-6 bg-slate-50/20">
                      {selectedConversation.messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-6 rounded-[2rem] shadow-sm ${
                            msg.isAdmin 
                              ? 'bg-primary text-white rounded-tr-none' 
                              : 'bg-white border border-slate-100 text-slate-900 rounded-tl-none'
                          }`}>
                            <div className="flex justify-between items-center mb-2 gap-4">
                              <span className="text-xs font-bold">{msg.senderName}</span>
                              <span className={`text-[10px] ${msg.isAdmin ? 'text-white/60' : 'text-slate-400'}`}>{msg.timestamp}</span>
                            </div>
                            <p className="text-sm leading-relaxed">{msg.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-6 bg-white border-t border-slate-100">
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendMessage();
                        }}
                        className="flex gap-4"
                      >
                        <input 
                          type="text" 
                          placeholder="Tapez votre réponse..." 
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          className="flex-grow px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary"
                        />
                        <button 
                          type="submit"
                          className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-accent transition-all shadow-lg"
                        >
                          Envoyer
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-12">
                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageSquare size={32} className="text-primary/20" />
                    </div>
                    <h3 className="text-xl font-serif text-slate-400">Sélectionnez une conversation</h3>
                    <p className="text-sm text-slate-300 mt-2">Choisissez un client dans la liste pour commencer à discuter.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                <h3 className="text-xl font-serif mb-6 flex items-center gap-3">
                  <Eye className="text-blue-500" size={24} /> Produits les plus consultés
                </h3>
                <div className="space-y-4">
                  {PRODUCTS.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map((p, i) => (
                    <div key={p.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                      <span className="text-lg font-serif font-bold text-slate-300">0{i+1}</span>
                      <img src={p.image} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                      <div className="flex-grow">
                        <h4 className="font-bold text-sm">{p.name}</h4>
                        <p className="text-xs text-slate-400">{p.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{p.views?.toLocaleString()}</p>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Vues</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
                <h3 className="text-xl font-serif mb-6 flex items-center gap-3">
                  <MousePointer2 className="text-green-500" size={24} /> Produits les plus vendus
                </h3>
                <div className="space-y-4">
                  {PRODUCTS.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)).slice(0, 5).map((p, i) => (
                    <div key={p.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                      <span className="text-lg font-serif font-bold text-slate-300">0{i+1}</span>
                      <img src={p.image} className="w-12 h-12 rounded-xl object-cover" referrerPolicy="no-referrer" />
                      <div className="flex-grow">
                        <h4 className="font-bold text-sm">{p.name}</h4>
                        <p className="text-xs text-slate-400">{p.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-accent">{p.salesCount?.toLocaleString()}</p>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Ventes</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-serif mb-8">Performance des Ventes</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={SALES_DATA}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    />
                    <Area type="monotone" dataKey="sales" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif">Gestion des Coupons</h2>
              <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg">
                <Plus size={18} /> Nouveau Coupon
              </button>
            </div>
            <DataTable<Coupon> 
              data={COUPONS}
              title="Coupons de Réduction"
              columns={[
                { header: 'Code', accessor: 'code', className: 'font-mono font-bold text-primary' },
                { 
                  header: 'Réduction', 
                  accessor: (c: Coupon) => `${c.discount}${c.type === 'percentage' ? '%' : ' FCFA'}`,
                  exportValue: (c: Coupon) => `${c.discount}${c.type === 'percentage' ? '%' : ' FCFA'}`
                },
                { header: 'Expiration', accessor: 'expiryDate' as any },
                { 
                  header: 'Utilisation', 
                  accessor: (c: Coupon) => (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <span>{c.usageCount} / {c.usageLimit}</span>
                        <span>{Math.round((c.usageCount / c.usageLimit) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all" 
                          style={{ width: `${(c.usageCount / c.usageLimit) * 100}%` }}
                        />
                      </div>
                    </div>
                  ),
                  exportValue: (c: Coupon) => `${c.usageCount} / ${c.usageLimit}`
                },
                { 
                  header: 'Statut', 
                  accessor: (c: Coupon) => (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      c.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {c.status}
                    </span>
                  ),
                  exportValue: (c: Coupon) => c.status
                },
                {
                  header: 'Actions',
                  accessor: (c: Coupon) => (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => toast.success(`Coupon ${c.code} édité (simulé)`)}
                        className="text-primary font-bold text-sm hover:underline"
                      >
                        Editer
                      </button>
                      <button 
                        onClick={() => toast.success(`Coupon ${c.code} supprimé (simulé)`)}
                        className="text-red-500 font-bold text-sm hover:underline"
                      >
                        Supprimer
                      </button>
                    </div>
                  )
                }
              ]}
            />
          </div>
        )}

        {activeTab === 'roles' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif">Rôles & Permissions</h2>
              <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg">
                <Plus size={18} /> Nouveau Rôle
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ADMIN_ROLES.map(role => (
                <div key={role.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:border-primary transition-all group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-primary/5 rounded-2xl text-primary">
                      <Shield size={24} />
                    </div>
                    <button className="text-slate-300 group-hover:text-primary transition-colors">
                      <Settings size={18} />
                    </button>
                  </div>
                  <h3 className="text-xl font-serif font-bold mb-2">{role.name}</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-6">{role.permissions.length} Permissions</p>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map(p => (
                      <span key={p} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-100">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'site' && (
          <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Visual Identity */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
                <h3 className="text-xl font-serif flex items-center gap-3">
                  <Palette className="text-accent" size={24} /> Identité Visuelle
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Couleur Primaire</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={siteConfig.primaryColor} 
                        onChange={(e) => setSiteConfig({...siteConfig, primaryColor: e.target.value})}
                        className="w-12 h-12 rounded-xl border-none cursor-pointer"
                      />
                      <span className="text-sm font-mono text-slate-400">{siteConfig.primaryColor}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Couleur d'Accent</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={siteConfig.accentColor} 
                        onChange={(e) => setSiteConfig({...siteConfig, accentColor: e.target.value})}
                        className="w-12 h-12 rounded-xl border-none cursor-pointer"
                      />
                      <span className="text-sm font-mono text-slate-400">{siteConfig.accentColor}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-400 italic">Ces couleurs seront appliquées à l'ensemble de l'interface client (boutons, icônes, fonds).</p>
                </div>
              </div>

              {/* Home Page Configuration */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
                <h3 className="text-xl font-serif flex items-center gap-3">
                  <LayoutDashboard className="text-primary" size={24} /> Accueil & Priorités
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">Afficher le Slider</p>
                      <p className="text-xs text-slate-400">Activer/Désactiver la bannière principale</p>
                    </div>
                    <button 
                      onClick={() => setSiteConfig({...siteConfig, showSlider: !siteConfig.showSlider})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${siteConfig.showSlider ? 'bg-primary' : 'bg-slate-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${siteConfig.showSlider ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Catégories Prioritaires</label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map(cat => (
                        <button 
                          key={cat.id}
                          onClick={() => {
                            const newCats = siteConfig.homeFeaturedCategories.includes(cat.id)
                              ? siteConfig.homeFeaturedCategories.filter(id => id !== cat.id)
                              : [...siteConfig.homeFeaturedCategories, cat.id];
                            setSiteConfig({...siteConfig, homeFeaturedCategories: newCats});
                          }}
                          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                            siteConfig.homeFeaturedCategories.includes(cat.id) 
                              ? 'bg-primary text-white shadow-md' 
                              : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Produits Vedettes</label>
                    <div className="grid grid-cols-2 gap-3">
                      {PRODUCTS.slice(0, 4).map(prod => (
                        <button 
                          key={prod.id}
                          onClick={() => {
                            const newProds = siteConfig.homeFeaturedProducts.includes(prod.id)
                              ? siteConfig.homeFeaturedProducts.filter(id => id !== prod.id)
                              : [...siteConfig.homeFeaturedProducts, prod.id];
                            setSiteConfig({...siteConfig, homeFeaturedProducts: newProds});
                          }}
                          className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${
                            siteConfig.homeFeaturedProducts.includes(prod.id)
                              ? 'border-primary bg-primary/5'
                              : 'border-slate-100 bg-white hover:border-slate-200'
                          }`}
                        >
                          <img src={prod.image} className="w-8 h-8 rounded-lg object-cover" referrerPolicy="no-referrer" />
                          <span className="text-[10px] font-bold line-clamp-1">{prod.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Sections Management */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-serif flex items-center gap-3">
                  <TableIcon className="text-accent" size={24} /> Sections Personnalisées
                </h3>
                <button 
                  onClick={() => {
                    const newSection: HomeSection = {
                      id: `cs-${Date.now()}`,
                      title: 'Nouvelle Section',
                      type: 'products',
                      itemIds: []
                    };
                    setSiteConfig({...siteConfig, customSections: [...siteConfig.customSections, newSection]});
                  }}
                  className="bg-secondary text-primary px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all"
                >
                  + Ajouter une section
                </button>
              </div>
              
              <div className="space-y-6">
                {siteConfig.customSections.map((section, idx) => (
                  <div key={section.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow space-y-4">
                        <input 
                          type="text" 
                          value={section.title}
                          onChange={(e) => {
                            const newSections = [...siteConfig.customSections];
                            newSections[idx].title = e.target.value;
                            setSiteConfig({...siteConfig, customSections: newSections});
                          }}
                          className="bg-transparent border-b border-slate-200 focus:border-primary focus:outline-none font-serif text-lg w-full"
                        />
                        <div className="flex gap-4">
                          <select 
                            value={section.type}
                            onChange={(e) => {
                              const newSections = [...siteConfig.customSections];
                              newSections[idx].type = e.target.value as any;
                              setSiteConfig({...siteConfig, customSections: newSections});
                            }}
                            className="text-xs font-bold bg-white px-3 py-1.5 rounded-lg border border-slate-200"
                          >
                            <option value="products">Produits</option>
                            <option value="categories">Catégories</option>
                          </select>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          const newSections = siteConfig.customSections.filter(s => s.id !== section.id);
                          setSiteConfig({...siteConfig, customSections: newSections});
                        }}
                        className="text-red-400 hover:text-red-600 p-2"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {section.type === 'products' ? (
                        PRODUCTS.map(p => (
                          <button 
                            key={p.id}
                            onClick={() => {
                              const newSections = [...siteConfig.customSections];
                              const itemIds = section.itemIds.includes(p.id)
                                ? section.itemIds.filter(id => id !== p.id)
                                : [...section.itemIds, p.id];
                              newSections[idx].itemIds = itemIds;
                              setSiteConfig({...siteConfig, customSections: newSections});
                            }}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                              section.itemIds.includes(p.id) ? 'bg-primary text-white' : 'bg-white text-slate-400 border border-slate-100'
                            }`}
                          >
                            {p.name}
                          </button>
                        ))
                      ) : (
                        CATEGORIES.map(c => (
                          <button 
                            key={c.id}
                            onClick={() => {
                              const newSections = [...siteConfig.customSections];
                              const itemIds = section.itemIds.includes(c.id)
                                ? section.itemIds.filter(id => id !== c.id)
                                : [...section.itemIds, c.id];
                              newSections[idx].itemIds = itemIds;
                              setSiteConfig({...siteConfig, customSections: newSections});
                            }}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                              section.itemIds.includes(c.id) ? 'bg-primary text-white' : 'bg-white text-slate-400 border border-slate-100'
                            }`}
                          >
                            {c.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              {isSaving && <Loader fullScreen text="Enregistrement de la configuration..." />}
              <button 
                onClick={() => {
                  setIsSaving(true);
                  setTimeout(() => {
                    setIsSaving(false);
                    toast.success('Configuration enregistrée avec succès !', {
                      description: 'Les modifications sont maintenant en ligne.',
                    });
                  }, 2000);
                }}
                className="bg-primary text-white px-10 py-4 rounded-2xl font-bold hover:bg-accent transition-all shadow-xl flex items-center gap-3"
              >
                <CheckCircle2 size={20} /> Enregistrer la Configuration
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
