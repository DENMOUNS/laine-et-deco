import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, CheckCircle2, Trash2, Edit } from 'lucide-react';
import { DataTable } from '../../../components/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { useEntity } from '../../../hooks/useEntity';
import { SeoPageConfig } from '../../../../types';
import { toast } from 'sonner';

export function AdminSeoPages({ ctx }: { ctx: any }) {
  const { data: pages, createEntity, updateEntity, deleteEntity } = useEntity<SeoPageConfig>('seo_page');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SeoPageConfig | null>(null);
  const [formData, setFormData] = useState({ page: '', metaTitle: '', metaDescription: '' });
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateEntity(editingItem.id!, formData);
        toast.success('Page SEO mise à jour');
      } else {
        await createEntity({ ...formData, status: 'active' });
        toast.success('Nouvelle page SEO ajoutée');
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-card p-6 rounded-3xl border border-primary/10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/5 text-primary rounded-2xl"><Search size={24} /></div>
          <div>
            <h2 className="text-2xl font-serif text-primary">Pages SEO</h2>
            <p className="text-sm text-primary/60">Gérez le référencement de chaque page</p>
          </div>
        </div>
        <button onClick={() => { setEditingItem(null); setFormData({ page: '', metaTitle: '', metaDescription: '' }); setIsModalOpen(true); }} className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all">
          <Plus size={20} /> Nouvelle Page
        </button>
      </div>

      <div className="bg-card rounded-3xl border border-primary/10 shadow-sm overflow-hidden">
        <DataTable
          data={pages || []}
          columns={[
            { header: 'Page', accessor: 'page' },
            { header: 'Meta Titre', accessor: 'metaTitle' },
            { header: 'Meta Description', accessor: (p: SeoPageConfig) => <span className="truncate max-w-xs block" title={p.metaDescription}>{p.metaDescription}</span> },
            {
              header: 'Actions',
              accessor: (p: SeoPageConfig) => (
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditingItem(p); setFormData(p); setIsModalOpen(true); }} className="p-2 bg-primary/5 text-primary rounded-lg hover:bg-primary/10"><Edit size={16} /></button>
                  <button onClick={() => { if(confirm('Supprimer ?')) deleteEntity(p.id!); }} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><Trash2 size={16} /></button>
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
              <div><label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Identifiant de la Page</label><input required type="text" value={formData.page} onChange={e => setFormData({...formData, page: e.target.value})} className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3" placeholder="ex: home, about, contact..." /></div>
              <div><label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Meta Titre</label><input required type="text" value={formData.metaTitle} onChange={e => setFormData({...formData, metaTitle: e.target.value})} className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3" /></div>
              <div><label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Meta Description</label><textarea required rows={3} value={formData.metaDescription} onChange={e => setFormData({...formData, metaDescription: e.target.value})} className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 resize-none" /></div>
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
