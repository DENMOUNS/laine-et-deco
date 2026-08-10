import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Share2, Tag, Clock, User, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useEntityLazy } from '../hooks/useEntityLazy';
import { useEntity } from '../hooks/useEntity';
import type { BlogPost } from '../../types';

interface BlogPostViewProps {
  postId: string;
  onNavigate?: (view: string, id?: string, query?: string) => void;
}

export const BlogPostView: React.FC<BlogPostViewProps> = ({ postId, onNavigate }) => {
  const { data: post, isLoading, error, fetchEntity } = useEntityLazy<BlogPost>('blog_post');
  const { data: BLOG_POSTS } = useEntity<BlogPost>('blog_post', [], { enabled: true });
  const [readingProgress, setReadingProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (postId) fetchEntity(postId);
  }, [postId]);

  useEffect(() => {
    const onScroll = () => {
      const el = contentRef.current;
      if (!el) return setReadingProgress(0);
      const rect = el.getBoundingClientRect();
      const winH = window.innerHeight || document.documentElement.clientHeight;
      const total = rect.height - winH;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 0));
      const progress = total > 0 ? Math.round((scrolled / total) * 100) : rect.top < 0 ? 100 : 0;
      setReadingProgress(progress);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [post]);

  const share = async () => {
    const url = window.location.href;
    const title = post?.title || 'Article';
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Lien copié dans le presse-papiers');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20">
        <div className="h-6 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-full mb-6 animate-pulse" />
        <div className="h-64 bg-card rounded-2xl mb-6 animate-pulse" />
        <div className="space-y-4">
          <div className="h-4 bg-secondary/20 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-secondary/20 rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-secondary/20 rounded w-2/3 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) return <div className="max-w-4xl mx-auto px-4 py-24 text-center">Erreur: {error.message}</div>;
  if (!post) return <div className="max-w-4xl mx-auto px-4 py-24 text-center">Article introuvable.</div>;

  const related = (BLOG_POSTS || []).filter(p => p.id !== post.id).slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="fixed left-0 top-0 h-1 w-full z-50 bg-transparent">
        <div className="h-1 bg-accent transition-all" style={{ width: `${readingProgress}%` }} />
      </div>

      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" onClick={() => onNavigate?.('blog')}>
          <ArrowLeft size={16} className="mr-2 inline" /> Retour
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={share} className="flex items-center gap-2">
            <Share2 size={16} /> Partager
          </Button>
        </div>
      </div>

      <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-3xl overflow-hidden shadow-md border border-primary/5">
        {post.image && (
          <div className="relative w-full h-72 sm:h-96 md:h-[40rem] overflow-hidden">
            <motion.img src={post.image} alt={post.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" initial={{ scale: 1.05 }} animate={{ scale: 1 }} transition={{ duration: 1.2 }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute left-6 bottom-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-4 py-1 bg-white/12 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-widest">{post.category}</span>
                <div className="text-sm text-white/80 flex items-center gap-3">
                  <span className="flex items-center gap-1"><Clock size={12} /> {post.date}</span>
                  <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif leading-tight max-w-3xl drop-shadow-lg">{post.title}</h1>
            </div>
          </div>
        )}
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
        <main className="lg:col-span-2">
          <motion.div ref={contentRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="prose prose-lg max-w-none text-primary/90 bg-transparent leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </motion.div>

          <div className="mt-12 flex items-center gap-4">
            <div className="flex items-center gap-2 text-primary/70">
              <Tag size={14} />
              {post.tags?.map((t, i) => (
                <span key={i} className="text-sm px-3 py-1 bg-secondary/20 rounded-full text-primary/90">{t}</span>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <Button variant="secondary" onClick={() => window.open(window.location.href, '_blank')}>
                <ExternalLink size={14} className="mr-2" /> Ouvrir
              </Button>
              <Button variant="primary" onClick={share}>
                <Share2 size={14} /> Partager
              </Button>
            </div>
          </div>
        </main>

        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-card p-6 rounded-2xl border border-primary/5 shadow-sm sticky top-24">
            <h4 className="font-bold text-primary mb-3">À propos de l'auteur</h4>
            <p className="text-sm text-primary/80 mb-4">{post.authorBio || 'Auteur(e) Laine et Déco'}</p>
            <div className="flex gap-2">
              <Button variant="ghost">Suivre</Button>
              <Button variant="outline">Contacter</Button>
            </div>
          </div>

          {related.length > 0 && (
            <div className="bg-card p-4 rounded-2xl border border-primary/5 shadow-sm">
              <h4 className="font-bold text-primary mb-4">Articles liés</h4>
              <div className="space-y-3">
                {related.map(r => (
                  <a key={r.id} href={`/blog/${r.id}`} className="flex items-center gap-3">
                    <img src={r.image} alt={r.title} className="w-20 h-14 object-cover rounded-md" referrerPolicy="no-referrer" />
                    <div>
                      <div className="text-sm font-semibold text-primary">{r.title}</div>
                      <div className="text-xs text-primary/70">{r.date} • {r.author}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
