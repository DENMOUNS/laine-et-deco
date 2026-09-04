import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Sparkles, Check } from 'lucide-react';
import { GiftWrapOption, GiftOccasion } from '../../types';
import { 
  OccasionTheme, 
  OCCASION_THEMES, 
  RIBBON_OPTIONS, 
  RibbonOption 
} from './gift-wrap/occasionThemes';
import { GiftWrapCustomizer } from './gift-wrap/GiftWrapCustomizer';
import { GiftCardPreview } from './gift-wrap/GiftCardPreview';

// Re-export for existing callers
export type { OccasionTheme, RibbonOption };
export { OCCASION_THEMES, RIBBON_OPTIONS };

interface GiftWrapSectionProps {
  giftWrap: GiftWrapOption;
  onChange: (updated: Partial<GiftWrapOption>) => void;
  configuredFee?: number;
  className?: string;
}

export const GiftWrapSection: React.FC<GiftWrapSectionProps> = ({ 
  giftWrap, 
  onChange, 
  configuredFee = 2000, 
  className = '' 
}) => {
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
            className={`self-start sm:self-center shrink-0 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm cursor-pointer ${
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
              <GiftWrapCustomizer
                giftWrap={giftWrap}
                onChange={onChange}
                currentTheme={currentTheme}
                selectedOccasion={selectedOccasion}
                selectedRibbon={selectedRibbon}
                onSelectOccasion={selectOccasion}
              />

              <GiftCardPreview
                giftWrap={giftWrap}
                currentTheme={currentTheme}
                selectedRibbon={selectedRibbon}
                showPreview={showPreview}
                onTogglePreview={() => setShowPreview(!showPreview)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
