import { useState, useEffect } from 'react';
import { Product } from '../../types';
import { useEntity } from './useEntity';

export const useProducts = () => {
  const { data: products, isLoading, error } = useEntity<Product>('product', []);
  
  return {
    products,
    isLoading,
    error
  };
};
