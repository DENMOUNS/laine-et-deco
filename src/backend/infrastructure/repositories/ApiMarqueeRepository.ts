import { MarqueeRepository } from '../../domain/repositories/MarqueeRepository';
import { MarqueeItem } from '../../../types';
import { Result, success, failure } from '../../domain/shared/Result';
import { readCache, writeCache, getStaticEntityCacheKey, getTTLForEntity } from '../../../frontend/utils/cacheStorage';

export class ApiMarqueeRepository implements MarqueeRepository {
  private cacheKey = getStaticEntityCacheKey('marquee_item', []);

  async getMarqueeItems(): Promise<Result<MarqueeItem[]>> {
    try {
      // 1. Fast Cache
      const cached = await readCache<MarqueeItem[]>(this.cacheKey);
      if (cached && cached.length > 0) {
        const processed = cached
          .filter((item) => item.status === 'active')
          .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
        return success(processed);
      }

      // 2. Fast API Fetch
      const res = await fetch('/api/entity/marquee_item').catch(() => null);
      if (res && res.ok) {
        const raw = await res.json().catch(() => []);
        const items: MarqueeItem[] = Array.isArray(raw) ? raw : raw?.data || [];
        if (items.length > 0) {
          writeCache(this.cacheKey, items, getTTLForEntity('marquee_item'));
        }
        const processed = items
          .filter((item) => item.status === 'active')
          .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
        return success(processed);
      }

      return success([]);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to fetch marquee items'));
    }
  }

  async getMarqueeItemById(id: string): Promise<Result<MarqueeItem>> {
    try {
      const res = await fetch(`/api/entity/marquee_item/${id}`);
      if (!res.ok) return failure(new Error('Marquee item not found'));
      const item = await res.json();
      return success(item as MarqueeItem);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to fetch marquee item'));
    }
  }

  async createMarqueeItem(item: Omit<MarqueeItem, 'id'>): Promise<Result<MarqueeItem>> {
    try {
      const res = await fetch('/api/entity/marquee_item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!res.ok) return failure(new Error('Failed to create marquee item'));
      const data = await res.json();
      return success(data as MarqueeItem);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to create marquee item'));
    }
  }

  async updateMarqueeItem(id: string, item: Partial<MarqueeItem>): Promise<Result<MarqueeItem>> {
    try {
      const res = await fetch(`/api/entity/marquee_item/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!res.ok) return failure(new Error('Failed to update marquee item'));
      const data = await res.json();
      return success(data as MarqueeItem);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to update marquee item'));
    }
  }

  async deleteMarqueeItem(id: string): Promise<Result<void>> {
    try {
      const res = await fetch(`/api/entity/marquee_item/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) return failure(new Error('Failed to delete marquee item'));
      return success(undefined);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to delete marquee item'));
    }
  }
}
