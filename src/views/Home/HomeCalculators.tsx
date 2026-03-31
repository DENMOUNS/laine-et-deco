import React from 'react';
import { motion } from 'motion/react';
import { Calculator, Sparkles, Box, FlaskConical, Ruler, Heart, Flower2, Dna } from 'lucide-react';

export const HomeCalculators: React.FC<{ onNavigate: (v: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="space-y-24">
      {/* Wool Calculator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary rounded-[3rem] overflow-hidden relative shadow-2xl">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-white/5 -skew-x-12 -translate-x-1/4" />
          <div className="relative z-10 flex flex-col lg:flex-row-reverse items-center">
            <div className="w-full lg:w-1/2 p-12 md:p-20 space-y-8">
              <div className="flex items-center gap-3 text-accent font-bold uppercase tracking-widest text-sm"><div className="relative"><Calculator size={20} /><Sparkles size={10} className="absolute -top-1 -right-1 text-white animate-pulse" /></div><span>Calculateur de Laine</span></div>
              <h2 className="text-4xl md:text-6xl font-serif text-white leading-tight">Combien de <span className="italic text-accent">pelotes</span> pour votre projet ?</h2>
              <p className="text-white/80 text-lg max-w-md">Ne manquez plus jamais de fil. Notre calculateur intelligent estime précisément vos besoins selon votre projet et votre taille.</p>
              <motion.button onClick={() => onNavigate('wool-calculator')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-accent text-white px-10 py-4 rounded-full font-bold hover:bg-white hover:text-primary transition-all shadow-xl shadow-accent/20 relative overflow-hidden">Calculer maintenant</motion.button>
            </div>
            <div className="w-full lg:w-1/2 p-12 lg:p-0 flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} className="relative z-10 w-full h-full flex items-center justify-center">
                  <div className="absolute inset-0 bg-accent/20 rounded-full blur-[100px]" />
                  <motion.div animate={{ y: [0, -20, 0], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-1/4 left-1/4 text-accent/40"><Sparkles size={24} /></motion.div>
                  <motion.div animate={{ y: [0, 20, 0], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} className="absolute bottom-1/4 right-1/3 text-white/30"><Heart size={20} /></motion.div>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-1/3 right-1/4 text-accent/20"><Flower2 size={40} /></motion.div>
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-10 left-10 z-30 bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-white/10"><div className="flex items-center gap-3"><div className="w-2 h-2 bg-accent rounded-full animate-pulse" /><span className="text-xs font-bold uppercase tracking-[0.3em] text-white/80">Calculateur</span></div></motion.div>
                  <motion.div animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute z-20 top-1/4 right-1/4"><div className="w-32 h-32 bg-accent rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden group"><Dna className="text-white/30 absolute rotate-45 scale-150" size={80} /><Dna className="text-white/20 absolute -rotate-45 scale-125" size={80} /><div className="w-full h-full bg-gradient-to-br from-white/20 to-transparent" /><Sparkles className="absolute text-white/40 animate-pulse" size={16} /></div></motion.div>
                  <motion.div animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute z-10 bottom-1/4 left-1/4"><div className="w-24 h-24 bg-secondary rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden"><Dna className="text-primary/20 absolute rotate-90 scale-125" size={60} /><div className="w-full h-full bg-gradient-to-br from-white/40 to-transparent" /><Heart className="absolute text-primary/30 animate-bounce" size={12} /></div></motion.div>
                  <motion.div animate={{ rotate: [45, 50, 45], x: [0, 5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-2 bg-white/80 rounded-full shadow-lg transform rotate-45"><div className="absolute -left-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full flex items-center justify-center"><Sparkles size={8} className="text-accent" /></div></motion.div>
                  <motion.div animate={{ rotate: [-45, -50, -45], x: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} className="absolute z-30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-2 bg-white/60 rounded-full shadow-lg transform -rotate-45"><div className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-white/80 rounded-full flex items-center justify-center"><Sparkles size={8} className="text-accent" /></div></motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Volume Calculator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[3rem] overflow-hidden relative shadow-xl border border-primary/5">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 skew-x-12 translate-x-1/4" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center">
            <div className="w-full lg:w-1/2 p-12 md:p-20 space-y-8">
              <div className="flex items-center gap-3 text-accent font-bold uppercase tracking-widest text-sm"><div className="relative"><Box size={20} /><Sparkles size={10} className="absolute -top-1 -right-1 text-primary animate-pulse" /></div><span>Nouveau : Décoration Maison</span></div>
              <h2 className="text-4xl md:text-6xl font-serif text-primary leading-tight">Créez vos propres <span className="italic text-accent">objets déco</span></h2>
              <p className="text-primary/60 text-lg max-w-md">Découvrez nos moules et poudres créatives. Utilisez notre calculateur de volume pour doser parfaitement vos mélanges de Jesmonite ou de plâtre.</p>
              <div className="flex flex-wrap gap-4">
                <motion.button onClick={() => onNavigate('volume-calculator')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-primary text-white px-10 py-4 rounded-full font-bold hover:bg-accent transition-all shadow-xl shadow-primary/20 relative overflow-hidden">Calculateur de Volume</motion.button>
                <motion.button onClick={() => onNavigate('shop')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-white text-primary border-2 border-primary/10 px-10 py-4 rounded-full font-bold hover:border-primary transition-all">Voir les moules</motion.button>
              </div>
            </div>
            <div className="w-full lg:w-1/2 p-12 lg:p-0 flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} className="relative z-10 w-full h-full flex items-center justify-center">
                  <div className="absolute inset-0 bg-accent/10 rounded-full blur-[80px]" />
                  <motion.div animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 right-1/4 z-20"><div className="w-40 h-40 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center border border-primary/5 overflow-hidden group"><img src="https://picsum.photos/seed/moldovale/400/400" alt="Moule" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" /><div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" /><Box className="absolute bottom-4 right-4 text-white/80" size={24} /></div></motion.div>
                  <motion.div animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-1/4 left-1/4 z-10"><div className="w-32 h-32 bg-secondary rounded-[2rem] shadow-xl flex items-center justify-center border border-primary/5 overflow-hidden"><img src="https://picsum.photos/seed/jesmonite/400/400" alt="Poudre" className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" /><FlaskConical className="absolute text-primary/40" size={32} /></div></motion.div>
                  <motion.div animate={{ width: ["0%", "80%", "0%"], opacity: [0, 1, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1 bg-accent/30 rounded-full z-30"><div className="absolute -right-2 -top-2 w-4 h-4 bg-accent rounded-full flex items-center justify-center"><Ruler size={10} className="text-white" /></div></motion.div>
                  <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-10 right-10 text-accent"><Sparkles size={32} /></motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
