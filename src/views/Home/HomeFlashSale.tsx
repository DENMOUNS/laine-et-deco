import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Zap, Clock } from 'lucide-react';
import { Product } from '../../types';

const CountdownTimer: React.FC<{ endDate: string }> = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(endDate).getTime() - now;
      if (distance < 0) { clearInterval(timer); return; }
      setTimeLeft({
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [endDate]);
  return (
    <div className="flex gap-4">
      {[{ label: 'Heures', value: timeLeft.hours }, { label: 'Min', value: timeLeft.minutes }, { label: 'Sec', value: timeLeft.seconds }].map((item, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-xl font-bold text-accent shadow-sm border border-accent/10">{item.value.toString().padStart(2, '0')}</div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mt-2">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export const HomeFlashSale: React.FC<{ product: Product; onNavigate: (v: string) => void }> = ({ product, onNavigate }) => {
  const flashSaleEndDate = new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString();
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-primary rounded-[3rem] overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/10 skew-x-12 translate-x-1/4" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center">
          <div className="w-full lg:w-1/2 p-12 md:p-20 space-y-8">
            <div className="flex items-center gap-3 text-accent font-bold uppercase tracking-widest text-sm"><Zap size={20} fill="currentColor" /><span>Vente Flash Exceptionnelle</span></div>
            <h2 className="text-4xl md:text-6xl font-serif text-white leading-tight">Offre limitée sur la <span className="italic text-accent">Collection Hiver</span></h2>
            <p className="text-white/60 text-lg max-w-md">Profitez de remises allant jusqu'à -40% sur une sélection exclusive de laines et objets déco.</p>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-widest"><Clock size={14} /><span>Se termine dans :</span></div>
              <CountdownTimer endDate={flashSaleEndDate} />
            </div>
            <motion.button onClick={() => onNavigate('shop')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-accent text-white px-10 py-4 rounded-full font-bold hover:bg-white hover:text-primary transition-all shadow-xl shadow-accent/20 relative overflow-hidden">En profiter maintenant</motion.button>
          </div>
          <div className="w-full lg:w-1/2 p-12 lg:p-0">
            <div className="relative aspect-square max-w-md mx-auto">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-2 border-dashed border-accent/30 rounded-full" />
              <img src={product.image} alt="Flash Sale" className="w-full h-full object-cover rounded-full p-8 relative z-10" referrerPolicy="no-referrer" />
              <div className="absolute top-1/4 -right-4 bg-white p-4 rounded-2xl shadow-2xl z-20 rotate-12"><p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">À partir de</p><p className="text-2xl font-bold text-accent">5 900 FCFA</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
