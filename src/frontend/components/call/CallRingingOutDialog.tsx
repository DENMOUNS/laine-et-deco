import React from 'react';
import { Phone, PhoneOff } from 'lucide-react';

interface CallRingingOutDialogProps {
  onHangUp: () => void;
}

export const CallRingingOutDialog: React.FC<CallRingingOutDialogProps> = ({ onHangUp }) => {
  return (
    <div className="space-y-8 py-6">
      <div className="relative flex justify-center">
        {/* Pulsing circles animation */}
        <span className="animate-ping absolute inline-flex h-20 w-20 rounded-full bg-accent/20 opacity-75" />
        <span className="animate-pulse absolute inline-flex h-24 w-24 rounded-full bg-accent/5 opacity-50" />
        <div className="w-20 h-20 bg-accent text-white rounded-full flex items-center justify-center relative shadow-lg">
          <Phone className="animate-bounce" size={32} />
        </div>
      </div>
      <div>
        <p className="text-accent text-xs font-bold uppercase tracking-widest animate-pulse">Appel en cours...</p>
        <h3 className="font-serif text-2xl font-bold mt-2">Laine & Déco</h3>
        <p className="text-stone-400 text-xs mt-1">Sourcing & Conseil en ligne</p>
        <p className="text-amber-400/90 text-[11px] font-medium mt-3 bg-amber-500/10 py-1.5 px-3 rounded-full inline-block">
          Mise en relation avec le premier conseiller disponible...
        </p>
      </div>
      <button
        type="button"
        onClick={onHangUp}
        className="mx-auto w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors shadow-lg cursor-pointer"
        aria-label="Raccrocher"
      >
        <PhoneOff size={24} />
      </button>
    </div>
  );
};
