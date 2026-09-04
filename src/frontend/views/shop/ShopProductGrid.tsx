import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductCard } from '../../components/ProductCard';
import { ProductSkeleton } from '../../components/ui/Skeleton';
import { Product } from '../../../types';
import { ShopEmptyState } from './ShopEmptyState';
import { ShopPagination } from './ShopPagination';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export interface ShopProductGridProps {
  isFiltering: boolean;
  filteredProducts: Product[];
  paginatedProducts: Product[];
  onAddToCart: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToComparison: (product: Product) => void;
  onProductClick?: (product: Product) => void;
  events?: any[];
  CATEGORIES: any[];
  resetAllFilters: () => void;
  setSelectedCategory: (cat: string) => void;
  setOnlyPromotions: (val: boolean) => void;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export const ShopProductGrid: React.FC<ShopProductGridProps> = ({
  isFiltering,
  filteredProducts,
  paginatedProducts,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  onAddToComparison,
  onProductClick,
  events = [],
  CATEGORIES,
  resetAllFilters,
  setSelectedCategory,
  setOnlyPromotions,
  currentPage,
  totalPages,
  setCurrentPage,
}) => {
  return (
    <main className="flex-grow relative min-h-[400px]">
      <AnimatePresence mode="wait">
        {isFiltering ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-6 md:gap-8"
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <ProductSkeleton key={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-5 md:gap-6"
          >
            {paginatedProducts.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                  onAddToWishlist={onAddToWishlist}
                  onQuickView={onQuickView}
                  onAddToComparison={onAddToComparison}
                  onClick={onProductClick}
                  events={events}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!isFiltering && filteredProducts.length === 0 && (
        <ShopEmptyState
          onResetAllFilters={resetAllFilters}
          onShowPromotionsOnly={() => {
            resetAllFilters();
            setOnlyPromotions(true);
          }}
          CATEGORIES={CATEGORIES}
          onSelectCategory={(catName) => {
            resetAllFilters();
            setSelectedCategory(catName);
          }}
        />
      )}

      <ShopPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </main>
  );
};
