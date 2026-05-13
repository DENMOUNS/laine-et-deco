import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  RotateCcw, 
  Sparkles, 
  ChevronRight, 
  Info, 
  Check,
  Palette,
  Wind,
  MousePointer2,
  Zap
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { toast } from 'sonner';
import { Loader } from '../components/Loader';
import { useProducts } from '../hooks/useProducts';
import { Product } from '../../types';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODELS = [
  { id: 'pull', name: 'Pull Oversize', baseImage: 'https://picsum.photos/seed/pull-base/800/800' },
  { id: 'scarf', name: 'Écharpe XXL', baseImage: 'https://picsum.photos/seed/scarf-base/800/800' },
  { id: 'beanie', name: 'Bonnet Pompon', baseImage: 'https://picsum.photos/seed/beanie-base/800/800' }
];

const COLORS = [
  { id: 'c1', name: 'Bleu Nuit', hex: '#1e3a8a', productId: '1' },
  { id: 'c2', name: 'Terracotta', hex: '#9a3412', productId: '2' },
  { id: 'c3', name: 'Émeraude', hex: '#064e3b', productId: '3' },
  { id: 'c4', name: 'Moutarde', hex: '#a16207', productId: '4' },
  { id: 'c5', name: 'Gris Perle', hex: '#4b5563', productId: '7' },
  { id: 'c6', name: 'Rose Poudré', hex: '#be185d', productId: '8' }
];

interface KnittingConfiguratorProps {
  onAddToCart?: (product: Product) => void;
}

export const KnittingConfiguratorView: React.FC<KnittingConfiguratorProps> = ({ onAddToCart }) => {
  const { products } = useProducts();
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[1]);
  const [isRotating, setIsRotating] = useState(false);
  const [userVibe, setUserVibe] = useState('');
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const handleAddToCart = () => {
    const product = products.find(p => p.id === selectedColor.productId);
    if (product) {
      onAddToCart?.(product);
      toast.success(`${product.name} ajouté à votre kit créatif`);
    } else {
      toast.error("Produit non trouvé en stock");
    }
  };

  const getAiColorAdvice = async () => {
    if (!userVibe.trim()) {
      toast.error("Dites-nous quel style ou quelle occasion vous recherchez !");
      return;
    }

    setIsAiSuggesting(true);
    try {
      const prompt = `En tant qu'expert en mode et tricot, analyse cette "vibe" ou occasion: "${userVibe}".
      Choisis la MEILLEURE couleur parmi cette liste: ${COLORS.map(c => c.name).join(', ')}.
      Réponds en JSON avec ce format: {"suggestedColor": "Nom de la couleur", "reason": "Explication courte en une phrase"}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              suggestedColor: { type: "string" },
              reason: { type: "string" }
            },
            required: ["suggestedColor", "reason"]
          }
        }
      });
      
      const data = JSON.parse(response.text.trim());
      
      const foundColor = COLORS.find(c => c.name.toLowerCase().includes(data.suggestedColor.toLowerCase()));
      if (foundColor) {
        setSelectedColor(foundColor);
        setAiSuggestion(data.reason);
        toast.success(`L'IA suggère: ${foundColor.name}`);
      }
    } catch (error) {
      console.error("AI Error:", error);
      toast.error("L'IA est un peu fatiguée, choisissez votre couleur préférée !");
    } finally {
      setIsAiSuggesting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 inline-flex"
          >
            <Zap size={12} className="text-accent" />
            <span>Atelier de Personnalisation</span>
          </motion.div>
          <h1 className="text-5xl font-serif text-primary">Le Configurateur <span className="italic text-accent">Magique</span></h1>
        </div>
        <p className="text-primary/40 max-w-md text-sm italic">
          Visualisez votre futur ouvrage avant même de toucher vos aiguilles. L'IA vous accompagne pour le choix parfait.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left: Preview Area */}
        <div className="lg:col-span-7 space-y-8">
          <div className="relative aspect-square bg-card rounded-[3.5rem] border border-primary/5 shadow-2xl overflow-hidden group">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${selectedModel.id}-${selectedColor.id}`}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.6, ease: "circOut" }}
                className="w-full h-full relative"
              >
                {/* Simulated 3D Layering */}
                <img 
                  src={selectedModel.baseImage} 
                  alt={selectedModel.name} 
                  className="w-full h-full object-cover mix-blend-multiply opacity-90"
                  referrerPolicy="no-referrer"
                />
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.75 }}
                  className="absolute inset-0 transition-colors duration-1000"
                  style={{ backgroundColor: selectedColor.hex, mixBlendMode: 'overlay' }}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/10 pointer-events-none" />
              </motion.div>
            </AnimatePresence>

            {/* Floating Controls */}
            <div className="absolute inset-x-8 bottom-8 flex justify-between items-center">
              <div className="flex gap-3">
                <button 
                  onClick={() => { setIsRotating(true); setTimeout(() => setIsRotating(false), 1000); }}
                  className={`p-5 bg-white/90 backdrop-blur-xl rounded-full shadow-2xl text-primary hover:bg-accent hover:text-white transition-all duration-500 hover:scale-110 active:scale-95 ${isRotating ? 'rotate-180' : ''}`}
                >
                  <RotateCcw size={24} />
                </button>
              </div>
              
              <motion.div 
                layoutId="colorBadge"
                className="px-8 py-5 bg-white/90 backdrop-blur-xl rounded-full shadow-2xl flex items-center gap-4 border border-white/20"
              >
                <div className="w-5 h-5 rounded-full shadow-inner ring-2 ring-primary/5" style={{ backgroundColor: selectedColor.hex }} />
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-primary">{selectedColor.name}</span>
              </motion.div>
            </div>

            <div className="absolute top-8 left-8">
              <div className="bg-primary/90 backdrop-blur-md text-white px-5 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 shadow-xl">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span>Rendu Haute Fidélité</span>
              </div>
            </div>
          </div>

          {/* Model Selector */}
          <div className="grid grid-cols-3 gap-6">
            {MODELS.map(model => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model)}
                className={`group relative p-6 rounded-[2.5rem] border transition-all duration-500 ${
                  selectedModel.id === model.id 
                    ? 'bg-primary text-white border-primary shadow-2xl shadow-primary/20 -translate-y-1' 
                    : 'bg-white text-primary/40 border-primary/5 hover:border-accent/40'
                }`}
              >
                <div className="aspect-square w-full rounded-2xl overflow-hidden mb-4 opacity-40 group-hover:opacity-100 transition-opacity">
                   <img src={model.baseImage} alt="" className="w-full h-full object-cover" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest">{model.name}</p>
                {selectedModel.id === model.id && (
                  <motion.div layoutId="modelDot" className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-white" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Configuration Panel */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-card rounded-[3.5rem] p-10 md:p-12 border border-primary/5 shadow-sm">
            <div className="space-y-12">
              
              {/* AI Suggestion Section */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary/40 flex items-center gap-2">
                  <Sparkles size={14} className="text-accent" />
                  Conseiller IA Couleur
                </h3>
                <div className="relative">
                  <input 
                    type="text" 
                    value={userVibe}
                    onChange={(e) => setUserVibe(e.target.value)}
                    placeholder="Ex: 'Mariage hivernal', 'Style bohème'..."
                    className="w-full pl-6 pr-20 py-5 bg-secondary/50 rounded-2xl border border-primary/5 focus:outline-none focus:border-accent/30 text-sm font-medium"
                  />
                  <button 
                    onClick={getAiColorAdvice}
                    disabled={isAiSuggesting}
                    className="absolute right-2 top-2 bottom-2 px-4 bg-accent text-white rounded-xl hover:bg-primary transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    {isAiSuggesting ? <Loader text="" /> : <Palette size={18} />}
                  </button>
                </div>
                <AnimatePresence>
                  {aiSuggestion && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 bg-accent/5 rounded-xl border border-accent/10"
                    >
                      <p className="text-xs text-accent italic leading-relaxed">
                        " {aiSuggestion} "
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Step 1: Color Selection */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Nuancier de Laine</h3>
                </div>
                <div className="grid grid-cols-6 gap-4">
                  {COLORS.map(color => (
                    <button
                      key={color.id}
                      onClick={() => { setSelectedColor(color); setAiSuggestion(null); }}
                      className={`relative aspect-square rounded-full transition-all group ${
                        selectedColor.id === color.id ? 'scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {selectedColor.id === color.id && (
                        <motion.div 
                          layoutId="selectedRing"
                          className="absolute -inset-2 border-2 border-accent rounded-full"
                        />
                      )}
                      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 bg-white transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Kit Summary */}
              <div className="bg-secondary/30 p-8 rounded-[2.5rem] border border-primary/5 space-y-6">
                <div className="flex items-center gap-3 text-primary">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Info size={18} className="text-accent" />
                  </div>
                  <span className="text-sm font-bold">Spécifications du Kit</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/30">Laine</p>
                    <p className="text-sm font-serif text-primary">4x 100g Mérinos</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/30">Aiguilles</p>
                    <p className="text-sm font-serif text-primary">5mm Recommandé</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/30">Niveau</p>
                    <p className="text-sm font-serif text-accent">Intermédiaire</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/30">Temps</p>
                    <p className="text-sm font-serif text-primary">15h environ</p>
                  </div>
                </div>
              </div>

              {/* Pricing & Checkout */}
              <div className="pt-8 border-t border-primary/5">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-2">Prix du Kit Complet</p>
                    <p className="text-4xl font-serif font-bold text-primary tracking-tight">
                      24 500 <span className="text-xl">FCFA</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-green-600 mb-1">
                      <Check size={14} strokeWidth={3} />
                      <span className="text-[10px] font-black uppercase tracking-widest">En Stock</span>
                    </div>
                    <p className="text-xs font-medium text-primary/30 underline decoration-accent/30">Livraison 48h</p>
                  </div>
                </div>
                
                <button 
                  onClick={handleAddToCart}
                  className="w-full bg-primary text-white py-6 rounded-[2rem] font-bold hover:bg-accent transition-all flex items-center justify-center gap-4 shadow-2xl shadow-primary/20 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <ShoppingBag size={20} className="group-hover:scale-110 transition-transform" />
                  <span>Ajouter au Panier</span>
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>
          </div>

          {/* Marketing Card */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-accent p-10 rounded-[3.5rem] shadow-2xl shadow-accent/20 relative overflow-hidden group cursor-default"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                   <Wind size={20} className="text-white" />
                </div>
                <h3 className="font-serif text-2xl text-white">Conseil Artisanal</h3>
              </div>
              <p className="text-white/90 text-sm leading-relaxed mb-6 italic">
                "Pour ce {selectedModel.name.toLowerCase()}, privilégiez le point mousse pour un volume aérien qui soulignera parfaitement la nuance {selectedColor.name}."
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60">
                 <MousePointer2 size={12} />
                 <span>Landry, Maître Teinturier</span>
              </div>
            </div>
            <Wind className="absolute -bottom-8 -right-8 w-40 h-40 text-white/10 rotate-12 group-hover:rotate-45 transition-transform duration-1000" />
          </motion.div>
        </div>
      </div>
    </div>
  );
};
