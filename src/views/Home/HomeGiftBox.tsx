import React from 'react';
import { motion } from 'motion/react';
import { Gift, Sparkles, Check, ArrowRight } from 'lucide-react';

const ShimmerEffect: React.FC = () => (
  <motion.div
    initial={{ x: '-150%', skewX: -25 }}
    animate={{ x: '250%' }}
    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3.5, ease: "easeInOut" }}
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent z-10 pointer-events-none"
  />
);

export const HomeGiftBox: React.FC<{ onNavigate: (v: string) => void }> = ({ onNavigate }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
      <div className="bg-primary rounded-[4rem] p-12 md:p-20 overflow-hidden relative shadow-2xl shadow-primary/20">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none"><Gift size={600} className="translate-x-1/4 -translate-y-1/4 rotate-12" /></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="w-full lg:w-1/2 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full border border-accent/20"><Sparkles size={16} className="text-accent" /><span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Nouveau : Coffrets Cadeaux</span></div>
            <h2 className="text-5xl md:text-7xl font-serif text-white leading-tight">Offrez le <span className="italic text-accent">cadeau parfait</span></h2>
            <p className="text-white/60 text-xl leading-relaxed max-w-xl">Composez votre propre coffret cadeau personnalisé. Choisissez vos laines, vos accessoires et ajoutez un mot doux. Nous préparons un emballage premium pour une surprise inoubliable.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="flex items-center gap-4 text-white/80"><div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-accent"><Check size={20} /></div><span className="text-sm font-medium">Emballage Premium</span></div>
              <div className="flex items-center gap-4 text-white/80"><div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-accent"><Check size={20} /></div><span className="text-sm font-medium">Carte Personnalisée</span></div>
            </div>
            <div className="flex flex-wrap items-center gap-8 pt-6">
              <motion.button onClick={() => onNavigate('gift-box')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-accent text-white px-12 py-5 rounded-full font-bold hover:bg-white hover:text-primary transition-all shadow-2xl shadow-accent/20 flex items-center gap-3 group/btn relative overflow-hidden"><ShimmerEffect />Créer mon coffret<ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform" /></motion.button>
              <div className="flex items-center gap-4 text-white/40"><div className="flex -space-x-3">{[1,2,3].map(i => (<div key={i} className="w-10 h-10 rounded-full border-2 border-primary bg-secondary overflow-hidden"><img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" /></div>))}</div><p className="text-xs font-medium">+500 créés ce mois-ci</p></div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative group/img">
              <motion.div animate={{ rotate: [0, 5, -5, 0], y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="relative z-10">
                <div className="w-72 h-72 md:w-96 md:h-96 bg-white/10 backdrop-blur-md border border-white/20 rounded-[4rem] p-12 flex items-center justify-center shadow-2xl overflow-hidden">
                  <img src="https://picsum.photos/seed/giftbox-preview/800/800" alt="Gift Box Preview" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover/img:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                  <Gift size={140} className="text-white relative z-10 drop-shadow-2xl" />
                </div>
              </motion.div>
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-accent rounded-full blur-[100px] opacity-30" /><div className="absolute -top-12 -left-12 w-48 h-48 bg-white rounded-full blur-[100px] opacity-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
