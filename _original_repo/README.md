# Projet : Le Concept Store de Doleres (Nom en réflexion)

Bienvenue sur le dépôt du projet ! 
Initialement connu sous le nom de **Laine & Déco**, la boutique évolue aujourd'hui vers un véritable "Concept Store" chic porté par Doleres. L'objectif est de proposer une grande diversité de produits : de l'artisanat local (laine, décoration en jesmonite) jusqu'aux produits high-tech et lifestyle. Le nom actuel est "Atelier de Doleres".

Cette application a été restaurée et les erreurs de compilation ont été corrigées.

## Corrections apportées :
- Restructuration complète des types et constantes pour une meilleure maintenabilité.
- Correction systématique de tous les chemins d'importation dans le frontend et le backend.
- Résolution des erreurs de compilation Vite et des erreurs de typage TypeScript.
- Ajout des données de test (mock data) manquantes pour le Lookbook et le Chat.
- Installation et configuration des dépendances manquantes pour le serveur et la base de données.
- **Mise à jour du design** : Restauration des couleurs originales mais dans des teintes plus foncées et riches (Marron foncé `#2D241E` et Accent `#B85535`) pour un rendu Material Design plus profond, tout en gardant un fond clair (`#F2EFE9`) pour éviter un aspect triste.
- **Implémentation des vues** : Toutes les pages précédemment vides ont été implémentées avec un design soigné et des fonctionnalités réelles (Packs, Team, Guide d'entretien, Lookbook, Blog, Commande sur mesure, Compagnon de tricot).

L'application devrait maintenant se lancer correctement.

## 🌟 Fonctionnalités Principales

- **Boutique Complète** : Catalogue de produits, filtrage par catégories, recherche en temps réel, et filtres par état (Neuf / Deuxième main).
- **Promotions & Offres** : Vue dédiée aux produits en promotion avec badges de réduction.
- **Deuxième Main (Éco-responsable)** : Section spéciale pour les articles de seconde main, favorisant le recyclage et la durabilité.
- **Packs & Bundles** : Offres groupées avec réductions automatiques et vue détaillée des packs.
- **Outils pour Créateurs** :
  - *Calculateur de Laine* : Estimez le nombre de pelotes nécessaires pour vos projets (Pulls, Cardigans, Chaussettes, etc.).
  - *Calculateur de Volume* : Calculez la quantité exacte de résine ou de Jesmonite pour vos moules (Plateaux, Sous-verres, Bougeoirs, etc.).
- **Lookbook & Inspirations** : Galerie interactive pour découvrir des créations et acheter les produits utilisés.
- **Guide d'Entretien** : Conseils pratiques pour prendre soin de vos objets en résine et de vos créations en laine.
- **Suivi de Commande** : Interface pour suivre l'état de vos livraisons.
- **Design Élégant & Féminin** : Interface utilisateur soignée, mode clair/sombre, et typographies raffinées.

## 👑 Dashboard Administrateur (Type Magento)

Le tableau de bord administrateur a été entièrement repensé pour offrir une expérience de gestion e-commerce complète :

- **Gestion des Ventes** : 
  - Édition avancée des commandes (modification des articles, ajout de notes internes, gestion des transporteurs et numéros de suivi).
  - Différenciation des commandes Simples et B2B (avec calcul de la TVA).
  - Gestion des retours (RMA) et relance des paniers abandonnés.
  - Impression de factures pour les commandes livrées.
- **Catalogue & Contenu** : 
  - Modération des avis clients (Approbation/Rejet).
  - Gestion des règles de prix catalogue.
  - Import/Export de données (Produits, Clients, Commandes) au format CSV.
- **Clients & Marketing** : 
  - Gestion des groupes clients et règles de fidélité.
  - Système complet de Notifications Push (Création, Planification, Envoi immédiat, Activation/Désactivation).
  - Centre de notifications système avec compteur dynamique et marquage de lecture.
- **Configuration & Rapports** : 
  - Gestion des règles de taxes (TVA) et méthodes de livraison.
  - Configuration complète du site (SEO, Maintenance, Identité visuelle).
  - Tableaux de bord analytiques avancés (Ventes, Trafic, Appareils).

## 📂 Structure du Projet

Le projet est organisé de manière modulaire pour séparer les préoccupations :

- **src/frontend** : Contient toute la logique de l'interface utilisateur (React).
  - `components/` : Composants UI réutilisables.
  - `hooks/` : Hooks React personnalisés.
  - `views/` : Pages et vues principales de l'application.
  - `utils/` : Utilitaires frontend.
  - `presentation/` : Contextes et logique de présentation.
- **src/backend** : Contient la logique métier et l'infrastructure.
  - `firebase.ts` : Initialisation et configuration de Firebase.
  - `domain/` : Entités et interfaces métier.
  - `application/` : Cas d'utilisation (Use Cases).
  - `infrastructure/` : Implémentations techniques (Repositories).

## 🧪 Tests

Le projet utilise **Vitest** pour les tests unitaires.

- **Lancer les tests** :
  ```bash
  npx vitest run
  ```
- **Structure des tests** : Les fichiers de test sont situés à côté des fichiers qu'ils testent (ex: `GetProducts.test.ts`).

## 🛠 Technologies Utilisées

- **Frontend** : React 18, TypeScript, Vite
- **Backend / Base de données** : Firebase (Firestore, Auth) - Architecture 100% Serverless
- **Styling** : Tailwind CSS, Framer Motion (Animations)
- **Icônes** : Lucide React
- **Notifications** : Sonner
- **Graphiques** : Recharts

## 🚀 Lancement Rapide

1. Installez les dépendances :
   ```bash
   npm install
   ```

2. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

## 💡 Crédits

**Powered by Landry et Doleres (L et D)**

## 📄 Licence

**Tous droits réservés.** 

Ce projet est la propriété exclusive de **Landry**. Aucune utilisation, copie, modification ou distribution n'est autorisée sans le consentement exprès de l'auteur.
