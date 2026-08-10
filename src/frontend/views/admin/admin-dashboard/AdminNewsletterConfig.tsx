import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Mail, CheckCircle2, Trash2, Edit } from 'lucide-react';
import { DataTable } from '../../../components/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { useEntity } from '../../../hooks/useEntity';
import { NewsletterPopupConfig } from '../../../../types';
import { toast } from 'sonner';

import { ImageUpload } from '../../../components/ui/ImageUpload';

export function AdminNewsletterConfig({ ctx }: { ctx: any }) {
  const { data: configs, createEntity, updateEntity, deleteEntity } = useEntity<NewsletterPopupConfig>('newsletter_config_history');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsletterPopupConfig | null>(null);
  const [formData, setFormData] = useState({ isActive: false, title: '', message: '', delay: 5, image: '', button1Text: '', button2Text: '' });
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateEntity(editingItem.id!, formData);
        toast.success('Configuration mise à jour');
      } else {
        const activeConfig = configs.find(c => c.status === 'active');
        if (activeConfig) await updateEntity(activeConfig.id!, { status: 'inactive' });
        await createEntity({ ...formData, status: 'active' });
        toast.success('Nouvelle configuration définie comme active');
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleSetActive = async (config: NewsletterPopupConfig) => {
    try {
      const activeConfig = configs.find(c => c.status === 'active');
      if (activeConfig && activeConfig.id !== config.id) await updateEntity(activeConfig.id!, { status: 'inactive' });
      await updateEntity(config.id!, { status: 'active' });
      toast.success('Configuration définie comme active');
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-card p-6 rounded-3xl border border-primary/10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/5 text-primary rounded-2xl"><Mail size={24} /></div>
          <div>
            <h2 className="text-2xl font-serif text-primary">Popup Newsletter</h2>
            <p className="text-sm text-primary/60">Gérez l'historique des popups</p>
          </div>
        </div>
        <button onClick={() => { setEditingItem(null); setFormData({ isActive: false, title: '', message: '', delay: 5, image: '', button1Text: '', button2Text: '' }); setIsModalOpen(true); }} className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all">
          <Plus size={20} /> Nouvelle Configuration
        </button>
      </div>

      <div className="bg-card rounded-3xl border border-primary/10 shadow-sm overflow-hidden">
        <DataTable
          data={configs || []}
          columns={[
            { header: 'Titre', accessor: 'title' },
            { header: 'Actif', accessor: (c: NewsletterPopupConfig) => c.isActive ? 'Oui' : 'Non' },
            { header: 'Statut', accessor: (c: NewsletterPopupConfig) => <StatusBadge status={c.status} /> },
            {
              header: 'Actions',
              accessor: (c: NewsletterPopupConfig) => (
                <div className="flex items-center gap-2">
                  {c.status !== 'active' && <button onClick={() => handleSetActive(c)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"><CheckCircle2 size={16} /></button>}
                  <button onClick={() => { setEditingItem(c); setFormData(c as any); setIsModalOpen(true); }} className="p-2 bg-primary/5 text-primary rounded-lg hover:bg-primary/10"><Edit size={16} /></button>
                  <button onClick={() => { if(confirm('Supprimer ?')) deleteEntity(c.id!); }} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><Trash2 size={16} /></button>
                </div>
              )
            }
          ]}
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative z-10 p-8 border border-primary/10 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-2xl font-serif text-primary mb-6">{editingItem ? 'Modifier' : 'Ajouter'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <label className="flex items-center gap-3 p-4 border border-primary/10 rounded-xl cursor-pointer">
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded" />
                <span className="text-sm font-bold text-primary">Activer le popup</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Titre</label><input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3" /></div>
                <div><label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Délai (s)</label><input required type="number" value={formData.delay} onChange={e => setFormData({...formData, delay: parseInt(e.target.value)})} className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3" /></div>
              </div>
              <div><label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Message</label><textarea required rows={3} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 resize-none" /></div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Image</label>
                <ImageUpload name="newsletter_image" defaultValue={formData.image} onChange={(dataUrl) => setFormData({...formData, image: dataUrl})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Texte Bouton Principal</label><input type="text" value={formData.button1Text} onChange={e => setFormData({...formData, button1Text: e.target.value})} className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3" /></div>
                <div><label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Texte Bouton Secondaire</label><input type="text" value={formData.button2Text} onChange={e => setFormData({...formData, button2Text: e.target.value})} className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3" /></div>
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
