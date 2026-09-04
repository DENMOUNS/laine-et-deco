import React from 'react';
import { Phone, Check, X } from 'lucide-react';

interface CallRingingInDialogProps {
  incomingCall: { callerName: string };
  onRejectCall: () => void;
  onAnswerCall: () => void;
}

export const CallRingingInDialog: React.FC<CallRingingInDialogProps> = ({
  incomingCall,
  onRejectCall,
  onAnswerCall,
}) => {
  return (
    <div className="space-y-8 py-6">
      <div className="relative flex justify-center">
        <span className="animate-ping absolute inline-flex h-20 w-20 rounded-full bg-emerald-500/20 opacity-75" />
        <span className="animate-pulse absolute inline-flex h-24 w-24 rounded-full bg-emerald-500/5 opacity-50" />
        <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center relative shadow-lg">
          <Phone size={32} className="animate-pulse" />
        </div>
      </div>
      <div>
        <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest animate-pulse">Appel Vocal Entrant</p>
        <h3 className="font-serif text-2xl font-bold mt-2">{incomingCall.callerName}</h3>
        <p className="text-stone-400 text-xs mt-1">Conseil client en ligne</p>
      </div>
      <div className="flex justify-center gap-4">
        <button
          type="button"
          onClick={onRejectCall}
          className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors shadow-lg cursor-pointer"
          title="Refuser l'appel"
        >
          <X size={24} />
        </button>
        <button
          type="button"
          onClick={onAnswerCall}
          className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg cursor-pointer"
          title="Décrocher"
        >
          <Check size={24} />
        </button>
      </div>
    </div>
  );
};
