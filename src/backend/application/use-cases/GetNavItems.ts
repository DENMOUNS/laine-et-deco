import { NavItemRepository } from '../../domain/repositories/NavItemRepository';
import { NavItem } from '../../../types';
import { Result } from '../../domain/shared/Result';

export class GetNavItemsUseCase {
  constructor(private navItemRepository: NavItemRepository) {}

  async execute(): Promise<Result<NavItem[]>> {
    return this.navItemRepository.getNavItems();
  }
}
