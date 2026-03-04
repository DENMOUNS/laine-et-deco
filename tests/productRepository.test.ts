import { describe, it, expect } from 'vitest';
import { MockProductRepository } from '../src/infrastructure/repositories/MockProductRepository';

describe('ProductRepository', () => {
  const repo = new MockProductRepository();

  it('should return all products', async () => {
    const result = await repo.getProducts();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.length).toBeGreaterThan(0);
    }
  });

  it('should find product by id', async () => {
    const result = await repo.getProductById('p1');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data?.id).toBe('p1');
    }
  });

  it('should return failure for non-existent product', async () => {
    const result = await repo.getProductById('999');
    expect(result.success).toBe(false);
  });
});
