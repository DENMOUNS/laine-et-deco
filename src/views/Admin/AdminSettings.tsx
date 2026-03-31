import React from 'react';
import { 
  Save, Globe, Mail, Bell, Shield, 
  Smartphone, Layout, Palette, Database 
} from 'lucide-react';
import { SiteConfig } from '../../types';

interface AdminSettingsProps {
  siteConfig: SiteConfig;
  setSiteConfig: (config: SiteConfig) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ 
  siteConfig, setSiteConfig, onSave, isSaving 
}) => {
  return (
    <div className="space-y-10 p-2 max-w-5xl mx-auto">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div><h3 className="text-2xl font-serif font-bold text-gray-900">Configuration du Site</h3><p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Gérez les paramètres généraux de votre boutique</p></div>
        <button onClick={onSave} disabled={isSaving} className="bg-primary text-white px-10 py-4 rounded-full font-bold flex items-center gap-3 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 hover:scale-105 active:scale-95">{isSaving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={20} />}<span>Enregistrer les modifications</span></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          {[
            { id: 'general', label: 'Général', icon: <Globe size={18} /> },
            { id: 'appearance', label: 'Apparence', icon: <Palette size={18} /> },
            { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
            { id: 'security', label: 'Sécurité', icon: <Shield size={18} /> },
            { id: 'email', label: 'Email Marketing', icon: <Mail size={18} /> },
            { id: 'mobile', label: 'Application Mobile', icon: <Smartphone size={18} /> },
          ].map((item) => (
            <button key={item.id} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${item.id === 'general' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-gray-100'}`}>{item.icon}<span>{item.label}</span></button>
          ))}
        </div>

        <div className="md:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-3"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nom de la boutique</label><input type="text" value={siteConfig.name} onChange={(e) => setSiteConfig({ ...siteConfig, name: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium" /></div>
              <div className="space-y-3"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email de contact</label><input type="email" value={siteConfig.contactEmail} onChange={(e) => setSiteConfig({ ...siteConfig, contactEmail: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium" /></div>
              <div className="space-y-3"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Téléphone</label><input type="text" value={siteConfig.contactPhone} onChange={(e) => setSiteConfig({ ...siteConfig, contactPhone: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium" /></div>
              <div className="space-y-3"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Adresse physique</label><textarea value={siteConfig.address} onChange={(e) => setSiteConfig({ ...siteConfig, address: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium min-h-[120px] resize-none"></textarea></div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
            <h4 className="text-lg font-serif font-bold text-gray-900">Réseaux Sociaux</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-3"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Facebook</label><input type="text" value={siteConfig.socialLinks.facebook} onChange={(e) => setSiteConfig({ ...siteConfig, socialLinks: { ...siteConfig.socialLinks, facebook: e.target.value } })} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium" /></div>
              <div className="space-y-3"><label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Instagram</label><input type="text" value={siteConfig.socialLinks.instagram} onChange={(e) => setSiteConfig({ ...siteConfig, socialLinks: { ...siteConfig.socialLinks, instagram: e.target.value } })} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium" /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
