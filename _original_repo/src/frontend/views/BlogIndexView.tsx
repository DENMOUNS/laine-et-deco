import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Calendar, User, ArrowRight } from 'lucide-react';
import { BLOG_POSTS } from '../../constants';
import { Button } from '../components/ui/Button';

export const BlogIndexView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-widest mb-6"
        >
          <BookOpen size={14} />
          <span>Journal Créatif</span>
        </motion.div>
        <h1 className="text-5xl font-serif text-primary mb-6">Le Blog d'Atelier de Doleres</h1>
        <p className="text-primary/60 max-w-2xl mx-auto text-lg">
          Conseils, tutoriels, coulisses de création et inspirations pour votre quotidien créatif.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {BLOG_POSTS.map((post, index) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group bg-card rounded-[2.5rem] overflow-hidden border border-primary/5 shadow-sm hover:shadow-xl transition-all flex flex-col"
          >
            <div className="relative h-64 overflow-hidden">
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-6 left-6">
                <span className="px-4 py-2 bg-white/90 backdrop-blur-md text-primary text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                  {post.category}
                </span>
              </div>
            </div>
            
            <div className="p-8 flex-grow flex flex-col">
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-primary/40 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User size={12} />
                  <span>{post.author}</span>
                </div>
              </div>
              
              <h2 className="text-2xl font-serif text-primary mb-4 group-hover:text-accent transition-colors">
                {post.title}
              </h2>
              
              <p className="text-primary/60 text-sm mb-8 line-clamp-3 leading-relaxed">
                {post.excerpt}
              </p>
              
              <div className="mt-auto">
                <Button variant="ghost" className="p-0 text-accent font-bold hover:bg-transparent hover:text-accent/80 group/btn">
                  Lire la suite 
                  <ArrowRight size={16} className="ml-2 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      <div className="mt-24 bg-secondary/50 p-12 md:p-20 rounded-[4rem] text-center">
        <h2 className="text-3xl font-serif text-primary mb-6">Ne manquez aucun article</h2>
        <p className="text-primary/60 mb-10 max-w-xl mx-auto">
          Inscrivez-vous à notre newsletter pour recevoir nos derniers articles, tutoriels exclusifs et offres spéciales directement dans votre boîte mail.
        </p>
        <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
          <input 
            type="email" 
            placeholder="Votre adresse email" 
            className="flex-grow px-8 py-4 bg-white border-none rounded-2xl focus:ring-2 focus:ring-accent transition-all shadow-sm"
          />
          <Button variant="primary" className="rounded-2xl px-8 py-4">
            S'abonner
          </Button>
        </form>
      </div>
    </div>
  );
};
