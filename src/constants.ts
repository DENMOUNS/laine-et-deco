// Minimal compatibility shim for removed constants.ts
// Exports empty arrays for legacy synchronous imports to avoid runtime errors.
// IMPORTANT: This file is temporary — migrate code to use `src/frontend/services/dataService.ts`.

export const BADGES: any[] = [];
export const ADMIN_ROLES: any[] = [];
export const PRODUCTS: any[] = [];
export const NAV_ITEMS: any[] = [];
export const CATEGORIES: any[] = [];
export const PACKS: any[] = [];
export const BLOG_POSTS: any[] = [];
export const REVIEWS: any[] = [];
export const FAQ_ITEMS: any[] = [];
export const COMMUNITY_POSTS: any[] = [];
export const LOOKBOOK_POSTS: any[] = [];
export const INITIAL_PORTFOLIOS: any[] = [];
export const COUPONS: any[] = [];
export const PROMO_EVENTS: any[] = [];
export const DEFAULT_FLASH_SALES: any[] = [];
export const SHIPPING_RULES: any[] = [];
export const TAX_RULES: any[] = [];
export const CATALOG_PRICE_RULES: any[] = [];
export const CURRENCIES: any[] = [];
export const CUSTOMER_GROUPS: any[] = [];
export const INITIAL_CUSTOMER_GROUPS = CUSTOMER_GROUPS;
export const NOTIFICATIONS: any[] = [];
export const CHAT_MESSAGES: any[] = [];
export const CONVERSATIONS: any[] = [];
export const EMAILS: any[] = [];
export const PUSH_NOTIFICATIONS: any[] = [];
export const SUBSCRIBERS: any[] = [];
export const EXPENSES: any[] = [];
export const RMAS: any[] = [];
export const ABANDONED_CARTS: any[] = [];
export const INITIAL_CITIES: any[] = [];
export const USERS: any[] = [];
export const ORDERS: any[] = [];
export const INITIAL_NAV_ITEMS = NAV_ITEMS;

export default {};
