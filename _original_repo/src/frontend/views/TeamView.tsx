import React from 'react';
import { motion } from 'motion/react';
import { Mail, Instagram, Linkedin, Sparkles, Heart } from 'lucide-react';
import { Button } from '../components/ui/Button';

const TEAM_MEMBERS = [
  {
    id: '1',
    name: 'Landry',
    role: 'Fondateur & Artisan Créateur',
    bio: 'Passionné par l\'artisanat et le design, Landry est le cœur créatif de L\'Atelier de Doleres. Il sélectionne chaque produit et conçoit chaque objet avec une attention méticuleuse aux détails.',
    image: 'https://picsum.photos/seed/landry/400/500',
    socials: { instagram: '#', linkedin: '#', email: 'landrymouns@gmail.com' }
  },
  {
    id: '2',
    name: 'Doleres',
    role: 'Co-fondatrice & Experte Tricot',
    bio: 'Doleres apporte son expertise technique et sa passion pour le tricot. Elle anime nos ateliers et conseille nos clients sur le choix des matières pour leurs projets les plus ambitieux.',
    image: 'https://picsum.photos/seed/doleres/400/500',
    socials: { instagram: '#', linkedin: '#', email: 'doleres@laineetdeco.com' }
  },
  {
    id: '3',
    name: 'Sophie',
    role: 'Responsable Logistique & Clientèle',
    bio: 'Sophie veille à ce que chaque commande soit préparée avec soin et expédiée dans les meilleurs délais. Elle est votre interlocutrice privilégiée pour toute question sur vos achats.',
    image: 'https://picsum.photos/seed/sophie/400/500',
    socials: { instagram: '#', linkedin: '#', email: 'sophie@laineetdeco.com' }
  }
];

export const TeamView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-widest mb-6"
        >
          <Heart size={14} />
          <span>L'Équipe L & D</span>
        </motion.div>
        <h1 className="text-5xl font-serif text-primary mb-6">Derrière chaque création</h1>
        <p className="text-primary/60 max-w-2xl mx-auto text-lg">
          Nous sommes une petite équipe passionnée, dédiée à apporter une touche de douceur et d'élégance dans votre quotidien à travers l'artisanat.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {TEAM_MEMBERS.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <div className="relative mb-8 aspect-[4/5] overflow-hidden rounded-[3rem] shadow-lg">
              <img 
                src={member.image} 
                alt={member.name} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                <div className="flex gap-4">
                  <a href={`mailto:${member.socials.email}`} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-accent transition-colors">
                    <Mail size={18} />
                  </a>
                  <a href={member.socials.instagram} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-accent transition-colors">
                    <Instagram size={18} />
                  </a>
                  <a href={member.socials.linkedin} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-accent transition-colors">
                    <Linkedin size={18} />
                  </a>
                </div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-serif text-primary mb-1">{member.name}</h3>
              <p className="text-accent font-bold uppercase tracking-widest text-[10px] mb-4">{member.role}</p>
              <p className="text-primary/60 text-sm leading-relaxed px-4">
                {member.bio}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-32 bg-secondary/30 p-12 md:p-20 rounded-[4rem] border border-primary/5 text-center">
        <Sparkles className="mx-auto text-accent mb-8" size={48} />
        <h2 className="text-4xl font-serif text-primary mb-6">Rejoignez l'aventure</h2>
        <p className="text-primary/60 text-lg mb-10 max-w-2xl mx-auto">
          Nous sommes toujours à la recherche de nouveaux talents et de collaborations créatives. Vous êtes passionné par l'artisanat ?
        </p>
        <Button 
          variant="primary" 
          size="lg"
          className="rounded-full px-10 py-6 text-lg font-bold"
        >
          Contactez-nous
        </Button>
      </div>
    </div>
  );
};
