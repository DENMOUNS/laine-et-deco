import React, { useEffect, useState } from 'react';
import { Product } from '../../types';
import { toast } from 'sonner';
import { Shirt, ShoppingBag, RotateCcw, Calculator, Scissors, Wind, Heart, ChevronDown, Baby, Hand, Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { useEntity } from '../hooks/useEntity';
import { useTranslation } from '../../i18n';

interface CalculatorViewProps {
  onNavigate: (view: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

const GARMENT_OPTIONS = [
  { id: 'sweater-f', name: 'Pull Femme', nameEn: 'Womens Sweater', baseSurface: 9000, icon: Shirt },
  { id: 'sweater-m', name: 'Pull Homme', nameEn: 'Mens Sweater', baseSurface: 11000, icon: Shirt },
  { id: 'scarf', name: 'Écharpe', nameEn: 'Scarf', baseSurface: 3000, icon: Wind },
  { id: 'hat', name: 'Bonnet', nameEn: 'Beanie', baseSurface: 1200, icon: Heart },
  { id: 'blanket', name: 'Couverture', nameEn: 'Blanket', baseSurface: 30000, icon: Scissors },
  { id: 'cardigan', name: 'Gilet', nameEn: 'Cardigan', baseSurface: 9500, icon: Shirt },
  { id: 'socks', name: 'Chaussettes', nameEn: 'Socks', baseSurface: 1800, icon: Flame },
  { id: 'mittens', name: 'Mitaines / Gants', nameEn: 'Mittens / Gloves', baseSurface: 1400, icon: Hand },
  { id: 'baby-sweater', name: 'Pull Bébé', nameEn: 'Baby Sweater', baseSurface: 4000, icon: Baby },
  { id: 'shawl', name: 'Châle', nameEn: 'Shawl', baseSurface: 5500, icon: Wind },
];

const SIZES = ['S', 'M', 'L', 'XL'];
const SIZE_FACTORS: Record<string, number> = { S: 0.8, M: 1.0, L: 1.2, XL: 1.4 };

export const CalculatorView: React.FC<CalculatorViewProps> = ({ onNavigate, onAddToCart }) => {
  const { t, l, isEn } = useTranslation();
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
      toast.error(isEn ? 'The selected wool product does not have length details filled yet.' : 'Le produit laine sélectionné ne possède pas encore de métrage renseigné.');
      return;
    }
    const product: Product = {
      ...yarn,
      description: isEn ? `Yarn to knit a ${garment.nameEn || garment.name}` : `Laine pour tricoter un(e) ${garment.name}`,
    };
    onAddToCart(product, finalPelotes);
    toast.success(isEn ? `${finalPelotes} balls added to cart!` : `${finalPelotes} pelotes ajoutées au panier !`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 min-h-screen">
      {/* Notice Mobile PC Uniquement */}
      <div className="md:hidden bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs font-semibold p-3.5 rounded-2xl mb-6 flex items-center gap-2">
        <span>🖥️</span> <span>{isEn ? 'This tool is optimized for PC / Desktop view.' : 'Cet outil est disponible et optimisé sur la version Ordinateur (PC).'}</span>
      </div>

      <div className="flex items-center gap-2 text-sm text-primary/70 mb-8 font-bold tracking-widest uppercase">
        <button onClick={() => onNavigate('home')} className="hover:text-primary transition-colors">
          {isEn ? 'Home' : 'Accueil'}
        </button>
        <span>&gt;</span>
        <span className="text-primary">
          {isEn ? 'Yarn Calculator' : 'Calculateur de Laine'}
        </span>
        <div className="flex-grow"></div>
        <button onClick={() => onNavigate('volume-calculator')} className="text-[#e26d24] hover:text-[#c45a1c] transition-colors flex items-center gap-2">
          <Calculator size={16} /> {isEn ? 'Go to Volume Calculator' : 'Passer au calculateur de volume'} &gt;
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start">
        {/* Left Side: Form */}
        <div className="space-y-8">
          <div>
            <h1 className="text-5xl font-serif text-primary mb-4">
              {isEn ? 'Yarn Calculator' : 'Calculateur de Laine'}
            </h1>
            <p className="text-primary/70 text-lg leading-relaxed">
              {isEn 
                ? 'Plan your next project with precision. Our tool helps you estimate the number of balls needed based on your template and selected yarn.'
                : 'Planifiez votre prochain projet avec précision. Notre outil vous aide à estimer le nombre de pelotes nécessaires en fonction de votre modèle et de la laine choisie.'}
            </p>
          </div>

          <div className="bg-white md:clay-tactile p-8 md:p-10 rounded-[2.5rem] border border-primary/10 shadow-xl shadow-primary/5 space-y-10">
            
            {/* Project type */}
            <div className="space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 block">
                {isEn ? 'What is your project?' : 'Quel est votre projet ?'}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
                {GARMENT_OPTIONS.map((g, idx) => {
                  const Icon = g.icon;
                  return (
                    <button
                      key={g.id}
                      onClick={() => {
                        setGarment(g);
                        setSurface(Math.round(g.baseSurface * (['sweater-f', 'sweater-m', 'cardigan', 'baby-sweater'].includes(g.id) ? SIZE_FACTORS[size] : 1)));
                      }}
                      className={`p-4 rounded-2xl flex flex-col items-center justify-center transition-all border-2 text-center gap-2.5 ${
                        garment.id === g.id 
                          ? 'border-accent bg-accent/10 text-accent font-bold shadow-sm' 
                          : 'border-primary/5 hover:border-primary/20 text-primary bg-secondary/30'
                      }`}
                    >
                      <Icon size={22} className={garment.id === g.id ? 'text-accent' : 'text-primary/70'} />
                      <span className="text-xs">{isEn ? g.nameEn : g.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size */}
            {needsSize && (
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 block">
                  {isEn ? 'Which size?' : 'Quelle taille ?'}
                </label>
                <div className="flex gap-3">
                  {SIZES.map(s => (
                    <button
                      key={s}
                      onClick={() => {
                        setSize(s);
                        setSurface(Math.round(garment.baseSurface * (needsSize ? SIZE_FACTORS[s] : 1)));
                      }}
                      className={`flex-1 py-3.5 rounded-2xl border-2 transition-all font-bold text-sm ${
                        size === s 
                          ? 'border-accent bg-accent/10 text-accent shadow-sm' 
                          : 'border-primary/5 hover:border-primary/20 text-primary bg-secondary/30'
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
              <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 block">
                {isEn ? 'Which yarn?' : 'Quelle laine ?'}
              </label>
              <div className="relative">
                <select 
                  className="w-full p-4 rounded-2xl bg-secondary/40 border border-primary/10 focus:outline-none focus:border-accent text-primary font-bold appearance-none cursor-pointer"
                  value={yarn?.id || ''}
                  onChange={(e) => setYarnId(e.target.value)}
                >
                  {isProductsLoading && <option value="">{isEn ? 'Loading yarns...' : 'Chargement des laines...'}</option>}
                  {!isProductsLoading && yarnProducts.length === 0 && <option value="">{isEn ? 'No yarn available' : 'Aucune laine disponible'}</option>}
                  {yarnProducts.map(y => (
                    <option key={y.id} value={y.id}>
                      {y.name} {Number(y.specs?.meterage ?? y.specs?.metrage ?? y.specs?.length ?? 0) > 0 ? `— ${Number(y.specs?.meterage ?? y.specs?.metrage ?? y.specs?.length)} m` : (isEn ? '— missing length' : '— métrage manquant')}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <ChevronDown className="text-primary/70" size={20} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 block">
                  {isEn ? 'Total project surface (cm²)' : 'Surface totale du projet (cm²)'}
                </label>
                <input type="number" min="1" step="100" value={surface} onChange={e => setSurface(Math.max(0, Number(e.target.value)))} className="w-full p-4 rounded-2xl bg-secondary/40 border border-primary/10 focus:outline-none focus:border-accent text-primary font-bold" />
                <p className="text-xs text-primary/60">
                  {isEn 
                    ? `Indicative value: ${recommendedSurface} cm². Replace it with your pattern surface.` 
                    : `Valeur indicative : ${recommendedSurface} cm². Remplacez-la par la surface de votre patron.`}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 block">
                  {isEn ? 'Measured length for 10 × 10 cm' : 'Métrage mesuré pour 10 × 10 cm'}
                </label>
                <input type="number" min="0.1" step="0.1" value={sampleMeters} onChange={e => setSampleMeters(Math.max(0, Number(e.target.value)))} className="w-full p-4 rounded-2xl bg-secondary/40 border border-primary/10 focus:outline-none focus:border-accent text-primary font-bold" />
                <p className="text-xs text-primary/60">
                  {isEn 
                    ? 'Unravel a 10 × 10 cm knitted square and measure the yarn used.' 
                    : 'Défaites un carré tricoté de 10 × 10 cm et mesurez la laine utilisée.'}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 block">
                  {isEn ? 'Gauge: stitches / 10 cm' : 'Échantillon : mailles / 10 cm'}
                </label>
                <input type="number" min="1" step="1" value={stitchesPer10} onChange={e => setStitchesPer10(Math.max(0, Number(e.target.value)))} className="w-full p-4 rounded-2xl bg-secondary/40 border border-primary/10 focus:outline-none focus:border-accent text-primary font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 block">
                  {isEn ? 'Gauge: rows / 10 cm' : 'Échantillon : rangs / 10 cm'}
                </label>
                <input type="number" min="1" step="1" value={rowsPer10} onChange={e => setRowsPer10(Math.max(0, Number(e.target.value)))} className="w-full p-4 rounded-2xl bg-secondary/40 border border-primary/10 focus:outline-none focus:border-accent text-primary font-bold" />
              </div>
            </div>

            <div className="bg-accent/10 border border-accent/20 p-5 rounded-2xl flex gap-3.5 text-primary text-sm items-start">
              <div className="mt-0.5 text-accent"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg></div>
              <p>
                {isEn 
                  ? 'Knitting formula: project stitches × meters per stitch × 1.10. Gauge stitches and rows integrate tension and stitch pattern; the 10% margin covers finishing and yarn loss.' 
                  : 'Formule tricot : mailles du projet × mètres par maille × 1,10. Les mailles et les rangs de l’échantillon intègrent la tension et le point ; les 10 % couvrent les finitions et la perte de matière.'}
              </p>
            </div>

          </div>
        </div>

        {/* Right Side: Results Card */}
        <motion.div 
          key={garment.id + size + (yarn?.id || 'no-yarn')}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#5c5e46] text-[#F9F7F2] p-10 lg:p-14 rounded-[3rem] shadow-2xl relative overflow-hidden clay-tactile border border-white/20"
        >
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 p-8 opacity-20">
             <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"></path><path d="M3 12h18"></path><path d="M18.364 5.636l-12.728 12.728"></path><path d="M5.636 5.636l12.728 12.728"></path></svg>
          </div>

          <div className="flex flex-col items-center mb-12">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6 border border-white/20">
              <Calculator size={28} className="text-[#e26d24] animate-pulse" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-2">
              {isEn ? 'Final Estimation' : 'Estimation finale'}
            </p>
            <div className="text-8xl font-serif text-[#e26d24] leading-none mb-2">{finalPelotes || '—'}</div>
            <div className="text-2xl font-serif text-white">
              {isEn ? 'Balls needed' : 'Pelotes nécessaires'}
            </div>
          </div>

          <div className="border-t border-b border-white/10 py-6 mb-8 space-y-3 text-center">
            <div className="text-sm">
              <span className="text-white/70">{isEn ? 'Project: ' : 'Projet : '}</span>
              <span className="font-bold text-white">{isEn ? garment.nameEn : garment.name}</span>
            </div>
            <div className="text-sm">
              <span className="text-white/70">{isEn ? 'Size: ' : 'Taille : '}</span>
              <span className="font-bold text-white">{needsSize ? size : (isEn ? 'Universal' : 'Unique')}</span>
            </div>
            <div className="text-sm">
              <span className="text-white/70">{isEn ? 'Yarn: ' : 'Laine : '}</span>
              <span className="font-bold text-white">{yarn?.name || (isEn ? 'No yarn selected' : 'Aucune laine sélectionnée')}</span>
            </div>
            <div className="text-sm">
              <span className="text-white/70">{isEn ? 'Calculated length: ' : 'Métrage calculé : '}</span>
              <span className="font-bold text-white">{Math.ceil(requiredMeters)}{isEn ? ' m, margin included' : ' m, marge incluse'}</span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#F9F7F2] text-center italic bg-white/5 py-4 border border-white/10 rounded-xl px-4">
              {isEn ? "Select a yarn from our boutique to add it directly to the cart:" : "Sélectionnez une laine de notre boutique pour l'ajouter directement au panier :"}
            </p>
            <button 
              onClick={handleOrder}
              className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-[#e26d24] hover:bg-[#c45a1c] text-white font-bold transition-all animate-shine overflow-hidden relative"
            >
              <ShoppingBag size={18} /> {isEn ? 'Add to cart' : 'Ajouter au panier'}
            </button>
          </div>

          <div className="flex justify-center mt-8">
            <button onClick={reset} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/70 hover:text-white transition-colors">
              <RotateCcw size={14} /> {isEn ? 'Reset' : 'Réinitialiser'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
