import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Save, 
  RotateCcw, 
  Info, 
  Sparkles, 
  Eye, 
  Award,
  Users,
  Smile,
  ShieldCheck,
  Palette,
  HeartHandshake
} from 'lucide-react';
import { toast } from 'sonner';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../backend/firebase';
import { useConfigStore } from '../../../../stores/configStore';
import { AboutPageConfig, SiteConfig } from '../../../../types';
import { DEFAULT_ABOUT_PAGE_CONFIG } from '../../../../siteDefaults';
import { Button } from '../../../components/ui/Button';
import { updateEntity as updateEntityBackend } from '../../../services/dashboardApi';
import { writeCache, writeEntityCache } from '../../../utils/cacheStorage';

interface Props {
  ctx?: any;
  onBack: () => void;
}

export function AdminAboutPageEditor({ ctx, onBack }: Props) {
  const currentSiteConfig = useConfigStore((s) => s.siteConfig);
  const setStoreSiteConfig = useConfigStore((s) => s.setSiteConfig);

  const initialConfig: AboutPageConfig = {
    ...DEFAULT_ABOUT_PAGE_CONFIG,
    ...(ctx?.siteConfig?.aboutPage || currentSiteConfig?.aboutPage || {}),
  };

  const [formData, setFormData] = useState<AboutPageConfig>(initialConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'hero' | 'mission' | 'values' | 'team' | 'preview'>('hero');

  useEffect(() => {
    if (ctx?.siteConfig?.aboutPage) {
      setFormData({
        ...DEFAULT_ABOUT_PAGE_CONFIG,
        ...ctx.siteConfig.aboutPage,
      });
    } else if (currentSiteConfig?.aboutPage) {
      setFormData({
        ...DEFAULT_ABOUT_PAGE_CONFIG,
        ...currentSiteConfig.aboutPage,
      });
    }
  }, [ctx?.siteConfig?.aboutPage, currentSiteConfig?.aboutPage]);

  const handleChange = (field: keyof AboutPageConfig, value: any) => {
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
        aboutPage: formData,
        updatedAt: new Date().toISOString(),
      };

      try {
        await updateDoc(ref, {
          aboutPage: formData,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        await setDoc(ref, updatedSiteConfig, { merge: true });
      }

      try {
        await updateEntityBackend('site_config', configDocId, {
          aboutPage: formData,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        // Non-blocking
      }

      if (ctx?.setSiteConfig) {
        ctx.setSiteConfig(updatedSiteConfig);
      }
      setStoreSiteConfig(updatedSiteConfig);

      // Invalidate caches so refresh uses fresh data immediately
      void writeCache('appBootstrap:site_config:v2', [updatedSiteConfig]);
      void writeEntityCache('site_config', [updatedSiteConfig]);

      toast.success('Page À Propos enregistrée avec succès dans Firestore !');
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la page À Propos:", error);
      toast.error("Échec de l'enregistrement de la page À Propos.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Voulez-vous réinitialiser tous les champs de la page À Propos par défaut ?')) {
      setFormData({ ...DEFAULT_ABOUT_PAGE_CONFIG });
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
              <span className="text-xs text-primary/50">• /about</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif text-primary">Éditeur de la Page À Propos</h1>
            <p className="text-sm text-primary/60 mt-0.5">
              Personnalisez l'histoire, la mission textile, les 4 piliers de valeurs et les biographies des fondateurs.
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
          onClick={() => setActiveTab('hero')}
          className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'hero'
              ? 'bg-primary text-white shadow-md'
              : 'text-primary/70 hover:bg-primary/5'
          }`}
        >
          <Sparkles size={18} /> En-tête & Mission
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('values')}
          className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'values'
              ? 'bg-primary text-white shadow-md'
              : 'text-primary/70 hover:bg-primary/5'
          }`}
        >
          <Award size={18} /> Les 4 Valeurs Piliers
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('team')}
          className={`px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all shrink-0 ${
            activeTab === 'team'
              ? 'bg-primary text-white shadow-md'
              : 'text-primary/70 hover:bg-primary/5'
          }`}
        >
          <Users size={18} /> Duo Fondateurs
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className={activeTab === 'preview' ? 'lg:col-span-12' : 'lg:col-span-7 space-y-8'}>
          {/* TAB 1: En-tête & Mission */}
          {activeTab === 'hero' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-card p-6 md:p-8 rounded-3xl border border-primary/10 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-primary/10">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-primary">En-tête & Titre Principal</h2>
                    <p className="text-xs text-primary/60">Textes d'accueil et présentation générale de la marque</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                      Badge supérieur
                    </label>
                    <input
                      type="text"
                      value={formData.badgeTitle || ''}
                      onChange={(e) => handleChange('badgeTitle', e.target.value)}
                      placeholder="Laine de Qualité, Accessoires & Aiguilles au Cameroun"
                      className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                      Grand Titre H1
                    </label>
                    <input
                      type="text"
                      value={formData.heroTitle || ''}
                      onChange={(e) => handleChange('heroTitle', e.target.value)}
                      placeholder="Notre Histoire & Notre Raison d'Être"
                      className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                      Paragraphe d'introduction
                    </label>
                    <textarea
                      rows={4}
                      value={formData.heroSubtitle || ''}
                      onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                      placeholder="Découvrez l'aventure de Laine & Déco..."
                      className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Mission */}
              <div className="bg-card p-6 md:p-8 rounded-3xl border border-primary/10 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-primary/10">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <HeartHandshake size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-primary">Notre Mission Textile</h2>
                    <p className="text-xs text-primary/60">Objectif et engagement envers la communauté créative</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                      Titre de la mission
                    </label>
                    <input
                      type="text"
                      value={formData.missionTitle || ''}
                      onChange={(e) => handleChange('missionTitle', e.target.value)}
                      placeholder="Notre Mission Textile"
                      className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                      Texte descriptif de la mission
                    </label>
                    <textarea
                      rows={3}
                      value={formData.missionDescription || ''}
                      onChange={(e) => handleChange('missionDescription', e.target.value)}
                      placeholder="Démocratiser l'artisanat textile et le tricot moderne au Cameroun..."
                      className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary resize-none"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: 4 Valeurs Piliers */}
          {activeTab === 'values' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Valeur 1 */}
              <div className="bg-card p-6 rounded-3xl border border-primary/10 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <Award className="text-accent" size={20} />
                  <h3 className="font-serif font-bold text-primary">Valeur 1 : Qualité</h3>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.qualityTitle || ''}
                    onChange={(e) => handleChange('qualityTitle', e.target.value)}
                    placeholder="Qualité Sans Compromis"
                    className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-primary font-bold"
                  />
                  <textarea
                    rows={2}
                    value={formData.qualityDescription || ''}
                    onChange={(e) => handleChange('qualityDescription', e.target.value)}
                    placeholder="Chaque pelote et objet décoratif est minutieusement vérifié..."
                    className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-primary resize-none"
                  />
                </div>
              </div>

              {/* Valeur 2 */}
              <div className="bg-card p-6 rounded-3xl border border-primary/10 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-emerald-600" size={20} />
                  <h3 className="font-serif font-bold text-primary">Valeur 2 : Transparence</h3>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.transparencyTitle || ''}
                    onChange={(e) => handleChange('transparencyTitle', e.target.value)}
                    placeholder="Transparence & Prix Justes"
                    className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-primary font-bold"
                  />
                  <textarea
                    rows={2}
                    value={formData.transparencyDescription || ''}
                    onChange={(e) => handleChange('transparencyDescription', e.target.value)}
                    placeholder="En supprimant les intermédiaires superflus, nous proposons des tarifs clairs en Francs CFA..."
                    className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-primary resize-none"
                  />
                </div>
              </div>

              {/* Valeur 3 */}
              <div className="bg-card p-6 rounded-3xl border border-primary/10 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <Smile className="text-blue-600" size={20} />
                  <h3 className="font-serif font-bold text-primary">Valeur 3 : Proximité Locale</h3>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.proximityTitle || ''}
                    onChange={(e) => handleChange('proximityTitle', e.target.value)}
                    placeholder="Proximité Humaine 100% Locale"
                    className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-primary font-bold"
                  />
                  <textarea
                    rows={2}
                    value={formData.proximityDescription || ''}
                    onChange={(e) => handleChange('proximityDescription', e.target.value)}
                    placeholder="L'équipe de Laine & Déco répond directement à vos messages WhatsApp..."
                    className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-primary resize-none"
                  />
                </div>
              </div>

              {/* Valeur 4 */}
              <div className="bg-card p-6 rounded-3xl border border-primary/10 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <Palette className="text-purple-600" size={20} />
                  <h3 className="font-serif font-bold text-primary">Valeur 4 : Créativité</h3>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.creativityTitle || ''}
                    onChange={(e) => handleChange('creativityTitle', e.target.value)}
                    placeholder="Créativité & Transmission"
                    className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-primary font-bold"
                  />
                  <textarea
                    rows={2}
                    value={formData.creativityDescription || ''}
                    onChange={(e) => handleChange('creativityDescription', e.target.value)}
                    placeholder="Nous concevons des outils interactifs gratuits pour donner envie à chacun de créer..."
                    className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-primary resize-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: Biographies Fondateurs */}
          {activeTab === 'team' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Fondateur 1 */}
              <div className="bg-card p-6 md:p-8 rounded-3xl border border-primary/10 shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-primary/10">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold">
                    LM
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-primary">Fondateur 1 — Tech & Innovation</h3>
                    <p className="text-xs text-primary/60">Nom, rôle et biographie au sein du projet</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                      Nom complet ou Identifiant
                    </label>
                    <input
                      type="text"
                      value={formData.founder1Name || ''}
                      onChange={(e) => handleChange('founder1Name', e.target.value)}
                      placeholder="Landry M."
                      className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-primary font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                      Rôle / Titre
                    </label>
                    <input
                      type="text"
                      value={formData.founder1Role || ''}
                      onChange={(e) => handleChange('founder1Role', e.target.value)}
                      placeholder="Co-fondateur & Tech Lead"
                      className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                    Texte de présentation (Bio)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.founderLandryBio || formData.founder1Bio || ''}
                    onChange={(e) => {
                      handleChange('founderLandryBio', e.target.value);
                      handleChange('founder1Bio', e.target.value);
                    }}
                    placeholder="Ingénieur logiciel & passionné d'artisanat..."
                    className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary resize-none"
                  />
                </div>
              </div>

              {/* Fondateur 2 */}
              <div className="bg-card p-6 md:p-8 rounded-3xl border border-primary/10 shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-primary/10">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold">
                    LD
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-primary">Fondateur 2 — Sourcing & Opérations</h3>
                    <p className="text-xs text-primary/60">Nom, rôle et biographie au sein du projet</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                      Nom complet ou Identifiant
                    </label>
                    <input
                      type="text"
                      value={formData.founder2Name || ''}
                      onChange={(e) => handleChange('founder2Name', e.target.value)}
                      placeholder="Experte Sourcing"
                      className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-primary font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                      Rôle / Titre
                    </label>
                    <input
                      type="text"
                      value={formData.founder2Role || ''}
                      onChange={(e) => handleChange('founder2Role', e.target.value)}
                      placeholder="Qualité Matérielle & Approvisionnement"
                      className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-primary/70 block mb-2">
                    Texte de présentation (Bio)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.founderSourcingBio || formData.founder2Bio || ''}
                    onChange={(e) => {
                      handleChange('founderSourcingBio', e.target.value);
                      handleChange('founder2Bio', e.target.value);
                    }}
                    placeholder="Experte en matières premières et artisanat textile..."
                    className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary resize-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick Submit */}
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

        {/* Live Preview Panel */}
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

            {/* Banner preview */}
            <div className="bg-[#2D3E31] text-white p-6 rounded-2xl space-y-3">
              <span className="inline-block bg-accent/30 text-accent-light text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-accent/40">
                {formData.badgeTitle || 'Laine de Qualité au Cameroun'}
              </span>
              <h4 className="text-lg font-serif font-bold leading-snug">
                {formData.heroTitle || "Notre Histoire & Notre Raison d'Être"}
              </h4>
              <p className="text-white/80 text-xs line-clamp-3 leading-relaxed">
                {formData.heroSubtitle || "Découvrez l'aventure de Laine & Déco..."}
              </p>
            </div>

            {/* Duo fondateurs preview */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-primary/60 block">Duo de Fondateurs</span>
              <div className="space-y-2">
                <div className="p-3 bg-secondary/50 rounded-xl border border-primary/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-primary text-xs">
                      {formData.founder1Name || 'Landry M.'}
                    </span>
                    <span className="text-[10px] font-semibold text-accent">
                      {formData.founder1Role || 'Tech Lead'}
                    </span>
                  </div>
                  <p className="text-[10px] text-primary/70 line-clamp-2">
                    {formData.founderLandryBio || formData.founder1Bio || 'Ingénieur logiciel & passionné d\'artisanat...'}
                  </p>
                </div>

                <div className="p-3 bg-secondary/50 rounded-xl border border-primary/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-primary text-xs">
                      {formData.founder2Name || 'Experte Sourcing'}
                    </span>
                    <span className="text-[10px] font-semibold text-accent">
                      {formData.founder2Role || 'Qualité & Sourcing'}
                    </span>
                  </div>
                  <p className="text-[10px] text-primary/70 line-clamp-2">
                    {formData.founderSourcingBio || formData.founder2Bio || 'Experte en matières premières et artisanat textile...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Values preview */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary/60 block">4 Piliers de valeurs</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-secondary/50 rounded-xl border border-primary/5">
                  <div className="font-serif font-bold text-primary text-[11px] truncate">{formData.qualityTitle || 'Qualité'}</div>
                  <div className="text-[10px] text-primary/60 line-clamp-2 mt-0.5">{formData.qualityDescription || 'Excellence des fibres'}</div>
                </div>
                <div className="p-3 bg-secondary/50 rounded-xl border border-primary/5">
                  <div className="font-serif font-bold text-primary text-[11px] truncate">{formData.transparencyTitle || 'Transparence'}</div>
                  <div className="text-[10px] text-primary/60 line-clamp-2 mt-0.5">{formData.transparencyDescription || 'Prix justes en XAF'}</div>
                </div>
                <div className="p-3 bg-secondary/50 rounded-xl border border-primary/5">
                  <div className="font-serif font-bold text-primary text-[11px] truncate">{formData.proximityTitle || 'Proximité'}</div>
                  <div className="text-[10px] text-primary/60 line-clamp-2 mt-0.5">{formData.proximityDescription || 'Conseils WhatsApp'}</div>
                </div>
                <div className="p-3 bg-secondary/50 rounded-xl border border-primary/5">
                  <div className="font-serif font-bold text-primary text-[11px] truncate">{formData.creativityTitle || 'Créativité'}</div>
                  <div className="text-[10px] text-primary/60 line-clamp-2 mt-0.5">{formData.creativityDescription || 'Outils interactifs'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
