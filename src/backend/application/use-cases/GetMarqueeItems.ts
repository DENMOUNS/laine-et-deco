import { MarqueeRepository } from '../../domain/repositories/MarqueeRepository';
import { MarqueeItem } from '../../../types';
import { Result } from '../../domain/shared/Result';

export class GetMarqueeItemsUseCase {
  constructor(private marqueeRepository: MarqueeRepository) {}

  async execute(): Promise<Result<MarqueeItem[]>> {
    return this.marqueeRepository.getMarqueeItems();
  }
}
