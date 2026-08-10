import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Droplets, Sun, Wind, Heart, Sparkles } from 'lucide-react';

export const CareGuideView: React.FC = () => {
  const guides = [
    {
      title: "Entretien de la Laine",
      icon: <Heart className="text-accent" />,
      tips: [
        {
          title: "Lavage à la main",
          description: "Privilégiez toujours un lavage à la main à l'eau tiède (max 30°C) avec une lessive spéciale laine.",
          icon: <Droplets size={20} />
        },
        {
          title: "Séchage à plat",
          description: "Ne tordez jamais vos ouvrages. Essorez-les délicatement dans une serviette et laissez-les sécher à plat.",
          icon: <Wind size={20} />
        },
        {
          title: "Éviter le soleil",
          description: "Faites sécher vos pièces à l'ombre pour préserver l'éclat des couleurs naturelles.",
          icon: <Sun size={20} />
        }
      ]
    },
    {
      title: "Entretien de la Déco (Jesmonite/Résine)",
      icon: <Sparkles className="text-accent" />,
      tips: [
        {
          title: "Nettoyage doux",
          description: "Utilisez un chiffon doux et humide pour enlever la poussière. Évitez les produits chimiques agressifs.",
          icon: <ShieldCheck size={20} />
        },
        {
          title: "Protection des surfaces",
          description: "Bien que résistants, évitez les chocs violents qui pourraient écailler les bords de vos objets.",
          icon: <ShieldCheck size={20} />
        },
        {
          title: "Usage alimentaire",
          description: "Nos objets en Jesmonite sont décoratifs. Ne les utilisez pas pour un contact direct avec des aliments humides.",
          icon: <Droplets size={20} />
        }
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-widest mb-6"
        >
          <ShieldCheck size={14} />
          <span>Guide d'Entretien</span>
        </motion.div>
        <h1 className="text-5xl font-serif text-primary mb-6">Prendre soin de vos trésors</h1>
        <p className="text-primary/70 max-w-2xl mx-auto text-lg">
          Chaque pièce de Laine et Déco est unique et mérite une attention particulière pour durer dans le temps.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {guides.map((guide, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card p-10 md:p-16 rounded-[3rem] border border-primary/5 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                {guide.icon}
              </div>
              <h2 className="text-3xl font-serif text-primary">{guide.title}</h2>
            </div>

            <div className="space-y-8">
              {guide.tips.map((tip, i) => (
                <div key={i} className="flex gap-6">
                  <div className="flex-shrink-0 w-10 h-10 bg-secondary/50 rounded-xl flex items-center justify-center text-primary/70">
                    {tip.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-2">{tip.title}</h3>
                    <p className="text-primary/70 text-sm leading-relaxed">
                      {tip.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 bg-primary p-12 md:p-20 rounded-[4rem] text-white text-center">
        <h2 className="text-3xl font-serif mb-6">Une question spécifique ?</h2>
        <p className="text-white/70 mb-10 max-w-xl mx-auto">
          Si vous avez un doute sur l'entretien d'un produit particulier, n'hésitez pas à nous contacter. Nous sommes là pour vous aider.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <div className="px-8 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
            <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">Email</p>
            <p className="font-medium">contact@laineetdeco.com</p>
          </div>
          <div className="px-8 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
            <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">WhatsApp</p>
            <p className="font-medium">+237 6XX XXX XXX</p>
          </div>
        </div>
      </div>
    </div>
  );
};
