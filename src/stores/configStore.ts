import { create } from 'zustand';
import { SiteConfig, PromoEvent, NavItem } from '../types';
import { DEFAULT_NAV_ITEMS, DEFAULT_SITE_CONFIG } from '../siteDefaults';
import { normalizeFeatureFlags } from '../frontend/utils/featureFlags';

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
  contactPage: {
    ...DEFAULT_SITE_CONFIG.contactPage,
    ...config.contactPage,
  },
  homeFeaturedProducts: config.homeFeaturedProducts ?? DEFAULT_SITE_CONFIG.homeFeaturedProducts,
  homeFeaturedCategories: config.homeFeaturedCategories ?? DEFAULT_SITE_CONFIG.homeFeaturedCategories,
  sliderItems: config.sliderItems ?? DEFAULT_SITE_CONFIG.sliderItems,
  customSections: config.customSections ?? DEFAULT_SITE_CONFIG.customSections,
  features: config.features ?? DEFAULT_SITE_CONFIG.features,
  featureFlags: normalizeFeatureFlags(config.featureFlags),
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
    const firestoreItems = rawNavItems || [];
    const navMap = new Map<string, NavItem>();

    // 1. Initialiser avec la liste par défaut complète
    DEFAULT_NAV_ITEMS.forEach((defItem) => {
      const key = defItem.view || defItem.id;
      navMap.set(key, defItem);
    });

    // 2. Fusionner/Surcharger avec les éléments issus de Firestore
    // On retire les champs undefined pour ne pas écraser les valeurs du default
    // (ex: position, order, status non définis dans Firestore ne doivent pas effacer le default)
    firestoreItems.forEach((item) => {
      const key = item.view || item.id;
      const existing = navMap.get(key);
      const cleanItem = Object.fromEntries(
        Object.entries(item).filter(([, v]) => v !== undefined && v !== null)
      ) as NavItem;
      if (existing) {
        navMap.set(key, { ...existing, ...cleanItem });
      } else {
        navMap.set(key, cleanItem);
      }
    });

    const items = Array.from(navMap.values());

    // Correction du nom hérité pour 'about'
    const aboutItem = items.find((i) => i.view === 'about');
    if (aboutItem && aboutItem.name === 'Notre Équipe') {
      aboutItem.name = 'À propos';
    }

    // S'assurer que 'team' existe
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

    set({ navItems: items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) });
  },
}));
