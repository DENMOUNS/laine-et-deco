import React from 'react';
import { motion } from 'motion/react';
import { Headphones, Mail, Clock, AlertCircle, CheckCircle2, MessageSquare, Globe, Shield, TrendingUp } from 'lucide-react';

export function TechnicalSupportView() {
  const [activeTab, setActiveTab] = React.useState<'issues' | 'contact' | 'status'>('issues');

  const commonIssues = [
    {
      id: 'reset-password',
      title: 'J\'ai oublié mon mot de passe',
      solution: 'Cliquez sur "Mot de passe oublié" sur la page de connexion. Entrez votre email et vous recevrez un lien pour réinitialiser votre mot de passe. Ce lien expire après 24 heures.',
    },
    {
      id: 'account-locked',
      title: 'Mon compte est bloqué',
      solution: 'Si vous avez essayé de vous connecter trop de fois avec un mauvais mot de passe, votre compte est temporairement bloqué pour des raisons de sécurité. Attendez 30 minutes et réessayez. Vous pouvez aussi réinitialiser votre mot de passe.',
    },
    {
      id: 'payment-failed',
      title: 'Mon paiement a échoué',
      solution: 'Vérifiez que votre carte bancaire est valide et que les fonds sont disponibles. Assurez-vous que vos informations de facturation correspondent à votre banque. Contactez votre banque si le problème persiste.',
    },
    {
      id: 'order-missing',
      title: 'Je ne vois pas ma commande',
      solution: 'Attendez quelques minutes, la commande peut prendre du temps à s\'afficher. Vérifiez votre email pour la confirmation de commande. Contactez le support avec le numéro de commande si vous avez confirmé le paiement mais ne voyez pas la commande.',
    },
    {
      id: 'delivery-issue',
      title: 'Mon colis n\'est pas arrivé',
      solution: 'Consultez le suivi de votre commande depuis votre compte. Vérifiez votre adresse de livraison. Attendez les délais de livraison (5-10 jours ouvrables). Si le délai est dépassé, contactez le support avec votre numéro de suivi.',
    },
    {
      id: 'return-process',
      title: 'Comment retourner un produit?',
      solution: 'Vous avez 30 jours pour retourner un article neuf et non utilisé. Accédez à votre commande et cliquez sur "Demander un retour". Imprimez l\'étiquette de retour, emballez l\'article et envoyez-le. Le remboursement est traité dans les 5-7 jours après réception.',
    },
    {
      id: 'refund-status',
      title: 'Où en est mon remboursement?',
      solution: 'Les remboursements sont traités dans les 5-7 jours ouvrables après réception du colis retourné. Vérifiez votre compte pour le statut du remboursement. Contactez le support si plus de 7 jours se sont écoulés.',
    },
    {
      id: 'technical-error',
      title: 'Je rencontre une erreur technique',
      solution: 'Essayez de rafraîchir la page ou de vider le cache de votre navigateur. Assurez-vous d\'utiliser un navigateur à jour. Si le problème persiste, contactez le support avec la description de l\'erreur.',
    },
  ];

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      description: 'support@laineetdeco.fr',
      details: 'Réponse sous 24h',
      link: 'mailto:support@laineetdeco.fr',
    },
    {
      icon: MessageSquare,
      title: 'Chat en direct',
      description: 'Disponible pendant les heures d\'ouverture',
      details: 'Lun-Ven 9h-18h, Sam 10h-16h',
      link: '#',
    },
    {
      icon: Clock,
      title: 'Téléphone',
      description: '+33 1 23 45 67 89',
      details: 'Lun-Ven 9h-18h, Sam 10h-16h',
      link: 'tel:+33123456789',
    },
  ];

  const systemStatus = [
    { name: 'Boutique en ligne', status: 'Opérationnel', icon: Globe },
    { name: 'Paiements', status: 'Opérationnel', icon: TrendingUp },
    { name: 'Livraison', status: 'Opérationnel', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-transparent">
      {/* Header */}
      <div className="bg-primary text-white py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex items-center gap-3 mb-4">
            <Headphones size={32} />
            <h1 className="text-4xl font-serif font-bold">Support Technique</h1>
          </div>
          <p className="text-lg text-white/90">
            Nous sommes là pour vous aider. Trouvez les réponses à vos questions
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
        {/* Tabs */}
        <div className="flex gap-4 mb-12 border-b border-primary/20">
          <button
            onClick={() => setActiveTab('issues')}
            className={`px-6 py-3 font-bold transition-colors border-b-2 ${
              activeTab === 'issues'
                ? 'border-primary text-primary'
                : 'border-transparent text-primary/60 hover:text-primary'
            }`}
          >
            Problèmes courants
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-6 py-3 font-bold transition-colors border-b-2 ${
              activeTab === 'contact'
                ? 'border-primary text-primary'
                : 'border-transparent text-primary/60 hover:text-primary'
            }`}
          >
            Nous contacter
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`px-6 py-3 font-bold transition-colors border-b-2 ${
              activeTab === 'status'
                ? 'border-primary text-primary'
                : 'border-transparent text-primary/60 hover:text-primary'
            }`}
          >
            État du service
          </button>
        </div>

        {/* Issues Tab */}
        {activeTab === 'issues' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {commonIssues.map((issue, index) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-primary/20 rounded-lg p-6 bg-card shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 mb-3">
                  <AlertCircle size={24} className="text-primary flex-shrink-0 mt-1" />
                  <h3 className="text-lg font-bold text-primary">{issue.title}</h3>
                </div>
                <p className="text-primary/80 leading-relaxed ml-9">{issue.solution}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <motion.a
                  key={index}
                  href={method.link}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-primary/20 rounded-lg p-6 bg-card shadow-sm hover:shadow-md transition-all hover:border-primary/40 group"
                >
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon size={28} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-2">{method.title}</h3>
                  <p className="text-primary/80 font-semibold mb-2">{method.description}</p>
                  <p className="text-sm text-primary/60">{method.details}</p>
                </motion.a>
              );
            })}
          </motion.div>
        )}

        {/* Status Tab */}
        {activeTab === 'status' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={24} className="text-green-600" />
                <h3 className="text-xl font-bold text-green-900">Tous les services sont opérationnels</h3>
              </div>
              <p className="text-green-800">Dernière mise à jour: aujourd'hui à 14:30</p>
            </div>

            <div className="space-y-3">
              {systemStatus.map((service, index) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border border-green-200 rounded-lg bg-green-50"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={24} className="text-primary" />
                      <span className="font-semibold text-primary">{service.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-600" />
                      <span className="font-semibold text-green-700">{service.status}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-bold text-primary mb-2">Notifications en cas de maintenance</h4>
              <p className="text-primary/80 mb-4">
                Inscrivez-vous à nos notifications pour être informé en cas de maintenance ou de problème.
              </p>
              <button className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors">
                S'inscrire aux notifications
              </button>
            </div>
          </motion.div>
        )}

        {/* Additional Help */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-12 p-8 bg-primary/5 rounded-lg border border-primary/20"
        >
          <h3 className="text-xl font-bold text-primary mb-4">Besoin d'aide supplémentaire?</h3>
          <p className="text-primary/80 mb-6">
            Si vous ne trouvez pas la réponse à votre question, notre équipe de support est prête à vous aider.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="mailto:support@laineetdeco.fr"
              className="px-6 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors text-center"
            >
              Envoyer un email
            </a>
            <a
              href="/user-manual"
              className="px-6 py-3 border-2 border-primary text-primary rounded-lg font-bold hover:bg-primary/5 transition-colors text-center"
            >
              Consulter le mode d'emploi
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default TechnicalSupportView;
