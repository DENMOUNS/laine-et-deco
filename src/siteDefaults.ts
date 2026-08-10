import type { NavItem, SiteConfig } from './types';
import { DEFAULT_FEATURE_FLAGS } from './frontend/utils/featureFlags';

/** Defaults légers pour le boot — évite d'importer tout constants.ts au chargement initial. */
// No hard-coded navigation items — frontend must read nav items from Firestore.
// If no items exist in cache or DB the UI should render an empty nav until data arrives.
export const DEFAULT_NAV_ITEMS: NavItem[] = [];

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  id: 'global',
  primaryColor: '',
  accentColor: '',
  showAdBanner: false,
  adBannerText: '',
  loyaltyConfig: {
    pointsPerPurchase: 0,
    pointsPerReview: 0,
    badges: [],
    levels: [],
  },
  homeFeaturedProducts: [],
  homeFeaturedCategories: [],
  showSlider: false,
  sliderItems: [],
  customSections: [],
  maintenance: { isActive: false, message: '' },
  branding: { primaryColor: '', secondaryColor: '' },
  features: [],
  featureFlags: { ...DEFAULT_FEATURE_FLAGS },
  seo: {
    home: { title: '', description: '' },
    shop: { title: '', description: '' },
    contact: { title: '', description: '' },
    about: { title: '', description: '' },
    team: { title: '', description: '' },
    cart: { title: '', description: '' },
    wishlist: { title: '', description: '' },
    comparison: { title: '', description: '' },
    lookbook: { title: '', description: '' },
    'custom-order': { title: '', description: '' },
    'knitting-companion': { title: '', description: '' },
    'pattern-generator': { title: '', description: '' },
    blog: { title: '', description: '' },
    calculator: { title: '', description: '' },
    'volume-calculator': { title: '', description: '' },
    faq: { title: '', description: '' },
    loyalty: { title: '', description: '' },
  },
  hero: {
    title: '',
    description: '',
    backgroundImages: [],
    ctaText: '',
  },
  marqueeItems: [],
  newsletterPopup: {
    isActive: false,
    title: '',
    message: '',
    delay: 0,
    image: '',
  },
};
