import { ProductRepository } from '../../domain/repositories/ProductRepository';
import { Product } from '../../domain/entities/Product';
import { Result, success, failure } from '../../domain/shared/Result';
import { PRODUCTS } from '../../../constants';

export class ApiProductRepository implements ProductRepository {
  async getProducts(): Promise<Result<Product[]>> {
    try {
      return success(PRODUCTS);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to fetch products'));
    }
  }

  async getProductById(id: string): Promise<Result<Product>> {
    try {
      const product = PRODUCTS.find(p => p.id === id);
      if (!product) return failure(new Error('Product not found'));
      return success(product);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to fetch product'));
    }
  }

  async createProduct(product: Omit<Product, 'id'>): Promise<Result<Product>> {
    return failure(new Error('Not implemented'));
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Result<Product>> {
    return failure(new Error('Not implemented'));
  }

  async deleteProduct(id: string): Promise<Result<void>> {
    return failure(new Error('Not implemented'));
  }
}
