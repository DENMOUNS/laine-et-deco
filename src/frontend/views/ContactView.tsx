import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MapPin, Mail, Phone, Clock, Send, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../../i18n';
import { useAuthStore } from '../../stores/authStore';

interface ContactViewProps {
  onNavigate: (view: string) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ onNavigate }) => {
  const { t, l, isEn } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-transparent py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <span className="inline-block text-accent uppercase tracking-[0.2em] font-bold text-xs mb-6 border border-accent/20 px-4 py-2 rounded-full bg-accent/5">
            {isEn ? 'Contact Us' : 'Contactez-nous'}
          </span>
          <h1 className="text-5xl lg:text-7xl font-serif text-primary mb-6">
            {isEn ? <>Leave us a <span className="italic text-primary/70">message</span></> : <>Laissez-nous un <span className="italic text-primary/70">message</span></>}
          </h1>
          <p className="text-lg text-primary/70 max-w-2xl mx-auto leading-relaxed">
            {isEn 
              ? "Have a question about a product, a knitting pattern, a choice of needles or crochet, or just want to say hello? Our team is listening to answer you as soon as possible." 
              : "Une question sur un produit, un modèle de tricot, un choix d'aiguilles ou de crochets, ou simplement envie de nous dire bonjour ? Notre équipe est à votre écoute pour vous répondre dans les plus brefs délais."}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-primary/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                  <MapPin className="text-accent" size={24} />
                </div>
                <h3 className="text-xl font-serif text-primary mb-3">
                  {isEn ? 'Our Boutique' : 'Notre Boutique'}
                </h3>
                <p className="text-primary/70 leading-relaxed">
                  {isEn ? 'Akwa District, Rue des Écoles' : 'Quartier Akwa, Rue des Écoles'}<br />
                  Douala, Cameroun
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-primary/5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                    <Phone className="text-accent" size={24} />
                  </div>
                  <h3 className="text-xl font-serif text-primary mb-3">
                    {isEn ? 'Phone' : 'Téléphone'}
                  </h3>
                  <p className="text-primary/70 leading-relaxed mb-1">+237 600 000 000</p>
                  <p className="text-primary/70 text-sm mb-4">
                    {isEn ? 'Mon-Fri, 9am to 6pm' : 'Lun-Ven, 9h à 18h'}
                  </p>
                </div>
                {!!user && (
                  <Button 
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('app:start-call'))}
                    className="bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all text-xs font-semibold py-2 px-4 rounded-xl self-start flex items-center gap-1.5"
                  >
                    <Phone size={13} className="animate-pulse" /> {isEn ? 'Call online (Free)' : 'Appeler en ligne (Gratuit)'}
                  </Button>
                )}
              </div>

              <div className="bg-white p-8 rounded-3xl border border-primary/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                  <Mail className="text-accent" size={24} />
                </div>
                <h3 className="text-xl font-serif text-primary mb-3">Email</h3>
                <p className="text-primary/70 leading-relaxed mb-1">contact@laine-deco.com</p>
                <p className="text-primary/70 text-sm">
                  {isEn ? 'We reply within 24h' : 'Nous répondons sous 24h'}
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-primary/5 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                  <Clock className="text-accent" size={24} />
                </div>
                <h3 className="text-xl font-serif text-primary mb-3">
                  {isEn ? 'Hours' : 'Horaires'}
                </h3>
                <p className="text-primary/70 leading-relaxed">
                  {isEn ? 'Mon - Fri: 09am - 07pm' : 'Lun - Ven : 09h - 19h'}<br />
                  {isEn ? 'Saturday: 10am - 05pm' : 'Samedi : 10h - 17h'}
                </p>
              </div>
            </div>

            <div className="bg-[#3E4A3D] dark:bg-[#1A1D1A] text-white p-10 rounded-[2.5rem] relative overflow-hidden border border-white/5">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-bl-[100%] opacity-20 pointer-events-none" />
              <div className="relative z-10">
                <h3 className="text-2xl font-serif mb-4">
                  {isEn ? 'Bespoke Custom Orders' : 'Commandes sur mesure'}
                </h3>
                <p className="text-white/70 mb-8 leading-relaxed max-w-sm">
                  {isEn 
                    ? "Have a specific creation idea? Let's discuss it to bring your project to life." 
                    : 'Vous avez une idée précise de création ? Discutons-en pour donner vie à votre projet.'}
                </p>
                <Button 
                  className="bg-white text-primary hover:bg-accent hover:text-white transition-colors gap-2 rounded-xl"
                  onClick={() => onNavigate('custom-order')}
                >
                  {isEn ? 'Request a quote' : 'Demander un devis'} <ArrowRight size={18} />
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white p-10 lg:p-12 rounded-[3xl] shadow-xl border border-primary/5 relative min-h-[600px]"
          >
            {submitted ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-white rounded-[3xl]">
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
                  <Send size={32} className="ml-1" />
                </div>
                <h3 className="text-3xl font-serif text-primary mb-4">
                  {isEn ? 'Message sent!' : 'Message envoyé !'}
                </h3>
                <p className="text-primary/70 mb-8 text-lg">
                  {isEn 
                    ? 'We have received your message and will get back to you as soon as possible.' 
                    : 'Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais.'}
                </p>
                <Button 
                  onClick={() => setSubmitted(false)}
                  className="bg-primary text-white rounded-xl hover:bg-accent"
                >
                  {isEn ? 'Send another message' : 'Envoyer un autre message'}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-3xl font-serif text-primary mb-8">
                  {isEn ? 'Write to Us' : 'Écrivez-nous'}
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-primary/70 ml-2">
                      {isEn ? 'Full Name' : 'Nom complet'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isEn ? 'John Doe' : 'Jean Dupont'}
                      className="w-full px-5 py-4 bg-secondary border border-transparent rounded-2xl focus:border-accent/30 focus:bg-card focus:ring-4 focus:ring-accent/10 transition-all text-primary"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-primary/70 ml-2">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="jean@exemple.com"
                      className="w-full px-5 py-4 bg-secondary border border-transparent rounded-2xl focus:border-accent/30 focus:bg-card focus:ring-4 focus:ring-accent/10 transition-all text-primary"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary/70 ml-2">
                    {isEn ? 'Subject' : 'Sujet'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isEn ? 'What is this about?' : 'De quoi souhaitez-vous parler ?'}
                    className="w-full px-5 py-4 bg-secondary border border-transparent rounded-2xl focus:border-accent/30 focus:bg-card focus:ring-4 focus:ring-accent/10 transition-all text-primary"
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary/70 ml-2">
                    {isEn ? 'Your Message' : 'Votre message'}
                  </label>
                  <textarea
                    required
                    rows={6}
                    placeholder={isEn ? 'Detail your request here...' : 'Détaillez votre demande ici...'}
                    className="w-full px-5 py-4 bg-secondary border border-transparent rounded-2xl focus:border-accent/30 focus:bg-card focus:ring-4 focus:ring-accent/10 transition-all text-primary resize-none"
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting || !formData.name || !formData.email || !formData.message}
                  className="w-full py-5 bg-[#5c5e46] dark:bg-[#E2C29B] text-white dark:text-[#111311] hover:opacity-95 rounded-2xl text-lg font-bold shadow-xl shadow-[#5c5e46]/10 transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {isEn ? 'Sending...' : 'Envoi en cours...'}
                    </span>
                  ) : (
                    <>{isEn ? 'Send Message' : 'Envoyer le message'} <Send size={20} /></>
                  )}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
