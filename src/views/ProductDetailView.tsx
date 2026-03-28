import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Heart, ShoppingBag, Truck, ShieldCheck, RefreshCcw, Plus, Minus, ChevronRight, Share2, Loader2, ChevronDown, Calculator } from 'lucide-react';
import { Product, PromoEvent } from '../types';
import { PRODUCTS } from '../constants';
import { ProductCard } from '../components/ProductCard';
import { getEffectivePrice } from '../utils/siteUtils';
import { toast } from 'sonner';

interface ProductDetailViewProps {
  product: Product;
  onAddToCart: (p: Product, q: number) => void;
  onAddToWishlist: (p: Product) => void;
  onQuickView: (p: Product) => void;
  onNavigate: (view: string) => void;
  events?: PromoEvent[];
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product, onAddToCart, onAddToWishlist, onQuickView, onNavigate, events = [] }) => {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const effectivePrice = getEffectivePrice(product, events);
  const hasDiscount = effectivePrice < product.price;

  const relatedProducts = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 3);

  const [newReview, setNewReview] = useState({ rating: 5, comment: '', images: [] as string[] });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [openAccordion, setOpenAccordion] = useState<string | null>('description');
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcProject, setCalcProject] = useState('pull');
  const [calcSize, setCalcSize] = useState('M');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const calculateYarn = () => {
    if (!product.yardage) return 0;
    // Rough estimates in meters
    const estimates: Record<string, Record<string, number>> = {
      pull: { S: 1000, M: 1200, L: 1400, XL: 1600 },
      echarpe: { S: 400, M: 500, L: 600, XL: 700 },
      bonnet: { S: 150, M: 200, L: 250, XL: 300 }
    };
    const neededMeters = estimates[calcProject][calcSize];
    return Math.ceil(neededMeters / product.yardage);
  };

  const handleReviewSubmit = () => {
    if (!newReview.comment.trim()) {
      toast.error('Veuillez entrer un commentaire');
      return;
    }
    setIsSubmittingReview(true);
    setTimeout(() => {
      setIsSubmittingReview(false);
      toast.success('Merci pour votre avis ! Il sera publié après modération.');
      setNewReview({ rating: 5, comment: '', images: [] as string[] });
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-primary/40 mb-12">
        <button onClick={() => onNavigate('home')} className="hover:text-primary">Accueil</button>
        <ChevronRight size={14} />
        <button onClick={() => onNavigate('shop')} className="hover:text-primary">Boutique</button>
        <ChevronRight size={14} />
        <span className="text-primary">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
        {/* Image Gallery */}
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl relative cursor-zoom-in"
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
          >
            <img 
              src={selectedVariant?.image || product.image} 
              alt={product.name} 
              className={`w-full h-full object-cover transition-transform duration-200 ${isZoomed ? 'scale-150' : 'scale-100'}`}
              style={isZoomed ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : {}}
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-4 no-scrollbar">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[40vw] sm:min-w-0 snap-center aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-accent transition-all">
                <img 
                  src={`https://picsum.photos/seed/${product.id}-${i}/400/400`} 
                  alt="Gallery" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent mb-2">{product.category}</p>
              <h1 className="text-5xl font-serif text-primary leading-tight">{product.name}</h1>
            </div>
            <button 
              onClick={() => onAddToWishlist(product)}
              className="p-4 rounded-full bg-white shadow-lg text-primary hover:text-accent transition-colors"
            >
              <Heart size={24} />
            </button>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center text-yellow-500">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={18} fill={i <= Math.floor(product.rating) ? "currentColor" : "none"} />
              ))}
            </div>
            <span className="text-sm font-bold text-primary/60">{product.rating} (48 avis clients)</span>
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
              <span className="text-xl text-primary/40 line-through font-bold">{product.price.toLocaleString()} FCFA</span>
            )}
            <p className="text-4xl font-bold text-primary">{effectivePrice.toLocaleString()} FCFA</p>
          </div>

          {/* Visual Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Couleur : <span className="text-primary/60">{selectedVariant?.color}</span></h3>
              <div className="flex gap-3">
                {product.variants.map((variant, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedVariant(variant)}
                    className={`w-12 h-12 rounded-full border-2 p-1 transition-all ${selectedVariant?.color === variant.color ? 'border-accent' : 'border-transparent hover:border-primary/20'}`}
                    title={variant.color}
                  >
                    <div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: variant.hex }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Yarn Calculator Button */}
          {product.yardage && (
            <div className="mb-8 p-6 bg-secondary/30 rounded-3xl border border-primary/5">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => setShowCalculator(!showCalculator)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-accent shadow-sm">
                    <Calculator size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">Calculateur de laine</h4>
                    <p className="text-xs text-primary/60">Estimez le nombre de pelotes nécessaires</p>
                  </div>
                </div>
                <ChevronDown size={20} className={`text-primary/40 transition-transform ${showCalculator ? 'rotate-180' : ''}`} />
              </div>
              
              <AnimatePresence>
                {showCalculator && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 mt-6 border-t border-primary/10 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Projet</label>
                        <select 
                          value={calcProject}
                          onChange={(e) => setCalcProject(e.target.value)}
                          className="w-full p-3 rounded-xl border border-primary/10 bg-white focus:outline-none focus:border-accent"
                        >
                          <option value="pull">Pull</option>
                          <option value="echarpe">Écharpe</option>
                          <option value="bonnet">Bonnet</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Taille</label>
                        <select 
                          value={calcSize}
                          onChange={(e) => setCalcSize(e.target.value)}
                          className="w-full p-3 rounded-xl border border-primary/10 bg-white focus:outline-none focus:border-accent"
                        >
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                        </select>
                      </div>
                      <div className="col-span-2 mt-4 flex items-center justify-between bg-white p-4 rounded-2xl border border-primary/5">
                        <div>
                          <p className="text-sm text-primary/60">Estimation :</p>
                          <p className="font-bold text-xl text-primary">{calculateYarn()} pelotes</p>
                        </div>
                        <button 
                          onClick={() => setQuantity(calculateYarn())}
                          className="text-sm font-bold text-accent bg-accent/10 px-4 py-2 rounded-xl hover:bg-accent hover:text-white transition-colors"
                        >
                          Appliquer
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          
          <div className="space-y-8 mb-12">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Quantité</h3>
              <div className="flex items-center w-32 bg-white border border-primary/10 rounded-full p-1">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:text-accent transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="flex-grow text-center font-bold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:text-accent transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => onAddToCart(product, quantity)}
                className="flex-grow bg-primary text-white py-5 rounded-2xl font-bold hover:bg-accent transition-all duration-300 flex items-center justify-center gap-3 shadow-xl shadow-primary/20"
              >
                <ShoppingBag size={20} />
                Ajouter au panier
              </button>
              <button className="p-5 border border-primary/10 rounded-2xl hover:bg-secondary transition-colors">
                <Share2 size={20} />
              </button>
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
          {/* Accordions */}
          <div className="mt-12 space-y-4 border-t border-primary/10 pt-8">
            {/* Description Accordion */}
            <div className="border border-primary/10 rounded-2xl overflow-hidden">
              <button 
                onClick={() => setOpenAccordion(openAccordion === 'desc' ? null : 'desc')}
                className="w-full flex justify-between items-center p-6 bg-white hover:bg-secondary/20 transition-colors"
              >
                <span className="font-bold text-primary">Description & Détails</span>
                <ChevronDown size={20} className={`text-primary/40 transition-transform ${openAccordion === 'desc' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openAccordion === 'desc' && (
                  <motion.div 
                    initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    className="overflow-hidden bg-white"
                  >
                    <div className="p-6 pt-0 text-primary/70 leading-relaxed">
                      <p>{product.description} Notre sélection est faite avec passion pour vous offrir le meilleur de l'artisanat.</p>
                      {product.yardage && <p className="mt-4"><strong>Métrage :</strong> {product.yardage}m / {product.weight}g</p>}
                      {product.material && <p className="mt-2"><strong>Matière :</strong> {product.material}</p>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Care Instructions Accordion */}
            {product.careInstructions && (
              <div className="border border-primary/10 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setOpenAccordion(openAccordion === 'care' ? null : 'care')}
                  className="w-full flex justify-between items-center p-6 bg-white hover:bg-secondary/20 transition-colors"
                >
                  <span className="font-bold text-primary">Guide d'entretien</span>
                  <ChevronDown size={20} className={`text-primary/40 transition-transform ${openAccordion === 'care' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openAccordion === 'care' && (
                    <motion.div 
                      initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="overflow-hidden bg-white"
                    >
                      <div className="p-6 pt-0 text-primary/70">
                        <ul className="list-disc pl-5 space-y-2">
                          {product.careInstructions.map((inst, idx) => (
                            <li key={idx}>{inst}</li>
                          ))}
                        </ul>
                        <button onClick={() => onNavigate('care-guide')} className="mt-4 text-sm font-bold text-accent hover:underline">Voir le guide complet</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Shipping Accordion */}
            <div className="border border-primary/10 rounded-2xl overflow-hidden">
              <button 
                onClick={() => setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')}
                className="w-full flex justify-between items-center p-6 bg-white hover:bg-secondary/20 transition-colors"
              >
                <span className="font-bold text-primary">Livraison & Retours</span>
                <ChevronDown size={20} className={`text-primary/40 transition-transform ${openAccordion === 'shipping' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openAccordion === 'shipping' && (
                  <motion.div 
                    initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                    className="overflow-hidden bg-white"
                  >
                    <div className="p-6 pt-0 text-primary/70 space-y-4">
                      <div className="flex items-start gap-3">
                        <Truck size={20} className="text-accent shrink-0 mt-1" />
                        <div>
                          <p className="font-bold text-primary">Livraison Standard (2-5 jours)</p>
                          <p className="text-sm">Gratuite à partir de 50 000 FCFA d'achats.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <RefreshCcw size={20} className="text-accent shrink-0 mt-1" />
                        <div>
                          <p className="font-bold text-primary">Retours Faciles</p>
                          <p className="text-sm">Vous avez 14 jours pour changer d'avis.</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <section className="mb-24">
          <div className="flex border-b border-primary/10 mb-10 overflow-x-auto no-scrollbar">
            <div className="flex min-w-max">
              {['description', 'caractéristiques', 'avis'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
                    activeTab === tab ? 'text-primary' : 'text-primary/40 hover:text-primary'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-1 bg-accent" />
                  )}
                </button>
              ))}
            </div>
          </div>
        <div className="max-w-3xl">
          {activeTab === 'description' && (
            <div className="space-y-6 text-primary/70 leading-relaxed">
              <p>
                Plongez dans l'univers de la création avec notre {product.name}. Chaque pièce est sélectionnée pour sa qualité exceptionnelle et son esthétique intemporelle.
              </p>
              <p>
                Que vous soyez un expert ou un débutant passionné, ce produit saura répondre à toutes vos attentes. Sa texture unique et ses finitions soignées en font un incontournable de notre collection.
              </p>
            </div>
          )}
          {activeTab === 'caractéristiques' && (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Matière', value: product.material || '100% Naturel' },
                { label: 'Origine', value: 'France' },
                { label: 'Poids', value: '500g' },
                { label: 'Dimensions', value: '20 x 15 cm' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-3 border-b border-primary/5">
                  <span className="text-primary/40 text-sm">{item.label}</span>
                  <span className="text-primary font-bold text-sm">{item.value}</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'avis' && (
            <div className="space-y-12">
              <div className="space-y-8">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-primary/5 pb-8">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center font-bold text-primary">
                            {review.userName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-primary">{review.userName}</h4>
                            <div className="flex text-yellow-500 mt-1">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} size={12} fill={i <= review.rating ? "currentColor" : "none"} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-primary/40">{review.date}</span>
                      </div>
                      <p className="text-primary/70 text-sm leading-relaxed mb-4">{review.comment}</p>
                      
                      {/* Review Photos */}
                      {review.images && review.images.length > 0 && (
                        <div className="flex gap-2">
                          {review.images.map((img, idx) => (
                            <div key={idx} className="w-20 h-20 rounded-xl overflow-hidden border border-primary/5 cursor-zoom-in">
                              <img src={img} alt="Avis" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-primary/40 italic">Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
                )}
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-primary/5 space-y-6 shadow-sm">
                <h3 className="text-xl font-serif">Laisser un avis</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-primary/60">Votre note :</span>
                    <div className="flex text-yellow-500">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <button 
                          key={i} 
                          onClick={() => setNewReview(prev => ({ ...prev, rating: i }))}
                          className={`hover:scale-125 transition-transform p-1 ${newReview.rating >= i ? 'text-yellow-500' : 'text-primary/10'}`}
                        >
                          <Star size={24} fill={newReview.rating >= i ? "currentColor" : "none"} />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/40">Votre commentaire</label>
                    <textarea 
                      value={newReview.comment}
                      onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Partagez votre expérience avec ce produit..."
                      className="w-full p-5 bg-secondary/30 border border-primary/5 rounded-2xl focus:outline-none focus:border-accent min-h-[120px] text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/40">Ajouter des photos</label>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => toast.info('Fonctionnalité d\'upload bientôt disponible')}
                        className="w-24 h-24 border-2 border-dashed border-primary/10 rounded-2xl flex flex-col items-center justify-center text-primary/30 hover:border-accent hover:text-accent transition-all group"
                      >
                        <Plus size={24} className="group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-bold mt-1">Photo</span>
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={handleReviewSubmit}
                    disabled={isSubmittingReview}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-accent transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                  >
                    {isSubmittingReview ? <Loader2 size={20} className="animate-spin" /> : "Publier l'avis"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      <section>
        <h2 className="text-3xl font-serif mb-12">Vous aimerez aussi</h2>
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 no-scrollbar">
          {relatedProducts.map((p) => (
            <div key={p.id} className="min-w-[85vw] sm:min-w-0 snap-center">
              <ProductCard 
                product={p} 
                onAddToCart={() => onAddToCart(p, 1)}
                onAddToWishlist={onAddToWishlist}
                onQuickView={onQuickView}
                onClick={() => onNavigate('product-detail')}
                events={events}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
