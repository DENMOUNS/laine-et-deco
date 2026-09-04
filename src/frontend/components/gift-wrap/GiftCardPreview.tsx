import React from 'react';
import { motion } from 'motion/react';
import { Stamp } from 'lucide-react';
import { GiftWrapOption } from '../../../types';
import { OccasionTheme, RibbonOption } from './occasionThemes';

interface GiftCardPreviewProps {
  giftWrap: GiftWrapOption;
  currentTheme: OccasionTheme;
  selectedRibbon: RibbonOption;
  showPreview: boolean;
  onTogglePreview: () => void;
}

export const GiftCardPreview: React.FC<GiftCardPreviewProps> = ({
  giftWrap,
  currentTheme,
  selectedRibbon,
  showPreview,
  onTogglePreview,
}) => {
  const selectedOccasion = giftWrap.occasion || 'birthday';

  return (
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
          onClick={onTogglePreview}
          className="text-[11px] font-semibold text-amber-800 hover:underline cursor-pointer"
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

            {/* Footer & Signature with Wax Seal Mention */}
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
  );
};
