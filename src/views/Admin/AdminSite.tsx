import React from 'react';
import { Palette, Layout, Globe, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { SiteConfig } from '../../types';

interface AdminSiteProps {
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
}

export const AdminSite: React.FC<AdminSiteProps> = ({
  siteConfig,
  setSiteConfig,
}) => {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Visual Identity */}
        <div className="xl:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-serif mb-8 flex items-center gap-3">
              <Palette className="text-primary" size={24} /> Identité Visuelle
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Couleur Primaire</label>
                <div className="flex gap-4 items-center">
                  <input 
                    type="color" 
                    value={siteConfig.primaryColor}
                    onChange={(e) => setSiteConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-16 h-16 rounded-2xl cursor-pointer border-none" 
                  />
                  <input 
                    type="text" 
                    value={siteConfig.primaryColor}
                    onChange={(e) => setSiteConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="flex-grow px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm" 
                  />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Couleur d'Accent</label>
                <div className="flex gap-4 items-center">
                  <input 
                    type="color" 
                    value={siteConfig.accentColor}
                    onChange={(e) => setSiteConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                    className="w-16 h-16 rounded-2xl cursor-pointer border-none" 
                  />
                  <input 
                    type="text" 
                    value={siteConfig.accentColor}
                    onChange={(e) => setSiteConfig(prev => ({ ...prev, accentColor: e.target.value }))}
                    className="flex-grow px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Homepage Sections */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-serif flex items-center gap-3">
                <Layout className="text-primary" size={24} /> Sections de la Page d'Accueil
              </h3>
              <button 
                onClick={() => setSiteConfig(prev => ({
                  ...prev,
                  homepageSections: [...prev.homepageSections, { id: Date.now().toString(), title: 'Nouvelle Section', type: 'custom', active: true }]
                }))}
                className="text-primary font-bold text-sm flex items-center gap-2 hover:underline"
              >
                <Plus size={16} /> Ajouter une section
              </button>
            </div>
            <div className="space-y-4">
              {siteConfig.homepageSections.map((section, idx) => (
                <div key={section.id} className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-slate-300">
                    {idx + 1}
                  </div>
                  <div className="flex-grow">
                    <input 
                      type="text" 
                      value={section.title}
                      onChange={(e) => {
                        const newSections = [...siteConfig.homepageSections];
                        newSections[idx].title = e.target.value;
                        setSiteConfig(prev => ({ ...prev, homepageSections: newSections }));
                      }}
                      className="bg-transparent font-bold text-slate-900 focus:outline-none w-full"
                    />
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">{section.type}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => {
                        const newSections = [...siteConfig.homepageSections];
                        newSections[idx].active = !newSections[idx].active;
                        setSiteConfig(prev => ({ ...prev, homepageSections: newSections }));
                      }}
                      className={`w-12 h-6 rounded-full transition-all relative ${section.active ? 'bg-primary' : 'bg-slate-200'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${section.active ? 'left-7' : 'left-1'}`} />
                    </button>
                    <button 
                      onClick={() => setSiteConfig(prev => ({
                        ...prev,
                        homepageSections: prev.homepageSections.filter(s => s.id !== section.id)
                      }))}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview / Sidebar Settings */}
        <div className="space-y-8">
          <div className="bg-primary p-8 rounded-[3rem] text-white shadow-xl shadow-primary/20">
            <h3 className="text-xl font-serif mb-6 flex items-center gap-3">
              <Globe size={24} /> Aperçu Rapide
            </h3>
            <div className="space-y-6">
              <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <div className="w-12 h-4 bg-white/20 rounded-full" />
                  <div className="flex gap-2">
                    <div className="w-4 h-4 bg-white/20 rounded-full" />
                    <div className="w-4 h-4 bg-white/20 rounded-full" />
                  </div>
                </div>
                <div className="h-24 bg-white/5 rounded-xl flex items-center justify-center mb-4">
                  <ImageIcon size={24} className="text-white/20" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-3/4 bg-white/20 rounded-full" />
                  <div className="h-3 w-1/2 bg-white/10 rounded-full" />
                </div>
                <div 
                  className="mt-6 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase tracking-widest"
                  style={{ backgroundColor: siteConfig.primaryColor }}
                >
                  Bouton Primaire
                </div>
              </div>
              <p className="text-xs text-white/60 leading-relaxed text-center">
                Ceci est une représentation simplifiée de votre thème actuel.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
            <h3 className="text-lg font-serif mb-6">Paramètres SEO</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Titre du Site</label>
                <input 
                  type="text" 
                  value={siteConfig.siteName}
                  onChange={(e) => setSiteConfig(prev => ({ ...prev, siteName: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Description</label>
                <textarea 
                  value={siteConfig.description}
                  onChange={(e) => setSiteConfig(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm h-24 resize-none" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
