import { describe, it, expect, vi } from 'vitest';
import { GetProductsUseCase } from './GetProducts';
import { ProductRepository } from '../../domain/repositories/ProductRepository';
import { success, failure } from '../../domain/shared/Result';
import { Product } from '../../domain/entities/Product';

describe('GetProductsUseCase', () => {
  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    price: 10,
    category: 'Test',
    image: 'test.jpg',
    description: 'Test Description',
    stock: 100,
    rating: 4.5,
    isAvailable: true
  };

  it('should return products from repository on success', async () => {
    const mockRepo: ProductRepository = {
      getProducts: vi.fn().mockResolvedValue(success([mockProduct])),
      getProductById: vi.fn(),
      createProduct: vi.fn(),
      updateProduct: vi.fn(),
      deleteProduct: vi.fn()
    };

    const useCase = new GetProductsUseCase(mockRepo);
    const result = await useCase.execute();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual([mockProduct]);
    }
    expect(mockRepo.getProducts).toHaveBeenCalled();
  });

  it('should return failure if repository fails', async () => {
    const error = new Error('Repository error');
    const mockRepo: ProductRepository = {
      getProducts: vi.fn().mockResolvedValue(failure(error)),
      getProductById: vi.fn(),
      createProduct: vi.fn(),
      updateProduct: vi.fn(),
      deleteProduct: vi.fn()
    };

    const useCase = new GetProductsUseCase(mockRepo);
    const result = await useCase.execute();

    expect(result.success).toBe(false);
    if (result.success === false) {
      expect(result.error).toBe(error);
    }
  });
});
