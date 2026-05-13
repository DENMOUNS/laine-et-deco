import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';
import { MessageCircle, Home, Loader2, ArrowRight, Smartphone, Smile, Sparkles, Heart } from 'lucide-react';
import { db } from '../../backend/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { SITE_CONFIG } from '../../constants';
import { SiteConfig } from '../../types';

interface QRLandingViewProps {
  onNavigate: (view: string) => void;
}

const Confetti = () => (
  <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ x: "50vw", y: "50vh", scale: 0, opacity: 1 }}
        animate={{
          x: `calc(50vw + ${(Math.random() - 0.5) * 600}px)`,
          y: `calc(50vh + ${(Math.random() - 0.5) * 600}px)`,
          scale: [0, Math.random() + 0.5, 0],
          rotate: Math.random() * 360,
          opacity: [1, 1, 0]
        }}
        transition={{ duration: 2 + Math.random() * 1.5, ease: "easeOut" }}
        className={`absolute rounded-sm ${['bg-accent', 'bg-primary', 'bg-[#25D366]'][i % 3]}`}
        style={{
          width: Math.random() > 0.5 ? '8px' : '12px',
          height: Math.random() > 0.5 ? '8px' : '12px',
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        }}
      />
    ))}
  </div>
);

export const QRLandingView: React.FC<QRLandingViewProps> = ({ onNavigate }) => {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Parallax setup
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-10deg", "10deg"]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout fetching config')), 3000)
        );
        const configDoc: any = await Promise.race([
          getDoc(doc(db, 'site_config', 'global')),
          timeoutPromise
        ]);
        if (configDoc.exists()) {
          setSiteConfig(configDoc.data() as SiteConfig);
        } else {
          setSiteConfig(SITE_CONFIG); // fallback
        }
      } catch (err) {
        console.error('Failed to load site config for QR landing', err);
        setSiteConfig(SITE_CONFIG); // fallback
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-50" />
      </div>
    );
  }

  const qrConfig = siteConfig?.qrConfig || SITE_CONFIG.qrConfig!;

  const handleWhatsAppClick = () => {
    let number = qrConfig.whatsappNumber.replace(/[^\d+]/g, '');
    const message = encodeURIComponent(qrConfig.whatsappMessage);
    const url = `https://wa.me/${number}?text=${message}`;
    window.open(url, '_blank');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const xPct = (e.clientX - rect.left) / width - 0.5;
    const yPct = (e.clientY - rect.top) / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ perspective: 1000 }}>
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
      
      <Confetti />

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-white border border-secondary p-8 md:p-10 rounded-[2rem] shadow-xl relative z-10 text-center"
      >
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            variants={itemVariants}
            className="relative w-full h-48 mb-8 mt-4 flex items-center justify-center cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          >
            {/* Decorative background circle */}
            <div className="absolute inset-0 bg-primary/5 rounded-[3rem] rotate-3 scale-110 block mx-auto aspect-square transition-transform duration-500 hover:scale-125"></div>
            
            {/* Floating Smart Phone */}
            <motion.div 
              animate={{ y: [0, -10, 0], rotate: [-10, -15, -10] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-2 left-[15%] w-16 h-16 bg-accent text-primary-foreground rounded-2xl flex items-center justify-center shadow-lg z-20"
              style={{ translateZ: 40 }}
            >
              <Smartphone size={30} />
            </motion.div>

            {/* Central Message Bubble */}
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: [0.9, 1, 0.9] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-24 bg-primary text-white rounded-[2rem] flex items-center justify-center relative shadow-xl shadow-primary/20 z-10"
              style={{ translateZ: 80 }}
            >
              <MessageCircle size={44} />
            </motion.div>

            {/* Floating Smile/Interaction */}
            <motion.div 
              animate={{ y: [0, 8, 0], rotate: [10, 15, 10] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-2 right-[15%] w-14 h-14 bg-white border-2 border-secondary text-primary rounded-full flex items-center justify-center shadow-lg z-20"
              style={{ translateZ: 60 }}
            >
              <Smile size={28} />
            </motion.div>

            {/* Floating decorative elements */}
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-6 right-[25%] text-accent"
              style={{ translateZ: 20 }}
            >
              <Sparkles size={24} />
            </motion.div>

            <motion.div 
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              className="absolute bottom-6 left-[25%] text-primary/70"
              style={{ translateZ: 20 }}
            >
              <Heart size={20} />
            </motion.div>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-3xl font-serif font-bold text-primary mb-4 tracking-tight">
            Atelier De Doleres
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-primary/70 mb-10 leading-relaxed min-h-[3rem]">
            {qrConfig.welcomeMessage.split(' ').map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + i * 0.05 }}
                className="inline-block mr-1"
              >
                {word}
              </motion.span>
            ))}
          </motion.p>

          <motion.div variants={itemVariants} className="space-y-5">
            <motion.button 
              onClick={handleWhatsAppClick}
              className="group relative overflow-hidden w-full bg-[#25D366] text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#20BE5A] transition-all duration-300 shadow-xl shadow-[#25D366]/30 hover:shadow-[#25D366]/50 active:scale-[0.98]"
            >
              {/* Online Indicator Dot */}
              <div className="absolute top-3 right-3 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white border border-[#25D366]"></span>
              </div>

              {/* Shimmer effect every 5 seconds */}
              <motion.div
                animate={{ 
                  x: ['-200%', '200%', '200%']
                }}
                transition={{
                  duration: 5,
                  times: [0, 0.15, 1],
                  repeat: Infinity,
                  ease: 'linear'
                }}
                className="absolute inset-0 z-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
              />
              <MessageCircle size={22} className="relative z-10" />
              <span className="relative z-10">Nous écrire sur WhatsApp</span>
            </motion.button>
            
            <button 
              onClick={() => onNavigate('home')}
              className="group relative w-full overflow-hidden bg-primary text-secondary py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 hover:text-white transition-all duration-300 shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98]"
            >
              {/* Hover shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
              
              <Home size={22} className="relative z-10 text-accent group-hover:scale-110 transition-transform duration-300" />
              <span className="relative z-10 tracking-wide">Visiter notre boutique</span>
              <ArrowRight size={18} className="relative z-10 text-accent opacity-80 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300" />
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};
