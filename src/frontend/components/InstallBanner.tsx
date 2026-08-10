import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X } from 'lucide-react';
import { Button } from './ui/Button';
import { toast } from 'sonner';

interface InstallBannerProps {
  showInstallBanner: boolean;
  setShowInstallBanner: (show: boolean) => void;
}

export const InstallBanner: React.FC<InstallBannerProps> = ({ showInstallBanner, setShowInstallBanner }) => {
  const handleInstallClick = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS) {
      toast.info("Sur iOS : appuyez sur le bouton de partage de votre navigateur, puis 'Sur l'écran d'accueil'.");
    } else {
      toast.info("Pour installer Laine et Déco, ouvrez le menu de votre navigateur (Chrome/Safari) et sélectionnez 'Installer l'application' ou 'Ajouter à l'écran d'accueil'.");
    }
  };

  return (
    <AnimatePresence>
      {showInstallBanner && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-primary text-white md:hidden overflow-hidden"
        >
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Download size={20} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-bold">Laine et Déco App</p>
                <p className="text-[10px] text-white">Profitez d'une meilleure expérience</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                aria-label="Installer l'application"
                onClick={handleInstallClick}
                className="text-xs font-bold bg-white text-primary px-4 py-2 rounded-full h-auto"
              >
                Installer
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Fermer la bannière d'installation"
                onClick={() => setShowInstallBanner(false)}
                className="text-white hover:text-white"
              >
                <X size={20} aria-hidden="true" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
