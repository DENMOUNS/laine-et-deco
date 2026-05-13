import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export const SplashScreen: React.FC = () => {
  const [show, setShow] = useState(true);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    // Hide splash screen after 4.5 seconds (adjust based on video length)
    const timer = setTimeout(() => {
      setShow(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center"
      >
        {!videoError ? (
          <video 
            src="/logo.mp4" 
            autoPlay 
            muted 
            playsInline
            onError={() => setVideoError(true)}
            className="w-full max-w-sm sm:max-w-md md:max-w-lg h-auto object-contain px-8"
            onEnded={() => setShow(false)}
          />
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-center"
          >
             <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-primary">
                Atelier <span className="text-accent">de</span> Doleres
              </h1>
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-primary/60">
                Créativité & Passion
              </p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
