import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Product } from '../../types';
import { toast } from 'sonner';
import { Box, Package, Calculator, Droplets, RotateCcw, ShoppingBag, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';

interface VolumeCalculatorViewProps {
  onNavigate: (view: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

const MOLD_OPTIONS = [
  { id: 'plateau', name: 'Moule Plateau Ovale', volume: 180, image: 'https://picsum.photos/seed/plateau/100' },
  { id: 'vase', name: 'Moule Vase Coquillage', volume: 450, image: 'https://picsum.photos/seed/vase/100' },
  { id: 'dessous', name: 'Moule Dessous de verre', volume: 80, image: 'https://picsum.photos/seed/dessous/100' },
];

const MATERIAL_OPTIONS = [
  { id: 'gypsum', name: 'Gypsum', subtitle: 'SYSTÈME POUDRE/EAU (3.5:1)', ratioPart1: 3.5, ratioPart2: 1, density: 1.3, fillFactor: 0.95, wasteFactor: 1.08, part1Name: 'Poudre (G)', part2Name: 'Eau (ML)' },
  { id: 'resin', name: 'Résine', subtitle: 'SYSTÈME ÉPOXY (2:1)', ratioPart1: 2, ratioPart2: 1, density: 1.1, fillFactor: 0.92, wasteFactor: 1.05, part1Name: 'Résine A (G)', part2Name: 'Durcisseur B (G)' },
];

export const VolumeCalculatorView: React.FC<VolumeCalculatorViewProps> = ({ onNavigate, onAddToCart }) => {
  const [material, setMaterial] = useState(MATERIAL_OPTIONS[0]);
  const [volume, setVolume] = useState(100);
  const [selectedMold, setSelectedMold] = useState<string | null>(null);
  const [fillFactor, setFillFactor] = useState(material.fillFactor);
  const [safetyMargin, setSafetyMargin] = useState(material.wasteFactor);
  
  // New State for geometric calculation
  const [calcMode, setCalcMode] = useState<'slider' | 'dimensions'>('slider');
  const [geoShape, setGeoShape] = useState<'rectangle' | 'cylinder'>('rectangle');
  const [dim, setDim] = useState({ length: 15, width: 10, height: 2, radius: 5 });

  // Handle Dimension changes
  useEffect(() => {
    if (calcMode === 'dimensions') {
      let calcVol = 0;
      if (geoShape === 'rectangle') {
        calcVol = dim.length * dim.width * dim.height;
      } else if (geoShape === 'cylinder') {
        calcVol = Math.PI * Math.pow(dim.radius, 2) * dim.height;
      }
      setVolume(Math.max(1, Math.round(calcVol)));
      setSelectedMold(null);
    }
  }, [calcMode, geoShape, dim]);

  useEffect(() => {
    setFillFactor(material.fillFactor);
    setSafetyMargin(material.wasteFactor);
  }, [material]);

  const effectiveVolumeMl = Math.max(1, Math.round(volume * fillFactor * safetyMargin));
  const totalMassGr = Math.max(1, Math.round(effectiveVolumeMl * material.density));
  const totalParts = material.ratioPart1 + material.ratioPart2;
  const part1Weight = Math.round(totalMassGr * material.ratioPart1 / totalParts);
  const part2Weight = Math.round(totalMassGr * material.ratioPart2 / totalParts);
  const totalWeight = part1Weight + part2Weight;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
    setSelectedMold(null);
  };

  const handleMoldSelect = (moldVolume: number, moldId: string) => {
    setVolume(moldVolume);
    setSelectedMold(moldId);
    setCalcMode('slider'); // Switch back to slider visualization visually
  };

  const reset = () => {
    setVolume(100);
    setSelectedMold(null);
    setCalcMode('slider');
    setFillFactor(material.fillFactor);
    setSafetyMargin(material.wasteFactor);
    setDim({ length: 15, width: 10, height: 2, radius: 5 });
  };

  const handleOrder = () => {
    const product: Product = {
      id: `material-${material.id}`,
      name: `${material.name} - Kit Standard`,
      price: 25000,
      description: `Matière ${material.name}`,
      image: 'https://picsum.photos/seed/jesmonite/100', // Placeholder
      category: 'Matière',
      stock: 100,
      isAvailable: true,
      rating: 5,
    };
    onAddToCart(product, 1);
    toast.success(`Produit recommandé ajouté au panier !`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
      <div className="flex items-center gap-2 text-sm text-primary/70 mb-8 font-bold tracking-widest uppercase">
        <button onClick={() => onNavigate('home')} className="hover:text-primary transition-colors">Accueil</button>
        <span>&gt;</span>
        <span className="text-primary">Calculateur de Volume</span>
        <div className="flex-grow"></div>
        <button onClick={() => onNavigate('calculator')} className="text-[#e26d24] hover:text-[#c45a1c] transition-colors flex items-center gap-2">
          <Package size={16} /> Passer au calculateur de laine &gt;
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        {/* Left Side: Form */}
        <div className="space-y-8">
          <div>
            <h1 className="text-5xl font-serif text-primary mb-4">Calculateur de Volume</h1>
            <p className="text-primary/70 text-lg leading-relaxed">
              Dosez vos poudres créatives avec précision. Que vous utilisiez de la Jesmonite ou du plâtre, cet outil vous donne les proportions exactes pour remplir vos moules sans gaspillage.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-primary/10 shadow-xl shadow-primary/5 space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 block">Type de matière</label>
              <div className="grid grid-cols-2 gap-4">
                {MATERIAL_OPTIONS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMaterial(m)}
                    className={`p-6 rounded-2xl flex flex-col items-center justify-center transition-all border-2 text-center gap-2 ${
                      material.id === m.id 
                        ? 'border-[#e26d24] bg-[#e26d24]/5 text-[#e26d24]' 
                        : 'border-primary/5 hover:border-primary/20 text-primary'
                    }`}
                  >
                    {m.id === 'resin' ? <Droplets size={24} /> : <Box size={24} />}
                    <span className="font-bold text-sm">{m.name}</span>
                    <span className="text-[9px] uppercase tracking-wider opacity-70">{m.subtitle}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Volume Selection Mode */}
            <div className="space-y-6">
              <div className="flex bg-primary/5 rounded-xl p-1 mb-4 w-full">
                <button 
                  onClick={() => setCalcMode('slider')} 
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${calcMode === 'slider' ? 'bg-white shadow text-[#e26d24]' : 'text-primary/70 hover:text-primary'}`}
                >
                  Saisie manuelle
                </button>
                <button 
                  onClick={() => setCalcMode('dimensions')} 
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${calcMode === 'dimensions' ? 'bg-white shadow text-[#e26d24]' : 'text-primary/70 hover:text-primary'}`}
                >
                  Par dimensions
                </button>
              </div>

              {calcMode === 'slider' ? (
                <>
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Volume du moule (ML)</label>
                    <span className="text-[#e26d24] font-bold bg-[#e26d24]/10 px-3 py-1 rounded-full text-sm">{volume} ml</span>
                  </div>
                  <div className="relative pt-2">
                    <input 
                      type="range" 
                      min="10" 
                      max="2000" 
                      step="10"
                      value={volume} 
                      onChange={handleSliderChange}
                      className="w-full h-2 bg-primary/10 rounded-lg appearance-none cursor-pointer accent-[#e26d24]"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-primary/70 mt-2">
                      <span>10 ML</span>
                      <span>1000 ML</span>
                      <span>2000 ML</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <select 
                      value={geoShape} 
                      onChange={(e) => setGeoShape(e.target.value as any)} 
                      className="w-full p-4 rounded-2xl bg-[#F9F7F2] border border-primary/10 focus:outline-none focus:border-[#e26d24] text-primary text-sm font-bold appearance-none cursor-pointer"
                    >
                      <option value="rectangle">Moule Rectangulaire / Carré</option>
                      <option value="cylinder">Moule Cylindrique (Rond)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <ChevronDown className="text-primary/70" size={20} />
                    </div>
                  </div>

                  {geoShape === 'rectangle' ? (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 ml-1">Long (cm)</label>
                        <input type="number" min="1" value={dim.length} onChange={e => setDim({...dim, length: Number(e.target.value)})} className="w-full p-3 bg-primary/5 rounded-xl border-none focus:ring-1 focus:ring-[#e26d24] text-center font-bold" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 ml-1">Larg (cm)</label>
                        <input type="number" min="1" value={dim.width} onChange={e => setDim({...dim, width: Number(e.target.value)})} className="w-full p-3 bg-primary/5 rounded-xl border-none focus:ring-1 focus:ring-[#e26d24] text-center font-bold" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 ml-1">Haut (cm)</label>
                        <input type="number" min="0.1" step="0.1" value={dim.height} onChange={e => setDim({...dim, height: Number(e.target.value)})} className="w-full p-3 bg-primary/5 rounded-xl border-none focus:ring-1 focus:ring-[#e26d24] text-center font-bold" />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 ml-1">Rayon (cm)</label>
                        <input type="number" min="1" value={dim.radius} onChange={e => setDim({...dim, radius: Number(e.target.value)})} className="w-full p-3 bg-primary/5 rounded-xl border-none focus:ring-1 focus:ring-[#e26d24] text-center font-bold" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 ml-1">Haut (cm)</label>
                        <input type="number" min="0.1" step="0.1" value={dim.height} onChange={e => setDim({...dim, height: Number(e.target.value)})} className="w-full p-3 bg-primary/5 rounded-xl border-none focus:ring-1 focus:ring-[#e26d24] text-center font-bold" />
                      </div>
                    </div>
                  )}
                  <div className="bg-[#e26d24]/10 text-[#e26d24] p-3 rounded-xl text-center font-bold text-sm">
                    Volume estimé : {volume} ml
                  </div>
                </div>
              )}
            </div>

            {/* Mod Sélection */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 block">Ou sélectionnez un de nos moules</label>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                {MOLD_OPTIONS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleMoldSelect(m.volume, m.id)}
                    className={`flex-shrink-0 flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                      selectedMold === m.id ? 'border-[#e26d24] bg-[#e26d24]/5' : 'border-primary/5 hover:border-primary/20'
                    }`}
                  >
                    <img src={m.image} alt={m.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div className="text-left pr-4">
                      <div className="font-bold text-sm text-primary">{m.name}</div>
                      <div className="text-[#e26d24] font-bold text-xs">{m.volume} ml</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Remplissage réel du moule</label>
                  <span className="text-sm font-bold text-[#e26d24]">{(fillFactor * 100).toFixed(0)}%</span>
                </div>
                <input type="range" min="0.7" max="1" step="0.01" value={fillFactor} onChange={(e) => setFillFactor(Number(e.target.value))} className="w-full h-2 bg-primary/10 rounded-lg appearance-none cursor-pointer accent-[#e26d24]" />
                <p className="text-xs text-primary/60">Pour un objet décoratif, on ne remplit jamais à 100 % si le moule a des zones creuses ou si l’objet n’est pas complètement plein.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Marge de sécurité</label>
                  <span className="text-sm font-bold text-[#e26d24]">{(safetyMargin * 100).toFixed(0)}%</span>
                </div>
                <input type="range" min="1" max="1.15" step="0.01" value={safetyMargin} onChange={(e) => setSafetyMargin(Number(e.target.value))} className="w-full h-2 bg-primary/10 rounded-lg appearance-none cursor-pointer accent-[#e26d24]" />
                <p className="text-xs text-primary/60">Ajoute une marge pour les pertes, les bulles, les finitions et les petites variations de mélange.</p>
              </div>
            </div>

            <div className="bg-[#eff3fd] border border-blue-100 p-4 rounded-xl flex gap-3 text-[#2d5db0] text-sm items-start">
              <div className="mt-0.5"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg></div>
              <p>Le calcul combine le volume réel du moule, le remplissage utile du moule, la densité du matériau et une marge de sécurité. C’est plus adapté au moulage de pièces décoratives qu’un simple ratio brut.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Results Card */}
        <motion.div 
          key={material.id + volume}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#5c5e46] text-[#F9F7F2] p-10 lg:p-14 rounded-[3rem] shadow-2xl relative overflow-hidden"
        >
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 p-8 opacity-20">
             <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"></path><path d="M3 12h18"></path><path d="M18.364 5.636l-12.728 12.728"></path><path d="M5.636 5.636l12.728 12.728"></path></svg>
          </div>

          <div className="flex flex-col items-center mb-12">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6 border border-white/20">
              <Calculator size={28} className="text-[#e26d24] animate-pulse" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-2">Dosage Recommandé</p>
            <h2 className="text-4xl font-serif text-white">Proportions Idéales</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              {material.id === 'resin' ? <Droplets size={24} className="text-[#e26d24] mb-4" /> : <Box size={24} className="text-[#e26d24] mb-4" />}
              <div className="text-4xl font-serif text-white mb-2">{part1Weight}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/70">{material.part1Name}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              {material.id === 'resin' ? <Droplets size={24} className="text-[#e26d24] mb-4" /> : <Droplets size={24} className="text-[#e26d24] mb-4" />}
              <div className="text-4xl font-serif text-white mb-2">{part2Weight}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/70">{material.part2Name}</div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 pb-10 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/70">Volume utile du moule</span>
              <span className="font-bold text-white">{volume} ml</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/70">Volume à préparer</span>
              <span className="font-bold text-white">{effectiveVolumeMl} ml</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/70">Poids Total Est.</span>
              <span className="font-bold text-white">{totalWeight} g</span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 text-center">Produits Recommandés</p>
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-white/20 transition-colors" onClick={handleOrder}>
               <div className="flex items-center gap-4">
                 <img src="https://picsum.photos/seed/jesmonite/100" alt="Matière" className="w-10 h-10 rounded-lg object-cover" />
                 <div>
                   <div className="font-bold text-sm text-white">{material.name} - Kit Standard</div>
                   <div className="text-white/70 text-xs">25 000 FCFA</div>
                 </div>
               </div>
               <ShoppingBag size={18} className="text-white/70" />
            </div>
          </div>

          <div className="flex justify-center">
            <button onClick={reset} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors">
              <RotateCcw size={14} /> Réinitialiser
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
