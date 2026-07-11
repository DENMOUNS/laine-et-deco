import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Monitor, CheckCircle2, Trash2, Edit } from 'lucide-react';
import { DataTable } from '../../../components/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { useEntity } from '../../../hooks/useEntity';
import { HeroBannerConfig } from '../../../../types';
import { toast } from 'sonner';

import { ImageUpload } from '../../../components/ui/ImageUpload';

export function AdminHeroBanners({ ctx }: { ctx: any }) {
  const { data: banners, createEntity, updateEntity, deleteEntity } = useEntity<HeroBannerConfig>('hero_banner');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HeroBannerConfig | null>(null);
  const [formData, setFormData] = useState({ image: '', title: '', subtitle: '', ctaText: '' });
  
  const isBase64Image = (value: string) => value.startsWith('data:image/');
  const isTooLargeBase64 = (value: string) => isBase64Image(value) && value.length > 1_000_000;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isTooLargeBase64(formData.image)) {
        return toast.error('Erreur image : le fichier est trop volumineux pour Firestore (max 1 Mo).');
      }

      if (editingItem) {
        if (!editingItem.id) {
          throw new Error('Aucun identifiant de bannière disponible pour la mise à jour.');
        }
        await updateEntity(editingItem.id, formData);
        toast.success('Banniere mise a jour');
      } else {
        const activeBanner = banners.find(b => b.status === 'active');
        if (activeBanner) await updateEntity(activeBanner.id!, { status: 'inactive' });
        await createEntity({ ...formData, status: 'active' });
        toast.success('Nouvelle banniere definie comme active');
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error: any) {
      const message = error?.message?.toString() || 'Impossible de sauvegarder la bannière';
      const isImageError = message.toLowerCase().includes('image');
      toast.error(isImageError ? `Erreur image : ${message}` : `Autre erreur : ${message}`);
    }
  };

  const handleSetActive = async (banner: HeroBannerConfig) => {
    try {
      const activeBanner = banners.find(b => b.status === 'active');
      if (activeBanner && activeBanner.id !== banner.id) await updateEntity(activeBanner.id!, { status: 'inactive' });
      await updateEntity(banner.id!, { status: 'active' });
      toast.success('Banniere definie comme active');
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-card p-6 rounded-3xl border border-primary/10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/5 text-primary rounded-2xl"><Monitor size={24} /></div>
          <div>
            <h2 className="text-2xl font-serif text-primary">Bannieres Hero</h2>
            <p className="text-sm text-primary/60">Gerez l'historique et la banniere principale active</p>
          </div>
        </div>
        <button onClick={() => { setEditingItem(null); setFormData({ image: '', title: '', subtitle: '', ctaText: '' }); setIsModalOpen(true); }} className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all">
          <Plus size={20} /> Nouvelle Banniere
        </button>
      </div>

      <div className="bg-card rounded-3xl border border-primary/10 shadow-sm overflow-hidden">
        <DataTable
          data={banners || []}
          columns={[
            { header: 'Image', accessor: (b: HeroBannerConfig) => <img src={b.image} alt="Banner" className="w-16 h-10 object-cover rounded" /> },
            { header: 'Titre', accessor: 'title' },
            { header: 'Statut', accessor: (b: HeroBannerConfig) => <StatusBadge status={b.status} /> },
            {
              header: 'Actions',
              accessor: (b: HeroBannerConfig) => (
                <div className="flex items-center gap-2">
                  {b.status !== 'active' && <button onClick={() => handleSetActive(b)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"><CheckCircle2 size={16} /></button>}
                  <button onClick={() => { setEditingItem(b); setFormData(b); setIsModalOpen(true); }} className="p-2 bg-primary/5 text-primary rounded-lg hover:bg-primary/10"><Edit size={16} /></button>
                  <button onClick={() => { if(confirm('Supprimer ?')) deleteEntity(b.id!); }} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><Trash2 size={16} /></button>
                </div>
              )
            }
          ]}
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative z-10 p-8 border border-primary/10">
            <h3 className="text-2xl font-serif text-primary mb-6">{editingItem ? 'Modifier' : 'Ajouter'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Image</label>
                <ImageUpload name="banner_image" defaultValue={formData.image} onChange={(dataUrl) => setFormData({...formData, image: dataUrl})} />
              </div>
              <div><label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Titre</label><input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3" /></div>
              <div><label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Sous-titre</label><input required type="text" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3" /></div>
              <div><label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Texte Bouton</label><input required type="text" value={formData.ctaText} onChange={e => setFormData({...formData, ctaText: e.target.value})} className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3" /></div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-primary/20 text-primary font-bold rounded-2xl hover:bg-primary/5">Annuler</button>
                <button type="submit" className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-accent">Enregistrer</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
