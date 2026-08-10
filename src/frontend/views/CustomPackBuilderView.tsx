import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Plus, Minus, ShoppingBag, Sparkles, ArrowRight, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';
import { Product } from '../../types';

interface CustomPackBuilderViewProps {
  onAddToCart: (product: any, quantity: number) => void;
  allProducts: Product[];
}

export const CustomPackBuilderView: React.FC<CustomPackBuilderViewProps> = ({ onAddToCart, allProducts }) => {
  const [selectedItems, setSelectedItems] = useState<{id: string, quantity: number}[]>([]);
  const [step, setStep] = useState(1);

  const toggleItem = (productId: string) => {
    const existing = selectedItems.find(item => item.id === productId);
    if (existing) {
      setSelectedItems(selectedItems.filter(item => item.id !== productId));
    } else {
      setSelectedItems([...selectedItems, { id: productId, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setSelectedItems(selectedItems.map(item => 
      item.id === productId 
        ? { ...item, quantity: Math.max(1, item.quantity + delta) } 
        : item
    ));
  };

  const totalPrice = selectedItems.reduce((sum, item) => {
    const product = allProducts.find(p => p.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const discount = selectedItems.length >= 5 ? 0.15 : selectedItems.length >= 3 ? 0.1 : 0;
  const finalPrice = totalPrice * (1 - discount);

  const handleFinish = () => {
    selectedItems.forEach(item => {
      const product = allProducts.find(p => p.id === item.id);
      if (product) onAddToCart(product, item.quantity);
    });
    toast.success('Votre pack personnalisé a été ajouté au panier !');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="mb-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-widest mb-6"
            >
              <Package size={14} />
              <span>Pack Personnalisé</span>
            </motion.div>
            <h1 className="text-5xl font-serif text-primary mb-6">Composez votre coffret</h1>
            <p className="text-primary/70 text-lg">
              Choisissez au moins 3 articles pour bénéficier d'une réduction immédiate. Plus vous en ajoutez, plus vous économisez !
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {allProducts.map((product) => {
              const isSelected = selectedItems.some(item => item.id === product.id);
              const item = selectedItems.find(i => i.id === product.id);

              return (
                <motion.div
                  key={product.id}
                  layout
                  className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${
                    isSelected ? 'border-accent bg-accent/5' : 'border-primary/5 bg-card hover:border-primary/10'
                  }`}
                  onClick={() => !isSelected && toggleItem(product.id)}
                >
                  <div className="flex gap-4">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-20 h-20 object-cover rounded-2xl"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-grow">
                      <h3 className="font-bold text-primary mb-1">{product.name}</h3>
                      <p className="text-accent font-bold">{product.price.toLocaleString()} FCFA</p>
                      
                      {isSelected && (
                        <div className="flex items-center gap-3 mt-4" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => updateQuantity(product.id, -1)}
                            className="w-8 h-8 rounded-lg bg-white border border-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-bold w-4 text-center">{item?.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(product.id, 1)}
                            className="w-8 h-8 rounded-lg bg-white border border-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                          <button 
                            onClick={() => toggleItem(product.id)}
                            className="ml-auto text-[10px] font-bold uppercase tracking-widest text-red-500 hover:underline"
                          >
                            Retirer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-primary p-10 rounded-[3rem] text-white shadow-2xl shadow-primary/20">
            <h2 className="text-2xl font-serif mb-8 flex items-center gap-3">
              <ShoppingBag size={24} /> Votre Pack
            </h2>

            <div className="space-y-6 mb-10">
              <AnimatePresence mode="popLayout">
                {selectedItems.length === 0 ? (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white/70 text-center py-10 italic"
                  >
                    Votre pack est vide...
                  </motion.p>
                ) : (
                  selectedItems.map(item => {
                    const product = allProducts.find(p => p.id === item.id);
                    return (
                      <motion.div 
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-white/70">{item.quantity}x {product?.name}</span>
                        <span className="font-bold">{(product ? product.price * item.quantity : 0).toLocaleString()} FCFA</span>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            <div className="border-t border-white/10 pt-8 space-y-4">
              <div className="flex justify-between text-white/70">
                <span>Sous-total</span>
                <span>{totalPrice.toLocaleString()} FCFA</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-accent font-bold">
                  <span className="flex items-center gap-2">
                    <Sparkles size={14} /> Remise Pack (-{discount * 100}%)
                  </span>
                  <span>-{(totalPrice * discount).toLocaleString()} FCFA</span>
                </div>
              )}

              <div className="flex justify-between text-2xl font-serif pt-4">
                <span>Total</span>
                <span>{finalPrice.toLocaleString()} FCFA</span>
              </div>
            </div>

            <div className="mt-10 space-y-4">
              {selectedItems.length < 3 && (
                <p className="text-xs text-white/70 text-center italic">
                  Ajoutez encore {3 - selectedItems.length} article(s) pour débloquer 10% de remise !
                </p>
              )}
              <Button 
                variant="secondary" 
                className="w-full py-6 rounded-2xl text-lg font-bold"
                disabled={selectedItems.length === 0}
                onClick={handleFinish}
              >
                Valider mon pack <ArrowRight size={20} className="ml-2" />
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/70">
                <Check size={12} className="text-accent" /> Emballage offert
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/70">
                <Check size={12} className="text-accent" /> Livraison prioritaire
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
