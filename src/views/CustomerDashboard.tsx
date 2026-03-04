import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  ShoppingBag, 
  FileText, 
  Settings, 
  LogOut, 
  Package, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  Download,
  ChevronRight,
  CreditCard,
  History,
  Shield,
  Star,
  X
} from 'lucide-react';
import { ORDERS, INVOICES, USERS, LOGIN_LOGS, PRODUCTS } from '../constants';
import { Order, Invoice, User as UserType } from '../types';
import { AnimatePresence } from 'motion/react';
import { TabFilter } from '../components/TabFilter';
import { generateInvoicePDF } from '../utils/invoiceUtils';

interface CustomerDashboardProps {
  onNavigate: (view: string) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderFilter, setOrderFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [historyFilter, setHistoryFilter] = useState('all');

  const user = USERS.find(u => u.role === 'customer')!; // Mock current user
  const userLogs = LOGIN_LOGS.filter(log => log.userId === user.id);

  const menuItems = [
    { id: 'overview', label: 'Aperçu', icon: <User size={20} /> },
    { id: 'orders', label: 'Mes Commandes', icon: <ShoppingBag size={20} /> },
    { id: 'payments', label: 'Paiements', icon: <CreditCard size={20} /> },
    { id: 'history', label: 'Connexions', icon: <History size={20} /> },
    { id: 'profile', label: 'Mon Profil', icon: <Settings size={20} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <aside className="w-full lg:w-72 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-primary/5 text-center">
            <div className="w-24 h-24 rounded-full bg-accent mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {user.name[0]}
            </div>
            <h2 className="text-xl font-serif font-bold text-primary">{user.name}</h2>
            <p className="text-sm text-primary/40 mb-6">{user.email}</p>
            <button 
              onClick={() => onNavigate('home')}
              className="w-full py-3 bg-secondary text-primary rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-500 transition-all"
            >
              <LogOut size={18} /> Déconnexion
            </button>
          </div>

          <nav className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-primary/5 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${
                  activeTab === item.id ? 'bg-primary text-white shadow-md' : 'text-primary/60 hover:text-primary hover:bg-primary/5'
                }`}
              >
                {item.icon}
                <span className="font-bold text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-grow">
          {activeTab === 'overview' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Commandes', value: user.orders, icon: <Package className="text-accent" /> },
                  { label: 'En cours', value: 1, icon: <Clock className="text-blue-500" /> },
                  { label: 'Points Fidélité', value: 1250, icon: <Star className="text-yellow-500" fill="currentColor" /> },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-primary/5 flex items-center gap-6">
                    <div className="p-4 bg-slate-50 rounded-2xl">{stat.icon}</div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-primary/40 mb-1">{stat.label}</p>
                      <h3 className="text-2xl font-bold text-primary">{stat.value}</h3>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="bg-white rounded-[3rem] shadow-sm border border-primary/5 p-10">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-serif font-bold text-primary">Dernière Commande</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-accent font-bold text-sm hover:underline flex items-center gap-1">
                      Voir tout <ChevronRight size={16} />
                    </button>
                  </div>
                  {ORDERS.length > 0 && (
                    <div className="p-6 bg-slate-50 rounded-[2rem] space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white rounded-xl shadow-sm text-primary">
                            <ShoppingBag size={24} />
                          </div>
                          <div>
                            <p className="font-mono text-[10px] text-primary/40">{ORDERS[0].id}</p>
                            <h4 className="font-bold text-sm text-primary">{ORDERS[0].total.toLocaleString()} FCFA</h4>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                          {ORDERS[0].status}
                        </span>
                      </div>
                      <button 
                        onClick={() => setSelectedOrder(ORDERS[0])}
                        className="w-full py-3 bg-white border border-primary/5 rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition-all"
                      >
                        Détails de la commande
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-[3rem] shadow-sm border border-primary/5 p-10">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-serif font-bold text-primary">Dernier Paiement</h3>
                    <button onClick={() => setActiveTab('payments')} className="text-accent font-bold text-sm hover:underline flex items-center gap-1">
                      Historique <ChevronRight size={16} />
                    </button>
                  </div>
                  {INVOICES.length > 0 && (
                    <div className="p-6 bg-slate-50 rounded-[2rem] space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-white rounded-xl shadow-sm text-primary">
                            <CreditCard size={24} />
                          </div>
                          <div>
                            <p className="font-mono text-[10px] text-primary/40">{INVOICES[0].id}</p>
                            <h4 className="font-bold text-sm text-primary">{INVOICES[0].amount.toLocaleString()} FCFA</h4>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                          Payé
                        </span>
                      </div>
                      <p className="text-[10px] text-primary/40 text-center">Effectué le {INVOICES[0].date}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-[3rem] shadow-sm border border-primary/5 p-10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-serif font-bold text-primary">Activité Récente</h3>
                  <button onClick={() => setActiveTab('history')} className="text-accent font-bold text-sm hover:underline flex items-center gap-1">
                    Tout voir <ChevronRight size={16} />
                  </button>
                </div>
                <div className="space-y-4">
                  {userLogs.slice(0, 2).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-lg text-primary/40">
                          <Shield size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-primary">{log.device}</p>
                          <p className="text-[10px] text-primary/40">{log.ip}</p>
                        </div>
                      </div>
                      <p className="text-[10px] font-medium text-primary/60">{log.timestamp}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-[3rem] shadow-sm border border-primary/5 overflow-hidden">
              <div className="p-10 border-b border-primary/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <h3 className="text-2xl font-serif font-bold text-primary">Historique des Commandes</h3>
                <TabFilter 
                  options={[
                    { id: 'all', label: 'Toutes' },
                    { id: 'delivered', label: 'Livrées' },
                    { id: 'processing', label: 'En cours' },
                  ]}
                  active={orderFilter}
                  onChange={setOrderFilter}
                  className="mb-0"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-primary/40 text-[10px] uppercase tracking-widest font-bold">
                    <tr>
                      <th className="px-10 py-6">ID</th>
                      <th className="px-10 py-6">Date</th>
                      <th className="px-10 py-6">Total</th>
                      <th className="px-10 py-6">Statut</th>
                      <th className="px-10 py-6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-primary/5">
                    {ORDERS.filter(o => orderFilter === 'all' || o.status === orderFilter).map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-10 py-6 font-mono text-xs text-primary/60">{order.id}</td>
                        <td className="px-10 py-6 text-sm text-primary/60">{order.date}</td>
                        <td className="px-10 py-6 font-bold text-primary">{order.total.toLocaleString()} FCFA</td>
                        <td className="px-10 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-600' :
                            order.status === 'shipped' ? 'bg-purple-100 text-purple-600' : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-10 py-6">
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="text-accent font-bold text-sm hover:underline"
                          >
                            Détails
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="bg-white rounded-[3rem] shadow-sm border border-primary/5 overflow-hidden">
              <div className="p-10 border-b border-primary/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <h3 className="text-2xl font-serif font-bold text-primary">Historique des Paiements</h3>
                <TabFilter 
                  options={[
                    { id: 'all', label: 'Tous' },
                    { id: 'paid', label: 'Payés' },
                    { id: 'unpaid', label: 'En attente' },
                  ]}
                  active={paymentFilter}
                  onChange={setPaymentFilter}
                  className="mb-0"
                />
              </div>
              <div className="p-10 space-y-6">
                {INVOICES.filter(i => paymentFilter === 'all' || i.status === paymentFilter).map((invoice) => (
                  <div key={invoice.id} className="p-8 border border-primary/5 rounded-[2rem] bg-slate-50/50 flex justify-between items-center group hover:border-accent transition-all">
                    <div className="flex items-center gap-6">
                      <div className="p-4 bg-white rounded-2xl shadow-sm text-primary group-hover:text-accent transition-colors">
                        <CreditCard size={24} />
                      </div>
                      <div>
                        <p className="font-mono text-xs text-primary/40 mb-1">{invoice.id}</p>
                        <h4 className="font-bold text-primary">{invoice.amount.toLocaleString()} FCFA</h4>
                        <p className="text-xs text-primary/40">{invoice.date} • {invoice.status === 'paid' ? 'Payé' : 'En attente'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const order = ORDERS.find(o => o.id === invoice.orderId);
                        if (order) generateInvoicePDF(order);
                      }}
                      className="p-3 bg-white rounded-xl text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                      <Download size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-[3rem] shadow-sm border border-primary/5 overflow-hidden">
              <div className="p-10 border-b border-primary/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <h3 className="text-2xl font-serif font-bold text-primary">Historique des Connexions</h3>
                <TabFilter 
                  options={[
                    { id: 'all', label: 'Tous' },
                    { id: 'iPhone', label: 'Mobile' },
                    { id: 'Mac', label: 'Desktop' },
                  ]}
                  active={historyFilter}
                  onChange={setHistoryFilter}
                  className="mb-0"
                />
              </div>
              <div className="p-10">
                <div className="space-y-6">
                  {userLogs.filter(l => historyFilter === 'all' || l.device.includes(historyFilter)).map((log) => (
                    <div key={log.id} className="flex items-center gap-6 p-6 bg-slate-50 rounded-2xl">
                      <div className="p-3 bg-white rounded-xl text-primary/40">
                        <Shield size={20} />
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-bold text-primary">{log.device}</p>
                        <p className="text-xs text-primary/40">{log.ip}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-primary">{log.timestamp}</p>
                        <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Réussi</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white rounded-[3rem] shadow-sm border border-primary/5 p-10 space-y-12">
              <h3 className="text-2xl font-serif font-bold text-primary">Informations Personnelles</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/40 block">Nom Complet</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20" size={18} />
                    <input type="text" defaultValue={user.name} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-primary/5 rounded-2xl focus:outline-none focus:border-accent" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/40 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20" size={18} />
                    <input type="email" defaultValue={user.email} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-primary/5 rounded-2xl focus:outline-none focus:border-accent" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/40 block">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20" size={18} />
                    <input type="tel" defaultValue="+237 600 000 000" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-primary/5 rounded-2xl focus:outline-none focus:border-accent" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/40 block">Adresse</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20" size={18} />
                    <input type="text" defaultValue="Douala, Cameroun" className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-primary/5 rounded-2xl focus:outline-none focus:border-accent" />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-primary/5 flex justify-end">
                <button className="bg-primary text-white px-10 py-4 rounded-full font-bold hover:bg-accent transition-all shadow-lg">
                  Enregistrer les modifications
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8 border-b border-primary/5 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-serif font-bold text-primary">Détails de la Commande</h3>
                  <p className="text-xs font-mono text-primary/40 mt-1">{selectedOrder.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-white rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-2">Date</p>
                    <p className="text-sm font-medium text-primary">{selectedOrder.date}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-2">Statut</p>
                    <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-4">Articles</p>
                  <div className="space-y-4">
                    {selectedOrder.orderDetails?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden">
                            <img src={PRODUCTS.find(p => p.id === item.productId)?.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-primary">{item.name}</p>
                            <p className="text-xs text-primary/40">Qté: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-primary">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                      </div>
                    ))}
                  </div>

                <div className="pt-6 border-t border-primary/5 flex justify-between items-center">
                  <p className="text-lg font-serif font-bold text-primary">Total</p>
                  <p className="text-xl font-bold text-primary">{selectedOrder.total.toLocaleString()} FCFA</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl flex items-start gap-4">
                  <MapPin className="text-primary mt-1" size={18} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-1">Adresse de Livraison</p>
                    <p className="text-sm text-primary/70">{selectedOrder.customer.address}</p>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-slate-50 border-t border-primary/5 flex gap-4">
                <button 
                  onClick={() => generateInvoicePDF(selectedOrder)}
                  className="flex-grow bg-primary text-white py-4 rounded-2xl font-bold hover:bg-accent transition-all shadow-lg"
                >
                  Télécharger la Facture
                </button>
                <button 
                  onClick={() => onNavigate('order-tracking')}
                  className="px-8 py-4 border border-primary/10 rounded-2xl font-bold hover:bg-white transition-colors"
                >
                  Suivre le colis
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

