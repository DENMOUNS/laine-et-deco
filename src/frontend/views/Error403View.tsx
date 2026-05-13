import React from 'react';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { motion } from 'motion/react';

interface Error403ViewProps {
  onNavigate: (view: string) => void;
}

export const Error403View: React.FC<Error403ViewProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-8"
      >
        <ShieldAlert size={48} />
      </motion.div>
      
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-6xl font-serif font-bold text-primary mb-4"
      >
        403
      </motion.h1>
      
      <motion.h2 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-serif text-primary/80 mb-6"
      >
        Accès Refusé
      </motion.h2>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-primary/60 max-w-md mx-auto mb-10"
      >
        Désolé, vous n'avez pas les autorisations nécessaires pour accéder à cette page. 
        Si vous pensez qu'il s'agit d'une erreur, veuillez contacter l'administration.
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
          onClick={() => window.history.back()}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-secondary text-primary rounded-2xl font-bold hover:bg-secondary/80 transition-all border border-primary/10"
        >
          <ArrowLeft size={18} />
          Page précédente
        </button>
      </motion.div>
    </div>
  );
};
