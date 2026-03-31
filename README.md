# Laine & Déco

Boutique de décoration et artisanat.

## Fonctionnalités
- PWA (Progressive Web App) installable
- **Navigation Mobile (Sidebar) Réorganisée** : Structure claire en 4 sections (Navigation, Catégories, Application, Paramètres) avec icônes dédiées et accès rapide aux réglages (Langue, Devise, Mode Sombre).
- Mode clair/sombre
- Gestion des devises et langues
- Panier d'achat
- Tableau de bord client
- Tableau de bord administrateur

## Technologies
- React
- Vite
- Tailwind CSS
- PWA (vite-plugin-pwa)

## Fonctionnalités Frontend Implémentées
- Barre de progression "Livraison gratuite" dans le panier
- Notifications "Toast" élégantes (Ajout au panier, favoris)
- Galerie d'inspiration (Lookbook) avec produits cliquables (Hotspots)
- Zoom sur les images produits
- Sélecteur de variantes visuel (Pastilles de couleurs)
- Accordéons d'information sur la page produit
- **Calculateur de Laine** : Estimation de pelotes selon le projet, avec intégration panier, animations raffinées et navigation vers le calculateur de volume.
- **Calculateur de Volume** : Dosage précis pour Jesmonite et Plâtre, avec sélection de moules, recommandations produits et navigation vers le calculateur de laine.
- **Catégorie Décoration Maison** : Nouvelle gamme de moules, poudres créatives et objets finis, avec ajout direct au panier depuis les calculateurs.
- Galerie photo classique avec filtres par catégorie
- Lookbook interactif avec hotspots produits
- Page "À propos de nous" enrichie
- Page "Nous contacter" avec formulaire
- Guide d'entretien (Lavage, séchage des matières)
- **Optimisation Mobile** : Regroupement des 4 fonctionnalités clés (Qualité, Livraison, etc.) en grille 2x2 sur mobile pour réduire la longueur de la page et améliorer la lisibilité.
- **Assistant Créatif IA** : Chatbot intelligent (Gemini API) pour conseils shopping et idées projets
- **Recherche Avancée (Style Lucene)** : Recherche puissante avec support de préfixes (ex: `name:laine category:deco`) sur la page boutique.
- **Filtres Animés** : Nouveau menu de filtrage escamotable avec animation fluide, remplaçant la barre latérale pour un design plus épuré.
- **Navigation Optimisée** : L'icône de recherche dans la barre de navigation redirige désormais directement vers la boutique pour une expérience plus fluide.
- **Coffrets Cadeaux Personnalisables** : Interface interactive "Build-a-Box" étape par étape (boîte, laines, aiguilles, accessoires, message personnalisé) avec suivi de capacité en temps réel et résumé premium.

## Prochaines étapes (Roadmap Backend)
- [x] Configuration Firebase (Firestore, Auth)
- [ ] Implémentation des fonctionnalités (Programme de fidélité, Patrons, Liste de souhaits, Quiz, Commande sur-mesure)

## Priorités de développement
- **Programme de fidélité parrainage** : Gagnez des remises en invitant vos amis créatifs.
- **Vente de patrons exclusifs** : Patrons de tricot créés par des artisans partenaires.
- **Liste de souhaits partagée** : Créez et partagez vos envies pour des cadeaux.
- **Quiz "Quel est votre style déco ?"** : Test pour obtenir des recommandations personnalisées.
- **Service de commande sur-mesure** : Demandez une création unique à nos artisans.

## Idées pour nos utilisateurs
1. **Ateliers DIY en ligne** : Cours vidéo interactifs pour apprendre à tricoter ou créer des objets en Jesmonite.
2. **Communauté de créateurs** : Espace pour partager ses réalisations et échanger des patrons.
3. **Abonnement "Box Créative"** : Recevez chaque mois un kit complet pour un nouveau projet.
4. **Service de personnalisation** : Faites graver ou broder vos objets achetés.
5. **Blog d'inspiration saisonnière** : Articles sur les tendances déco et tricot selon les saisons.
6. **Outil de visualisation AR** : Visualisez les objets déco dans votre intérieur via la caméra.
7. **Service de réparation/entretien** : Conseils et kits pour réparer vos créations en laine.
8. **Événements pop-up locaux** : Informations sur les marchés de créateurs où nous serons présents.
9. **Calculateur de budget projet** : Estimez le coût total de vos futurs projets créatifs.
10. **Catalogue de matières éco-responsables** : Filtre dédié aux produits durables et locaux.
