import React from 'react';
import { motion } from 'motion/react';

interface LoaderProps {
  fullScreen?: boolean;
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({ fullScreen = false, text = "Chargement..." }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full"
      />
      {text && <p className="text-primary/60 font-medium animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-secondary/80 backdrop-blur-sm z-[200] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return <div className="p-8 flex justify-center">{content}</div>;
};
