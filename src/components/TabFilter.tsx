import React from 'react';

interface TabFilterOption {
  id: string;
  label: string;
}

interface TabFilterProps {
  options: TabFilterOption[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export const TabFilter: React.FC<TabFilterProps> = ({ options, active, onChange, className = "" }) => (
  <div className={`flex flex-wrap gap-2 p-1 bg-slate-100 rounded-2xl w-fit ${className}`}>
    {options.map((opt) => (
      <button
        key={opt.id}
        onClick={() => onChange(opt.id)}
        className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
          active === opt.id 
            ? 'bg-white text-primary shadow-sm scale-105' 
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);
