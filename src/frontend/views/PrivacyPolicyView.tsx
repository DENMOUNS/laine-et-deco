import React from 'react';
import { ShieldCheck, Lock, Eye, ArrowLeft, Database, Mail } from 'lucide-react';
import { motion } from 'motion/react';

interface PrivacyPolicyViewProps {
  onNavigate?: (view: string) => void;
}

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-8">
        {onNavigate && (
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary/70 hover:text-accent mb-6 transition-colors"
          >
            <ArrowLeft size={16} />
            Retour à l'accueil
          </button>
        )}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-serif text-primary">Politique de Confidentialité</h1>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent mt-1">Dernière mise à jour : 2026</p>
          </div>
        </div>
      </div>

      <div className="bg-card p-6 sm:p-10 rounded-3xl border border-primary/5 shadow-sm space-y-8 text-primary/80 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
            <Lock size={20} className="text-accent" />
            1. Collecte des données personnelles
          </h2>
          <p>
            Nous collectons uniquement les informations nécessaires au bon traitement de vos commandes et à la personnalisation de votre expérience sur <strong>Laine et Déco</strong> :
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Nom, prénom et coordonnées de livraison (adresse, ville, numéro de téléphone).</li>
            <li>Adresse email pour l'envoi des confirmations de commande et du suivi d'expédition.</li>
            <li>Données de navigation et préférences enregistrées (panier, liste d'envies, projets de tricot).</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
            <Eye size={20} className="text-accent" />
            2. Utilisation et finalités
          </h2>
          <p>
            Vos données ne sont jamais vendues ni cédées à des tiers à des fins publicitaires. Elles sont exclusivement utilisées pour :
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Préparer et expédier vos commandes de pelotes et d'accessoires.</li>
            <li>Assurer le service après-vente et le suivi de vos demandes.</li>
            <li>Sécuriser les transactions et prévenir la fraude.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
            <Database size={20} className="text-accent" />
            3. Sécurité et hébergement
          </h2>
          <p>
            Toutes les connexions sont chiffrées via le protocole SSL/TLS (HTTPS). Vos mots de passe et sessions sont protégés par Firebase Authentication selon les standards de sécurité les plus stricts de l'industrie.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
            <Mail size={20} className="text-accent" />
            4. Vos droits (Accès, Rectification, Suppression)
          </h2>
          <p>
            Conformément aux réglementations relatives à la protection des données, vous disposez d'un droit permanent d'accès, de modification et de suppression de vos données personnelles. Vous pouvez exercer ce droit à tout moment depuis votre espace client ou en contactant notre équipe à l'adresse support.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicyView;
