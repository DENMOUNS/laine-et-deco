import React from 'react';
import { Pack } from '../types';

interface PackDetailViewProps {
  pack: Pack;
  onNavigate: (view: string) => void;
  onAddToCart: (pack: Pack) => void;
}

export const PackDetailView: React.FC<PackDetailViewProps> = ({ pack, onNavigate, onAddToCart }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button onClick={() => onNavigate('home')} className="text-accent font-bold mb-8">&larr; Retour</button>
      <h1 className="text-4xl font-serif mb-4">{pack.name}</h1>
      <p className="text-xl text-primary/60 mb-8">{pack.description}</p>
      <div className="bg-white p-8 rounded-[3rem] border border-primary/5">
        <h2 className="text-2xl font-bold mb-4">Produits du pack</h2>
        <ul className="space-y-4">
          {pack.products.map(p => (
            <li key={p.productId} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
              <span>Produit ID: {p.productId}</span>
              <span className="font-bold">Quantité: {p.quantity}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 p-6 bg-accent/10 rounded-2xl">
          <div className="text-accent font-bold">
            Code Promo: {pack.promoCode} (-{pack.discountPercentage}%)
          </div>
          <button 
            onClick={() => onAddToCart(pack)}
            className="bg-accent text-white px-8 py-3 rounded-xl font-bold hover:bg-accent/90 transition-all shadow-lg"
          >
            Ajouter le pack au panier
          </button>
        </div>
      </div>
    </div>
  );
};
