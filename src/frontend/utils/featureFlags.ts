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
};

export const normalizeFeatureFlags = (
  featureFlags?: SiteConfig['featureFlags']
): Record<string, boolean> => ({
  ...DEFAULT_FEATURE_FLAGS,
  ...featureFlags,
});

export const isFeatureEnabled = (
  siteConfig: Partial<SiteConfig> | null | undefined,
  feature: string
): boolean => {
  const value = normalizeFeatureFlags(siteConfig?.featureFlags)[feature];
  return value ?? true;
};
