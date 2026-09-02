import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronDown, MessageCircle, Truck, CreditCard, Package, Settings, Info, ChevronRight, HelpCircle } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../backend/firebase';
import { cn } from '../utils/utils';
import { useStaticEntity } from '../hooks/useStaticEntity';
import { FAQ, FaqPageConfig } from '../../types';
import { useTranslation } from '../../i18n';
import { useConfigStore } from '../../stores/configStore';
import { DEFAULT_FAQ_PAGE_CONFIG } from '../../siteDefaults';

export const FAQView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { t, l, isEn } = useTranslation();
  const { data: FAQ_DATA, isLoading } = useStaticEntity<FAQ>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const siteConfig = useConfigStore((s) => s.siteConfig);
  const setSiteConfig = useConfigStore((s) => s.setSiteConfig);
  const rawFaqConfig = siteConfig.faqPage;

  const [liveFaqConfig, setLiveFaqConfig] = useState<FaqPageConfig>(rawFaqConfig || DEFAULT_FAQ_PAGE_CONFIG);

  useEffect(() => {
    if (rawFaqConfig) {
      setLiveFaqConfig(rawFaqConfig);
    }
  }, [rawFaqConfig]);

  // Real-time Firestore subscription
  useEffect(() => {
    try {
      const docId = siteConfig?.id || 'global';
      const ref = doc(db, 'site_config', docId);
      const unsubscribe = onSnapshot(
        ref,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data?.faqPage) {
              setLiveFaqConfig(data.faqPage);
              setSiteConfig((prev) => ({
                ...prev,
                ...data,
                faqPage: data.faqPage,
              }));
            }
          }
        },
        (error) => {
          console.warn('Firestore subscription note on FAQView:', error);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('Could not attach Firestore listener on FAQView:', err);
    }
  }, [siteConfig?.id, setSiteConfig]);

  const cfg: FaqPageConfig = { ...DEFAULT_FAQ_PAGE_CONFIG, ...liveFaqConfig };

  const categories = [
    { id: 'all', name: isEn ? 'All' : 'Toutes', icon: <HelpCircle size={20} /> },
    { id: 'Livraison', name: isEn ? 'Shipping' : 'Livraison', icon: <Truck size={20} /> },
    { id: 'Commandes', name: isEn ? 'Orders' : 'Commandes', icon: <Package size={20} /> },
    { id: 'Paiements', name: isEn ? 'Payments' : 'Paiements', icon: <CreditCard size={20} /> },
    { id: 'Produits', name: isEn ? 'Products' : 'Produits', icon: <Info size={20} /> },
    { id: 'Sur Mesure', name: isEn ? 'Bespoke' : 'Sur Mesure', icon: <Settings size={20} /> },
  ];

  const normalize = (str: string) => 
    (str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const allFilteredBySearch = (FAQ_DATA || []).filter(faq => {
    const searchLower = normalize(searchQuery);
    const questionText = l(faq, 'question');
    const answerText = l(faq, 'answer');
    const matchesSearch = normalize(questionText).includes(searchLower) || 
                          normalize(answerText).includes(searchLower);
    const isActive = faq.status !== 'inactive';
    return matchesSearch && isActive;
  });

  const filteredFaqs = allFilteredBySearch.filter(faq => 
    activeCategory === 'all' || faq.category === activeCategory
  ).sort((a, b) => (a.order || 0) - (b.order || 0));

  const hasResultsInOtherCategories = searchQuery && filteredFaqs.length === 0 && allFilteredBySearch.length > 0;

  return (
    <div className="min-h-screen bg-slate-50/30 pb-20 overflow-hidden">
      {/* Hero Section */}
      <div className="bg-[#3E4A3D] dark:bg-[#141614] text-white pt-24 pb-16 px-4 rounded-b-[2.5rem] md:rounded-b-[4rem] relative overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -ml-10 -mb-10" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl font-serif mb-6 leading-tight"
          >
            {cfg.heroTitle || (isEn ? 'How can we help you?' : 'Comment pouvons-nous vous aider ?')}
          </motion.h1>
          
          <div className="relative max-w-2xl mx-auto px-2">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/70" size={20} />
            <input 
              type="text"
              placeholder={cfg.searchPlaceholder || (isEn ? 'Search a question...' : 'Rechercher une question...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 md:py-5 rounded-3xl bg-white text-primary placeholder:text-primary/70 shadow-2xl shadow-primary/20 outline-none focus:ring-4 focus:ring-accent/20 transition-all text-base md:text-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-10 sm:-mt-12 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Categories Sidebar */}
          <div className="w-full lg:w-1/4">
            <div className="lg:sticky lg:top-24 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary/70 px-1 lg:px-4 mb-1 lg:mb-4">
                {isEn ? 'Categories' : 'Catégories'}
              </h2>
              
              {/* Horizontal scroll list on mobile/tablet, vertical stack on desktop */}
              <div className="flex overflow-x-auto lg:flex-col gap-2 pb-4 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 flex-nowrap scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl text-left transition-all group flex-shrink-0",
                      activeCategory === cat.id 
                        ? "bg-white shadow-lg text-accent font-bold ring-1 ring-primary/5" 
                        : "text-primary/70 hover:bg-white/50 hover:text-primary"
                    )}
                  >
                    <span className={cn(
                      "p-1.5 md:p-2 rounded-lg md:rounded-xl transition-colors",
                      activeCategory === cat.id ? "bg-accent/10 text-accent" : "bg-primary/5 text-primary/70 group-hover:bg-primary/10 group-hover:text-primary"
                    )}>
                      {cat.icon}
                    </span>
                    <span className="text-xs md:text-sm whitespace-nowrap">{cat.name}</span>
                  </button>
                ))}
              </div>

              <div className="hidden lg:block mt-12 p-6 bg-accent/5 rounded-3xl border border-accent/10">
                <MessageCircle className="text-accent mb-4" size={32} />
                <h3 className="font-bold text-primary mb-2">{isEn ? 'No Answer?' : 'Pas de réponse ?'}</h3>
                <p className="text-xs text-primary/70 mb-4 leading-relaxed">
                  {isEn 
                    ? 'Our team is here to answer your questions 24/7 on WhatsApp.' 
                    : 'Notre équipe est là pour vous répondre 24h/24 sur WhatsApp.'}
                </p>
                <button 
                  onClick={() => onNavigate('contact')}
                  className="w-full bg-accent text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-lg transition-all"
                >
                  {isEn ? 'Contact Us' : 'Contactez-nous'}
                </button>
              </div>
            </div>
          </div>

          {/* FAQ List */}
          <div className="w-full lg:w-3/4">
            <div className="space-y-4">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, index) => (
                  <motion.div 
                    layout
                    key={faq.id || faq.question}
                    className="bg-white rounded-2xl md:rounded-[2.5rem] border border-primary/5 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => setOpenIndex(openIndex === index ? null : index)}
                      className="w-full flex items-center justify-between p-5 md:p-8 text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="pr-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-1 md:mb-2 block">
                          {isEn 
                            ? (faq.category === 'Livraison' ? 'Shipping' : faq.category === 'Commandes' ? 'Orders' : faq.category === 'Paiements' ? 'Payments' : faq.category === 'Produits' ? 'Products' : faq.category === 'Sur Mesure' ? 'Bespoke' : faq.category)
                            : faq.category}
                        </span>
                        <h3 className="text-base sm:text-lg md:text-xl font-serif text-primary leading-tight">{l(faq, 'question')}</h3>
                      </div>
                      <div className={cn(
                        "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all shrink-0",
                        openIndex === index ? "bg-primary text-white rotate-180" : "bg-primary/5 text-primary/70"
                      )}>
                        <ChevronDown size={18} className="md:size-[20px]" />
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {openIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                        >
                          <div className="px-5 pb-5 pt-4 md:px-8 md:pb-8 md:pt-6 text-primary/80 leading-relaxed border-t border-primary/5 text-sm sm:text-base md:text-lg">
                            {l(faq, 'answer')}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              ) : hasResultsInOtherCategories ? (
                <div className="text-center py-16 md:py-20 bg-white rounded-[2rem] md:rounded-[4rem] border border-primary/5 border-dashed px-4">
                  <div className="bg-accent/5 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Info className="text-accent" size={28} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-serif text-primary">
                    {isEn ? 'Results found elsewhere' : 'Résultats trouvés ailleurs'}
                  </h3>
                  <p className="text-primary/70 mt-2 max-w-sm mx-auto text-sm md:text-base">
                    {isEn 
                      ? `We found ${allFilteredBySearch.length} result(s) for "${searchQuery}" in other categories.`
                      : `Nous avons trouvé ${allFilteredBySearch.length} résultat(s) pour "${searchQuery}" mais dans d'autres catégories.`}
                  </p>
                  <button 
                    onClick={() => setActiveCategory('all')}
                    className="mt-6 md:mt-8 bg-primary text-white px-6 md:px-8 py-3 rounded-2xl font-bold hover:shadow-lg transition-all text-sm md:text-base"
                  >
                    {isEn ? 'View all results' : 'Voir tous les résultats'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-16 md:py-20 bg-white rounded-[2rem] md:rounded-[4rem] border border-primary/5 border-dashed px-4">
                  <div className="bg-primary/5 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="text-primary/70" size={28} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-serif text-primary/70">
                    {isEn ? 'No results found' : 'Aucun résultat trouvé'}
                  </h3>
                  <p className="text-primary/70 mt-2 text-sm md:text-base">
                    {isEn 
                      ? 'Try different keywords or another category.' 
                      : "Essayez avec d'autres mots-clés ou une autre catégorie."}
                  </p>
                  <button 
                    onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                    className="mt-6 md:mt-8 text-accent font-bold underline text-sm md:text-base"
                  >
                    {isEn ? 'Reset filters' : 'Réinitialiser les filtres'}
                  </button>
                </div>
              )}
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 md:mt-16 bg-[#3E4A3D] dark:bg-[#1A1D1A] border border-white/5 rounded-[2rem] md:rounded-[3rem] p-6 sm:p-8 md:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
              <div className="relative z-10 text-center md:text-left">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-serif mb-4">
                  {cfg.bottomBannerTitle || (isEn ? 'Need personalized assistance?' : "Besoin d'un accompagnement personnalisé ?")}
                </h2>
                <p className="text-white/80 mb-6 md:mb-8 max-w-lg text-sm sm:text-base">
                  {cfg.bottomBannerSubtitle || (isEn 
                    ? 'Our experts are available to guide you through bespoke projects, choice of yarns, needles, crochets or models.'
                    : "Nos experts sont disponibles pour vous guider dans vos projets sur mesure, vos choix de laines, d'aiguilles, de crochets ou de modèles.")}
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <button onClick={() => onNavigate('contact')} className="bg-[#E2C29B] text-[#111311] hover:bg-white hover:text-[#111311] px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold hover:shadow-xl transition-all flex items-center gap-2 text-sm sm:text-base">
                    {cfg.bottomBannerButtonText || (isEn ? 'Message Us' : 'Nous écrire')} <ChevronRight size={18} />
                  </button>
                  <button onClick={() => onNavigate('shop')} className="bg-white/10 hover:bg-white/20 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-bold transition-all text-sm sm:text-base">
                    {isEn ? 'Explore Shop' : 'Voir la boutique'}
                  </button>
                </div>
              </div>
              <div className="relative z-10 shrink-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 border-2 border-white/20 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-18 h-18 sm:w-24 sm:h-24 md:w-32 md:h-32 border border-white/40 rounded-full flex items-center justify-center">
                    <HelpCircle size={40} className="text-accent" />
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-accent opacity-10 rounded-full blur-[100px] -mr-48 -mt-48" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full blur-[80px] -ml-32 -mb-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
