import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Sparkles, Loader2, Palette, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useEntity } from '../hooks/useEntity';
import { Product } from '../../types';
import { initFirebase } from '../../backend/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, where } from 'firebase/firestore';

interface ChatBubbleProps {
  startOpen?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ startOpen = false }) => {
  const [isOpen, setIsOpen] = useState(startOpen);
  const { data: productsData } = useEntity<Product>('product', [], { enabled: isOpen, cacheOnly: true });
  const PRODUCTS = productsData ?? [];
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isMounted = useRef(true);
  
  useEffect(() => {
    isMounted.current = true;
    let unsubscribe = () => {};
    const { auth, db } = initFirebase();
    if (!auth || !db) return () => { isMounted.current = false; };

    const unregisterAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const q = query(
          collection(db, 'chat_message'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'asc')
        );
        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            try {
              const msgs = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
              if (isMounted.current) setMessages(msgs);
            } catch (e) {
            }
          },
          (error) => {
            console.warn('[ChatBubble] Listener error (offline fallback active):', error);
          }
        );
      } else {
        if (isMounted.current) setMessages([]);
        unsubscribe();
      }
    });

    return () => {
      isMounted.current = false;
      unregisterAuth();
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const getFirebaseUser = () => {
    const { auth, db } = initFirebase();
    return { auth, db, user: auth?.currentUser ?? null };
  };
    const getAIResponse = async (userMessage: string) => {
    try {
      // Limit to 50 products and truncate descriptions to avoid exceeding server limits
      const productsContext = PRODUCTS.slice(0, 50).map(p =>
        `- ${p.name}: ${p.price} FCFA, Cat: ${p.category}, Desc: ${(p.description || '').slice(0, 100)}`
      ).join('\n');

      const systemInstruction = `Tu es l'assistant shopping expert de "Laine et Déco", un concept store polyvalent.
      Ton but est de conseiller les clients sur nos produits :
      - Artisanat & Déco : Laine, tricot, décoration intérieure, bougies.
      - Électronique & High-Tech : Casques audio, montres connectées, tablettes, enceintes, accessoires technologiques.
      
      Voici notre catalogue actuel :
      ${productsContext}
      
      Règles :
      1. Sois chaleureux, professionnel et expert.
      2. Pour l'artisanat, parle de douceur, de fait-main et de cocooning.
      3. Pour l'électronique, mets en avant les spécifications techniques (specs) et la garantie.
      4. Si un client demande un conseil, suggère des produits spécifiques.
      5. Réponds en français. Garde tes réponses concises.`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          systemInstruction
        })
      });

      if (!response.ok) {
        throw new Error('API Error');
      }

      const data = await response.json();
      return data.text || "Je rencontre une petite difficulté technique.";
    } catch (error: any) {
      return "Je rencontre une petite difficulté technique, mais je suis toujours là pour vous aider ! Que souhaitez-vous savoir sur nos produits ?";
    }
  };

  useEffect(() => {
    const handleAdminMessage = (event: CustomEvent) => {
      setMessages(prev => [...prev, event.detail]);
    };
    window.addEventListener('admin-message', handleAdminMessage as any);
    return () => window.removeEventListener('admin-message', handleAdminMessage as any);
  }, []);

  const [isGeneratingMoodboard, setIsGeneratingMoodboard] = useState(false);

  const generateDecorAdvice = async () => {
    setIsTyping(true);
    
    const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const prompt = `Aujourd'hui nous sommes le ${today}. Donne-moi 3 conseils de lifestyle ou d'aménagement uniques et thématiques pour aujourd'hui. Sois créatif, varie les styles chaque jour et mentionne des produits spécifiques de notre catalogue Laine et Déco.`;
    const responseText = await getAIResponse(prompt);

    const { db, user } = getFirebaseUser();
    if (!db || !user) return;

    await addDoc(collection(db, 'chat_message'), {
      userId: user.uid,
      senderId: 'ai',
      senderName: 'Laine et Déco AI',
      text: responseText,
      timestamp: Date.now(),
    });

    setIsTyping(false);
  };

  const generateMoodboard = async () => {
    setIsTyping(true);
    setIsGeneratingMoodboard(true);
    
    const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const prompt = `Aujourd'hui nous sommes le ${today}. Génère un moodboard de décoration intérieure unique avec un thème spécifique inspiré par cette date ou la saison actuelle au Cameroun. Propose une palette de 5 couleurs (donne les noms des couleurs) et suggère 3 types de matières ou produits. Sois très descriptif et poétique.`;
    const responseText = await getAIResponse(prompt);

    // Generate a random palette based on the day to ensure visual variety
    const seed = new Date().getDate();
    const palettes = [
      ['#1e3a8a', '#9a3412', '#064e3b', '#a16207', '#4b5563'],
      ['#fef3c7', '#fde68a', '#f59e0b', '#d97706', '#b45309'],
      ['#ecfdf5', '#d1fae5', '#10b981', '#059669', '#047857'],
      ['#fff7ed', '#ffedd5', '#fb923c', '#ea580c', '#c2410c'],
      ['#fdf2f8', '#fce7f3', '#f472b6', '#db2777', '#be185d']
    ];
    const selectedPalette = palettes[seed % palettes.length];

    const { db, user } = getFirebaseUser();
    if (!db || !user) return;

    await addDoc(collection(db, 'chat_message'), {
      userId: user.uid,
      senderId: 'ai',
      senderName: 'Laine et Déco AI',
      text: responseText,
      timestamp: Date.now(),
      isMoodboard: true,
      palette: selectedPalette,
    });

    setIsTyping(false);
    setIsGeneratingMoodboard(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const { auth, db, user } = getFirebaseUser();
    if (!user || !db) {
      toast.error('Vous devez être connecté pour envoyer un message.');
      return;
    }
    if (!message.trim()) return;

    const userMsg = message;
    setMessage('');

    await addDoc(collection(db, 'chat_message'), {
      userId: user.uid,
      senderId: user.uid,
      senderName: user.displayName || 'Utilisateur',
      text: userMsg,
      timestamp: Date.now(),
    });

    setIsTyping(true);
    const aiResponseText = await getAIResponse(userMsg);

    await addDoc(collection(db, 'chat_message'), {
      userId: user.uid,
      senderId: 'ai',
      senderName: 'Laine et Déco AI',
      text: aiResponseText,
      timestamp: Date.now(),
    });

    setIsTyping(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 sm:inset-auto sm:bottom-20 sm:right-6 z-[100] flex flex-col justify-end sm:justify-start items-center sm:items-end pointer-events-none p-3 sm:p-0">
            {/* Mobile backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs sm:hidden pointer-events-auto"
            />

            {/* Floating Chat Window Card */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="chat-assistant-title"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="pointer-events-auto relative z-10 bg-white/95 dark:bg-[#1a1d1a]/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-primary/10 w-full sm:w-96 max-h-[75vh] sm:max-h-[80vh] overflow-hidden mb-16 sm:mb-0 flex flex-col"
            >
              {/* Header */}
              <div className="bg-primary p-5 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
                    <MessageCircle size={18} className="text-accent" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 id="chat-assistant-title" className="font-serif text-base leading-tight">Assistant IA</h3>
                    <p className="text-[10px] text-white/80 uppercase tracking-widest font-bold">Expert Shopping</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Fermer le chat"
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              {/* Messages */}
              <div 
                ref={scrollRef}
                className="h-72 sm:h-80 overflow-y-auto p-4 sm:p-5 space-y-4 bg-secondary/10 dark:bg-black/20 scroll-smooth"
              >
                {messages.map((msg) => {
                  const isAI = msg.senderId === 'ai';
                  const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <div key={msg.id} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm ${
                        isAI 
                          ? 'bg-white dark:bg-[#252a25] text-primary dark:text-white rounded-tl-none' 
                          : 'bg-primary text-white rounded-tr-none'
                      }`}>
                        <p className="leading-relaxed text-xs sm:text-sm">{msg.text}</p>
                        
                        <span className={`text-[10px] mt-1.5 block font-medium ${isAI ? 'text-primary/60 dark:text-white/60' : 'text-white/80'}`}>
                          {formattedTime}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-[#252a25] p-3.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-accent" />
                      <span className="text-xs text-primary/80 dark:text-white/80 font-medium italic">L'expert réfléchit...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="px-4 py-2 bg-secondary/20 dark:bg-black/30 flex gap-2 overflow-x-auto no-scrollbar">
                <button 
                  type="button"
                  onClick={generateMoodboard}
                  disabled={isTyping}
                  className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#2a302a] rounded-full text-[10px] font-bold text-primary dark:text-white shadow-sm hover:bg-accent hover:text-white transition-all disabled:opacity-50"
                >
                  <Palette size={12} />
                  Générer un Moodboard
                </button>
                <button 
                  type="button"
                  onClick={generateDecorAdvice}
                  disabled={isTyping}
                  className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#2a302a] rounded-full text-[10px] font-bold text-primary dark:text-white shadow-sm hover:bg-accent hover:text-white transition-all disabled:opacity-50"
                >
                  <ImageIcon size={12} />
                  Conseil Déco
                </button>
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-3.5 bg-white dark:bg-[#1a1d1a] flex gap-2 shrink-0">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Posez votre question créative..."
                  aria-label="Votre message"
                  className="flex-grow bg-secondary/30 dark:bg-black/30 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-primary dark:text-white placeholder:text-primary/60 dark:placeholder:text-white/50 focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={isTyping || !message.trim()}
                  aria-label="Envoyer le message"
                  className="bg-primary text-white p-2.5 rounded-2xl hover:bg-accent transition-all duration-300 disabled:opacity-50 shadow-md flex items-center justify-center"
                >
                  <Send size={16} aria-hidden="true" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <div className="fixed bottom-20 right-3 sm:bottom-6 sm:right-6 z-[90] pointer-events-auto">
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? 'Fermer le chat' : 'Ouvrir l’assistant de chat'}
          aria-expanded={isOpen}
          className={`p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-300 group relative flex items-center justify-center ${
            isOpen 
              ? 'bg-primary text-white shadow-primary/30 ring-4 ring-primary/20' 
              : 'glass-ios text-primary dark:text-white border border-white/40'
          }`}
        >
          {!isOpen && (
            <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent rounded-full animate-pulse shadow-sm" aria-hidden="true" />
          )}
          {isOpen ? <X size={22} aria-hidden="true" /> : <MessageCircle size={22} aria-hidden="true" />}
        </motion.button>
      </div>
    </>
  );
};
