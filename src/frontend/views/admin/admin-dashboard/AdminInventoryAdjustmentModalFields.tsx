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

import { AdminFlashSales } from '../AdminFlashSales';
import { AdminLookbooks } from '../AdminLookbooks';
import { AdminPortfolios } from '../AdminPortfolios';

import { Modal } from '../../../components/Modal';


export function AdminInventoryAdjustmentModalFields({ ctx }: { ctx: any }) {
  const { localProducts, modalType } = ctx;
  const uniqueProducts = Array.from(new Map((localProducts || []).map((p: any) => [p.id, p])).values());
  return (
    <>
{modalType === 'inventory-adjustment' && (
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4 p-6 bg-primary/5 rounded-3xl border border-primary/10">
                   <p className="text-sm text-primary/60 italic leading-relaxed">
                     Sélectionnez un produit et indiquez la quantité à ajouter au stock actuel.
                   </p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Produit</label>
                  <select name="productId" className="input-field max-h-96" required>
                    <option value="">-- Sélectionner un produit --</option>
                    {uniqueProducts.map((p: any, i: number) => (
                      <option key={p.id || `prod-${i}`} value={p.id}>
                        {p.name} (Stock: {p.stock}) {!p.isAvailable && '(Inactif)'}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-primary/50 italic">Tous les produits sont listés, y compris les inactifs</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Quantité (utiliser le signe - pour retirer)</label>
                  <input 
                    name="quantityChange" 
                    type="number" 
                    className="input-field" 
                    placeholder="Ex: 50 ou -10" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Note (optionnelle)</label>
                  <input 
                    name="note" 
                    type="text" 
                    className="input-field" 
                    placeholder="Ex: Réajustement d'inventaire, retour client, etc." 
                  />
                </div>
              </div>
            )}
    </>
  );
}
