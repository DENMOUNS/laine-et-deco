import { ProductRepository } from "../../domain/repositories/ProductRepository";
import { Product } from "../../domain/entities/Product";
import { Result, success, failure } from "../../domain/shared/Result";

export class ApiProductRepository implements ProductRepository {
  async getProducts(): Promise<Result<Product[]>> {
    try {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      
      // Parse JSON fields from SQLite
      const products = data.map((p: any) => ({
        ...p,
        isNew: Boolean(p.isNew),
        isSale: Boolean(p.isSale),
        isAvailable: Boolean(p.isAvailable),
        colors: p.colors ? JSON.parse(p.colors) : undefined,
        reviews: p.reviews ? JSON.parse(p.reviews) : undefined,
        seo: p.seo ? JSON.parse(p.seo) : undefined,
      }));

      return success(products);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error("Failed to fetch products"));
    }
  }

  async getProductById(id: string): Promise<Result<Product>> {
    try {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        throw new Error("Product not found");
      }
      const p = await response.json();
      
      const product = {
        ...p,
        isNew: Boolean(p.isNew),
        isSale: Boolean(p.isSale),
        isAvailable: Boolean(p.isAvailable),
        colors: p.colors ? JSON.parse(p.colors) : undefined,
        reviews: p.reviews ? JSON.parse(p.reviews) : undefined,
        seo: p.seo ? JSON.parse(p.seo) : undefined,
      };

      return success(product);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error("Failed to fetch product"));
    }
  }

  async createProduct(product: Omit<Product, "id">): Promise<Result<Product>> {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      if (!response.ok) {
        throw new Error("Failed to create product");
      }
      const newProduct = await response.json();
      return success(newProduct);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error("Failed to create product"));
    }
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Result<Product>> {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      if (!response.ok) {
        throw new Error("Failed to update product");
      }
      const updatedProduct = await response.json();
      return success(updatedProduct);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error("Failed to update product"));
    }
  }

  async deleteProduct(id: string): Promise<Result<void>> {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete product");
      }
      return success(undefined);
    } catch (error) {
      return failure(error instanceof Error ? error : new Error("Failed to delete product"));
    }
  }
}
