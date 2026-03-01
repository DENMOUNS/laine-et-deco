import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, X } from 'lucide-react';

interface AdBannerProps {
  onClose?: () => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({ onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-accent text-white py-3 px-4 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.2em]">Offre Spéciale</span>
        <p className="text-sm font-medium">
          Profitez de <span className="font-bold">-20%</span> sur toute la collection de laine d'alpaga avec le code <span className="bg-white/20 px-2 py-0.5 rounded font-mono">ALPAGA20</span>
        </p>
        <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:underline">
          Acheter maintenant <ArrowRight size={14} />
        </button>
      </div>
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </motion.div>
  );
};
