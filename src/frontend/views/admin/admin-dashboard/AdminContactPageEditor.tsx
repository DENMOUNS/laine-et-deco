import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Save, 
  RotateCcw, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Eye, 
  Info,
  Building2,
  Calendar,
  MessageSquare,
  Compass
} from 'lucide-react';
import { toast } from 'sonner';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../../backend/firebase';
import { useConfigStore } from '../../../../stores/configStore';
import { ContactPageConfig, SiteConfig } from '../../../../types';
import { DEFAULT_CONTACT_PAGE_CONFIG } from '../../../../siteDefaults';
import { Button } from '../../../components/ui/Button';
import { updateEntity as updateEntityBackend } from '../../../services/dashboardApi';
import { writeCache, writeEntityCache } from '../../../utils/cacheStorage';

interface Props {
  ctx?: any;
  onBack: () => void;
}

export function AdminContactPageEditor({ ctx, onBack }: Props) {
  const currentSiteConfig = useConfigStore((s) => s.siteConfig);
  const setStoreSiteConfig = useConfigStore((s) => s.setSiteConfig);

  const initialConfig: ContactPageConfig = {
    ...DEFAULT_CONTACT_PAGE_CONFIG,
    ...(ctx?.siteConfig?.contactPage || currentSiteConfig?.contactPage || {}),
  };

  const [formData, setFormData] = useState<ContactPageConfig>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'cards' | 'header' | 'customOrder' | 'preview'>('cards');

  useEffect(() => {
    if (ctx?.siteConfig?.contactPage) {
      setFormData({
        ...DEFAULT_CONTACT_PAGE_CONFIG,
        ...ctx.siteConfig.contactPage,
      });
    } else if (currentSiteConfig?.contactPage) {
      setFormData({
        ...DEFAULT_CONTACT_PAGE_CONFIG,
        ...currentSiteConfig.contactPage,
      });
    }
  }, [ctx?.siteConfig?.contactPage, currentSiteConfig?.contactPage]);

  const handleChange = (field: keyof ContactPageConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const configDocId = ctx?.siteConfig?.id || currentSiteConfig?.id || 'global';
      const ref = doc(db, 'site_config', configDocId);

      const updatedSiteConfig: SiteConfig = {
        ...(ctx?.siteConfig || currentSiteConfig),
        id: configDocId,
        contactPage: formData,
        updatedAt: new Date().toISOString(),
      };

      // 1. Direct Firestore write (with fallback to setDoc if doc doesn't exist yet)
      try {
        await updateDoc(ref, {
          contactPage: formData,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        await setDoc(ref, updatedSiteConfig, { merge: true });
      }

      // 2. Also sync to backend API if applicable
      try {
        await updateEntityBackend('site_config', configDocId, {
          contactPage: formData,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        // Non-blocking if offline/direct
      }

      // 3. Update React store and invalid caches
      if (ctx?.setSiteConfig) {
        ctx.setSiteConfig(updatedSiteConfig);
      }
      setStoreSiteConfig(updatedSiteConfig);

      // Invalidate bootstrap & entity caches so any reload uses fresh data
      void writeCache('appBootstrap:site_config:v2', [updatedSiteConfig]);
      void writeEntityCache('site_config', [updatedSiteConfig]);

      toast.success('Page Contact enregistrée et synchronisée avec succès dans Firestore !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la page contact:', error);
      toast.error("Échec de l'enregistrement de la page Contact.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Voulez-vous réinitialiser tous les champs de la page Contact avec les valeurs par défaut ?')) {
      setFormData({ ...DEFAULT_CONTACT_PAGE_CONFIG });
      toast.info('Champs réinitialisés par défaut (n\'oubliez pas d\'enregistrer).');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header & Actions */}
      <div className="bg-card p-6 md:p-8 rounded-3xl border border-primary/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start md:items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="p-3 bg-primary/5 hover:bg-primary/10 text-primary rounded-2xl transition-colors shrink-0"
            title="Retour à la liste des pages"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Firestore DB Active
              </span>
              <span className="text-xs text-primary/50">• /contact</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif text-primary">Éditeur de la Page Contact</h1>
            <p className="text-sm text-primary/60 mt-0.5">
              Personnalisez les 4 cartes coordonnées, les horaires, l'en-tête et les encadrés de la page publique.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-xl border border-primary/20 text-primary/80 hover:bg-primary/5 font-medium text-sm flex items-center gap-2 transition-all"
          >
            <RotateCcw size={16} /> Réinitialiser
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-6 py-2.5 bg-primary hover:bg-accent text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-primary/10 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={18} /> Enregistrer en base
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation sub-tabs */}
      <div className="flex border-b border-primary/10 gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('cards')}
          className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'cards'
              ? 'bg-primary text-white shadow-md'
              : 'text-primary/70 hover:bg-primary/5'
          }`}
        >
          <Building2 size={18} /> Les 4 Cartes Coordonnées
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('header')}
          className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'header'
              ? 'bg-primary text-white shadow-md'
              : 'text-primary/70 hover:bg-primary/5'
          }`}
        >
          <Compass size={18} /> En-tête & Formulaire
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('customOrder')}
          className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'customOrder'
              ? 'bg-primary text-white shadow-md'
              : 'text-primary/70 hover:bg-primary/5'
          }`}
        >
          <Sparkles size={18} /> Commandes sur mesure
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'preview'
              ? 'bg-primary text-white shadow-md'
              : 'text-primary/70 hover:bg-primary/5'
          }`}
        >
          <Eye size={18} /> Aperçu en direct
        </button>
      </div>

      {/* Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className={activeTab === 'preview' ? 'lg:col-span-12' : 'lg:col-span-7 space-y-8'}>
          {/* TAB 1: 4 Cartes Principales */}
          {activeTab === 'cards' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {/* Carte 1 : Boutique & Localisation */}
              <div className="bg-card p-6 md:p-8 rounded-3xl border border-primary/10 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-primary/10">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-primary">Carte 1 : Notre Boutique</h2>
                    <p className="text-xs text-primary/60">Titre et adresse géographique de votre établissement physique</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                      Titre de la boutique
                    </label>
                    <input
                      type="text"
                      value={formData.shopTitle || ''}
                      onChange={(e) => handleChange('shopTitle', e.target.value)}
                      placeholder="Notre Boutique"
                      className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                        Rue & Quartier (Ligne 1)
                      </label>
                      <input
                        type="text"
                        value={formData.shopAddressLine1 || ''}
                        onChange={(e) => handleChange('shopAddressLine1', e.target.value)}
                        placeholder="Quartier Akwa, Rue des Écoles"
                        className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                        Ville & Pays (Ligne 2)
                      </label>
                      <input
                        type="text"
                        value={formData.shopAddressLine2 || ''}
                        onChange={(e) => handleChange('shopAddressLine2', e.target.value)}
                        placeholder="Douala, Cameroun"
                        className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Carte 2 : Téléphone & Disponibilité */}
              <div className="bg-card p-6 md:p-8 rounded-3xl border border-primary/10 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-primary/10">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <Phone size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-primary">Carte 2 : Téléphone & Appel</h2>
                    <p className="text-xs text-primary/60">Numéro de contact téléphonique et sous-titre de disponibilité</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                        Titre du bloc
                      </label>
                      <input
                        type="text"
                        value={formData.phoneTitle || ''}
                        onChange={(e) => handleChange('phoneTitle', e.target.value)}
                        placeholder="Téléphone"
                        className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                        Numéro de téléphone affiché
                      </label>
                      <input
                        type="text"
                        value={formData.phoneNumber || ''}
                        onChange={(e) => handleChange('phoneNumber', e.target.value)}
                        placeholder="+237 600 000 000"
                        className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                      Sous-titre de disponibilité
                    </label>
                    <input
                      type="text"
                      value={formData.phoneAvailability || ''}
                      onChange={(e) => handleChange('phoneAvailability', e.target.value)}
                      placeholder="Lun-Ven, 9h à 18h"
                      className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-secondary/40 rounded-2xl border border-primary/5">
                    <div>
                      <span className="text-sm font-bold text-primary block">Bouton « Appeler en ligne (Gratuit) »</span>
                      <span className="text-xs text-primary/60">Permet aux clients connectés de lancer un appel direct</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allowDirectCall !== false}
                        onChange={(e) => handleChange('allowDirectCall', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Carte 3 : Email de réception */}
              <div className="bg-card p-6 md:p-8 rounded-3xl border border-primary/10 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-primary/10">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <Mail size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-primary">Carte 3 : Email de contact</h2>
                    <p className="text-xs text-primary/60">Adresse de messagerie et délai de réponse affiché</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                        Titre du bloc
                      </label>
                      <input
                        type="text"
                        value={formData.emailTitle || ''}
                        onChange={(e) => handleChange('emailTitle', e.target.value)}
                        placeholder="Email"
                        className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                        Adresse email
                      </label>
                      <input
                        type="email"
                        value={formData.emailAddress || ''}
                        onChange={(e) => handleChange('emailAddress', e.target.value)}
                        placeholder="contact@laine-deco.com"
                        className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                      Mention du délai de réponse
                    </label>
                    <input
                      type="text"
                      value={formData.emailResponseTime || ''}
                      onChange={(e) => handleChange('emailResponseTime', e.target.value)}
                      placeholder="Nous répondons sous 24h"
                      className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Carte 4 : Horaires d'ouverture */}
              <div className="bg-card p-6 md:p-8 rounded-3xl border border-primary/10 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-primary/10">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <Clock size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-primary">Carte 4 : Horaires d'ouverture</h2>
                    <p className="text-xs text-primary/60">Plages horaires d'ouverture de la boutique</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                      Titre du bloc
                    </label>
                    <input
                      type="text"
                      value={formData.hoursTitle || ''}
                      onChange={(e) => handleChange('hoursTitle', e.target.value)}
                      placeholder="Horaires"
                      className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                        Horaires Semaine (Lun - Ven)
                      </label>
                      <input
                        type="text"
                        value={formData.hoursWeekday || ''}
                        onChange={(e) => handleChange('hoursWeekday', e.target.value)}
                        placeholder="Lun - Ven : 09h - 19h"
                        className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                        Horaires Samedi
                      </label>
                      <input
                        type="text"
                        value={formData.hoursSaturday || ''}
                        onChange={(e) => handleChange('hoursSaturday', e.target.value)}
                        placeholder="Samedi : 10h - 17h"
                        className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                      Horaires Dimanche (Optionnel)
                    </label>
                    <input
                      type="text"
                      value={formData.hoursSunday || ''}
                      onChange={(e) => handleChange('hoursSunday', e.target.value)}
                      placeholder="Fermé ou Dimanche : 10h - 14h"
                      className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: En-tête & Formulaire */}
          {activeTab === 'header' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="bg-card p-6 md:p-8 rounded-3xl border border-primary/10 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-primary/10">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <Compass size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-primary">En-tête de la page Contact</h2>
                    <p className="text-xs text-primary/60">Badge, titre supérieur et message d'accueil</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                      Badge supérieur
                    </label>
                    <input
                      type="text"
                      value={formData.headerTitle || ''}
                      onChange={(e) => handleChange('headerTitle', e.target.value)}
                      placeholder="Contactez-nous"
                      className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                      Sous-titre explicatif introductif
                    </label>
                    <textarea
                      rows={4}
                      value={formData.headerSubtitle || ''}
                      onChange={(e) => handleChange('headerSubtitle', e.target.value)}
                      placeholder="Une question sur un produit, un modèle de tricot..."
                      className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                      Titre du formulaire de message
                    </label>
                    <input
                      type="text"
                      value={formData.formTitle || ''}
                      onChange={(e) => handleChange('formTitle', e.target.value)}
                      placeholder="Écrivez-nous"
                      className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: Commandes sur mesure */}
          {activeTab === 'customOrder' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="bg-card p-6 md:p-8 rounded-3xl border border-primary/10 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-primary/10">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-primary">Encadré « Commandes sur mesure »</h2>
                    <p className="text-xs text-primary/60">Bannière promotionnelle située sous les 4 cartes coordonnées</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                      Titre de l'encadré
                    </label>
                    <input
                      type="text"
                      value={formData.customOrderTitle || ''}
                      onChange={(e) => handleChange('customOrderTitle', e.target.value)}
                      placeholder="Commandes sur mesure"
                      className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                      Texte descriptif
                    </label>
                    <textarea
                      rows={3}
                      value={formData.customOrderDescription || ''}
                      onChange={(e) => handleChange('customOrderDescription', e.target.value)}
                      placeholder="Vous avez une idée précise de création ? Discutons-en pour donner vie à votre projet."
                      className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                      Libellé du bouton d'action
                    </label>
                    <input
                      type="text"
                      value={formData.customOrderButtonText || ''}
                      onChange={(e) => handleChange('customOrderButtonText', e.target.value)}
                      placeholder="Demander un devis"
                      className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick Submit button */}
          {activeTab !== 'preview' && (
            <div className="pt-2">
              <Button
                type="button"
                onClick={() => handleSave()}
                disabled={isSaving}
                className="w-full py-4 bg-primary text-white font-bold text-base rounded-2xl hover:bg-accent flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
              >
                {isSaving ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enregistrement dans la base de données...
                  </>
                ) : (
                  <>
                    <Save size={20} /> Enregistrer les modifications
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Live Visual Preview Panel */}
        <div className={activeTab === 'preview' ? 'lg:col-span-12' : 'lg:col-span-5'}>
          <div className="sticky top-6 bg-card rounded-3xl border border-primary/10 p-6 shadow-md space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-primary/10">
              <div className="flex items-center gap-2">
                <Eye size={18} className="text-accent" />
                <h3 className="font-serif font-bold text-primary text-lg">Aperçu en direct</h3>
              </div>
              <span className="text-xs font-medium bg-secondary px-3 py-1 rounded-full text-primary/70">
                Temps réel
              </span>
            </div>

            {/* Header Preview */}
            <div className="text-center py-2">
              <span className="inline-block text-accent uppercase tracking-widest font-bold text-[10px] mb-2 border border-accent/20 px-3 py-1 rounded-full bg-accent/5">
                {formData.headerTitle || 'Contactez-nous'}
              </span>
              <h4 className="text-xl font-serif text-primary mb-2">
                Laissez-nous un <span className="italic text-primary/70">message</span>
              </h4>
              <p className="text-xs text-primary/60 max-w-xs mx-auto line-clamp-2">
                {formData.headerSubtitle || 'Une question sur un produit...'}
              </p>
            </div>

            {/* 4 Cards Preview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Carte 1 */}
              <div className="bg-white dark:bg-stone-900/60 p-4 rounded-2xl border border-primary/10 shadow-xs">
                <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center mb-3">
                  <MapPin className="text-accent" size={16} />
                </div>
                <div className="font-serif font-bold text-sm text-primary dark:text-stone-100 mb-1">
                  {formData.shopTitle || 'Notre Boutique'}
                </div>
                <div className="text-xs text-primary/70 dark:text-stone-300 leading-snug">
                  {formData.shopAddressLine1 || 'Quartier Akwa, Rue des Écoles'}<br />
                  {formData.shopAddressLine2 || 'Douala, Cameroun'}
                </div>
              </div>

              {/* Carte 2 */}
              <div className="bg-white dark:bg-stone-900/60 p-4 rounded-2xl border border-primary/10 shadow-xs">
                <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center mb-3">
                  <Phone className="text-accent" size={16} />
                </div>
                <div className="font-serif font-bold text-sm text-primary dark:text-stone-100 mb-1">
                  {formData.phoneTitle || 'Téléphone'}
                </div>
                <div className="text-xs font-medium text-primary dark:text-stone-200">
                  {formData.phoneNumber || '+237 600 000 000'}
                </div>
                <div className="text-[10px] text-primary/60 dark:text-stone-400 mt-1">
                  {formData.phoneAvailability || 'Lun-Ven, 9h à 18h'}
                </div>
              </div>

              {/* Carte 3 */}
              <div className="bg-white dark:bg-stone-900/60 p-4 rounded-2xl border border-primary/10 shadow-xs">
                <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center mb-3">
                  <Mail className="text-accent" size={16} />
                </div>
                <div className="font-serif font-bold text-sm text-primary dark:text-stone-100 mb-1">
                  {formData.emailTitle || 'Email'}
                </div>
                <div className="text-xs font-medium text-primary dark:text-stone-200 truncate">
                  {formData.emailAddress || 'contact@laine-deco.com'}
                </div>
                <div className="text-[10px] text-primary/60 dark:text-stone-400 mt-1">
                  {formData.emailResponseTime || 'Nous répondons sous 24h'}
                </div>
              </div>

              {/* Carte 4 */}
              <div className="bg-white dark:bg-stone-900/60 p-4 rounded-2xl border border-primary/10 shadow-xs">
                <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center mb-3">
                  <Clock className="text-accent" size={16} />
                </div>
                <div className="font-serif font-bold text-sm text-primary dark:text-stone-100 mb-1">
                  {formData.hoursTitle || 'Horaires'}
                </div>
                <div className="text-[11px] text-primary/70 dark:text-stone-300 leading-tight space-y-0.5">
                  <div>{formData.hoursWeekday || 'Lun - Ven : 09h - 19h'}</div>
                  <div>{formData.hoursSaturday || 'Samedi : 10h - 17h'}</div>
                  {formData.hoursSunday && <div>{formData.hoursSunday}</div>}
                </div>
              </div>
            </div>

            {/* Custom Order Preview */}
            <div className="bg-[#3E4A3D] text-white p-5 rounded-2xl relative overflow-hidden text-xs">
              <div className="font-serif font-bold text-sm mb-1">
                {formData.customOrderTitle || 'Commandes sur mesure'}
              </div>
              <p className="text-white/70 text-[11px] mb-3 leading-relaxed">
                {formData.customOrderDescription || 'Vous avez une idée précise de création ?'}
              </p>
              <div className="inline-block bg-white text-primary text-[10px] font-bold px-3 py-1.5 rounded-lg">
                {formData.customOrderButtonText || 'Demander un devis'} →
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
