import React from 'react';
import { motion } from 'motion/react';
import { CATEGORIES as INITIAL_CATEGORIES } from '../../constants';
import { useEntity } from '../hooks/useEntity';
import { ChevronRight, ShoppingBag } from 'lucide-react';

interface CategoriesViewProps {
  onNavigate: (view: string, id?: string, query?: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({ onNavigate }) => {
  const { data: CATEGORIES } = useEntity<any>('category', INITIAL_CATEGORIES);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4"
          >
            Nos Catégories
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-primary/60 max-w-2xl mx-auto italic"
          >
            Explorez notre univers à travers nos différentes sélections de laines, matériel et objets de décoration.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {CATEGORIES.map((category: any, index: number) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onNavigate('shop', undefined, category.name)}
              className="group relative bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-primary/5 cursor-pointer border border-primary/5 hover:border-primary/20 transition-all duration-500"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img 
                  src={category.image} 
                  alt={category.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-2">Découvrir</p>
                    <h2 className="text-2xl font-serif font-bold mb-1">{category.name}</h2>
                    <p className="text-sm text-white/70">{category.count || 0} produits disponibles</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 group-hover:bg-accent group-hover:border-accent transition-all duration-300">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white">
                  <ShoppingBag size={14} />
                  Boutique
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to action */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20 bg-primary rounded-[3rem] p-12 text-center text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
          
          <div className="relative z-10">
            <h2 className="text-3xl font-serif font-bold mb-6">Vous ne trouvez pas votre bonheur ?</h2>
            <p className="text-white/70 max-w-xl mx-auto mb-8">
              Notre catalogue s'enrichit chaque semaine. N'hésitez pas à nous contacter pour des demandes spécifiques ou des commandes sur mesure.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => onNavigate('shop')}
                className="bg-white text-slate-900 px-8 py-4 rounded-full font-bold hover:bg-accent hover:text-white transition-all shadow-xl"
              >
                Voir toute la boutique
              </button>
              <button 
                onClick={() => onNavigate('contact')}
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition-all"
              >
                Nous contacter
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
