import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Sparkles, Loader2, Palette, Image as ImageIcon, Phone, Headphones, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import { Product } from '../../types';
import { initFirebase } from '../../backend/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { readCache, getSharedEntityCacheKey } from '../utils/cacheStorage';
import { useTranslation } from '../../i18n';
import { useAuthStore } from '../../stores/authStore';

interface ChatBubbleProps {
  startOpen?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ startOpen = false }) => {
  const { language, t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  const [isOpen, setIsOpen] = useState(startOpen);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([
    {
      id: 'welcome-default',
      senderId: 'ai',
      senderName: 'Laine & Déco Expert',
      text: language === 'en'
        ? 'Hello and welcome to Laine & Déco! 👋 I am your virtual assistant. Feel free to ask any question or start a direct free voice call with our team.'
        : 'Bonjour et bienvenue chez Laine & Déco ! 👋 Je suis votre assistant expert. Vous pouvez me poser toutes vos questions ou lancer un appel vocal direct et gratuit avec un conseiller.',
      timestamp: Date.now(),
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);

  // Écouter les messages utilisateur persistés en temps réel de manière non-bloquante
  useEffect(() => {
    isMounted.current = true;
    let unsubscribe = () => {};
    try {
      const { auth, db } = initFirebase();
      if (!auth || !db) return () => { isMounted.current = false; };

      const unregisterAuth = auth.onAuthStateChanged((user) => {
        if (user && db) {
          try {
            const q = query(
              collection(db, 'chat_message'),
              orderBy('timestamp', 'desc'),
              limit(30)
            );
            unsubscribe = onSnapshot(
              q,
              (snapshot) => {
                try {
                  if (!snapshot.empty) {
                    const msgs = snapshot.docs
                      .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
                      .filter((m: any) => m.userId === user.uid)
                      .reverse();
                    if (msgs.length > 0 && isMounted.current) {
                      setMessages(msgs);
                    }
                  }
                } catch (e) {
                  console.warn('[ChatBubble] Error mapping messages:', e);
                }
              },
              (error) => {
                console.warn('[ChatBubble] Listener error (offline fallback active):', error);
              }
            );
          } catch (e) {
            console.warn('[ChatBubble] Snapshot setup error:', e);
          }
        } else {
          unsubscribe();
        }
      });

      return () => {
        isMounted.current = false;
        unregisterAuth();
        unsubscribe();
      };
    } catch (err) {
      console.warn('[ChatBubble] Firebase initialization error:', err);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  const getFirebaseUser = () => {
    try {
      const { auth, db } = initFirebase();
      return { auth, db, user: auth?.currentUser ?? null };
    } catch {
      return { auth: null, db: null, user: null };
    }
  };

  const getAIResponse = async (userMessage: string) => {
    try {
      let products: Product[] = [];
      try {
        const cached = await readCache<Product[]>(getSharedEntityCacheKey('product'));
        if (cached && Array.isArray(cached)) {
          products = cached;
        }
      } catch (err) {
        console.warn('Erreur lecture cache produits pour le chat:', err);
      }

      const productsContext = products.slice(0, 40).map(p =>
        `- ${p.name}: ${p.price} FCFA, Cat: ${p.category}, Desc: ${(p.description || '').slice(0, 100)}`
      ).join('\n');

      const systemInstruction = `Tu es l'assistant shopping expert de "Laine et Déco", un concept store polyvalent basé à Douala, Cameroun.
      Langue demandée : ${language === 'en' ? 'Anglais (English)' : 'Français'}.
      Ton but est de conseiller les clients sur nos produits :
      - Laine, Crochets, Aiguilles & Accessoires d'Artisanat : Pelotes de laine noble, crochets ergonomiques, aiguilles circulaires et accessoires de tricot.
      - Électronique & High-Tech : Casques audio, montres connectées, tablettes, enceintes, accessoires technologiques.
      
      Voici notre catalogue actuel :
      ${productsContext}
      
      Règles :
      1. Sois chaleureux, professionnel et expert.
      2. Pour la laine et l'artisanat, parle de douceur, de fait-main, de créativité et de qualité des fibres.
      3. Pour l'électronique, mets en avant les spécifications techniques (specs) et la garantie.
      4. Si un client demande un conseil, suggère des produits spécifiques.
      5. Rappelle au client qu'il peut aussi cliquer sur le bouton "Appel Direct" pour parler en direct avec l'équipe Laine & Déco.
      6. Réponds dans la langue (${language === 'en' ? 'English' : 'Français'}). Garde tes réponses concises et bienveillantes.`;

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
      return data.text || (language === 'en' ? "I encountered a minor issue." : "Je rencontre une petite difficulté technique.");
    } catch (error: any) {
      return language === 'en'
        ? "I am experiencing a slight technical issue, but I am still here to help! You can also click 'Call Advisor' to speak with our team for free."
        : "Je rencontre une petite difficulté technique, mais je suis toujours là pour vous aider ! Vous pouvez aussi cliquer sur le bouton 'Appeler' pour échanger avec notre équipe par voix gratuitement.";
    }
  };

  useEffect(() => {
    const handleAdminMessage = (event: CustomEvent) => {
      setMessages(prev => [...prev, event.detail]);
    };
    window.addEventListener('admin-message', handleAdminMessage as any);
    return () => window.removeEventListener('admin-message', handleAdminMessage as any);
  }, []);

  const startVoiceCall = () => {
    if (!user) {
      toast.error(language === 'en' ? "Please log in to start a call." : "Veuillez vous connecter pour passer un appel vocal.");
      setIsOpen(false);
      window.history.pushState({}, '', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
      return;
    }
    window.dispatchEvent(new CustomEvent('app:start-call'));
  };

  const generateDecorAdvice = async () => {
    setIsTyping(true);
    const today = new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const prompt = language === 'en'
      ? `Today is ${today}. Give me 3 unique and inspiring lifestyle or knitting advice tips for today. Be creative and recommend specific products from Laine and Déco.`
      : `Aujourd'hui nous sommes le ${today}. Donne-moi 3 conseils de lifestyle ou d'aménagement uniques et thématiques pour aujourd'hui. Sois créatif, varie les styles chaque jour et mentionne des produits spécifiques de notre catalogue Laine et Déco.`;
    const responseText = await getAIResponse(prompt);

    const { db, user } = getFirebaseUser();
    if (db && user) {
      try {
        await addDoc(collection(db, 'chat_message'), {
          userId: user.uid,
          senderId: 'ai',
          senderName: 'Laine & Déco AI',
          text: responseText,
          timestamp: Date.now(),
        });
      } catch (e) {
        console.warn('Error saving message:', e);
      }
    } else {
      setMessages(prev => [
        ...prev,
        { id: `ai-${Date.now()}`, senderId: 'ai', senderName: 'Laine & Déco AI', text: responseText, timestamp: Date.now() }
      ]);
    }

    setIsTyping(false);
  };

  const generateMoodboard = async () => {
    setIsTyping(true);
    const today = new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const prompt = language === 'en'
      ? `Today is ${today}. Generate a unique knitting and craft moodboard inspired by the current season. Suggest 5 yarn colors and 3 knitting tools or accessories.`
      : `Aujourd'hui nous sommes le ${today}. Génère un moodboard d'inspiration tricot et artisanat unique avec un thème spécifique inspiré par cette date ou la saison actuelle au Cameroun. Propose une palette de 5 couleurs de laines (donne les noms des couleurs) et suggère 3 types de laines, crochets, aiguilles ou accessoires. Sois très descriptif et poétique.`;
    const responseText = await getAIResponse(prompt);

    const { db, user } = getFirebaseUser();
    if (db && user) {
      try {
        await addDoc(collection(db, 'chat_message'), {
          userId: user.uid,
          senderId: 'ai',
          senderName: 'Laine & Déco AI',
          text: responseText,
          timestamp: Date.now(),
        });
      } catch (e) {
        console.warn('Error saving message:', e);
      }
    } else {
      setMessages(prev => [
        ...prev,
        { id: `ai-${Date.now()}`, senderId: 'ai', senderName: 'Laine & Déco AI', text: responseText, timestamp: Date.now() }
      ]);
    }

    setIsTyping(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMsg = message.trim();
    setMessage('');

    const { db, user } = getFirebaseUser();

    if (user && db) {
      try {
        await addDoc(collection(db, 'chat_message'), {
          userId: user.uid,
          senderId: user.uid,
          senderName: user.displayName || 'Utilisateur',
          text: userMsg,
          timestamp: Date.now(),
        });
      } catch (e) {
        console.warn('Error saving message:', e);
        setMessages(prev => [
          ...prev,
          { id: `user-${Date.now()}`, senderId: 'user', senderName: user.displayName || 'Vous', text: userMsg, timestamp: Date.now() }
        ]);
      }
    } else {
      setMessages(prev => [
        ...prev,
        { id: `user-${Date.now()}`, senderId: 'user', senderName: language === 'en' ? 'You' : 'Vous', text: userMsg, timestamp: Date.now() }
      ]);
    }

    setIsTyping(true);
    const aiResponseText = await getAIResponse(userMsg);

    if (user && db) {
      try {
        await addDoc(collection(db, 'chat_message'), {
          userId: user.uid,
          senderId: 'ai',
          senderName: 'Laine & Déco AI',
          text: aiResponseText,
          timestamp: Date.now(),
        });
      } catch (e) {
        console.warn('Error saving AI message:', e);
        setMessages(prev => [
          ...prev,
          { id: `ai-${Date.now()}`, senderId: 'ai', senderName: 'Laine & Déco AI', text: aiResponseText, timestamp: Date.now() }
        ]);
      }
    } else {
      setMessages(prev => [
        ...prev,
        { id: `ai-${Date.now()}`, senderId: 'ai', senderName: 'Laine & Déco AI', text: aiResponseText, timestamp: Date.now() }
      ]);
    }

    setIsTyping(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 z-[100] flex flex-col justify-end md:justify-start items-center md:items-end pointer-events-none p-2 sm:p-3 md:p-0">
            {/* Mobile backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs md:hidden pointer-events-auto"
            />

            {/* Floating Chat Window Card */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="chat-assistant-title"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="pointer-events-auto relative z-10 bg-white/95 dark:bg-[#1a1d1a]/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-primary/10 w-full sm:w-[410px] max-h-[82vh] sm:max-h-[85vh] overflow-hidden mb-20 md:mb-0 flex flex-col"
            >
              {/* Header */}
              <div className="bg-primary p-4 sm:p-5 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center relative">
                    <MessageCircle size={20} className="text-accent" aria-hidden="true" />
                    <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full absolute -top-0.5 -right-0.5 border-2 border-primary" />
                  </div>
                  <div>
                    <h3 id="chat-assistant-title" className="font-serif text-base font-bold leading-tight">
                      {language === 'en' ? 'Advice & Live Support' : 'Conseil & Support'}
                    </h3>
                    <p className="text-[10px] text-accent font-semibold uppercase tracking-widest flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {language === 'en' ? 'Online Team' : 'Équipe En Ligne'}
                    </p>
                  </div>
                </div>

                {/* Header Actions: Close */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label={language === 'en' ? 'Close chat' : 'Fermer le chat'}
                    title={language === 'en' ? 'Close discussion' : 'Fermer la discussion'}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white cursor-pointer"
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Unmissable High-Visibility Call Banner - Exactly ONE Phone Button */}
              <div className="bg-gradient-to-r from-amber-500/20 via-accent/25 to-amber-500/15 border-b border-accent/30 px-4 py-3 flex items-center justify-between gap-3 shadow-xs shrink-0">
                <div className="min-w-0">
                  <p className="text-xs font-black text-primary dark:text-white leading-tight">
                    {language === 'en' ? 'Speak with an advisor live' : 'Conseiller vocal en direct'}
                  </p>
                  <p className="text-[10px] text-primary/80 dark:text-white/80 truncate font-medium">
                    {language === 'en' ? 'Instant 100% free voice call' : 'Appel gratuit & direct sans numéro'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={startVoiceCall}
                  className="bg-accent hover:bg-accent-dark active:scale-95 text-white text-xs font-black px-4 py-2 rounded-xl shadow-md transition-all shrink-0 flex items-center gap-1.5 ring-2 ring-accent/30 cursor-pointer"
                  title={language === 'en' ? 'Start free voice call' : 'Lancer un appel vocal gratuit'}
                >
                  <Phone size={13} className="fill-current animate-pulse" />
                  <span>{language === 'en' ? 'Call Now' : 'Appeler'}</span>
                </button>
              </div>

              {!user ? (
                <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 my-auto min-h-[300px]">
                  <div className="w-16 h-16 rounded-3xl bg-accent/10 flex items-center justify-center text-accent shadow-inner">
                    <MessageCircle size={32} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-lg text-primary dark:text-white font-serif">
                      {language === 'en' ? 'Sign in to access live chat' : 'Connexion requise pour le tchat'}
                    </h4>
                    <p className="text-xs text-primary/70 dark:text-white/70 max-w-xs leading-relaxed">
                      {language === 'en'
                        ? 'Please log in to chat with our team and receive personalized advice.'
                        : 'Connectez-vous pour échanger en direct avec un conseiller et bénéficier d’un accompagnement sur-mesure.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      window.history.pushState({}, '', '/login');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                    className="px-6 py-3 bg-accent hover:bg-accent-dark text-white text-xs font-bold rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer mt-2"
                  >
                    {language === 'en' ? 'Sign In / Register' : 'Se connecter / S’inscrire'}
                  </button>
                </div>
              ) : (
                <>
                  {/* Messages Container */}
                  <div 
                    ref={scrollRef}
                    className="h-72 sm:h-80 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-secondary/10 dark:bg-black/20 scroll-smooth"
                  >
                    {messages.map((msg) => {
                      const isAI = msg.senderId === 'ai';
                      const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      return (
                        <div key={msg.id} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[88%] p-3.5 rounded-2xl text-sm shadow-sm ${
                            isAI 
                              ? 'bg-white dark:bg-[#252a25] text-primary dark:text-white rounded-tl-none border border-primary/5' 
                              : 'bg-primary text-white rounded-tr-none'
                          }`}>
                            <p className="leading-relaxed text-xs sm:text-sm whitespace-pre-wrap">{msg.text}</p>
                            
                            <span className={`text-[10px] mt-1.5 block font-medium ${isAI ? 'text-primary/60 dark:text-white/60' : 'text-white/80'}`}>
                              {formattedTime}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white dark:bg-[#252a25] p-3.5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 border border-primary/5">
                          <Loader2 size={14} className="animate-spin text-accent" />
                          <span className="text-xs text-primary/80 dark:text-white/80 font-medium italic">
                            {language === 'en' ? 'Laine & Déco assistant is thinking...' : "L'expert Laine & Déco réfléchit..."}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions Row */}
                  <div className="px-4 py-2.5 bg-secondary/20 dark:bg-black/30 flex gap-2 overflow-x-auto no-scrollbar items-center">
                    <button 
                      type="button"
                      onClick={generateMoodboard}
                      disabled={isTyping}
                      className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#2a302a] rounded-full text-[10px] font-bold text-primary dark:text-white shadow-xs hover:bg-accent hover:text-white transition-all disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      <Palette size={12} />
                      {language === 'en' ? 'Knitting Moodboard' : 'Moodboard Tricot'}
                    </button>
                    <button 
                      type="button"
                      onClick={generateDecorAdvice}
                      disabled={isTyping}
                      className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#2a302a] rounded-full text-[10px] font-bold text-primary dark:text-white shadow-xs hover:bg-accent hover:text-white transition-all disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      <ImageIcon size={12} />
                      {language === 'en' ? 'Style & Decor Advice' : 'Conseil Déco'}
                    </button>
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleSend} className="p-3 bg-white dark:bg-[#1a1d1a] border-t border-primary/5 flex gap-2 shrink-0">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={language === 'en' ? "Ask any question (yarns, orders, patterns)..." : "Posez votre question (laines, aiguilles, commandes)..."}
                      aria-label="Votre message"
                      className="flex-grow bg-secondary/30 dark:bg-black/30 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-primary dark:text-white placeholder:text-primary/60 dark:placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                    />
                    <button
                      type="submit"
                      disabled={isTyping || !message.trim()}
                      aria-label={language === 'en' ? "Send message" : "Envoyer le message"}
                      className="bg-primary text-white p-2.5 rounded-2xl hover:bg-accent transition-all duration-200 disabled:opacity-50 shadow-md flex items-center justify-center cursor-pointer active:scale-95"
                    >
                      <Send size={16} aria-hidden="true" />
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <div className="fixed bottom-20 right-3 md:bottom-6 md:right-6 z-[90] pointer-events-auto">
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen((open) => !open)}
          aria-label={isOpen ? (language === 'en' ? 'Close chat' : 'Fermer le chat') : (language === 'en' ? 'Open chat assistant' : 'Ouvrir l’assistant de chat')}
          title={isOpen ? (language === 'en' ? 'Close chat' : 'Fermer le chat') : (language === 'en' ? 'Chat assistant & free call' : 'Assistant discussion & appel gratuit')}
          aria-expanded={isOpen}
          className={`p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-200 group relative flex items-center justify-center cursor-pointer ${
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

