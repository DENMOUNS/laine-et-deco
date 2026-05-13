import { ProductRepository } from "../../domain/repositories/ProductRepository";
import { Product } from "../../domain/entities/Product";
import { Result } from "../../domain/shared/Result";

export class GetProductsUseCase {
  constructor(private productRepository: ProductRepository) {}

  async execute(): Promise<Result<Product[]>> {
    return this.productRepository.getProducts();
  }
}
