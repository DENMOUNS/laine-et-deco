import React from 'react';
import { motion } from 'motion/react';
import { Package } from 'lucide-react';
import { Button } from '../ui/Button';

interface HomeCalculatorTeaserProps {
  onNavigate: (view: string) => void;
}

export const HomeCalculatorTeaser: React.FC<HomeCalculatorTeaserProps> = ({ onNavigate }) => {
  return (
    <section className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 border border-primary/10 flex flex-col md:flex-row items-center gap-6 md:gap-10 relative overflow-hidden">
        <div className="w-full md:w-1/2 space-y-4 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Nouveau Outil</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-primary">Calculateur de Pelotes</h2>
          <p className="text-primary/70 text-xs sm:text-sm md:text-base leading-relaxed">
            Vous ne savez pas combien de pelotes acheter pour votre prochain projet ?
            Utilisez notre calculateur intelligent pour estimer la quantité exacte de laine nécessaire pour votre pull, écharpe ou bonnet.
          </p>
          <Button
            onClick={() => onNavigate('calculator')}
            className="px-6 py-3 flex items-center gap-2 text-xs sm:text-sm animate-shine"
          >
            <Package size={18} />
            Calculer maintenant
          </Button>
        </div>
        <div className="w-full md:w-1/2 relative flex justify-center items-center h-[220px] sm:h-[280px]">
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 bg-white rounded-full flex items-center justify-center shadow-xl border-4 border-white/20">
            <span className="text-7xl sm:text-8xl font-serif text-accent">?</span>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-6 -right-6 bg-white p-3 rounded-2xl shadow-lg rotate-12"
            >
              <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                <Package size={18} className="text-accent" />
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-3 -left-6 bg-white p-3 rounded-2xl shadow-lg -rotate-6"
            >
              <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                <div className="w-6 h-0.5 bg-primary rounded-full rotate-45" />
                <div className="w-6 h-0.5 bg-primary rounded-full -rotate-45 absolute" />
              </div>
            </motion.div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-primary/10 rounded-full blur-2xl -z-10" />
        </div>
      </div>
    </section>
  );
};
