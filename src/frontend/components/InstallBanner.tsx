import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from './ui/Button';
import { toast } from 'sonner';

interface InstallBannerProps {
  showInstallBanner: boolean;
  setShowInstallBanner: (show: boolean) => void;
}

export const InstallBanner: React.FC<InstallBannerProps> = ({ showInstallBanner, setShowInstallBanner }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Native PWA prompt available (Chrome / Android / Edge)
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        toast.success("Installation de l'application en cours...");
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
      return;
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS) {
      toast.info("Sur iPhone / iPad : touchez l'icône Partager (carré avec flèche) puis 'Sur l'écran d'accueil'.", {
        duration: 6000,
      });
    } else {
      toast.info("Ouvrez le menu de votre navigateur (⋮) et choisissez 'Installer l'application' ou 'Ajouter à l'écran d'accueil'.", {
        duration: 6000,
      });
    }
  };

  return (
    <AnimatePresence>
      {showInstallBanner && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-primary/95 backdrop-blur-xl text-white md:hidden overflow-hidden border-b border-white/10"
        >
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center shadow-inner">
                <Smartphone size={20} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight">Laine et Déco App</p>
                <p className="text-[10px] text-white/80">Accès rapide & expérience fluide</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                aria-label="Installer l'application"
                onClick={handleInstallClick}
                className="text-xs font-bold bg-white text-primary hover:bg-white/90 px-3.5 py-1.5 rounded-full h-auto shadow-md"
              >
                Installer
              </Button>
              <button
                type="button"
                aria-label="Fermer la bannière d'installation"
                onClick={() => setShowInstallBanner(false)}
                className="text-white/70 hover:text-white p-1.5 transition-colors rounded-full"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
