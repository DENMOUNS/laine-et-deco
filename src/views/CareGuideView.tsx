import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Droplets, Sun, Wind, Thermometer } from 'lucide-react';

interface CareGuideViewProps {
  onNavigate: (view: string) => void;
}

export const CareGuideView: React.FC<CareGuideViewProps> = ({ onNavigate }) => {
  const guides = [
    {
      title: 'Laine Mérinos & Alpaga',
      icon: <Droplets size={32} className="text-accent mb-4" />,
      content: [
        'Lavez toujours à la main à l\'eau froide (max 30°C).',
        'Utilisez une lessive douce spéciale laine, sans adoucissant.',
        'Ne tordez jamais la laine. Pressez doucement pour essorer.',
        'Séchez à plat sur une serviette éponge, à l\'abri du soleil direct.'
      ]
    },
    {
      title: 'Coton Bio & Macramé',
      icon: <Sun size={32} className="text-accent mb-4" />,
      content: [
        'Dépoussiérez régulièrement avec un plumeau ou un aspirateur à faible puissance.',
        'En cas de tache, nettoyez localement avec un savon doux et de l\'eau tiède.',
        'Pour les pièces lavables, utilisez un cycle délicat à 30°C maximum.',
        'Évitez le sèche-linge pour ne pas rétrécir les fibres.'
      ]
    },
    {
      title: 'Céramique & Décoration',
      icon: <Wind size={32} className="text-accent mb-4" />,
      content: [
        'Nettoyez avec un chiffon doux et légèrement humide.',
        'Évitez les chocs thermiques (ne pas passer de l\'eau très chaude à l\'eau très froide).',
        'Pour les vases, changez l\'eau régulièrement pour éviter les dépôts calcaires.',
        'Ne pas utiliser d\'éponges abrasives qui pourraient rayer l\'émail.'
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-primary/40 mb-12">
        <button onClick={() => onNavigate('home')} className="hover:text-primary">Accueil</button>
        <ChevronRight size={14} />
        <span className="text-primary">Guide d'entretien</span>
      </nav>

      <div className="text-center mb-16">
        <h1 className="text-5xl font-serif text-primary mb-4">Guide d'Entretien</h1>
        <p className="text-primary/60 max-w-2xl mx-auto">Prenez soin de vos créations et objets de décoration pour qu'ils durent toute une vie. Voici nos conseils d'experts pour chaque matière.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {guides.map((guide, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-[3rem] shadow-sm border border-primary/5 hover:shadow-xl transition-shadow"
          >
            <div className="flex justify-center">{guide.icon}</div>
            <h3 className="text-2xl font-serif text-primary text-center mb-6">{guide.title}</h3>
            <ul className="space-y-4">
              {guide.content.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-primary/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 bg-secondary/30 p-12 rounded-[3rem] text-center border border-primary/5">
        <Thermometer size={48} className="mx-auto text-primary/20 mb-6" />
        <h2 className="text-3xl font-serif text-primary mb-4">Une question spécifique ?</h2>
        <p className="text-primary/60 mb-8 max-w-xl mx-auto">Si vous avez un doute sur l'entretien d'un produit spécifique, n'hésitez pas à nous contacter. Notre équipe se fera un plaisir de vous conseiller.</p>
        <button 
          onClick={() => onNavigate('contact')}
          className="bg-primary text-white px-8 py-4 rounded-full font-bold hover:bg-accent transition-colors"
        >
          Nous contacter
        </button>
      </div>
    </div>
  );
};
