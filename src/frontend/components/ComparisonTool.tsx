import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowRightLeft, Trash2, ChevronRight, Plus } from 'lucide-react';
import { Product } from '../../types';
import { Button } from './ui/Button';

interface ComparisonToolProps {
  comparisonList: Product[];
  onRemove: (productId: string) => void;
  onClear: () => void;
  onNavigate?: (view: string) => void;
}

export const ComparisonTool: React.FC<ComparisonToolProps> = ({ comparisonList, onRemove, onClear, onNavigate }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const prevLengthRef = useRef(comparisonList.length);

  // Automatically show the tool again if a new product is added to the comparison list
  useEffect(() => {
    if (comparisonList.length > prevLengthRef.current) {
      setIsDismissed(false);
    }
    if (comparisonList.length === 0) {
      setIsDismissed(false);
    }
    prevLengthRef.current = comparisonList.length;
  }, [comparisonList.length]);

  if (comparisonList.length === 0 || isDismissed) return null;

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-4xl bg-white rounded-3xl shadow-2xl border border-primary/10 p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 text-accent rounded-lg">
            <ArrowRightLeft size={20} />
          </div>
          <h3 className="font-serif text-xl">Comparer les produits ({comparisonList.length})</h3>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost"
            size="sm"
            onClick={onClear} 
            className="text-xs font-bold uppercase tracking-widest text-primary/70 hover:text-red-500 flex items-center gap-2 h-auto"
          >
            <Trash2 size={14} /> Tout effacer
          </Button>
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => setIsDismissed(true)} 
            className="p-2 hover:bg-secondary rounded-full"
          >
            <X size={20} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {comparisonList.map((product) => (
          <div key={product.id} className="relative group bg-secondary/10 rounded-2xl p-4 border border-primary/5">
            <Button 
              variant="danger"
              size="icon"
              onClick={() => onRemove(product.id)}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 p-0"
            >
              <X size={14} />
            </Button>
            <div className="flex gap-4">
              <img src={product.image} alt={product.name} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
              <div>
                <h4 className="font-bold text-sm line-clamp-1">{product.name}</h4>
                <p className="text-accent font-bold text-xs">{product.price.toLocaleString()} FCFA</p>
                <p className="text-[10px] text-primary/70 uppercase tracking-widest mt-1">{product.category}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-primary/5 space-y-2">
              {product.material && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-primary/70">Matière</span>
                  <span className="font-bold truncate pl-2">{product.material}</span>
                </div>
              )}
              {product.colors && product.colors.length > 0 && !product.material && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-primary/70">Couleurs</span>
                  <span className="font-bold truncate pl-2">{product.colors.join(', ')}</span>
                </div>
              )}
              {product.specs && Object.entries(product.specs).slice(0, product.material ? 1 : 2).map(([key, value], i) => (
                <div key={i} className="flex justify-between text-[10px]">
                  <span className="text-primary/70">{key}</span>
                  <span className="font-bold truncate pl-2">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {comparisonList.length < 3 && (
          <div className="border-2 border-dashed border-primary/10 rounded-2xl flex flex-col items-center justify-center p-6 text-primary/70">
            <Plus size={24} className="mb-2" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Ajouter un produit</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <Button 
          onClick={() => {
            if (onNavigate) {
              onNavigate('comparison');
            }
          }}
          className="px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg"
        >
          Voir le comparatif détaillé <ChevronRight size={18} />
        </Button>
      </div>
    </motion.div>
  );
};
