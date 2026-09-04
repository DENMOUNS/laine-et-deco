import { Cake, Heart, Scissors, Crown, Smile, Stars } from 'lucide-react';
import { GiftWrapOption, GiftOccasion } from '../../../types';

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

export interface RibbonOption {
  id: GiftWrapOption['ribbonColor'];
  name: string;
  hex: string;
  bgClass: string;
  borderHex: string;
  glowColor: string;
}

export const RIBBON_OPTIONS: RibbonOption[] = [
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
