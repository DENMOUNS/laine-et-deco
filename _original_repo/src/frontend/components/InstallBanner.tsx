import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X } from 'lucide-react';
import { Button } from './ui/Button';

interface InstallBannerProps {
  showInstallBanner: boolean;
  setShowInstallBanner: (show: boolean) => void;
}

export const InstallBanner: React.FC<InstallBannerProps> = ({ showInstallBanner, setShowInstallBanner }) => {
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
                <p className="text-sm font-bold">Atelier de Doleres App</p>
                <p className="text-[10px] text-white/60">Profitez d'une meilleure expérience</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="secondary"
                size="sm"
                className="text-xs font-bold bg-white text-primary px-4 py-2 rounded-full h-auto"
              >
                Installer
              </Button>
              <Button 
                variant="ghost"
                size="icon"
                onClick={() => setShowInstallBanner(false)} 
                className="text-white/40 hover:text-white"
              >
                <X size={20} />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
