import { NavItemRepository } from '../../domain/repositories/NavItemRepository';
import { NavItem } from '../../../types';
import { Result, success, failure } from '../../domain/shared/Result';
import { readCache, writeCache, getStaticEntityCacheKey, getTTLForEntity } from '../../../frontend/utils/cacheStorage';

export class ApiNavItemRepository implements NavItemRepository {
  private cacheKey = getStaticEntityCacheKey('nav_item', []);

  async getNavItems(): Promise<Result<NavItem[]>> {
    try {
      // 1. Fast Cache
      const cached = await readCache<NavItem[]>(this.cacheKey);
      if (cached && cached.length > 0) {
        const processed = cached
          .filter((item) => item.status === 'active')
          .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
        return success(processed);
      }

      // 2. Fast API Fetch
      const res = await fetch('/api/entity/nav_item').catch(() => null);
      if (res && res.ok) {
        const raw = await res.json().catch(() => []);
        const items: NavItem[] = Array.isArray(raw) ? raw : raw?.data || [];
        if (items.length > 0) {
          writeCache(this.cacheKey, items, getTTLForEntity('nav_item'));
        }
        const processed = items
          .filter((item) => item.status === 'active')
          .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
        return success(processed);
      }

      return success([]);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to fetch nav items'));
    }
  }

  async getNavItemById(id: string): Promise<Result<NavItem>> {
    try {
      const res = await fetch(`/api/entity/nav_item/${id}`);
      if (!res.ok) return failure(new Error('Nav item not found'));
      const item = await res.json();
      return success(item as NavItem);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to fetch nav item'));
    }
  }

  async createNavItem(item: Omit<NavItem, 'id'>): Promise<Result<NavItem>> {
    try {
      const res = await fetch('/api/entity/nav_item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!res.ok) return failure(new Error('Failed to create nav item'));
      const data = await res.json();
      return success(data as NavItem);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to create nav item'));
    }
  }

  async updateNavItem(id: string, item: Partial<NavItem>): Promise<Result<NavItem>> {
    try {
      const res = await fetch(`/api/entity/nav_item/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!res.ok) return failure(new Error('Failed to update nav item'));
      const data = await res.json();
      return success(data as NavItem);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to update nav item'));
    }
  }

  async deleteNavItem(id: string): Promise<Result<void>> {
    try {
      const res = await fetch(`/api/entity/nav_item/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) return failure(new Error('Failed to delete nav item'));
      return success(undefined);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to delete nav item'));
    }
  }
}
