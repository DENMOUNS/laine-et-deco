import React from 'react';
import { motion } from 'motion/react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { BlogPost } from '../../types';

export const HomeBlog: React.FC<{ posts: BlogPost[]; onNavigate: (v: string, id?: string) => void }> = ({ posts, onNavigate }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="flex justify-between items-end mb-16">
        <div><span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Inspiration</span><h2 className="text-4xl font-serif">Le Journal Créatif</h2></div>
        <button onClick={() => onNavigate('blog')} className="text-primary font-bold border-b-2 border-primary/20 hover:border-accent hover:text-accent transition-all pb-1">Lire tout</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {posts.map((post, i) => (
          <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group cursor-pointer" onClick={() => onNavigate('blog-post', post.id)}>
            <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] mb-6"><img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" /><div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-accent">{post.category}</div></div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-primary/40"><div className="flex items-center gap-1"><Calendar size={12} /><span>{post.date}</span></div><div className="flex items-center gap-1"><User size={12} /><span>{post.author}</span></div></div>
              <h3 className="text-2xl font-serif group-hover:text-accent transition-colors">{post.title}</h3>
              <p className="text-primary/60 line-clamp-2 text-sm leading-relaxed">{post.excerpt}</p>
              <span className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-primary group-hover:text-accent transition-colors">Lire la suite <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" /></span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
