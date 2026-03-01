import React from 'react';
import { motion } from 'motion/react';
import { Calendar, User, ArrowLeft, Share2, Facebook, Twitter, Instagram } from 'lucide-react';
import { BLOG_POSTS } from '../constants';
import { BlogPost } from '../types';

interface BlogPostViewProps {
  postId: string;
  onNavigate: (view: string) => void;
}

export const BlogPostView: React.FC<BlogPostViewProps> = ({ postId, onNavigate }) => {
  const post = BLOG_POSTS.find(p => p.id === postId);

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl font-serif mb-4">Article non trouvé</h2>
        <button onClick={() => onNavigate('blog')} className="text-accent font-bold underline">Retour au blog</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => onNavigate('blog')}
        className="flex items-center gap-2 text-primary/40 hover:text-primary font-bold text-xs uppercase tracking-widest mb-12 transition-colors"
      >
        <ArrowLeft size={16} /> Retour au blog
      </button>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        <div className="text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-accent block">{post.category}</span>
          <h1 className="text-5xl md:text-6xl font-serif text-primary leading-tight">{post.title}</h1>
          <div className="flex items-center justify-center gap-8 text-sm font-bold uppercase tracking-widest text-primary/40">
            <div className="flex items-center gap-2"><Calendar size={16} /> {post.date}</div>
            <div className="flex items-center gap-2"><User size={16} /> {post.author}</div>
          </div>
        </div>

        <div className="aspect-[16/9] rounded-[3rem] overflow-hidden shadow-2xl">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="prose prose-lg max-w-none text-primary/70 leading-relaxed font-serif space-y-6">
          {post.content.split('\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>
          <blockquote className="border-l-4 border-accent pl-8 py-4 italic text-primary font-serif text-2xl">
            "La création est une porte ouverte sur l'imaginaire, un fil qui relie nos mains à nos rêves."
          </blockquote>
          <p>
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.
          </p>
        </div>

        <div className="pt-12 border-t border-primary/10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              {post.author[0]}
            </div>
            <div>
              <p className="text-sm font-bold text-primary">{post.author}</p>
              <p className="text-xs text-primary/40">Rédactrice passionnée</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-widest text-primary/40">Partager</span>
            <div className="flex gap-2">
              <button className="p-3 rounded-full bg-secondary text-primary hover:bg-accent hover:text-white transition-colors"><Facebook size={18} /></button>
              <button className="p-3 rounded-full bg-secondary text-primary hover:bg-accent hover:text-white transition-colors"><Twitter size={18} /></button>
              <button className="p-3 rounded-full bg-secondary text-primary hover:bg-accent hover:text-white transition-colors"><Instagram size={18} /></button>
              <button className="p-3 rounded-full bg-secondary text-primary hover:bg-accent hover:text-white transition-colors"><Share2 size={18} /></button>
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  );
};
