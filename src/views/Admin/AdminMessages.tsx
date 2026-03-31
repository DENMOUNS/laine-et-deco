import React from 'react';
import { MessageSquare, Search, Settings, X } from 'lucide-react';
import { Conversation } from '../../types';
import { CONVERSATIONS } from '../../constants';

interface AdminMessagesProps {
  selectedConversation: Conversation | null;
  setSelectedConversation: (conv: Conversation | null) => void;
  messageInput: string;
  setMessageInput: (input: string) => void;
  handleSendMessage: () => void;
}

export const AdminMessages: React.FC<AdminMessagesProps> = ({
  selectedConversation,
  setSelectedConversation,
  messageInput,
  setMessageInput,
  handleSendMessage,
}) => {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[75vh] lg:flex-row">
        {/* Conversations List */}
        <div className={`w-full lg:w-80 border-r border-slate-100 flex flex-col ${selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-6 border-b border-slate-50 bg-slate-50/50">
            <h3 className="font-serif font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare size={18} className="text-primary" /> Discussions
            </h3>
          </div>
          <div className="flex-grow overflow-y-auto">
            {CONVERSATIONS.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-6 text-left border-b border-slate-50 transition-all hover:bg-slate-50 flex gap-4 items-start ${
                  selectedConversation?.id === conv.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center font-bold text-primary">
                  {conv.userName.charAt(0)}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-sm text-slate-900 truncate">{conv.userName}</h4>
                    <span className="text-[10px] text-slate-400">{conv.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{conv.lastMessage}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 bg-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat View */}
        <div className={`flex-grow flex flex-col ${!selectedConversation ? 'hidden lg:flex items-center justify-center bg-slate-50/30' : 'flex'}`}>
          {selectedConversation ? (
            <>
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedConversation(null)}
                    className="lg:hidden p-2 text-slate-400 hover:text-primary"
                  >
                    <X size={20} />
                  </button>
                  <div>
                    <h3 className="font-serif font-bold text-slate-900">{selectedConversation.userName}</h3>
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">En ligne</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                    <Search size={18} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                    <Settings size={18} />
                  </button>
                </div>
              </div>
              
              <div className="flex-grow overflow-y-auto p-8 space-y-6 bg-slate-50/20">
                {selectedConversation.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-6 rounded-[2rem] shadow-sm ${
                      msg.isAdmin 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-white border border-slate-100 text-slate-900 rounded-tl-none'
                    }`}>
                      <div className="flex justify-between items-center mb-2 gap-4">
                        <span className="text-xs font-bold">{msg.senderName}</span>
                        <span className={`text-[10px] ${msg.isAdmin ? 'text-white/60' : 'text-slate-400'}`}>{msg.timestamp}</span>
                      </div>
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-white border-t border-slate-100">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-4"
                >
                  <input 
                    type="text" 
                    placeholder="Tapez votre réponse..." 
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-grow px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-primary"
                  />
                  <button 
                    type="submit"
                    className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-accent transition-all shadow-lg"
                  >
                    Envoyer
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="text-center p-12">
              <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare size={32} className="text-primary/20" />
              </div>
              <h3 className="text-xl font-serif text-slate-400">Sélectionnez une conversation</h3>
              <p className="text-sm text-slate-300 mt-2">Choisissez un client dans la liste pour commencer à discuter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
