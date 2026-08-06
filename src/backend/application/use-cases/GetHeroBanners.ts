import { HeroBannerRepository } from '../../domain/repositories/HeroBannerRepository';
import { HeroBannerConfig } from '../../../types';
import { Result } from '../../domain/shared/Result';

export class GetHeroBannersUseCase {
  constructor(private heroBannerRepository: HeroBannerRepository) {}

  async execute(): Promise<Result<HeroBannerConfig[]>> {
    return this.heroBannerRepository.getHeroBanners();
  }
}
