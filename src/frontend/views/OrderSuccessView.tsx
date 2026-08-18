import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../../i18n';

interface OrderSuccessViewProps {
  onNavigate: (view: string, id?: string) => void;
}

export const OrderSuccessView: React.FC<OrderSuccessViewProps> = ({ onNavigate }) => {
  const { isEn } = useTranslation();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full text-center"
      >
        <div className="mb-8 relative inline-block">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-green-200"
          >
            <CheckCircle size={48} className="text-white" />
          </motion.div>
          
          {/* Decorative particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.2, 0], 
                opacity: [0, 1, 0],
                x: Math.cos(i * 60 * (Math.PI / 180)) * 60,
                y: Math.sin(i * 60 * (Math.PI / 180)) * 60
              }}
              transition={{ delay: 0.5 + i * 0.1, duration: 1, repeat: Infinity, repeatDelay: 2 }}
              className="absolute top-1/2 left-1/2 w-2 h-2 bg-accent rounded-full"
            />
          ))}
        </div>

        <h1 className="text-5xl font-serif font-bold text-primary mb-4">
          {isEn ? 'Congratulations!' : 'Félicitations !'}
        </h1>
        
        <p className="text-xl text-primary/70 mb-12 font-serif italic">
          {isEn 
            ? 'Your order has been successfully validated. Thank you for your trust!' 
            : 'Votre commande a été validée avec succès. Merci de votre confiance !'}
        </p>

        <div className="bg-white p-8 rounded-[3rem] border border-primary/5 shadow-sm mb-12 space-y-4">
          <div className="flex items-start gap-4 text-left">
            <div className="p-3 bg-secondary rounded-2xl text-accent">
              <Package size={24} />
            </div>
            <div>
              <h3 className="font-bold text-primary">
                {isEn ? 'Preparation in progress' : 'Préparation en cours'}
              </h3>
              <p className="text-sm text-primary/70">
                {isEn 
                  ? 'Our team is already handling your package. You will receive an email as soon as it is shipped.' 
                  : "Notre équipe s'occupe déjà de votre colis. Vous recevrez un email dès qu'il sera expédié."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="primary" 
            className="px-10 py-6 rounded-2xl text-lg flex items-center gap-3 group"
            onClick={() => onNavigate('customer-dashboard', 'orders')}
          >
            {isEn ? 'View Order' : 'Consulter la commande'}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            variant="outline" 
            className="px-10 py-6 rounded-2xl text-lg flex items-center gap-3"
            onClick={() => onNavigate('home')}
          >
            <Home size={20} />
            {isEn ? 'Return to Home' : "Retour à l'accueil"}
          </Button>
        </div>

        <p className="mt-12 text-xs text-primary/70 uppercase tracking-[0.2em] font-bold italic">
          {isEn 
            ? 'Laine et Déco — Yarn, Hooks, Needles, Accessories & Tech' 
            : 'Laine et Déco — Laine, Crochets, Aiguilles, Accessoires & Tech'}
        </p>
      </motion.div>
    </div>
  );
};
