import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

interface StaticPageViewProps {
  title: string;
  content: React.ReactNode;
  onBack: () => void;
}

export const StaticPageView: React.FC<StaticPageViewProps> = ({ title, content, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-primary/70 hover:text-primary transition-colors mb-8 font-medium"
      >
        <ArrowLeft size={20} />
        Retour
      </button>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-primary/5"
      >
        <h1 className="text-4xl font-serif font-bold text-primary mb-8">{title}</h1>
        <div className="prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-primary prose-p:text-primary/80 prose-a:text-accent hover:prose-a:underline">
          {content}
        </div>
      </motion.div>
    </div>
  );
};
