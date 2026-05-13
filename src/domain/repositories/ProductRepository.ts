import { Product } from "../entities/Product";
import { Result } from "../shared/Result";

export interface ProductRepository {
  getProducts(): Promise<Result<Product[]>>;
  getProductById(id: string): Promise<Result<Product>>;
  createProduct(product: Omit<Product, 'id'>): Promise<Result<Product>>;
  updateProduct(id: string, product: Partial<Product>): Promise<Result<Product>>;
  deleteProduct(id: string): Promise<Result<void>>;
}
