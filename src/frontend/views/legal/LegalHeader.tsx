import React from 'react';
import { motion } from 'motion/react';
import { Scale, ArrowLeft } from 'lucide-react';

interface LegalHeaderProps {
  onNavigate?: (view: string) => void;
}

export const LegalHeader: React.FC<LegalHeaderProps> = ({ onNavigate }) => {
  return (
    <div className="bg-[#2D3E31] dark:bg-[#141814] text-white pt-24 pb-16 px-4 rounded-b-[2.5rem] md:rounded-b-[3.5rem] relative overflow-hidden shadow-lg border-b border-white/10">
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10 text-center">
        {onNavigate && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white/90 text-xs font-semibold backdrop-blur-md transition-all active:scale-95 border border-white/15 shadow-sm cursor-pointer"
            >
              <ArrowLeft size={14} />
              Retour à l'accueil
            </button>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/25 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-accent/40 shadow-sm"
        >
          <Scale size={14} className="text-accent-light" />
          Cadre Réglementaire & Juridique
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-serif mb-4 leading-tight"
        >
          Mentions Légales
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/80 max-w-2xl mx-auto text-sm sm:text-base font-light leading-relaxed mb-6"
        >
          Transparence, conformité et sécurité relatives à l'utilisation et aux services du site <strong>Laine et Déco</strong>.
        </motion.p>

        <div className="flex items-center justify-center gap-4 text-xs text-white/70">
          <span className="bg-white/10 px-3 py-1 rounded-full border border-white/10">Version en vigueur : Année 2026</span>
          <span className="hidden sm:inline">•</span>
          <span className="bg-white/10 px-3 py-1 rounded-full border border-white/10">Applicable à tous les visiteurs & acheteurs</span>
        </div>
      </div>
    </div>
  );
};
