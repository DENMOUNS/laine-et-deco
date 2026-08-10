import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Award, CheckCircle2, Trash2, Edit } from 'lucide-react';
import { DataTable } from '../../../components/DataTable';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { useEntity } from '../../../hooks/useEntity';
import { LoyaltyProgramConfig } from '../../../../types';
import { toast } from 'sonner';

export function AdminLoyaltyConfig({ ctx }: { ctx: any }) {
  const { data: configs, createEntity, updateEntity, deleteEntity } = useEntity<LoyaltyProgramConfig>('loyalty_config_history');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LoyaltyProgramConfig | null>(null);
  
  // Simplified for MVP, we just use JSON strings to edit the complex object
  const [formData, setFormData] = useState({ 
    configStr: JSON.stringify({
      pointsPerPurchase: 10,
      pointsPerReview: 50,
      badges: [],
      levels: []
    }, null, 2)
  });
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let configObj;
      try {
        configObj = JSON.parse(formData.configStr);
      } catch(e) {
        return toast.error("Format JSON invalide");
      }

      if (editingItem) {
        await updateEntity(editingItem.id!, { config: configObj });
        toast.success('Configuration mise à jour');
      } else {
        const activeConfig = configs.find(c => c.status === 'active');
        if (activeConfig) await updateEntity(activeConfig.id!, { status: 'inactive' });
        await createEntity({ config: configObj, status: 'active' });
        toast.success('Nouvelle configuration définie comme active');
      }
      setIsModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleSetActive = async (config: LoyaltyProgramConfig) => {
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
          <div className="p-3 bg-primary/5 text-primary rounded-2xl"><Award size={24} /></div>
          <div>
            <h2 className="text-2xl font-serif text-primary">Programme de Fidélité</h2>
            <p className="text-sm text-primary/60">Gérez l'historique des règles de fidélité</p>
          </div>
        </div>
        <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all">
          <Plus size={20} /> Nouvelle Règle
        </button>
      </div>

      <div className="bg-card rounded-3xl border border-primary/10 shadow-sm overflow-hidden">
        <DataTable
          data={configs || []}
          columns={[
            { header: 'Points par Achat', accessor: (c: LoyaltyProgramConfig) => c.config?.pointsPerPurchase || 0 },
            { header: 'Points par Avis', accessor: (c: LoyaltyProgramConfig) => c.config?.pointsPerReview || 0 },
            { header: 'Statut', accessor: (c: LoyaltyProgramConfig) => <StatusBadge status={c.status} /> },
            {
              header: 'Actions',
              accessor: (c: LoyaltyProgramConfig) => (
                <div className="flex items-center gap-2">
                  {c.status !== 'active' && <button onClick={() => handleSetActive(c)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"><CheckCircle2 size={16} /></button>}
                  <button onClick={() => { setEditingItem(c); setFormData({ configStr: JSON.stringify(c.config, null, 2) }); setIsModalOpen(true); }} className="p-2 bg-primary/5 text-primary rounded-lg hover:bg-primary/10"><Edit size={16} /></button>
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
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative z-10 p-8 border border-primary/10">
            <h3 className="text-2xl font-serif text-primary mb-6">{editingItem ? 'Modifier' : 'Ajouter'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Configuration JSON</label>
                <textarea required rows={10} value={formData.configStr} onChange={e => setFormData({configStr: e.target.value})} className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 font-mono text-xs" />
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
