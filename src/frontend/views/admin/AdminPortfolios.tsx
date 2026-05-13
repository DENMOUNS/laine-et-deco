import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Briefcase, GraduationCap, Award, Code, Edit, Save, Plus, Trash2, ExternalLink, Mail, Github, Linkedin, Layout, Database, Smartphone, Globe, Sparkles } from 'lucide-react';
import { MemberPortfolio, PortfolioProject, PortfolioExperience, PortfolioEducation, PortfolioCertification, ExpertiseCategory } from '../../../types';
import { toast } from 'sonner';

interface AdminPortfoliosProps {
  portfolios: MemberPortfolio[];
  onUpdate: (id: string, data: Partial<MemberPortfolio>) => void;
}

export const AdminPortfolios: React.FC<AdminPortfoliosProps> = ({ portfolios, onUpdate }) => {
  console.log('Portfolios received in AdminPortfolios:', portfolios);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedPortfolio = portfolios.find(p => p.id === selectedId);

  return (
    <div className="space-y-8">
      {/* Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {['landry', 'doleres'].map(id => {
          const portfolio = portfolios.find(p => p.id === id);
          return (
            <button
              key={id}
              onClick={() => setSelectedId(id)}
              className={`p-8 rounded-[2.5rem] border transition-all text-left group ${
                selectedId === id 
                  ? 'bg-primary border-primary shadow-xl shadow-primary/20 text-white' 
                  : 'bg-card border-primary/10 hover:border-primary/30 text-primary'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedId === id ? 'bg-white/20' : 'bg-primary/5'}`}>
                  <User size={24} />
                </div>
                {portfolio ? (
                   <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Configuré</span>
                ) : (
                   <span className="text-[10px] font-bold uppercase tracking-widest text-accent">À initialiser</span>
                )}
              </div>
              <h3 className="text-xl font-bold mb-1 uppercase tracking-tight">{id}</h3>
              <p className={`text-sm ${selectedId === id ? 'text-white/70' : 'text-primary/70'}`}>
                {id === 'landry' ? 'Développeur Full-Stack' : 'Gestionnaire de Projet'}
              </p>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {selectedId && (
          <motion.div
            key={selectedId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card rounded-[3rem] border border-primary/10 shadow-sm overflow-hidden"
          >
            <div className="p-8 border-b border-primary/5 bg-secondary/30 flex justify-between items-center">
              <h3 className="text-2xl font-serif font-bold text-primary capitalize">
                Édition Portfolio: {selectedId}
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedId(null)}
                  className="px-4 py-2 border border-primary/10 rounded-xl text-sm font-bold hover:bg-card transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>

            <div className="p-8 space-y-12">
              {/* Basic Info */}
              <PortfolioBasicInfo 
                key={`${selectedId}-basic`}
                portfolio={selectedPortfolio || { id: selectedId, profileType: selectedId === 'landry' ? 'developer' : 'manager', name: '', role: '', bio: '', email: '', expertise: [], projects: [], experience: [], education: [], certifications: [] } as MemberPortfolio}
                onSave={(data) => onUpdate(selectedId, data)}
              />

              {/* Expertise */}
              <PortfolioExpertise 
                key={`${selectedId}-expertise`}
                expertise={selectedPortfolio?.expertise || []}
                profileType={selectedPortfolio?.profileType || (selectedId === 'landry' ? 'developer' : 'manager')}
                onSave={(expertise) => onUpdate(selectedId, { expertise })}
              />

              {/* Projects */}
              <PortfolioProjects 
                key={`${selectedId}-projects`}
                projects={selectedPortfolio?.projects || []}
                onSave={(projects) => onUpdate(selectedId, { projects })}
              />

              {/* Experience */}
              <PortfolioExperienceSection 
                key={`${selectedId}-experience`}
                experience={selectedPortfolio?.experience || []}
                onSave={(experience) => onUpdate(selectedId, { experience })}
              />

              {/* Education */}
              <PortfolioEducationSection 
                key={`${selectedId}-education`}
                education={selectedPortfolio?.education || []}
                onSave={(education) => onUpdate(selectedId, { education })}
              />

              {/* Certifications */}
              <PortfolioCertifications 
                key={`${selectedId}-certifications`}
                certifications={selectedPortfolio?.certifications || []}
                onSave={(certifications) => onUpdate(selectedId, { certifications })}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PortfolioBasicInfo = ({ portfolio, onSave }: { portfolio: MemberPortfolio, onSave: (data: any) => void }) => {
  console.log('PortfolioBasicInfo prop:', portfolio);
  const [formData, setFormData] = React.useState(portfolio);

  React.useEffect(() => {
    console.log('PortfolioBasicInfo useEffect called, new portfolio:', portfolio);
    setFormData(portfolio);
  }, [portfolio]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold uppercase tracking-widest text-primary/70 flex items-center gap-2">
          <User size={14} /> Informations de base
        </h4>
        <div className="flex items-center gap-4">
          {formData.avatar && (
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 shadow-sm">
              <img src={formData.avatar} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-primary/50">Type de Profil</label>
          <select 
            value={formData.profileType || 'developer'}
            onChange={(e) => setFormData({ ...formData, profileType: e.target.value as any })}
            className="input-field"
          >
            <option value="developer">Développeur / Technique</option>
            <option value="manager">Gestionnaire de Projet / Créatif</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-primary/50">Nom Complet</label>
          <input 
            type="text" 
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input-field"
            placeholder="Ex: Landry Moutongo"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-primary/50">Rôle (Titre)</label>
          <input 
            type="text" 
            value={formData.role || ''}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="input-field"
            placeholder="Ex: Développeur Full-Stack"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-primary/50">Email professionnel</label>
          <input 
            type="email" 
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="input-field"
            placeholder="email@exemple.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-primary/50">Photo de profil</label>
          <div className="flex items-center gap-4">
             <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              id="avatar-upload"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => setFormData({ ...formData, avatar: ev.target?.result as string });
                  reader.readAsDataURL(file);
                }
              }} 
            />
            <label htmlFor="avatar-upload" className="px-4 py-2 border border-primary/20 rounded-xl text-sm font-bold hover:bg-primary/5 cursor-pointer">
              Choisir un fichier
            </label>
            <span className="text-xs text-primary/40 truncate max-w-[150px]">
              {formData.avatar ? 'Photo sélectionnée' : 'Aucun fichier'}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-primary/50">Lien du CV (PDF)</label>
          <input 
            type="text" 
            value={formData.cvUrl || ''}
            onChange={(e) => setFormData({ ...formData, cvUrl: e.target.value })}
            className="input-field"
            placeholder="https://..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-primary/50">Lien GitHub</label>
          <input 
            type="text" 
            value={formData.github || ''}
            onChange={(e) => setFormData({ ...formData, github: e.target.value })}
            className="input-field"
            placeholder="https://github.com/votre-pseudo"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-primary/50">Lien LinkedIn</label>
          <input 
            type="text" 
            value={formData.linkedin || ''}
            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
            className="input-field"
            placeholder="https://linkedin.com/in/votre-nom"
          />
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-primary/50">Bio / Introduction</label>
          <textarea 
            value={formData.bio || ''}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="input-field h-32"
            placeholder="Dites-en plus sur vous..."
          />
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <button 
          onClick={() => { onSave(formData); toast.success('Informations de base enregistrées'); }}
          className="px-8 py-3 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg shadow-primary/10 active:scale-95"
        >
          <Save size={18} /> Enregistrer cette section
        </button>
      </div>
    </div>
  );
};

const PortfolioExpertise = ({ expertise, profileType, onSave }: { expertise: any[], profileType: string, onSave: (data: any[]) => void }) => {
  const categories: ExpertiseCategory[] = profileType === 'manager' 
    ? ['Outils', 'Methodologie', 'Gestion de Projet', 'Communication', 'Design', 'Organisation']
    : ['Frontend', 'Backend', 'Database', 'Methodologie', 'API', 'Outils'];
  
  const [items, setItems] = React.useState<any[]>(() => {
    return categories.map(cat => expertise.find(e => e.category === cat) || { category: cat, skills: [] });
  });

  React.useEffect(() => {
    setItems(categories.map(cat => expertise.find(e => e.category === cat) || { category: cat, skills: [] }));
  }, [expertise, profileType]);

  return (
    <div className="space-y-6 pt-12 border-t border-primary/5">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold uppercase tracking-widest text-primary/70 flex items-center gap-2">
          <Briefcase size={14} /> Expertises
        </h4>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {items.map((item, idx) => (
          <div key={item.category} className="p-6 bg-secondary/30 rounded-[2rem] border border-primary/5 space-y-4 relative group hover:border-primary/20 transition-all">
            <div className="text-sm font-bold text-primary">{item.category}</div>
            
            {/* Skills */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                { (item.skills || []).map((skill: any, sIdx: number) => (
                  <div key={sIdx} className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-primary/10">
                    <span className="text-sm">{skill.name}</span>
                    <button onClick={() => { const newItems = [...items]; newItems[idx].skills.splice(sIdx, 1); setItems(newItems); }} className="text-red-400 hover:text-red-600">×</button>
                  </div>
                ))}
                <input 
                  type="text"
                  placeholder="+ Ajouter"
                  className="bg-transparent text-sm p-1 outline-none min-w-[100px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        const val = e.currentTarget.value;
                        if (val) {
                            const newItems = [...items];
                            newItems[idx].skills.push({ name: val, iconUrl: val.toLowerCase().replace(/\./g, '') });
                            setItems(newItems);
                            e.currentTarget.value = '';
                        }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-4">
        <button 
          onClick={() => { onSave(items); toast.success('Expertises mises à jour'); }}
          className="px-8 py-3 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg shadow-primary/10 active:scale-95"
        >
          <Save size={18} /> Enregistrer cette section
        </button>
      </div>
    </div>
  );
};

const PortfolioProjects = ({ projects, onSave }: { projects: PortfolioProject[], onSave: (data: PortfolioProject[]) => void }) => {
  const [items, setItems] = React.useState(projects);

  React.useEffect(() => {
    setItems(projects);
  }, [projects]);

  return (
    <div className="space-y-6 pt-12 border-t border-primary/5">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold uppercase tracking-widest text-primary/70 flex items-center gap-2">
          <Code size={14} /> Projets Sélectionnés
        </h4>
        <button 
          onClick={() => setItems([...items, { id: Date.now().toString(), title: '', description: '', tech: [], link: '', image: '' }])}
          className="px-4 py-2 bg-primary/5 text-primary rounded-xl hover:bg-primary/10 font-bold text-xs uppercase flex items-center gap-1 transition-all"
        >
          <Plus size={14} /> Ajouter un projet
        </button>
      </div>
      <div className="space-y-6">
        {items.map((item, idx) => (
          <div key={item.id || idx} className="p-8 bg-secondary/30 rounded-[2.5rem] border border-primary/5 relative space-y-6 group hover:border-primary/20 transition-all">
            <button 
              onClick={() => setItems(items.filter((_, i) => i !== idx))}
              className="absolute top-6 right-6 text-primary/30 hover:text-accent transition-colors p-2"
            >
              <Trash2 size={20} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Titre du projet</label>
                <input 
                  type="text" 
                  placeholder="Titre du projet"
                  value={item.title || ''}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].title = e.target.value;
                    setItems(newItems);
                  }}
                  className="input-field py-3"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Lien du projet (URL)</label>
                <input 
                  type="text" 
                  placeholder="https://..."
                  value={item.link || ''}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].link = e.target.value;
                    setItems(newItems);
                  }}
                  className="input-field py-3"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">URL de l'image de couverture</label>
                <input 
                  type="text" 
                  placeholder="https://images.unsplash.com/..."
                  value={item.image || ''}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].image = e.target.value;
                    setItems(newItems);
                  }}
                  className="input-field py-3"
                />
              </div>
              {item.image && (
                <div className="md:col-span-2 aspect-video rounded-2xl overflow-hidden border border-primary/10">
                  <img src={item.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Description courte</label>
                <textarea 
                  placeholder="Décrivez brièvement le projet..."
                  value={item.description || ''}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].description = e.target.value;
                    setItems(newItems);
                  }}
                  className="input-field py-3 h-24"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Technologies utilisées (séparées par une virgule)</label>
                <input 
                  type="text" 
                  placeholder="React, Firebase, Tailwind..."
                  value={item.tech ? item.tech.join(', ') : ''}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].tech = e.target.value.split(',').map(t => t.trim()).filter(t => t !== '');
                    setItems(newItems);
                  }}
                  className="input-field py-3"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-4">
        <button 
          onClick={() => { onSave(items); toast.success('Projets mis à jour'); }}
          className="px-8 py-3 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg shadow-primary/10 active:scale-95"
        >
          <Save size={18} /> Enregistrer cette section
        </button>
      </div>
    </div>
  );
};

const PortfolioExperienceSection = ({ experience, onSave }: { experience: PortfolioExperience[], onSave: (data: PortfolioExperience[]) => void }) => {
  const [items, setItems] = React.useState(experience);

  React.useEffect(() => {
    setItems(experience);
  }, [experience]);

  return (
    <div className="space-y-6 pt-12 border-t border-primary/5">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold uppercase tracking-widest text-primary/70 flex items-center gap-2">
          <Briefcase size={14} /> Expériences Professionnelles
        </h4>
        <button 
          onClick={() => setItems([...items, { id: Date.now().toString(), company: '', role: '', startDate: '', endDate: '', isCurrent: false, description: '' }])}
          className="px-4 py-2 bg-primary/5 text-primary rounded-xl hover:bg-primary/10 font-bold text-xs uppercase flex items-center gap-1 transition-all"
        >
          <Plus size={14} /> Ajouter une expérience
        </button>
      </div>
      <div className="space-y-6">
        {items.map((item, idx) => (
          <div key={item.id || idx} className="p-8 bg-secondary/30 rounded-[2.5rem] border border-primary/5 relative space-y-6 group hover:border-primary/20 transition-all">
            <button 
              onClick={() => setItems(items.filter((_, i) => i !== idx))}
              className="absolute top-6 right-6 text-primary/30 hover:text-accent transition-colors p-2"
            >
              <Trash2 size={20} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Entreprise</label>
                <input 
                  type="text" 
                  placeholder="Nom de l'entreprise"
                  value={item.company || ''}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].company = e.target.value;
                    setItems(newItems);
                  }}
                  className="input-field py-3"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Poste</label>
                <input 
                  type="text" 
                  placeholder="Votre rôle"
                  value={item.role || ''}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].role = e.target.value;
                    setItems(newItems);
                  }}
                  className="input-field py-3"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Date de début</label>
                <input 
                  type="date" 
                  value={item.startDate || ''}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].startDate = e.target.value;
                    setItems(newItems);
                  }}
                  className="input-field py-3"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Date de fin</label>
                <input 
                  type="date" 
                  value={item.endDate || ''}
                  disabled={item.isCurrent}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].endDate = e.target.value;
                    setItems(newItems);
                  }}
                  className="input-field py-3 disabled:opacity-30"
                />
              </div>
              <div className="flex items-center gap-2 pt-8">
                <input 
                  type="checkbox" 
                  id={`isCurrent-${idx}`}
                  checked={item.isCurrent || false}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].isCurrent = e.target.checked;
                    if (e.target.checked) newItems[idx].endDate = '';
                    setItems(newItems);
                  }}
                  className="w-4 h-4 rounded border-primary/20 text-primary focus:ring-primary/20"
                />
                <label htmlFor={`isCurrent-${idx}`} className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Poste actuel</label>
              </div>
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Description</label>
                <textarea 
                  placeholder="Détaillez vos missions principales..."
                  value={item.description || ''}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].description = e.target.value;
                    setItems(newItems);
                  }}
                  className="input-field py-3 h-24"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-4">
        <button 
          onClick={() => { onSave(items); toast.success('Expériences mises à jour'); }}
          className="px-8 py-3 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg shadow-primary/10 active:scale-95"
        >
          <Save size={18} /> Enregistrer cette section
        </button>
      </div>
    </div>
  );
};

const PortfolioEducationSection = ({ education, onSave }: { education: PortfolioEducation[], onSave: (data: PortfolioEducation[]) => void }) => {
  const [items, setItems] = React.useState(education);

  React.useEffect(() => {
    setItems(education);
  }, [education]);

  return (
    <div className="space-y-6 pt-12 border-t border-primary/5">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold uppercase tracking-widest text-primary/70 flex items-center gap-2">
          <GraduationCap size={14} /> Parcours Académique
        </h4>
        <button 
          onClick={() => setItems([...items, { id: Date.now().toString(), school: '', degree: '', startDate: '', endDate: '', description: '' }])}
          className="px-4 py-2 bg-primary/5 text-primary rounded-xl hover:bg-primary/10 font-bold text-xs uppercase flex items-center gap-1 transition-all"
        >
          <Plus size={14} /> Ajouter une formation
        </button>
      </div>
      <div className="space-y-6">
        {items.map((item, idx) => (
          <div key={item.id || idx} className="p-8 bg-secondary/30 rounded-[2.5rem] border border-primary/5 relative space-y-6 group hover:border-primary/20 transition-all">
            <button 
              onClick={() => setItems(items.filter((_, i) => i !== idx))}
              className="absolute top-6 right-6 text-primary/30 hover:text-accent transition-colors p-2"
            >
              <Trash2 size={20} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">École</label>
                <input 
                  type="text" 
                  placeholder="Nom de l'établissement"
                  value={item.school || ''}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].school = e.target.value;
                    setItems(newItems);
                  }}
                  className="input-field py-3"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Diplôme</label>
                <input 
                  type="text" 
                  placeholder="Titre du diplôme"
                  value={item.degree || ''}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].degree = e.target.value;
                    setItems(newItems);
                  }}
                  className="input-field py-3"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Date de début</label>
                <input 
                  type="date" 
                  value={item.startDate || ''}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].startDate = e.target.value;
                    setItems(newItems);
                  }}
                  className="input-field py-3"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Date de fin</label>
                <input 
                  type="date" 
                  value={item.endDate || ''}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].endDate = e.target.value;
                    setItems(newItems);
                  }}
                  className="input-field py-3"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-4">
        <button 
          onClick={() => { onSave(items); toast.success('Formation mise à jour'); }}
          className="px-8 py-3 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg shadow-primary/10 active:scale-95"
        >
          <Save size={18} /> Enregistrer cette section
        </button>
      </div>
    </div>
  );
};

const PortfolioCertifications = ({ certifications, onSave }: { certifications: PortfolioCertification[], onSave: (data: PortfolioCertification[]) => void }) => {
  const [items, setItems] = React.useState(certifications);

  React.useEffect(() => {
    setItems(certifications);
  }, [certifications]);

  return (
    <div className="space-y-6 pt-12 border-t border-primary/5">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold uppercase tracking-widest text-primary/70 flex items-center gap-2">
          <Award size={14} /> Certifications & Distinctions
        </h4>
        <button 
          onClick={() => setItems([...items, { id: Date.now().toString(), name: '', issuer: '', date: '', link: '' }])}
          className="px-4 py-2 bg-primary/5 text-primary rounded-xl hover:bg-primary/10 font-bold text-xs uppercase flex items-center gap-1 transition-all"
        >
          <Plus size={14} /> Ajouter une certification
        </button>
      </div>
      <div className="space-y-6">
        {items.map((item, idx) => (
          <div key={item.id || idx} className="p-8 bg-secondary/30 rounded-[2.5rem] border border-primary/5 relative space-y-6 group hover:border-primary/20 transition-all">
            <button 
              onClick={() => setItems(items.filter((_, i) => i !== idx))}
              className="absolute top-6 right-6 text-primary/30 hover:text-accent transition-colors p-2"
            >
              <Trash2 size={20} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Nom de la certification</label>
                <input 
                  type="text" 
                  placeholder="Titre exact"
                  value={item.name || ''}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].name = e.target.value;
                    setItems(newItems);
                  }}
                  className="input-field py-3"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Émetteur (Organisme)</label>
                <input 
                  type="text" 
                  placeholder="Ex: Google, AWS, Udacity..."
                  value={item.issuer || ''}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].issuer = e.target.value;
                    setItems(newItems);
                  }}
                  className="input-field py-3"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Date d'obtention</label>
                <input 
                  type="date" 
                  value={item.date || ''}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].date = e.target.value;
                    setItems(newItems);
                  }}
                  className="input-field py-3"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Lien de vérification (URL)</label>
                <input 
                  type="text" 
                  placeholder="https://..."
                  value={item.link || ''}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].link = e.target.value;
                    setItems(newItems);
                  }}
                  className="input-field py-3"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-4 pb-8">
        <button 
          onClick={() => { onSave(items); toast.success('Certifications mises à jour'); }}
          className="px-8 py-3 bg-primary text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg shadow-primary/10 active:scale-95"
        >
          <Save size={18} /> Enregistrer cette section
        </button>
      </div>
    </div>
  );
};
