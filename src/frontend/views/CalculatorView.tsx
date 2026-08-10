import React, { useEffect, useState } from 'react';
import { Product } from '../../types';
import { toast } from 'sonner';
import { Shirt, ShoppingBag, RotateCcw, Calculator, Scissors, Wind, Heart, ChevronDown, Baby, Hand, Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { useEntity } from '../hooks/useEntity';

interface CalculatorViewProps {
  onNavigate: (view: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

const GARMENT_OPTIONS = [
  { id: 'sweater-f', name: 'Pull Femme', baseSurface: 9000, icon: Shirt },
  { id: 'sweater-m', name: 'Pull Homme', baseSurface: 11000, icon: Shirt },
  { id: 'scarf', name: 'Écharpe', baseSurface: 3000, icon: Wind },
  { id: 'hat', name: 'Bonnet', baseSurface: 1200, icon: Heart },
  { id: 'blanket', name: 'Couverture', baseSurface: 30000, icon: Scissors },
  { id: 'cardigan', name: 'Gilet', baseSurface: 9500, icon: Shirt },
  { id: 'socks', name: 'Chaussettes', baseSurface: 1800, icon: Flame },
  { id: 'mittens', name: 'Mitaines / Gants', baseSurface: 1400, icon: Hand },
  { id: 'baby-sweater', name: 'Pull Bébé', baseSurface: 4000, icon: Baby },
  { id: 'shawl', name: 'Châle', baseSurface: 5500, icon: Wind },
];

const SIZES = ['S', 'M', 'L', 'XL'];
const SIZE_FACTORS: Record<string, number> = { S: 0.8, M: 1.0, L: 1.2, XL: 1.4 };

export const CalculatorView: React.FC<CalculatorViewProps> = ({ onNavigate, onAddToCart }) => {
  const { data: products, isLoading: isProductsLoading } = useEntity<Product>('product', [], { cacheOnly: true });
  const yarnProducts = products.filter(product => product.category?.toLowerCase().includes('laine'));
  const [garment, setGarment] = useState(GARMENT_OPTIONS[0]);
  const [size, setSize] = useState('M');
  const [yarnId, setYarnId] = useState('');
  const [surface, setSurface] = useState(GARMENT_OPTIONS[0].baseSurface);
  const [sampleMeters, setSampleMeters] = useState(8);
  const [stitchesPer10, setStitchesPer10] = useState(22);
  const [rowsPer10, setRowsPer10] = useState(30);

  const yarn = yarnProducts.find(product => product.id === yarnId) || yarnProducts[0];
  const yarnMeterage = Number(yarn?.specs?.meterage ?? yarn?.specs?.metrage ?? yarn?.specs?.length ?? 0);

  useEffect(() => {
    if (!yarnId && yarnProducts[0]) setYarnId(yarnProducts[0].id);
  }, [yarnId, yarnProducts]);

  // La consommation doit être mesurée sur un échantillon de 10 x 10 cm.
  // Cette méthode conserve le point et le type de tricot réels du projet.
  const needsSize = ['sweater-f', 'sweater-m', 'cardigan', 'baby-sweater'].includes(garment.id);
  const recommendedSurface = Math.round(garment.baseSurface * (needsSize ? SIZE_FACTORS[size] : 1));
  const sampleStitches = (stitchesPer10 * rowsPer10);
  const projectStitches = (surface / 100) * sampleStitches;
  const metersPerStitch = sampleStitches > 0 ? sampleMeters / sampleStitches : 0;
  const requiredMeters = projectStitches * metersPerStitch * 1.10;
  const finalPelotes = yarnMeterage > 0 && requiredMeters > 0 ? Math.ceil(requiredMeters / yarnMeterage) : 0;

  const reset = () => {
    setGarment(GARMENT_OPTIONS[0]);
    setSize('M');
    setYarnId(yarnProducts[0]?.id || '');
    setSurface(GARMENT_OPTIONS[0].baseSurface);
    setSampleMeters(8);
    setStitchesPer10(22);
    setRowsPer10(30);
  };

  const handleOrder = () => {
    if (!yarn || !yarnMeterage || !finalPelotes) {
      toast.error('Le produit laine sélectionné ne possède pas encore de métrage renseigné.');
      return;
    }
    const product: Product = {
      ...yarn,
      description: `Laine pour tricoter un(e) ${garment.name}`,
    };
    onAddToCart(product, finalPelotes);
    toast.success(`${finalPelotes} pelotes ajoutées au panier !`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
      <div className="flex items-center gap-2 text-sm text-primary/70 mb-8 font-bold tracking-widest uppercase">
        <button onClick={() => onNavigate('home')} className="hover:text-primary transition-colors">Accueil</button>
        <span>&gt;</span>
        <span className="text-primary">Calculateur de Laine</span>
        <div className="flex-grow"></div>
        <button onClick={() => onNavigate('volume-calculator')} className="text-[#e26d24] hover:text-[#c45a1c] transition-colors flex items-center gap-2">
          <Calculator size={16} /> Passer au calculateur de volume &gt;
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        {/* Left Side: Form */}
        <div className="space-y-8">
          <div>
            <h1 className="text-5xl font-serif text-primary mb-4">Calculateur de Laine</h1>
            <p className="text-primary/70 text-lg leading-relaxed">
              Planifiez votre prochain projet avec précision. Notre outil vous aide à estimer le nombre de pelotes nécessaires en fonction de votre modèle et de la laine choisie.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-primary/10 shadow-xl shadow-primary/5 space-y-10">
            
            {/* Project type */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 block">Quel est votre projet ?</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {GARMENT_OPTIONS.map((g, idx) => {
                  const Icon = g.icon;
                  return (
                    <button
                      key={g.id}
                      onClick={() => {
                        setGarment(g);
                        setSurface(Math.round(g.baseSurface * (['sweater-f', 'sweater-m', 'cardigan', 'baby-sweater'].includes(g.id) ? SIZE_FACTORS[size] : 1)));
                      }}
                      className={`p-4 rounded-xl flex flex-col items-center justify-center transition-all border-2 text-center gap-2 ${
                        garment.id === g.id 
                          ? 'border-[#e26d24] bg-[#e26d24]/5 text-[#e26d24]' 
                          : 'border-primary/5 hover:border-primary/20 text-primary'
                      }`}
                    >
                      <Icon size={20} className={garment.id === g.id ? 'text-[#e26d24]' : 'text-primary/70'} />
                      <span className="font-bold text-xs">{g.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size */}
            {needsSize && (
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 block">Quelle taille ?</label>
                <div className="flex gap-3">
                  {SIZES.map(s => (
                    <button
                      key={s}
                      onClick={() => {
                        setSize(s);
                        setSurface(Math.round(garment.baseSurface * (needsSize ? SIZE_FACTORS[s] : 1)));
                      }}
                      className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold text-sm ${
                        size === s 
                          ? 'border-[#e26d24] bg-[#e26d24]/5 text-[#e26d24]' 
                          : 'border-primary/5 hover:border-primary/20 text-primary'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Yarn Type */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 block">Quelle laine ?</label>
              <div className="relative">
                <select 
                  className="w-full p-4 rounded-2xl bg-[#eff3fd]/30 border border-primary/10 focus:outline-none focus:border-[#e26d24] text-primary font-bold appearance-none cursor-pointer"
                  value={yarn?.id || ''}
                  onChange={(e) => setYarnId(e.target.value)}
                >
                  {isProductsLoading && <option value="">Chargement des laines...</option>}
                  {!isProductsLoading && yarnProducts.length === 0 && <option value="">Aucune laine disponible</option>}
                  {yarnProducts.map(y => (
                    <option key={y.id} value={y.id}>
                      {y.name} {Number(y.specs?.meterage ?? y.specs?.metrage ?? y.specs?.length ?? 0) > 0 ? `— ${Number(y.specs?.meterage ?? y.specs?.metrage ?? y.specs?.length)} m` : '— métrage manquant'}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <ChevronDown className="text-primary/70" size={20} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 block">Surface totale du projet (cm²)</label>
                <input type="number" min="1" step="100" value={surface} onChange={e => setSurface(Math.max(0, Number(e.target.value)))} className="w-full p-4 rounded-2xl bg-[#eff3fd]/30 border border-primary/10 focus:outline-none focus:border-[#e26d24] text-primary font-bold" />
                <p className="text-xs text-primary/60">Valeur indicative : {recommendedSurface} cm². Remplacez-la par la surface de votre patron.</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 block">Métrage mesuré pour 10 × 10 cm</label>
                <input type="number" min="0.1" step="0.1" value={sampleMeters} onChange={e => setSampleMeters(Math.max(0, Number(e.target.value)))} className="w-full p-4 rounded-2xl bg-[#eff3fd]/30 border border-primary/10 focus:outline-none focus:border-[#e26d24] text-primary font-bold" />
                <p className="text-xs text-primary/60">Défaites un carré tricoté de 10 × 10 cm et mesurez la laine utilisée.</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 block">Échantillon : mailles / 10 cm</label>
                <input type="number" min="1" step="1" value={stitchesPer10} onChange={e => setStitchesPer10(Math.max(0, Number(e.target.value)))} className="w-full p-4 rounded-2xl bg-[#eff3fd]/30 border border-primary/10 focus:outline-none focus:border-[#e26d24] text-primary font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 block">Échantillon : rangs / 10 cm</label>
                <input type="number" min="1" step="1" value={rowsPer10} onChange={e => setRowsPer10(Math.max(0, Number(e.target.value)))} className="w-full p-4 rounded-2xl bg-[#eff3fd]/30 border border-primary/10 focus:outline-none focus:border-[#e26d24] text-primary font-bold" />
              </div>
            </div>

            <div className="bg-[#eff3fd] border border-blue-100 p-4 rounded-xl flex gap-3 text-[#2d5db0] text-sm items-start">
              <div className="mt-0.5"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg></div>
              <p>Formule tricot : mailles du projet × mètres par maille × 1,10. Les mailles et les rangs de l’échantillon intègrent la tension et le point ; les 10 % couvrent les finitions et la perte de matière.</p>
            </div>

          </div>
        </div>

        {/* Right Side: Results Card */}
        <motion.div 
          key={garment.id + size + (yarn?.id || 'no-yarn')}
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
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-2">Estimation finale</p>
            <div className="text-8xl font-serif text-[#e26d24] leading-none mb-2">{finalPelotes || '—'}</div>
            <div className="text-2xl font-serif text-white">Pelotes nécessaires</div>
          </div>

          <div className="border-t border-b border-white/10 py-6 mb-8 space-y-3 text-center">
            <div className="text-sm">
              <span className="text-white/70">Projet : </span>
              <span className="font-bold text-white">{garment.name}</span>
            </div>
            <div className="text-sm">
              <span className="text-white/70">Taille : </span>
              <span className="font-bold text-white">{needsSize ? size : 'Unique'}</span>
            </div>
            <div className="text-sm">
              <span className="text-white/70">Laine : </span>
              <span className="font-bold text-white">{yarn?.name || 'Aucune laine sélectionnée'}</span>
            </div>
            <div className="text-sm">
              <span className="text-white/70">Métrage calculé : </span>
              <span className="font-bold text-white">{Math.ceil(requiredMeters)} m, marge incluse</span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#F9F7F2] text-center italic bg-white/5 py-4 border border-white/10 rounded-xl px-4">
              Sélectionnez une laine de notre boutique pour l'ajouter directement au panier :
            </p>
            <button 
              onClick={handleOrder}
              className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-[#e26d24] hover:bg-[#c45a1c] text-white font-bold transition-all animate-shine overflow-hidden relative"
            >
              <ShoppingBag size={18} /> Ajouter au panier
            </button>
          </div>

          <div className="flex justify-center mt-8">
            <button onClick={reset} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors">
              <RotateCcw size={14} /> Réinitialiser
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
