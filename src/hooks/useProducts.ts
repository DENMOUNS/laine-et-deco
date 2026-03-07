import { useState, useEffect } from 'react';
import { Product } from '../types';
import { PRODUCTS } from '../constants';

const CACHE_KEY = 'laine_deco_products_cache';
const CACHE_EXPIRY = 1000 * 60 * 10; // 10 minutes

interface CacheData {
  products: Product[];
  timestamp: number;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      
      // Check cache
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { products: cachedProducts, timestamp }: CacheData = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          setProducts(cachedProducts);
          setIsLoading(false);
          return;
        }
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real app, this would be a fetch('/api/products')
      const data = PRODUCTS;
      
      // Update cache
      const cacheData: CacheData = {
        products: data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      
      setProducts(data);
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  return { products, isLoading };
};
