import React from 'react';
import { RefreshCcw, Home, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface Error500ViewProps {
  onNavigate?: (view: string) => void;
  error?: Error;
}

export const Error500View: React.FC<Error500ViewProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        animate={{ 
          y: [0, -10, 0]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-amber-600 mb-6 bg-amber-500/10 p-6 rounded-full"
      >
        <AlertTriangle size={64} strokeWidth={1.5} />
      </motion.div>
      
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-3xl sm:text-4xl font-serif font-bold text-primary mb-3"
      >
        Oups, une erreur s'est produite
      </motion.h1>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-primary/70 max-w-md mx-auto mb-8 text-base leading-relaxed font-medium"
      >
        Nous travaillons à la résoudre, contactez l'équipe technique.
      </motion.p>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <button
          onClick={() => window.location.reload()}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-accent transition-all shadow-lg cursor-pointer"
        >
          <RefreshCcw size={18} />
          Réessayer
        </button>
        {onNavigate && (
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-secondary text-primary rounded-2xl font-bold hover:bg-secondary/80 transition-all border border-primary/10 cursor-pointer"
          >
            <Home size={18} />
            Retour à l'accueil
          </button>
        )}
      </motion.div>
    </div>
  );
};
