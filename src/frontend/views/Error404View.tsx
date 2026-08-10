import React from 'react';
import { Search, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface Error404ViewProps {
  onNavigate: (view: string) => void;
}

export const Error404View: React.FC<Error404ViewProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ rotate: -10, scale: 0.5, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="text-accent mb-8"
      >
        <Search size={80} strokeWidth={1} />
      </motion.div>
      
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-8xl font-serif font-bold text-primary mb-4"
      >
        404
      </motion.h1>
      
      <motion.h2 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-serif text-primary/80 mb-6"
      >
        Page Introuvable
      </motion.h2>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-primary/60 max-w-md mx-auto mb-10"
      >
        Oups ! Il semblerait que la pelote que vous cherchez se soit égarée. 
        Le lien est peut-être rompu ou la page a été déplacée.
      </motion.p>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-accent transition-all shadow-lg"
        >
          <Home size={18} />
          Retour à l'accueil
        </button>
        <button
          onClick={() => onNavigate('shop')}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-secondary text-primary rounded-2xl font-bold hover:bg-secondary/80 transition-all border border-primary/10"
        >
          Voir la boutique
        </button>
      </motion.div>
    </div>
  );
};
