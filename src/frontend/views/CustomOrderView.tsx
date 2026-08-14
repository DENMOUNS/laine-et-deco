import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Scissors, PenTool, Sparkles, Crown } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';
import { collection, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db, auth } from '../../backend/firebase';
import { useEntity } from '../hooks/useEntity';
import { User } from '../../types';

export const CustomOrderView: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState('');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [idea, setIdea] = useState('');
  const [materials, setMaterials] = useState('');
  const [dimensions, setDimensions] = useState('');

  const { data: profiles } = useEntity<User>('user', [], {
    constraints: [where('uid', '==', userId || 'guest')],
    deps: [userId]
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        if (user.displayName) setName(user.displayName);
        if (user.email) setEmail(user.email);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const profile = profiles[0];
    if (!profile) return;

    if (profile.name) setName(profile.name);
    if (profile.email) setEmail(profile.email);
    if (profile.phone) setPhone(profile.phone);
    if (profile.whatsapp) setWhatsapp(profile.whatsapp);
  }, [profiles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || !whatsapp.trim() || !phone.trim()) {
      toast.error('Veuillez renseigner votre projet, votre numéro WhatsApp et votre numéro de téléphone.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      const fullDescription = `Idée / Projet:\n${idea}\n\nMatériaux:\n${materials}\n\nDimensions:\n${dimensions || 'Non précisées'}\n\nWhatsApp :\n${whatsapp}\n\nTéléphone :\n${phone}`;
      
      if (db && user) {
        await addDoc(collection(db, 'order'), {
          userId: user.uid,
          customer: name.trim() || (user.displayName || 'Client'),
          customerName: name.trim() || (user.displayName || 'Client'),
          uuid: crypto.randomUUID(),
          userName: name.trim() || (user.displayName || 'Anonyme'),
          email: email.trim() || (user.email || ''),
          whatsapp: whatsapp.trim(),
          phone: phone.trim(),
          description: fullDescription,
          status: 'pending',
          type: 'custom',
          materials: materials,
          dimensions: dimensions,
          total: 0,
          items: [],
          date: new Date().toISOString(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else if (!user) {
        toast.error('Vous devez être connecté pour envoyer une demande.');
        return;
      }
      
      setSubmitted(true);
      toast.success('Demande de commande personnalisée envoyée !');
      setIdea('');
      setMaterials('');
      setDimensions('');
    } catch (error) {
      toast.error('Une erreur est survenue lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center min-h-[70vh] flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-[#F9F7F2] text-accent rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h1 className="text-4xl font-serif text-primary mb-4">Merci, {name || 'pour votre demande'} !</h1>
        <p className="text-primary/70 text-lg mb-10 max-w-xl">
          Nous avons bien reçu votre projet de création personnalisée. Nos artisans vont l'étudier avec la plus grande attention et vous recontacteront sous 48h.
        </p>
        <Button variant="primary" className="rounded-full px-8 animate-shine" onClick={() => setSubmitted(false)}>
          Nouveau projet
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-20 px-4 max-w-7xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 items-center"
      >
        {/* Left Content */}
        <div className="space-y-10">
          <div>
            <span className="inline-block text-accent uppercase tracking-[0.2em] font-bold text-xs mb-6 border border-accent/20 px-3 py-1 rounded-full bg-accent/5">Le Sur-Mesure</span>
            <h1 className="text-5xl lg:text-7xl font-serif text-primary leading-[1.1] mb-6">
              Donnez vie à <br />
              <span className="italic text-primary/70">votre vision.</span>
            </h1>
            <p className="text-lg text-primary/70 leading-relaxed max-w-md">
              Que ce soit pour une occasion spéciale, un cadeau inoubliable ou une création unique, nos maîtres artisans sont à votre écoute pour concevoir la pièce parfaite.
            </p>
          </div>

          <div className="space-y-6 pt-10 border-t border-primary/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F9F7F2] flex items-center justify-center flex-shrink-0 border border-primary/5">
                <PenTool className="text-accent" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-primary mb-1 text-lg">1. L'Esquisse</h3>
                <p className="text-sm text-primary/70 leading-relaxed">Nous donnons forme à vos idées et validons avec vous le croquis et le choix des matériaux.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F9F7F2] flex items-center justify-center flex-shrink-0 border border-primary/5">
                <Scissors className="text-accent" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-primary mb-1 text-lg">2. La Confection</h3>
                <p className="text-sm text-primary/70 leading-relaxed">Votre pièce prend vie dans nos ateliers avec le plus grand soin et un savoir-faire authentique.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F9F7F2] dark:bg-[#1A1D1A] flex items-center justify-center flex-shrink-0 border border-primary/5">
                <Crown className="text-accent" size={22} />
              </div>
              <div>
                <h3 className="font-bold text-primary mb-1 text-lg">3. L'Excellence</h3>
                <p className="text-sm text-primary/70 leading-relaxed">Recevez une création exclusive et raffinée, conçue spécifiquement pour vous.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="bg-white p-8 sm:p-10 lg:p-12 rounded-[2.5rem] shadow-2xl border border-primary/5 relative overflow-hidden group">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-bl-[100%] opacity-50 pointer-events-none transition-transform duration-700 group-hover:scale-110" />

          <div className="relative z-10">
            <h2 className="text-3xl font-serif text-primary mb-2">Votre Projet</h2>
            <p className="text-sm text-primary/70 mb-8">Remplissez ce formulaire pour démarrer l'aventure.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary/70 ml-2">Nom complet</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 bg-[#F9F7F2] border border-transparent rounded-2xl focus:border-accent/30 focus:bg-white focus:ring-4 focus:ring-accent/10 transition-all text-primary placeholder:text-primary/70"
                    placeholder="Jean Dupont"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary/70 ml-2">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-5 py-4 bg-[#F9F7F2] border border-transparent rounded-2xl focus:border-accent/30 focus:bg-white focus:ring-4 focus:ring-accent/10 transition-all text-primary placeholder:text-primary/70"
                    placeholder="jean@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label htmlFor="custom-whatsapp" className="text-xs font-bold uppercase tracking-wider text-primary/70 ml-2">Numéro WhatsApp</label>
                  <input
                    id="custom-whatsapp"
                    type="tel"
                    required
                    inputMode="tel"
                    pattern="[+0-9 ()-]{8,}"
                    className="w-full px-5 py-4 bg-[#F9F7F2] border border-transparent rounded-2xl focus:border-accent/30 focus:bg-white focus:ring-4 focus:ring-accent/10 transition-all text-primary placeholder:text-primary/70"
                    placeholder="+225 07 00 00 00 00"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="custom-phone" className="text-xs font-bold uppercase tracking-wider text-primary/70 ml-2">Numéro de téléphone</label>
                  <input
                    id="custom-phone"
                    type="tel"
                    required
                    inputMode="tel"
                    pattern="[+0-9 ()-]{8,}"
                    className="w-full px-5 py-4 bg-[#F9F7F2] border border-transparent rounded-2xl focus:border-accent/30 focus:bg-white focus:ring-4 focus:ring-accent/10 transition-all text-primary placeholder:text-primary/70"
                    placeholder="+225 05 00 00 00 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary/70 ml-2">Votre Idée / Projet</label>
                  <textarea 
                    required
                    rows={4}
                    className="w-full px-5 py-4 bg-[#F9F7F2] border border-transparent rounded-2xl focus:border-accent/30 focus:bg-white focus:ring-4 focus:ring-accent/10 transition-all resize-none text-primary placeholder:text-primary/70 leading-relaxed"
                    placeholder="Décrivez-nous votre idée..."
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary/70 ml-2">Matériaux souhaités</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 bg-[#F9F7F2] border border-transparent rounded-2xl focus:border-accent/30 focus:bg-white focus:ring-4 focus:ring-accent/10 transition-all text-primary placeholder:text-primary/70"
                    placeholder="Ex: Laine mérinos, coton, bois..."
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary/70 ml-2">Dimensions approximatives</label>
                  <input 
                    type="text"
                    className="w-full px-5 py-4 bg-[#F9F7F2] border border-transparent rounded-2xl focus:border-accent/30 focus:bg-white focus:ring-4 focus:ring-accent/10 transition-all text-primary placeholder:text-primary/70"
                    placeholder="Ex: 120x80cm..."
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !idea.trim() || !name.trim() || !email.trim() || !whatsapp.trim() || !phone.trim()}
                  className="w-full py-5 rounded-2xl text-lg font-bold bg-[#5c5e46] hover:bg-primary text-white transition-all shadow-xl shadow-primary/10 hover:shadow-primary/20 animate-shine flex justify-center items-center gap-2"
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
                </Button>
              </div>
              <p className="text-center text-[11px] text-primary/70 uppercase tracking-wider mt-4">
                Devis gratuit sous 48h ouvrées
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
