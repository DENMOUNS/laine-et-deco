import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Monitor, CheckCircle2, XCircle, Trash2, Edit, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { DataTable } from '../../../components/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { useEntity } from '../../../hooks/useEntity';
import { HeroBannerConfig } from '../../../../types';
import { toast } from 'sonner';

import { ImageUpload } from '../../../components/ui/ImageUpload';
import { ImageWithFallback } from '../../../components/ui/ImageWithFallback';

export function AdminHeroBanners({ ctx }: { ctx: any }) {
  const { data: rawBanners, createEntity, updateEntity, deleteEntity } = useEntity<HeroBannerConfig>('hero_banner');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HeroBannerConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<{ image: string; title: string; subtitle: string; ctaText: string; link: string; order: number; status: 'active' | 'inactive' }>({
    image: '',
    title: '',
    subtitle: '',
    ctaText: '',
    link: '',
    order: 1,
    status: 'active',
  });

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
            setFormData({ image: '', title: '', subtitle: '', ctaText: 'Découvrir la boutique', link: '', order: nextOrder, status: 'active' });
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all"
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
                    className="p-1 text-primary/60 hover:text-primary hover:bg-primary/5 rounded"
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
                    className="p-1 text-primary/60 hover:text-primary hover:bg-primary/5 rounded"
                    title="Descendre"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>
              )
            },
            { header: 'Image', accessor: (b: HeroBannerConfig) => <ImageWithFallback src={b.image} alt="Banner" className="w-20 h-12 object-cover rounded-xl border border-primary/10" /> },
            { header: 'Titre', accessor: 'title' },
            { header: 'Statut', accessor: (b: HeroBannerConfig) => <StatusBadge status={b.status} /> },
            {
              header: 'Actions',
              accessor: (b: HeroBannerConfig) => (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(b)}
                    className={`p-2 rounded-lg transition-colors ${
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
                        subtitle: b.subtitle || '',
                        ctaText: b.ctaText || '',
                        link: b.link || '',
                        order: b.order || 1,
                        status: b.status || 'active',
                      });
                      setIsModalOpen(true);
                    }}
                    className="p-2 bg-primary/5 text-primary rounded-lg hover:bg-primary/10"
                    title="Modifier"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => { if(confirm('Supprimer cette bannière ?')) deleteEntity(b.id!); }}
                    className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
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
            <h3 className="text-2xl font-serif text-primary mb-6">{editingItem ? 'Modifier la bannière' : 'Ajouter une bannière'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Image</label>
                <ImageUpload name="banner_image" defaultValue={formData.image} onChange={(dataUrl) => setFormData({...formData, image: dataUrl})} />
              </div>
              <div><label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Titre</label><input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3" /></div>
              <div><label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Sous-titre</label><input required type="text" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3" /></div>
              <div><label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Texte Bouton CTA</label><input required type="text" value={formData.ctaText} onChange={e => setFormData({...formData, ctaText: e.target.value})} placeholder="Ex: Découvrir la collection" className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3" /></div>
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
                  className="flex-1 py-4 border border-primary/20 text-primary font-bold rounded-2xl hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-accent disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
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
