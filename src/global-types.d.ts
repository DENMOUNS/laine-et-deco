import type {
  AbandonedCart,
  City,
  Coupon,
  CustomerGroup,
  Email,
  Expense,
  FAQ,
  MaintenanceModeConfig,
  NavItem,
  NewsletterSubscriber,
  CatalogPriceRule,
  Currency,
  RMA,
  Role,
  SiteColor,
  TaxRule,
  PromoEvent,
  User
} from './types';

declare global {
  type AbandonedCart = import('./types').AbandonedCart;
  type City = import('./types').City;
  type Coupon = import('./types').Coupon;
  type CustomerGroup = import('./types').CustomerGroup;
  type Email = import('./types').Email;
  type Expense = import('./types').Expense;
  type FAQ = import('./types').FAQ;
  type MaintenanceModeConfig = import('./types').MaintenanceModeConfig;
  type NavItem = import('./types').NavItem;
  type NewsletterSubscriber = import('./types').NewsletterSubscriber;
  type CatalogPriceRule = import('./types').CatalogPriceRule;
  type Currency = import('./types').Currency;
  type RMA = import('./types').RMA;
  type Role = import('./types').Role;
  type SiteColor = import('./types').SiteColor;
  type TaxRule = import('./types').TaxRule;
  type PromoEvent = import('./types').PromoEvent;
  type Order = import('./types').Order;
  type UserType = User;
  type PageContent = {
    id: string;
    title: string;
    page?: string;
    slug?: string;
    content: string;
    notes?: string;
    status: 'active' | 'inactive';
    createdAt?: string;
    updatedAt?: string;
  };
}
