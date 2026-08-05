import { ProductRepository } from '../../domain/repositories/ProductRepository';
import { Product } from '../../domain/entities/Product';
import { Result, success, failure } from '../../domain/shared/Result';
import { db } from '../../../server/firebaseAdmin';

export class ApiProductRepository implements ProductRepository {
  async getProducts(): Promise<Result<Product[]>> {
    try {
      const snap = await db.collection('product').get();
      const products = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      return success(products as Product[]);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error('Failed to fetch products'));
    }
  }

  async getProductById(id: string): Promise<Result<Product>> {
    try {
      const doc = await db.collection('product').doc(id).get();
      if (!doc.exists) return failure(new Error('Product not found'));
      return success({ id: doc.id, ...(doc.data() as any) } as Product);
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
