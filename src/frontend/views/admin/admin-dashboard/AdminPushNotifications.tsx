import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { LayoutDashboard, Package, ShoppingBag, Users, BarChart3, Settings, LogOut, TrendingUp, ArrowUpRight, ArrowDownRight, Search, Bell, Plus, Menu, X, History, Coins, Globe, Shield, Activity, Smartphone, Monitor, Star, CheckCircle2, AlertCircle, MessageSquare, Palette, Award, Download, FileText, Send, Table as TableIcon, Ticket, Lock, Eye, MousePointer2, Calendar as CalendarIcon, Image as ImageIcon, Type as TypeIcon, MonitorOff, Info, User, Edit, Trash2, ShoppingCart, RefreshCcw, Tag, Mail, Percent, Truck, ChevronLeft, MapPin, Route, QrCode, Save, HelpCircle, Phone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { doc, updateDoc, increment, query, where, getDoc, writeBatch, addDoc } from 'firebase/firestore';
import { auth, db } from '../../../../backend/firebase';
import { BADGES, ADMIN_ROLES as INITIAL_ADMIN_ROLES } from '../../../../constants';
import { DataTable } from '../../../components/DataTable';
import { TabFilter } from '../../../components/TabFilter';
import { StatusBadge, getStatusStyles } from '../../../components/ui/StatusBadge';
import { Loader } from '../../../components/Loader';
import { OrderMap } from '../../../components/OrderMap';
import { CouponEditor } from '../../../components/dashboard/CouponEditor';
import { CityEditor } from '../../../components/dashboard/CityEditor';
import { FAQEditor } from '../../../components/dashboard/FAQEditor';
import { PromoEventEditor } from '../../../components/dashboard/PromoEventEditor';
import { CatalogPriceRuleEditor } from '../../../components/dashboard/CatalogPriceRuleEditor';
import { cn } from '../../../utils/utils';
import { sendPushNotification } from '../../../services/dashboardApi';

import { AdminFlashSales } from '../AdminFlashSales';
import { AdminLookbooks } from '../AdminLookbooks';
import { AdminPortfolios } from '../AdminPortfolios';

export function AdminPushNotifications({ ctx }: { ctx: any }) {
  const { activeTab, formatDate, PUSH_NOTIFICATIONS, setLocalPushNotifications, isSaving, setIsSaving, isUserCustomer } = ctx;
  const [formData, setFormData] = React.useState({ title: '', message: '' });

  // Hide this admin push UI for regular customers
  if (activeTab !== 'push-notifications' || isUserCustomer) return null;

  const handleSendNotification = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Titre et message requis');
      return;
    }

    try {
      setIsSaving(true);
      const result = await sendPushNotification(formData.title, formData.message);
      
      setLocalPushNotifications((prev: any[]) => [...prev, {
        id: result.id,
        title: formData.title,
        message: formData.message,
        status: 'sent',
        sentAt: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      }]);
      setFormData({ title: '', message: '' });
      toast.success(`Notification envoyée à ${result.recipientCount || 0} client(s)`);
    } catch (error) {
      toast.error(`Erreur : ${error instanceof Error ? error.message : 'Impossible d\'envoyer'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Formulaire d'envoi */}
      <div className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10 space-y-6">
        <div className="flex items-center gap-3">
          <Bell size={24} className="text-primary" />
          <h3 className="text-xl font-serif font-bold text-primary">Notifications Push</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Titre</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Titre de la notification..."
              className="w-full mt-2 p-3 bg-secondary/30 border border-primary/10 rounded-xl text-sm text-primary focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Contenu du message..."
              rows={4}
              className="w-full mt-2 p-3 bg-secondary/30 border border-primary/10 rounded-xl text-sm text-primary focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSendNotification}
              disabled={isSaving || !formData.title.trim() || !formData.message.trim()}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-accent transition-colors text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
              Envoyer à tous les clients
            </button>
            <button
              onClick={() => setFormData({ title: '', message: '' })}
              className="px-4 py-3 bg-secondary/50 text-primary/80 rounded-lg hover:bg-secondary/80 transition-colors text-sm font-bold border border-primary/10"
            >
              Effacer
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex gap-3 mt-6">
          <AlertCircle size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-primary/70">
            Les notifications seront envoyées à tous les utilisateurs avec le rôle <strong>customer</strong> uniquement.
          </p>
        </div>
      </div>

      {/* Historique d'envoi */}
      <div className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10 space-y-6">
        <h4 className="text-lg font-serif font-bold text-primary">Historique d'envoi ({(PUSH_NOTIFICATIONS || []).filter((n: any) => n.status === 'sent').length})</h4>

        {(PUSH_NOTIFICATIONS || []).filter((n: any) => n.status === 'sent').length === 0 ? (
          <p className="text-sm text-primary/40 italic">Aucun envoi pour le moment.</p>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {(PUSH_NOTIFICATIONS || [])
              .filter((n: any) => n.status === 'sent')
              .sort((a: any, b: any) => new Date(b.sentAt || b.createdAt).getTime() - new Date(a.sentAt || a.createdAt).getTime())
              .map((notif: any) => (
              <div key={notif.id} className="bg-secondary/30 p-4 rounded-2xl border border-primary/5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-grow">
                    <p className="font-bold text-primary">{notif.title}</p>
                    <p className="text-sm text-primary/60 mt-1">{notif.message}</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-primary/40">
                      <span>{formatDate(notif.sentAt || notif.createdAt)}</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-accent/10 text-accent rounded text-[10px] font-bold uppercase whitespace-nowrap">
                    Envoyé
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
