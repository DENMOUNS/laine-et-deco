import React from 'react';
import { motion } from 'motion/react';
import { Award, Truck, HeartHandshake, ShieldCheck, Gift } from 'lucide-react';

export const HeroTrustWidget: React.FC<{ onNavigate?: (route: string) => void }> = ({ onNavigate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="hidden lg:flex flex-col gap-4 bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-white max-w-sm ml-auto"
    >
      {/* En-tête du Widget */}
      <div className="flex items-center gap-3 pb-3 border-b border-white/15">
        <div className="p-2.5 rounded-2xl bg-accent/20 text-accent border border-accent/30 shadow-inner">
          <Award size={20} />
        </div>
        <div>
          <h4 className="font-serif text-base font-bold tracking-wide">L'Excellence Artisanale</h4>
          <p className="text-[11px] text-slate-300 font-medium">Pourquoi nous faire confiance</p>
        </div>
      </div>

      {/* Liste des Avantages clés */}
      <div className="space-y-3.5 pt-1">
        <div className="flex items-start gap-3 group">
          <div className="p-2 rounded-xl bg-white/10 text-accent shrink-0 group-hover:scale-110 transition-transform">
            <Truck size={18} />
          </div>
          <div>
            <h5 className="text-xs font-bold">Livraison Rapide & Offerte</h5>
            <p className="text-[11px] text-slate-300">Expédition sous 24/48h • Gratuite dès 50€</p>
          </div>
        </div>

        <div className="flex items-start gap-3 group">
          <div className="p-2 rounded-xl bg-white/10 text-accent shrink-0 group-hover:scale-110 transition-transform">
            <HeartHandshake size={18} />
          </div>
          <div>
            <h5 className="text-xs font-bold">Laines 100% Qualité Premium</h5>
            <p className="text-[11px] text-slate-300">Fibres naturelles tricotées avec amour</p>
          </div>
        </div>

        <div className="flex items-start gap-3 group">
          <div className="p-2 rounded-xl bg-white/10 text-accent shrink-0 group-hover:scale-110 transition-transform">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h5 className="text-xs font-bold">Paiement 100% Sécurisé</h5>
            <p className="text-[11px] text-slate-300">Carte, PayPal, Apple Pay & Mobile Money</p>
          </div>
        </div>
      </div>

      {/* Offre Spéciale Cadeau de Bienvenue */}
      <div className="mt-2 p-3.5 rounded-2xl bg-gradient-to-r from-accent/25 to-primary/30 border border-accent/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Gift size={20} className="text-accent shrink-0 animate-bounce" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent block">Offre de Bienvenue</span>
            <span className="text-xs font-semibold">1 Patron offert dès 100.000FR</span>
          </div>
        </div>
        {onNavigate && (
          <button
            onClick={() => onNavigate('shop')}
            className="text-[11px] font-bold bg-white text-slate-900 px-3 py-1.5 rounded-xl hover:bg-accent hover:text-white transition-colors"
          >
            En profiter
          </button>
        )}
      </div>
    </motion.div>
  );
};
