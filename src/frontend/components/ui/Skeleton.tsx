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
