import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  Sparkles,
  Compass,
  ShieldCheck,
  Users,
  MessageCircle,
  ChevronRight,
  ArrowLeft,
  Truck,
  Layers,
  Award,
  BookOpen,
  ShoppingBag,
  Cpu,
  Smile,
  Package,
  Clock,
  Scissors,
  MapPin,
  Code2,
  Package2,
  HelpCircle,
  Star,
  Palette,
  Zap
} from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../backend/firebase';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../../i18n';
import { useConfigStore } from '../../stores/configStore';
import { DEFAULT_ABOUT_PAGE_CONFIG } from '../../siteDefaults';
import { AboutPageConfig } from '../../types';

interface AboutViewProps {
  onNavigate?: (view: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  const { l, isEn } = useTranslation();
  const siteConfig = useConfigStore((s) => s.siteConfig);
  const setSiteConfig = useConfigStore((s) => s.setSiteConfig);
  const rawAboutConfig = siteConfig.aboutPage;

  const [liveAboutConfig, setLiveAboutConfig] = useState<AboutPageConfig>(rawAboutConfig || DEFAULT_ABOUT_PAGE_CONFIG);

  useEffect(() => {
    if (rawAboutConfig) {
      setLiveAboutConfig(rawAboutConfig);
    }
  }, [rawAboutConfig]);

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
            if (data?.aboutPage) {
              setLiveAboutConfig(data.aboutPage);
              setSiteConfig((prev) => ({
                ...prev,
                ...data,
                aboutPage: data.aboutPage,
              }));
            }
          }
        },
        (error) => {
          console.warn('Firestore real-time subscription note:', error);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('Could not attach Firestore listener on AboutView:', err);
    }
  }, [siteConfig?.id, setSiteConfig]);

  const cfg: AboutPageConfig = { ...DEFAULT_ABOUT_PAGE_CONFIG, ...liveAboutConfig };

  const [activeTab, setActiveTab] = useState<'duo' | 'vision' | 'process' | 'tools' | 'faq'>('duo');
  const [selectedFounder, setSelectedFounder] = useState<'landry' | 'sourcing'>('landry');

  // Expandable FAQ State
  const [expandedFaq, setExpandedFaq] = useState<{ [key: string]: boolean }>({
    'faq-1': true,
    'faq-2': false,
    'faq-3': false,
    'faq-4': false,
  });

  const toggleFaq = (id: string) => {
    setExpandedFaq(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const milestones = [
    {
      year: '2024',
      title: isEn ? 'The Spark & The Revelation' : "L'Étincelle & Le Constat",
      subtitle: 'Douala, Littoral',
      description: isEn 
        ? 'Passionate about knitting, crochets and textile craftsmanship, the Laine & Déco team notices how difficult it is to find high-quality yarn, matching needles, crochet hooks and modern knitting accessories in Cameroon.'
        : "Passionnés de tricot, crochets et artisanat textile, l'équipe de Laine & Déco constate la difficulté de trouver des laines de haute qualité, des aiguilles adaptées, des crochets et des accessoires de tricot modernes au Cameroun.",
      icon: <Sparkles size={20} className="text-amber-500" />,
      badge: isEn ? 'Genesis' : 'Genèse'
    },
    {
      year: '2025',
      title: isEn ? 'Direct Sourcing & First Shipments' : 'Sourcing Direct & Premières Expéditions',
      subtitle: isEn ? 'Zero Middlemen' : 'Zéro Intermédiaire',
      description: isEn
        ? 'Establishment of a direct sourcing network without costly intermediaries. Meticulous selection of partner factories for premium yarns (merino, combed cotton, alpaca) and hand-made goods.'
        : "Mise en place d'un réseau de sourcing direct sans intermédiaire coûteux. Sélection méticuleuse des usines partenaires pour les pelotes nobles (mérinos, coton peigné, alpaga) et les objets faits main.",
      icon: <Package size={20} className="text-emerald-500" />,
      badge: isEn ? 'Procurement' : 'Approvisionnement'
    },
    {
      year: '2026',
      title: isEn ? 'E-Commerce Platform & AI Tools' : 'Plateforme E-Commerce & Outils IA',
      subtitle: isEn ? 'Digital Innovation' : 'Innovation Numérique',
      description: isEn
        ? 'Launch of the Laine & Déco platform featuring instant Mobile Money payments (MTN MoMo, Orange Money), the yarn ball calculator and the intelligent Knitting Companion assistant.'
        : "Lancement de la plateforme Laine & Déco intégrant le paiement Mobile Money instantané (MTN MoMo, Orange Money), le calculateur de pelotes et le Compagnon Tricot intelligent.",
      icon: <Cpu size={20} className="text-blue-500" />,
      badge: isEn ? 'Digitalization' : 'Digitalisation'
    },
    {
      year: isEn ? 'Tomorrow' : 'Demain',
      title: isEn ? 'Workshops & National Community' : 'Ateliers & Communauté Nationale',
      subtitle: isEn ? 'Transmission & Sharing' : 'Transmission & Partage',
      description: isEn
        ? 'Development of creative meetings, knitting/crochet introductory workshops in Douala and Yaoundé, and showcasing local artisans through our community gallery.'
        : "Développement de rencontres créatives, ateliers d'initiation au tricot/crochet à Douala et Yaoundé, et valorisation des artisans locaux à travers notre galerie communautaire.",
      icon: <Heart size={20} className="text-rose-500" />,
      badge: isEn ? 'Future' : 'Futur'
    }
  ];

  const values = [
    {
      icon: <Award className="text-accent" size={26} />,
      title: cfg.qualityTitle || cfg.pillar1Title || (isEn ? 'Uncompromising Quality' : 'Qualité Sans Compromis'),
      description: cfg.qualityDescription || cfg.pillar1Desc || (isEn
        ? 'Every yarn ball and decorative item is thoroughly inspected. We reject coarse synthetic fibers and prioritize softness, wash durability and longevity.'
        : 'Chaque pelote et objet décoratif est minutieusement vérifié. Nous refusons les fibres synthétiques rugueuses et privilégions la douceur, la tenue au lavage et la durabilité.')
    },
    {
      icon: <ShieldCheck className="text-emerald-600 dark:text-emerald-400" size={26} />,
      title: cfg.transparencyTitle || cfg.pillar2Title || (isEn ? 'Transparency & Fair Prices' : 'Transparence & Prix Justes'),
      description: cfg.transparencyDescription || cfg.pillar2Desc || (isEn
        ? 'By cutting unnecessary intermediaries, we offer transparent prices in CFA Francs (XAF) with no bad surprises, making high-end creation accessible to all.'
        : 'En supprimant les intermédiaires superflus, nous proposons des tarifs clairs en Francs CFA (XAF) sans mauvaise surprise, rendant la création haut de gamme accessible à tous.')
    },
    {
      icon: <Smile className="text-blue-600 dark:text-blue-400" size={26} />,
      title: cfg.proximityTitle || cfg.pillar3Title || (isEn ? '100% Local Human Proximity' : 'Proximité Humaine 100% Locale'),
      description: cfg.proximityDescription || cfg.pillar3Desc || (isEn
        ? 'No outsourced call centers or impersonal robots. The Laine & Déco team answers your WhatsApp messages directly to guide you on your choices of yarns and dye lots.'
        : "Pas de centre d'appels délocalisé ni de robots impersonnels. L'équipe de Laine & Déco répond directement à vos messages WhatsApp pour vous conseiller sur vos choix de fil et de bain.")
    },
    {
      icon: <Palette className="text-purple-600 dark:text-purple-400" size={26} />,
      title: cfg.creativityTitle || cfg.pillar4Title || (isEn ? 'Creativity & Transmission' : 'Créativité & Transmission'),
      description: cfg.creativityDescription || cfg.pillar4Desc || (isEn
        ? 'We design free interactive tools (yardage calculator, AI model generator) to inspire everyone to create with their own hands.'
        : 'Nous concevons des outils interactifs gratuits (calculateur de métrage, générateur de modèles IA) pour donner envie à chacun de créer de ses propres mains.')
    }
  ];

  const steps = [
    {
      num: '01',
      title: isEn ? 'Meticulous Sourcing & Selection' : 'Sélection & Sourcing Rigoureux',
      desc: isEn
        ? 'We personally select fibers and raw materials from workshops renowned for their expertise and spinning consistency.'
        : "Nous choisissons personnellement les fibres et matières premières auprès d'ateliers réputés pour leur savoir-faire et leur constance de filature.",
      badge: isEn ? 'Source Control' : 'Contrôle à la source'
    },
    {
      num: '02',
      title: isEn ? 'Dye Lots & Samples Quality Check' : 'Contrôle des Bains & Échantillons',
      desc: isEn
        ? 'Upon receiving each batch, we test the twist, touch and log dye lot numbers to ensure perfectly uniform color on every order.'
        : "À la réception de chaque lot, nous testons la torsion, le toucher et nous enregistrons les numéros de bain pour garantir une couleur strictement uniforme sur chaque commande.",
      badge: isEn ? 'Guaranteed Uniformity' : 'Uniformité garantie'
    },
    {
      num: '03',
      title: isEn ? 'Tropicalized Packaging' : 'Conditionnement Tropicalisé',
      desc: isEn
        ? 'Our yarn balls and creations are sealed in waterproof packaging designed to withstand climate variations and tropical humidity during transit.'
        : "Nos pelotes et créations sont scellées dans des emballages étanches conçus pour résister aux variations climatiques et à l'humidité tropicale pendant le transport.",
      badge: isEn ? 'Waterproof Protection' : 'Protection étanche'
    },
    {
      num: '04',
      title: isEn ? '24/48h Express Shipping' : 'Expédition Express 24/48h',
      desc: isEn
        ? 'Delivery by express courier in Douala and secure shipping via partner agencies to Yaoundé, Bafoussam, Kribi, Garoua and all over Cameroon.'
        : "Livraison par coursier express à Douala et expédition sécurisée via agences partenaires agréées vers Yaoundé, Bafoussam, Kribi, Garoua et tout le Cameroun.",
      badge: isEn ? 'Personalized Tracking' : 'Suivi personnalisé'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0C0E0C] pb-24 text-primary dark:text-[#EAECE9] transition-colors">
      
      {/* HERO HEADER */}
      <div className="bg-[#2D3E31] dark:bg-[#121612] text-white pt-24 pb-16 px-4 rounded-b-[2.5rem] md:rounded-b-[4rem] relative overflow-hidden shadow-xl border-b border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          {onNavigate && (
            <div className="flex justify-center mb-6">
              <button
                onClick={() => onNavigate('home')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white/90 text-xs font-semibold backdrop-blur-md transition-all active:scale-95 border border-white/15 shadow-sm"
              >
                <ArrowLeft size={14} />
                {isEn ? 'Back to home' : "Retour à l'accueil"}
              </button>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/25 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-accent/40 shadow-sm"
          >
            <Sparkles size={14} className="text-accent-light" />
            {isEn 
              ? 'Quality Yarn, Accessories, Needles & Crochet Hooks in Cameroon' 
              : "Laine de Qualité, Accessoires, Aiguilles & Crochets d'Artisanat au Cameroun"}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-6xl font-serif mb-6 leading-tight font-bold"
          >
            {cfg.heroTitle || (isEn ? 'Our History & Mission' : "Notre Histoire & Notre Raison d'Être")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 max-w-3xl mx-auto text-sm sm:text-base md:text-lg font-light leading-relaxed mb-8"
          >
            {cfg.heroSubtitle || (isEn ? (
              <>
                Discover the adventure of <strong>Laine & Déco</strong>, combining technological expertise and sourcing passion to reinvent premium wool supplies, knitting tools, crochet hooks, and handmade crafts in Cameroon.
              </>
            ) : (
              <>
                Découvrez l'aventure de <strong>Laine & Déco</strong>, alliant expertise technologique et passion du sourcing pour réinventer la fourniture de laine noble, d'accessoires de tricot, de crochets, d'aiguilles et d'artisanat fait main au Cameroun.
              </>
            ))}
          </motion.p>

          {/* Quick Key Facts Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-4xl mx-auto mb-8 text-left text-xs">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-accent-light">
                <MapPin size={16} />
                <span>{isEn ? 'Based in Douala' : 'Ancrage à Douala'}</span>
              </div>
              <p className="text-[11px] text-white/70">
                {isEn ? 'Proudly designed and operated from the economic capital.' : 'Entreprise fièrement pensée et opérée depuis la capitale économique.'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-accent-light">
                <ShieldCheck size={16} />
                <span>{isEn ? 'Zero Intermediaries' : 'Zéro Intermédiaire'}</span>
              </div>
              <p className="text-[11px] text-white/70">
                {isEn ? 'Direct sourcing and fair prices in XAF for all creators.' : 'Sourcing direct et prix justes en Francs CFA pour chaque passionné.'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-accent-light">
                <Truck size={16} />
                <span>{isEn ? '24h-48h Delivery' : 'Livraison 24h-48h'}</span>
              </div>
              <p className="text-[11px] text-white/70">
                {isEn ? 'Express courier in Douala and trusted partner networks in Cameroon.' : 'Coursier Douala et relais agréés pour tout le Cameroun.'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-accent-light">
                <Smile size={16} />
                <span>{isEn ? 'Direct Human Support' : 'Support Humain Direct'}</span>
              </div>
              <p className="text-[11px] text-white/70">
                {isEn ? 'Direct assistance via WhatsApp with our core team.' : 'Assistance directe par WhatsApp avec les deux fondateurs.'}
              </p>
            </div>
          </div>

          {/* Primary Navigation Tabs */}
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 max-w-3xl mx-auto bg-black/25 p-1.5 rounded-2xl sm:rounded-full backdrop-blur-md border border-white/10">
            <button
              onClick={() => setActiveTab('duo')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'duo'
                  ? 'bg-accent text-white shadow-md'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users size={14} />
              {isEn ? 'The Founders Duo' : 'Le Duo Fondateur'}
            </button>

            <button
              onClick={() => setActiveTab('vision')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'vision'
                  ? 'bg-accent text-white shadow-md'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Compass size={14} />
              {isEn ? 'Vision & Values' : 'Vision & Valeurs'}
            </button>

            <button
              onClick={() => setActiveTab('process')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'process'
                  ? 'bg-accent text-white shadow-md'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Layers size={14} />
              {isEn ? 'Sourcing & Quality' : 'Sourcing & Qualité'}
            </button>

            <button
              onClick={() => setActiveTab('tools')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'tools'
                  ? 'bg-accent text-white shadow-md'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Zap size={14} />
              {isEn ? 'Creative Ecosystem' : 'Écosystème Créatif'}
            </button>

            <button
              onClick={() => setActiveTab('faq')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl sm:rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'faq'
                  ? 'bg-accent text-white shadow-md'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <HelpCircle size={14} />
              {isEn ? 'Founders FAQ' : 'FAQ Fondateurs'}
            </button>
          </div>
        </div>
      </div>

      {/* BODY CONTENT CONTAINER */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-20 space-y-8">
        
        {/* TAB 1: LE DUO FONDATEUR & NOTRE HISTOIRE */}
        {activeTab === 'duo' && (
          <div className="space-y-8">
            
            {/* Story Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#181C18] rounded-[2rem] p-6 sm:p-10 shadow-sm border border-primary/10 dark:border-white/10 relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-accent/10 text-accent rounded-2xl">
                  <Heart size={24} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary dark:text-white">
                    {isEn ? 'A Friendship, A Passion, A Commitment' : 'Une Amitié, Une Passion, Un Engagement'}
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">
                    {isEn ? 'The story behind Laine & Déco in Douala' : "L'histoire derrière Laine & Déco à Douala"}
                  </p>
                </div>
              </div>

              <div className="text-sm sm:text-base leading-relaxed text-primary/80 dark:text-white/80 space-y-4">
                {isEn ? (
                  <>
                    <p>
                      <strong>Laine & Déco</strong> is not just an impersonal online store: it is a project born from genuine complicity in our team. We shared an obvious observation: in Cameroon, enthusiasts of knitting, crochet and handmade crafts struggled to find high-end yarn, tools, hooks and accessories without dealing with complex and extremely expensive international shipments.
                    </p>
                    <p>
                      We decided to unite our complementary skills: software engineering to offer a modern and intuitive shopping experience, and sharp operational sourcing to negotiate directly with the best global spinning mills.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      <strong>Laine & Déco</strong> n'est pas une simple boutique en ligne impersonnelle : c'est un projet né d'une complicité sincère au sein de notre équipe. Nous partagions un constat évident : au Cameroun, les passionnés de tricot, de crochets et d'artisanat peinaient à trouver de la laine de qualité, des crochets, des aiguilles et des accessoires de tricot de premier choix sans devoir passer par des commandes internationales complexes et ruineuses.
                    </p>
                    <p>
                      Nous avons alors décidé d'unir nos forces et nos compétences complémentaires : l'ingénierie logicielle pour offrir une expérience d'achat moderne et intuitive, et le sens aigu du sourcing opérationnel pour négocier directement avec les meilleurs ateliers.
                    </p>
                  </>
                )}
              </div>

              {/* Founder Cards Showcase */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-primary/10 dark:border-white/10">
                
                {/* Landry's Card */}
                <div
                  onClick={() => setSelectedFounder('landry')}
                  className={`cursor-pointer p-6 rounded-3xl transition-all border ${
                    selectedFounder === 'landry'
                      ? 'bg-accent/5 border-accent shadow-md'
                      : 'bg-primary/5 dark:bg-white/5 border-transparent hover:border-primary/20'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#2D3E31] text-white flex items-center justify-center font-serif text-2xl font-bold shadow-md shrink-0">
                      T
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-lg font-bold text-primary dark:text-white">
                          {cfg.founder1Name || (isEn ? 'Digital Hub' : 'Pôle Digital')}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-[10px] font-bold">
                          {isEn ? 'Tech & AI' : 'Tech & IA'}
                        </span>
                      </div>
                      <p className="text-xs text-accent font-semibold mb-2">
                        {cfg.founder1Role || (isEn ? 'Digital Development & Innovation' : 'Développement & Innovation Numérique')}
                      </p>
                      <p className="text-xs text-primary/70 dark:text-white/70 leading-relaxed">
                        {cfg.founderLandryBio || cfg.founder1Bio || (isEn 
                          ? 'Drives the digital scope: ultra-fast web platform, secure Mobile Money payment integration, smart yardage algorithms and the innovative AI Knitting Companion.'
                          : 'Pilote toute la dimension numérique : plateforme web ultra-rapide, passerelles de paiement sécurisées Mobile Money, algorithmes du calculateur de pelotes et assistant Compagnon Tricot IA.')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-primary/5 dark:border-white/5 flex items-center justify-between text-[11px] text-primary/60 dark:text-white/60">
                    <span className="flex items-center gap-1">
                      <Code2 size={13} className="text-accent" /> 
                      {isEn ? 'Development & Innovation' : 'Développement & Innovation'}
                    </span>
                    <span className="font-semibold text-accent">Douala</span>
                  </div>
                </div>

                {/* Sourcing Card */}
                <div
                  onClick={() => setSelectedFounder('sourcing')}
                  className={`cursor-pointer p-6 rounded-3xl transition-all border ${
                    selectedFounder === 'sourcing'
                      ? 'bg-accent/5 border-accent shadow-md'
                      : 'bg-primary/5 dark:bg-white/5 border-transparent hover:border-primary/20'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-accent text-white flex items-center justify-center font-serif text-2xl font-bold shadow-md shrink-0">
                      S
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-lg font-bold text-primary dark:text-white">
                          {cfg.founder2Name || (isEn ? 'Sourcing Hub' : 'Pôle Sourcing')}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-[10px] font-bold">
                          {isEn ? 'Operations' : 'Opérations'}
                        </span>
                      </div>
                      <p className="text-xs text-accent font-semibold mb-2">
                        {cfg.founder2Role || (isEn ? 'Material Quality & Sourcing' : 'Qualité Matérielle & Approvisionnement')}
                      </p>
                      <p className="text-xs text-primary/70 dark:text-white/70 leading-relaxed">
                        {cfg.founderSourcingBio || cfg.founder2Bio || (isEn
                          ? 'Ensures strict material quality: meticulous selection of premium wool, direct negotiations with spinning workshops, rigorous control of dye lots and supervising domestic shipping.'
                          : 'Garante de la qualité matérielle : sélection minutieuse des pelotes de laine, négociation directe avec les ateliers, contrôle rigoureux des bains de teinture et supervision des expéditions locales.')}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-primary/5 dark:border-white/5 flex items-center justify-between text-[11px] text-primary/60 dark:text-white/60">
                    <span className="flex items-center gap-1">
                      <Package2 size={13} className="text-accent" /> 
                      {isEn ? 'Sourcing & Logistics' : 'Sourcing & Logistique'}
                    </span>
                    <span className="font-semibold text-accent">Douala</span>
                  </div>
                </div>

              </div>

              {/* Quote Block */}
              <div className="mt-8 p-5 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 text-center italic text-xs sm:text-sm text-primary/80 dark:text-white/80">
                {isEn 
                  ? '« Two complementary domains, a single ambition: to make Laine & Déco the warm and reliable reference for textile creators in Cameroon. »'
                  : '« Deux expertises complémentaires, une seule ambition : faire de Laine & Déco la référence chaleureuse et fiable des créateurs textiles au Cameroun. »'}
              </div>
            </motion.div>

            {/* Interactive Timeline Card */}
            <div className="bg-white dark:bg-[#181C18] rounded-[2rem] p-6 sm:p-10 shadow-sm border border-primary/10 dark:border-white/10">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-primary/5 dark:bg-white/10 text-primary dark:text-white rounded-2xl">
                  <Clock size={24} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary dark:text-white">
                    {isEn ? 'Our Journey & Key Milestones' : 'Notre Parcours & Les Grandes Étapes'}
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">
                    {isEn ? 'From the first idea to a growing creative community' : 'De la première idée à une communauté grandissante'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-5 sm:p-6 rounded-3xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 hover:border-accent/40 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-accent/15 text-accent">
                          {m.badge}
                        </span>
                        <span className="text-lg font-serif font-bold text-primary dark:text-white">
                          {m.year}
                        </span>
                      </div>
                      <h3 className="font-serif text-base sm:text-lg font-bold text-primary dark:text-white mb-1">
                        {m.title}
                      </h3>
                      <p className="text-xs text-accent font-semibold mb-2">{m.subtitle}</p>
                      <p className="text-xs text-primary/70 dark:text-white/70 leading-relaxed">
                        {m.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Statistics Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#181C18] p-5 rounded-3xl border border-primary/10 dark:border-white/10 text-center space-y-1">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-accent">+2 500</span>
                <p className="text-xs text-primary/70 dark:text-white/70">
                  {isEn ? 'Items & Yarn shipped' : 'Pelotes & Articles expédiés'}
                </p>
              </div>
              <div className="bg-white dark:bg-[#181C18] p-5 rounded-3xl border border-primary/10 dark:border-white/10 text-center space-y-1">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-accent">100%</span>
                <p className="text-xs text-primary/70 dark:text-white/70">
                  {isEn ? 'Dye lots checked' : 'Lots de bains contrôlés'}
                </p>
              </div>
              <div className="bg-white dark:bg-[#181C18] p-5 rounded-3xl border border-primary/10 dark:border-white/10 text-center space-y-1">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-accent">10 {isEn ? 'Regions' : 'Régions'}</span>
                <p className="text-xs text-primary/70 dark:text-white/70">
                  {isEn ? 'Served in Cameroon' : 'Desservies au Cameroun'}
                </p>
              </div>
              <div className="bg-white dark:bg-[#181C18] p-5 rounded-3xl border border-primary/10 dark:border-white/10 text-center space-y-1">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-accent">4.9 / 5</span>
                <p className="text-xs text-primary/70 dark:text-white/70">
                  {isEn ? 'Customer Satisfaction' : 'Satisfaction & Avis clients'}
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: VISION & VALEURS */}
        {activeTab === 'vision' && (
          <div className="space-y-8">
            
            <div className="bg-white dark:bg-[#181C18] rounded-[2rem] p-6 sm:p-10 shadow-sm border border-primary/10 dark:border-white/10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/10 text-accent rounded-2xl">
                  <Compass size={24} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary dark:text-white">
                    {isEn ? 'Our Vision & 4 Pillars' : 'Notre Vision & Nos 4 Piliers Fondateurs'}
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">
                    {isEn ? 'The non-negotiable guidelines behind our everyday choices' : 'Les principes non négociables qui guident chacune de nos décisions'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {values.map((v, i) => (
                  <div
                    key={i}
                    className="p-6 rounded-3xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 space-y-3"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#181C18] shadow-sm flex items-center justify-center border border-primary/10 dark:border-white/10">
                      {v.icon}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-primary dark:text-white">
                      {v.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-primary/70 dark:text-white/70 leading-relaxed">
                      {v.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Manifeste des Fondateurs */}
            <div className="bg-[#2D3E31] dark:bg-[#141814] text-white rounded-[2rem] p-8 sm:p-12 relative overflow-hidden shadow-lg border border-white/10">
              <div className="absolute top-0 right-0 w-80 h-80 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl mx-auto space-y-6 text-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/20 text-accent-light text-xs font-bold uppercase tracking-wider">
                  <Star size={14} />
                  {isEn ? 'The Laine & Déco Manifesto' : 'Le Manifeste Laine & Déco'}
                </div>

                <h3 className="text-2xl sm:text-3xl font-serif font-bold">
                  {isEn 
                    ? '« Elevating the nobility of handmade work and highlighting your creative textile projects »' 
                    : '« Redonner ses lettres de noblesse au fait-main et sublimer vos projets créatifs textiles »'}
                </h3>

                <p className="text-white/80 text-sm sm:text-base font-light leading-relaxed">
                  {isEn ? (
                    'We believe that knitting, crochet and creating with passion is not a luxury reserved for a few, but a universal art of living that brings peace, pride and beauty. Every yarn ball, crochet hook, needle and accessory we prepare in Douala carries this promise: providing you with noble and sustainable materials so that your handmade crafts are absolutely perfect.'
                  ) : (
                    "Nous croyons que tricoter, crocheter et créer avec passion n'est pas un luxe réservé à quelques-uns, mais un art de vivre universel source d'apaisement, de fierté et de beauté. Chaque pelote, crochet, aiguille et accessoire que nous préparons à Douala porte cette promesse : vous apporter des matières nobles et durables pour que vos créations artisanales soient parfaites."
                  )}
                </p>

                <div className="pt-4 flex items-center justify-center gap-6 text-xs text-accent-light font-semibold">
                  <span>✍️ Landry Moutongo</span>
                  <span>•</span>
                  <span>{isEn ? "✍️ Laine & Déco Team" : "✍️ L'équipe Laine & Déco"}</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: SOURCING & PROCESSUS QUALITÉ */}
        {activeTab === 'process' && (
          <div className="space-y-8">
            
            <div className="bg-white dark:bg-[#181C18] rounded-[2rem] p-6 sm:p-10 shadow-sm border border-primary/10 dark:border-white/10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/10 text-accent rounded-2xl">
                  <Layers size={24} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary dark:text-white">
                    {isEn ? 'Our Sourcing & Quality Process' : 'Notre Chaîne de Valeur & Processus Qualité'}
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">
                    {isEn ? 'How each premium item transitions from the workshop to your living room' : "Comment chaque produit passe de l'atelier à votre salon"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-6 rounded-3xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-2xl bg-accent text-white font-bold flex items-center justify-center text-sm shadow-sm">
                        {step.num}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-accent/10 text-accent">
                        {step.badge}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-primary dark:text-white">
                      {step.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-primary/70 dark:text-white/70 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Why Trust Us Banner */}
            <div className="bg-white dark:bg-[#181C18] rounded-[2rem] p-6 sm:p-8 shadow-sm border border-primary/10 dark:border-white/10 space-y-4">
              <h3 className="font-serif text-lg font-bold text-primary dark:text-white flex items-center gap-2">
                <ShieldCheck size={20} className="text-accent" />
                {isEn ? 'Why do creators in Cameroon trust us?' : 'Pourquoi nos clients camerounais nous font confiance ?'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-primary/5 dark:bg-white/5 space-y-1.5">
                  <strong className="block text-primary dark:text-white font-bold">
                    {isEn ? '1. Verified Dye Lots' : "1. Bains de Teinture Contrôlés"}
                  </strong>
                  <p className="text-primary/70 dark:text-white/70">
                    {isEn 
                      ? 'Strict guarantee of yarn balls originating from the same dyeing tank to avoid any visible color variations in your project.'
                      : "Garantie stricte de pelotes issues d'une même cuve pour éviter tout démarquage de couleur au tricot."}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 dark:bg-white/5 space-y-1.5">
                  <strong className="block text-primary dark:text-white font-bold">
                    {isEn ? '2. Humidity Protection' : "2. Protection Anti-Humidité"}
                  </strong>
                  <p className="text-primary/70 dark:text-white/70">
                    {isEn
                      ? 'Heat-sealed waterproof packaging protecting premium fibers against rain and weather humidity during domestic transportation.'
                      : "Emballage thermo-scellé étanche protégeant la laine contre la pluie et l'humidité pendant le trajet."}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 dark:bg-white/5 space-y-1.5">
                  <strong className="block text-primary dark:text-white font-bold">
                    {isEn ? '3. 7-Day Guarantee' : "3. Garantie 7 Jours"}
                  </strong>
                  <p className="text-primary/70 dark:text-white/70">
                    {isEn
                      ? 'Strict compliance with Cameroon Consumer Law 2011/012 featuring hassle-free return policies and quick Mobile Money refunds.'
                      : "Conformité à la Loi 2011/012 avec droit de retour et remboursement rapide Mobile Money."}
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: ÉCOSYSTÈME CRÉATIF */}
        {activeTab === 'tools' && (
          <div className="space-y-8">
            
            <div className="bg-white dark:bg-[#181C18] rounded-[2rem] p-6 sm:p-10 shadow-sm border border-primary/10 dark:border-white/10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/10 text-accent rounded-2xl">
                  <Zap size={24} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary dark:text-white">
                    {isEn ? 'More Than A Store: A Creative Ecosystem' : 'Bien Plus Qu\'une Simple Boutique : Un Écosystème Créatif'}
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">
                    {isEn 
                      ? 'Innovative digital tools crafted on-measure for passionate textile creators, knitting and crochet enthusiasts' 
                      : "Des outils numériques innovants créés sur mesure pour les passionnés de tricot, crochets et accessoires d'artisanat"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                
                {/* Tool 1: Yarn Calculator */}
                <div className="p-6 rounded-3xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold">
                      <BookOpen size={24} />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-primary dark:text-white">
                      {isEn ? 'Yarn Ball & Yardage Calculator' : 'Calculateur de Pelotes & Métrage'}
                    </h3>
                    <p className="text-xs sm:text-sm text-primary/70 dark:text-white/70 leading-relaxed">
                      {isEn
                        ? 'Accurately estimate the exact number of yarn balls needed for a sweater, blanket, scarf or beanie based on your sizing and gauges.'
                        : "Estimez avec précision le nombre exact de pelotes nécessaires pour un pull, plaid, écharpe ou bonnet selon votre taille et votre échantillon."}
                    </p>
                  </div>

                  {onNavigate && (
                    <Button
                      variant="outline"
                      onClick={() => onNavigate('calculator')}
                      className="w-full rounded-2xl text-xs font-bold mt-2"
                    >
                      {isEn ? 'Launch the Calculator' : 'Lancer le Calculateur'}
                    </Button>
                  )}
                </div>

                {/* Tool 2: Volume Calculator */}
                <div className="p-6 rounded-3xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold">
                      <Sparkles size={24} />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-primary dark:text-white">
                      {isEn ? 'Volume Calculator' : 'Calculateur de Volume'}
                    </h3>
                    <p className="text-xs sm:text-sm text-primary/70 dark:text-white/70 leading-relaxed">
                      {isEn
                        ? 'Calculate the volume and total weight of yarn required for large projects like blankets and home decor.'
                        : "Calculez le volume et le poids total de laine requis pour vos grands projets de décoration et grands plaids."}
                    </p>
                  </div>

                  {onNavigate && (
                    <Button
                      variant="outline"
                      onClick={() => onNavigate('volume-calculator')}
                      className="w-full rounded-2xl text-xs font-bold mt-2"
                    >
                      {isEn ? 'Calculate Volume' : 'Calculer le Volume'}
                    </Button>
                  )}
                </div>

                {/* Tool 4: Custom Order */}
                <div className="p-6 rounded-3xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold">
                      <Scissors size={24} />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-primary dark:text-white">
                      {isEn ? 'Custom Bespoke Order' : 'Créations Sur Mesure'}
                    </h3>
                    <p className="text-xs sm:text-sm text-primary/70 dark:text-white/70 leading-relaxed">
                      {isEn
                        ? 'Command custom handmade knitted items tailored precisely to your measurements and material preferences.'
                        : "Commandez des pièces uniques tricotées à la main selon vos mensurations et vos choix de matières."}
                    </p>
                  </div>

                  {onNavigate && (
                    <Button
                      variant="outline"
                      onClick={() => onNavigate('custom-order')}
                      className="w-full rounded-2xl text-xs font-bold mt-2"
                    >
                      {isEn ? 'Custom Order' : 'Commander Sur Mesure'}
                    </Button>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 5: FAQ FONDATEURS */}
        {activeTab === 'faq' && (
          <div className="space-y-6">
            
            <div className="bg-white dark:bg-[#181C18] rounded-[2rem] p-6 sm:p-10 shadow-sm border border-primary/10 dark:border-white/10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/10 text-accent rounded-2xl">
                  <HelpCircle size={24} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary dark:text-white">
                    {isEn ? 'Frequent Questions to the Founders' : 'Questions Fréquentes aux Fondateurs'}
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">
                    {isEn ? 'Our direct and transparent answers about how we operate' : 'Nos réponses directes et transparentes sur notre fonctionnement'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                
                {/* FAQ 1 */}
                <div className="rounded-2xl border border-primary/10 dark:border-white/10 overflow-hidden">
                  <button
                    onClick={() => toggleFaq('faq-1')}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 bg-primary/5 dark:bg-white/5 hover:bg-primary/10 transition-colors"
                  >
                    <span className="font-serif font-bold text-sm sm:text-base text-primary dark:text-white">
                      {isEn 
                        ? 'Where exactly do your yarn balls, needles, crochet hooks and craft tools come from?' 
                        : "D'où proviennent exactement vos pelotes de laine, crochets, aiguilles et accessoires d'artisanat ?"}
                    </span>
                    <ChevronRight
                      size={18}
                      className={`text-accent transition-transform duration-200 shrink-0 ${
                        expandedFaq['faq-1'] ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  {expandedFaq['faq-1'] && (
                    <div className="p-4 sm:p-5 text-xs sm:text-sm text-primary/80 dark:text-white/80 leading-relaxed bg-white dark:bg-[#181C18] border-t border-primary/10 dark:border-white/10 space-y-2">
                      <p>
                        {isEn ? (
                          'We work through direct sourcing with textile spinning factories and artisan workshops thoroughly audited for the quality of their organic fibers (merino wool, alpaca, mercerized cotton, mohair). By eliminating intermediate buying offices, we supervise every import directly up to our hub in Douala.'
                        ) : (
                          "Nous travaillons en sourcing direct avec des manufactures textiles et des ateliers artisanaux rigoureusement audités pour la qualité de leurs fibres (mérinos, alpaga, coton mercerisé, mohair). En supprimant les centrales d'achat intermédiaires, nous supervisons directement chaque importation jusqu'à notre entrepôt de Douala."
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* FAQ 2 */}
                <div className="rounded-2xl border border-primary/10 dark:border-white/10 overflow-hidden">
                  <button
                    onClick={() => toggleFaq('faq-2')}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 bg-primary/5 dark:bg-white/5 hover:bg-primary/10 transition-colors"
                  >
                    <span className="font-serif font-bold text-sm sm:text-base text-primary dark:text-white">
                      {isEn 
                        ? 'How do you guarantee that my yarn balls will have the exact same color shade?' 
                        : 'Comment garantissez-vous que mes pelotes auront la même teinte ?'}
                    </span>
                    <ChevronRight
                      size={18}
                      className={`text-accent transition-transform duration-200 shrink-0 ${
                        expandedFaq['faq-2'] ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  {expandedFaq['faq-2'] && (
                    <div className="p-4 sm:p-5 text-xs sm:text-sm text-primary/80 dark:text-white/80 leading-relaxed bg-white dark:bg-[#181C18] border-t border-primary/10 dark:border-white/10 space-y-2">
                      <p>
                        {isEn ? (
                          'This is one of our key quality guarantees: for any order placed at once, our team manually verifies that all balls of a given color originate from the exact same Dye Lot number. We always recommend adding 1 extra ball as a backup for your project.'
                        ) : (
                          "C'est l'un de nos engagements majeurs (Article 2 de nos CGV) : pour toute commande passée en une seule fois, notre équipe vérifie manuellement que toutes les pelotes d'un même coloris proviennent du même numéro de bain de teinture (Dye Lot). Nous recommandons toujours de prévoir 1 pelote de réserve pour votre projet."
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* FAQ 3 */}
                <div className="rounded-2xl border border-primary/10 dark:border-white/10 overflow-hidden">
                  <button
                    onClick={() => toggleFaq('faq-3')}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 bg-primary/5 dark:bg-white/5 hover:bg-primary/10 transition-colors"
                  >
                    <span className="font-serif font-bold text-sm sm:text-base text-primary dark:text-white">
                      {isEn 
                        ? 'Can I order from other cities in Cameroon besides Douala (Yaoundé, Kribi, etc.)?' 
                        : 'Puis-je commander depuis une autre ville que Douala (Yaoundé, Kribi, etc.) ?'}
                    </span>
                    <ChevronRight
                      size={18}
                      className={`text-accent transition-transform duration-200 shrink-0 ${
                        expandedFaq['faq-3'] ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  {expandedFaq['faq-3'] && (
                    <div className="p-4 sm:p-5 text-xs sm:text-sm text-primary/80 dark:text-white/80 leading-relaxed bg-white dark:bg-[#181C18] border-t border-primary/10 dark:border-white/10 space-y-2">
                      <p>
                        {isEn ? (
                          'Absolutely! While Douala benefits from 24h express home deliveries, we ship daily to Yaoundé, Bafoussam, Kribi, Garoua, Ngaoundéré and all regions of Cameroon via trusted transport partners (Buca Voyages, Finexs, Touristique Express) with SMS notifications on arrival.'
                        ) : (
                          "Absolument ! Si Douala bénéficie de coursiers express à domicile sous 24h, nous expédions quotidiennement vers Yaoundé, Bafoussam, Kribi, Garoua, Ngaoundéré et toutes les villes du Cameroun via nos partenaires de confiance (Buca Voyages, Finexs, Touristique Express) avec notification SMS dès l'arrivée du colis."
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* FAQ 4 */}
                <div className="rounded-2xl border border-primary/10 dark:border-white/10 overflow-hidden">
                  <button
                    onClick={() => toggleFaq('faq-4')}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 bg-primary/5 dark:bg-white/5 hover:bg-primary/10 transition-colors"
                  >
                    <span className="font-serif font-bold text-sm sm:text-base text-primary dark:text-white">
                      {isEn 
                        ? 'How can I directly contact your team in case of any question?' 
                        : 'Comment contacter directement notre équipe en cas de question ?'}
                    </span>
                    <ChevronRight
                      size={18}
                      className={`text-accent transition-transform duration-200 shrink-0 ${
                        expandedFaq['faq-4'] ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  {expandedFaq['faq-4'] && (
                    <div className="p-4 sm:p-5 text-xs sm:text-sm text-primary/80 dark:text-white/80 leading-relaxed bg-white dark:bg-[#181C18] border-t border-primary/10 dark:border-white/10 space-y-2">
                      <p>
                        {isEn ? (
                          'We are reachable directly via WhatsApp or through our contact form. We are always happy to discuss with you to help estimate your project yardage or answer technical questions.'
                        ) : (
                          "Nous sommes joignables directement par WhatsApp ou via le formulaire de contact. Nous nous faisons un plaisir d'échanger avec vous pour vous aider à estimer votre métrage de fil ou répondre à vos questions techniques."
                        )}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}

        {/* DIRECT CONTACT & ACTION BANNER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#2D3E31] dark:bg-[#141814] rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center md:text-left max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 text-accent-light rounded-full text-xs font-bold uppercase tracking-wider">
              <MessageCircle size={14} />
              <span>{isEn ? 'Direct Founder Contact' : 'Contact Direct Fondateurs'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold">
              {isEn ? 'Have a Question about a Yarn or a Project?' : 'Une Question sur une Laine ou un Projet ?'}
            </h2>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
              {isEn 
                ? 'We personally answer each of your messages to help guide you in selecting materials, yarns, gauges and creative accessories.'
                : 'Nous répondons personnellement à chacun de vos messages pour vous guider dans le choix de vos matières, de la laine, des crochets, calibres d\'aiguilles et accessoires créatifs.'}
            </p>
          </div>

          <div className="relative z-10 shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {onNavigate && (
              <>
                <button
                  onClick={() => onNavigate('shop')}
                  className="bg-accent text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-accent/90 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm shadow-lg active:scale-95"
                >
                  <ShoppingBag size={16} />
                  {isEn ? 'Explore the Shop' : 'Découvrir la Boutique'}
                </button>
                <button
                  onClick={() => onNavigate('contact')}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-xs sm:text-sm border border-white/15 active:scale-95"
                >
                  <MessageCircle size={16} />
                  {isEn ? 'Message Us' : 'Nous Écrire'}
                </button>
              </>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default AboutView;
