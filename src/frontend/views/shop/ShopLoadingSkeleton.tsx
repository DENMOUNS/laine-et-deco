import React from 'react';
import { ProductSkeleton } from '../../components/ui/Skeleton';

export const ShopLoadingSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div className="space-y-2">
          <div className="h-10 w-48 bg-primary/5 rounded-lg animate-pulse" />
          <div className="h-4 w-32 bg-primary/5 rounded-lg animate-pulse" />
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="hidden lg:block w-72 space-y-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-4 w-24 bg-primary/5 rounded animate-pulse" />
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-3 w-full bg-primary/5 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </aside>
        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};
