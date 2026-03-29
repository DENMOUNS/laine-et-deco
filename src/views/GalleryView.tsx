import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, X } from 'lucide-react';

interface GalleryViewProps {
  onNavigate: (view: string) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ onNavigate }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('Tous');

  const filters = ['Tous', 'Atelier', 'Créations', 'Matières', 'Communauté'];

  const images = [
    { src: 'https://picsum.photos/seed/gal1/800/1200', category: 'Créations' },
    { src: 'https://picsum.photos/seed/gal2/1200/800', category: 'Atelier' },
    { src: 'https://picsum.photos/seed/gal3/800/800', category: 'Matières' },
    { src: 'https://picsum.photos/seed/gal4/1200/1200', category: 'Communauté' },
    { src: 'https://picsum.photos/seed/gal5/800/1000', category: 'Créations' },
    { src: 'https://picsum.photos/seed/gal6/1000/800', category: 'Atelier' },
    { src: 'https://picsum.photos/seed/gal7/800/1200', category: 'Matières' },
    { src: 'https://picsum.photos/seed/gal8/1200/800', category: 'Communauté' },
  ];

  const filteredImages = activeFilter === 'Tous' 
    ? images 
    : images.filter(img => img.category === activeFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-primary/40 mb-12">
        <button onClick={() => onNavigate('home')} className="hover:text-primary">Accueil</button>
        <ChevronRight size={14} />
        <span className="text-primary">Galerie</span>
      </nav>

      <div className="text-center mb-16">
        <h1 className="text-5xl font-serif text-primary mb-4">Notre Galerie</h1>
        <p className="text-primary/60 max-w-2xl mx-auto">Plongez dans notre univers. Découvrez les coulisses de notre atelier, nos matières premières et les magnifiques créations de notre communauté.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
              activeFilter === filter 
                ? 'bg-primary text-white shadow-lg' 
                : 'bg-secondary text-primary/60 hover:bg-primary/5'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <motion.div 
        layout
        className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredImages.map((img, idx) => (
            <motion.div 
              key={img.src}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="break-inside-avoid rounded-[2rem] overflow-hidden cursor-pointer group relative"
              onClick={() => setSelectedImage(img.src)}
            >
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-end p-6">
                <span className="text-white text-[10px] font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                  {img.category}
                </span>
              </div>
              <img 
                src={img.src} 
                alt={`Gallery ${idx}`} 
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" 
                referrerPolicy="no-referrer" 
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-primary/90 backdrop-blur-sm p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button 
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={32} />
            </button>
            <motion.img 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImage} 
              alt="Selected" 
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              referrerPolicy="no-referrer"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
