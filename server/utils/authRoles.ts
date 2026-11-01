import { db } from '../firebaseAdmin.js';
import retryFirestoreOperation from './firestoreRetry.js';

export type UserRole =
  | 'super-admin'
  | 'admin'
  | 'editor'
  | 'stock-manager'
  | 'support-client'
  | 'customer';

export const VALID_ROLES: readonly UserRole[] = [
  'super-admin',
  'admin',
  'editor',
  'stock-manager',
  'support-client',
  'customer',
] as const;

export const isUserRole = (role: unknown): role is UserRole => {
  return typeof role === 'string' && (VALID_ROLES as readonly string[]).includes(role);
};

export const getSuperAdminEmails = (): string[] => {
  const envEmails =
    process.env.SUPER_ADMIN_EMAILS ||
    'landrymoutongo97@gmail.com,doloreskenne6@gmail.com,landrymouns@gmail.com';
  return envEmails
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
};

export const isSuperAdminEmail = (email?: string | null): boolean => {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.trim().toLowerCase();
  return getSuperAdminEmails().includes(normalized);
};

export const isSuperAdmin = (role: UserRole | null | undefined): boolean => role === 'super-admin';
export const isAdmin = (role: UserRole | null | undefined): boolean => role === 'admin';
export const isEditor = (role: UserRole | null | undefined): boolean => role === 'editor';
export const isStockManager = (role: UserRole | null | undefined): boolean => role === 'stock-manager';
export const isSupport = (role: UserRole | null | undefined): boolean => role === 'support-client';

export const isAdminLevel = (role: UserRole | null | undefined): boolean =>
  isSuperAdmin(role) || isAdmin(role) || isEditor(role);

export const isStaff = (role: UserRole | null | undefined): boolean =>
  isSuperAdmin(role) || isAdmin(role) || isEditor(role) || isStockManager(role) || isSupport(role);

export async function resolveUserRole(
  uid: string,
  email?: string,
  existingRole?: string,
  customClaims?: any
): Promise<UserRole> {
  // 1. Check custom claims if set by Firebase Auth Admin
  if (customClaims) {
    if (customClaims.role && isUserRole(customClaims.role)) {
      return customClaims.role;
    }
    if (customClaims.admin === true || customClaims.superAdmin === true) {
      return 'super-admin';
    }
  }

  // 2. Exact match against configured super admin email whitelist
  if (isSuperAdminEmail(email)) {
    return 'super-admin';
  }

  // 3. Existing valid role already parsed
  if (existingRole && isUserRole(existingRole) && existingRole !== 'customer') {
    return existingRole;
  }

  if (!db) {
    return 'customer';
  }

  try {
    let resolvedRole: string | undefined | null = null;

    // Check user document directly by UID
    const userSnap = await retryFirestoreOperation<any>(() => db!.collection('user').doc(uid).get());
    if (userSnap.exists) {
      resolvedRole = userSnap.data()?.role;
    }

    // Fallback: Query by email if role wasn't found in doc(uid)
    if (!resolvedRole && email) {
      const emailQuery = await retryFirestoreOperation<any>(() =>
        db!.collection('user').where('email', '==', email.trim().toLowerCase()).limit(1).get()
      );
      if (!emailQuery.empty) {
        resolvedRole = emailQuery.docs[0].data()?.role;
      }
    }

    if (isUserRole(resolvedRole)) {
      return resolvedRole;
    }
  } catch (err) {
    console.error('[authRoles] Error resolving user role from Firestore:', err);
  }

  return 'customer';
}

export function isResourceOwner(resource: any, uid: string | null | undefined): boolean {
  if (!uid || !resource || typeof resource !== 'object') return false;
  return (
    resource.userId === uid ||
    resource.customerId === uid ||
    resource.uid === uid ||
    resource.user_id === uid ||
    resource.id === uid
  );
}
