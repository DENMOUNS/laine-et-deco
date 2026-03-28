import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Heart, Users, Leaf } from 'lucide-react';

interface AboutViewProps {
  onNavigate: (view: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-primary/40 mb-12">
        <button onClick={() => onNavigate('home')} className="hover:text-primary">Accueil</button>
        <ChevronRight size={14} />
        <span className="text-primary">À Propos</span>
      </nav>

      {/* Hero Section */}
      <div className="text-center mb-24">
        <h1 className="text-5xl md:text-7xl font-serif text-primary mb-6">Notre Histoire</h1>
        <p className="text-xl text-primary/60 max-w-3xl mx-auto leading-relaxed">
          Née d'une passion pour les matières nobles et le savoir-faire manuel, Laine & Déco est votre destination privilégiée pour l'artisanat authentique au Cameroun.
        </p>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-[3rem] overflow-hidden shadow-2xl aspect-square md:aspect-auto md:h-[600px]"
        >
          <img src="https://picsum.photos/seed/about1/800/1000" alt="Atelier" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </motion.div>
        <div className="flex flex-col justify-center space-y-8 md:pl-12">
          <h2 className="text-4xl font-serif text-primary">De l'idée à la création</h2>
          <p className="text-lg text-primary/70 leading-relaxed">
            Tout a commencé dans un petit atelier à Douala. L'envie de créer des objets uniques, chaleureux et durables nous a poussés à explorer les techniques traditionnelles du tricot, du crochet et du macramé.
          </p>
          <p className="text-lg text-primary/70 leading-relaxed">
            Aujourd'hui, nous collaborons avec des artisans talentueux pour vous proposer une sélection rigoureuse de laines naturelles, de céramiques faites main et d'accessoires de décoration qui ont une véritable âme.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="bg-secondary/30 rounded-[4rem] p-12 md:p-24 mb-32 border border-primary/5">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif text-primary">Nos Valeurs</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center text-accent shadow-lg">
              <Heart size={32} />
            </div>
            <h3 className="text-2xl font-serif text-primary">Passion</h3>
            <p className="text-primary/70">Chaque produit que nous sélectionnons ou créons est le fruit d'un amour véritable pour l'artisanat et les belles matières.</p>
          </div>
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center text-accent shadow-lg">
              <Leaf size={32} />
            </div>
            <h3 className="text-2xl font-serif text-primary">Éco-responsabilité</h3>
            <p className="text-primary/70">Nous privilégions les fibres naturelles, les teintures écologiques et les emballages recyclables pour minimiser notre impact.</p>
          </div>
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center text-accent shadow-lg">
              <Users size={32} />
            </div>
            <h3 className="text-2xl font-serif text-primary">Communauté</h3>
            <p className="text-primary/70">Nous soutenons les artisans locaux et créons des liens forts avec notre communauté de créateurs passionnés.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
