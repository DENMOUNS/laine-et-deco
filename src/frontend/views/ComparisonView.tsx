import React from 'react';
import { motion } from 'motion/react';
import { Product } from '../../types';
import { Check, X, ArrowLeft, ArrowRightLeft, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface ComparisonViewProps {
  comparisonList: Product[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onNavigate: (view: string) => void;
  onAddToCart: (product: Product) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({ 
  comparisonList, 
  onRemove, 
  onClear, 
  onNavigate,
  onAddToCart
}) => {
  if (comparisonList.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white/50 m-4 rounded-[3rem]">
        <div className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mb-6 text-accent">
          <ArrowRightLeft size={48} />
        </div>
        <h2 className="text-3xl font-serif text-primary mb-4">Aucun produit à comparer</h2>
        <p className="text-primary/70 max-w-md mb-8">
          Ajoutez des produits à votre liste de comparaison depuis la boutique pour voir leurs caractéristiques en détail.
        </p>
        <Button onClick={() => onNavigate('shop')} size="lg" className="rounded-full shadow-lg">
          Retour à la boutique
        </Button>
      </div>
    );
  }

  // Extract all unique attributes from the compared products
  const getAllAttributes = (products: Product[]) => {
    const keys = new Set<string>();
    products.forEach(p => {
      if (p.category) keys.add('Catégorie');
      if (p.material) keys.add('Matière');
      if (p.colors && p.colors.length > 0) keys.add('Couleurs');
      if (p.description) keys.add('Description');
      if (p.specs) {
        Object.keys(p.specs).forEach(k => keys.add(k));
      }
    });
    return Array.from(keys);
  };

  const allAttributes = getAllAttributes(comparisonList);

  const renderAttribute = (product: Product, key: string) => {
    if (key === 'Catégorie') return <span className="font-medium text-primary">{product.category || '-'}</span>;
    if (key === 'Matière') return <span className="font-medium text-primary">{product.material || '-'}</span>;
    if (key === 'Couleurs') return <span className="font-medium text-primary">{product.colors && product.colors.length > 0 ? product.colors.join(', ') : '-'}</span>;
    if (key === 'Description') return <div className="text-xs text-left text-primary/70 max-w-xs mx-auto line-clamp-4">{product.description || '-'}</div>;
    if (product.specs && product.specs[key]) return <span className="font-medium text-primary">{product.specs[key]}</span>;
    return <span className="text-primary/70">-</span>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Notice Mobile PC Uniquement */}
      <div className="md:hidden bg-amber-500/10 border border-amber-500/20 text-amber-900 text-xs font-semibold p-3.5 rounded-2xl mb-6 flex items-center gap-2">
        <span>🖥️</span> <span>Le comparateur de prix est une fonctionnalité disponible uniquement sur la version Ordinateur (PC).</span>
      </div>

      <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
        <div>
          <button 
            onClick={() => onNavigate('shop')}
            className="flex items-center gap-2 text-primary/70 hover:text-accent font-bold text-sm mb-4 transition-colors"
          >
            <ArrowLeft size={16} /> Retour à la boutique
          </button>
          <h1 className="text-4xl md:text-5xl font-serif text-primary flex items-center gap-4">
            <ArrowRightLeft className="text-accent hidden sm:block" size={40} />
            Comparateur
          </h1>
        </div>
        <Button 
          variant="outline" 
          onClick={onClear}
          className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full"
        >
          <Trash2 size={16} className="mr-2" /> Vider la liste
        </Button>
      </div>

      <div className="bg-white rounded-[3rem] shadow-xl border border-primary/5 p-6 md:p-10 overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr>
              <th className="w-1/4 p-4 text-left border-b-2 border-primary/10">
                <span className="text-xs font-bold uppercase tracking-widest text-primary/70">Caractéristiques</span>
              </th>
              {comparisonList.map(product => (
                <th key={product.id} className="w-1/4 p-4 border-b-2 border-primary/10 relative">
                  <button 
                    onClick={() => onRemove(product.id)}
                    className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                    title="Retirer du comparateur"
                  >
                    <X size={14} />
                  </button>
                  <div className="flex flex-col items-center text-center">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-32 h-32 object-cover rounded-2xl mb-4 shadow-sm" 
                      referrerPolicy="no-referrer"
                    />
                    <h3 className="font-serif font-bold text-lg text-primary mb-1 line-clamp-2 min-h-[56px]">{product.name}</h3>
                    <p className="text-accent font-bold text-xl mb-4">{product.price.toLocaleString()} FCFA</p>
                    <Button 
                      onClick={() => onAddToCart(product)}
                      className="w-full rounded-2xl shadow-lg hover:-translate-y-1 relative overflow-hidden animate-shine"
                    >
                      <ShoppingCart size={16} className="mr-2" /> Ajouter
                    </Button>
                  </div>
                </th>
              ))}
              {/* Fill empty columns if less than 3 products */}
              {Array.from({ length: 3 - comparisonList.length }).map((_, i) => (
                <th key={`empty-${i}`} className="w-1/4 p-4 border-b-2 border-primary/10 border-l border-dashed border-primary/5 bg-secondary/20">
                  <div className="flex flex-col items-center justify-center h-full text-primary/70">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-primary/20 flex items-center justify-center mb-2">
                      <PlusIcon size={24} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest">Emplacement libre</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allAttributes.map(key => (
              <tr key={key} className="border-b border-primary/5 hover:bg-secondary/20 transition-colors">
                <td className="p-4 py-6 text-sm font-bold text-primary/70 uppercase tracking-wider">{key}</td>
                {comparisonList.map(product => (
                  <td key={product.id} className="p-4 py-6 text-center text-sm">
                    {renderAttribute(product, key)}
                  </td>
                ))}
                {Array.from({ length: 3 - comparisonList.length }).map((_, i) => <td key={i} className="bg-secondary/20 border-l border-dashed border-primary/5"></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PlusIcon = ({ size, className }: { size: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);
