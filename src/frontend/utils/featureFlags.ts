import type { SiteConfig } from '../../types';

export const DEFAULT_FEATURE_FLAGS: Record<string, boolean> = {
  lookbook: true,
  blog: true,
  loyalty: true,
  faq: true,
  customOrder: true,
  knittingCompanion: true,
  patternGenerator: true,
  comparison: true,
  wishlist: true,
  team: true,
  about: true,
  contact: true,
  calculator: true,
  volumeCalculator: true,
  community: true,
  shop: true,
  flashSales: true,
  packs: true,
};

export const normalizeFeatureFlags = (
  featureFlags?: SiteConfig['featureFlags']
): Record<string, boolean> => ({
  ...DEFAULT_FEATURE_FLAGS,
  ...featureFlags,
});

export const VIEW_TO_FEATURE_KEY: Record<string, string> = {
  'shop': 'shop',
  'lookbook': 'lookbook',
  'knitting-companion': 'knittingCompanion',
  'pattern-generator': 'patternGenerator',
  'configurator': 'customOrder',
  'custom-order': 'customOrder',
  'blog': 'blog',
  'calculator': 'calculator',
  'volume-calculator': 'volumeCalculator',
  'comparison': 'comparison',
  'community': 'community',
  'about': 'about',
  'team': 'team',
  'contact': 'contact',
  'faq': 'faq',
  'packs': 'packs',
  'flashSales': 'flashSales',
};

/**
 * Une fonctionnalité est désactivée SI ET SEULEMENT SI son flag est explicitement false dans siteConfig.featureFlags.
 */
export const isFeatureDisabled = (
  siteConfig: Partial<SiteConfig> | null | undefined,
  feature: string
): boolean => {
  if (!siteConfig || !siteConfig.featureFlags) return false;
  const featureKey = VIEW_TO_FEATURE_KEY[feature] || feature;
  return siteConfig.featureFlags[featureKey] === false;
};

/**
 * Pour afficher une fonctionnalité ou charger ses données,
 * on vérifie qu'elle n'est PAS désactivée (!isFeatureDisabled).
 */
export const isFeatureEnabled = (
  siteConfig: Partial<SiteConfig> | null | undefined,
  feature: string
): boolean => {
  return !isFeatureDisabled(siteConfig, feature);
};

export const isViewEnabled = isFeatureEnabled;


