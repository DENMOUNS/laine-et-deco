import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, ExternalLink, SwitchCamera, Sparkles, Globe, Loader2 } from 'lucide-react';
import { useEntity } from '../../hooks/useEntity';
import { MemberPortfolio } from '../../../types';
import { toast } from 'sonner';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { translateContentWithAi } from '../../utils/aiTranslator';

export const AdminPortfolios: React.FC = () => {
  const { data: portfolios, addEntity, updateEntity, deleteEntity } = useEntity<MemberPortfolio>('member_portfolio', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MemberPortfolio | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const [formData, setFormData] = useState<Partial<MemberPortfolio>>({
    name: '',
    role: '',
    role_en: '',
    bio: '',
    bio_en: '',
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
      setFormData({ name: '', role: '', role_en: '', bio: '', bio_en: '', externalPortfolioUrl: '', email: '', expertise: [], projects: [], experience: [], education: [], certifications: [] });
    }
    setIsModalOpen(true);
  };

  const handleTranslate = async () => {
    if (!formData.role && !formData.bio) {
      toast.error('Veuillez renseigner le poste ou la bio en français.');
      return;
    }
    setIsTranslating(true);
    try {
      const res = await translateContentWithAi({
        role: formData.role || '',
        bio: formData.bio || ''
      }, 'en', 'fr');
      if (res) {
        setFormData(prev => ({
          ...prev,
          role_en: res.role || prev.role_en,
          bio_en: res.bio || prev.bio_en
        }));
        toast.success('Traduction générée avec succès !');
      }
    } catch {
      toast.error('Erreur lors de la traduction.');
    } finally {
      setIsTranslating(false);
    }
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

  const handleSeedDefaultMembers = async () => {
    try {
      const defaultMembers: MemberPortfolio[] = [
        {
          id: 'elena-vance',
          name: 'Elena Vance',
          role: 'Co-Fondatrice & Directrice Artistique',
          role_en: 'Co-Founder & Creative Director',
          bio: 'Passionnée de tricot contemporain et de design responsable.',
          bio_en: 'Passionate about contemporary knitting and responsible design.',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
          email: 'elena@atelier.fr',
          externalPortfolioUrl: '',
          expertise: [],
          projects: [],
          experience: [],
          education: [],
          certifications: []
        },
        {
          id: 'marcus-chen',
          name: 'Marcus Chen',
          role: 'Co-Fondateur & Maître Artisan',
          role_en: 'Co-Founder & Master Craftsman',
          bio: 'Expert en modélisme textile et sélection des fibres d’exception.',
          bio_en: 'Expert in textile modeling and selection of premium fibers.',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
          email: 'marcus@atelier.fr',
          externalPortfolioUrl: '',
          expertise: [],
          projects: [],
          experience: [],
          education: [],
          certifications: []
        }
      ];
      for (const m of defaultMembers) {
        await addEntity(m);
      }
      toast.success('Membres par défaut créés en base de données');
    } catch {
      toast.error('Erreur lors de la création des membres');
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
                  <td colSpan={5} className="px-6 py-12 text-center text-primary/60">
                    <p className="mb-4">Aucun membre trouvé en base de données.</p>
                    <button
                      onClick={handleSeedDefaultMembers}
                      className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl font-bold text-xs transition-colors cursor-pointer"
                    >
                      Initialiser avec les membres du duo fondateur
                    </button>
                  </td>
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
              {/* Translation bar */}
              <div className="flex items-center justify-between bg-accent/5 p-3.5 rounded-2xl border border-accent/20">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-accent" />
                  <span className="text-xs font-bold text-primary">Traduction automatique</span>
                </div>
                <button
                  type="button"
                  onClick={handleTranslate}
                  disabled={isTranslating}
                  className="px-3 py-1.5 bg-accent text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow hover:bg-accent/90 transition-all cursor-pointer"
                >
                  {isTranslating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  {isTranslating ? 'Traduction...' : 'Traduire en Anglais'}
                </button>
              </div>

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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/50 block mb-2">Poste (FR) *</label>
                    <input 
                      type="text" 
                      value={formData.role || ''} 
                      onChange={e => setFormData({...formData, role: e.target.value})}
                      className="input-field" 
                      placeholder="Ex: Développeur Full-Stack"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-1 mb-2">
                      <Globe size={12} /> Poste (EN)
                    </label>
                    <input 
                      type="text" 
                      value={formData.role_en || ''} 
                      onChange={e => setFormData({...formData, role_en: e.target.value})}
                      className="input-field border-accent/40 focus:border-accent" 
                      placeholder="Ex: Full-Stack Developer"
                    />
                  </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/50 block mb-2">Bio courte (FR)</label>
                    <textarea 
                      value={formData.bio || ''} 
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                      className="input-field h-24" 
                      placeholder="Description courte de la personne..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-1 mb-2">
                      <Globe size={12} /> Bio courte (EN)
                    </label>
                    <textarea 
                      value={formData.bio_en || ''} 
                      onChange={e => setFormData({...formData, bio_en: e.target.value})}
                      className="input-field h-24 border-accent/40 focus:border-accent" 
                      placeholder="Short biography in English..."
                    />
                  </div>
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
