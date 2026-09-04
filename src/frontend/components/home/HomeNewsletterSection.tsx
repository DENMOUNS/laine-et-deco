import React from 'react';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface HomeNewsletterSectionProps {
  isSubscribed: boolean;
  onSubscribed: () => void;
}

export const HomeNewsletterSection: React.FC<HomeNewsletterSectionProps> = ({
  isSubscribed,
  onSubscribed,
}) => {
  if (isSubscribed) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
    const emailVal = emailInput?.value?.trim();
    if (emailVal) {
      localStorage.setItem('newsletter_decision', 'accepted');
      localStorage.setItem('newsletter_subscribed', 'true');
      localStorage.setItem(`newsletter_decision_${emailVal.toLowerCase()}`, 'accepted');
      onSubscribed();
      window.dispatchEvent(new Event('newsletter_subscribed'));
    }
    toast.success('Merci ! Votre inscription à la communauté est confirmée. Vérifiez vos emails pour votre code promo de -10%.');
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-r from-[#2C3E35] via-[#3E4A3D] to-[#2C3E35] dark:from-[#1C1F1C] dark:via-[#141614] dark:to-[#0D0F0D] rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 text-white relative overflow-hidden border border-amber-500/20 dark:border-white/10 shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10">
          <div className="text-center lg:text-left space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
              <span>Club Privilège Laine & Déco</span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-serif text-white leading-tight">
              Rejoignez la communauté
            </h2>
            <p className="text-xs sm:text-sm text-stone-300/90 leading-relaxed">
              Profitez de <span className="text-amber-300 font-bold">-10% sur votre première commande</span> et recevez nos tutoriels créatifs & ventes privées en avant-première.
            </p>
          </div>

          <div className="w-full lg:w-auto shrink-0 max-w-md">
            <form onSubmit={handleSubmit} className="relative flex items-center group w-full">
              <input
                type="email"
                required
                placeholder="Votre adresse email..."
                className="w-full bg-white/10 dark:bg-black/40 border border-white/20 rounded-full py-3 sm:py-3.5 pl-4 sm:pl-5 pr-28 sm:pr-32 text-xs sm:text-sm text-white placeholder:text-white/60 focus:outline-none focus:border-amber-400 focus:bg-black/30 transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-accent hover:bg-amber-400 text-primary font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-full transition-all shadow-md active:scale-95 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <span>S'abonner</span>
                <ArrowRight size={13} />
              </button>
            </form>
            <p className="text-[10px] text-stone-400/70 mt-2 text-center lg:text-left">
              Pas de spam. Désinscription possible à tout moment.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
