import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Category } from '../../types';

export const HomeCategories: React.FC<{ categories: Category[]; onNavigate: (v: string) => void }> = ({ categories, onNavigate }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-end mb-12">
        <div><span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Explorer</span><h2 className="text-4xl font-serif">Nos Catégories</h2></div>
        <button onClick={() => onNavigate('shop')} className="text-primary font-bold border-b-2 border-primary/20 hover:border-accent hover:text-accent transition-all pb-1">Voir tout</button>
      </div>
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 no-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
        {categories.map((cat, i) => (
          <motion.div key={cat.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="min-w-[70vw] sm:min-w-0 snap-center group relative aspect-[4/5] overflow-hidden rounded-3xl cursor-pointer" onClick={() => onNavigate('shop')}>
            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            <div className="absolute bottom-8 left-8 text-white">
              <p className="text-xs font-bold uppercase tracking-widest mb-2 text-white/70">{cat.count} Articles</p>
              <h3 className="text-3xl font-serif mb-4">{cat.name}</h3>
              <span className="inline-flex items-center text-sm font-bold group-hover:text-accent transition-colors">Découvrir <ArrowRight size={16} className="ml-2" /></span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
