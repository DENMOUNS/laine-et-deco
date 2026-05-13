import React from 'react';
import { motion } from 'motion/react';
import { Camera, Heart, ShoppingBag, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useEntity } from '../hooks/useEntity';
import { Lookbook, Product } from '../../types';

interface LookbookViewProps {
  onNavigate: (view: string, id?: string) => void;
  products: Product[];
}

export const LookbookView: React.FC<LookbookViewProps> = ({ onNavigate, products }) => {
  const { data: lookbooks } = useEntity<Lookbook>('lookbook', []);
  const activeLookbooks = lookbooks.filter(lb => lb.status === 'active');

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-widest mb-6"
        >
          <Camera size={14} />
          <span>Inspirations Créatives</span>
        </motion.div>
        <h1 className="text-5xl font-serif text-primary mb-6">Notre Lookbook</h1>
        <p className="text-primary/60 max-w-2xl mx-auto text-lg">
          Découvrez comment nos produits créent des ambiances uniques.
        </p>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
        {activeLookbooks.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="break-inside-avoid group relative bg-card rounded-[2.5rem] overflow-hidden border border-primary/5 shadow-sm hover:shadow-xl transition-all"
          >
            <div className="relative">
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                <p className="text-white font-serif text-lg mb-4">{post.title}</p>
                <div className="flex flex-col gap-2">
                  {post.products.map(productId => {
                    const product = products.find(p => p.id === productId);
                    if (!product) return null;
                    return (
                      <div key={productId} className="flex flex-row items-center justify-between bg-white/20 backdrop-blur-md p-2 rounded-xl group/item">
                        <div className="flex items-center gap-2">
                           <img src={product.image} className="w-8 h-8 rounded-lg object-cover" alt="" />
                           <span className="text-white text-xs font-bold truncate max-w-[100px]">{product.name}</span>
                        </div>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="rounded-full px-3 py-1 text-xs scale-90"
                          onClick={() => onNavigate('product-detail', product.id)}
                        >
                          <ShoppingBag size={12} className="mr-1" /> Acheter
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-serif text-lg text-primary mb-2">{post.title}</h3>
              <p className="text-primary/60 text-sm mb-4">{post.description}</p>
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-accent" />
                <span className="text-xs font-bold text-accent">{Math.floor(Math.random() * 100) + 12} coups de cœur</span>
              </div>
            </div>
          </motion.div>
        ))}
        {activeLookbooks.length === 0 && (
           <p className="text-center text-primary/40 italic py-12 w-full col-span-3">Aucun lookbook trouvé.</p>
        )}
      </div>

      {/* Footer section... */}
      <div className="mt-32 text-center">
        <div className="inline-block p-12 bg-accent/5 rounded-[4rem] border border-accent/10 max-w-3xl">
          <Sparkles className="mx-auto text-accent mb-6" size={40} />
          <h2 className="text-3xl font-serif text-primary mb-4">Partagez vos créations !</h2>
          <p className="text-primary/60 mb-8">
            Utilisez le hashtag <span className="font-bold text-accent">#LaineEtDeco</span> sur Instagram pour avoir une chance d'être mis en avant dans notre lookbook et recevoir un bon d'achat de 5000 FCFA.
          </p>
          <Button variant="primary" className="rounded-full px-8 py-4">
            Suivez-nous sur Instagram
          </Button>
        </div>
      </div>
    </div>
  );
};
