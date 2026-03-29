import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Gift, Package, ShoppingBag, Check, Info, ArrowLeft, ArrowRight, Trash2, MessageSquare, Sparkles, Box } from 'lucide-react';
import { PRODUCTS } from '../constants';
import { Product } from '../types';

interface GiftBoxViewProps {
  onNavigate: (view: string, id?: string) => void;
  onAddToCart: (p: Product, q: number) => void;
}

const BOX_TYPES = [
  { id: 'small', name: 'Petit Coffret', price: 2500, capacity: 3, description: 'Idéal pour un petit projet (bonnet, gants).' },
  { id: 'medium', name: 'Coffret Standard', price: 4500, capacity: 6, description: 'Le choix parfait pour une écharpe ou un petit pull.' },
  { id: 'large', name: 'Grand Coffret Luxe', price: 7500, capacity: 12, description: 'Pour les grands projets et les passionnés.' },
];

export const GiftBoxView: React.FC<GiftBoxViewProps> = ({ onNavigate, onAddToCart }) => {
  const [step, setStep] = useState(1);
  const [selectedBox, setSelectedBox] = useState(BOX_TYPES[1]);
  const [selectedYarn, setSelectedYarn] = useState<{ product: Product; quantity: number }[]>([]);
  const [selectedNeedles, setSelectedNeedles] = useState<Product | null>(null);
  const [selectedAccessories, setSelectedAccessories] = useState<Product[]>([]);
  const [giftMessage, setGiftMessage] = useState('');

  const yarnProducts = PRODUCTS.filter(p => p.category === 'Laines');
  const needleProducts = PRODUCTS.filter(p => p.category === 'Accessoires' && p.name.toLowerCase().includes('aiguille'));
  const accessoryProducts = PRODUCTS.filter(p => p.category === 'Décoration' || (p.category === 'Accessoires' && !p.name.toLowerCase().includes('aiguille')));

  const totalYarnCount = selectedYarn.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = selectedBox.price + 
    selectedYarn.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) +
    (selectedNeedles?.price || 0) +
    selectedAccessories.reduce((acc, item) => acc + item.price, 0);

  const handleAddYarn = (product: Product) => {
    if (totalYarnCount >= selectedBox.capacity) return;
    setSelectedYarn(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleRemoveYarn = (productId: string) => {
    setSelectedYarn(prev => prev.filter(item => item.product.id !== productId));
  };

  const toggleAccessory = (product: Product) => {
    setSelectedAccessories(prev => {
      if (prev.find(p => p.id === product.id)) {
        return prev.filter(p => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const handleComplete = () => {
    // Create a virtual product for the gift box
    const giftBoxProduct: Product = {
      id: `giftbox-${Date.now()}`,
      name: `Coffret Cadeau Personnalisé (${selectedBox.name})`,
      price: totalPrice,
      category: 'Coffrets',
      image: 'https://picsum.photos/seed/giftbox/800/800',
      description: `Coffret personnalisé contenant : ${selectedYarn.map(y => `${y.quantity}x ${y.product.name}`).join(', ')}${selectedNeedles ? `, ${selectedNeedles.name}` : ''}${selectedAccessories.length > 0 ? `, ${selectedAccessories.map(a => a.name).join(', ')}` : ''}.${giftMessage ? ` Message : ${giftMessage}` : ''}`,
      rating: 5,
      reviews: [],
      stock: 1,
      isAvailable: true,
      variants: []
    };
    onAddToCart(giftBoxProduct, 1);
    onNavigate('cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-primary/40 mb-12">
        <button onClick={() => onNavigate('home')} className="hover:text-primary">Accueil</button>
        <ChevronRight size={14} />
        <span className="text-primary">Coffret Personnalisé</span>
      </nav>

      <div className="text-center max-w-3xl mx-auto mb-16 space-y-6">
        <h1 className="text-5xl md:text-6xl font-serif text-primary leading-tight">Créez votre Coffret Cadeau</h1>
        <p className="text-lg text-primary/60 leading-relaxed">
          Offrez une expérience unique en composant vous-même votre coffret. Choisissez une boîte, garnissez-la de nos plus belles laines, ajoutez des accessoires et un message personnel. Nous nous occupons du reste !
        </p>
        
        {/* How it works section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-primary/5">
          <div className="space-y-3">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent mx-auto font-bold">1</div>
            <h3 className="font-bold text-sm text-primary uppercase tracking-widest">Choisissez</h3>
            <p className="text-xs text-primary/40">Sélectionnez la taille de votre boîte selon vos envies.</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent mx-auto font-bold">2</div>
            <h3 className="font-bold text-sm text-primary uppercase tracking-widest">Garnissez</h3>
            <p className="text-xs text-primary/40">Ajoutez vos laines et accessoires préférés.</p>
          </div>
          <div className="space-y-3">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent mx-auto font-bold">3</div>
            <h3 className="font-bold text-sm text-primary uppercase tracking-widest">Offrez</h3>
            <p className="text-xs text-primary/40">Ajoutez un mot doux, nous préparons le paquet avec soin.</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-3xl mx-auto mb-16 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-secondary -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-1 bg-accent -translate-y-1/2 z-0 transition-all duration-500" 
          style={{ width: `${((step - 1) / 4) * 100}%` }}
        />
        <div className="relative z-10 flex justify-between">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div 
              key={s}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${
                step >= s ? 'bg-accent text-white shadow-lg' : 'bg-secondary text-primary/40'
              }`}
            >
              {step > s ? <Check size={20} /> : s}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4 text-[10px] font-bold uppercase tracking-widest text-primary/40">
          <span>Boîte</span>
          <span>Laines</span>
          <span>Aiguilles</span>
          <span>Extras</span>
          <span>Message</span>
          <span>Résumé</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                    <Package size={24} />
                  </div>
                  <h2 className="text-3xl font-serif text-primary">1. Choisissez votre boîte</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {BOX_TYPES.map((box) => (
                    <button
                      key={box.id}
                      onClick={() => setSelectedBox(box)}
                      className={`group p-8 rounded-[2.5rem] border-2 text-left transition-all space-y-6 relative overflow-hidden ${
                        selectedBox.id === box.id ? 'border-accent bg-accent/5 shadow-2xl scale-[1.02]' : 'border-primary/5 hover:border-primary/20 bg-white'
                      }`}
                    >
                      {selectedBox.id === box.id && (
                        <motion.div 
                          layoutId="activeBox"
                          className="absolute top-0 right-0 p-4 text-accent"
                        >
                          <Check size={24} />
                        </motion.div>
                      )}
                      
                      <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-colors ${selectedBox.id === box.id ? 'bg-accent text-white' : 'bg-secondary text-primary/40 group-hover:bg-primary/5'}`}>
                        <Box size={32} />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-primary">{box.name}</h3>
                        <p className="text-sm text-primary/60 leading-relaxed">{box.description}</p>
                      </div>

                      <div className="pt-6 border-t border-primary/5 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold text-primary">{box.price.toLocaleString()} FCFA</span>
                          <span className="px-3 py-1 bg-primary/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary/40">
                            Capacité: {box.capacity}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                      <Sparkles size={24} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-serif text-primary">2. Sélectionnez vos laines</h2>
                      <p className="text-sm text-primary/40">Remplissez votre coffret selon sa capacité</p>
                    </div>
                  </div>
                  
                  <div className="bg-white px-6 py-4 rounded-2xl border border-primary/5 shadow-sm flex items-center gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Remplissage</p>
                      <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-accent"
                          initial={{ width: 0 }}
                          animate={{ width: `${(totalYarnCount / selectedBox.capacity) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{totalYarnCount} / {selectedBox.capacity}</p>
                      <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Pelotes</p>
                    </div>
                  </div>
                </div>

                {totalYarnCount >= selectedBox.capacity && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-accent/5 rounded-2xl flex items-center justify-between gap-4 border border-accent/10"
                  >
                    <div className="flex items-center gap-3">
                      <Info size={18} className="text-accent" />
                      <p className="text-sm text-accent font-medium">Votre coffret est plein ! Vous pouvez passer à l'étape suivante ou changer de boîte.</p>
                    </div>
                    <button 
                      onClick={() => setStep(1)}
                      className="text-xs font-bold uppercase tracking-widest text-primary hover:text-accent transition-colors"
                    >
                      Changer de boîte
                    </button>
                  </motion.div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {yarnProducts.map((p) => {
                    const countInBox = selectedYarn.find(item => item.product.id === p.id)?.quantity || 0;
                    return (
                      <div 
                        key={p.id}
                        className="bg-white rounded-[2.5rem] border border-primary/5 p-5 space-y-4 group hover:shadow-xl transition-all"
                      >
                        <div className="relative aspect-square overflow-hidden rounded-2xl">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                          {countInBox > 0 && (
                            <div className="absolute top-3 right-3 bg-accent text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg">
                              {countInBox}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-primary truncate">{p.name}</h3>
                          <p className="text-xs text-accent font-bold">{p.price.toLocaleString()} FCFA</p>
                        </div>
                        <div className="flex gap-2">
                          {countInBox > 0 && (
                            <button
                              onClick={() => {
                                setSelectedYarn(prev => {
                                  const existing = prev.find(item => item.product.id === p.id);
                                  if (existing && existing.quantity > 1) {
                                    return prev.map(item => item.product.id === p.id ? { ...item, quantity: item.quantity - 1 } : item);
                                  }
                                  return prev.filter(item => item.product.id !== p.id);
                                });
                              }}
                              className="flex-1 py-3 rounded-xl bg-secondary text-primary text-xs font-bold hover:bg-red-50 hover:text-red-500 transition-all"
                            >
                              -
                            </button>
                          )}
                          <button
                            onClick={() => handleAddYarn(p)}
                            disabled={totalYarnCount >= selectedBox.capacity}
                            className={`flex-[2] py-3 rounded-xl text-xs font-bold transition-all ${
                              totalYarnCount >= selectedBox.capacity 
                                ? 'bg-secondary text-primary/20 cursor-not-allowed' 
                                : 'bg-primary text-white hover:bg-accent'
                            }`}
                          >
                            {countInBox > 0 ? 'Ajouter' : 'Choisir'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <h2 className="text-3xl font-serif text-primary">3. Aiguilles (Optionnel)</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {needleProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedNeedles(selectedNeedles?.id === p.id ? null : p)}
                      className={`p-6 rounded-[2rem] border-2 text-center transition-all space-y-4 ${
                        selectedNeedles?.id === p.id ? 'border-accent bg-accent/5' : 'border-primary/5 hover:border-primary/20'
                      }`}
                    >
                      <img src={p.image} alt={p.name} className="w-20 h-20 mx-auto object-cover rounded-xl" referrerPolicy="no-referrer" />
                      <div>
                        <h3 className="text-xs font-bold text-primary">{p.name}</h3>
                        <p className="text-xs text-accent font-bold">{p.price.toLocaleString()} FCFA</p>
                      </div>
                      {selectedNeedles?.id === p.id && (
                        <div className="bg-accent text-white p-1 rounded-full w-6 h-6 mx-auto flex items-center justify-center">
                          <Check size={14} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <h2 className="text-3xl font-serif text-primary">4. Petits plus (Optionnel)</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {accessoryProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => toggleAccessory(p)}
                      className={`p-6 rounded-[2rem] border-2 text-center transition-all space-y-4 ${
                        selectedAccessories.find(a => a.id === p.id) ? 'border-accent bg-accent/5' : 'border-primary/5 hover:border-primary/20'
                      }`}
                    >
                      <img src={p.image} alt={p.name} className="w-20 h-20 mx-auto object-cover rounded-xl" referrerPolicy="no-referrer" />
                      <div>
                        <h3 className="text-xs font-bold text-primary">{p.name}</h3>
                        <p className="text-xs text-accent font-bold">{p.price.toLocaleString()} FCFA</p>
                      </div>
                      {selectedAccessories.find(a => a.id === p.id) && (
                        <div className="bg-accent text-white p-1 rounded-full w-6 h-6 mx-auto flex items-center justify-center">
                          <Check size={14} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-serif text-primary">5. Un petit mot doux ?</h2>
                    <p className="text-sm text-primary/40">Ajoutez un message personnalisé pour le destinataire</p>
                  </div>
                </div>
                
                <div className="bg-white p-8 rounded-[2.5rem] border border-primary/5 shadow-sm space-y-6">
                  <textarea
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    placeholder="Écrivez votre message ici... (ex: Joyeux anniversaire Maman !)"
                    className="w-full h-48 p-6 bg-secondary/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20 text-primary placeholder:text-primary/30 resize-none font-serif text-lg"
                  />
                  <div className="flex items-center gap-3 text-xs text-primary/40">
                    <Info size={14} />
                    <p>Ce message sera imprimé sur une jolie carte glissée dans le coffret.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                <h2 className="text-3xl font-serif text-primary">6. Votre coffret est prêt !</h2>
                <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-primary/5 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <Gift size={300} />
                  </div>
                  
                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">Récapitulatif du contenu</h3>
                        <ul className="space-y-4">
                          <li className="flex items-center gap-4 text-sm font-bold text-primary">
                            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                              <Package size={20} />
                            </div>
                            <span>{selectedBox.name}</span>
                          </li>
                          {selectedYarn.map(item => (
                            <li key={item.product.id} className="flex items-center gap-4 text-sm">
                              <img src={item.product.image} alt={item.product.name} className="w-10 h-10 rounded-xl object-cover" referrerPolicy="no-referrer" />
                              <span className="font-medium">{item.quantity}x {item.product.name}</span>
                            </li>
                          ))}
                          {selectedNeedles && (
                            <li key={selectedNeedles.id} className="flex items-center gap-4 text-sm">
                              <img src={selectedNeedles.image} alt={selectedNeedles.name} className="w-10 h-10 rounded-xl object-cover" referrerPolicy="no-referrer" />
                              <span className="font-medium">{selectedNeedles.name}</span>
                            </li>
                          )}
                          {selectedAccessories.map(item => (
                            <li key={item.id} className="flex items-center gap-4 text-sm">
                              <img src={item.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover" referrerPolicy="no-referrer" />
                              <span className="font-medium">{item.name}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {giftMessage && (
                        <div className="p-6 bg-secondary/30 rounded-2xl border border-primary/5 italic font-serif text-primary/70">
                          <p className="text-xs font-bold uppercase tracking-widest text-primary/40 not-italic mb-2">Votre message :</p>
                          "{giftMessage}"
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col justify-center">
                      <div className="bg-primary text-white p-10 rounded-[2.5rem] space-y-6 shadow-2xl shadow-primary/20">
                        <div className="space-y-1">
                          <p className="text-xs font-bold uppercase tracking-widest text-white/40">Total à régler</p>
                          <p className="text-5xl font-bold">{totalPrice.toLocaleString()} FCFA</p>
                        </div>
                        <div className="pt-6 border-t border-white/10 space-y-4">
                          <div className="flex items-center gap-3 text-xs text-white/60">
                            <Check size={16} className="text-accent" />
                            <span>Emballage cadeau inclus</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-white/60">
                            <Check size={16} className="text-accent" />
                            <span>Carte personnalisée incluse</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-white/60">
                            <Check size={16} className="text-accent" />
                            <span>Préparé avec soin sous 24h</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-12 flex justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(prev => prev - 1)}
                className="flex items-center gap-2 px-8 py-4 rounded-full font-bold text-primary hover:bg-secondary transition-all"
              >
                <ArrowLeft size={20} /> Précédent
              </button>
            ) : <div />}

            {step < 6 ? (
              <button
                onClick={() => setStep(prev => prev + 1)}
                className="flex items-center gap-2 px-10 py-4 bg-primary text-white rounded-full font-bold hover:bg-accent transition-all shadow-xl shadow-primary/20"
              >
                Suivant <ArrowRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 px-10 py-4 bg-accent text-white rounded-full font-bold hover:bg-primary transition-all shadow-xl shadow-accent/20"
              >
                <ShoppingBag size={20} /> Ajouter au panier
              </button>
            )}
          </div>
        </div>

        {/* Sidebar Summary - Hidden on small screens if not on summary step */}
        <div className={`lg:col-span-1 ${step === 6 ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-white rounded-[3rem] p-8 border border-primary/5 shadow-sm sticky top-32 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-serif text-primary">Votre Sélection</h3>
              <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center text-accent">
                <ShoppingBag size={16} />
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Box Summary */}
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-secondary/20">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-accent shadow-sm">
                  <Package size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Boîte</p>
                  <p className="text-xs font-bold text-primary">{selectedBox.name}</p>
                </div>
                <p className="ml-auto text-xs font-bold text-primary">{selectedBox.price.toLocaleString()}</p>
              </div>

              {/* Yarn Summary */}
              {selectedYarn.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Laines</p>
                    <span className="text-[10px] font-bold text-accent">{totalYarnCount}/{selectedBox.capacity}</span>
                  </div>
                  <div className="space-y-2">
                    {selectedYarn.map(item => (
                      <div key={item.product.id} className="flex items-center gap-3 group">
                        <div className="relative">
                          <img src={item.product.image} alt={item.product.name} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                          <span className="absolute -top-1 -right-1 bg-accent text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-[10px] font-bold text-primary truncate">{item.product.name}</p>
                          <p className="text-[9px] text-primary/40">{(item.product.price * item.quantity).toLocaleString()} FCFA</p>
                        </div>
                        <button 
                          onClick={() => handleRemoveYarn(item.product.id)} 
                          className="opacity-0 group-hover:opacity-100 text-primary/20 hover:text-red-500 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Needles Summary */}
              {selectedNeedles && (
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-secondary/20">
                  <img src={selectedNeedles.image} alt={selectedNeedles.name} className="w-10 h-10 rounded-xl object-cover shadow-sm" referrerPolicy="no-referrer" />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Aiguilles</p>
                    <p className="text-xs font-bold text-primary truncate max-w-[100px]">{selectedNeedles.name}</p>
                  </div>
                  <p className="ml-auto text-xs font-bold text-primary">{selectedNeedles.price.toLocaleString()}</p>
                </div>
              )}

              {/* Accessories Summary */}
              {selectedAccessories.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Extras</p>
                  <div className="space-y-2">
                    {selectedAccessories.map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover shadow-sm" referrerPolicy="no-referrer" />
                        <p className="text-[10px] font-bold text-primary truncate flex-grow">{item.name}</p>
                        <p className="text-[9px] font-bold text-primary">{item.price.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Message Summary */}
              {giftMessage && (
                <div className="p-3 rounded-2xl bg-accent/5 border border-accent/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1">Message inclus</p>
                  <p className="text-[10px] text-accent/70 italic truncate">"{giftMessage}"</p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-primary/5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-primary/40 uppercase tracking-widest">Total Est.</span>
                <span className="text-xl font-bold text-primary">{totalPrice.toLocaleString()} FCFA</span>
              </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-2xl flex items-start gap-3">
              <Info size={14} className="text-primary/40 shrink-0 mt-0.5" />
              <p className="text-[9px] text-primary/60 leading-relaxed italic">
                Le prix final inclut l'emballage premium et la carte personnalisée.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
