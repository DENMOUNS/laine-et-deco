import React from 'react';
import { motion } from 'motion/react';
import { createPortal } from 'react-dom';

interface LoaderProps {
  fullScreen?: boolean;
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({ fullScreen = false, text = "Veuillez patienter..." }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="relative flex items-center justify-center scale-125">
         <motion.div
           animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
           transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
           className="w-16 h-16 border-4 border-primary/30 rounded-full"
         />
         <motion.div
           animate={{ rotate: 360 }}
           transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
           className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full"
         />
         <motion.div
           animate={{ rotate: -360 }}
           transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
           className="absolute inset-2 w-12 h-12 border-4 border-transparent border-b-accent rounded-full"
         />
      </div>
      {text && <p className="text-primary font-bold tracking-widest uppercase text-sm animate-pulse">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return createPortal(
      <div className="fixed inset-0 bg-secondary/95 backdrop-blur-xl z-[9999] flex items-center justify-center">
        {content}
      </div>,
      document.body
    );
  }

  return <div className="flex-1 flex w-full h-full min-h-[400px] items-center justify-center p-12">{content}</div>;
};
