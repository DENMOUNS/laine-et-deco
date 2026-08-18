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
import { ImageUpload } from '../../../components/ui/ImageUpload';

export function AdminLookbookModalFields({ ctx }: { ctx: any }) {
  const { modalType, editingItem } = ctx;

  const [captionEn, setCaptionEn] = React.useState(editingItem?.caption_en || '');
  const [isTranslating, setIsTranslating] = React.useState(false);

  const handleTranslate = async (e: React.MouseEvent) => {
    const parent = (e.currentTarget.closest('.grid') as HTMLElement);
    const captionFr = (parent?.querySelector('textarea[name="caption"]') as HTMLTextAreaElement)?.value || editingItem?.caption;
    if (!captionFr) {
      toast.error('Veuillez entrer une légende en français d\'abord.');
      return;
    }
    setIsTranslating(true);
    try {
      const res = await translateContentWithAi({ caption: captionFr }, 'en', 'fr');
      if (res && res.caption) {
        setCaptionEn(res.caption);
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
{modalType === 'lookbook' && (
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Image</label>
                  <ImageUpload name="image" defaultValue={editingItem?.image} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Légende (Français) *</label>
                    <textarea name="caption" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary font-medium" defaultValue={editingItem?.caption} required />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-1">
                        <Globe size={13} /> Légende (Anglais)
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
                    <textarea 
                      name="caption_en" 
                      className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-accent font-medium" 
                      value={captionEn}
                      onChange={(e) => setCaptionEn(e.target.value)} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Tags (IDs de produits, séparés par des virgules)</label>
                  <input name="tags" type="text" className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary" defaultValue={editingItem?.tags?.join(', ')} placeholder="p1, p2, p3" />
                </div>
              </div>
            )}
    </>
  );
}
