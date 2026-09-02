import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Megaphone, CheckCircle2, Trash2, Edit, Globe, Sparkles, Loader2 } from 'lucide-react';
import { DataTable } from '../../../components/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { useEntity } from '../../../hooks/useEntity';
import { AnnouncementBannerConfig } from '../../../../types';
import { toast } from 'sonner';
import { translateContentWithAi } from '../../../utils/aiTranslator';

export function AdminAnnouncementBanners({ ctx }: { ctx: any }) {
  const { data: banners, createEntity, updateEntity, deleteEntity } = useEntity<AnnouncementBannerConfig>('announcement_banner');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AnnouncementBannerConfig | null>(null);
  const [formData, setFormData] = useState<{ message: string; message_en?: string }>({ message: '', message_en: '' });
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!formData.message) {
      toast.error("Veuillez d'abord saisir le message en français");
      return;
    }
    setIsTranslating(true);
    try {
      const translated = await translateContentWithAi(
        { message: formData.message },
        'en',
        'Top announcement header marquee'
      );
      if (translated.message) {
        setFormData(prev => ({ ...prev, message_en: translated.message }));
        toast.success('Traduction générée avec succès');
      }
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la traduction');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateEntity(editingItem.id!, formData);
        toast.success('Bannière mise à jour');
      } else {
        const activeBanner = banners.find(b => b.status === 'active');
        if (activeBanner) await updateEntity(activeBanner.id!, { status: 'inactive' });
        await createEntity({ ...formData, status: 'active' });
        toast.success('Nouvelle bannière définie comme active');
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleToggleStatus = async (banner: AnnouncementBannerConfig) => {
    try {
      if (banner.status === 'active') {
        await updateEntity(banner.id!, { status: 'inactive' });
        toast.success('Bannière désactivée');
      } else {
        const activeBanner = banners.find(b => b.status === 'active');
        if (activeBanner && activeBanner.id !== banner.id) {
          await updateEntity(activeBanner.id!, { status: 'inactive' });
        }
        await updateEntity(banner.id!, { status: 'active' });
        toast.success('Bannière activée');
      }
    } catch (error) {
      toast.error('Erreur lors du changement de statut');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-card p-6 rounded-3xl border border-primary/10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/5 text-primary rounded-2xl"><Megaphone size={24} /></div>
          <div>
            <h2 className="text-2xl font-serif text-primary">Bannières d'Annonce</h2>
            <p className="text-sm text-primary/60">Gérez la bannière au dessus du menu</p>
          </div>
        </div>
        <button onClick={() => { setEditingItem(null); setFormData({ message: '', message_en: '' }); setIsModalOpen(true); }} className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all cursor-pointer">
          <Plus size={20} /> Nouvelle Bannière
        </button>
      </div>

      <div className="bg-card rounded-3xl border border-primary/10 shadow-sm overflow-hidden">
        <DataTable
          data={banners || []}
          columns={[
            { 
              header: 'Message (FR / EN)', 
              accessor: (b: AnnouncementBannerConfig) => (
                <div>
                  <div className="font-medium text-primary">{b.message}</div>
                  {b.message_en && <div className="text-xs text-primary/60 italic">EN: {b.message_en}</div>}
                </div>
              )
            },
            { header: 'Statut', accessor: (b: AnnouncementBannerConfig) => <StatusBadge status={b.status} /> },
            {
              header: 'Actions',
              accessor: (b: AnnouncementBannerConfig) => (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleToggleStatus(b)} 
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                      b.status === 'active' 
                        ? 'bg-amber-500/10 text-amber-700 hover:bg-amber-500/20' 
                        : 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20'
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    <span>{b.status === 'active' ? 'Désactiver' : 'Activer'}</span>
                  </button>
                  <button onClick={() => { setEditingItem(b); setFormData({ message: b.message, message_en: b.message_en || '' }); setIsModalOpen(true); }} className="p-2 bg-primary/5 text-primary rounded-lg hover:bg-primary/10 cursor-pointer" title="Modifier"><Edit size={16} /></button>
                  <button onClick={() => { if(confirm('Supprimer cette bannière ?')) deleteEntity(b.id!); }} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 cursor-pointer" title="Supprimer"><Trash2 size={16} /></button>
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
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-serif text-primary">{editingItem ? 'Modifier' : 'Ajouter'}</h3>
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
                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Message (Français)</label>
                <input required type="text" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 flex items-center gap-1.5">
                  <Globe size={13} className="text-accent" />
                  <span>Message (Anglais)</span>
                </label>
                <input type="text" value={formData.message_en || ''} onChange={e => setFormData({...formData, message_en: e.target.value})} placeholder="Optionnel ou généré par l'IA" className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3" />
              </div>
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
