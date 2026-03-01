import React from 'react';
import { motion } from 'motion/react';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { BLOG_POSTS } from '../constants';
import { BlogPost } from '../types';

interface BlogIndexViewProps {
  onNavigate: (view: string, id?: string) => void;
}

export const BlogIndexView: React.FC<BlogIndexViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <span className="text-xs font-bold uppercase tracking-widest text-accent mb-2 block">Inspirations</span>
        <h1 className="text-5xl font-serif mb-4">Notre Blog</h1>
        <p className="text-primary/60 max-w-xl mx-auto">Découvrez nos conseils, tutoriels et les dernières tendances en matière de laine et décoration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {BLOG_POSTS.map((post, i) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group cursor-pointer"
            onClick={() => onNavigate('blog-post', post.id)}
          >
            <div className="aspect-[16/9] rounded-[2rem] overflow-hidden mb-6 shadow-lg">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-primary/40">
                <span className="text-accent">{post.category}</span>
                <div className="flex items-center gap-2"><Calendar size={14} /> {post.date}</div>
                <div className="flex items-center gap-2"><User size={14} /> {post.author}</div>
              </div>
              <h2 className="text-3xl font-serif group-hover:text-accent transition-colors">{post.title}</h2>
              <p className="text-primary/60 leading-relaxed">{post.excerpt}</p>
              <button className="inline-flex items-center font-bold text-primary group-hover:text-accent transition-colors">
                Lire la suite <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
};
