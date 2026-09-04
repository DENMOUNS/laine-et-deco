import React from 'react';

export interface CheckoutStepsIndicatorProps {
  step: number;
}

const STEPS = [
  { id: 1, label: 'LIVRAISON' },
  { id: 2, label: 'PAIEMENT' },
  { id: 3, label: 'CONFIRMATION' },
];

export const CheckoutStepsIndicator: React.FC<CheckoutStepsIndicatorProps> = ({ step }) => {
  return (
    <div className="max-w-4xl mx-auto mb-20">
      <div className="relative flex justify-between">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-primary/10 -translate-y-1/2 -z-10" />
        {STEPS.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-3 bg-[#f8f5f0] px-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-serif text-base transition-all ${
                s.id === step
                  ? 'bg-accent text-white scale-110 shadow-lg shadow-accent/20'
                  : s.id < step
                  ? 'bg-[#5c5e46] text-white'
                  : 'bg-white border border-primary/10 text-primary/70'
              }`}
            >
              {s.id}
            </div>
            <span
              className={`text-[10px] font-bold tracking-[0.2em] transition-colors ${
                s.id === step ? 'text-accent' : 'text-primary/70'
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
