import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { LayoutDashboard, Package, ShoppingBag, Users, BarChart3, Settings, LogOut, TrendingUp, ArrowUpRight, ArrowDownRight, Search, Bell, Plus, Menu, X, History, Coins, Globe, Shield, Activity, Smartphone, Monitor, Star, CheckCircle2, AlertCircle, MessageSquare, Palette, Award, Download, FileText, Send, Table as TableIcon, Ticket, Lock, Eye, MousePointer2, Calendar as CalendarIcon, Image as ImageIcon, Type as TypeIcon, MonitorOff, Info, User, Edit, Trash2, ShoppingCart, RefreshCcw, Tag, Mail, Percent, Truck, ChevronLeft, MapPin, Route, QrCode, Save, HelpCircle, Phone, Gift, Sparkles, Loader2 } from 'lucide-react';
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

export function AdminSiteFeaturesSection({ ctx }: { ctx: any }) {
  const { setSiteConfig, saveSiteSection, siteConfig } = ctx;
  const [translatingIndex, setTranslatingIndex] = useState<number | null>(null);

  const handleTranslateFeature = async (index: number) => {
    const feat = (siteConfig.features || [])[index];
    if (!feat || (!feat.title && !feat.description)) {
      toast.error('Veuillez renseigner le titre ou la description en français.');
      return;
    }
    setTranslatingIndex(index);
    try {
      const res = await translateContentWithAi({
        title: feat.title || '',
        description: feat.description || ''
      }, 'en', 'fr');
      if (res) {
        const newFeatures = [...(siteConfig.features || [])];
        newFeatures[index] = {
          ...newFeatures[index],
          title_en: res.title || newFeatures[index].title_en,
          description_en: res.description || newFeatures[index].description_en
        };
        setSiteConfig((prev: any) => ({ ...prev, features: newFeatures }));
        toast.success('Traduction de l\'avantage générée par l\'IA !');
      }
    } catch {
      toast.error('Erreur lors de la traduction.');
    } finally {
      setTranslatingIndex(null);
    }
  };

  const featureToggles = [
    { key: 'lookbook', title: 'Lookbook', description: 'Masque la page Lookbook et la section d’inspiration sur l’accueil.' },
    { key: 'blog', title: 'Blog', description: 'Masque le blog et ses articles publics.' },
    { key: 'about', title: 'À propos', description: 'Masque la page À propos et ses liens publics.' },
    { key: 'team', title: 'Équipe', description: 'Masque la page Équipe.' },
    { key: 'contact', title: 'Contact', description: 'Masque la page de contact.' },
    { key: 'faq', title: 'FAQ', description: 'Masque la page FAQ.' },
    { key: 'calculator', title: 'Calculateur de laine', description: 'Masque la page du calculateur.' },
    { key: 'volumeCalculator', title: 'Calculateur de volume', description: 'Masque la page du calculateur de volume.' },
    { key: 'customOrder', title: 'Sur mesure', description: 'Masque la page Sur mesure.' },
    { key: 'comparison', title: 'Comparateur', description: 'Masque le comparateur et ses liens publics.' },
    { key: 'wishlist', title: 'Liste de souhaits', description: 'Masque la wishlist et ses liens publics.' },
  ];

  return (
    <>
<section className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
               <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/5 text-primary rounded-2xl"><Award size={24} /></div>
                  <div>
                    <h3 className="text-xl font-serif text-primary">Fonctionnalités publiques</h3>
                    <p className="text-xs text-primary/60">Activez ou désactivez les pages et modules visibles côté client</p>
                  </div>
                </div>
                <button 
                  onClick={() => saveSiteSection(['featureFlags'], 'Fonctionnalités publiques')}
                  className="px-4 py-2 bg-secondary text-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/5 transition-colors"
                >
                  Enregistrer Section
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                {featureToggles.map((feature) => {
                  const isEnabled = siteConfig.featureFlags?.[feature.key] ?? true;
                  return (
                    <label key={feature.key} className="flex items-start justify-between gap-4 rounded-3xl border border-primary/10 bg-secondary/20 p-4">
                      <div>
                        <p className="font-semibold text-primary">{feature.title}</p>
                        <p className="text-sm text-primary/60 mt-1">{feature.description}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={(e) => {
                          setSiteConfig((prev: any) => ({
                            ...prev,
                            featureFlags: {
                              ...(prev.featureFlags || {}),
                              [feature.key]: e.target.checked,
                            },
                          }));
                        }}
                        className="mt-1 h-5 w-5 rounded border-primary/30 text-accent focus:ring-accent"
                      />
                    </label>
                  );
                })}
              </div>

              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/5 text-primary rounded-2xl"><Award size={24} /></div>
                  <div>
                    <h3 className="text-xl font-serif text-primary">Pourquoi nous choisir ? (Avantages FR & EN)</h3>
                    <p className="text-xs text-primary/60">Gérez les 4 points forts affichés sur la page d'accueil</p>
                  </div>
                </div>
                <button 
                  onClick={() => saveSiteSection(['features'], 'Pourquoi nous choisir')}
                  className="px-4 py-2 bg-secondary text-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/5 transition-colors"
                >
                  Enregistrer Section
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(siteConfig.features || [
                  { iconName: "Package", title: "Qualité Premium", title_en: "Premium Quality", description: "Laines 100% naturelles", description_en: "100% natural wools" },
                  { iconName: "Truck", title: "Livraison Rapide", title_en: "Fast Delivery", description: "Offerte dès 200 000 FCFA", description_en: "Free over 200,000 FCFA" },
                  { iconName: "ShieldCheck", title: "Paiement Sécurisé", title_en: "Secure Payment", description: "Transaction 100% protégée", description_en: "100% protected checkout" },
                  { iconName: "Heart", title: "Fait avec Amour", title_en: "Made with Love", description: "Sélection artisanale", description_en: "Artisanal yarn curation" },
                ]).map((feature: any, index: number) => (
                  <div key={index} className="p-6 bg-secondary/30 rounded-3xl border border-primary/10 space-y-4">
                    <div className="flex items-center justify-between border-b border-primary/5 pb-2">
                      <span className="text-xs font-bold text-primary/60">Avantage #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleTranslateFeature(index)}
                        disabled={translatingIndex === index}
                        className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {translatingIndex === index ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        Traduire en Anglais IA
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Titre (FR)</label>
                         <input 
                           type="text" 
                           className="w-full px-4 py-2 bg-card border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-sm font-medium" 
                           value={feature.title || ''}
                           onChange={(e) => {
                             const newFeatures = [...(siteConfig.features || [])];
                             if (newFeatures[index]) {
                               newFeatures[index].title = e.target.value;
                               setSiteConfig((prev: any) => ({ ...prev, features: newFeatures }));
                             }
                           }}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-1">
                           <Globe size={11} /> Titre (EN)
                         </label>
                         <input 
                           type="text" 
                           className="w-full px-4 py-2 bg-card border border-accent/30 rounded-xl focus:outline-none focus:border-accent text-sm font-medium" 
                           value={feature.title_en || ''}
                           onChange={(e) => {
                             const newFeatures = [...(siteConfig.features || [])];
                             if (newFeatures[index]) {
                               newFeatures[index].title_en = e.target.value;
                               setSiteConfig((prev: any) => ({ ...prev, features: newFeatures }));
                             }
                           }}
                           placeholder="Premium Quality..."
                         />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Description (FR)</label>
                         <input 
                           type="text" 
                           className="w-full px-4 py-2 bg-card border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-sm" 
                           value={feature.description || ''}
                           onChange={(e) => {
                             const newFeatures = [...(siteConfig.features || [])];
                             if (newFeatures[index]) {
                               newFeatures[index].description = e.target.value;
                               setSiteConfig((prev: any) => ({ ...prev, features: newFeatures }));
                             }
                           }}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-1">
                           <Globe size={11} /> Description (EN)
                         </label>
                         <input 
                           type="text" 
                           className="w-full px-4 py-2 bg-card border border-accent/30 rounded-xl focus:outline-none focus:border-accent text-sm" 
                           value={feature.description_en || ''}
                           onChange={(e) => {
                             const newFeatures = [...(siteConfig.features || [])];
                             if (newFeatures[index]) {
                               newFeatures[index].description_en = e.target.value;
                               setSiteConfig((prev: any) => ({ ...prev, features: newFeatures }));
                             }
                           }}
                           placeholder="100% natural wools..."
                         />
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Icône Lucide</label>
                       <input 
                         type="text" 
                         className="w-full px-4 py-2 bg-card border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-sm font-mono" 
                         value={feature.iconName || ''}
                         onChange={(e) => {
                           const newFeatures = [...(siteConfig.features || [])];
                           if (newFeatures[index]) {
                             newFeatures[index].iconName = e.target.value;
                             setSiteConfig((prev: any) => ({ ...prev, features: newFeatures }));
                           }
                         }}
                       />
                    </div>
                  </div>
                ))}
              </div>

              {/* Gift Wrap Configuration Section */}
              <div className="mt-12 bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/10 text-amber-700 rounded-2xl">
                      <Gift size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-serif text-primary">Option Emballage Cadeau & Carton D'Art</h3>
                      <p className="text-xs text-primary/60">Gérez le tarif et la disponibilité de l'option cadeau sur le site</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => saveSiteSection(['giftWrapConfig'], 'Option Emballage Cadeau')}
                    className="px-4 py-2 bg-secondary text-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/5 transition-colors flex items-center gap-2"
                  >
                    <Save size={14} /> Enregistrer Section
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-secondary/20 p-6 rounded-3xl border border-primary/10">
                  <label className="flex items-center justify-between gap-4 p-4 bg-white/80 rounded-2xl border border-primary/10 cursor-pointer">
                    <div>
                      <p className="font-semibold text-primary">Activer l'option Coffret Cadeau</p>
                      <p className="text-xs text-primary/60 mt-0.5">Affiche le studio de personnalisation de carton cadeau au panier et au checkout.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={siteConfig.giftWrapConfig?.enabled ?? true}
                      onChange={(e) => {
                        setSiteConfig((prev: any) => ({
                          ...prev,
                          giftWrapConfig: {
                            ...(prev.giftWrapConfig || { fee: 2000 }),
                            enabled: e.target.checked,
                          },
                        }));
                      }}
                      className="h-5 w-5 rounded border-primary/30 text-accent focus:ring-accent"
                    />
                  </label>

                  <div className="p-4 bg-white/80 rounded-2xl border border-primary/10 flex flex-col justify-center">
                    <label className="block text-xs font-bold uppercase tracking-wider text-primary mb-2">
                      Prix du Coffret Cadeau (FCFA)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={siteConfig.giftWrapConfig?.fee ?? 2000}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          setSiteConfig((prev: any) => ({
                            ...prev,
                            giftWrapConfig: {
                              ...(prev.giftWrapConfig || { enabled: true }),
                              fee: val,
                            },
                          }));
                        }}
                        className="w-full px-4 py-2.5 bg-card border border-primary/15 rounded-xl focus:outline-none focus:border-accent text-sm font-bold text-primary"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-primary/50">FCFA</span>
                    </div>
                    <p className="text-[11px] text-primary/50 mt-1.5">Tarif appliqué par commande lorsque le client active l'option cadeau.</p>
                  </div>
                </div>
              </div>
            </section>
    </>
  );
}
