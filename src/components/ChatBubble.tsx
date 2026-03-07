import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { CHAT_MESSAGES, PRODUCTS } from '../constants';
import { GoogleGenAI } from "@google/genai";

export const ChatBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(CHAT_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const getAIResponse = async (userMessage: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      const model = "gemini-3-flash-preview";
      
      const productsContext = PRODUCTS.map(p => 
        `- ${p.name}: ${p.price} FCFA, Catégorie: ${p.category}, Description: ${p.description}`
      ).join('\n');

      const systemInstruction = `Tu es l'assistant shopping expert de "Laine & Déco", une boutique artisanale au Cameroun.
      Ton but est de conseiller les clients sur les produits disponibles et de les aider dans leurs projets créatifs (tricot, déco).
      
      Voici notre catalogue actuel :
      ${productsContext}
      
      Règles :
      1. Sois chaleureux, professionnel et passionné par l'artisanat.
      2. Si un client demande un conseil (ex: quel fil pour un pull), suggère des produits spécifiques de notre catalogue.
      3. Réponds en français.
      4. Garde tes réponses concises et engageantes.
      5. Si on te demande quelque chose hors sujet, ramène poliment la conversation vers la boutique.`;

      const response = await ai.models.generateContent({
        model,
        contents: userMessage,
        config: {
          systemInstruction,
        }
      });

      return response.text || "Désolé, je n'ai pas pu traiter votre demande. Comment puis-je vous aider autrement ?";
    } catch (error) {
      console.error("Gemini Error:", error);
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMsg = message;
    const newMessage = {
      id: Date.now().toString(),
      senderId: 'u1',
      senderName: 'Client',
      message: userMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAdmin: false
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    
    // Dispatch event for admin to see
    window.dispatchEvent(new CustomEvent('client-message', { detail: newMessage }));

    setIsTyping(true);
    const aiResponseText = await getAIResponse(userMsg);

    const aiMessage = {
      id: (Date.now() + 1).toString(),
      senderId: 'ai',
      senderName: 'Laine & Déco AI',
      message: aiResponseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAdmin: true
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);
    
    // Dispatch event for admin to see AI response too
    window.dispatchEvent(new CustomEvent('client-message', { detail: aiMessage }));
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="bg-white rounded-[2rem] shadow-2xl border border-primary/5 w-80 md:w-96 overflow-hidden mb-4 flex flex-col"
          >
            {/* Header */}
            <div className="bg-primary p-6 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center shadow-inner">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-serif text-lg leading-tight">Assistant IA</h3>
                  <p className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Expert Shopping</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="h-80 overflow-y-auto p-6 space-y-4 bg-secondary/10 scroll-smooth"
            >
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-sm ${
                    msg.isAdmin 
                      ? 'bg-white text-primary rounded-tl-none border border-primary/5' 
                      : 'bg-accent text-white rounded-tr-none'
                  }`}>
                    <p className="leading-relaxed">{msg.message}</p>
                    <span className={`text-[10px] mt-2 block font-medium ${msg.isAdmin ? 'text-primary/40' : 'text-white/60'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-primary/5 shadow-sm flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-accent" />
                    <span className="text-xs text-primary/40 font-medium italic">L'expert réfléchit...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-primary/5 flex gap-2 shrink-0">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Posez votre question créative..."
                className="flex-grow bg-secondary/30 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
              />
              <button 
                type="submit"
                disabled={isTyping || !message.trim()}
                className="bg-primary text-white p-3 rounded-2xl hover:bg-accent transition-all duration-300 disabled:opacity-50 disabled:hover:bg-primary shadow-lg shadow-primary/20"
              >
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-white p-5 rounded-full shadow-2xl hover:bg-accent transition-all duration-500 group relative"
      >
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full border-2 border-white animate-pulse" />
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </motion.button>
    </div>
  );
};
