import React from 'react';
import { motion } from 'motion/react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{
        repeat: Infinity,
        repeatType: "reverse",
        duration: 0.8,
        ease: "easeInOut"
      }}
      className={`bg-primary/5 rounded-lg ${className}`}
    />
  );
};

export const ProductSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded-[2rem] border border-primary/5 space-y-4">
      <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-grow rounded-xl" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
    </div>
  );
};

export const CategorySkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`relative overflow-hidden rounded-[2.5rem] ${className}`}>
    <Skeleton className="h-full min-h-[250px] w-full rounded-[2.5rem]" />
    <div className="absolute inset-x-8 bottom-8 space-y-3">
      <Skeleton className="h-3 w-1/3 bg-white/30" />
      <Skeleton className="h-8 w-2/3 bg-white/30" />
      <Skeleton className="h-3 w-1/2 bg-white/30" />
    </div>
  </div>
);

export const ContentCardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`rounded-[2rem] border border-primary/5 bg-white p-4 space-y-4 ${className}`}>
    <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
    <Skeleton className="h-5 w-2/3" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-1/2" />
  </div>
);
