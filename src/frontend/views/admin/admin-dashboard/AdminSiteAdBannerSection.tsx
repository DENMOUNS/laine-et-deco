import React, { useState } from 'react';
import { Bell, Globe, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { translateContentWithAi } from '../../../utils/aiTranslator';

export function AdminSiteAdBannerSection({ ctx }: { ctx: any }) {
  const { saveSiteSection, setSiteConfig, siteConfig } = ctx;
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!siteConfig.adBannerText) {
      toast.error("Veuillez d'abord saisir le texte de l'annonce en français");
      return;
    }
    setIsTranslating(true);
    try {
      const res = await translateContentWithAi(
        { text: siteConfig.adBannerText },
        'en',
        'Top announcement promotion banner bar'
      );
      if (res?.text) {
        setSiteConfig((prev: any) => ({ ...prev, adBannerText_en: res.text }));
        toast.success('Traduction anglaise générée !');
      }
    } catch {
      toast.error('Erreur lors de la traduction');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <>
      <section className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/5 text-primary rounded-2xl"><Bell size={24} /></div>
            <div>
              <h3 className="text-xl font-serif text-primary">Bannière d'Annonce (Haut)</h3>
              <p className="text-xs text-primary/60">Gérez le message Promotionnel tout en haut du site</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => saveSiteSection(['showAdBanner', 'adBannerText', 'adBannerText_en'], 'Bannière d\'Annonce')}
              className="px-4 py-2 bg-secondary text-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/5 transition-colors cursor-pointer"
            >
              Enregistrer Section
            </button>
            <button 
              onClick={() => setSiteConfig((prev: any) => ({ ...prev, showAdBanner: !prev.showAdBanner }))}
              className={`w-14 h-8 rounded-full relative transition-colors cursor-pointer ${siteConfig.showAdBanner ? 'bg-primary' : 'bg-secondary/50'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-card rounded-full transition-all ${siteConfig.showAdBanner ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>
        
        {siteConfig.showAdBanner && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Texte de l'annonce (Français)</label>
              <input 
                type="text" 
                className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary text-primary" 
                value={siteConfig.adBannerText || ''}
                onChange={(e) => setSiteConfig((prev: any) => ({ ...prev, adBannerText: e.target.value }))}
                placeholder="Ex: 🎉 Livraison gratuite ce weekend avec le code FREE..."
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-1.5">
                  <Globe size={13} />
                  <span>Texte de l'annonce (Anglais)</span>
                </label>
                <button
                  type="button"
                  onClick={handleTranslate}
                  disabled={isTranslating}
                  className="px-3 py-1 bg-accent/10 hover:bg-accent/20 text-accent font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isTranslating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                  <span>Auto-traduire IA</span>
                </button>
              </div>
              <input 
                type="text" 
                className="w-full px-6 py-4 bg-secondary/50 border border-accent/30 rounded-2xl focus:outline-none focus:border-accent text-primary" 
                value={siteConfig.adBannerText_en || ''}
                onChange={(e) => setSiteConfig((prev: any) => ({ ...prev, adBannerText_en: e.target.value }))}
                placeholder="Ex: 🎉 Free shipping this weekend with code FREE..."
              />
            </div>
          </div>
        )}
      </section>
    </>
  );
}
