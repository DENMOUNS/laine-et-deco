import React from 'react';
import { Product } from '../types';

export const WishlistView: React.FC<{ 
  wishlist: Product[]; 
  onNavigate: (view: string) => void; 
  addToCart: (p: Product) => void; 
  removeFromWishlist: (id: string) => void;
  currency: any;
}> = ({ wishlist, onNavigate, addToCart, removeFromWishlist, currency }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif mb-12">Ma Liste de Souhaits</h1>
      {wishlist.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[3rem] border border-primary/5">
          <p className="text-xl text-primary/40 font-serif italic">Votre liste est vide.</p>
          <button onClick={() => onNavigate('shop')} className="mt-4 text-accent font-bold underline">Aller faire un tour</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {wishlist.map(p => (
            <div key={p.id} className="relative group bg-white p-4 rounded-[2rem] border border-primary/5 card-hover">
              <img src={p.image} alt={p.name} className="aspect-[3/4] object-cover rounded-2xl w-full" referrerPolicy="no-referrer" />
              <div className="mt-4">
                <h3 className="font-serif text-lg">{p.name}</h3>
                <p className="font-bold text-accent">{(p.price * currency.rate).toLocaleString()} {currency.symbol}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => addToCart(p)}
                  className="flex-grow bg-primary text-white py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-accent transition-colors"
                >
                  Ajouter au panier
                </button>
                <button 
                  onClick={() => removeFromWishlist(p.id)}
                  className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                  title="Retirer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
