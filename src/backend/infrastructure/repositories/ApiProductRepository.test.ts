import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiProductRepository } from './ApiProductRepository';

describe('ApiProductRepository', () => {
  let repository: ApiProductRepository;

  beforeEach(() => {
    repository = new ApiProductRepository();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should fetch products and return them successfully', async () => {
    const mockData = [
      {
        id: '1',
        name: 'Product 1',
        isNew: true,
        colors: ['red', 'blue'],
        reviews: [{ id: 'r1', rating: 5, comment: 'Great' }]
      }
    ];

    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData)
    });

    const result = await repository.getProducts();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].id).toBe('1');
      expect(result.data[0].isNew).toBe(true);
      expect(result.data[0].colors).toEqual(['red', 'blue']);
      expect(result.data[0].reviews).toEqual([{ id: 'r1', rating: 5, comment: 'Great' }]);
    }
    expect(fetch).toHaveBeenCalledWith('/api/entity/product');
  });

  it('should return failure if fetch fails', async () => {
    (fetch as any).mockResolvedValue({
      ok: false
    });

    const result = await repository.getProducts();

    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.error.message).toBe('Failed to fetch products');
    }
  });
});
