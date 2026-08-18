import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Monitor, CheckCircle2, XCircle, Trash2, Edit, ArrowUp, ArrowDown, Loader2, Sparkles, Globe } from 'lucide-react';
import { DataTable } from '../../../components/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { useEntity } from '../../../hooks/useEntity';
import { HeroBannerConfig } from '../../../../types';
import { toast } from 'sonner';
import { translateContentWithAi } from '../../../utils/aiTranslator';

import { ImageUpload } from '../../../components/ui/ImageUpload';
import { ImageWithFallback } from '../../../components/ui/ImageWithFallback';

export function AdminHeroBanners({ ctx }: { ctx: any }) {
  const { data: rawBanners, createEntity, updateEntity, deleteEntity } = useEntity<HeroBannerConfig>('hero_banner');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HeroBannerConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [formData, setFormData] = useState<{
    image: string;
    title: string;
    title_en?: string;
    subtitle: string;
    subtitle_en?: string;
    ctaText: string;
    ctaText_en?: string;
    link: string;
    order: number;
    status: 'active' | 'inactive';
  }>({
    image: '',
    title: '',
    title_en: '',
    subtitle: '',
    subtitle_en: '',
    ctaText: '',
    ctaText_en: '',
    link: '',
    order: 1,
    status: 'active',
  });

  const handleTranslate = async () => {
    if (!formData.title && !formData.subtitle && !formData.ctaText) {
      toast.error("Veuillez d'abord saisir au moins le titre ou le sous-titre en français");
      return;
    }
    setIsTranslating(true);
    try {
      const textsToTranslate: Record<string, string> = {};
      if (formData.title) textsToTranslate.title = formData.title;
      if (formData.subtitle) textsToTranslate.subtitle = formData.subtitle;
      if (formData.ctaText) textsToTranslate.ctaText = formData.ctaText;

      const translated = await translateContentWithAi(
        textsToTranslate,
        'en',
        'Hero banner slide for homepage'
      );

      setFormData(prev => ({
        ...prev,
        title_en: translated.title || prev.title_en,
        subtitle_en: translated.subtitle || prev.subtitle_en,
        ctaText_en: translated.ctaText || prev.ctaText_en,
      }));
      toast.success('Traduction générée avec succès');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la traduction');
    } finally {
      setIsTranslating(false);
    }
  };

  // Tri des bannières par ordre d'affichage (du plus petit au plus grand)
  const banners = (rawBanners || []).slice().sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

  const isBase64Image = (value: string) => value.startsWith('data:image/');
  const isTooLargeBase64 = (value: string) => isBase64Image(value) && value.length > 1_000_000;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (isTooLargeBase64(formData.image)) {
        toast.error('Erreur image : le fichier est trop volumineux pour Firestore (max 1 Mo).');
        setIsSaving(false);
        return;
      }

      if (editingItem) {
        if (!editingItem.id) {
          throw new Error('Aucun identifiant de bannière disponible pour la mise à jour.');
        }
        await updateEntity(editingItem.id, formData);
        toast.success('Bannière mise à jour');
      } else {
        await createEntity({ ...formData });
        toast.success('Nouvelle bannière ajoutée');
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error: any) {
      const message = error?.message?.toString() || 'Impossible de sauvegarder la bannière';
      const isImageError = message.toLowerCase().includes('image');
      toast.error(isImageError ? `Erreur image : ${message}` : `Autre erreur : ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (banner: HeroBannerConfig) => {
    try {
      const newStatus = banner.status === 'active' ? 'inactive' : 'active';
      await updateEntity(banner.id!, { status: newStatus });
      toast.success(`Bannière ${newStatus === 'active' ? 'activée' : 'désactivée'}`);
    } catch (error) {
      toast.error('Erreur lors du changement de statut');
    }
  };

  const handleOrderChange = async (banner: HeroBannerConfig, newOrder: number) => {
    try {
      await updateEntity(banner.id!, { order: newOrder });
      toast.success("Ordre mis à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de l'ordre");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card p-6 rounded-3xl border border-primary/10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/5 text-primary rounded-2xl"><Monitor size={24} /></div>
          <div>
            <h2 className="text-2xl font-serif text-primary">Bannières Hero</h2>
            <p className="text-sm text-primary/60">Gérez les bannières défilantes de la page d'accueil et leur ordre d'affichage</p>
          </div>
        </div>
        <button
          onClick={() => {
            const nextOrder = banners.length > 0 ? Math.max(...banners.map((b) => b.order || 0)) + 1 : 1;
            setEditingItem(null);
            setFormData({ image: '', title: '', title_en: '', subtitle: '', subtitle_en: '', ctaText: 'Découvrir la boutique', ctaText_en: 'Explore collection', link: '', order: nextOrder, status: 'active' });
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all cursor-pointer"
        >
          <Plus size={20} /> Nouvelle Bannière
        </button>
      </div>

      <div className="bg-card rounded-3xl border border-primary/10 shadow-sm overflow-hidden">
        <DataTable
          data={banners}
          columns={[
            {
              header: 'Ordre',
              accessor: (b: HeroBannerConfig) => (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOrderChange(b, Math.max(1, (b.order || 1) - 1))}
                    className="p-1 text-primary/60 hover:text-primary hover:bg-primary/5 rounded cursor-pointer"
                    title="Monter"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <input
                    type="number"
                    min={1}
                    className="w-12 px-1 py-1 bg-secondary/50 border border-primary/10 rounded-lg text-center font-bold text-sm"
                    key={b.id + '-' + b.order}
                    defaultValue={b.order || 1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val > 0 && val !== b.order) {
                        handleOrderChange(b, val);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleOrderChange(b, (b.order || 1) + 1)}
                    className="p-1 text-primary/60 hover:text-primary hover:bg-primary/5 rounded cursor-pointer"
                    title="Descendre"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
              )
            },
            { header: 'Image', accessor: (b: HeroBannerConfig) => <ImageWithFallback src={b.image} alt="Banner" className="w-20 h-12 object-cover rounded-xl border border-primary/10" /> },
            { 
              header: 'Titre & Sous-titre (FR / EN)', 
              accessor: (b: HeroBannerConfig) => (
                <div className="max-w-xs">
                  <div className="font-bold text-primary truncate">{b.title}</div>
                  {b.title_en && <div className="text-xs text-primary/60 italic truncate">EN: {b.title_en}</div>}
                  <div className="text-xs text-primary/60 truncate">{b.subtitle}</div>
                </div>
              )
            },
            {
              header: 'Bouton & Lien',
              accessor: (b: HeroBannerConfig) => (
                <div className="text-xs text-primary/80">
                  <span className="font-semibold text-primary">{b.ctaText || 'Boutique'}</span>
                  {b.ctaText_en && <span className="text-primary/50 italic ml-1">({b.ctaText_en})</span>}
                  <div className="text-[10px] text-primary/50">{b.link ? `→ ${b.link}` : '→ Boutique (défaut)'}</div>
                </div>
              )
            },
            { header: 'Statut', accessor: (b: HeroBannerConfig) => <StatusBadge status={b.status} /> },
            {
              header: 'Actions',
              accessor: (b: HeroBannerConfig) => (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(b)}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      b.status === 'active'
                        ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    }`}
                    title={b.status === 'active' ? 'Désactiver' : 'Activer'}
                  >
                    {b.status === 'active' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                  </button>
                  <button
                    onClick={() => {
                      setEditingItem(b);
                      setFormData({
                        image: b.image || '',
                        title: b.title || '',
                        title_en: b.title_en || '',
                        subtitle: b.subtitle || '',
                        subtitle_en: b.subtitle_en || '',
                        ctaText: b.ctaText || '',
                        ctaText_en: b.ctaText_en || '',
                        link: b.link || '',
                        order: b.order || 1,
                        status: b.status || 'active',
                      });
                      setIsModalOpen(true);
                    }}
                    className="p-2 bg-primary/5 text-primary rounded-lg hover:bg-primary/10 cursor-pointer"
                    title="Modifier"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => { if(confirm('Supprimer cette bannière ?')) deleteEntity(b.id!); }}
                    className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )
            }
          ]}
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative z-10 p-8 border border-primary/10 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif text-primary">{editingItem ? 'Modifier la bannière' : 'Ajouter une bannière'}</h3>
              <button
                type="button"
                onClick={handleTranslate}
                disabled={isTranslating}
                className="px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                title="Traduire automatiquement vers l'anglais avec l'IA"
              >
                {isTranslating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                <span>Auto-traduire (EN)</span>
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Image</label>
                <ImageUpload name="banner_image" defaultValue={formData.image} onChange={(dataUrl) => setFormData({...formData, image: dataUrl})} />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Titre (Français)</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 flex items-center gap-1.5">
                  <Globe size={13} className="text-accent" />
                  <span>Titre (Anglais)</span>
                </label>
                <input type="text" value={formData.title_en || ''} onChange={e => setFormData({...formData, title_en: e.target.value})} placeholder="Optionnel ou généré par l'IA" className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Sous-titre (Français)</label>
                <input required type="text" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 flex items-center gap-1.5">
                  <Globe size={13} className="text-accent" />
                  <span>Sous-titre (Anglais)</span>
                </label>
                <input type="text" value={formData.subtitle_en || ''} onChange={e => setFormData({...formData, subtitle_en: e.target.value})} placeholder="Optionnel ou généré par l'IA" className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Bouton CTA (FR)</label>
                  <input required type="text" value={formData.ctaText} onChange={e => setFormData({...formData, ctaText: e.target.value})} placeholder="Ex: Découvrir" className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 flex items-center gap-1.5">
                    <Globe size={13} className="text-accent" />
                    <span>Bouton CTA (EN)</span>
                  </label>
                  <input type="text" value={formData.ctaText_en || ''} onChange={e => setFormData({...formData, ctaText_en: e.target.value})} placeholder="Ex: Explore" className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Lien du bouton <span className="text-primary/40 normal-case font-normal">(vide = boutique par défaut)</span></label>
                <select value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3">
                  <option value="">Boutique (défaut)</option>
                  <option value="shop">Boutique</option>
                  <option value="home">Accueil</option>
                  <option value="packs">Packs</option>
                  <option value="lookbook">Lookbook</option>
                  <option value="blog">Blog</option>
                  <option value="contact">Contact</option>
                  <option value="about">À propos</option>
                  <option value="promos">Promotions</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Ordre d'affichage</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.order}
                    onChange={e => setFormData({...formData, order: parseInt(e.target.value, 10) || 1})}
                    className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Statut</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}
                    className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3"
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="flex-1 py-4 border border-primary/20 text-primary font-bold rounded-2xl hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-accent disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isSaving ? (
                    <><Loader2 size={18} className="animate-spin" /> Enregistrement...</>
                  ) : (
                    'Enregistrer'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
