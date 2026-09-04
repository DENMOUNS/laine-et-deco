import { ProductRepository } from '../../domain/repositories/ProductRepository';
import { Product } from '../../domain/entities/Product';
import { Result, success, failure } from '../../domain/shared/Result';
import { readCache, writeCache, getStaticEntityCacheKey, getTTLForEntity } from '../../../frontend/utils/cacheStorage';

export class ApiProductRepository implements ProductRepository {
  private cacheKey = getStaticEntityCacheKey('product', []);

  async getProducts(): Promise<Result<Product[]>> {
    try {
      const cached = await readCache<Product[]>(this.cacheKey);
      if (cached && cached.length > 0) {
        return success(cached);
      }

      const res = await fetch('/api/entity/product').catch(() => null);
      if (res && res.ok) {
        const raw = await res.json().catch(() => []);
        const products: Product[] = Array.isArray(raw) ? raw : raw?.data || [];
        if (products.length > 0) {
          writeCache(this.cacheKey, products, getTTLForEntity('product'));
        }
        return success(products);
      }

      return failure(new Error('Failed to fetch products'));
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
