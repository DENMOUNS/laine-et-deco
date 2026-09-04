import React from 'react';
import { Phone } from 'lucide-react';

interface CallPromptNameDialogProps {
  callerNameInput: string;
  onCallerNameChange: (val: string) => void;
  onCancel: () => void;
  onInitiateCall: (name: string) => void;
}

export const CallPromptNameDialog: React.FC<CallPromptNameDialogProps> = ({
  callerNameInput,
  onCallerNameChange,
  onCancel,
  onInitiateCall,
}) => {
  return (
    <div className="space-y-6 py-4">
      <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto shadow-md">
        <Phone size={28} />
      </div>
      <div>
        <h3 className="font-serif text-xl font-bold">Appel Vocal Direct</h3>
        <p className="text-stone-400 text-xs mt-1.5 px-4 leading-relaxed">
          Échangez gratuitement et en direct avec Landry ou un conseiller de l'équipe pour vos questions de tricot et commandes.
        </p>
      </div>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Votre prénom ou nom"
          value={callerNameInput}
          onChange={(e) => onCallerNameChange(e.target.value)}
          className="w-full bg-stone-850 border border-stone-750 rounded-2xl py-3 px-4 text-center text-sm font-medium focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent text-white"
          maxLength={30}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-stone-800 hover:bg-stone-750 text-stone-300 font-semibold py-3 rounded-2xl text-xs transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={!callerNameInput.trim()}
            onClick={() => onInitiateCall(callerNameInput.trim())}
            className="flex-1 bg-accent hover:bg-accent-dark disabled:bg-stone-800 disabled:text-stone-500 text-white font-semibold py-3 rounded-2xl text-xs transition-colors shadow-md shadow-accent/20 cursor-pointer"
          >
            Appeler
          </button>
        </div>
      </div>
    </div>
  );
};
