import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Plus, Loader2 } from 'lucide-react';
import { Product } from '../../../types';
import { toast } from 'sonner';
import { Button } from '../ui/Button';

interface ProductTabsProps {
  product: Product;
}

export const ProductTabs: React.FC<ProductTabsProps> = ({ product }) => {
  const [activeTab, setActiveTab] = useState('description');
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', images: [] as string[] });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  React.useEffect(() => {
    const handleOpenReviews = () => setActiveTab('avis');
    window.addEventListener('open-reviews-tab', handleOpenReviews);
    return () => window.removeEventListener('open-reviews-tab', handleOpenReviews);
  }, []);

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
    <section id="product-tabs" className="mb-24 scroll-mt-24">
      <div className="flex border-b border-primary/10 mb-10 overflow-x-auto no-scrollbar">
        <div className="flex min-w-max">
          {['description', 'caractéristiques', 'avis'].map((tab) => (
            <Button
              key={tab}
              variant="ghost"
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all relative rounded-none h-auto ${
                activeTab === tab ? 'text-primary' : 'text-primary/70 hover:text-primary'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-1 bg-accent" />
              )}
            </Button>
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
          <div className="space-y-8">
            {product.isElectronic && product.specs && (
              <div className="bg-secondary/20 p-8 rounded-3xl border border-primary/5">
                <h3 className="text-lg font-serif mb-6">Spécifications Techniques</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-4">
                  {Object.entries(product.specs).map(([key, value], i) => (
                    <div key={i} className="flex justify-between py-3 border-b border-primary/5">
                      <span className="text-primary/70 text-sm">{key}</span>
                      <span className="text-primary font-bold text-sm">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Matière', value: product.material || (product.isElectronic ? 'Composants Tech' : '100% Naturel') },
                { label: 'Marque', value: product.brand || 'Artisanal' },
                { label: 'Garantie', value: product.warranty || 'Satisfait ou Remboursé' },
                { label: 'Origine', value: product.isElectronic ? 'Importé' : 'Cameroun' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-3 border-b border-primary/5">
                  <span className="text-primary/70 text-sm">{item.label}</span>
                  <span className="text-primary font-bold text-sm">{item.value}</span>
                </div>
              ))}
            </div>
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
                      <span className="text-xs text-primary/70">{review.date}</span>
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
                <p className="text-primary/70 italic">Aucun avis pour le moment. Soyez le premier à donner votre avis !</p>
              )}
            </div>

            <div className="bg-card p-8 rounded-[2rem] border border-primary/5 space-y-6 shadow-sm">
              <h3 className="text-xl font-serif">Laisser un avis</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-primary/70">Votre note :</span>
                  <div className="flex text-yellow-500">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Button 
                        key={i} 
                        variant="ghost"
                        size="icon"
                        onClick={() => setNewReview(prev => ({ ...prev, rating: i }))}
                        className={`hover:scale-125 transition-transform p-1 h-auto w-auto ${newReview.rating >= i ? 'text-yellow-500' : 'text-primary/10'}`}
                      >
                        <Star size={24} fill={newReview.rating >= i ? "currentColor" : "none"} />
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/70">Votre commentaire</label>
                  <textarea 
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Partagez votre expérience avec ce produit..."
                    className="w-full p-5 bg-secondary/30 border border-primary/5 rounded-2xl focus:outline-none focus:border-accent min-h-[120px] text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/70">Ajouter des photos</label>
                  <div className="flex gap-4">
                    <Button 
                      variant="outline"
                      onClick={() => toast.info('Fonctionnalité d\'upload bientôt disponible')}
                      className="w-24 h-24 border-2 border-dashed border-primary/10 rounded-2xl flex flex-col items-center justify-center text-primary/70 hover:border-accent hover:text-accent transition-all group"
                    >
                      <Plus size={24} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold mt-1">Photo</span>
                    </Button>
                  </div>
                </div>

                <Button 
                  onClick={handleReviewSubmit}
                  isLoading={isSubmittingReview}
                  className="w-full py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  Publier l'avis
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
