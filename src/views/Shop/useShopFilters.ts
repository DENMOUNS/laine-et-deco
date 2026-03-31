import { useState, useEffect, useMemo } from 'react';
import { Product } from '../../types';

export const useShopFilters = (products: Product[], initialSearchQuery: string = '') => {
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedMaterial, setSelectedMaterial] = useState('Tous');
  const [selectedColor, setSelectedColor] = useState('Tous');
  const [selectedBrand, setSelectedBrand] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [sortBy, setSortBy] = useState('Nouveautés');
  const [priceRange, setPriceRange] = useState(100000);
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => setIsFiltering(false), 400);
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedMaterial, selectedColor, selectedBrand, searchQuery, sortBy, priceRange]);

  const parseLuceneQuery = (query: string, product: Product) => {
    if (!query.trim()) return true;
    const terms = query.toLowerCase().match(/(?:[^\s"]+|"[^"]*")+/g);
    if (!terms) return true;
    
    return terms.every((term: string) => {
      let field = '';
      let value = term;
      if (term.includes(':')) {
        const parts = term.split(':');
        field = parts[0];
        value = parts.slice(1).join(':');
      }
      value = value.replace(/"/g, '');
      const getFieldText = (f: string) => {
        switch(f) {
          case 'name': return product.name.toLowerCase();
          case 'category': return product.category.toLowerCase();
          case 'material': return (product.material || '').toLowerCase();
          case 'brand': return (product.brand || '').toLowerCase();
          case 'desc': return product.description.toLowerCase();
          case 'price': return product.price.toString();
          default: return `${product.name} ${product.category} ${product.description} ${product.material || ''} ${product.brand || ''}`.toLowerCase();
        }
      };
      return field ? getFieldText(field).includes(value) : getFieldText('').includes(value);
    });
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'Tous' || p.category === selectedCategory;
      const matchesMaterial = selectedMaterial === 'Tous' || p.material === selectedMaterial;
      const matchesColor = selectedColor === 'Tous' || (p.colors && p.colors.includes(selectedColor));
      const matchesBrand = selectedBrand === 'Tous' || p.brand === selectedBrand;
      const matchesSearch = parseLuceneQuery(searchQuery, p);
      const matchesPrice = p.price <= priceRange;
      return matchesCategory && matchesMaterial && matchesColor && matchesBrand && matchesSearch && matchesPrice;
    }).sort((a, b) => {
      if (sortBy === 'Prix croissant') return a.price - b.price;
      if (sortBy === 'Prix décroissant') return b.price - a.price;
      if (sortBy === 'Mieux notés') return b.rating - a.rating;
      if (sortBy === 'Nouveautés') return (a.isNew ? -1 : 1) - (b.isNew ? -1 : 1);
      return 0;
    });
  }, [products, selectedCategory, selectedMaterial, selectedColor, selectedBrand, searchQuery, sortBy, priceRange]);

  return {
    selectedCategory, setSelectedCategory,
    selectedMaterial, setSelectedMaterial,
    selectedColor, setSelectedColor,
    selectedBrand, setSelectedBrand,
    searchQuery, setSearchQuery,
    sortBy, setSortBy,
    priceRange, setPriceRange,
    isFiltering,
    filteredProducts
  };
};
