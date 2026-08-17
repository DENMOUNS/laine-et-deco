import React, { useState } from 'react';
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
  CheckCircle2,
  Layers,
  Award,
  BookOpen,
  ShoppingBag,
  Cpu,
  Smile,
  Package,
  Clock,
  MapPin,
  ExternalLink,
  Code2,
  Package2,
  FileText,
  HelpCircle,
  Flame,
  Star,
  Check,
  Send,
  Zap,
  Palette
} from 'lucide-react';
import { Button } from '../components/ui/Button';

interface AboutViewProps {
  onNavigate?: (view: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'duo' | 'vision' | 'process' | 'tools' | 'faq'>('duo');
  const [selectedFounder, setSelectedFounder] = useState<'landry' | 'doleres'>('landry');

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
      title: 'L\'Étincelle & Le Constat',
      subtitle: 'Douala, Littoral',
      description: 'Passionnés de décoration et d\'artisanat textile, Landry et Dolères constatent la difficulté de trouver des laines qualitatives, des accessoires modernes et des pièces décoratives uniques à des prix justes au Cameroun.',
      icon: <Sparkles size={20} className="text-amber-500" />,
      badge: 'Genèse'
    },
    {
      year: '2025',
      title: 'Sourcing Direct & Premières Expéditions',
      subtitle: 'Zéro Intermédiaire',
      description: 'Mise en place d\'un réseau de sourcing direct sans intermédiaire coûteux. Sélection méticuleuse des usines partenaires pour les pelotes nobles (mérinos, coton peigné, alpaga) et les objets faits main.',
      icon: <Package size={20} className="text-emerald-500" />,
      badge: 'Approvisionnement'
    },
    {
      year: '2026',
      title: 'Plateforme E-Commerce & Outils IA',
      subtitle: 'Innovation Numérique',
      description: 'Lancement de la plateforme Laine & Déco intégrant le paiement Mobile Money instantané (MTN MoMo, Orange Money), le calculateur de pelotes et le Compagnon Tricot intelligent.',
      icon: <Cpu size={20} className="text-blue-500" />,
      badge: 'Digitalisation'
    },
    {
      year: 'Demain',
      title: 'Ateliers & Communauté Nationale',
      subtitle: 'Transmission & Partage',
      description: 'Développement de rencontres créatives, ateliers d\'initiation au tricot/crochet à Douala et Yaoundé, et valorisation des artisans locaux à travers notre galerie communautaire.',
      icon: <Heart size={20} className="text-rose-500" />,
      badge: 'Futur'
    }
  ];

  const values = [
    {
      icon: <Award className="text-accent" size={26} />,
      title: 'Qualité Sans Compromis',
      description: 'Chaque pelote et objet décoratif est minutieusement vérifié. Nous refusons les fibres synthétiques rugueuses et privilégions la douceur, la tenue au lavage et la durabilité.'
    },
    {
      icon: <ShieldCheck className="text-emerald-600 dark:text-emerald-400" size={26} />,
      title: 'Transparence & Prix Justes',
      description: 'En supprimant les intermédiaires superflus, nous proposons des tarifs clairs en Francs CFA (XAF) sans mauvaise surprise, rendant la création haut de gamme accessible à tous.'
    },
    {
      icon: <Smile className="text-blue-600 dark:text-blue-400" size={26} />,
      title: 'Proximité Humaine 100% Locale',
      description: 'Pas de centre d\'appels délocalisé ni de robots impersonnels. Landry et Dolères répondent directement à vos messages WhatsApp pour vous conseiller sur vos choix de fil et de bain.'
    },
    {
      icon: <Palette className="text-purple-600 dark:text-purple-400" size={26} />,
      title: 'Créativité & Transmission',
      description: 'Nous concevons des outils interactifs gratuits (calculateur de métrage, générateur de modèles IA) pour donner envie à chacun de créer de ses propres mains.'
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'Sélection & Sourcing Rigoureux',
      desc: 'Nous choisissons personnellement les fibres et matières premières auprès d\'ateliers réputés pour leur savoir-faire et leur constance de filature.',
      badge: 'Contrôle à la source'
    },
    {
      num: '02',
      title: 'Contrôle des Bains & Échantillons',
      desc: 'À la réception de chaque lot, nous testons la torsion, le toucher et nous enregistrons les numéros de bain pour garantir une couleur strictement uniforme sur chaque commande.',
      badge: 'Uniformité garantie'
    },
    {
      num: '03',
      title: 'Conditionnement Tropicalisé',
      desc: 'Nos pelotes et créations sont scellées dans des emballages étanches conçus pour résister aux variations climatiques et à l\'humidité tropicale pendant le transport.',
      badge: 'Protection étanche'
    },
    {
      num: '04',
      title: 'Expédition Express 24/48h',
      desc: 'Livraison par coursier express à Douala et expédition sécurisée via agences partenaires agréées vers Yaoundé, Bafoussam, Kribi, Garoua et tout le Cameroun.',
      badge: 'Suivi personnalisé'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-[#0C0E0C] pb-24 text-primary dark:text-[#EAECE9] transition-colors">
      
      {/* ========================================================================= */}
      {/* HERO HEADER */}
      {/* ========================================================================= */}
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
                Retour à l'accueil
              </button>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/25 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-accent/40 shadow-sm"
          >
            <Sparkles size={14} className="text-accent-light" />
            L'Artisanat Textile & La Décoration Accessible au Cameroun
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-6xl font-serif mb-6 leading-tight font-bold"
          >
            Notre Histoire & Notre Raison d'Être
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 max-w-3xl mx-auto text-sm sm:text-base md:text-lg font-light leading-relaxed mb-8"
          >
            Découvrez l'aventure humaine de <strong>Landry & Dolères</strong>, deux amis d'enfance ayant allié expertise technologique et passion du sourcing pour réinventer la fourniture de laine noble et la décoration d'intérieur au Cameroun.
          </motion.p>

          {/* Quick Key Facts Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-4xl mx-auto mb-8 text-left text-xs">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-accent-light">
                <MapPin size={16} />
                <span>Ancrage à Douala</span>
              </div>
              <p className="text-[11px] text-white/70">Entreprise fièrement pensée et opérée depuis la capitale économique.</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-accent-light">
                <ShieldCheck size={16} />
                <span>Zéro Intermédiaire</span>
              </div>
              <p className="text-[11px] text-white/70">Sourcing direct et prix justes en Francs CFA pour chaque passionné.</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-accent-light">
                <Truck size={16} />
                <span>Livraison 24h-48h</span>
              </div>
              <p className="text-[11px] text-white/70">Coursier Douala et relais agréés pour tout le Cameroun.</p>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-accent-light">
                <Smile size={16} />
                <span>Support Humain Direct</span>
              </div>
              <p className="text-[11px] text-white/70">Assistance directe par WhatsApp avec les deux fondateurs.</p>
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
              Le Duo Fondateur
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
              Vision & Valeurs
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
              Sourcing & Qualité
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
              Écosystème Créatif
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
              FAQ Fondateurs
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BODY CONTENT CONTAINER */}
      {/* ========================================================================= */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-20 space-y-8">
        
        {/* ========================================================================= */}
        {/* TAB 1: LE DUO FONDATEUR & NOTRE HISTOIRE */}
        {/* ========================================================================= */}
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
                    Une Amitié, Une Passion, Un Engagement
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">
                    L'histoire derrière Laine & Déco à Douala
                  </p>
                </div>
              </div>

              <div className="text-sm sm:text-base leading-relaxed text-primary/80 dark:text-white/80 space-y-4">
                <p>
                  <strong>Laine & Déco</strong> n'est pas une simple boutique en ligne impersonnelle : c'est un projet né d'une complicité sincère entre <strong>Landry et Dolères</strong>. Amis de longue date, nous partagions un constat évident : au Cameroun, les passionnés de tricot, crochet et décoration d'intérieur peinaient à trouver des matières premières qualitatives sans devoir passer par des commandes internationales complexes et ruineuses.
                </p>
                <p>
                  Nous avons alors décidé d'unir nos forces et nos compétences complémentaires : l'ingénierie logicielle pour offrir une expérience d'achat moderne et intuitive, et le sens aigu du sourcing opérationnel pour négocier directement avec les meilleurs ateliers.
                </p>
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
                      L
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-lg font-bold text-primary dark:text-white">Landry</h3>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-[10px] font-bold">
                          Tech & IA
                        </span>
                      </div>
                      <p className="text-xs text-accent font-semibold mb-2">Co-fondateur & Responsable Technique</p>
                      <p className="text-xs text-primary/70 dark:text-white/70 leading-relaxed">
                        Pilote toute la dimension numérique : plateforme web ultra-rapide, passerelles de paiement sécurisées Mobile Money, algorithmes du calculateur de pelotes et assistant Compagnon Tricot IA.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-primary/5 dark:border-white/5 flex items-center justify-between text-[11px] text-primary/60 dark:text-white/60">
                    <span className="flex items-center gap-1"><Code2 size={13} className="text-accent" /> Développement & Innovation</span>
                    <span className="font-semibold text-accent">Douala</span>
                  </div>
                </div>

                {/* Dolères' Card */}
                <div
                  onClick={() => setSelectedFounder('doleres')}
                  className={`cursor-pointer p-6 rounded-3xl transition-all border ${
                    selectedFounder === 'doleres'
                      ? 'bg-accent/5 border-accent shadow-md'
                      : 'bg-primary/5 dark:bg-white/5 border-transparent hover:border-primary/20'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-accent text-white flex items-center justify-center font-serif text-2xl font-bold shadow-md shrink-0">
                      D
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-lg font-bold text-primary dark:text-white">Dolères</h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-[10px] font-bold">
                          Opérations
                        </span>
                      </div>
                      <p className="text-xs text-accent font-semibold mb-2">Co-fondatrice & Responsable Opérationnelle</p>
                      <p className="text-xs text-primary/70 dark:text-white/70 leading-relaxed">
                        Garante de la qualité matérielle : sélection minutieuse des pelotes de laine, négociation directe avec les ateliers, contrôle rigoureux des bains de teinture et supervision des expéditions locales.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-primary/5 dark:border-white/5 flex items-center justify-between text-[11px] text-primary/60 dark:text-white/60">
                    <span className="flex items-center gap-1"><Package2 size={13} className="text-accent" /> Sourcing & Logistique</span>
                    <span className="font-semibold text-accent">Douala</span>
                  </div>
                </div>

              </div>

              {/* Quote Block */}
              <div className="mt-8 p-5 rounded-2xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 text-center italic text-xs sm:text-sm text-primary/80 dark:text-white/80">
                « Deux profils, deux sensibilités, mais une seule ambition : faire de Laine & Déco la référence chaleureuse et fiable des créateurs textiles au Cameroun. »
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
                    Notre Parcours & Les Grandes Étapes
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">
                    De la première idée à une communauté grandissante
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
                <p className="text-xs text-primary/70 dark:text-white/70">Pelotes & Articles expédiés</p>
              </div>
              <div className="bg-white dark:bg-[#181C18] p-5 rounded-3xl border border-primary/10 dark:border-white/10 text-center space-y-1">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-accent">100%</span>
                <p className="text-xs text-primary/70 dark:text-white/70">Lots de bains contrôlés</p>
              </div>
              <div className="bg-white dark:bg-[#181C18] p-5 rounded-3xl border border-primary/10 dark:border-white/10 text-center space-y-1">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-accent">10 Régions</span>
                <p className="text-xs text-primary/70 dark:text-white/70">Desservies au Cameroun</p>
              </div>
              <div className="bg-white dark:bg-[#181C18] p-5 rounded-3xl border border-primary/10 dark:border-white/10 text-center space-y-1">
                <span className="text-2xl sm:text-3xl font-serif font-bold text-accent">4.9 / 5</span>
                <p className="text-xs text-primary/70 dark:text-white/70">Satisfaction & Avis clients</p>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: VISION & VALEURS */}
        {/* ========================================================================= */}
        {activeTab === 'vision' && (
          <div className="space-y-8">
            
            <div className="bg-white dark:bg-[#181C18] rounded-[2rem] p-6 sm:p-10 shadow-sm border border-primary/10 dark:border-white/10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/10 text-accent rounded-2xl">
                  <Compass size={24} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary dark:text-white">
                    Notre Vision & Nos 4 Piliers Fondateurs
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">
                    Les principes non négociables qui guident chacune de nos décisions
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
                  Le Manifeste Laine & Déco
                </div>

                <h3 className="text-2xl sm:text-3xl font-serif font-bold">
                  « Redonner ses lettres de noblesse au fait-main et sublimer les intérieurs africains »
                </h3>

                <p className="text-white/80 text-sm sm:text-base font-light leading-relaxed">
                  Nous croyons que tricoter, crocheter ou décorer son espace de vie n'est pas un luxe réservé à quelques-uns, mais un art de vivre universel source d'apaisement, de fierté et de beauté. Chaque pelote que nous préparons à Douala porte cette promesse : vous apporter une matière noble, soyeuse et durable, pour que vos créations traversent le temps.
                </p>

                <div className="pt-4 flex items-center justify-center gap-6 text-xs text-accent-light font-semibold">
                  <span>✍️ Landry Moutongo</span>
                  <span>•</span>
                  <span>✍️ Dolères</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SOURCING & PROCESSUS QUALITÉ */}
        {/* ========================================================================= */}
        {activeTab === 'process' && (
          <div className="space-y-8">
            
            <div className="bg-white dark:bg-[#181C18] rounded-[2rem] p-6 sm:p-10 shadow-sm border border-primary/10 dark:border-white/10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/10 text-accent rounded-2xl">
                  <Layers size={24} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary dark:text-white">
                    Notre Chaîne de Valeur & Processus Qualité
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">
                    Comment chaque produit passe de l'atelier à votre salon
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
                Pourquoi nos clients camerounais nous font confiance ?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-primary/5 dark:bg-white/5 space-y-1.5">
                  <strong className="block text-primary dark:text-white font-bold">1. Bains de Teinture Contrôlés</strong>
                  <p className="text-primary/70 dark:text-white/70">Garantie stricte de pelotes issues d'une même cuve pour éviter tout démarquage de couleur au tricot.</p>
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 dark:bg-white/5 space-y-1.5">
                  <strong className="block text-primary dark:text-white font-bold">2. Protection Anti-Humidité</strong>
                  <p className="text-primary/70 dark:text-white/70">Emballage thermo-scellé étanche protégeant la laine contre la pluie et l'humidité pendant le trajet.</p>
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 dark:bg-white/5 space-y-1.5">
                  <strong className="block text-primary dark:text-white font-bold">3. Garantie 7 Jours</strong>
                  <p className="text-primary/70 dark:text-white/70">Conformité à la Loi 2011/012 avec droit de retour et remboursement rapide Mobile Money.</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ÉCOSYSTÈME CRÉATIF */}
        {/* ========================================================================= */}
        {activeTab === 'tools' && (
          <div className="space-y-8">
            
            <div className="bg-white dark:bg-[#181C18] rounded-[2rem] p-6 sm:p-10 shadow-sm border border-primary/10 dark:border-white/10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/10 text-accent rounded-2xl">
                  <Zap size={24} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary dark:text-white">
                    Bien Plus Qu'une Simple Boutique : Un Écosystème Créatif
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">
                    Des outils numériques innovants créés sur mesure pour les passionnés de tricot et déco
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                
                {/* Tool 1: AI Knitting Companion */}
                <div className="p-6 rounded-3xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">
                      <Cpu size={24} />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-primary dark:text-white">
                      Compagnon Tricot & Assistant IA
                    </h3>
                    <p className="text-xs sm:text-sm text-primary/70 dark:text-white/70 leading-relaxed">
                      Un assistant intelligent capable d'analyser vos envies d'ouvrage, de recommander les calibres d'aiguilles adaptés et d'expliquer les points techniques pas à pas.
                    </p>
                  </div>

                  {onNavigate && (
                    <Button
                      variant="outline"
                      onClick={() => onNavigate('knitting-companion')}
                      className="w-full rounded-2xl text-xs font-bold mt-2"
                    >
                      Essayer le Compagnon IA
                    </Button>
                  )}
                </div>

                {/* Tool 2: Yarn Calculator */}
                <div className="p-6 rounded-3xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold">
                      <BookOpen size={24} />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-primary dark:text-white">
                      Calculateur de Pelotes & Métrage
                    </h3>
                    <p className="text-xs sm:text-sm text-primary/70 dark:text-white/70 leading-relaxed">
                      Estimez avec précision le nombre exact de pelotes nécessaires pour un pull, plaid, écharpe ou bonnet selon votre taille et votre échantillon.
                    </p>
                  </div>

                  {onNavigate && (
                    <Button
                      variant="outline"
                      onClick={() => onNavigate('calculator')}
                      className="w-full rounded-2xl text-xs font-bold mt-2"
                    >
                      Lancer le Calculateur
                    </Button>
                  )}
                </div>

                {/* Tool 3: Pattern Generator */}
                <div className="p-6 rounded-3xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold">
                      <Sparkles size={24} />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-primary dark:text-white">
                      Générateur de Patrons Gratuits
                    </h3>
                    <p className="text-xs sm:text-sm text-primary/70 dark:text-white/70 leading-relaxed">
                      Créez des grilles et tutoriels personnalisés selon vos pelotes en stock pour des créations 100% originales et adaptées au climat local.
                    </p>
                  </div>

                  {onNavigate && (
                    <Button
                      variant="outline"
                      onClick={() => onNavigate('pattern-generator')}
                      className="w-full rounded-2xl text-xs font-bold mt-2"
                    >
                      Générer un Patron
                    </Button>
                  )}
                </div>

                {/* Tool 4: Community Gallery */}
                <div className="p-6 rounded-3xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold">
                      <Users size={24} />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-primary dark:text-white">
                      Galerie Communautaire
                    </h3>
                    <p className="text-xs sm:text-sm text-primary/70 dark:text-white/70 leading-relaxed">
                      Partagez vos réalisations tricot et vos photos de déco intérieure avec les autres membres passionnés au Cameroun et votez pour vos créations préférées.
                    </p>
                  </div>

                  {onNavigate && (
                    <Button
                      variant="outline"
                      onClick={() => onNavigate('community')}
                      className="w-full rounded-2xl text-xs font-bold mt-2"
                    >
                      Explorer la Galerie
                    </Button>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: FAQ FONDATEURS */}
        {/* ========================================================================= */}
        {activeTab === 'faq' && (
          <div className="space-y-6">
            
            <div className="bg-white dark:bg-[#181C18] rounded-[2rem] p-6 sm:p-10 shadow-sm border border-primary/10 dark:border-white/10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-accent/10 text-accent rounded-2xl">
                  <HelpCircle size={24} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-primary dark:text-white">
                    Questions Fréquentes aux Fondateurs
                  </h2>
                  <p className="text-xs text-primary/60 dark:text-white/60">
                    Nos réponses directes et transparentes sur notre fonctionnement
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
                      D'où proviennent exactement vos pelotes de laine et vos objets de déco ?
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
                        Nous travaillons en sourcing direct avec des manufactures textiles et des ateliers artisanaux rigoureusement audités pour la qualité de leurs fibres (mérinos, alpaga, coton mercerisé, mohair). En supprimant les centrales d'achat intermédiaires, nous supervisons directement chaque importation jusqu'à notre entrepôt de Douala.
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
                      Comment garantissez-vous que mes pelotes auront la même teinte ?
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
                        C'est l'un de nos engagements majeurs (Article 2 de nos CGV) : pour toute commande passée en une seule fois, Dolères et notre équipe vérifient manuellement que toutes les pelotes d'un même coloris proviennent du <strong>même numéro de bain de teinture (Dye Lot)</strong>. Nous recommandons toujours de prévoir 1 pelote de réserve pour votre projet.
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
                      Puis-je commander depuis une autre ville que Douala (Yaoundé, Kribi, etc.) ?
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
                        Absolument ! Si Douala bénéficie de coursiers express à domicile sous 24h, nous expédions quotidiennement vers Yaoundé, Bafoussam, Kribi, Garoua, Ngaoundéré et toutes les villes du Cameroun via nos partenaires de confiance (Buca Voyages, Finexs, Touristique Express) avec notification SMS dès l'arrivée du colis.
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
                      Comment contacter directement Landry ou Dolères en cas de question ?
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
                        Nous sommes joignables directement par WhatsApp ou via le formulaire de contact. Nous nous faisons un plaisir d'échanger avec vous pour vous aider à estimer votre métrage de fil ou répondre à vos questions techniques.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* DIRECT CONTACT & ACTION BANNER */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#2D3E31] dark:bg-[#141814] rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center md:text-left max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent/20 text-accent-light rounded-full text-xs font-bold uppercase tracking-wider">
              <MessageCircle size={14} />
              <span>Contact Direct Fondateurs</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold">
              Une Question sur une Laine ou un Projet ?
            </h2>
            <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
              Nous répondons personnellement à chacun de vos messages pour vous guider dans le choix de vos matières, calibres d'aiguilles et nuances décoratives.
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
                  Découvrir la Boutique
                </button>
                <button
                  onClick={() => onNavigate('contact')}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-xs sm:text-sm border border-white/15 active:scale-95"
                >
                  <MessageCircle size={16} />
                  Nous Écrire
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
