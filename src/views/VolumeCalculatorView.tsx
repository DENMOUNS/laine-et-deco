import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Calculator, ChevronRight, Info, RefreshCcw, ShoppingBag, Box, Droplets, FlaskConical, Sparkles, Ruler, Wind } from 'lucide-react';
import { PRODUCTS } from '../constants';
import { Product } from '../types';

interface VolumeCalculatorViewProps {
  onNavigate: (view: string, id?: string) => void;
  onAddToCart: (p: Product, q: number) => void;
}

export const VolumeCalculatorView: React.FC<VolumeCalculatorViewProps> = ({ onNavigate, onAddToCart }) => {
  const [powderType, setPowderType] = useState<'jesmonite' | 'plaster'>('jesmonite');
  const [volume, setVolume] = useState<number>(100);
  const [selectedMold, setSelectedMold] = useState<Product | null>(null);

  const moldProducts = PRODUCTS.filter(p => p.category === 'Moules & Poudres' && p.moldVolume);
  const powderProducts = PRODUCTS.filter(p => p.category === 'Moules & Poudres' && !p.moldVolume);

  const calculation = useMemo(() => {
    if (powderType === 'jesmonite') {
      // Jesmonite AC100: 2.5:1 ratio, density ~1.75g/ml
      const totalWeight = volume * 1.75;
      const powder = Math.round(totalWeight * (2.5 / 3.5));
      const liquid = Math.round(totalWeight * (1 / 3.5));
      return { powder, liquid, unit: 'g' };
    } else {
      // Plâtre Céramique: ~3.5:1 ratio, density ~1.6g/ml
      const totalWeight = volume * 1.6;
      const powder = Math.round(totalWeight * (3.5 / 4.5));
      const water = Math.round(totalWeight * (1 / 4.5));
      return { powder, liquid: water, unit: 'g', liquidName: 'Eau' };
    }
  }, [powderType, volume]);

  const handleMoldSelect = (mold: Product) => {
    setSelectedMold(mold);
    if (mold.moldVolume) {
      setVolume(mold.moldVolume);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-primary/40">
          <button onClick={() => onNavigate('home')} className="hover:text-primary transition-colors">Accueil</button>
          <ChevronRight size={14} />
          <span className="text-primary">Calculateur de Volume</span>
        </nav>
        
        <button 
          onClick={() => onNavigate('wool-calculator')}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent hover:text-primary transition-colors group"
        >
          <Wind size={14} className="group-hover:rotate-12 transition-transform" />
          Passer au calculateur de laine
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Left Side: Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-12"
        >
          <div>
            <h1 className="text-5xl font-serif text-primary mb-6">Calculateur de Volume</h1>
            <p className="text-primary/60 leading-relaxed">
              Dosez vos poudres créatives avec précision. Que vous utilisiez de la Jesmonite ou du plâtre, cet outil vous donne les proportions exactes pour remplir vos moules sans gaspillage.
            </p>
          </div>

          <div className="space-y-8 bg-white p-8 rounded-[3rem] shadow-sm border border-primary/5">
            {/* Powder Type Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-primary/40 mb-4">Type de poudre</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPowderType('jesmonite')}
                  className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                    powderType === 'jesmonite' ? 'border-accent bg-accent/5 text-accent' : 'border-primary/5 hover:border-primary/20 text-primary/60'
                  }`}
                >
                  <FlaskConical size={24} />
                  <div className="text-center">
                    <span className="block text-sm font-bold">Jesmonite</span>
                    <span className="text-[10px] opacity-60 uppercase tracking-wider">Eco-résine (2.5:1)</span>
                  </div>
                </button>
                <button
                  onClick={() => setPowderType('plaster')}
                  className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                    powderType === 'plaster' ? 'border-accent bg-accent/5 text-accent' : 'border-primary/5 hover:border-primary/20 text-primary/60'
                  }`}
                >
                  <Box size={24} />
                  <div className="text-center">
                    <span className="block text-sm font-bold">Plâtre Céramique</span>
                    <span className="text-[10px] opacity-60 uppercase tracking-wider">Raysin / Béton (3.5:1)</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Volume Input */}
            <div>
              <div className="flex justify-between items-end mb-4">
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-primary/40">Volume du moule (ml)</label>
                <span className="text-accent font-mono font-bold">{volume} ml</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="2000" 
                step="10"
                value={volume}
                onChange={(e) => {
                  setVolume(parseInt(e.target.value));
                  setSelectedMold(null);
                }}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <div className="flex justify-between mt-2 text-[10px] text-primary/30 font-bold uppercase tracking-widest">
                <span>10 ml</span>
                <span>1000 ml</span>
                <span>2000 ml</span>
              </div>
            </div>

            {/* Mold Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-primary/40 mb-4">Ou sélectionnez un de nos moules</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {moldProducts.map((mold) => (
                  <button
                    key={mold.id}
                    onClick={() => handleMoldSelect(mold)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      selectedMold?.id === mold.id ? 'border-accent bg-accent/5' : 'border-primary/5 hover:border-primary/10'
                    }`}
                  >
                    <img src={mold.image} alt={mold.name} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                    <div>
                      <p className="text-xs font-bold text-primary leading-tight">{mold.name}</p>
                      <p className="text-[10px] text-accent font-bold">{mold.moldVolume} ml</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl text-blue-700 text-xs">
              <Info size={16} className="shrink-0 mt-0.5" />
              <p>Les calculs sont basés sur les densités moyennes. Pour les pièces complexes, prévoyez 5% de mélange supplémentaire.</p>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Result Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="sticky top-32"
        >
          <div className="bg-primary text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

            <div className="relative z-10 space-y-12">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto backdrop-blur-md border border-white/10 relative">
                  <Calculator size={32} className="text-accent" />
                  <Sparkles size={16} className="text-white absolute -top-1 -right-1 animate-pulse" />
                </div>
                <div>
                  <p className="text-white/60 uppercase tracking-[0.3em] text-xs font-bold mb-2">Dosage recommandé</p>
                  <h2 className="text-4xl font-serif text-white">Proportions Idéales</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2 text-center p-6 bg-white/5 rounded-3xl border border-white/10">
                  <Box size={24} className="mx-auto text-accent mb-4" />
                  <p className="text-4xl font-serif font-bold text-white">{calculation.powder}</p>
                  <p className="text-xs uppercase tracking-widest text-white/40 font-bold">Poudre ({calculation.unit})</p>
                </div>
                <div className="space-y-2 text-center p-6 bg-white/5 rounded-3xl border border-white/10">
                  <Droplets size={24} className="mx-auto text-accent mb-4" />
                  <p className="text-4xl font-serif font-bold text-white">{calculation.liquid}</p>
                  <p className="text-xs uppercase tracking-widest text-white/40 font-bold">{calculation.liquidName || 'Liquide'} ({calculation.unit})</p>
                </div>
              </div>

              <div className="pt-8 border-t border-white/10 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Volume Total</span>
                  <span className="text-white font-bold">{volume} ml</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Poids Total Est.</span>
                  <span className="text-white font-bold">{calculation.powder + calculation.liquid} g</span>
                </div>
              </div>

              <div className="space-y-4">
                {selectedMold && (
                  <button 
                    onClick={() => onAddToCart(selectedMold, 1)}
                    className="w-full bg-white text-primary py-4 rounded-2xl font-bold hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-3 shadow-xl shadow-white/10 mb-4"
                  >
                    <ShoppingBag size={20} />
                    Ajouter le moule au panier
                  </button>
                )}
                <p className="text-xs text-white/40 font-bold uppercase tracking-widest text-center">Produits recommandés</p>
                <div className="grid grid-cols-1 gap-3">
                  {powderProducts.filter(p => 
                    (powderType === 'jesmonite' && p.name.toLowerCase().includes('jesmonite')) ||
                    (powderType === 'plaster' && p.name.toLowerCase().includes('plâtre'))
                  ).map(p => (
                    <button
                      key={p.id}
                      onClick={() => onAddToCart(p, 1)}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group"
                    >
                      <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <div className="flex-grow">
                        <p className="text-xs font-bold text-white group-hover:text-accent transition-colors">{p.name}</p>
                        <p className="text-[10px] text-white/40">{p.price.toLocaleString()} FCFA</p>
                      </div>
                      <ShoppingBag size={14} className="text-white/20 group-hover:text-white transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => {
                  setPowderType('jesmonite');
                  setVolume(100);
                  setSelectedMold(null);
                }}
                className="flex items-center gap-2 mx-auto text-white/40 hover:text-white transition-colors text-xs uppercase tracking-widest font-bold pt-4"
              >
                <RefreshCcw size={14} /> Réinitialiser
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
