import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Save, 
  RotateCcw, 
  HelpCircle, 
  Sparkles, 
  Search, 
  Eye, 
  MessageCircle,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../backend/firebase';
import { useConfigStore } from '../../../../stores/configStore';
import { FaqPageConfig, SiteConfig } from '../../../../types';
import { DEFAULT_FAQ_PAGE_CONFIG } from '../../../../siteDefaults';
import { Button } from '../../../components/ui/Button';
import { updateEntity as updateEntityBackend } from '../../../services/dashboardApi';
import { writeCache, writeEntityCache } from '../../../utils/cacheStorage';

interface Props {
  ctx?: any;
  onBack: () => void;
  onGoToFaqItems?: () => void;
}

export function AdminFaqPageEditor({ ctx, onBack, onGoToFaqItems }: Props) {
  const currentSiteConfig = useConfigStore((s) => s.siteConfig);
  const setStoreSiteConfig = useConfigStore((s) => s.setSiteConfig);

  const initialConfig: FaqPageConfig = {
    ...DEFAULT_FAQ_PAGE_CONFIG,
    ...(ctx?.siteConfig?.faqPage || currentSiteConfig?.faqPage || {}),
  };

  const [formData, setFormData] = useState<FaqPageConfig>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (ctx?.siteConfig?.faqPage) {
      setFormData({
        ...DEFAULT_FAQ_PAGE_CONFIG,
        ...ctx.siteConfig.faqPage,
      });
    } else if (currentSiteConfig?.faqPage) {
      setFormData({
        ...DEFAULT_FAQ_PAGE_CONFIG,
        ...currentSiteConfig.faqPage,
      });
    }
  }, [ctx?.siteConfig?.faqPage, currentSiteConfig?.faqPage]);

  const handleChange = (field: keyof FaqPageConfig, value: any) => {
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
        faqPage: formData,
        updatedAt: new Date().toISOString(),
      };

      try {
        await updateDoc(ref, {
          faqPage: formData,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        await setDoc(ref, updatedSiteConfig, { merge: true });
      }

      try {
        await updateEntityBackend('site_config', configDocId, {
          faqPage: formData,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        // Non-blocking
      }

      if (ctx?.setSiteConfig) {
        ctx.setSiteConfig(updatedSiteConfig);
      }
      setStoreSiteConfig(updatedSiteConfig);

      void writeCache('appBootstrap:site_config:v2', [updatedSiteConfig]);
      void writeEntityCache('site_config', [updatedSiteConfig]);

      toast.success('Configuration de la page FAQ enregistrée avec succès dans Firestore !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la page FAQ:', error);
      toast.error('Échec de la sauvegarde de la page FAQ.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Voulez-vous réinitialiser tous les champs de la page FAQ par défaut ?')) {
      setFormData({ ...DEFAULT_FAQ_PAGE_CONFIG });
      toast.info('Champs réinitialisés par défaut.');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
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
              <span className="text-xs text-primary/50">• /faq</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif text-primary">Éditeur de la Page FAQ</h1>
            <p className="text-sm text-primary/60 mt-0.5">
              Gérez le bandeau d'accueil, le placeholder de recherche et l'encadré d'assistance WhatsApp/Email.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {onGoToFaqItems && (
            <button
              type="button"
              onClick={onGoToFaqItems}
              className="px-4 py-2.5 rounded-xl bg-accent/10 hover:bg-accent/20 text-accent font-bold text-sm flex items-center gap-2 transition-all"
            >
              <Plus size={16} /> Gérer les Questions/Réponses
            </button>
          )}
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Hero & Search */}
          <div className="bg-card p-6 md:p-8 rounded-3xl border border-primary/10 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-primary/10">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Sparkles size={22} />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-primary">En-tête & Barre de Recherche</h2>
                <p className="text-xs text-primary/60">Titre principal de la page FAQ et barre de recherche</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                  Grand Titre H1
                </label>
                <input
                  type="text"
                  value={formData.heroTitle || ''}
                  onChange={(e) => handleChange('heroTitle', e.target.value)}
                  placeholder="Comment pouvons-nous vous aider ?"
                  className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                  Sous-titre / Description
                </label>
                <textarea
                  rows={3}
                  value={formData.heroSubtitle || ''}
                  onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                  placeholder="Trouvez des réponses instantanées..."
                  className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                  Texte indicatif du champ de recherche (Placeholder)
                </label>
                <input
                  type="text"
                  value={formData.searchPlaceholder || ''}
                  onChange={(e) => handleChange('searchPlaceholder', e.target.value)}
                  placeholder="Rechercher une question ou un mot-clé..."
                  className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Bottom Support Banner */}
          <div className="bg-card p-6 md:p-8 rounded-3xl border border-primary/10 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-primary/10">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <MessageCircle size={22} />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-primary">Bannière d'Assistance Inférieure</h2>
                <p className="text-xs text-primary/60">Encadré d'invitation à contacter le support en bas de page</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                  Titre de l'encadré
                </label>
                <input
                  type="text"
                  value={formData.bottomBannerTitle || ''}
                  onChange={(e) => handleChange('bottomBannerTitle', e.target.value)}
                  placeholder="Vous n'avez pas trouvé de réponse ?"
                  className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                  Sous-titre descriptif
                </label>
                <textarea
                  rows={3}
                  value={formData.bottomBannerSubtitle || ''}
                  onChange={(e) => handleChange('bottomBannerSubtitle', e.target.value)}
                  placeholder="Notre équipe est disponible 6j/7 sur WhatsApp..."
                  className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                  Texte du Bouton d'action
                </label>
                <input
                  type="text"
                  value={formData.bottomBannerButtonText || ''}
                  onChange={(e) => handleChange('bottomBannerButtonText', e.target.value)}
                  placeholder="Nous contacter"
                  className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                />
              </div>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="w-full py-4 bg-primary text-white font-bold text-base rounded-2xl hover:bg-accent flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
          >
            {isSaving ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save size={20} /> Enregistrer la page FAQ
              </>
            )}
          </Button>
        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-5">
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
            <div className="bg-[#3E4A3D] text-white p-6 rounded-2xl space-y-3">
              <h4 className="text-lg font-serif font-bold leading-snug">
                {formData.heroTitle || 'Comment pouvons-nous vous aider ?'}
              </h4>
              <p className="text-white/80 text-xs line-clamp-2 leading-relaxed">
                {formData.heroSubtitle || 'Trouvez des réponses instantanées...'}
              </p>
              <div className="pt-2">
                <div className="bg-white/90 text-primary/60 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
                  <Search size={14} />
                  <span>{formData.searchPlaceholder || 'Rechercher une question...'}</span>
                </div>
              </div>
            </div>

            {/* Bottom Support Preview */}
            <div className="bg-secondary/40 p-5 rounded-2xl border border-primary/5 space-y-2 text-xs">
              <div className="font-serif font-bold text-primary">
                {formData.bottomBannerTitle || "Vous n'avez pas trouvé de réponse ?"}
              </div>
              <div className="text-primary/70 text-[11px] leading-relaxed">
                {formData.bottomBannerSubtitle || 'Notre équipe est disponible 6j/7 sur WhatsApp et par email.'}
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  className="px-3 py-1.5 bg-accent text-white font-bold text-[11px] rounded-lg"
                >
                  {formData.bottomBannerButtonText || 'Nous contacter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
