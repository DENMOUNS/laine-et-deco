import React from 'react';
import { motion } from 'motion/react';
import { Package, Truck, ShieldCheck, Heart } from 'lucide-react';

export const HomeFeatures: React.FC = () => {
  const features = [
    { icon: <Package size={32} />, title: "Qualité Premium", desc: "Laines 100% naturelles" },
    { icon: <Truck size={32} />, title: "Livraison Rapide", desc: "Offerte dès 50€ d'achat" },
    { icon: <ShieldCheck size={32} />, title: "Paiement Sécurisé", desc: "Transaction 100% protégée" },
    { icon: <Heart size={32} />, title: "Fait avec Amour", desc: "Sélection artisanale" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center text-center p-6 sm:p-8 bg-white rounded-3xl shadow-sm border border-primary/5"
          >
            <div className="text-accent mb-4">{feature.icon}</div>
            <h3 className="font-serif text-base sm:text-lg mb-2">{feature.title}</h3>
            <p className="text-[10px] sm:text-sm text-primary/60">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
