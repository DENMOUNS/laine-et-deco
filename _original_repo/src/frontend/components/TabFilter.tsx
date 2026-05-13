import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../utils/utils';

interface TabOption {
  id: string;
  label: string;
}

interface TabFilterProps {
  options: TabOption[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export const TabFilter: React.FC<TabFilterProps> = ({
  options,
  active,
  onChange,
  className
}) => {
  return (
    <div className={cn("flex flex-wrap gap-2 p-1 bg-secondary/50 rounded-2xl w-fit", className)}>
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            "relative px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors z-10",
            active === option.id ? "text-white" : "text-primary/40 hover:text-primary"
          )}
        >
          {active === option.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-primary rounded-xl -z-10 shadow-lg shadow-primary/20"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          {option.label}
        </button>
      ))}
    </div>
  );
};
