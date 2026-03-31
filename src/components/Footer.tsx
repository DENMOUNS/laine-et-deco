import React from 'react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-primary text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold">Laine&Déco</h2>
            <p className="text-white/70 text-sm leading-relaxed">
              Créer une atmosphère chaleureuse et authentique dans votre foyer avec nos laines sélectionnées et nos objets de décoration artisanaux.
            </p>
          </div>
          <div>
            <h3 className="font-bold mb-6 uppercase tracking-widest text-xs">Boutique</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li><button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">Toutes les laines</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-white transition-colors">Décoration</button></li>
              <li><button onClick={() => onNavigate('lookbook')} className="hover:text-white transition-colors">Lookbook</button></li>
              <li><button onClick={() => onNavigate('gallery')} className="hover:text-white transition-colors">Galerie</button></li>
            </ul>
          </div>
            <div>
              <h3 className="font-bold mb-6 uppercase tracking-widest text-xs">Aide</h3>
              <ul className="space-y-3 text-sm text-white/70">
                <li><button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">Contactez-nous</button></li>
                <li><button onClick={() => onNavigate('care-guide')} className="hover:text-white transition-colors">Guide d'entretien</button></li>
                <li><button onClick={() => onNavigate('shipping')} className="hover:text-white transition-colors">Livraison</button></li>
                <li><button onClick={() => onNavigate('returns')} className="hover:text-white transition-colors">Retours</button></li>
                <li><button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors">FAQ</button></li>
              </ul>
            </div>
          <div>
            <h3 className="font-bold mb-6 uppercase tracking-widest text-xs">Newsletter</h3>
            <p className="text-white/70 text-sm mb-4">Inscrivez-vous pour recevoir nos inspirations déco et offres exclusives.</p>
            <div className="flex">
              <input
                type="email"
                placeholder="Votre email"
                className="bg-white/10 border border-white/20 px-4 py-2 text-sm w-full focus:outline-none focus:border-white"
              />
              <button className="bg-white text-primary px-4 py-2 text-sm font-bold hover:bg-accent hover:text-white transition-colors">
                OK
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-white/40">
          <p>© 2024 Laine & Déco. Tous droits réservés.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <button onClick={() => onNavigate('team')} className="hover:text-white transition-colors">Équipe</button>
            <button onClick={() => onNavigate('admin-dashboard')} className="hover:text-white transition-colors">Administration</button>
            <button onClick={() => onNavigate('legal')} className="hover:text-white transition-colors">Mentions légales</button>
            <button onClick={() => onNavigate('privacy')} className="hover:text-white transition-colors">Confidentialité</button>
            <button onClick={() => onNavigate('terms')} className="hover:text-white transition-colors">CGV</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
