import React from 'react';
import { RefreshCcw, Home, Ghost } from 'lucide-react';
import { motion } from 'motion/react';

interface Error500ViewProps {
  onNavigate: (view: string) => void;
  error?: Error;
}

export const Error500View: React.FC<Error500ViewProps> = ({ onNavigate, error }) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-primary/20 mb-8"
      >
        <Ghost size={100} strokeWidth={1} />
      </motion.div>
      
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-7xl font-serif font-bold text-primary mb-4"
      >
        500
      </motion.h1>
      
      <motion.h2 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-serif text-primary/80 mb-6"
      >
        Erreur Serveur
      </motion.h2>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-primary/60 max-w-md mx-auto mb-10"
      >
        Désolé, quelque chose s'est mal passé de notre côté. 
        Nos techniciens (et peut-être quelques chats) travaillent déjà dessus.
      </motion.p>
      
      {error && process.env.NODE_ENV !== 'production' && (
        <div className="mb-10 p-4 bg-red-50 text-red-600 rounded-xl text-left font-mono text-xs overflow-auto max-w-2xl mx-auto">
          <p className="font-bold mb-2">Détails de l'erreur :</p>
          <pre>{error.message}</pre>
          {error.stack && <pre className="mt-2 opacity-70">{error.stack}</pre>}
        </div>
      )}
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <button
          onClick={() => window.location.reload()}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-accent transition-all shadow-lg"
        >
          <RefreshCcw size={18} />
          Réessayer
        </button>
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-secondary text-primary rounded-2xl font-bold hover:bg-secondary/80 transition-all border border-primary/10"
        >
          <Home size={18} />
          Retour à l'accueil
        </button>
      </motion.div>
    </div>
  );
};
