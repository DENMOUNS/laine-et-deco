import React from 'react';
import { motion } from 'motion/react';

export const TeamView: React.FC = () => {
  const team = [
    { name: 'Landry M.', role: 'Fondateur', image: 'https://picsum.photos/seed/team1/400/400' },
    { name: 'Sophie L.', role: 'Directrice Artistique', image: 'https://picsum.photos/seed/team2/400/400' },
    { name: 'Marc D.', role: 'Responsable Logistique', image: 'https://picsum.photos/seed/team3/400/400' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-5xl font-serif text-center mb-16">Notre Équipe</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {team.map((member, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <img src={member.image} alt={member.name} className="w-48 h-48 rounded-full mx-auto mb-6 object-cover shadow-lg" referrerPolicy="no-referrer" />
            <h2 className="text-2xl font-bold text-primary">{member.name}</h2>
            <p className="text-accent font-bold uppercase tracking-widest text-xs mt-2">{member.role}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
