import React, { useRef, useState } from 'react';
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

type PatternStitch =
  | 'chain'
  | 'single-crochet'
  | 'half-double-crochet'
  | 'double-crochet'
  | 'treble-crochet'
  | 'knit'
  | 'purl'
  | 'yarn-over'
  | 'decrease-left'
  | 'decrease-right'
  | 'increase'
  | 'slip';

interface PatternChart {
  technique: 'crochet' | 'knitting';
  title: string;
  orientation: 'bottom-to-top' | 'top-to-bottom';
  rows: { number: number; stitches: PatternStitch[] }[];
  legend: { symbol: string; label: string }[];
}

interface GeneratedPattern {
  title: string;
  description: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  materials: string[];
  gauge: string;
  sizes: string[];
  instructions: PatternInstruction[];
  chart?: PatternChart;
}

interface PatternGeneratorProps {
  onNavigate?: (view: string) => void;
  onAddToCart?: (product: any) => void;
}

interface PatternModel {
  id: string;
  name: string;
  type: string;
  image: string;
  mimeType?: string;
}

const parseGeneratedPattern = (text: string, fallbackSize: string): GeneratedPattern => {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('La réponse de l’IA n’est pas un patron structuré valide.');
  const raw = JSON.parse(cleaned.slice(start, end + 1)) as Partial<GeneratedPattern>;
  if (!raw.title || !raw.description || !Array.isArray(raw.instructions)) throw new Error('Le patron généré est incomplet.');

  const validStitches = new Set<PatternStitch>([
    'chain', 'single-crochet', 'half-double-crochet', 'double-crochet', 'treble-crochet',
    'knit', 'purl', 'yarn-over', 'decrease-left', 'decrease-right', 'increase', 'slip',
  ]);
  const sourceChart = raw.chart as Partial<PatternChart> | null | undefined;
  const chart = sourceChart?.rows && Array.isArray(sourceChart.rows) ? {
    technique: sourceChart.technique === 'crochet' ? 'crochet' as const : 'knitting' as const,
    title: String(sourceChart.title || 'Représentation visuelle du patron'),
    orientation: sourceChart.orientation === 'top-to-bottom' ? 'top-to-bottom' as const : 'bottom-to-top' as const,
    rows: sourceChart.rows.slice(0, 80).map((row, index) => ({
      number: Number(row?.number) || index + 1,
      stitches: Array.isArray(row?.stitches) ? row.stitches.filter((stitch): stitch is PatternStitch => validStitches.has(stitch as PatternStitch)) : [],
    })).filter((row) => row.stitches.length > 0),
    legend: Array.isArray(sourceChart.legend) ? sourceChart.legend.map((item) => ({ symbol: String(item?.symbol || ''), label: String(item?.label || '') })).filter((item) => item.symbol && item.label) : [],
  } : undefined;
  return {
    title: String(raw.title),
    description: String(raw.description),
    difficulty: raw.difficulty === 'Intermédiaire' || raw.difficulty === 'Avancé' ? raw.difficulty : 'Débutant',
    materials: Array.isArray(raw.materials) ? raw.materials.map(String) : [],
    gauge: raw.gauge ? String(raw.gauge) : 'À déterminer selon votre échantillon',
    sizes: Array.isArray(raw.sizes) && raw.sizes.length > 0 ? raw.sizes.map(String) : [fallbackSize],
    instructions: raw.instructions.map((section) => ({
      section: String(section.section || 'Étape'),
      steps: Array.isArray(section.steps) ? section.steps.map((step) => String(step).replace(/\*{1,2}/g, '').replace(/`/g, '').trim()).filter(Boolean) : [],
    })).filter((section) => section.steps.length > 0),
    chart: chart && chart.rows.length > 0 ? chart : undefined,
  };
};

const stitchGlyphs: Record<PatternStitch, string> = {
  chain: '○',
  'single-crochet': '×',
  'half-double-crochet': 'T',
  'double-crochet': 'T̅',
  'treble-crochet': 'T̅̅',
  knit: '│',
  purl: '—',
  'yarn-over': '○',
  'decrease-left': '╲',
  'decrease-right': '╱',
  increase: 'Y',
  slip: '·',
};

const PatternChartView: React.FC<{ chart: PatternChart }> = ({ chart }) => {
  const rows = chart.orientation === 'bottom-to-top' ? [...chart.rows].reverse() : chart.rows;
  const cellSize = 42;
  const labelWidth = 46;
  const maxStitches = Math.max(...rows.map((row) => row.stitches.length), 1);
  const width = labelWidth + maxStitches * cellSize + 16;
  const height = rows.length * cellSize + 24;

  return (
    <section className="mb-16 rounded-[2.5rem] border border-primary/10 bg-[#F9F7F2] p-6 md:p-10" aria-label="Diagramme visuel du patron">
      <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">Lecture graphique</p>
          <h3 className="mt-2 text-3xl font-serif font-bold text-primary">{chart.title}</h3>
        </div>
        <span className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary/60">
          {chart.technique === 'crochet' ? 'Diagramme crochet' : 'Diagramme tricot'}
        </span>
      </div>
      <div className="overflow-x-auto rounded-3xl bg-white p-4 shadow-inner">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${chart.title}, ${rows.length} rangs`} className="mx-auto min-w-[520px] max-w-none">
          <title>{chart.title}</title>
          {rows.map((row, rowIndex) => (
            <g key={`${row.number}-${rowIndex}`}>
              <text x={labelWidth - 12} y={rowIndex * cellSize + 27} textAnchor="end" className="fill-primary/60 text-[11px] font-bold">{row.number}</text>
              {row.stitches.map((stitch, stitchIndex) => (
                <g key={`${row.number}-${stitchIndex}`}>
                  <rect x={labelWidth + stitchIndex * cellSize} y={rowIndex * cellSize + 2} width={cellSize} height={cellSize} fill="white" stroke="#d8cfc2" strokeWidth="1" />
                  <text x={labelWidth + stitchIndex * cellSize + cellSize / 2} y={rowIndex * cellSize + 29} textAnchor="middle" className="fill-primary text-[23px] font-serif">{stitchGlyphs[stitch]}</text>
                </g>
              ))}
            </g>
          ))}
        </svg>
      </div>
      {chart.legend.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-3">
          {chart.legend.map((item, index) => <span key={`${item.symbol}-${index}`} className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-primary/80 shadow-sm"><strong className="font-serif text-lg text-accent">{item.symbol}</strong>{item.label}</span>)}
        </div>
      )}
      <p className="mt-6 text-xs italic text-primary/60">Les rangs sont numérotés dans le sens de lecture indiqué. Vérifiez toujours la légende et l’échantillon avant de commencer.</p>
    </section>
  );
};

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
  const [referenceImage, setReferenceImage] = useState<{ preview: string; mimeType: string; data: string } | null>(null);
  const [selectedModelId, setSelectedModelId] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { data: patternModels } = useEntity<PatternModel>('pattern_model');
  const selectedModel = patternModels.find((model) => model.id === selectedModelId);

  const { addEntity: addProject } = useEntity('knitting_project');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReferenceImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('La photo doit faire moins de 8 Mo.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || '');
      const [, data] = value.split(',');
      if (data) setReferenceImage({ preview: value, mimeType: file.type, data });
    };
    reader.readAsDataURL(file);
  };

  const generatePattern = async () => {
    if (!formData.type) {
      toast.error('Veuillez sélectionner un type d\'ouvrage');
      return;
    }

    setIsGenerating(true);
    setPattern(null);

    try {
      const prompt = `
Tu es un expert en crochet et en tricot spécialisé dans la rédaction de patrons professionnels.

OBJECTIF :
Générer un patron complet et exploitable en français à partir des paramètres fournis et de l'image de référence jointe.

PARAMÈTRES UTILISATEUR :
- Type d'ouvrage : ${formData.type}
- Style : ${formData.style}
- Niveau : ${formData.skillLevel}
- Poids de laine : ${formData.yarnWeight}
- Taille : ${formData.size}
- Notes additionnelles : ${formData.extraNotes || 'Aucune'}

RÉFÉRENCE VISUELLE :
${selectedModel
  ? `Le modèle officiel « ${selectedModel.name} » est joint. Analyse attentivement sa silhouette, ses proportions, sa construction, son motif et ses détails techniques, puis rédige un patron fidèle à ce modèle.`
  : referenceImage
    ? `Une image de référence personnelle est jointe. Analyse sa forme, ses proportions, son motif et ses détails techniques, puis rédige un patron fidèle à l'ouvrage représenté.`
    : 'Aucune image de référence n’est fournie. Génère un patron cohérent à partir des paramètres uniquement.'}

INSTRUCTIONS IMPORTANTES :
- Génère deux livrables complémentaires : une représentation visuelle structurée du motif et le patron textuel complet.
- La représentation visuelle doit être fournie dans le champ chart avec des tokens autorisés ; elle sera dessinée par l'application, ne génère donc ni SVG, ni HTML, ni dessin ASCII.
- Le patron textuel doit expliquer précisément la construction, même lorsque chart est fourni.
- Si l'image contient un diagramme technique, interprète-le et transforme-le aussi en instructions textuelles détaillées.
- N'invente pas de mesures irréalistes ; utilise des estimations cohérentes avec le type d'ouvrage et la taille demandée.
- Le résultat doit être directement utilisable par une crocheteuse ou tricoteuse.
- Retourne exclusivement un objet JSON valide, sans bloc Markdown et sans astérisques doubles.

STRUCTURE OBLIGATOIRE DE LA RÉPONSE JSON :
title, description, difficulty, materials, gauge, sizes et instructions.
Chaque instruction contient section et steps, avec des phrases textuelles détaillées.
Ajoute chart pour les motifs représentables en grille ; utilise chart: null lorsque ce n'est pas pertinent.

EXIGENCE FINALE :
Le patron doit être clair, précis, professionnel, cohérent du début à la fin et prêt à être publié sur une boutique de patrons.
`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          systemInstruction: 'Tu es un expert en tricot et en crochet. Retourne un patron textuel complet ET une représentation visuelle structurée lorsque le motif s’y prête. Respecte strictement le JSON demandé, sans Markdown, sans astérisques et sans SVG.',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              title: { type: 'STRING' },
              description: { type: 'STRING' },
              difficulty: { type: 'STRING', enum: ['Débutant', 'Intermédiaire', 'Avancé'] },
              materials: { type: 'ARRAY', items: { type: 'STRING' } },
              gauge: { type: 'STRING' },
              sizes: { type: 'ARRAY', items: { type: 'STRING' } },
              instructions: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    section: { type: 'STRING' },
                    steps: { type: 'ARRAY', items: { type: 'STRING' } },
                  },
                  required: ['section', 'steps'],
                },
              },
              chart: {
                type: 'OBJECT', nullable: true,
                properties: {
                  technique: { type: 'STRING', enum: ['crochet', 'knitting'] },
                  title: { type: 'STRING' },
                  orientation: { type: 'STRING', enum: ['bottom-to-top', 'top-to-bottom'] },
                  rows: { type: 'ARRAY', items: { type: 'OBJECT', properties: {
                    number: { type: 'INTEGER' },
                    stitches: { type: 'ARRAY', items: { type: 'STRING', enum: ['chain', 'single-crochet', 'half-double-crochet', 'double-crochet', 'treble-crochet', 'knit', 'purl', 'yarn-over', 'decrease-left', 'decrease-right', 'increase', 'slip'] } },
                  }, required: ['number', 'stitches'] } },
                  legend: { type: 'ARRAY', items: { type: 'OBJECT', properties: { symbol: { type: 'STRING' }, label: { type: 'STRING' } }, required: ['symbol', 'label'] } },
                },
                required: ['technique', 'title', 'orientation', 'rows', 'legend'],
              },
            },
            required: ['title', 'description', 'difficulty', 'materials', 'gauge', 'sizes', 'instructions'],
          },
          imagePart: selectedModel
            ? { mimeType: selectedModel.mimeType || 'image/jpeg', data: selectedModel.image.split(',')[1] || selectedModel.image }
            : referenceImage ? { mimeType: referenceImage.mimeType, data: referenceImage.data } : undefined
        })
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(errorPayload?.error || `Erreur API (${response.status})`);
      }
      const result = await response.json();

      if (!result.text || typeof result.text !== 'string') {
        throw new Error('La réponse de l’IA est vide.');
      }

      const generatedData = parseGeneratedPattern(result.text, formData.size);
      setPattern(generatedData);
      toast.success('Patron généré avec succès !');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error(`Impossible de générer le patron : ${message}`);
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
                <option>T-shirt</option>
                <option>Robe</option>
                <option>Jupe</option>
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
            <label className="block text-sm font-bold text-primary uppercase tracking-widest">Modèle enregistré</label>
            <select value={selectedModelId} onChange={(event) => { setSelectedModelId(event.target.value); if (event.target.value) setReferenceImage(null); }} className="w-full rounded-2xl border border-primary/5 bg-secondary/50 px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20">
              <option value="">Choisir un modèle existant (facultatif)</option>
              {patternModels.map((model) => <option key={model.id} value={model.id}>{model.name} · {model.type}</option>)}
            </select>
            {selectedModel && <img src={selectedModel.image} alt={selectedModel.name} className="h-40 w-full rounded-2xl border border-accent/20 bg-[#F9F7F2] object-contain" />}
            <p className="text-xs leading-relaxed text-primary/60">Si le modèle existe, utilisez-le. Sinon, laissez ce champ vide et ajoutez votre propre photo ci-dessous.</p>
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
            <div className="relative">
              <select
              name="size"
                value={formData.size}
                onChange={handleInputChange}
                className="appearance-none w-full px-6 py-4 bg-secondary/50 rounded-2xl border border-primary/5 focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer"
              >
                <option value="Bébé (0–12 mois)">Bébé (0–12 mois)</option>
                <option value="Enfant (2–4 ans)">Enfant (2–4 ans)</option>
                <option value="Enfant (6–10 ans)">Enfant (6–10 ans)</option>
                <option value="Adolescent">Adolescent</option>
                <option value="Adulte XS–S">Adulte XS–S</option>
                <option value="Adulte M–L">Adulte M–L</option>
                <option value="Adulte XL–XXL">Adulte XL–XXL</option>
                <option value="Adulte Standard">Adulte Standard</option>
                <option value="Taille unique">Taille unique</option>
                <option value="Petite couverture (80 × 100 cm)">Petite couverture (80 × 100 cm)</option>
                <option value="Couverture standard (120 × 150 cm)">Couverture standard (120 × 150 cm)</option>
                <option value="Grande couverture (150 × 200 cm)">Grande couverture (150 × 200 cm)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
                <ChevronDown className="text-primary/70" size={20} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-primary uppercase tracking-widest">Photo du modèle (optionnel)</label>
            <input ref={imageInputRef} type="file" accept="image/*" onChange={handleReferenceImage} className="hidden" />
            {referenceImage ? (
              <div className="relative overflow-hidden rounded-2xl border border-accent/30 bg-secondary/30">
                <img src={referenceImage.preview} alt="Modèle de référence" className="h-48 w-full object-contain" />
                <button type="button" onClick={() => { setReferenceImage(null); if (imageInputRef.current) imageInputRef.current.value = ''; }} className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-red-600 shadow-sm">Retirer</button>
              </div>
            ) : (
              <button type="button" onClick={() => imageInputRef.current?.click()} className="w-full rounded-2xl border-2 border-dashed border-primary/15 bg-secondary/20 px-5 py-6 text-sm text-primary/60 transition-colors hover:border-accent hover:text-accent">
                Ajouter une photo du modèle à reproduire
              </button>
            )}
            <p className="text-xs leading-relaxed text-primary/60">La photo sert de référence pour la forme, les proportions, les motifs et les détails. Elle ne remplace pas les notes.</p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-primary uppercase tracking-widest">Notes et détails du modèle</label>
            <textarea
              name="extraNotes"
              value={formData.extraNotes}
              onChange={handleInputChange}
              rows={5}
              placeholder="Ex. manches courtes, col rond, longueur souhaitée, tour de poitrine, nombre de couleurs, motif, type de fermeture..."
              className="w-full resize-none rounded-2xl border border-primary/5 bg-secondary/50 px-5 py-4 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            <p className="text-xs leading-relaxed text-primary/60">Plus les mesures, la coupe et les détails sont précis, plus le patron sera fidèle au modèle choisi.</p>
          </div>

          <button 
            onClick={generatePattern}
            disabled={isGenerating}
            className="w-full py-5 bg-[#5c5e46] dark:bg-[#E2C29B] text-white dark:text-[#111311] rounded-[2rem] font-bold text-lg hover:opacity-95 transition-all duration-300 shadow-xl shadow-[#5c5e46]/20 flex items-center justify-center gap-3 disabled:opacity-70"
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
                          onClick={() => onNavigate?.('knitting-materials')}
                          className="px-6 py-3 bg-white text-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:text-accent transition-all duration-300 border border-primary/10 shadow-sm"
                        >
                          Voir le matériel en boutique
                        </button>
                      </div>
                    </div>

                    {pattern.chart && <PatternChartView chart={pattern.chart} />}

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
