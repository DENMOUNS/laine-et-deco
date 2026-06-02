import React from 'react';
import { motion } from 'motion/react';
import { Heart, Compass, Sparkles, MessageCircle, ChevronRight, Users, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface AboutViewProps {
  onNavigate: (view: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-50/30 pb-20">
      {/* Hero Header */}
      <div className="bg-primary text-white pt-28 pb-20 px-4 rounded-b-[2.5rem] md:rounded-b-[4rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/15 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl -ml-10 -mb-10" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 text-accent-light rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-accent/20"
          >
            <Sparkles size={14} className="text-accent" />
            <span className="text-white">Laine & Déco</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-serif mb-6 leading-tight"
          >
            Notre Histoire & Notre Vision
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 max-w-2xl mx-auto text-base sm:text-lg md:text-xl font-light leading-relaxed"
          >
            Découvrez comment deux amis ont décidé de rendre la décoration intérieure accessible, originale et abordable au Cameroun.
          </motion.p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-10 md:-mt-14 relative z-20">
        <div className="space-y-12">
          
          {/* Main Story Card */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-xl border border-primary/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-2xl" />
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-accent/10 text-accent rounded-2xl">
                  <Heart size={24} />
                </div>
                <h2 className="text-2xl md:text-3xl font-serif text-primary">Notre histoire</h2>
              </div>
              
              <div className="space-y-6 text-primary/80 text-base md:text-lg leading-relaxed">
                <p>
                  <strong>Laine & Déco</strong> est née d'une idée simple : rendre la décoration intérieure accessible, originale et abordable. Ce projet, c'est le nôtre — celui de <strong>Landry et Dolères</strong>, deux amis qui ont décidé de transformer une passion commune en quelque chose de concret.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 mt-6 border-t border-primary/5">
                  <div className="bg-slate-50/50 p-6 rounded-2xl border border-primary/5 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center mb-4 text-accent font-bold">L</div>
                    <h3 className="font-serif text-lg text-primary mb-2">Landry</h3>
                    <p className="text-sm text-primary/70">
                      S'occupe de toute la partie technique : développement de la plateforme, gestion du site et innovation digitale pour rendre votre expérience d'achat fluide et sécurisée.
                    </p>
                  </div>
                  
                  <div className="bg-slate-50/50 p-6 rounded-2xl border border-primary/5 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center mb-4 text-accent font-bold">D</div>
                    <h3 className="font-serif text-lg text-primary mb-2">Dolères</h3>
                    <p className="text-sm text-primary/70">
                      Pilote l'organisation opérationnelle, coordonne la préparation des commandes et s'assure du parfait déroulement des opérations, du sourcing jusqu'à la livraison chez vous.
                    </p>
                  </div>
                </div>
                
                <p className="text-center italic text-primary/70 pt-4">
                  "Deux profils complémentaires, réunis par une vision commune."
                </p>
              </div>
            </div>
          </motion.div>

          {/* How it works Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-[2rem] p-8 md:p-10 shadow-lg border border-primary/5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary/5 text-primary rounded-xl">
                    <Compass size={20} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-serif text-primary">Comment ça marche</h2>
                </div>
                
                <p className="text-primary/80 text-sm md:text-base leading-relaxed mb-6">
                  On sélectionne nos produits directement en Chine — des pièces de décoration soigneusement choisies pour leur qualité, leur design et leur rapport qualité-prix. On s'occupe ensuite de tout : l'importation, la logistique, et la vente ici au Cameroun.
                </p>
                <p className="text-primary/80 text-sm md:text-base leading-relaxed">
                  <strong>Pas d'intermédiaire inutile.</strong> On sait exactement ce qu'on vous propose et pourquoi on le propose.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent">
                <ShieldCheck size={16} />
                <span>Qualité garantie sans intermédiaire</span>
              </div>
            </motion.div>

            {/* What we wanted to create */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-[2rem] p-8 md:p-10 shadow-lg border border-primary/5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-accent/10 text-accent rounded-xl">
                    <Sparkles size={20} />
                  </div>
                  <h2 className="text-xl md:text-2xl font-serif text-primary">Ce qu'on voulait créer</h2>
                </div>
                
                <p className="text-primary/80 text-sm md:text-base leading-relaxed mb-6">
                  Un endroit où trouver des articles de déco qui sortent de l'ordinaire, sans se ruiner. Quelque chose qu'on aurait aimé trouver nous-mêmes.
                </p>
                <p className="text-primary/80 text-sm md:text-base leading-relaxed">
                  Laine & Déco, c'est encore jeune, encore en construction — mais c'est sincère, et on y met énormément d'énergie et de cœur pour vous satisfaire au quotidien.
                </p>
              </div>
              
              <div className="mt-8">
                <button 
                  onClick={() => onNavigate('shop')}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:text-accent transition-colors"
                >
                  Découvrir nos produits <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Contact Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-primary rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent opacity-10 rounded-full blur-[100px] -mr-40 -mt-40" />
            
            <div className="relative z-10 text-center md:text-left max-w-xl">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <MessageCircle size={20} className="text-accent" />
                <span className="text-xs uppercase tracking-widest font-bold">Contact direct</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-serif mb-4">Envie de nous contacter ?</h2>
              <p className="text-white/70 text-sm md:text-base leading-relaxed">
                On est joignables directement via le chat en ligne ou WhatsApp. Pas de formulaire interminable, pas de robot. Juste nous deux, disponibles pour répondre personnellement à vos questions et vous guider.
              </p>
            </div>
            
            <div className="relative z-10 shrink-0 flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => onNavigate('contact')} 
                className="bg-accent text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl hover:bg-accent/90 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                Nous écrire
              </button>
              <button 
                onClick={() => onNavigate('team')} 
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Users size={18} /> Voir l'équipe
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};
