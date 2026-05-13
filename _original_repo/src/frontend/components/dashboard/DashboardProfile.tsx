import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Phone, MapPin, Loader2, FileText, Download } from 'lucide-react';
import { User, Pattern } from '../../../types';
import { Button } from '../ui/Button';

interface DashboardProfileProps {
  user: User;
  onUpdateUser: (data: Partial<User>) => void;
  savedPatterns?: Pattern[];
}

export const DashboardProfile: React.FC<DashboardProfileProps> = ({ user, onUpdateUser, savedPatterns = [] }) => {
  const [formData, setFormData] = useState({
      name: user.name,
      email: user.email,
      phone: '+237 600 000 000', // Mock phone as it's not in User type
      address: 'Douala, Cameroun' // Mock address
  });
  const [isSaving, setIsSaving] = useState(false);

  // Update form data when user prop changes
  useEffect(() => {
      setFormData(prev => ({
          ...prev,
          name: user.name,
          email: user.email
      }));
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
      setIsSaving(true);
      // Simulate API call
      setTimeout(() => {
          onUpdateUser({
              name: formData.name,
              email: formData.email
          });
          setIsSaving(false);
      }, 1000);
  };

  return (
    <div className="bg-card rounded-[3rem] shadow-sm border border-primary/5 p-10 space-y-12">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-serif font-bold text-primary">Informations Personnelles</h3>
        <span className="px-4 py-2 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-widest">Membre depuis {user.joinDate}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-widest text-primary/40 block">Nom Complet</label>
          <div className="relative">
            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20" size={18} />
            <input 
                type="text" 
                name="name"
                value={formData.name} 
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-primary/5 rounded-2xl focus:outline-none focus:border-accent transition-all" 
            />
          </div>
        </div>
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-widest text-primary/40 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20" size={18} />
            <input 
                type="email" 
                name="email"
                value={formData.email} 
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-primary/5 rounded-2xl focus:outline-none focus:border-accent transition-all" 
            />
          </div>
        </div>
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-widest text-primary/40 block">Téléphone</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20" size={18} />
            <input 
                type="tel" 
                name="phone"
                value={formData.phone} 
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-primary/5 rounded-2xl focus:outline-none focus:border-accent transition-all" 
            />
          </div>
        </div>
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-widest text-primary/40 block">Adresse</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/20" size={18} />
            <input 
                type="text" 
                name="address"
                value={formData.address} 
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-primary/5 rounded-2xl focus:outline-none focus:border-accent transition-all" 
            />
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-primary/5 flex justify-end gap-4">
        <Button 
            variant="ghost"
            onClick={() => setFormData({
                name: user.name,
                email: user.email,
                phone: '+237 600 000 000',
                address: 'Douala, Cameroun'
            })}
            className="px-10 py-4 rounded-full font-bold text-primary hover:bg-secondary transition-all h-auto"
        >
          Annuler
        </Button>
        <Button 
            onClick={handleSubmit}
            isLoading={isSaving}
            className="bg-primary text-white px-10 py-4 rounded-full font-bold hover:bg-accent transition-all shadow-lg hover:shadow-xl flex items-center gap-2 h-auto"
        >
          {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </div>

      {/* Saved Patterns Section */}
      <div className="pt-12 border-t border-primary/5 space-y-8">
        <div className="flex items-center gap-3">
          <FileText className="text-accent" size={24} />
          <h3 className="text-2xl font-serif font-bold text-primary">Mes Patrons Générés</h3>
        </div>
        
        {savedPatterns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedPatterns.map((pattern) => (
              <div key={pattern.id} className="bg-secondary p-6 rounded-[2rem] border border-primary/5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-primary text-lg">{pattern.name}</h4>
                    <p className="text-xs text-primary/40 uppercase tracking-widest mt-1">{pattern.createdAt}</p>
                  </div>
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const blob = new Blob([pattern.content], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${pattern.name.replace(/\s+/g, '-').toLowerCase()}.md`;
                      a.click();
                    }}
                    className="p-2 bg-card text-primary rounded-full shadow-sm hover:bg-accent hover:text-white transition-colors"
                    title="Télécharger"
                  >
                    <Download size={16} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white border border-primary/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary/60">
                    {pattern.projectType}
                  </span>
                  <span className="px-3 py-1 bg-white border border-primary/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary/60">
                    {pattern.skillLevel}
                  </span>
                  {pattern.woolName && (
                    <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {pattern.woolName}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-secondary rounded-[2rem] border border-dashed border-primary/10">
            <FileText className="mx-auto text-primary/20 mb-4" size={48} />
            <p className="text-primary/40 font-serif italic">Vous n'avez pas encore enregistré de patron.</p>
          </div>
        )}
      </div>
    </div>
  );
};
