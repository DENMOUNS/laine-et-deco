import React from 'react';
import { motion } from 'motion/react';

export const YarnLoadingBanner: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-8 flex flex-col sm:flex-row items-center gap-6 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/15 shadow-2xl max-w-2xl"
    >
      {/* SVG Animé de la Pelote de Laine qui roule et oscille */}
      <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
        <motion.svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-[0_8px_20px_rgba(214,180,163,0.5)]"
          animate={{ rotate: [0, 6, -6, 0], y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          {/* Ombre portée dynamique sous la pelote */}
          <ellipse cx="60" cy="110" rx="35" ry="6" fill="#000000" opacity="0.35" />

          {/* Pelote de laine principale (sphère) */}
          <circle cx="60" cy="60" r="42" fill="url(#yarnGradientModal)" />

          {/* Stries et relief des fils de la pelote */}
          <path
            d="M30 45 C45 25, 75 25, 90 45"
            fill="none"
            stroke="#e8d5cc"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M22 60 C40 38, 80 38, 98 60"
            fill="none"
            stroke="#f5ebe6"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d="M26 75 C45 92, 75 92, 94 75"
            fill="none"
            stroke="#d6b4a3"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M45 20 C25 45, 25 75, 45 100"
            fill="none"
            stroke="#cbb3a3"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M75 20 C95 45, 95 75, 75 100"
            fill="none"
            stroke="#f5ebe6"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* Aiguille à tricoter en décoration */}
          <line x1="15" y1="15" x2="105" y2="105" stroke="#d6b4a3" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          <circle cx="15" cy="15" r="4" fill="#d6b4a3" opacity="0.8" />

          <defs>
            <linearGradient id="yarnGradientModal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e8c5b5" />
              <stop offset="50%" stopColor="#d6b4a3" />
              <stop offset="100%" stopColor="#8a614d" />
            </linearGradient>
          </defs>
        </motion.svg>
      </div>

      {/* Message de chargement et fil ondulé */}
      <div className="flex-1 space-y-2 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
          <h3 className="text-base sm:text-lg font-bold tracking-wide text-accent">
            Chargement de l'univers Laine & Déco...
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
          Veuillez patienter un instant pendant que nos plus belles bannières et créations se déroulent.
        </p>

        {/* Animation du fil de laine ondulé qui se déroule */}
        <div className="w-full h-4 overflow-hidden relative pt-1">
          <svg viewBox="0 0 300 20" className="w-full h-full">
            <motion.path
              d="M 0 10 Q 25 2, 50 10 T 100 10 T 150 10 T 200 10 T 250 10 T 300 10"
              fill="none"
              stroke="#d6b4a3"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="12 6"
              animate={{ strokeDashoffset: [0, -72] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};
