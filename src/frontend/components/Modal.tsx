import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-[95%] max-h-[95vh] h-[95vh]'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-[500]"
          />
          <div className="fixed inset-0 z-[501] flex min-h-screen items-start sm:items-center justify-center p-4 overflow-y-auto text-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`bg-white w-full ${sizeClasses[size]} max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col pointer-events-auto border border-primary/10 overflow-hidden`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 md:p-8 border-b border-primary/5 shrink-0 bg-accent/5">
                {title && <h2 className="text-2xl font-serif font-bold text-primary">{title}</h2>}
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary/70 hover:text-accent hover:bg-accent/10 transition-all border border-primary/5 shadow-sm ml-auto"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
