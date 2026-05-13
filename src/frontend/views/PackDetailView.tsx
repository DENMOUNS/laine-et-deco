import React from 'react';
import { motion } from 'motion/react';
import { Package, ShoppingBag, Check, ArrowLeft, Sparkles } from 'lucide-react';
import { PACKS, PRODUCTS } from '../../constants';
import { Button } from '../components/ui/Button';
import { Pack, Product } from '../../types';

interface PackDetailViewProps {
  packId: string;
  onNavigate: (view: string, id?: string) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onAddPackToCart: (pack: Pack, quantity?: number) => void;
}

export const PackDetailView: React.FC<PackDetailViewProps> = ({ packId, onNavigate, onAddToCart, onAddPackToCart }) => {
  const [packQuantity, setPackQuantity] = React.useState(1);
  const pack = PACKS.find(p => p.id === packId);
  
  if (!pack) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-serif text-primary mb-4">Pack non trouvé</h2>
        <Button onClick={() => onNavigate('packs')}>Retour aux packs</Button>
      </div>
    );
  }

  const packProducts = pack.products.map(item => {
    const product = PRODUCTS.find(p => p.id === item.productId);
    return { ...product, quantity: item.quantity } as Product & { quantity: number };
  }).filter(p => p.id);

  const originalPrice = pack.products.reduce((sum, item) => {
    const product = PRODUCTS.find(p => p.id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const discountedPrice = originalPrice * (1 - pack.discountPercentage / 100);
  const packImage = packProducts[0]?.image || 'https://picsum.photos/seed/pack/800/600';

  const handleAddPackToCart = () => {
    onAddPackToCart(pack, packQuantity);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Button 
        variant="ghost" 
        onClick={() => onNavigate('packs')}
        className="mb-8 hover:text-accent font-bold"
      >
        <ArrowLeft size={20} className="mr-2" /> Retour aux packs
      </Button>

      <div className="bg-card rounded-[3rem] border border-primary/5 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="h-[400px] lg:h-auto relative">
            <img 
              src={packImage} 
              alt={pack.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-8 left-8 bg-accent text-white px-6 py-2 rounded-full font-bold shadow-xl">
              -{pack.discountPercentage}% de réduction
            </div>
          </div>

          <div className="p-8 md:p-16 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-accent font-bold uppercase tracking-widest text-xs mb-6">
              <Sparkles size={16} />
              <span>Offre Exclusive (Pack Complet)</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-primary mb-6">{pack.name}</h1>
            <p className="text-primary/70 text-lg mb-8 leading-relaxed">
              {pack.description}
            </p>

            <div className="space-y-4 mb-10">
              <h3 className="font-bold text-primary uppercase tracking-widest text-xs">Contenu par pack :</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {packProducts.map(p => (
                  <div 
                    key={p.id} 
                    className="flex items-center gap-3 p-3 bg-secondary/30 rounded-2xl border border-primary/5 cursor-pointer hover:bg-secondary/50 transition-colors group"
                    onClick={() => onNavigate('product-detail', p.id)}
                  >
                    <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-primary group-hover:text-accent transition-colors">{p.name}</span>
                      <span className="text-[10px] text-primary/70 font-bold uppercase">Quantité: {p.quantity} par unité</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-primary/5">
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
                <div>
                  <p className="text-xs text-primary/70 line-through font-bold">
                    {(originalPrice * packQuantity).toLocaleString()} FCFA
                  </p>
                  <p className="text-3xl font-bold text-accent">
                    {(discountedPrice * packQuantity).toLocaleString()} FCFA
                  </p>
                </div>
                
                <div className="flex items-center gap-4 bg-secondary/50 p-2 rounded-2xl">
                   <button 
                     onClick={() => setPackQuantity(prev => Math.max(1, prev - 1))}
                     className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-primary hover:text-accent transition-colors"
                   >
                     <motion.span whileTap={{ scale: 0.8 }}>-</motion.span>
                   </button>
                   <span className="w-8 text-center font-bold text-lg">{packQuantity}</span>
                   <button 
                     onClick={() => setPackQuantity(prev => prev + 1)}
                     className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm text-primary hover:text-accent transition-colors"
                   >
                     <motion.span whileTap={{ scale: 0.8 }}>+</motion.span>
                   </button>
                </div>

                <Button 
                  onClick={handleAddPackToCart}
                  className="rounded-full px-8 py-4 h-auto text-sm font-bold flex-grow sm:flex-grow-0"
                >
                  <ShoppingBag size={18} className="mr-2" /> Ajouter au Panier
                </Button>
              </div>
              <p className="mt-4 text-[10px] text-primary/70 text-center italic uppercase tracking-widest font-bold">
                Le pack est traité comme une unité (carton) de tous ses produits.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <h2 className="text-3xl font-serif text-primary mb-10">Détails des produits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packProducts.map(p => (
            <div 
              key={p.id} 
              className="bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm cursor-pointer hover:shadow-md transition-all group"
              onClick={() => onNavigate('product-detail', p.id)}
            >
              <div className="overflow-hidden rounded-2xl mb-6">
                <img src={p.image} alt={p.name} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
              </div>
              <h4 className="text-xl font-serif text-primary mb-2 group-hover:text-accent transition-colors">{p.name}</h4>
              <p className="text-primary/70 text-sm mb-6 line-clamp-3">{p.description}</p>
              <Button 
                variant="outline" 
                className="w-full rounded-xl group-hover:bg-accent group-hover:text-white transition-all"
              >
                Voir la fiche produit
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
