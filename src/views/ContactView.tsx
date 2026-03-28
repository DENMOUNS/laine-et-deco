import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, MapPin, Mail, Phone, Clock } from 'lucide-react';

interface ContactViewProps {
  onNavigate: (view: string) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <nav className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-primary/40 mb-12">
        <button onClick={() => onNavigate('home')} className="hover:text-primary">Accueil</button>
        <ChevronRight size={14} />
        <span className="text-primary">Contact</span>
      </nav>

      <div className="text-center mb-16">
        <h1 className="text-5xl font-serif text-primary mb-4">Contactez-nous</h1>
        <p className="text-primary/60 max-w-2xl mx-auto">Une question sur un produit ? Besoin d'aide pour votre commande ? Notre équipe est là pour vous répondre.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Contact Info */}
        <div className="space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="bg-secondary/30 p-8 rounded-[2rem] border border-primary/5">
              <MapPin size={32} className="text-accent mb-4" />
              <h3 className="font-bold text-primary mb-2">Notre Boutique</h3>
              <p className="text-primary/70">Douala, Akwa<br />Rue des Écoles<br />Cameroun</p>
            </div>
            <div className="bg-secondary/30 p-8 rounded-[2rem] border border-primary/5">
              <Clock size={32} className="text-accent mb-4" />
              <h3 className="font-bold text-primary mb-2">Horaires</h3>
              <p className="text-primary/70">Lun - Ven : 9h - 18h<br />Samedi : 10h - 15h<br />Dimanche : Fermé</p>
            </div>
            <div className="bg-secondary/30 p-8 rounded-[2rem] border border-primary/5">
              <Mail size={32} className="text-accent mb-4" />
              <h3 className="font-bold text-primary mb-2">Email</h3>
              <p className="text-primary/70">contact@laine-deco.com<br />support@laine-deco.com</p>
            </div>
            <div className="bg-secondary/30 p-8 rounded-[2rem] border border-primary/5">
              <Phone size={32} className="text-accent mb-4" />
              <h3 className="font-bold text-primary mb-2">Téléphone</h3>
              <p className="text-primary/70">+237 600 000 000<br />+237 611 111 111</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-primary/5">
          <h2 className="text-3xl font-serif text-primary mb-8">Envoyez-nous un message</h2>
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Message envoyé !'); }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Nom complet</label>
                <input type="text" className="w-full px-6 py-4 bg-secondary/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20" placeholder="Jean Dupont" required />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Email</label>
                <input type="email" className="w-full px-6 py-4 bg-secondary/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20" placeholder="jean@exemple.com" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Sujet</label>
              <select className="w-full px-6 py-4 bg-secondary/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20" required>
                <option value="">Sélectionnez un sujet</option>
                <option value="order">Suivi de commande</option>
                <option value="product">Question sur un produit</option>
                <option value="partnership">Partenariat</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-primary/60 mb-2">Message</label>
              <textarea className="w-full px-6 py-4 bg-secondary/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/20 h-40 resize-none" placeholder="Comment pouvons-nous vous aider ?" required></textarea>
            </div>
            <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-bold hover:bg-accent transition-colors shadow-lg shadow-primary/20">
              Envoyer le message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
