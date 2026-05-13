import React from 'react';
import { motion } from 'motion/react';
import { Package, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import { PACKS, PRODUCTS } from '../../constants';
import { Button } from '../components/ui/Button';
import { Pack, Product } from '../../types';

interface PacksViewProps {
  onNavigate: (view: string, id?: string) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  onAddPackToCart: (pack: Pack, quantity?: number) => void;
}

export const PacksView: React.FC<PacksViewProps> = ({ onNavigate, onAddToCart, onAddPackToCart }) => {
  const getPackPrice = (pack: Pack) => {
    return pack.products.reduce((sum, item) => {
      const product = PRODUCTS.find(p => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const getPackImage = (pack: Pack) => {
    const firstProduct = PRODUCTS.find(p => p.id === pack.products[0]?.productId);
    return firstProduct?.image || 'https://picsum.photos/seed/pack/800/600';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-widest mb-6"
        >
          <Sparkles size={14} />
          <span>Offres Groupées</span>
        </motion.div>
        <h1 className="text-5xl font-serif text-primary mb-6">Nos Packs Créatifs</h1>
        <p className="text-primary/60 max-w-2xl mx-auto text-lg">
          Économisez jusqu'à 20% en choisissant nos packs soigneusement composés pour vos projets de tricot et de décoration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {PACKS.map((pack, index) => {
          const originalPrice = getPackPrice(pack);
          const discountedPrice = originalPrice * (1 - pack.discountPercentage / 100);
          const packImage = getPackImage(pack);

          return (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-card rounded-[3rem] border border-primary/5 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={packImage} 
                  alt={pack.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-accent font-bold shadow-lg">
                  -{pack.discountPercentage}%
                </div>
              </div>

              <div className="p-8 flex-grow flex flex-col">
                <div className="flex items-center gap-2 text-primary/40 text-[10px] font-bold uppercase tracking-widest mb-3">
                  <Package size={14} />
                  <span>{pack.products.length} Produits inclus</span>
                </div>
                <h3 className="text-2xl font-serif text-primary mb-4 group-hover:text-accent transition-colors">
                  {pack.name}
                </h3>
                <p className="text-primary/60 text-sm mb-6 line-clamp-2">
                  {pack.description}
                </p>

                <div className="mt-auto pt-6 border-t border-primary/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-primary/40 line-through font-bold">
                      {originalPrice.toLocaleString()} FCFA
                    </p>
                    <p className="text-xl font-bold text-accent">
                      {discountedPrice.toLocaleString()} FCFA
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onAddPackToCart(pack, 1)}
                      className="w-12 h-12 rounded-2xl bg-primary/5 hover:bg-accent hover:text-white"
                      title="Ajouter au panier"
                    >
                      <ShoppingBag size={20} />
                    </Button>
                    <Button 
                      variant="primary"
                      onClick={() => onNavigate('pack-detail', pack.id)}
                      className="rounded-2xl px-6"
                    >
                      Voir Détails
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-20 bg-primary p-12 md:p-20 rounded-[4rem] text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-4xl font-serif mb-6">Créez votre propre pack !</h2>
          <p className="text-white/70 text-lg mb-10">
            Vous ne trouvez pas le pack idéal ? Composez votre propre ensemble de produits et bénéficiez d'une réduction automatique dès 3 articles.
          </p>
          <Button 
            variant="secondary" 
            size="lg"
            onClick={() => onNavigate('custom-pack')}
            className="rounded-full px-10 py-6 text-lg font-bold"
          >
            Personnaliser mon pack <ArrowRight className="ml-2" />
          </Button>
        </div>
        <Package className="absolute -bottom-20 -right-20 w-96 h-96 text-white/5 -rotate-12" />
      </div>
    </div>
  );
};
