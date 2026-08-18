import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { LayoutDashboard, Package, ShoppingBag, Users, BarChart3, Settings, LogOut, TrendingUp, ArrowUpRight, ArrowDownRight, Search, Bell, Plus, Menu, X, History, Coins, Globe, Shield, Activity, Smartphone, Monitor, Star, CheckCircle2, AlertCircle, MessageSquare, Palette, Award, Download, FileText, Send, Table as TableIcon, Ticket, Lock, Eye, MousePointer2, Calendar as CalendarIcon, Image as ImageIcon, Type as TypeIcon, MonitorOff, Info, User, Edit, Trash2, ShoppingCart, RefreshCcw, Tag, Mail, Percent, Truck, ChevronLeft, MapPin, Route, QrCode, Save, HelpCircle, Phone, Sparkles } from 'lucide-react';
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
import { translateContentWithAi } from '../../../utils/aiTranslator';

import { AdminFlashSales } from '../AdminFlashSales';
import { AdminLookbooks } from '../AdminLookbooks';
import { AdminPortfolios } from '../AdminPortfolios';

import { Modal } from '../../../components/Modal';

export function AdminNav_itemModalFields({ ctx }: { ctx: any }) {
  const { modalType, editingItem } = ctx;

  const [nameEn, setNameEn] = React.useState(editingItem?.name_en || '');
  const [isTranslating, setIsTranslating] = React.useState(false);

  const handleTranslate = async (e: React.MouseEvent) => {
    const parent = (e.currentTarget.closest('.grid') as HTMLElement);
    const nameFr = (parent?.querySelector('input[name="name"]') as HTMLInputElement)?.value || editingItem?.name;
    if (!nameFr) {
      toast.error('Veuillez entrer un nom en français d\'abord.');
      return;
    }
    setIsTranslating(true);
    try {
      const res = await translateContentWithAi({ name: nameFr }, 'en', 'fr');
      if (res && res.name) {
        setNameEn(res.name);
        toast.success('Traduction générée par l\'IA !');
      }
    } catch {
      toast.error('Erreur lors de la traduction.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <>
{modalType === 'nav_item' && (
              <div className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Nom du lien (Français) *</label>
                    <input name="name" type="text" className="input-field" defaultValue={editingItem?.name} required />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-1">
                        <Globe size={13} /> Nom du lien (Anglais)
                      </label>
                      <button
                        type="button"
                        onClick={handleTranslate}
                        disabled={isTranslating}
                        className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles size={12} className={isTranslating ? 'animate-spin' : ''} />
                        Traduire IA
                      </button>
                    </div>
                    <input 
                      name="name_en" 
                      type="text" 
                      className="input-field border-accent/40 focus:border-accent" 
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)} 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Vue / Chemin</label>
                    <input name="view" type="text" className="input-field" defaultValue={editingItem?.view} placeholder="ex: shop, contact..." required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Ordre d'affichage</label>
                    <input name="order" type="number" className="input-field" defaultValue={editingItem?.order || 1} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Statut</label>
                    <select name="status" className="input-field" defaultValue={editingItem?.status || 'active'}>
                      <option value="active">Actif</option>
                      <option value="inactive">Inactif</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Position</label>
                    <select name="position" className="input-field" defaultValue={editingItem?.position || 'top'}>
                      <option value="top">Barre Horizontale (Desktop)</option>
                      <option value="side">Menu Latéral (Mobile/Hamburger)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
    </>
  );
}
