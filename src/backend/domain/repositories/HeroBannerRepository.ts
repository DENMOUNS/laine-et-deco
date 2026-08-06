import { HeroBannerConfig } from '../../../types';
import { Result } from '../shared/Result';

export interface HeroBannerRepository {
  getHeroBanners(): Promise<Result<HeroBannerConfig[]>>;
  getHeroBannerById(id: string): Promise<Result<HeroBannerConfig>>;
  createHeroBanner(banner: Omit<HeroBannerConfig, 'id'>): Promise<Result<HeroBannerConfig>>;
  updateHeroBanner(id: string, banner: Partial<HeroBannerConfig>): Promise<Result<HeroBannerConfig>>;
  deleteHeroBanner(id: string): Promise<Result<void>>;
}
