import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface CartAnimationProps {
  cartCount: number;
}

export const CartAnimation: React.FC<CartAnimationProps> = ({ cartCount }) => {
  const [animations, setAnimations] = useState<{ id: number }[]>([]);
  const [prevCount, setPrevCount] = useState(cartCount);

  useEffect(() => {
    if (cartCount > prevCount) {
      // Trigger animation
      const id = Date.now();
      setAnimations(prev => [...prev, { id }]);
      
      // Cleanup after animation completes
      setTimeout(() => {
        setAnimations(prev => prev.filter(anim => anim.id !== id));
      }, 1500);
    }
    setPrevCount(cartCount);
  }, [cartCount, prevCount]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {animations.map((anim) => (
          <motion.div
            key={anim.id}
            initial={{ 
              x: '50vw', 
              y: '80vh', 
              scale: 0.5, 
              opacity: 0,
              rotate: 0 
            }}
            animate={{ 
              x: 'calc(100vw - 80px)', // roughly where the cart icon is on desktop
              y: '30px', 
              scale: [0.5, 1.5, 1], 
              opacity: [0, 1, 1, 0],
              rotate: 720
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              duration: 1.2, 
              ease: "easeInOut",
              times: [0, 0.4, 0.8, 1]
            }}
            className="absolute rounded-full shadow-lg"
          >
            {/* Wool ball SVG */}
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary fill-accent stroke-accent">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
              <path d="M4.93 4.93l4.24 4.24"></path>
              <path d="M14.83 14.83l4.24 4.24"></path>
              <path d="M14.83 9.17l4.24-4.24"></path>
              <path d="M9.17 14.83l-4.24 4.24"></path>
              <circle cx="12" cy="12" r="4"></circle>
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
