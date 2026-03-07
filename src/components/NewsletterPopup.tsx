import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Sparkles } from 'lucide-react';

export const NewsletterPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('newsletter_popup_seen');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000); // Show after 5 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('newsletter_popup_seen', 'true');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setTimeout(() => {
        handleClose();
      }, 3000);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-primary hover:bg-accent hover:text-white transition-all shadow-sm"
            >
              <X size={20} />
            </button>

            {/* Image Section */}
            <div className="md:w-1/2 h-48 md:h-auto relative">
              <img 
                src="https://picsum.photos/seed/newsletter/800/1200" 
                alt="Newsletter" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent md:bg-gradient-to-r" />
            </div>

            {/* Content Section */}
            <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              {!isSubscribed ? (
                <>
                  <div className="flex items-center gap-2 text-accent font-bold uppercase tracking-widest text-[10px] mb-4">
                    <Sparkles size={14} />
                    <span>Offre Exclusive</span>
                  </div>
                  <h2 className="text-3xl font-serif text-primary mb-4 leading-tight">
                    Rejoignez notre <span className="italic">communauté créative</span>
                  </h2>
                  <p className="text-primary/60 text-sm mb-8 leading-relaxed">
                    Inscrivez-vous à notre newsletter et bénéficiez de <span className="text-accent font-bold">10% de réduction</span> sur votre première commande.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Votre adresse email"
                        className="w-full px-6 py-4 bg-secondary/50 border border-primary/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all text-sm"
                        required
                      />
                      <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/20" size={20} />
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-primary text-white py-4 rounded-2xl font-bold hover:bg-accent transition-all duration-500 shadow-lg shadow-primary/20"
                    >
                      S'abonner & Profiter
                    </button>
                  </form>
                  <p className="mt-6 text-[10px] text-primary/30 text-center">
                    En vous inscrivant, vous acceptez notre politique de confidentialité.
                  </p>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles size={40} />
                  </div>
                  <h2 className="text-2xl font-serif text-primary mb-2">Bienvenue parmi nous !</h2>
                  <p className="text-primary/60 text-sm mb-6">
                    Votre code promo de -10% arrive dans votre boîte mail.
                  </p>
                  <div className="bg-secondary/50 py-3 px-6 rounded-xl border border-dashed border-primary/20 inline-block font-mono font-bold text-accent">
                    BIENVENUE10
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
