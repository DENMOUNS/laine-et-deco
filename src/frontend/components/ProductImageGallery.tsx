import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './ui/ImageWithFallback';
import { triggerHaptic } from '../utils/haptics';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  isSale?: boolean;
  className?: string;
}

/**
 * Galerie d'images interactive avec support du Touch Swipe natif (glisser au doigt)
 * Indicateurs de pagination doux et vignettes interactives
 */
export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  productName,
  isSale = false,
  className = ''
}) => {
  // S'assurer d'avoir au moins une image valide
  const validImages = images && images.length > 0 ? images : ['/placeholder.png'];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Synchroniser si la liste des images change
  useEffect(() => {
    if (currentIndex >= validImages.length) {
      setCurrentIndex(0);
    }
  }, [validImages.length, currentIndex]);

  const handleNext = () => {
    if (currentIndex < validImages.length - 1) {
      triggerHaptic('light');
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      triggerHaptic('light');
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSelect = (idx: number) => {
    if (idx !== currentIndex) {
      triggerHaptic('selection');
      setCurrentIndex(idx);
    }
  };

  return (
    <div className={`flex flex-col gap-4 select-none ${className}`}>
      {/* Zone de l'image principale avec glissement tactile (Drag/Swipe) */}
      <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-primary/5 shadow-inner group">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_e, { offset, velocity }) => {
              const swipeConfidenceThreshold = 10000;
              const swipePower = Math.abs(offset.x) * velocity.x;

              if (swipePower < -swipeConfidenceThreshold || offset.x < -50) {
                // Swipe vers la gauche -> Image suivante
                if (currentIndex < validImages.length - 1) {
                  handleNext();
                }
              } else if (swipePower > swipeConfidenceThreshold || offset.x > 50) {
                // Swipe vers la droite -> Image précédente
                if (currentIndex > 0) {
                  handlePrev();
                }
              }
            }}
            className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
          >
            <ImageWithFallback
              src={validImages[currentIndex]}
              alt={`${productName} - photo ${currentIndex + 1}`}
              className="w-full h-full object-cover pointer-events-none"
              width={800}
              height={800}
            />
          </motion.div>
        </AnimatePresence>

        {/* Badge Promo */}
        {isSale && (
          <span className="absolute top-4 left-4 z-10 bg-accent text-white px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">
            Promo
          </span>
        )}

        {/* Flèches de navigation rapide (visibles au survol sur desktop) */}
        {validImages.length > 1 && (
          <>
            {currentIndex > 0 && (
              <button
                type="button"
                aria-label="Image précédente"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/85 dark:bg-black/60 text-primary dark:text-white backdrop-blur-md shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all opacity-80 md:opacity-0 md:group-hover:opacity-100"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {currentIndex < validImages.length - 1 && (
              <button
                type="button"
                aria-label="Image suivante"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/85 dark:bg-black/60 text-primary dark:text-white backdrop-blur-md shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all opacity-80 md:opacity-0 md:group-hover:opacity-100"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </>
        )}

        {/* Indicateurs de pagination doux (Dots) pour mobile */}
        {validImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md">
            {validImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Aller à la photo ${idx + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(idx);
                }}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex
                    ? 'w-5 h-2 bg-white'
                    : 'w-2 h-2 bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Miniatures d'images sous l'affichage principal */}
      {validImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
          {validImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(idx)}
              className={`relative rounded-2xl overflow-hidden w-16 sm:w-20 aspect-square shrink-0 border-2 transition-all ${
                currentIndex === idx
                  ? 'border-accent ring-2 ring-accent/30 scale-95 shadow-md'
                  : 'border-transparent opacity-70 hover:opacity-100 hover:scale-95'
              }`}
            >
              <ImageWithFallback
                src={img}
                alt={`${productName} miniature ${idx + 1}`}
                className="w-full h-full object-cover"
                width={160}
                height={160}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
