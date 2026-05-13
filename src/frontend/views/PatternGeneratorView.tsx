import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wand2, 
  ChevronRight, 
  ChevronDown,
  Info, 
  Save, 
  Download, 
  CheckCircle2, 
  RefreshCw,
  Palette,
  Layers,
  Maximize2,
  Minimize2,
  FileText,
  Printer,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { Loader } from '../components/Loader';
import { useEntity } from '../hooks/useEntity';
import { auth } from '../../backend/firebase';

interface PatternInstruction {
  section: string;
  steps: string[];
}

interface GeneratedPattern {
  title: string;
  description: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  materials: string[];
  gauge: string;
  sizes: string[];
  instructions: PatternInstruction[];
}

interface PatternGeneratorProps {
  onNavigate?: (view: string) => void;
  onAddToCart?: (product: any) => void;
}

export const PatternGeneratorView: React.FC<PatternGeneratorProps> = ({ onNavigate, onAddToCart }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pattern, setPattern] = useState<GeneratedPattern | null>(null);
  const [formData, setFormData] = useState({
    type: 'Écharpe',
    style: 'Classique',
    skillLevel: 'Débutant',
    yarnWeight: 'Moyenne (Worsted)',
    size: 'Adulte Standard',
    extraNotes: ''
  });

  const { addEntity: addProject } = useEntity('knitting_project');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generatePattern = async () => {
    if (!formData.type) {
      toast.error('Veuillez sélectionner un type d\'ouvrage');
      return;
    }

    setIsGenerating(true);
    setPattern(null);

    try {
      const prompt = `Générer un patron de tricot détaillé en français pour:
        Type: ${formData.type}
        Style: ${formData.style}
        Niveau: ${formData.skillLevel}
        Poids de laine: ${formData.yarnWeight}
        Taille: ${formData.size}
        Notes additionnelles: ${formData.extraNotes || 'Aucune'}

        Le patron doit être professionnel, précis et facile à suivre. 
        Inclus des instructions section par section (ex: Montage, Corps, Finitions).`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          systemInstruction: 'Tu es un expert en tricot.',
          responseSchema: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              description: { type: "STRING" },
              difficulty: { type: "STRING", enum: ['Débutant', 'Intermédiaire', 'Avancé'] },
              materials: { type: "ARRAY", items: { type: "STRING" } },
              gauge: { type: "STRING" },
              sizes: { type: "ARRAY", items: { type: "STRING" } },
              instructions: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    section: { type: "STRING" },
                    steps: { type: "ARRAY", items: { type: "STRING" } }
                  },
                  required: ['section', 'steps']
                }
              }
            },
            required: ['title', 'description', 'difficulty', 'materials', 'gauge', 'instructions']
          }
        })
      });

      if (!response.ok) throw new Error("API Error");
      const result = await response.json();

      if (result.text) {
        const generatedData = JSON.parse(result.text.trim());
        setPattern(generatedData);
        toast.success('Patron généré avec succès !');
      }
    } catch (error) {
      console.error('Erreur de génération:', error);
      toast.error('Une erreur est survenue lors de la génération du patron.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveToProjects = async () => {
    if (!pattern) return;

    try {
      await addProject({
        userId: auth.currentUser?.uid,
        title: pattern.title,
        type: formData.type,
        status: 'En cours',
        progress: 0,
        pattern: pattern,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      toast.success('Patron enregistré dans vos projets !');
      if (onNavigate) onNavigate('dashboard');
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">Générateur de Patrons IA</h1>
          <p className="text-primary/70">Créez des designs de tricot uniques et personnalisés en quelques secondes.</p>
        </div>
        <div className="flex items-center gap-3 bg-accent/10 px-4 py-2 rounded-full border border-accent/20">
          <Wand2 size={18} className="text-accent" />
          <span className="text-sm font-bold text-accent uppercase tracking-widest">Technologie Gemini 3</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-12 items-start">
        {/* Input Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-[3rem] shadow-sm border border-primary/5 space-y-6 sticky top-24"
        >
          <div className="space-y-4">
            <label className="block text-sm font-bold text-primary uppercase tracking-widest">Type d'ouvrage</label>
            <div className="relative">
              <select 
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="appearance-none w-full px-6 py-4 bg-secondary/50 rounded-2xl border border-primary/5 focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer"
              >
                <option>Écharpe</option>
                <option>Bonnet</option>
                <option>Pull / Chandail</option>
                <option>Gilet (Cardigan)</option>
                <option>Couverture</option>
                <option>Chaussettes</option>
                <option>Gants / Mitaines</option>
                <option>Sac</option>
                <option>Doudou (Amigurumi)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
                <ChevronDown className="text-primary/70" size={20} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <label className="block text-sm font-bold text-primary uppercase tracking-widest">Niveau</label>
              <div className="relative">
                <select 
                  name="skillLevel"
                  value={formData.skillLevel}
                  onChange={handleInputChange}
                  className="appearance-none w-full px-4 py-4 bg-secondary/50 rounded-2xl border border-primary/5 focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm cursor-pointer"
                >
                  <option>Débutant</option>
                  <option>Intermédiaire</option>
                  <option>Avancé</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <ChevronDown className="text-primary/70" size={18} />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-primary uppercase tracking-widest">Style</label>
              <div className="relative">
                <select 
                  name="style"
                  value={formData.style}
                  onChange={handleInputChange}
                  className="appearance-none w-full px-4 py-4 bg-secondary/50 rounded-2xl border border-primary/5 focus:outline-none focus:ring-2 focus:ring-accent/20 text-sm cursor-pointer"
                >
                  <option>Classique</option>
                  <option>Moderne</option>
                  <option>Minimaliste</option>
                  <option>Vintage</option>
                  <option>Dentelle</option>
                  <option>Torsades</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <ChevronDown className="text-primary/70" size={18} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-primary uppercase tracking-widest">Poids de la laine</label>
            <div className="relative">
              <select 
                name="yarnWeight"
                value={formData.yarnWeight}
                onChange={handleInputChange}
                className="appearance-none w-full px-6 py-4 bg-secondary/50 rounded-2xl border border-primary/5 focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer"
              >
                <option>Fine (Fingering)</option>
                <option>Moyenne (Worsted)</option>
                <option>Épaisse (Bulky)</option>
                <option>Très Épaisse (Super Bulky)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
                <ChevronDown className="text-primary/70" size={20} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-primary uppercase tracking-widest">Taille souhaitée</label>
            <input 
              type="text"
              name="size"
              value={formData.size}
              onChange={handleInputChange}
              placeholder="Ex: S, M, L ou dimensions en cm"
              className="w-full px-6 py-4 bg-secondary/50 rounded-2xl border border-primary/5 focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-primary uppercase tracking-widest">Précisions (Optionnel)</label>
            <textarea 
              name="extraNotes"
              value={formData.extraNotes}
              onChange={handleInputChange}
              placeholder="Couleurs, motifs spécifiques..."
              className="w-full px-6 py-4 bg-secondary/50 rounded-2xl border border-primary/5 focus:outline-none focus:ring-2 focus:ring-accent/20 h-24 resize-none"
            />
          </div>

          <button 
            onClick={generatePattern}
            disabled={isGenerating}
            className="w-full py-5 bg-primary text-white rounded-[2rem] font-bold text-lg hover:bg-accent transition-all duration-300 shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="animate-spin" />
                Création en cours...
              </>
            ) : (
              <>
                <Wand2 size={24} />
                Générer mon patron
              </>
            )}
          </button>
        </motion.div>

        {/* Output Area */}
        <div className="min-h-[600px]">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full space-y-8 py-20"
              >
                <div className="relative">
                  <div className="w-32 h-32 border-4 border-accent/20 rounded-full animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader text="" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-serif font-bold text-primary italic">L'IA tisse votre patron...</h3>
                  <p className="text-primary/70">Calcul des mailles, des rangs et des finitions.</p>
                </div>
              </motion.div>
            ) : pattern ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* Result Actions */}
                <div className="flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm border border-primary/5">
                  <div className="flex gap-2">
                    <button onClick={() => window.print()} className="p-3 hover:bg-primary/5 rounded-2xl text-primary/70 transition-colors">
                      <Printer size={20} />
                    </button>
                    <button className="p-3 hover:bg-primary/5 rounded-2xl text-primary/70 transition-colors">
                      <FileText size={20} />
                    </button>
                  </div>
                  <button 
                    onClick={saveToProjects}
                    className="flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-accent transition-all"
                  >
                    <Save size={18} />
                    Enregistrer dans mes projets
                  </button>
                </div>

                {/* Main Pattern Card */}
                <div className="bg-white rounded-[3rem] shadow-sm border border-primary/5 overflow-hidden">
                  <div className="bg-primary p-12 text-white">
                    <div className="flex justify-between items-start mb-6">
                      <span className="px-4 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-white/20">
                        Patron Exclusif Laine et Déco
                      </span>
                      <div className="flex items-center gap-4 text-white/70">
                        <Palette size={20} />
                        <Layers size={20} />
                      </div>
                    </div>
                    <h2 className="text-5xl font-serif font-bold mb-4">{pattern.title}</h2>
                    <p className="text-lg text-white/80 max-w-2xl leading-relaxed italic">{pattern.description}</p>
                  </div>

                  <div className="p-8 md:p-12">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                      <div className="bg-secondary/40 p-6 rounded-3xl border border-primary/5 flex flex-col justify-center items-center text-center">
                        <Activity size={24} className="text-accent mb-3" />
                        <h4 className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-1">Difficulté</h4>
                        <p className="text-xl font-serif text-primary">{pattern.difficulty}</p>
                      </div>
                      <div className="bg-secondary/40 p-6 rounded-3xl border border-primary/5 flex flex-col justify-center items-center text-center">
                        <Info size={24} className="text-accent mb-3" />
                        <h4 className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-1">Échantillon</h4>
                        <p className="text-xl font-serif text-primary leading-tight">{pattern.gauge}</p>
                      </div>
                      <div className="bg-secondary/40 p-6 rounded-3xl border border-primary/5 flex flex-col justify-center items-center text-center">
                        <Maximize2 size={24} className="text-accent mb-3" />
                        <h4 className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-1">Tailles</h4>
                        <p className="text-xl font-serif text-primary">{pattern.sizes.join(', ')}</p>
                      </div>
                    </div>

                    {/* Materials */}
                    <div className="bg-[#F9F7F2] p-8 md:p-10 rounded-[2.5rem] border border-primary/5 mb-16 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Layers size={120} />
                      </div>
                      <h4 className="text-2xl font-serif font-bold text-primary mb-8 flex items-center gap-3">
                        <CheckCircle2 className="text-accent" /> Matériel requis
                      </h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pattern.materials.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-primary/80 bg-white p-4 rounded-2xl border border-primary/5 shadow-sm">
                            <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 shrink-0"></span>
                            <span className="leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-8 flex justify-end">
                        <button 
                          onClick={() => onNavigate?.('shop')}
                          className="px-6 py-3 bg-white text-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:text-accent transition-all duration-300 border border-primary/10 shadow-sm"
                        >
                          Voir le matériel en boutique
                        </button>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="space-y-16">
                      <div className="text-center mb-8">
                        <h3 className="text-3xl font-serif font-bold text-primary">Instructions Étape par Étape</h3>
                        <p className="text-primary/70 italic mt-2">Suivez ces indications pour réaliser votre ouvrage</p>
                      </div>

                      {pattern.instructions.map((section, idx) => (
                        <div key={idx} className="relative">
                          <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-accent text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg shadow-accent/20 shrink-0 transform -rotate-3">
                              {idx + 1}
                            </div>
                            <h4 className="text-2xl font-serif font-bold text-primary">
                              {section.section}
                            </h4>
                            <div className="h-px flex-grow bg-gradient-to-r from-primary/10 to-transparent" />
                          </div>
                          
                          <div className="pl-4 md:pl-16 space-y-4">
                            {section.steps.map((step, sIdx) => (
                              <div 
                                key={sIdx} 
                                className="group relative bg-[#F9F7F2]/50 hover:bg-[#F9F7F2] p-6 md:p-8 rounded-[2rem] border border-primary/5 hover:border-accent/20 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
                              >
                                <div className="absolute -left-3 md:-left-4 -top-3 md:-top-4 w-8 h-8 md:w-10 md:h-10 bg-white border-2 border-primary/5 text-primary/70 rounded-full flex items-center justify-center font-mono font-bold text-xs md:text-sm group-hover:text-accent group-hover:border-accent/30 transition-colors shadow-sm">
                                  {sIdx + 1}
                                </div>
                                <p className="text-primary/80 leading-relaxed text-lg">
                                  {step}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center space-y-6 py-20 bg-secondary/20 rounded-[4rem] border-2 border-dashed border-primary/5"
              >
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm text-primary/10">
                  <Wand2 size={48} />
                </div>
                <div className="max-w-xs">
                  <h3 className="text-xl font-serif font-bold text-primary mb-2 italic">Prêt à créer ?</h3>
                  <p className="text-sm text-primary/70 leading-relaxed">
                    Configurez vos préférences à gauche et laissez l'intelligence artificielle générer votre prochain chef-d'œuvre.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
