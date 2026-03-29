import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calculator, ChevronRight, Info, RefreshCcw, ShoppingBag, Shirt, User, Wind, Cloud, Home, Sparkles, Flower2, Box } from 'lucide-react';
import { PRODUCTS } from '../constants';
import { Product } from '../types';

interface WoolCalculatorViewProps {
  onNavigate: (view: string, id?: string) => void;
  onAddToCart: (p: Product, q: number) => void;
}

export const WoolCalculatorView: React.FC<WoolCalculatorViewProps> = ({ onNavigate, onAddToCart }) => {
  const [project, setProject] = useState('pull');
  const [size, setSize] = useState('M');
  const [yarnType, setYarnType] = useState('merinos'); // Default yarn type for calculation if no product selected
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const yarnProducts = PRODUCTS.filter(p => p.category === 'Laines');

  const projects = [
    { id: 'pull', name: 'Pull Femme', icon: <Shirt size={24} />, baseMeters: { S: 1000, M: 1200, L: 1400, XL: 1600 } },
    { id: 'pull-homme', name: 'Pull Homme', icon: <User size={24} />, baseMeters: { S: 1300, M: 1500, L: 1700, XL: 1900 } },
    { id: 'echarpe', name: 'Écharpe', icon: <Wind size={24} />, baseMeters: { S: 400, M: 500, L: 600, XL: 700 } },
    { id: 'bonnet', name: 'Bonnet', icon: <Cloud size={24} />, baseMeters: { S: 150, M: 200, L: 250, XL: 300 } },
    { id: 'couverture', name: 'Couverture', icon: <Home size={24} />, baseMeters: { S: 2000, M: 2000, L: 2000, XL: 2000 } },
  ];

  const sizes = ['S', 'M', 'L', 'XL'];

  const calculateNeeded = () => {
    const selectedProj = projects.find(p => p.id === project);
    if (!selectedProj) return 0;

    const metersNeeded = selectedProj.baseMeters[size as keyof typeof selectedProj.baseMeters];
    
    // If a product is selected, use its yardage
    if (selectedProduct && selectedProduct.yardage) {
      return Math.ceil(metersNeeded / selectedProduct.yardage);
    }

    // Fallback based on yarn type (average yardage per 50g)
    const averageYardage: Record<string, number> = {
      merinos: 125,
      alpaga: 150,
      coton: 110,
      grosse: 60
    };
    return Math.ceil(metersNeeded / averageYardage[yarnType]);
  };

  const ballsNeeded = calculateNeeded();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-primary/40">
          <button onClick={() => onNavigate('home')} className="hover:text-primary transition-colors">Accueil</button>
          <ChevronRight size={14} />
          <span className="text-primary">Calculateur de Laine</span>
        </nav>
        
        <button 
          onClick={() => onNavigate('volume-calculator')}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent hover:text-primary transition-colors group"
        >
          <Box size={14} className="group-hover:rotate-12 transition-transform" />
          Passer au calculateur de volume
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
            <h1 className="text-5xl font-serif text-primary mb-6">Calculateur de Laine</h1>
            <p className="text-primary/60 leading-relaxed">
              Planifiez votre prochain projet avec précision. Notre outil vous aide à estimer le nombre de pelotes nécessaires en fonction de votre modèle et de la laine choisie.
            </p>
          </div>

          <div className="space-y-8 bg-white p-8 rounded-[3rem] shadow-sm border border-primary/5">
            {/* Project Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-primary/40 mb-4">Quel est votre projet ?</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setProject(p.id)}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                      project === p.id ? 'border-accent bg-accent/5 text-accent' : 'border-primary/5 hover:border-primary/20 text-primary/60'
                    }`}
                  >
                    <span className="text-accent/60">{p.icon}</span>
                    <span className="text-xs font-bold text-center">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-primary/40 mb-4">Quelle taille ?</label>
              <div className="flex gap-3">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`flex-grow py-4 rounded-2xl border-2 font-bold transition-all ${
                      size === s ? 'border-accent bg-accent/5 text-accent' : 'border-primary/5 hover:border-primary/20 text-primary/60'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Yarn Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-primary/40 mb-4">Quelle laine ?</label>
              <div className="space-y-4">
                <select 
                  className="w-full p-4 rounded-2xl border-2 border-primary/5 bg-secondary/30 focus:outline-none focus:border-accent font-medium text-primary"
                  onChange={(e) => {
                    const prod = yarnProducts.find(p => p.id === e.target.value);
                    setSelectedProduct(prod || null);
                    if (!prod) setYarnType(e.target.value);
                  }}
                  value={selectedProduct?.id || yarnType}
                >
                  <optgroup label="Nos Laines">
                    {yarnProducts.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.yardage}m)</option>
                    ))}
                  </optgroup>
                  <optgroup label="Types standards">
                    <option value="merinos">Mérinos standard (125m)</option>
                    <option value="alpaga">Alpaga fin (150m)</option>
                    <option value="coton">Coton (110m)</option>
                    <option value="grosse">Grosse laine (60m)</option>
                  </optgroup>
                </select>
                
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl text-blue-700 text-xs">
                  <Info size={16} className="shrink-0 mt-0.5" />
                  <p>Les estimations sont basées sur un échantillon standard. Prévoyez toujours une pelote de sécurité pour les finitions.</p>
                </div>
              </div>
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
            {/* Decorative background element */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

            <div className="relative z-10 text-center space-y-8">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto backdrop-blur-md border border-white/10 relative">
                <Calculator size={32} className="text-accent" />
                <Sparkles size={16} className="text-white absolute -top-1 -right-1 animate-pulse" />
              </div>
              
              <div>
                <p className="text-white/60 uppercase tracking-[0.3em] text-xs font-bold mb-2">Estimation finale</p>
                <h2 className="text-8xl font-serif font-bold text-accent">{ballsNeeded}</h2>
                <p className="text-2xl font-serif text-white/90 mt-2">Pelotes nécessaires</p>
              </div>

              <div className="pt-8 border-t border-white/10 text-sm text-white/60 space-y-2">
                <p>Projet : <span className="text-white font-bold">{projects.find(p => p.id === project)?.name}</span></p>
                <p>Taille : <span className="text-white font-bold">{size}</span></p>
                <p>Laine : <span className="text-white font-bold">{selectedProduct?.name || yarnType}</span></p>
              </div>

              {selectedProduct ? (
                <div className="pt-8 flex flex-col gap-4">
                  <button 
                    onClick={() => onAddToCart(selectedProduct, ballsNeeded)}
                    className="w-full bg-accent text-white py-5 rounded-2xl font-bold hover:bg-white hover:text-primary transition-all flex items-center justify-center gap-3 shadow-xl shadow-accent/20"
                  >
                    <ShoppingBag size={20} />
                    Ajouter au panier ({ballsNeeded} pelotes)
                  </button>
                  <button 
                    onClick={() => onNavigate('product-detail', selectedProduct.id)}
                    className="text-white/60 hover:text-white transition-colors text-sm font-bold flex items-center justify-center gap-2"
                  >
                    Voir le produit <ChevronRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="pt-8 space-y-6">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-xs text-white/60 italic mb-4">Sélectionnez une laine de notre boutique pour l'ajouter directement au panier :</p>
                    <div className="grid grid-cols-1 gap-3">
                      {yarnProducts.slice(0, 3).map(p => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedProduct(p)}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group"
                        >
                          <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                          <div className="flex-grow">
                            <p className="text-xs font-bold text-white group-hover:text-accent transition-colors">{p.name}</p>
                            <p className="text-[10px] text-white/40">{p.price.toLocaleString()} FCFA</p>
                          </div>
                          <ChevronRight size={14} className="text-white/20 group-hover:text-white transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <button 
                onClick={() => {
                  setProject('pull');
                  setSize('M');
                  setSelectedProduct(null);
                  setYarnType('merinos');
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
