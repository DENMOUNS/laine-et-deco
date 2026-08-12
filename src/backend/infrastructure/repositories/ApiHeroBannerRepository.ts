import { HeroBannerRepository } from '../../domain/repositories/HeroBannerRepository';
import { HeroBannerConfig } from '../../../types';
import { Result, success, failure } from '../../domain/shared/Result';
import { readCache, writeCache, removeCache, getStaticEntityCacheKey, getTTLForEntity } from '../../../frontend/utils/cacheStorage';

export class ApiHeroBannerRepository implements HeroBannerRepository {
  private cacheKey = 'staticEntity:hero_banner:v3';

  async getHeroBanners(): Promise<Result<HeroBannerConfig[]>> {
    try {
      const cached = await readCache<HeroBannerConfig[]>(this.cacheKey);
      if (cached && cached.length > 0) {
        const processed = cached
          .filter((b) => !b.status || ['active', 'actif', 'true', '1', true].includes(b.status as any))
          .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
        return success(processed);
      }

      const res = await fetch('/api/entity/hero_banner').catch(() => null);
      if (res && res.ok) {
        const raw = await res.json().catch(() => []);
        const banners: HeroBannerConfig[] = Array.isArray(raw) ? raw : raw?.data || [];
        if (banners.length > 0) {
          writeCache(this.cacheKey, banners, getTTLForEntity('hero_banner'));
        }
        const processed = banners
          .filter((b) => !b.status || ['active', 'actif', 'true', '1', true].includes(b.status as any))
          .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
        return success(processed);
      }

      return success([]);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to fetch hero banners'));
    }
  }

  async getHeroBannerById(id: string): Promise<Result<HeroBannerConfig>> {
    try {
      const res = await fetch(`/api/entity/hero_banner/${id}`);
      if (!res.ok) return failure(new Error('Hero banner not found'));
      const banner = await res.json();
      return success(banner as HeroBannerConfig);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to fetch hero banner'));
    }
  }

  async createHeroBanner(banner: Omit<HeroBannerConfig, 'id'>): Promise<Result<HeroBannerConfig>> {
    try {
      const res = await fetch('/api/entity/hero_banner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banner),
      });
      if (!res.ok) return failure(new Error('Failed to create hero banner'));
      const data = await res.json();
      await removeCache(this.cacheKey);
      return success(data as HeroBannerConfig);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to create hero banner'));
    }
  }

  async updateHeroBanner(id: string, banner: Partial<HeroBannerConfig>): Promise<Result<HeroBannerConfig>> {
    try {
      const res = await fetch(`/api/entity/hero_banner/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banner),
      });
      if (!res.ok) return failure(new Error('Failed to update hero banner'));
      const data = await res.json();
      await removeCache(this.cacheKey);
      return success(data as HeroBannerConfig);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to update hero banner'));
    }
  }

  async deleteHeroBanner(id: string): Promise<Result<void>> {
    try {
      const res = await fetch(`/api/entity/hero_banner/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) return failure(new Error('Failed to delete hero banner'));
      await removeCache(this.cacheKey);
      return success(undefined);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to delete hero banner'));
    }
  }
}
