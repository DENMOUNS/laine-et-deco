import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gift, 
  Sparkles, 
  Feather, 
  Heart, 
  Check, 
  Sparkle, 
  Cake, 
  Crown, 
  Smile, 
  Scissors, 
  Stars,
  Palette,
  Layers,
  Stamp,
  RefreshCw
} from 'lucide-react';
import { GiftWrapOption, GiftOccasion } from '../../types';

interface GiftWrapSectionProps {
  giftWrap: GiftWrapOption;
  onChange: (updated: Partial<GiftWrapOption>) => void;
  configuredFee?: number;
  className?: string;
}

export interface OccasionTheme {
  id: GiftOccasion;
  title: string;
  subtitle: string;
  badge: string;
  icon: any;
  defaultMessage: string;
  suggestions: string[];
  bgGradient: string;
  borderClass: string;
  accentColor: string;
  sealColor: string;
  sealText: string;
  textColor: string;
  subtextColor: string;
  frameStyle: 'ornate-gold' | 'romantic-rose' | 'botanic-yarn' | 'prestige-royal' | 'warm-sun' | 'festive-stars';
  texturePattern: string;
  cornerIcon: string;
}

export const OCCASION_THEMES: Record<GiftOccasion, OccasionTheme> = {
  birthday: {
    id: 'birthday',
    title: 'Anniversaire & Célébration',
    subtitle: 'Confettis dorés, ruban festif et carte enluminée',
    badge: '🎂 Festif & Joyeux',
    icon: Cake,
    defaultMessage: 'Joyeux Anniversaire ! Que ces douces laines et trésors faits-main illuminent ton année de créativité et de bonheur.',
    suggestions: [
      'Joyeux Anniversaire ! Que ces douces laines et trésors faits-main illuminent ton année de créativité et de bonheur.',
      'Une année de plus à rayonner ! Que cette création artisanale t\'apporte douceur, chaleur et joie au quotidien.',
      'Joyeuse fête ! Pour quelqu\'un d\'extraordinaire qui mérite toute la douceur du monde.',
    ],
    bgGradient: 'from-[#FFFDF5] via-[#FFF8E7] to-[#FFF0D4]',
    borderClass: 'border-[#F2C94C]/70 shadow-amber-900/10',
    accentColor: '#B45309',
    sealColor: '#B45309',
    sealText: 'JOYEUX ANNIVERSAIRE',
    textColor: 'text-stone-900',
    subtextColor: 'text-stone-600',
    frameStyle: 'ornate-gold',
    texturePattern: 'radial-gradient(circle at 10% 10%, rgba(217, 119, 6, 0.08) 0, transparent 40%), radial-gradient(circle at 90% 90%, rgba(245, 158, 11, 0.1) 0, transparent 50%)',
    cornerIcon: '✨',
  },
  love: {
    id: 'love',
    title: 'Amour & Mots Doux',
    subtitle: 'Papier vergé rosé, filigrane cœurs et délicatesse',
    badge: '💖 Romantique & Tendre',
    icon: Heart,
    defaultMessage: 'Un trésor artisanal tout doux pour envelopper ton cœur d\'amour et de tendresse. Tu es précieux/se pour moi.',
    suggestions: [
      'Un trésor artisanal tout doux pour envelopper ton cœur d\'amour et de tendresse. Tu es précieux/se pour moi.',
      'Chaque maille de ce coffret tressée avec tout mon amour. Merci d\'illuminer ma vie chaque jour.',
      'Pour la personne qui fait battre mon cœur. Avec toute ma tendresse infinie.',
    ],
    bgGradient: 'from-[#FFF9FA] via-[#FFF0F3] to-[#FFE4E9]',
    borderClass: 'border-[#F43F5E]/40 shadow-rose-950/10',
    accentColor: '#BE123C',
    sealColor: '#9F1239',
    sealText: 'AVEC TOUT MON AMOUR',
    textColor: 'text-stone-900',
    subtextColor: 'text-rose-900/80',
    frameStyle: 'romantic-rose',
    texturePattern: 'radial-gradient(circle at 15% 15%, rgba(244, 63, 94, 0.08) 0, transparent 45%), radial-gradient(circle at 85% 85%, rgba(225, 29, 72, 0.08) 0, transparent 45%)',
    cornerIcon: '🌸',
  },
  craft: {
    id: 'craft',
    title: 'Passion Artisanale & Tricot',
    subtitle: 'Kraft brut texturé, pelotes filigranées et esprit fait-main',
    badge: '🧶 Mains Créatives',
    icon: Scissors,
    defaultMessage: 'Pour tes mains d\'or et tes magnifiques projets d\'artisanat à venir ! Que ce fil t\'inspire de pures merveilles.',
    suggestions: [
      'Pour tes mains d\'or et tes magnifiques projets d\'artisanat à venir ! Que ce fil t\'inspire de pures merveilles.',
      'De magnifiques fibres nobles pour donner vie à tes plus belles inspirations tricot & crochet.',
      'À la créativité sans limite ! Hâte d\'admirer ta prochaine pièce artisanale.',
    ],
    bgGradient: 'from-[#FAF8F5] via-[#F4EFE6] to-[#EAE0D0]',
    borderClass: 'border-[#1B4D3E]/40 shadow-emerald-950/10',
    accentColor: '#1B4D3E',
    sealColor: '#1B4D3E',
    sealText: 'FAIT MAIN AVEC PASSION',
    textColor: 'text-stone-900',
    subtextColor: 'text-stone-700',
    frameStyle: 'botanic-yarn',
    texturePattern: 'radial-gradient(circle at 20% 20%, rgba(27, 77, 62, 0.08) 0, transparent 40%), radial-gradient(circle at 80% 80%, rgba(180, 83, 9, 0.06) 0, transparent 50%)',
    cornerIcon: '🌿',
  },
  wedding: {
    id: 'wedding',
    title: 'Mariage & Grand Événement',
    subtitle: 'Carton ivoire gaufré, monogramme royal et arabesques',
    badge: '👑 Prestige & Cérémonie',
    icon: Crown,
    defaultMessage: 'Tous nos vœux de bonheur éternel pour cette nouvelle aventure à deux. Que votre foyer soit empli d\'harmonie.',
    suggestions: [
      'Tous nos vœux de bonheur éternel pour cette nouvelle aventure à deux. Que votre foyer soit empli d\'harmonie.',
      'Félicitations pour cette magnifique union ! Que la douceur et la complicité accompagnent chaque jour de votre vie.',
      'Un doux présent pour célébrer votre grand jour et marquer le début de ce merveilleux chapitre.',
    ],
    bgGradient: 'from-[#FAF9F6] via-[#F5F2EB] to-[#ECE6D8]',
    borderClass: 'border-[#C5A059] shadow-amber-950/15',
    accentColor: '#855E15',
    sealColor: '#78591A',
    sealText: 'UNION SACRÉE & BONHEUR',
    textColor: 'text-stone-900',
    subtextColor: 'text-stone-700',
    frameStyle: 'prestige-royal',
    texturePattern: 'radial-gradient(circle at 50% 10%, rgba(197, 160, 89, 0.12) 0, transparent 60%)',
    cornerIcon: '⚜️',
  },
  gratitude: {
    id: 'gratitude',
    title: 'Remerciements & Gratitude',
    subtitle: 'Teintes solaires chaudes et lettrage calligraphique épuré',
    badge: '☀️ Merci du Fond du Cœur',
    icon: Smile,
    defaultMessage: 'Mille mercis pour ta bienveillance et ta générosité. Voici une délicate attention pour te témoigner ma profonde reconnaissance.',
    suggestions: [
      'Mille mercis pour ta bienveillance et ta générosité. Voici une délicate attention pour te témoigner ma profonde reconnaissance.',
      'Du fond du cœur, merci pour tout. Que ce coffret t\'apporte autant de joie que tu en offres autour de toi.',
      'Une petite attention pour un geste inoubliable. Toute ma reconnaissance et mon amitié sincère.',
    ],
    bgGradient: 'from-[#FFFDF7] via-[#FFF8E8] to-[#FEEDC9]',
    borderClass: 'border-[#D97706]/40 shadow-amber-950/10',
    accentColor: '#92400E',
    sealColor: '#92400E',
    sealText: 'INFINIE RECONNAISSANCE',
    textColor: 'text-stone-900',
    subtextColor: 'text-stone-700',
    frameStyle: 'warm-sun',
    texturePattern: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.08) 0, transparent 70%)',
    cornerIcon: '🌾',
  },
  holiday: {
    id: 'holiday',
    title: 'Fêtes & Vœux Annuels',
    subtitle: 'Neige dorée, sapin féérique et contrastes d\'exception ultra-lisibles',
    badge: '✨ Magie des Fêtes',
    icon: Stars,
    defaultMessage: 'Merveilleuses fêtes de fin d\'année ! Que ces douces laines apportent réconfort, chaleur et féérie à tous tes proches.',
    suggestions: [
      'Merveilleuses fêtes de fin d\'année ! Que ces douces laines apportent réconfort, chaleur et féérie à tous tes proches.',
      'Joyeuses Fêtes ! Que la magie de cette saison illumine ton foyer de paix, de santé et d\'amour.',
      'Meilleurs vœux pour la nouvelle année ! Plein de douceur, de projets créatifs et de moments précieux.',
    ],
    // Ultra-readable premium ivory & gold theme with emerald/gold festive borders
    bgGradient: 'from-[#FCFAF2] via-[#F6F1E3] to-[#ECE5D0]',
    borderClass: 'border-[#B48A3C] shadow-amber-900/15',
    accentColor: '#165B33',
    sealColor: '#B48A3C',
    sealText: 'MAGIE DES FÊTES',
    textColor: 'text-stone-900',
    subtextColor: 'text-emerald-950 font-medium',
    frameStyle: 'festive-stars',
    texturePattern: 'radial-gradient(circle at 15% 15%, rgba(180, 138, 60, 0.12) 0, transparent 40%), radial-gradient(circle at 85% 85%, rgba(22, 91, 51, 0.08) 0, transparent 50%)',
    cornerIcon: '🎄',
  },
};

export const RIBBON_OPTIONS: { 
  id: GiftWrapOption['ribbonColor']; 
  name: string; 
  hex: string; 
  bgClass: string; 
  borderHex: string;
  glowColor: string;
}[] = [
  { 
    id: 'satin-gold', 
    name: 'Doré Satiné Prestige', 
    hex: '#D4AF37', 
    bgClass: 'bg-amber-100 border-amber-400 text-amber-950', 
    borderHex: '#D4AF37',
    glowColor: 'rgba(212, 175, 55, 0.4)'
  },
  { 
    id: 'satin-burgundy', 
    name: 'Bordeaux Velours Royal', 
    hex: '#800020', 
    bgClass: 'bg-rose-100 border-rose-400 text-rose-950', 
    borderHex: '#800020',
    glowColor: 'rgba(128, 0, 32, 0.4)'
  },
  { 
    id: 'satin-emerald', 
    name: 'Émeraude Végétal Noble', 
    hex: '#1B4D3E', 
    bgClass: 'bg-emerald-100 border-emerald-500 text-emerald-950', 
    borderHex: '#1B4D3E',
    glowColor: 'rgba(27, 77, 62, 0.4)'
  },
  { 
    id: 'satin-cream', 
    name: 'Ivoire Soyeux Nacré', 
    hex: '#FFFDD0', 
    bgClass: 'bg-stone-100 border-stone-300 text-stone-900', 
    borderHex: '#E5DFB8',
    glowColor: 'rgba(235, 225, 185, 0.5)'
  },
];

export const GiftWrapSection: React.FC<GiftWrapSectionProps> = ({ giftWrap, onChange, configuredFee = 2000, className = '' }) => {
  const [showPreview, setShowPreview] = useState(true);

  const activeFee = giftWrap.fee || configuredFee || 2000;
  const selectedOccasion: GiftOccasion = giftWrap.occasion || 'birthday';
  const currentTheme = OCCASION_THEMES[selectedOccasion] || OCCASION_THEMES.birthday;
  const selectedRibbon = RIBBON_OPTIONS.find((r) => r.id === giftWrap.ribbonColor) || RIBBON_OPTIONS[0];

  const toggleEnabled = () => {
    const nextState = !giftWrap.enabled;
    onChange({
      enabled: nextState,
      fee: activeFee,
      occasion: giftWrap.occasion || 'birthday',
      ribbonColor: giftWrap.ribbonColor || 'satin-gold',
      message: giftWrap.message || (nextState ? currentTheme.defaultMessage : ''),
    });
  };

  const selectOccasion = (occ: GiftOccasion) => {
    const theme = OCCASION_THEMES[occ];
    // If message is empty or matches an existing default template from any theme, switch to the new theme's default
    const allKnownDefaults = Object.values(OCCASION_THEMES).flatMap((t) => [t.defaultMessage, ...t.suggestions]);
    const shouldUpdateMsg = !giftWrap.message || allKnownDefaults.includes(giftWrap.message);
    onChange({
      occasion: occ,
      message: shouldUpdateMsg ? theme.defaultMessage : giftWrap.message,
    });
  };

  return (
    <div
      id="gift-wrap-customizer"
      className={`rounded-[2.5rem] border transition-all duration-300 overflow-hidden ${
        giftWrap.enabled
          ? 'bg-gradient-to-br from-amber-50/80 via-stone-50 to-orange-50/50 border-amber-300/90 shadow-md ring-1 ring-amber-300/50'
          : 'bg-white border-primary/10 hover:border-primary/20 shadow-sm'
      } ${className}`}
    >
      {/* Header Banner & Activation Switch */}
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all ${
                giftWrap.enabled
                  ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-lg shadow-amber-600/30 scale-105 rotate-1'
                  : 'bg-primary/5 text-primary/70'
              }`}
            >
              <Gift size={28} className={giftWrap.enabled ? 'animate-pulse' : ''} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-900 border border-amber-400/40 flex items-center gap-1">
                  <Sparkles size={11} className="text-amber-600" />
                  Atelier Calligraphie & Coffret Sur-Mesure
                </span>
                <span className="text-xs font-bold text-amber-950 bg-amber-200/80 px-2 py-0.5 rounded-md shadow-2xs">
                  +{activeFee.toLocaleString()} FCFA
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-primary">
                Emballage Kraft Noble & Carton Thématique Personnalisé
              </h3>
              <p className="text-xs text-primary/70 mt-0.5 max-w-xl leading-relaxed">
                Design de carton d'art adapté à votre événement, ruban satin noué à la main et sceau de cire artisanal.
              </p>
            </div>
          </div>

          {/* Toggle Action Button */}
          <button
            type="button"
            id="toggle-gift-wrap-btn"
            onClick={toggleEnabled}
            className={`self-start sm:self-center shrink-0 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm ${
              giftWrap.enabled
                ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-600/20'
                : 'bg-secondary text-primary hover:bg-primary/10 border border-primary/10'
            }`}
          >
            {giftWrap.enabled ? (
              <>
                <Check size={16} />
                Option Ajoutée
              </>
            ) : (
              <>
                <Gift size={16} />
                Ajouter l'option (+{activeFee.toLocaleString()} FCFA)
              </>
            )}
          </button>
        </div>

        {/* Detailed Form & Interactive Visual Studio */}
        <AnimatePresence>
          {giftWrap.enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="mt-8 pt-8 border-t border-amber-200/80 space-y-8"
            >
              {/* STEP 1: Occasion / Event Selection (Drives Carton Design & Ambiance) */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                    <Palette size={14} className="text-amber-700" />
                    1. Choisissez le Thème de l'Événement & Style du Carton
                  </label>
                  <span className="text-[11px] text-amber-900/70 font-medium">
                    Le design visuel et les textes s'adaptent instantanément
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {(Object.keys(OCCASION_THEMES) as GiftOccasion[]).map((occKey) => {
                    const theme = OCCASION_THEMES[occKey];
                    const isSelected = selectedOccasion === occKey;

                    return (
                      <button
                        key={occKey}
                        type="button"
                        id={`select-occasion-${occKey}`}
                        onClick={() => selectOccasion(occKey)}
                        className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[96px] ${
                          isSelected
                            ? 'bg-white border-2 border-amber-600 shadow-md ring-2 ring-amber-500/20 scale-[1.03]'
                            : 'bg-white/70 border-stone-200/80 text-stone-700 hover:bg-white hover:border-amber-300'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center">
                            <Check size={10} strokeWidth={3} />
                          </div>
                        )}
                        <div>
                          <span className="text-xl mb-1 block">{theme.cornerIcon}</span>
                          <p className="text-xs font-bold text-primary leading-tight line-clamp-1">
                            {theme.title.split('&')[0]}
                          </p>
                        </div>
                        <span className="text-[10px] font-semibold text-primary/60 truncate mt-1">
                          {theme.badge.split(' ')[1]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: Ribbon Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-3 flex items-center gap-1.5">
                  <Layers size={14} className="text-amber-700" />
                  2. Couleur du Ruban en Satin Noué sur le Coffret
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {RIBBON_OPTIONS.map((ribbon) => {
                    const isSelected = (giftWrap.ribbonColor || 'satin-gold') === ribbon.id;
                    return (
                      <button
                        key={ribbon.id}
                        type="button"
                        id={`ribbon-select-${ribbon.id}`}
                        onClick={() => onChange({ ribbonColor: ribbon.id })}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                          isSelected
                            ? `${ribbon.bgClass} border-2 shadow-sm scale-[1.02]`
                            : 'bg-white/80 border-stone-200 text-stone-700 hover:bg-white'
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-black/20 shrink-0 shadow-inner"
                          style={{ backgroundColor: ribbon.hex }}
                        />
                        <div className="min-w-0 flex-grow">
                          <p className="text-xs font-bold truncate">{ribbon.name}</p>
                          <p className="text-[10px] opacity-75">{isSelected ? 'Actif' : 'Choisir'}</p>
                        </div>
                        {isSelected && <Check size={14} className="shrink-0 text-amber-800" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 3: Names (Recipient & Sender) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-2">
                    Destinataire (À qui s'adresse le cadeau ?)
                  </label>
                  <input
                    type="text"
                    id="gift-recipient-input"
                    value={giftWrap.recipientName || ''}
                    onChange={(e) => onChange({ recipientName: e.target.value })}
                    placeholder="Ex: Maman, Sarah, Chloé, Landry..."
                    className="w-full px-4 py-3 bg-white/90 border border-amber-300/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium placeholder:text-stone-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 mb-2">
                    Expéditeur (De la part de qui ?)
                  </label>
                  <input
                    type="text"
                    id="gift-sender-input"
                    value={giftWrap.senderName || ''}
                    onChange={(e) => onChange({ senderName: e.target.value })}
                    placeholder="Ex: Landry, Les Amis du Club, Sarah..."
                    className="w-full px-4 py-3 bg-white/90 border border-amber-300/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium placeholder:text-stone-400"
                  />
                </div>
              </div>

              {/* STEP 4: Hand-Calligraphed Message & Multiple Suggestions */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                    <Feather size={14} className="text-amber-700" />
                    3. Message Calligraphié (Modifiable à volonté)
                  </label>
                  <span className="text-[11px] text-stone-500 font-medium">
                    {(giftWrap.message || '').length} / 250 caractères
                  </span>
                </div>

                {/* Event-Specific Suggestions Pills */}
                <div className="mb-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900/90">
                    <Sparkles size={12} className="text-amber-600" />
                    <span>Suggestions de vœux pour « {currentTheme.title.split('&')[0]} » (cliquez pour insérer et modifier) :</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {currentTheme.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => onChange({ message: sug })}
                        className="p-2.5 rounded-xl border border-amber-200/80 bg-white/80 hover:bg-amber-100/70 text-left text-xs font-serif italic text-stone-800 leading-snug transition-all shadow-2xs hover:border-amber-400 group"
                      >
                        <span className="text-[10px] font-mono not-italic font-bold uppercase tracking-wider text-amber-800 block mb-1">
                          Option {i + 1}
                        </span>
                        <span className="line-clamp-2">« {sug} »</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    id="gift-message-textarea"
                    rows={3}
                    maxLength={250}
                    value={giftWrap.message || ''}
                    onChange={(e) => onChange({ message: e.target.value })}
                    placeholder="Rédigez votre mot personnalisé... Vous pouvez modifier le texte librement."
                    className="w-full px-4 py-3.5 bg-white/90 border border-amber-300/80 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-serif leading-relaxed text-stone-900 placeholder:text-stone-400 shadow-inner"
                  />
                  {giftWrap.message && (
                    <button
                      type="button"
                      onClick={() => onChange({ message: '' })}
                      className="absolute top-3 right-3 text-[10px] uppercase font-bold text-stone-400 hover:text-rose-600 transition-colors bg-stone-100 hover:bg-rose-50 px-2 py-0.5 rounded-md"
                      title="Effacer le message pour en écrire un tout nouveau"
                    >
                      Effacer
                    </button>
                  )}
                </div>
              </div>

              {/* 🎨 HIGH-CRAFT LIVE PREVIEW STUDIO */}
              <div className="mt-6 pt-6 border-t border-amber-200/60">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Stamp size={16} className="text-amber-700" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-950">
                      Rendu Final du Carton d'Art & Sceau de Cire
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-[11px] font-semibold text-amber-800 hover:underline"
                  >
                    {showPreview ? 'Masquer le carton' : 'Afficher le carton'}
                  </button>
                </div>

                {showPreview && (
                  <motion.div
                    key={`${selectedOccasion}-${giftWrap.ribbonColor}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`relative p-6 sm:p-10 rounded-[2rem] shadow-xl overflow-hidden border ${currentTheme.borderClass} transition-all`}
                    style={{
                      backgroundImage: currentTheme.texturePattern,
                    }}
                  >
                    {/* Background Ambiance Class */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.bgGradient} -z-10`} />

                    {/* Double Ornate Border Graphic */}
                    <div 
                      className="absolute inset-3 sm:inset-4 rounded-[1.5rem] border pointer-events-none -z-5"
                      style={{ borderColor: currentTheme.accentColor, opacity: 0.4 }}
                    />
                    <div 
                      className="absolute inset-5 sm:inset-6 rounded-[1.25rem] border border-dashed pointer-events-none -z-5"
                      style={{ borderColor: currentTheme.accentColor, opacity: 0.25 }}
                    />

                    {/* Top Ribbon Signet / Knot Bookmark Simulation */}
                    <div className="absolute top-0 left-8 sm:left-12 flex flex-col items-center">
                      <div 
                        className="w-6 sm:w-8 h-10 sm:h-12 rounded-b-md shadow-md transition-all"
                        style={{ 
                          backgroundColor: selectedRibbon.hex,
                          boxShadow: `0 4px 12px ${selectedRibbon.glowColor}`
                        }}
                      />
                      <div 
                        className="w-0 h-0 border-x-4 border-x-transparent border-t-[6px]"
                        style={{ borderTopColor: selectedRibbon.hex }}
                      />
                    </div>

                    {/* Theme Header with Custom Corner Ornaments */}
                    <div className="flex items-start justify-between pl-10 sm:pl-16 mb-6">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl sm:text-2xl">{currentTheme.cornerIcon}</span>
                          <span 
                            className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em]"
                            style={{ color: currentTheme.accentColor }}
                          >
                            {currentTheme.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                          Atelier Laine & Déco Cameroun • Carton d'Art Prestige
                        </p>
                      </div>

                      {/* Artisanal Wax Seal Badge */}
                      <div className="shrink-0 flex flex-col items-center">
                        <div 
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg flex flex-col items-center justify-center text-white border-2 border-white/40 rotate-6 transition-transform hover:rotate-0"
                          style={{ backgroundColor: currentTheme.sealColor }}
                        >
                          <span className="font-serif font-bold text-[10px] sm:text-xs tracking-wider">L&D</span>
                          <span className="text-[7px] tracking-tighter opacity-80 uppercase">Artisan</span>
                        </div>
                      </div>
                    </div>

                    {/* Center Calligraphic Presentation with Crystal Clear Readability */}
                    <div className="space-y-4 my-6 pl-2 sm:pl-4">
                      {giftWrap.recipientName && (
                        <p 
                          className="text-base sm:text-lg font-bold italic text-stone-900"
                          style={{ fontFamily: 'Georgia, serif' }}
                        >
                          Chère / Cher {giftWrap.recipientName},
                        </p>
                      )}

                      <div className="relative py-2">
                        <p 
                          className="text-base sm:text-xl leading-relaxed italic whitespace-pre-line min-h-[64px] text-stone-900 font-medium"
                          style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                        >
                          {giftWrap.message ? `« ${giftWrap.message} »` : '« Votre message personnalisé calligraphié s\'affichera ici... »'}
                        </p>
                      </div>

                      {/* Footer & Signature with Wax Seal Mention (No ribbon text inside the card) */}
                      <div className="flex flex-wrap items-center justify-between pt-4 border-t border-stone-300/80 gap-2 text-xs">
                        <div>
                          {giftWrap.senderName ? (
                            <p className="font-serif font-bold text-sm" style={{ color: currentTheme.accentColor }}>
                              Avec toute l'affection de {giftWrap.senderName}
                            </p>
                          ) : (
                            <p className="italic text-stone-500">Signature de l'expéditeur</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-stone-600 bg-stone-100/80 px-2.5 py-1 rounded-md border border-stone-200">
                            Sceau : {currentTheme.sealText}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Decorative Footer Motif */}
                    <div className="flex justify-center items-center gap-2 pt-2 opacity-40 text-stone-700">
                      <span className="h-px w-12 bg-current" />
                      <span className="text-xs">❦</span>
                      <span className="h-px w-12 bg-current" />
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
