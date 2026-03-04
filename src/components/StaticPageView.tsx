import React from 'react';
import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';

interface StaticPageViewProps {
  title: string;
  content: React.ReactNode;
  onBack: () => void;
}

export const StaticPageView: React.FC<StaticPageViewProps> = ({ title, content, onBack }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 py-16"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-primary/60 hover:text-accent transition-colors mb-8 font-bold text-sm uppercase tracking-widest"
      >
        <ChevronLeft size={20} /> Retour
      </button>
      
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-12">{title}</h1>
      
      <div className="prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-primary prose-p:text-primary/70 prose-p:leading-relaxed">
        {content}
      </div>
    </motion.div>
  );
};
