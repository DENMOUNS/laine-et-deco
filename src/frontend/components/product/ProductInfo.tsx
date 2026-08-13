import React, { useState } from 'react';
import { Heart, Star, Minus, Plus, ShoppingBag, Share2, Truck, ShieldCheck, RefreshCcw } from 'lucide-react';
import { Product, PromoEvent } from '../../../types';
import { getEffectivePrice, cleanText } from '../../utils/siteUtils';
import { toast } from 'sonner';
import { Button } from '../ui/Button';

interface ProductInfoProps {
  product: Product;
  onAddToCart: (p: Product, q: number) => void;
  onAddToWishlist: (p: Product) => void;
  events?: PromoEvent[];
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product, onAddToCart, onAddToWishlist, events = [] }) => {
  const [quantity, setQuantity] = useState(1);
  const effectivePrice = getEffectivePrice(product, events);
  const hasDiscount = effectivePrice < product.price;

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Découvrez ${product.name} sur Laine et Déco !`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Produit partagé avec succès !');
      } else {
        throw new Error('Web Share API not supported');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Lien copié dans le presse-papier !');
      } catch (clipboardErr) {
        toast.error('Impossible de copier le lien.');
      }
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent mb-2">{product.category}</p>
          <h1 className="text-5xl font-serif text-primary leading-tight">{product.name}</h1>
        </div>
        <Button 
          variant="ghost"
          size="icon"
          onClick={() => onAddToWishlist(product)}
          className="p-4 rounded-full bg-card shadow-lg text-primary hover:text-accent"
        >
          <Heart size={24} />
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost"
          size="sm"
          onClick={() => {
            const tabsSection = document.getElementById('product-tabs');
            if (tabsSection) {
              tabsSection.scrollIntoView({ behavior: 'smooth' });
              // Small delay to allow scroll, then trigger a custom event that ProductTabs can listen to
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('open-reviews-tab'));
              }, 500);
            }
          }}
          className="flex items-center text-yellow-500 p-0 h-auto"
          title="Voir les avis"
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} size={18} fill={i <= Math.floor(product.rating) ? "currentColor" : "none"} />
          ))}
        </Button>
        <span className="text-sm font-bold text-primary/70">{product.rating} ({(product.reviews?.length || 0)} avis clients)</span>
        <span className={`ml-4 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
          product.stock > 10 ? 'bg-green-100 text-green-600' : 
          product.stock > 0 ? 'bg-orange-100 text-orange-600' : 
          'bg-red-100 text-red-600'
        }`}>
          {product.stock > 10 ? 'En Stock' : product.stock > 0 ? 'Stock Faible' : 'Épuisé'}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-8">
        {hasDiscount && (
          <span className="text-xl text-primary/70 line-through font-bold">{product.price.toLocaleString()} FCFA</span>
        )}
        <p className="text-4xl font-bold text-primary">{effectivePrice.toLocaleString()} FCFA</p>
      </div>
      
      <p className="text-primary/70 leading-relaxed mb-10 text-lg">
        {cleanText(product.description) || "Notre sélection est faite avec passion pour vous offrir le meilleur de l'artisanat."}
      </p>

      <div className="space-y-8 mb-12">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Quantité</h3>
          <div className="flex items-center w-32 bg-card border border-primary/10 rounded-full p-1">
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 flex items-center justify-center hover:text-accent"
            >
              <Minus size={18} />
            </Button>
            <span className="flex-grow text-center font-bold">{quantity}</span>
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 flex items-center justify-center hover:text-accent"
            >
              <Plus size={18} />
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={() => onAddToCart(product, quantity)}
            className="flex-grow py-5 rounded-2xl font-bold gap-3 shadow-xl shadow-primary/20"
          >
            <ShoppingBag size={20} />
            Ajouter au panier
          </Button>
          <Button 
            variant="outline"
            size="icon"
            onClick={handleShare}
            className="p-5 border border-primary/10 rounded-2xl hover:bg-secondary"
            title="Partager ce produit"
          >
            <Share2 size={20} />
          </Button>
        </div>
      </div>

      {/* Features List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-primary/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 text-accent rounded-lg"><Truck size={20} /></div>
          <span className="text-xs font-bold text-primary/70">Livraison 48h</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 text-accent rounded-lg"><ShieldCheck size={20} /></div>
          <span className="text-xs font-bold text-primary/70">Garantie 2 ans</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/10 text-accent rounded-lg"><RefreshCcw size={20} /></div>
          <span className="text-xs font-bold text-primary/70">Retours Gratuits</span>
        </div>
      </div>
    </div>
  );
};
