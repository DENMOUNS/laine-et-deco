import React from 'react';
import { motion } from 'motion/react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

interface CartViewProps {
  cart: { product: Product; quantity: number }[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onNavigate: (view: string) => void;
}

export const CartView: React.FC<CartViewProps> = ({ cart, onUpdateQuantity, onRemove, onNavigate }) => {
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 50000 ? 0 : 5000;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-primary/5 max-w-lg mx-auto">
          <ShoppingBag size={64} className="mx-auto text-primary/20 mb-6" />
          <h2 className="text-3xl font-serif mb-4">Votre panier est vide</h2>
          <p className="text-primary/60 mb-8">Il semble que vous n'ayez pas encore ajouté d'articles à votre panier.</p>
          <button
            onClick={() => onNavigate('shop')}
            className="bg-primary text-white px-10 py-4 rounded-full font-bold hover:bg-accent transition-all"
          >
            Découvrir la boutique
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif mb-12">Votre Panier</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <motion.div
              layout
              key={item.product.id}
              className="flex items-center gap-6 bg-white p-6 rounded-3xl shadow-sm border border-primary/5"
            >
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-24 h-32 object-cover rounded-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="flex-grow">
                <p className="text-[10px] uppercase tracking-widest text-primary/50 font-bold">{item.product.category}</p>
                <h3 className="font-serif text-lg text-primary">{item.product.name}</h3>
                <p className="text-primary font-bold mt-1">{item.product.price.toLocaleString()} FCFA</p>
              </div>
              <div className="flex items-center bg-secondary rounded-full px-2 py-1">
                <button
                  onClick={() => onUpdateQuantity(item.product.id, -1)}
                  className="p-2 hover:text-accent transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-bold">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(item.product.id, 1)}
                  className="p-2 hover:text-accent transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="text-right min-w-[80px]">
                <p className="font-bold text-lg">{(item.product.price * item.quantity).toLocaleString()} FCFA</p>
                <button
                  onClick={() => onRemove(item.product.id)}
                  className="text-primary/30 hover:text-red-500 transition-colors mt-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-primary/5 sticky top-32">
            <h2 className="text-2xl font-serif mb-8">Récapitulatif</h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between text-primary/60">
                <span>Sous-total</span>
                <span className="text-primary font-medium">{subtotal.toLocaleString()} FCFA</span>
              </div>
              <div className="flex justify-between text-primary/60">
                <span>Livraison</span>
                <span className="text-primary font-medium">
                  {shipping === 0 ? 'Gratuite' : `${shipping.toLocaleString()} FCFA`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-[10px] text-accent italic">Plus que {(50000 - subtotal).toLocaleString()} FCFA pour la livraison gratuite !</p>
              )}
              <hr className="border-primary/5 my-4" />
              <div className="flex justify-between text-xl font-serif">
                <span>Total</span>
                <span className="text-primary font-bold">{total.toLocaleString()} FCFA</span>
              </div>
            </div>
            
            <button
              onClick={() => onNavigate('checkout')}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-accent transition-all duration-300 flex items-center justify-center group mt-8"
            >
              Passer la commande
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </button>
            
            <div className="mt-6 flex items-center justify-center gap-4 opacity-30">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
