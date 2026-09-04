import React from 'react';

export interface ShopPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const ShopPagination: React.FC<ShopPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-16 flex justify-center space-x-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          onClick={() => {
            onPageChange(n);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors cursor-pointer ${
            currentPage === n
              ? 'bg-primary text-white shadow-lg'
              : 'bg-white border border-primary/10 hover:border-accent hover:text-accent'
          }`}
        >
          {n}
        </button>
      ))}
    </div>
  );
};
