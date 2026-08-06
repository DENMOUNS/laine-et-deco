import { NavItem } from '../../../types';
import { Result } from '../shared/Result';

export interface NavItemRepository {
  getNavItems(): Promise<Result<NavItem[]>>;
  getNavItemById(id: string): Promise<Result<NavItem>>;
  createNavItem(item: Omit<NavItem, 'id'>): Promise<Result<NavItem>>;
  updateNavItem(id: string, item: Partial<NavItem>): Promise<Result<NavItem>>;
  deleteNavItem(id: string): Promise<Result<void>>;
}
