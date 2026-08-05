import { create } from 'zustand';
import { SiteConfig, PromoEvent, NavItem } from '../types';
import { DEFAULT_NAV_ITEMS, DEFAULT_SITE_CONFIG } from '../siteDefaults';

interface ConfigState {
  siteConfig: SiteConfig;
  navItems: NavItem[];
  events: PromoEvent[];

  // Actions
  setSiteConfig: (config: SiteConfig | ((previous: SiteConfig) => SiteConfig)) => void;
  setNavItems: (items: NavItem[]) => void;
  setEvents: (events: PromoEvent[]) => void;
  resolveNavItems: (rawNavItems: NavItem[]) => void;
}

const normalizeSiteConfig = (config: Partial<SiteConfig> = {}): SiteConfig => ({
  ...DEFAULT_SITE_CONFIG,
  ...config,
  loyaltyConfig: {
    ...DEFAULT_SITE_CONFIG.loyaltyConfig,
    ...config.loyaltyConfig,
    badges: config.loyaltyConfig?.badges ?? DEFAULT_SITE_CONFIG.loyaltyConfig.badges,
    levels: config.loyaltyConfig?.levels ?? DEFAULT_SITE_CONFIG.loyaltyConfig.levels,
  },
  maintenance: {
    ...DEFAULT_SITE_CONFIG.maintenance,
    ...config.maintenance,
  },
  branding: {
    ...DEFAULT_SITE_CONFIG.branding,
    ...config.branding,
  },
  seo: {
    ...DEFAULT_SITE_CONFIG.seo,
    ...config.seo,
  },
  hero: {
    ...DEFAULT_SITE_CONFIG.hero,
    ...config.hero,
    backgroundImages: config.hero?.backgroundImages ?? DEFAULT_SITE_CONFIG.hero.backgroundImages,
  },
  newsletterPopup: {
    ...DEFAULT_SITE_CONFIG.newsletterPopup,
    ...config.newsletterPopup,
  },
  homeFeaturedProducts: config.homeFeaturedProducts ?? DEFAULT_SITE_CONFIG.homeFeaturedProducts,
  homeFeaturedCategories: config.homeFeaturedCategories ?? DEFAULT_SITE_CONFIG.homeFeaturedCategories,
  sliderItems: config.sliderItems ?? DEFAULT_SITE_CONFIG.sliderItems,
  customSections: config.customSections ?? DEFAULT_SITE_CONFIG.customSections,
  features: config.features ?? DEFAULT_SITE_CONFIG.features,
  marqueeItems: config.marqueeItems ?? DEFAULT_SITE_CONFIG.marqueeItems,
});

export const useConfigStore = create<ConfigState>((set) => ({
  siteConfig: DEFAULT_SITE_CONFIG,
  navItems: DEFAULT_NAV_ITEMS,
  events: [],

  setSiteConfig: (config) =>
    set((state) => ({
      siteConfig: normalizeSiteConfig(
        typeof config === 'function' ? config(state.siteConfig) : config
      ),
    })),

  setNavItems: (items) => set({ navItems: items }),

  setEvents: (events) => set({ events }),

  resolveNavItems: (rawNavItems) => {
    const items = [...rawNavItems];

    // Fix legacy name for 'about'
    const aboutItem = items.find((i) => i.view === 'about');
    if (aboutItem && aboutItem.name === 'Notre Équipe') {
      aboutItem.name = 'À propos';
    }

    // Ensure 'team' exists in sidebar
    if (!items.find((i) => i.view === 'team')) {
      items.push({
        id: 'nav-11-5',
        name: 'Équipe',
        view: 'team',
        order: 11.5,
        status: 'active',
        position: 'side',
        createdAt: '2024-01-01T00:00:00Z',
      });
    }

    set({ navItems: items });
  },
}));
