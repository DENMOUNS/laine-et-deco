import React from 'react';
import { motion } from 'motion/react';
import { Heart, MessageSquare, Share2, Camera, Plus } from 'lucide-react';
import { useEntity } from '../hooks/useEntity';
import { CommunityPost } from '../../types';
import { COMMUNITY_POSTS as INITIAL_POSTS } from '../../constants';
import { Button } from '../components/ui/Button';

interface CommunityGalleryViewProps {
  onNavigate: (view: string, id?: string) => void;
  user?: any;
}

export const CommunityGalleryView: React.FC<CommunityGalleryViewProps> = ({ onNavigate, user }) => {
  const { data: posts, isLoading } = useEntity<CommunityPost>('community_post', INITIAL_POSTS);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-serif text-primary">Galerie Communautaire</h1>
          <p className="text-primary/60 mt-4 text-lg max-w-2xl">
            Découvrez les magnifiques créations de nos clients et partagez vos propres projets tricot avec la communauté.
          </p>
        </div>
        <Button className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full hover:bg-accent transition-all shadow-xl">
          <Camera size={20} />
          Partager ma création
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all border border-primary/5"
          >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden cursor-pointer" onClick={() => onNavigate('shop', post.productsUsed?.[0])}>
              <img 
                src={post.image} 
                alt={post.description} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Heart size={24} fill="currentColor" />
                  <span>{post.likes}</span>
                </div>
                <div className="flex items-center gap-2 text-white font-bold">
                  <MessageSquare size={24} fill="currentColor" />
                  <span>12</span>
                </div>
              </div>
            </div>

            {/* Post Info */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <img 
                  src={post.userImage || `https://ui-avatars.com/api/?name=${post.userName}&background=random`} 
                  alt={post.userName} 
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary/5"
                />
                <span className="font-bold text-primary">{post.userName}</span>
              </div>
              <p className="text-sm text-primary/70 line-clamp-2 leading-relaxed italic">
                "{post.description}"
              </p>
              
              {/* Products Mentioned */}
              {post.productsUsed && post.productsUsed.length > 0 && (
                <div className="pt-4 border-t border-primary/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40 whitespace-nowrap">Produits :</span>
                  {post.productsUsed.map((pid) => (
                    <button
                      key={pid}
                      onClick={() => onNavigate('shop', pid)}
                      className="px-3 py-1 bg-primary/5 hover:bg-primary/10 rounded-full text-[10px] font-bold text-primary transition-colors whitespace-nowrap"
                    >
                      Voir le produit
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Add Post Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: posts.length * 0.1 }}
          className="flex flex-col items-center justify-center p-12 bg-primary/5 border-2 border-dashed border-primary/20 rounded-[2rem] hover:bg-primary/10 transition-colors cursor-pointer group"
        >
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary mb-6 shadow-sm group-hover:scale-110 transition-transform">
            <Plus size={32} />
          </div>
          <p className="font-bold text-primary">Publier votre projet</p>
          <p className="text-xs text-primary/40 mt-2 text-center">
            Inspirez les autres avec vos réalisations
          </p>
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left space-y-4">
            <h2 className="text-3xl md:text-5xl font-serif text-white">Rejoignez notre Atelier !</h2>
            <p className="text-white/60 max-w-md">
              Plus de 10 000 passionnés partagent déjà leurs créations. Pourquoi pas vous ?
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="px-10 py-4 bg-white text-primary rounded-full hover:bg-accent hover:text-white transition-all shadow-xl font-bold">
              Créer un profil
            </Button>
            <Button variant="outline" className="px-10 py-4 border-white/20 text-white hover:bg-white/10 rounded-full transition-all backdrop-blur-sm">
              En savoir plus
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
