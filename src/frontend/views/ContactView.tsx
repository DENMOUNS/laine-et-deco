import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Mail, Phone, Clock, Send, ArrowRight } from 'lucide-react';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../../backend/firebase';
import { Button } from '../components/ui/Button';
import { useTranslation } from '../../i18n';
import { useAuthStore } from '../../stores/authStore';
import { useConfigStore } from '../../stores/configStore';
import { DEFAULT_CONTACT_PAGE_CONFIG } from '../../siteDefaults';
import { ContactPageConfig } from '../../types';

interface ContactViewProps {
  onNavigate: (view: string) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ onNavigate }) => {
  const { isEn } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const siteConfig = useConfigStore((s) => s.siteConfig);
  const setSiteConfig = useConfigStore((s) => s.setSiteConfig);
  const rawContactConfig = siteConfig.contactPage;
  
  const [liveContactConfig, setLiveContactConfig] = useState<ContactPageConfig>(rawContactConfig || DEFAULT_CONTACT_PAGE_CONFIG);

  useEffect(() => {
    if (rawContactConfig) {
      setLiveContactConfig(rawContactConfig);
    }
  }, [rawContactConfig]);

  // Real-time Firestore listener on site_config
  useEffect(() => {
    try {
      const docId = siteConfig?.id || 'global';
      const ref = doc(db, 'site_config', docId);
      const unsubscribe = onSnapshot(
        ref,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data?.contactPage) {
              setLiveContactConfig(data.contactPage);
              setSiteConfig((prev) => ({
                ...prev,
                ...data,
                contactPage: data.contactPage,
              }));
            }
          }
        },
        (error) => {
          console.warn('Firestore real-time subscription note:', error);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      console.warn('Could not attach Firestore listener on ContactView:', err);
    }
  }, [siteConfig?.id, setSiteConfig]);

  const cfg: ContactPageConfig = { ...DEFAULT_CONTACT_PAGE_CONFIG, ...liveContactConfig };

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

  const headerTitle = (isEn && cfg.headerTitle_en) ? cfg.headerTitle_en : (cfg.headerTitle || (isEn ? 'Contact Us' : 'Contactez-nous'));
  const headerSubtitle = (isEn && cfg.headerSubtitle_en) ? cfg.headerSubtitle_en : (cfg.headerSubtitle || (isEn 
    ? "Have a question about a product, a knitting pattern, a choice of needles or crochet, or just want to say hello? Our team is listening to answer you as soon as possible." 
    : "Une question sur un produit, un modèle de tricot, un choix d'aiguilles ou de crochets, ou simplement envie de nous dire bonjour ? Notre équipe est à votre écoute pour vous répondre dans les plus brefs délais."));

  const shopTitle = (isEn && cfg.shopTitle_en) ? cfg.shopTitle_en : (cfg.shopTitle || (isEn ? 'Our Boutique' : 'Notre Boutique'));
  const phoneTitle = (isEn && cfg.phoneTitle_en) ? cfg.phoneTitle_en : (cfg.phoneTitle || (isEn ? 'Phone' : 'Téléphone'));
  const phoneAvailability = (isEn && cfg.phoneAvailability_en) ? cfg.phoneAvailability_en : (cfg.phoneAvailability || (isEn ? 'Mon-Fri, 9am to 6pm' : 'Lun-Ven, 9h à 18h'));
  
  const emailTitle = (isEn && cfg.emailTitle_en) ? cfg.emailTitle_en : (cfg.emailTitle || 'Email');
  const emailResponse = (isEn && cfg.emailResponseTime_en) ? cfg.emailResponseTime_en : (cfg.emailResponseTime || (isEn ? 'We reply within 24h' : 'Nous répondons sous 24h'));

  const hoursTitle = (isEn && cfg.hoursTitle_en) ? cfg.hoursTitle_en : (cfg.hoursTitle || (isEn ? 'Hours' : 'Horaires'));
  const hoursWeekday = (isEn && cfg.hoursWeekday_en) ? cfg.hoursWeekday_en : (cfg.hoursWeekday || (isEn ? 'Mon - Fri: 09am - 07pm' : 'Lun - Ven : 09h - 19h'));
  const hoursSaturday = (isEn && cfg.hoursSaturday_en) ? cfg.hoursSaturday_en : (cfg.hoursSaturday || (isEn ? 'Saturday: 10am - 05pm' : 'Samedi : 10h - 17h'));
  const hoursSunday = (isEn && cfg.hoursSunday_en) ? cfg.hoursSunday_en : cfg.hoursSunday;

  const customOrderTitle = (isEn && cfg.customOrderTitle_en) ? cfg.customOrderTitle_en : (cfg.customOrderTitle || (isEn ? 'Bespoke Custom Orders' : 'Commandes sur mesure'));
  const customOrderDesc = (isEn && cfg.customOrderDescription_en) ? cfg.customOrderDescription_en : (cfg.customOrderDescription || (isEn 
    ? "Have a specific creation idea? Let's discuss it to bring your project to life." 
    : 'Vous avez une idée précise de création ? Discutons-en pour donner vie à votre projet.'));
  const customOrderBtn = (isEn && cfg.customOrderButtonText_en) ? cfg.customOrderButtonText_en : (cfg.customOrderButtonText || (isEn ? 'Request a quote' : 'Demander un devis'));

  const formTitle = (isEn && cfg.formTitle_en) ? cfg.formTitle_en : (cfg.formTitle || (isEn ? 'Write to Us' : 'Écrivez-nous'));

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
            {headerTitle}
          </span>
          <h1 className="text-5xl lg:text-7xl font-serif text-primary mb-6">
            {isEn ? <>Leave us a <span className="italic text-primary/70">message</span></> : <>Laissez-nous un <span className="italic text-primary/70">message</span></>}
          </h1>
          <p className="text-lg text-primary/70 max-w-2xl mx-auto leading-relaxed">
            {headerSubtitle}
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
              {/* Carte 1 : Boutique & Adresse */}
              <div className="bg-white dark:bg-stone-900/60 p-8 rounded-3xl border border-primary/5 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                  <MapPin className="text-accent" size={24} />
                </div>
                <h3 className="text-xl font-serif text-primary dark:text-stone-100 mb-3">
                  {shopTitle}
                </h3>
                <p className="text-primary/70 dark:text-stone-300 leading-relaxed">
                  {cfg.shopAddressLine1 || 'Quartier Akwa, Rue des Écoles'}<br />
                  {cfg.shopAddressLine2 || 'Douala, Cameroun'}
                </p>
              </div>

              {/* Carte 2 : Téléphone & Appel */}
              <div className="bg-white dark:bg-stone-900/60 p-8 rounded-3xl border border-primary/5 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                    <Phone className="text-accent" size={24} />
                  </div>
                  <h3 className="text-xl font-serif text-primary dark:text-stone-100 mb-3">
                    {phoneTitle}
                  </h3>
                  <a href={`tel:${(cfg.phoneNumber || '+237 600 000 000').replace(/\s+/g, '')}`} className="text-primary/80 dark:text-stone-200 font-medium hover:text-accent transition-colors leading-relaxed mb-1 block">
                    {cfg.phoneNumber || '+237 600 000 000'}
                  </a>
                  <p className="text-primary/70 dark:text-stone-400 text-sm mb-4">
                    {phoneAvailability}
                  </p>
                </div>
                {cfg.allowDirectCall !== false && !!user && (
                  <Button 
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('app:start-call'))}
                    className="bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all text-xs font-semibold py-2 px-4 rounded-xl self-start flex items-center gap-1.5"
                  >
                    <Phone size={13} className="animate-pulse" /> {isEn ? 'Call online (Free)' : 'Appeler en ligne (Gratuit)'}
                  </Button>
                )}
              </div>

              {/* Carte 3 : Email */}
              <div className="bg-white dark:bg-stone-900/60 p-8 rounded-3xl border border-primary/5 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                  <Mail className="text-accent" size={24} />
                </div>
                <h3 className="text-xl font-serif text-primary dark:text-stone-100 mb-3">{emailTitle}</h3>
                <a href={`mailto:${cfg.emailAddress || 'contact@laine-deco.com'}`} className="text-primary/80 dark:text-stone-200 font-medium hover:text-accent transition-colors leading-relaxed mb-1 block">
                  {cfg.emailAddress || 'contact@laine-deco.com'}
                </a>
                <p className="text-primary/70 dark:text-stone-400 text-sm">
                  {emailResponse}
                </p>
              </div>

              {/* Carte 4 : Horaires */}
              <div className="bg-white dark:bg-stone-900/60 p-8 rounded-3xl border border-primary/5 dark:border-white/10 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                  <Clock className="text-accent" size={24} />
                </div>
                <h3 className="text-xl font-serif text-primary dark:text-stone-100 mb-3">
                  {hoursTitle}
                </h3>
                <div className="text-primary/70 dark:text-stone-300 leading-relaxed text-sm space-y-1">
                  {hoursWeekday && <div>{hoursWeekday}</div>}
                  {hoursSaturday && <div>{hoursSaturday}</div>}
                  {hoursSunday && <div>{hoursSunday}</div>}
                </div>
              </div>
            </div>

            {/* Bloc Commandes sur mesure */}
            <div className="bg-[#3E4A3D] dark:bg-[#1A1D1A] text-white p-10 rounded-[2.5rem] relative overflow-hidden border border-white/5 shadow-md">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-bl-[100%] opacity-20 pointer-events-none" />
              <div className="relative z-10">
                <h3 className="text-2xl font-serif mb-4">
                  {customOrderTitle}
                </h3>
                <p className="text-white/70 mb-8 leading-relaxed max-w-sm">
                  {customOrderDesc}
                </p>
                <Button 
                  className="bg-white text-primary hover:bg-accent hover:text-white transition-colors gap-2 rounded-xl font-medium"
                  onClick={() => onNavigate('custom-order')}
                >
                  {customOrderBtn} <ArrowRight size={18} />
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white dark:bg-stone-900/60 p-10 lg:p-12 rounded-[3xl] shadow-xl border border-primary/5 dark:border-white/10 relative min-h-[600px]"
          >
            {submitted ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-stone-900 rounded-[3xl]">
                <div className="w-20 h-20 bg-green-50 dark:bg-green-950 text-green-500 rounded-full flex items-center justify-center mb-6">
                  <Send size={32} className="ml-1" />
                </div>
                <h3 className="text-3xl font-serif text-primary dark:text-stone-100 mb-4">
                  {isEn ? 'Message sent!' : 'Message envoyé !'}
                </h3>
                <p className="text-primary/70 dark:text-stone-400 mb-8 text-lg">
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
                <h2 className="text-3xl font-serif text-primary dark:text-stone-100 mb-8">
                  {formTitle}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60 dark:text-stone-400">
                      {isEn ? 'Full Name' : 'Nom complet'}
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Jean Dupont"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-6 py-4 bg-secondary/50 dark:bg-stone-800/60 border border-primary/10 dark:border-stone-700 rounded-2xl focus:outline-none focus:border-primary dark:text-stone-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-primary/60 dark:text-stone-400">
                      {isEn ? 'Email' : 'Email'}
                    </label>
                    <input 
                      type="email" 
                      required
                      placeholder="jean@exemple.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-6 py-4 bg-secondary/50 dark:bg-stone-800/60 border border-primary/10 dark:border-stone-700 rounded-2xl focus:outline-none focus:border-primary dark:text-stone-100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 dark:text-stone-400">
                    {isEn ? 'Subject' : 'Sujet'}
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder={isEn ? 'What is this regarding?' : 'De quoi souhaitez-vous parler ?'}
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-6 py-4 bg-secondary/50 dark:bg-stone-800/60 border border-primary/10 dark:border-stone-700 rounded-2xl focus:outline-none focus:border-primary dark:text-stone-100"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-primary/60 dark:text-stone-400">
                    {isEn ? 'Your Message' : 'Votre message'}
                  </label>
                  <textarea 
                    rows={6}
                    required
                    placeholder={isEn ? 'Tell us more about your request...' : 'Détaillez votre demande ici...'}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-6 py-4 bg-secondary/50 dark:bg-stone-800/60 border border-primary/10 dark:border-stone-700 rounded-2xl focus:outline-none focus:border-primary dark:text-stone-100 resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-5 bg-primary text-white hover:bg-accent rounded-2xl font-serif text-lg tracking-wide shadow-lg shadow-primary/10 gap-2 flex items-center justify-center transition-all"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {isEn ? 'Sending...' : 'Envoi en cours...'}
                    </span>
                  ) : (
                    <>
                      {isEn ? 'Send message' : 'Envoyer le message'} <Send size={18} />
                    </>
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
