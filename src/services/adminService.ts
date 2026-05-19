/**
 * Admin Business Logic Service
 * Pure functions and Firestore operations for the admin dashboard.
 * Extracts business logic from useAdminDashboardContext.
 */

import { updateDoc, doc, getDocs, collection, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../backend/firebase';
import { toast } from 'sonner';
import { SiteConfig, Order, PromoEvent, Coupon, City, FAQ, CatalogPriceRule } from '../types';
import { BADGES, ADMIN_ROLES as INITIAL_ADMIN_ROLES } from '../constants';

// ── Date Formatting ──

export function formatFirestoreDate(date: any): string {
  if (!date) return 'N/A';
  if (typeof date.toDate === 'function') return date.toDate().toLocaleString('fr-FR');
  if (typeof date === 'object' && date.seconds !== undefined) return new Date(date.seconds * 1000).toLocaleString('fr-FR');
  if (date instanceof Date) return date.toLocaleString('fr-FR');
  if (typeof date === 'string') {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return date;
      return d.toLocaleString('fr-FR');
    } catch { return date; }
  }
  return 'N/A';
}

// ── Sorting ──

export function sortByDate<T extends { createdAt?: any }>(data: T[]): T[] {
  return [...data].sort((a, b) => {
    const getVal = (item: any) => {
      if (!item.createdAt) return 0;
      if (item.createdAt.toDate) return item.createdAt.toDate().getTime();
      return new Date(item.createdAt).getTime();
    };
    return getVal(b) - getVal(a);
  });
}

// ── Site Config Operations ──

export function normalizeSiteConfig(rawConfig: any, fallback: SiteConfig): SiteConfig {
  return {
    ...rawConfig,
    loyaltyConfig: {
      pointsPerPurchase: rawConfig.loyaltyConfig?.pointsPerPurchase ?? 10,
      pointsPerReview: rawConfig.loyaltyConfig?.pointsPerReview ?? 50,
      badges: rawConfig.loyaltyConfig?.badges?.length > 0 ? rawConfig.loyaltyConfig.badges : BADGES
    }
  };
}

export async function saveSiteSection(siteConfig: SiteConfig, keys: string[], label: string): Promise<void> {
  try {
    if (siteConfig.id) {
      const updateData: any = { updatedAt: new Date().toISOString() };
      keys.forEach(k => { updateData[k] = (siteConfig as any)[k]; });
      await updateDoc(doc(db, 'site_config', siteConfig.id), updateData);
      toast.success(`${label} : Enregistré avec succès`);
    }
  } catch (err) {
    toast.error("Erreur lors de l'enregistrement");
  }
}

export async function saveAllSiteConfig(siteConfig: SiteConfig): Promise<void> {
  try {
    if (siteConfig.id) {
      await updateDoc(doc(db, 'site_config', siteConfig.id), {
        ...siteConfig,
        updatedAt: new Date().toISOString()
      });
      toast.success('Toute la configuration a été enregistrée');
    }
  } catch (err) {
    toast.error("Erreur lors de l'enregistrement global");
  }
}

// ── CRUD Helpers ──

export function handleEntityEdit<T extends { id?: string }>(
  entity: T,
  setSelected: (e: T) => void,
  setEditorOpen: (open: boolean) => void
) {
  setSelected(entity);
  setEditorOpen(true);
}

export function handleEntitySave<T extends { id?: string }>(
  entity: T,
  existingList: T[],
  updateFn: (id: string, data: T) => void,
  addFn: (data: T) => void,
  setEditorOpen: (open: boolean) => void
) {
  if (existingList.find(e => e.id === entity.id)) {
    updateFn(entity.id!, entity);
  } else {
    addFn(entity);
  }
  setEditorOpen(false);
}

export function handleEntityDelete(
  id: string,
  deleteFn: (id: string) => void,
  confirmMessage: string,
  successMessage: string
) {
  if (window.confirm(confirmMessage)) {
    deleteFn(id);
    toast.success(successMessage);
  }
}

// ── Stats Calculations ──

export function calculateAdminStats(orders: Order[], users: any[], analytics: any[]) {
  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrdersCount = orders.length;
  const totalCustomers = users.length;
  const totalVisitors = analytics.find(a => a.id === 'visitors')?.count || 0;
  const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalSales / totalOrdersCount) : 0;

  return { totalSales, totalOrdersCount, totalCustomers, totalVisitors, averageOrderValue };
}

// ── Permissions ──

export function getUserPermissions(userRole: string, roles: any[]): {
  permissions: string[];
  isSuperAdmin: boolean;
  hasPermission: (permission?: string) => boolean;
} {
  const roleData = roles.find((r: any) => (r.slug || r.id) === userRole);
  const permissions = roleData?.permissions || [];
  const isSuperAdmin = userRole === 'super-admin' || permissions.includes('all');

  const hasPermission = (permission?: string) => {
    if (isSuperAdmin) return true;
    if (!permission) return true;
    if (permission === 'super-admin') return isSuperAdmin;
    return permissions.includes(permission);
  };

  return { permissions, isSuperAdmin, hasPermission };
}

export function filterMenuByPermissions(
  menuItems: any[],
  hasPermission: (permission?: string) => boolean
): any[] {
  return menuItems.filter(item => {
    if (item.isHeader) {
      const index = menuItems.indexOf(item);
      let hasPermittedChild = false;
      for (let i = index + 1; i < menuItems.length; i++) {
        if (menuItems[i].isHeader) break;
        if (hasPermission(menuItems[i].permission)) {
          hasPermittedChild = true;
          break;
        }
      }
      return hasPermittedChild;
    }
    return hasPermission(item.permission);
  });
}

// ── Auto-seed ──

export async function autoSeedIfEmpty(seedFirebaseFn: () => Promise<void>): Promise<void> {
  if (!db) return;
  try {
    // Seed roles if empty
    const rolesSnapshot = await getDocs(collection(db, 'admin_role'));
    if (rolesSnapshot.empty) {
      for (const role of INITIAL_ADMIN_ROLES) {
        await setDoc(doc(db, 'admin_role', role.id), {
          ...role,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    }

    const snapshot = await getDocs(collection(db, 'product'));
    if (snapshot.empty) {
      toast.info('Initialisation automatique des données en cours...');
      await seedFirebaseFn();
      toast.success('Base de données initialisée avec succès !');
    }
  } catch (e) {
    console.error("Auto-seed failed", e);
  }
}

// ── Nav Items Defaults ──

export function applyNavItemDefaults(navItems: any[]): any[] {
  return navItems.map(item => ({
    ...item,
    order: item.order ?? 1,
    status: item.status ?? 'active',
    createdAt: item.createdAt || new Date().toISOString()
  }));
}

export function applyCatalogRuleDefaults(rules: any[]): any[] {
  return rules.map(rule => ({
    ...rule,
    createdAt: rule.createdAt || new Date().toISOString()
  }));
}
