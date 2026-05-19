import React from 'react';
import { createPortal } from 'react-dom';
import { Scissors } from 'lucide-react';

interface LoaderProps {
  fullScreen?: boolean;
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({ fullScreen = false, text = 'Veuillez patienter...' }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-8">
      <div className="relative flex items-center justify-center scale-125">
        <div className="w-16 h-16 border-4 border-primary/30 rounded-full animate-pulse" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Scissors className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
      </div>
      {text && (
        <p className="text-primary font-bold tracking-widest uppercase text-sm animate-pulse">{text}</p>
      )}
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

  return (
    <div className="flex-1 flex w-full h-full min-h-[400px] items-center justify-center p-12">
      {content}
    </div>
  );
};
