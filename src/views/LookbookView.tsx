import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Plus, X, ShoppingBag } from 'lucide-react';
import { PRODUCTS } from '../constants';
import { Product } from '../types';

interface LookbookViewProps {
  onNavigate: (view: string, id?: string) => void;
  onAddToCart: (p: Product) => void;
}

export const LookbookView: React.FC<LookbookViewProps> = ({ onNavigate, onAddToCart }) => {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const lookbookItems = [
    {
      id: 'lb1',
      image: 'https://picsum.photos/seed/lookbook1/1200/800',
      title: 'Ambiance Hivernale',
      hotspots: [
        { id: 'h1', x: 30, y: 40, productId: 'p4' }, // Plaid
        { id: 'h2', x: 70, y: 60, productId: 'p2' }, // Vase
      ]
    },
    {
      id: 'lb2',
      image: 'https://picsum.photos/seed/lookbook2/1200/800',
      title: 'Atelier Tricot',
      hotspots: [
        { id: 'h3', x: 45, y: 50, productId: 'p1' }, // Laine
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-primary/40 mb-12">
        <button onClick={() => onNavigate('home')} className="hover:text-primary">Accueil</button>
        <ChevronRight size={14} />
        <span className="text-primary">Lookbook</span>
      </nav>

      <div className="text-center mb-16">
        <h1 className="text-5xl font-serif text-primary mb-4">Lookbook</h1>
        <p className="text-primary/60 max-w-2xl mx-auto">Découvrez nos produits en situation et laissez-vous inspirer par nos ambiances. Cliquez sur les points pour voir les détails.</p>
      </div>

      <div className="space-y-24">
        {lookbookItems.map((item) => (
          <div key={item.id} className="relative rounded-[3rem] overflow-hidden shadow-2xl">
            <img src={item.image} alt={item.title} className="w-full h-[60vh] object-cover" referrerPolicy="no-referrer" />
            
            {item.hotspots.map((hotspot) => {
              const product = PRODUCTS.find(p => p.id === hotspot.productId);
              if (!product) return null;

              return (
                <div 
                  key={hotspot.id}
                  className="absolute"
                  style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                >
                  <button
                    onClick={() => setActiveHotspot(activeHotspot === hotspot.id ? null : hotspot.id)}
                    className="relative w-8 h-8 -ml-4 -mt-4 bg-white rounded-full shadow-lg flex items-center justify-center text-primary hover:scale-110 transition-transform z-10"
                  >
                    <span className="absolute w-full h-full rounded-full bg-white animate-ping opacity-50" />
                    <Plus size={16} className={`transition-transform ${activeHotspot === hotspot.id ? 'rotate-45' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {activeHotspot === hotspot.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute top-10 left-1/2 -translate-x-1/2 w-64 bg-white p-4 rounded-2xl shadow-2xl z-20"
                      >
                        <button onClick={() => setActiveHotspot(null)} className="absolute top-2 right-2 text-primary/40 hover:text-primary">
                          <X size={16} />
                        </button>
                        <div className="flex gap-4 items-center cursor-pointer" onClick={() => onNavigate('product-detail', product.id)}>
                          <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-xl" referrerPolicy="no-referrer" />
                          <div>
                            <h4 className="font-bold text-primary text-sm line-clamp-1">{product.name}</h4>
                            <p className="text-accent font-bold text-sm">{product.price.toLocaleString()} FCFA</p>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                          className="w-full mt-4 py-2 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-accent transition-colors flex items-center justify-center gap-2"
                        >
                          <ShoppingBag size={14} /> Ajouter
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
