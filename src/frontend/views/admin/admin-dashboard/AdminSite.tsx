import React from 'react';
import { CheckCircle2, RefreshCcw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Loader } from '../../../components/Loader';
import { AdminSiteBrandingSection } from './AdminSiteBrandingSection';
import { AdminSiteHeroSection } from './AdminSiteHeroSection';
import { AdminSiteFeaturesSection } from './AdminSiteFeaturesSection';
import { AdminSiteAdBannerSection } from './AdminSiteAdBannerSection';
import { AdminSiteMarqueeSection } from './AdminSiteMarqueeSection';
import { AdminSiteHomeSection } from './AdminSiteHomeSection';
import { AdminSiteCustomSectionsSection } from './AdminSiteCustomSectionsSection';
import { AdminSiteSeoSection } from './AdminSiteSeoSection';
import { AdminSiteLoyaltySection } from './AdminSiteLoyaltySection';
import { AdminSiteMaintenanceSection } from './AdminSiteMaintenanceSection';
import { AdminSiteNewsletterSection } from './AdminSiteNewsletterSection';

export function AdminSite({ ctx }: { ctx: any }) {
  const { activeTab, siteConfig, isSaving, setIsSaving, saveAllSiteConfig } = ctx;

  if (activeTab !== 'site') return null;

  return (
    <div className="space-y-12">
      <div className="flex flex-col lg:flex-row justify-between gap-4 bg-card p-6 rounded-3xl border border-primary/10">
        <div>
          <h2 className="text-2xl font-serif text-primary">Configuration du Site</h2>
          <p className="text-sm text-primary/60">Gérez l'apparence et les fonctionnalités globales</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={saveAllSiteConfig}
            disabled={isSaving}
            className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-accent transition-all shadow-lg disabled:opacity-60"
          >
            <Save size={20} /> Tout Enregistrer
          </button>
        </div>
      </div>

      <AdminSiteBrandingSection ctx={ctx} />
      <AdminSiteHeroSection ctx={ctx} />
      <AdminSiteFeaturesSection ctx={ctx} />
      <AdminSiteAdBannerSection ctx={ctx} />
      <AdminSiteMarqueeSection ctx={ctx} />
      <AdminSiteHomeSection ctx={ctx} />
      <AdminSiteCustomSectionsSection ctx={ctx} />
      <AdminSiteSeoSection ctx={ctx} />
      <AdminSiteLoyaltySection ctx={ctx} />
      <AdminSiteMaintenanceSection ctx={ctx} />
      <AdminSiteNewsletterSection ctx={ctx} />

      <div className="flex justify-end pt-6">
        <button
          onClick={saveAllSiteConfig}
          disabled={isSaving}
          className="bg-primary text-white px-12 py-4 rounded-2xl font-bold hover:bg-accent transition-all shadow-xl flex items-center gap-3 disabled:opacity-60"
        >
          {isSaving ? <Loader text="" /> : <CheckCircle2 size={20} />}
          Enregistrer toutes les modifications
        </button>
      </div>
    </div>
  );
}
