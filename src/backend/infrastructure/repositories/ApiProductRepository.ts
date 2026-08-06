import { ProductRepository } from '../../domain/repositories/ProductRepository';
import { Product } from '../../domain/entities/Product';
import { Result, success, failure } from '../../domain/shared/Result';

export class ApiProductRepository implements ProductRepository {
  async getProducts(): Promise<Result<Product[]>> {
    try {
      const res = await fetch('/api/entity/product');
      if (!res.ok) return failure(new Error('Failed to fetch products'));
      const products = await res.json();
      return success(products as Product[]);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to fetch products'));
    }
  }

  async getProductById(id: string): Promise<Result<Product>> {
    try {
      const res = await fetch(`/api/entity/product/${id}`);
      if (!res.ok) return failure(new Error('Product not found'));
      const doc = await res.json();
      return success(doc as Product);
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
