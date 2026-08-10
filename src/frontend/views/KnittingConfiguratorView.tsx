import React, { useMemo, useState } from 'react';
import { Check, ShoppingBag, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useEntity } from '../hooks/useEntity';
import { useProducts } from '../hooks/useProducts';
import { getProductAvailability } from '../utils/stockAvailability';
import { ConfiguratorSelection, Product } from '../../types';

interface ConfiguratorModel {
  id: string;
  name: string;
  type: string;
  image: string;
  svg?: string;
  characteristics?: string[];
  active?: boolean;
}

interface KnittingConfiguratorProps {
  onAddToCart?: (product: Product, configuration: ConfiguratorSelection) => void;
}

export const KnittingConfiguratorView: React.FC<KnittingConfiguratorProps> = ({ onAddToCart }) => {
  const { data: models, isLoading: modelsLoading } = useEntity<ConfiguratorModel>('configurator_model');
  const { products } = useProducts({ cacheOnly: true });
  const activeModels = models.filter((model) => model.active !== false);
  const yarns = products.filter((product) => product.category?.toLowerCase().includes('laine') && product.isAvailable !== false);
  const [modelId, setModelId] = useState('');
  const [yarnId, setYarnId] = useState('');
  const [color, setColor] = useState('');
  const model = activeModels.find((item) => item.id === modelId);
  const yarn = yarns.find((item) => item.id === yarnId);
  const colors = useMemo(() => yarn?.colors || [], [yarn]);
  const selectedColor = colors.find((item) => item === color);
  const availability = yarn && selectedColor ? getProductAvailability(yarn, selectedColor) : null;

  const addKit = () => {
    if (!model || !yarn || !selectedColor || !availability || availability.total <= 0) {
      toast.error('Sélectionnez un modèle, une laine et une couleur disponible.');
      return;
    }
    const configuration: ConfiguratorSelection = {
      modelId: model.id, modelName: model.name, modelImage: model.image, modelSvg: model.svg,
      characteristics: model.characteristics, yarnProductId: yarn.id, yarnName: yarn.name,
      color: selectedColor, colorHex: selectedColor.startsWith('#') ? selectedColor : undefined,
    };
    onAddToCart?.(yarn, configuration);
  };

  return <div className="mx-auto max-w-7xl px-4 py-12">
    <header className="mb-12"><p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-accent"><Sparkles size={15} /> Atelier de personnalisation</p><h1 className="text-4xl font-serif font-bold text-primary md:text-5xl">Configurez votre ouvrage</h1><p className="mt-3 max-w-2xl text-primary/65">Choisissez un modèle de notre collection, une laine disponible au catalogue et sa couleur. Votre sélection sera conservée dans la commande.</p></header>
    {modelsLoading ? <p className="rounded-3xl bg-secondary/30 p-8 text-primary/60">Chargement des modèles…</p> : activeModels.length === 0 ? <p className="rounded-3xl border border-dashed border-primary/15 p-8 text-primary/60">Les modèles sont bientôt disponibles.</p> : <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-6">
        <div className="overflow-hidden rounded-[2.5rem] border border-primary/10 bg-white shadow-sm">
          {model ? <div className="relative aspect-square bg-[#F9F7F2] p-5"><img src={model.image} alt={model.name} className="h-full w-full object-contain" />{model.svg && <img src={model.svg} alt={`Représentation de ${model.name}`} className="pointer-events-none absolute inset-8 h-[calc(100%-4rem)] w-[calc(100%-4rem)] object-contain opacity-80" />}</div> : <div className="flex aspect-square items-center justify-center bg-secondary/20 p-10 text-center text-primary/45">Sélectionnez un modèle pour afficher son image et sa représentation SVG.</div>}
          {model && <div className="p-7"><h2 className="text-3xl font-serif font-bold text-primary">{model.name}</h2><p className="mt-2 text-xs font-bold uppercase tracking-widest text-accent">{model.type}</p><ul className="mt-5 grid gap-2 text-sm text-primary/70">{(model.characteristics || []).map((item, index) => <li key={`${item}-${index}`} className="flex gap-2"><Check size={16} className="mt-0.5 text-accent" />{item}</li>)}</ul></div>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">{activeModels.map((item) => <button type="button" key={item.id} onClick={() => setModelId(item.id)} className={`rounded-2xl border p-3 text-left transition ${item.id === modelId ? 'border-accent bg-accent/5' : 'border-primary/10 bg-white hover:border-accent/40'}`}><img src={item.image} alt="" className="mb-3 h-32 w-full rounded-xl bg-[#F9F7F2] object-contain" /><strong className="text-sm text-primary">{item.name}</strong><span className="mt-1 block text-xs text-primary/50">{item.type}</span></button>)}</div>
      </section>
      <section className="h-fit rounded-[2.5rem] border border-primary/10 bg-white p-7 shadow-sm md:p-9"><h2 className="mb-8 text-2xl font-serif font-bold text-primary">Votre sélection</h2>
        <label className="mb-6 block text-xs font-bold uppercase tracking-widest text-primary/60">Modèle<select value={modelId} onChange={(event) => setModelId(event.target.value)} className="mt-2 w-full rounded-xl border border-primary/10 bg-secondary/20 px-4 py-3 text-sm"><option value="">Choisir un modèle</option>{activeModels.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.type}</option>)}</select></label>
        <label className="mb-6 block text-xs font-bold uppercase tracking-widest text-primary/60">Laine du catalogue<select value={yarnId} onChange={(event) => { setYarnId(event.target.value); setColor(''); }} className="mt-2 w-full rounded-xl border border-primary/10 bg-secondary/20 px-4 py-3 text-sm"><option value="">Choisir une laine</option>{yarns.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.price.toLocaleString('fr-FR')} FCFA</option>)}</select></label>
        {yarn && <div className="mb-6 rounded-2xl bg-secondary/30 p-4 text-sm text-primary/70"><strong className="text-primary">{yarn.name}</strong><p className="mt-1">{yarn.material || 'Laine du catalogue'}</p></div>}
        <label className="mb-8 block text-xs font-bold uppercase tracking-widest text-primary/60">Couleur<select value={color} onChange={(event) => setColor(event.target.value)} disabled={!yarn} className="mt-2 w-full rounded-xl border border-primary/10 bg-secondary/20 px-4 py-3 text-sm disabled:opacity-50"><option value="">Choisir une couleur</option>{colors.map((item) => { const stock = getProductAvailability(yarn!, item).total; return <option key={item} value={item} disabled={stock <= 0}>{item}{stock <= 0 ? ' · indisponible' : ''}</option>; })}</select></label>
        {availability && <p className={`mb-6 text-sm font-medium ${availability.total > 0 ? 'text-green-700' : 'text-red-600'}`}>{availability.total > 0 ? `${availability.total} unité(s) disponible(s) dans cette couleur.` : 'Cette couleur est indisponible.'}</p>}
        <div className="mb-7 flex items-end justify-between border-t border-primary/10 pt-6"><div><p className="text-xs uppercase tracking-widest text-primary/50">Prix</p><p className="mt-1 text-3xl font-serif font-bold text-primary">{yarn ? `${yarn.price.toLocaleString('fr-FR')} FCFA` : '—'}</p></div>{selectedColor && <span className="rounded-full bg-secondary px-4 py-2 text-sm text-primary">{selectedColor}</span>}</div>
        <button type="button" onClick={addKit} disabled={!model || !yarn || !selectedColor || !availability?.total} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-5 py-4 font-bold text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"><ShoppingBag size={19} />Ajouter le kit au panier</button>
      </section>
    </div>}
  </div>;
};
