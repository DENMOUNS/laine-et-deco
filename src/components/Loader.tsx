import React from 'react';
import { motion } from 'motion/react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  color = 'var(--color-primary)', 
  text, 
  fullScreen = false 
}) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4'
  };

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        className={`${sizes[size]} rounded-full border-t-transparent animate-spin`}
        style={{ borderColor: `${color} transparent transparent transparent` }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      />
      {text && (
        <p className="text-sm font-serif italic text-primary/60 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
};
