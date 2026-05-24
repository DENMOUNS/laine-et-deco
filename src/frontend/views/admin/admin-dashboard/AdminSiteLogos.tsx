import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Image as ImageIcon, CheckCircle2, Trash2, Edit } from 'lucide-react';
import { DataTable } from '../../../components/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { useEntity } from '../../../hooks/useEntity';
import { SiteLogo } from '../../../../types';
import { toast } from 'sonner';
import { ImageUpload } from '../../../components/ui/ImageUpload';

export function AdminSiteLogos({ ctx }: { ctx: any }) {
  const { data: logos, createEntity, updateEntity, deleteEntity } = useEntity<SiteLogo>('site_logo');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SiteLogo | null>(null);
  const [formData, setFormData] = useState({ image: '', lien: '' });
  
  const isBase64Image = (value: string) => value.startsWith('data:image/');
  const isTooLargeBase64 = (value: string) => isBase64Image(value) && value.length > 1_000_000;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image && !formData.lien) return toast.error('Veuillez fournir une image ou un lien.');

    if (isTooLargeBase64(formData.image)) {
      return toast.error('Image trop volumineuse pour Firestore (max 1 MB).');
    }

    const payload: Partial<SiteLogo> = {};
    if (formData.image) payload.image = formData.image;
    if (formData.lien) payload.lien = formData.lien;

    if (editingItem && Object.keys(payload).length === 0) {
      toast('Aucune modification détectée.');
      return;
    }

    try {
      if (editingItem) {
        if (!editingItem.id) {
          toast.error('Impossible de mettre à jour : identifiant manquant.');
          return;
        }
        if (!('status' in payload)) {
          payload.status = editingItem.status;
        }
        await updateEntity(editingItem.id, payload);
        toast.success('Logo mis à jour');
      } else {
        const activeLogo = logos.find((l) => l.status === 'active');
        if (activeLogo) await updateEntity(activeLogo.id!, { status: 'inactive' });
        await createEntity({ ...payload, status: 'active' });
        toast.success('Nouveau logo défini comme actif');
      }
      setIsModalOpen(false);
      setFormData({ image: '', lien: '' });
      setEditingItem(null);
    } catch (error: any) {
      toast.error(error?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleSetActive = async (logo: SiteLogo) => {
    try {
      const activeLogo = logos.find(l => l.status === 'active');
      if (activeLogo && activeLogo.id !== logo.id) {
        await updateEntity(activeLogo.id!, { status: 'inactive' });
      }
      await updateEntity(logo.id!, { status: 'active' });
      toast.success('Logo defini comme actif');
    } catch (error) {
      toast.error('Erreur');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-card p-6 rounded-3xl border border-primary/10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/5 text-primary rounded-2xl"><ImageIcon size={24} /></div>
          <div>
            <h2 className="text-2xl font-serif text-primary">Logos du Site</h2>
            <p className="text-sm text-primary/60">Gerez l'historique et le logo actif du site</p>
          </div>
        </div>
        <button onClick={() => { setEditingItem(null); setFormData({ image: '', lien: '' }); setIsModalOpen(true); }} className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all">
          <Plus size={20} /> Nouveau Logo
        </button>
      </div>

      <div className="bg-card rounded-3xl border border-primary/10 shadow-sm overflow-hidden">
        <DataTable data={logos || []} columns={[
          { header: 'Image', accessor: (logo: SiteLogo) => (<div className="w-16 h-16 bg-secondary/50 rounded-lg p-2 flex items-center justify-center">{(logo.image || logo.lien) ? <img src={logo.image || logo.lien} alt="Logo" className="max-w-full max-h-full object-contain" /> : <ImageIcon className="text-primary/20" />}</div>) },
          { header: 'Lien', accessor: (logo: SiteLogo) => logo.lien ? <span className="text-xs text-primary/70 break-all">{logo.lien}</span> : 'N/A' },
          { header: 'Statut', accessor: (logo: SiteLogo) => <StatusBadge status={logo.status} /> },
          { header: "Date d'ajout", accessor: (logo: SiteLogo) => logo.createdAt ? new Date(logo.createdAt).toLocaleDateString() : 'N/A' },
          { header: 'Actions', accessor: (logo: SiteLogo) => (
              <div className="flex items-center gap-2">
                {logo.status !== 'active' && (<button onClick={() => handleSetActive(logo)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"><CheckCircle2 size={16} /></button>)}
                <button onClick={() => { setEditingItem(logo); setFormData({ image: logo.image || '', lien: logo.lien || '' }); setIsModalOpen(true); }} className="p-2 bg-primary/5 text-primary rounded-lg hover:bg-primary/10"><Edit size={16} /></button>
                <button onClick={() => { if(confirm('Supprimer ce logo ?')) deleteEntity(logo.id!); }} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><Trash2 size={16} /></button>
              </div>
            ) }
        ]} />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-primary/10">
            <div className="p-8">
              <h3 className="text-2xl font-serif text-primary mb-6">{editingItem ? 'Modifier le logo' : 'Ajouter un logo'}</h3>
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Logo</label>
                  <ImageUpload name="image" defaultValue={formData.image} onChange={(dataUrl) => setFormData((prev) => ({ ...prev, image: dataUrl }))} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Lien de l'image</label>
                  <input type="text" value={formData.lien} onChange={(e) => setFormData((prev) => ({ ...prev, lien: e.target.value }))} placeholder="https://exemple.com/logo.png ou /logo.png" className="w-full px-4 py-3 bg-secondary/40 border border-primary/10 rounded-2xl focus:outline-none focus:border-accent text-sm" />
                  <p className="mt-2 text-xs text-primary/50">Si aucune image n'est importee, ce lien sera utilise. Les chemins relatifs (/logo.png) sont autorises.</p>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-primary/20 text-primary font-bold rounded-2xl hover:bg-primary/5 transition-all">Annuler</button>
                  <button type="submit" className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-accent transition-all shadow-xl shadow-primary/20">{editingItem ? 'Enregistrer les modifications' : 'Ajouter le logo'}</button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
