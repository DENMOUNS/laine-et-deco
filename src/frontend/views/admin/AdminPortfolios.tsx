import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, ExternalLink, SwitchCamera } from 'lucide-react';
import { useEntity } from '../../hooks/useEntity';
import { MemberPortfolio } from '../../../types';
import { toast } from 'sonner';
import { ImageUpload } from '../../components/ui/ImageUpload';

export const AdminPortfolios: React.FC = () => {
  const { data: portfolios, addEntity, updateEntity, deleteEntity } = useEntity<MemberPortfolio>('member_portfolio', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MemberPortfolio | null>(null);
  
  const [formData, setFormData] = useState<Partial<MemberPortfolio>>({
    name: '',
    role: '',
    bio: '',
    externalPortfolioUrl: '',
    email: '',
    expertise: [], projects: [], experience: [], education: [], certifications: []
  });

  const handleOpenModal = (item?: MemberPortfolio) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({ name: '', role: '', bio: '', externalPortfolioUrl: '', email: '', expertise: [], projects: [], experience: [], education: [], certifications: [] });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.role) {
      toast.error('Le nom et le poste sont obligatoires');
      return;
    }

    try {
      if (editingItem) {
        await updateEntity(editingItem.id, formData);
        toast.success('Portfolio mis à jour');
      } else {
        await addEntity({
          ...formData,
          id: formData.name?.toLowerCase().replace(/\s+/g, '-') || Date.now().toString(),
        } as MemberPortfolio);
        toast.success('Portfolio créé');
      }
      setIsModalOpen(false);
    } catch (e: any) {
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-2xl border border-primary/10">
        <div>
          <h2 className="text-2xl font-serif font-bold text-primary">Membres & Portfolios</h2>
          <p className="text-sm text-primary/60">Gérez les membres de l'équipe et leurs liens de portfolio</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Ajouter un Membre
        </button>
      </div>

      <div className="bg-card rounded-2xl border border-primary/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/30 text-xs uppercase font-bold tracking-widest text-primary/60">
              <tr>
                <th className="px-6 py-4">Membre</th>
                <th className="px-6 py-4">Poste</th>
                <th className="px-6 py-4">Bio</th>
                <th className="px-6 py-4">Lien Portfolio</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {portfolios.map((portfolio) => (
                <tr key={portfolio.id} className="hover:bg-primary/5 transition-colors">
                  <td className="px-6 py-4 font-bold text-primary">
                    <div className="flex items-center gap-3">
                      {portfolio.avatar && (
                        <img src={portfolio.avatar} alt={portfolio.name} className="w-10 h-10 rounded-full object-cover" />
                      )}
                      <span>{portfolio.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{portfolio.role}</td>
                  <td className="px-6 py-4 max-w-xs truncate">{portfolio.bio || '-'}</td>
                  <td className="px-6 py-4">
                    {portfolio.externalPortfolioUrl ? (
                      <a href={portfolio.externalPortfolioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                        <ExternalLink size={14} /> Voir Lien
                      </a>
                    ) : (
                      <span className="text-primary/40">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => handleOpenModal(portfolio)} className="p-2 bg-primary/5 text-primary rounded-xl hover:bg-primary hover:text-white transition-colors">
                          <Edit size={16} />
                       </button>
                       <button onClick={async () => {
                         if (confirm('Êtes-vous sûr ?')) {
                            await deleteEntity(portfolio.id);
                         }
                       }} className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors">
                          <Trash2 size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {portfolios.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-primary/50">Aucun membre trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-primary/10 flex justify-between items-center bg-secondary/30">
              <h3 className="font-serif text-xl font-bold text-primary">
                {editingItem ? 'Modifier le Membre' : 'Ajouter un Membre'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors text-primary/60">
                <Trash2 size={20} className="opacity-0" /> {/* Just for spacing or close icon if we had one */}
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/50 block mb-2">Nom Complet *</label>
                  <input 
                    type="text" 
                    value={formData.name || ''} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="input-field" 
                    placeholder="Ex: Jean Dupont"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/50 block mb-2">Poste *</label>
                  <input 
                    type="text" 
                    value={formData.role || ''} 
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="input-field" 
                    placeholder="Ex: Développeur Full-Stack"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/50 block mb-2">Email</label>
                  <input 
                    type="email" 
                    value={formData.email || ''} 
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="input-field" 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/50 block mb-2">Lien Portfolio Externe</label>
                  <input 
                    type="url" 
                    value={formData.externalPortfolioUrl || ''} 
                    onChange={e => setFormData({...formData, externalPortfolioUrl: e.target.value})}
                    className="input-field" 
                    placeholder="https://"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/50 block mb-2">Image/Avatar</label>
                  <ImageUpload
                    name="avatar"
                    defaultValue={formData.avatar || ''}
                    onChange={(dataUrl) => setFormData({ ...formData, avatar: dataUrl })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/50 block mb-2">Bio courte</label>
                  <textarea 
                    value={formData.bio || ''} 
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                    className="input-field h-24" 
                    placeholder="Description courte de la personne..."
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-primary/10 flex justify-end gap-3 bg-secondary/10">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 border border-primary/20 text-primary rounded-xl font-bold hover:bg-card transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleSave}
                className="btn-primary"
              >
                Enregistrer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
