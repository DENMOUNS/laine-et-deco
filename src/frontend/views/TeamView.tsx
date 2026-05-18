import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Instagram, Linkedin, Sparkles, Heart, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../backend/firebase';
import { MemberPortfolio } from '../../types';

interface TeamViewProps {
  onNavigate?: (view: string) => void;
}

export const TeamView: React.FC<TeamViewProps> = ({ onNavigate }) => {
  const [teamMembers, setTeamMembers] = useState<MemberPortfolio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      setLoading(true);
      try {
        const ids = ['landry', 'doleres'];
        const members: MemberPortfolio[] = [];
        for (const id of ids) {
          const docRef = doc(db, 'member_portfolio', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            members.push({ id, ...docSnap.data() } as MemberPortfolio);
          }
        }
        setTeamMembers(members);
      } catch (error) {
        console.error("Error fetching team:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  if (loading) {
     return (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
     );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-widest mb-6"
        >
          <Heart size={14} />
          <span>Notre Duo Fondateur</span>
        </motion.div>
        <h1 className="text-5xl font-serif text-primary mb-6">Derrière chaque création</h1>
        <p className="text-primary/70 max-w-2xl mx-auto text-lg">
          Nous sommes un duo complémentaire, alliant technologie et gestion pour vous offrir la meilleure expérience artisanale.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-4xl mx-auto">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <div className="relative mb-8 aspect-[4/5] overflow-hidden rounded-[3rem] shadow-lg">
              <img 
                src={member.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80'} 
                alt={member.name} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                <div className="flex gap-4">
                  <a href={`mailto:${member.email}`} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-accent transition-colors">
                    <Mail size={18} />
                  </a>
                  {member.linkedin && (
                      <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-accent transition-colors">
                        <Linkedin size={18} />
                      </a>
                  )}
                </div>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-3xl font-serif text-primary mb-1">{member.name}</h3>
              <p className="text-accent font-bold uppercase tracking-widest text-[10px] mb-6">{member.role}</p>
              <p className="text-primary/70 text-sm leading-relaxed px-4 mb-8">
                {member.bio}
              </p>
              {member.externalPortfolioUrl && (
                <Button 
                  variant="outline"
                  onClick={() => window.open(member.externalPortfolioUrl, '_blank')}
                  className="rounded-full px-8 hover:bg-primary hover:text-white transition-all group-hover:border-primary"
                >
                  Voir le portfolio
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>


      <div className="mt-32 bg-secondary/30 p-12 md:p-20 rounded-[4rem] border border-primary/5 text-center">
        <Sparkles className="mx-auto text-accent mb-8" size={48} />
        <h2 className="text-4xl font-serif text-primary mb-6">Rejoignez l'aventure</h2>
        <p className="text-primary/70 text-lg mb-10 max-w-2xl mx-auto">
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
