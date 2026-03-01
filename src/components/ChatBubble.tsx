import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send } from 'lucide-react';
import { CHAT_MESSAGES } from '../constants';

export const ChatBubble: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(CHAT_MESSAGES);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      senderId: 'u1',
      senderName: 'Jean Dupont',
      message: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAdmin: false
    };

    setMessages([...messages, newMessage]);
    setMessage('');
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="bg-white rounded-[2rem] shadow-2xl border border-primary/5 w-80 md:w-96 overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-primary p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="font-serif text-lg">Chat avec nous</h3>
                <p className="text-xs text-white/60">Nous répondons généralement en quelques minutes</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-6 space-y-4 bg-secondary/10">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                    msg.isAdmin 
                      ? 'bg-white text-primary rounded-tl-none' 
                      : 'bg-accent text-white rounded-tr-none'
                  }`}>
                    <p>{msg.message}</p>
                    <span className={`text-[10px] mt-1 block ${msg.isAdmin ? 'text-primary/40' : 'text-white/60'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-primary/5 flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Votre message..."
                className="flex-grow bg-secondary/30 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <button 
                type="submit"
                className="bg-primary text-white p-2 rounded-full hover:bg-accent transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-primary text-white p-4 rounded-full shadow-xl hover:bg-accent transition-all duration-300"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>
    </div>
  );
};
