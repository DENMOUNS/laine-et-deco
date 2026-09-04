import React from 'react';
import { Palette, Check, Layers, Sparkles, Feather } from 'lucide-react';
import { GiftWrapOption, GiftOccasion } from '../../../types';
import { OccasionTheme, RibbonOption, OCCASION_THEMES, RIBBON_OPTIONS } from './occasionThemes';

interface GiftWrapCustomizerProps {
  giftWrap: GiftWrapOption;
  onChange: (updated: Partial<GiftWrapOption>) => void;
  currentTheme: OccasionTheme;
  selectedOccasion: GiftOccasion;
  selectedRibbon: RibbonOption;
  onSelectOccasion: (occ: GiftOccasion) => void;
}

export const GiftWrapCustomizer: React.FC<GiftWrapCustomizerProps> = ({
  giftWrap,
  onChange,
  currentTheme,
  selectedOccasion,
  selectedRibbon,
  onSelectOccasion,
}) => {
  return (
    <>
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
                onClick={() => onSelectOccasion(occKey)}
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

      {/* STEP 2: Ribbon selection & Carton Accent */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5 mb-2.5">
          <Layers size={14} className="text-amber-700" />
          2. Ruban Satin & Nœud Atelier
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {RIBBON_OPTIONS.map((ribbon) => {
            const isSelected = selectedRibbon.id === ribbon.id;
            return (
              <button
                key={ribbon.id}
                type="button"
                onClick={() => onChange({ ribbonColor: ribbon.id })}
                className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                  isSelected
                    ? 'bg-white border-2 border-amber-600 shadow-sm ring-1 ring-amber-400/40'
                    : 'bg-white/60 border-stone-200 hover:bg-white'
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full shrink-0 border border-black/10 shadow-xs"
                  style={{ backgroundColor: ribbon.hex }}
                />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-stone-800 block truncate">{ribbon.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 3: Recipient & Sender Names */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
            Nom du destinataire (Ex: Sarah, Maman...)
          </label>
          <input
            type="text"
            value={giftWrap.recipientName || ''}
            onChange={(e) => onChange({ recipientName: e.target.value })}
            placeholder="À l'attention de..."
            className="w-full px-4 py-2.5 bg-white/90 border border-stone-300/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-stone-900 shadow-xs"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
            Votre nom / Signature (Ex: Landry, Tes amies...)
          </label>
          <input
            type="text"
            value={giftWrap.senderName || ''}
            onChange={(e) => onChange({ senderName: e.target.value })}
            placeholder="De la part de..."
            className="w-full px-4 py-2.5 bg-white/90 border border-stone-300/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-stone-900 shadow-xs"
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
                className="p-2.5 rounded-xl border border-amber-200/80 bg-white/80 hover:bg-amber-100/70 text-left text-xs font-serif italic text-stone-800 leading-snug transition-all shadow-2xs hover:border-amber-400 group cursor-pointer"
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
              className="absolute top-3 right-3 text-[10px] uppercase font-bold text-stone-400 hover:text-rose-600 transition-colors bg-stone-100 hover:bg-rose-50 px-2 py-0.5 rounded-md cursor-pointer"
              title="Effacer le message pour en écrire un tout nouveau"
            >
              Effacer
            </button>
          )}
        </div>
      </div>
    </>
  );
};
