import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Users, ShoppingBag, Heart, MapPin, Package, Settings, Bell, Search, LogOut, ChevronDown } from 'lucide-react';

export function UserManualView() {
  const [expandedSection, setExpandedSection] = React.useState<string | null>(null);

  const sections = [
    {
      id: 'getting-started',
      title: 'Commencer',
      icon: BookOpen,
      content: [
        {
          subtitle: 'Créer un compte',
          description: 'Accédez à la page d\'accueil et cliquez sur "S\'inscrire". Entrez votre email et créez un mot de passe sécurisé. Vérifiez votre email pour confirmer votre compte.',
        },
        {
          subtitle: 'Se connecter',
          description: 'Cliquez sur "Se connecter" et entrez vos identifiants. Vous serez redirigé vers votre tableau de bord personnel.',
        },
      ],
    },
    {
      id: 'shopping',
      title: 'Faire vos achats',
      icon: ShoppingBag,
      content: [
        {
          subtitle: 'Parcourir les produits',
          description: 'Utilisez le moteur de recherche ou naviguez par catégories. Filtrez par prix, couleur, taille ou popularité.',
        },
        {
          subtitle: 'Consulter un produit',
          description: 'Cliquez sur un produit pour voir ses détails : description, avis clients, images haute résolution et disponibilité des stocks.',
        },
        {
          subtitle: 'Ajouter au panier',
          description: 'Sélectionnez la quantité et cliquez sur "Ajouter au panier". Vous pouvez continuer vos achats ou accéder au panier.',
        },
        {
          subtitle: 'Passer votre commande',
          description: 'Accédez à votre panier, vérifiez les articles et les frais de port. Entrez votre adresse de livraison et choisissez votre mode de paiement.',
        },
      ],
    },
    {
      id: 'account',
      title: 'Gérer votre compte',
      icon: Users,
      content: [
        {
          subtitle: 'Mon profil',
          description: 'Depuis votre tableau de bord, accédez à "Mon profil" pour modifier vos informations personnelles, photo de profil et préférences de communication.',
        },
        {
          subtitle: 'Mes commandes',
          description: 'Consultez l\'historique de vos commandes, suivez leur statut et accédez aux factures en télécharger.',
        },
        {
          subtitle: 'Mes adresses',
          description: 'Ajoutez, modifiez ou supprimez vos adresses de livraison et facturation dans votre carnet d\'adresses.',
        },
        {
          subtitle: 'Mes moyens de paiement',
          description: 'Gérez vos cartes bancaires et autres moyens de paiement enregistrés pour des paiements plus rapides.',
        },
      ],
    },
    {
      id: 'wishlist',
      title: 'Liste de souhaits',
      icon: Heart,
      content: [
        {
          subtitle: 'Ajouter à la liste',
          description: 'Cliquez sur l\'icône cœur sur une fiche produit pour l\'ajouter à votre liste de souhaits.',
        },
        {
          subtitle: 'Accéder à votre liste',
          description: 'Depuis votre tableau de bord, consultez votre liste de souhaits, supprimez des articles ou ajoutez-les directement au panier.',
        },
        {
          subtitle: 'Partager votre liste',
          description: 'Générez un lien de partage pour envoyer votre liste à vos proches (parfait pour les cadeaux).',
        },
      ],
    },
    {
      id: 'notifications',
      title: 'Notifications et alertes',
      icon: Bell,
      content: [
        {
          subtitle: 'Alertes de stock',
          description: 'Recevez une notification quand un produit rupture de stock revient disponible. Activez les alertes depuis la fiche produit.',
        },
        {
          subtitle: 'Suivi de commande',
          description: 'Soyez tenu informé de l\'état de votre commande : confirmation, préparation, expédition et livraison.',
        },
        {
          subtitle: 'Promotions',
          description: 'Recevez les alertes promotions personnalisées selon vos préférences d\'abonnement à la newsletter.',
        },
      ],
    },
    {
      id: 'search',
      title: 'Utiliser la recherche',
      icon: Search,
      content: [
        {
          subtitle: 'Recherche simple',
          description: 'Tapez le nom du produit, la marque ou le type de produit dans la barre de recherche en haut.',
        },
        {
          subtitle: 'Filtres avancés',
          description: 'Affinez votre recherche avec les filtres: prix, couleur, disponibilité, notation, etc.',
        },
        {
          subtitle: 'Suggestions',
          description: 'Consultez les produits similaires ou les clients ayant acheté ce produit aiment aussi.',
        },
      ],
    },
    {
      id: 'support',
      title: 'Obtenir de l\'aide',
      icon: Settings,
      content: [
        {
          subtitle: 'FAQ',
          description: 'Consultez les questions fréquemment posées pour des réponses rapides.',
        },
        {
          subtitle: 'Contactez-nous',
          description: 'Remplissez le formulaire de contact pour nous envoyer un message. Nous répondons dans les 24 heures.',
        },
        {
          subtitle: 'Chat en direct',
          description: 'Discutez avec notre équipe de support pendant les heures d\'ouverture.',
        },
      ],
    },
  ];

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-transparent">
      {/* Header */}
      <div className="bg-primary text-white py-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen size={32} />
            <h1 className="text-4xl font-serif font-bold">Mode d'emploi</h1>
          </div>
          <p className="text-lg text-white/90">
            Découvrez comment utiliser toutes les fonctionnalités de Laine & Déco
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-12">
        <div className="space-y-4">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const isExpanded = expandedSection === section.id;

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-primary/20 rounded-lg overflow-hidden bg-card shadow-sm"
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Icon size={24} className="text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-primary text-left">{section.title}</h2>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={24} className="text-primary" />
                  </motion.div>
                </button>

                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-primary/20 bg-secondary/20"
                  >
                    <div className="p-6 space-y-6">
                      {section.content.map((item, idx) => (
                        <div key={idx} className={idx !== section.content.length - 1 ? 'pb-6 border-b border-primary/10' : ''}>
                          <h3 className="font-bold text-primary mb-2 text-lg">{item.subtitle}</h3>
                          <p className="text-primary/80 leading-relaxed">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-12 p-8 bg-primary/5 border-l-4 border-primary rounded-lg"
        >
          <h3 className="text-xl font-bold text-primary mb-4">💡 Conseils pratiques</h3>
          <ul className="space-y-3 text-primary/80">
            <li>✓ Créez un compte pour accéder à tous les avantages</li>
            <li>✓ Activez les notifications pour ne pas manquer les promotions</li>
            <li>✓ Consultez les avis clients pour bien choisir</li>
            <li>✓ Utilisez les filtres pour affiner votre recherche rapidement</li>
            <li>✓ Sauvegardez vos produits préférés dans votre liste de souhaits</li>
          </ul>
        </motion.div>

        {/* FAQ Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-12 p-8 bg-gradient-to-r from-primary/10 to-transparent rounded-lg text-center"
        >
          <p className="text-primary/80 mb-4">Vous n'avez pas trouvé votre réponse ?</p>
          <a
            href="/support"
            className="inline-block px-8 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors"
          >
            Accéder au support technique
          </a>
        </motion.div>
      </div>
    </div>
  );
}
