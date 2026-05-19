import { create } from 'zustand';
import { SiteConfig, PromoEvent, NavItem } from '../types';
import { DEFAULT_SITE_CONFIG, DEFAULT_NAV_ITEMS } from '../siteDefaults';

interface ConfigState {
  siteConfig: SiteConfig;
  navItems: NavItem[];
  events: PromoEvent[];

  // Actions
  setSiteConfig: (config: SiteConfig) => void;
  setNavItems: (items: NavItem[]) => void;
  setEvents: (events: PromoEvent[]) => void;
  resolveNavItems: (rawNavItems: NavItem[]) => void;
}

export const useConfigStore = create<ConfigState>((set) => ({
  siteConfig: DEFAULT_SITE_CONFIG,
  navItems: DEFAULT_NAV_ITEMS,
  events: [],

  setSiteConfig: (config) => set({ siteConfig: config }),

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
