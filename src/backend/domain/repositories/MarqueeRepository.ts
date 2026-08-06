import { MarqueeItem } from '../../../types';
import { Result } from '../shared/Result';

export interface MarqueeRepository {
  getMarqueeItems(): Promise<Result<MarqueeItem[]>>;
  getMarqueeItemById(id: string): Promise<Result<MarqueeItem>>;
  createMarqueeItem(item: Omit<MarqueeItem, 'id'>): Promise<Result<MarqueeItem>>;
  updateMarqueeItem(id: string, item: Partial<MarqueeItem>): Promise<Result<MarqueeItem>>;
  deleteMarqueeItem(id: string): Promise<Result<void>>;
}
