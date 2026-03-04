import React, { createContext, useContext } from "react";
import { MockProductRepository } from "../../infrastructure/repositories/MockProductRepository";
import { GetProductsUseCase } from "../../application/use-cases/GetProducts";

interface DIContextType {
  getProductsUseCase: GetProductsUseCase;
}

const productRepository = new MockProductRepository();

const diContextValue: DIContextType = {
  getProductsUseCase: new GetProductsUseCase(productRepository),
};

const DIContext = createContext<DIContextType | undefined>(undefined);

export const DIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <DIContext.Provider value={diContextValue}>{children}</DIContext.Provider>;
};

export const useDI = () => {
  const context = useContext(DIContext);
  if (!context) {
    throw new Error("useDI must be used within a DIProvider");
  }
  return context;
};
