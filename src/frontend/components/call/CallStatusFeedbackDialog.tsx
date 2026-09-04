import React from 'react';
import { ShieldAlert, PhoneOff } from 'lucide-react';

interface CallStatusFeedbackDialogProps {
  status: 'rejected' | 'ended';
}

export const CallStatusFeedbackDialog: React.FC<CallStatusFeedbackDialogProps> = ({ status }) => {
  if (status === 'rejected') {
    return (
      <div className="space-y-6 py-6 text-red-400">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert size={32} />
        </div>
        <div>
          <h3 className="font-serif text-xl font-bold">Ligne Occupée</h3>
          <p className="text-stone-400 text-xs mt-1.5">L'équipe n'est pas disponible pour le moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6 text-stone-400 animate-pulse">
      <div className="w-16 h-16 bg-stone-800 rounded-full flex items-center justify-center mx-auto">
        <PhoneOff size={28} />
      </div>
      <div>
        <h3 className="font-serif text-xl font-bold">Appel Terminé</h3>
        <p className="text-stone-500 text-xs mt-1.5">Merci de votre échange avec Laine & Déco.</p>
      </div>
    </div>
  );
};
