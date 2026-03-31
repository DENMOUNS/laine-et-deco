import React, { useState, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { Product, PromoEvent } from '../types';
import { analyzeProductImage } from '../utils/aiUtils';
import { useProducts } from '../hooks/useProducts';
import { useShopFilters } from './Shop/useShopFilters';
import { ShopFilters } from './Shop/ShopFilters';
import { ShopProductGrid } from './Shop/ShopProductGrid';

interface ShopViewProps {
  onAddToCart: (p: Product) => void;
  onAddToWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onProductClick: (p: Product) => void;
  events?: PromoEvent[];
  initialSearchQuery?: string;
}

export const ShopView: React.FC<ShopViewProps> = ({ 
  onAddToCart, onAddToWishlist, onQuickView, onProductClick, 
  events = [], initialSearchQuery = '' 
}) => {
  const { products: PRODUCTS, isLoading: isInitialLoading } = useProducts();
  const {
    selectedCategory, setSelectedCategory,
    selectedMaterial, setSelectedMaterial,
    selectedColor, setSelectedColor,
    searchQuery, setSearchQuery,
    sortBy, setSortBy,
    priceRange, setPriceRange,
    isFiltering,
    filteredProducts
  } = useShopFilters(PRODUCTS, initialSearchQuery);

  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      setIsAnalyzingImage(true);
      const keywords = await analyzeProductImage(base64);
      if (keywords) setSearchQuery(keywords);
      setIsAnalyzingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const clearImageSearch = () => {
    setImagePreview(null);
    setSearchQuery('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const materials = Array.from(new Set(PRODUCTS.map(p => p.material).filter(Boolean))) as string[];
  const colors = [
    { name: 'Blanc', hex: '#FFFFFF' }, { name: 'Beige', hex: '#F5F5DC' },
    { name: 'Marron', hex: '#8B4513' }, { name: 'Gris', hex: '#808080' },
    { name: 'Noir', hex: '#000000' },
  ];

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 size={48} className="text-accent animate-spin mb-4" />
        <p className="text-lg font-serif italic text-primary/60">Chargement de la boutique...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <ShopFilters 
        isFilterMenuOpen={isFilterMenuOpen} setIsFilterMenuOpen={setIsFilterMenuOpen}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        sortBy={sortBy} setSortBy={setSortBy}
        selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}
        selectedMaterial={selectedMaterial} setSelectedMaterial={setSelectedMaterial}
        priceRange={priceRange} setPriceRange={setPriceRange}
        selectedColor={selectedColor} setSelectedColor={setSelectedColor}
        materials={materials} colors={colors}
        imagePreview={imagePreview} isAnalyzingImage={isAnalyzingImage}
        handleImageSearch={handleImageSearch} clearImageSearch={clearImageSearch}
        fileInputRef={fileInputRef} totalProducts={filteredProducts.length}
      />

      <ShopProductGrid 
        products={paginatedProducts}
        isFiltering={isFiltering}
        onAddToCart={onAddToCart}
        onAddToWishlist={onAddToWishlist}
        onQuickView={onQuickView}
        onProductClick={onProductClick}
        events={events}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        onReset={() => { setSelectedCategory('Tous'); setSearchQuery(''); }}
      />
    </div>
  );
};
