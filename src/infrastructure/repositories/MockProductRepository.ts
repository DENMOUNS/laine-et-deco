import { ProductRepository } from "../../domain/repositories/ProductRepository";
import { Product } from "../../domain/entities/Product";
import { Result, success, failure } from "../../domain/shared/Result";
import { PRODUCTS } from "../../constants";

export class MockProductRepository implements ProductRepository {
  private products: Product[] = [...PRODUCTS];

  async getProducts(): Promise<Result<Product[]>> {
    try {
      return success(this.products);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error("Failed to fetch products"));
    }
  }

  async getProductById(id: string): Promise<Result<Product>> {
    try {
      const product = this.products.find((p) => p.id === id);
      if (!product) return failure(new Error("Product not found"));
      return success(product);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error("Failed to fetch product"));
    }
  }

  async createProduct(product: Omit<Product, "id">): Promise<Result<Product>> {
    try {
      const newProduct = { ...product, id: `p${this.products.length + 1}` };
      this.products.push(newProduct);
      return success(newProduct);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error("Failed to create product"));
    }
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Result<Product>> {
    try {
      const index = this.products.findIndex((p) => p.id === id);
      if (index === -1) return failure(new Error("Product not found"));
      this.products[index] = { ...this.products[index], ...product };
      return success(this.products[index]);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error("Failed to update product"));
    }
  }

  async deleteProduct(id: string): Promise<Result<void>> {
    try {
      const index = this.products.findIndex((p) => p.id === id);
      if (index === -1) return failure(new Error("Product not found"));
      this.products.splice(index, 1);
      return success(undefined);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error("Failed to delete product"));
    }
  }
}
