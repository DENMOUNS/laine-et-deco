import { Product, Category, Order, User, Review, BlogPost, LoginLog, RequestLog, Notification, SalesStat, SiteConfig, ChatMessage, Conversation, Coupon, AdminRole, PromoEvent, Pack, PushNotification, Email, Expense, RMA, AbandonedCart, CustomerGroup, TaxRule, ShippingRule, CatalogPriceRule, NewsletterSubscriber, CommunityPost, Badge, UserProfile, City, NavItem, FAQ, Currency, FlashSale } from './types';

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Laine', slug: 'laine', image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=600', count: 45, status: 'active' },
  { id: '2', name: 'Décoration', slug: 'decoration', image: 'https://images.unsplash.com/photo-1513519247341-36ba339ae785?auto=format&fit=crop&q=80&w=600', count: 28, status: 'active' },
  { id: '3', name: 'Accessoires', slug: 'accessoires', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600', count: 15, status: 'active' },
  { id: '4', name: 'Kits', slug: 'kits', image: 'https://images.unsplash.com/photo-1544605510-99757736f165?auto=format&fit=crop&q=80&w=600', count: 12, status: 'active' },
  { id: '5', name: 'Modèles', slug: 'modeles', image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&q=80&w=600', count: 34, status: 'active' },
  { id: '6', name: 'Artisanat', slug: 'artisanat', image: 'https://images.unsplash.com/photo-1510072898748-0ffd0aa22146?auto=format&fit=crop&q=80&w=600', count: 14, status: 'active' },
  { id: '7', name: 'Électronique', slug: 'electronique', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=600', count: 18, status: 'active' }
];

export const NAV_ITEMS: NavItem[] = [
  { id: 'nav-2', name: 'Boutique', view: 'shop', order: 1, status: 'active', position: 'top', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'nav-1', name: 'Accueil', view: 'home', order: 2, status: 'active', position: 'side', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'nav-3', name: 'Lookbook', view: 'lookbook', order: 3, status: 'active', position: 'side', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'nav-4', name: 'Sur Mesure', view: 'custom-order', order: 4, status: 'active', position: 'side', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'nav-5', name: 'Compagnon Tricot', view: 'knitting-companion', order: 5, status: 'active', position: 'side', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'nav-6', name: 'Générateur IA', view: 'pattern-generator', order: 6, status: 'active', position: 'side', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'nav-7', name: 'Blog Inspirations', view: 'blog', order: 7, status: 'active', position: 'side', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'nav-8', name: 'Calculateur de Laine', view: 'calculator', order: 8, status: 'active', position: 'side', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'nav-9', name: 'Calculateur de Volume', view: 'volume-calculator', order: 9, status: 'active', position: 'side', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'nav-10', name: 'FAQ', view: 'faq', order: 10, status: 'active', position: 'side', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'nav-11', name: 'À propos', view: 'about', order: 11, status: 'active', position: 'side', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'nav-11-5', name: 'Équipe', view: 'team', order: 11.5, status: 'active', position: 'side', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'nav-13', name: 'Contactez-nous', view: 'contact', order: 13, status: 'active', position: 'side', createdAt: '2024-01-01T00:00:00Z' }
];

export const FAQ_ITEMS: FAQ[] = [
  {
    id: 'faq-1',
    category: 'Livraison',
    question: "Quels sont les délais de livraison ?",
    answer: "Pour Douala et Yaoundé, comptez 24h à 48h. Pour les autres villes du Cameroun, entre 3 et 5 jours ouvrés. Les livraisons internationales dépendent du transporteur choisi (DHL, FedEx) et prennent généralement 7 à 10 jours.",
    order: 1,
    status: 'active'
  },
  {
    id: 'faq-2',
    category: 'Livraison',
    question: "Combien coûte la livraison ?",
    answer: "La livraison à Douala est de 1 500 FCFA, 2 500 FCFA pour Yaoundé, et à partir de 3 500 FCFA pour les autres villes. La livraison est GRATUITE dès 200 000 FCFA d'achat.",
    order: 2,
    status: 'active'
  },
  {
    id: 'faq-3',
    category: 'Commandes',
    question: "Comment puis-je suivre ma commande ?",
    answer: "Une fois votre commande validée, vous recevez un numéro de suivi (ex: ORD-001). Allez dans la section 'Suivi de commande' de notre site pour voir l'état en temps réel.",
    order: 3,
    status: 'active'
  },
  {
    id: 'faq-4',
    category: 'Commandes',
    question: "Puis-je modifier ou annuler ma commande ?",
    answer: "Vous pouvez modifier ou annuler votre commande dans les 2 heures suivant la validation, tant qu'elle n'est pas passée en statut 'En préparation'. Contactez-nous rapidement sur WhatsApp.",
    order: 4,
    status: 'active'
  },
  {
    id: 'faq-5',
    category: 'Paiements',
    question: "Quels modes de paiement acceptez-vous ?",
    answer: "Nous acceptons les paiements via Orange Money, MTN Mobile Money, les virements bancaires et les cartes bancaires internationales via notre passerelle sécurisée.",
    order: 5,
    status: 'active'
  },
  {
    id: 'faq-6',
    category: 'Produits',
    question: "Les articles sont-ils garantis ?",
    answer: "La plupart de nos articles artisanaux bénéficient d'une garantie de satisfaction. En cas de défaut de fabrication constaté dès la réception, nous procédons à un échange ou un remboursement.",
    order: 6,
    status: 'active'
  },
  {
    id: 'faq-7',
    category: 'Sur Mesure',
    question: "Comment fonctionne le service 'Sur Mesure' ?",
    answer: "Il vous suffit de nous soumettre votre projet via le formulaire dédié. Nous étudions la faisabilité, vous envoyons un devis sous 48h, et lançons la réalisation après un acompte de 50%.",
    order: 7,
    status: 'active'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'p-tech1',
    name: 'Casque Audio Sans Fil Pro',
    slug: 'casque-audio-sans-fil-pro',
    price: 85000,
    oldPrice: 110000,
    category: 'Électronique',
    isElectronic: true,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=600',
    description: 'Immersion sonore totale avec réduction de bruit active. Design minimaliste qui s\'accorde avec tous vos styles.',
    stock: 25,
    rating: 4.8,
    isNew: true,
    isAvailable: true,
    material: 'Aluminium brossé et cuir protéiné',
    colors: ['#000000', '#F5F5F5'],
    views: 3200,
    salesCount: 45,
    brand: 'TechAura',
    purchasePrice: 50000
  },
  {
    id: 'p-tech2',
    name: 'Montre Connectée Élégance',
    slug: 'montre-connectee-elegance',
    price: 65000,
    category: 'Électronique',
    isElectronic: true,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=600',
    description: 'Suivez vos performances et votre santé tout en gardant une allure sophistiquée.',
    stock: 12,
    rating: 4.7,
    isAvailable: true,
    material: 'Acier inoxydable',
    views: 1850,
    salesCount: 15,
    brand: 'TimeTech',
    purchasePrice: 35000
  },
  {
    id: 'p-tech3',
    name: 'Tablette Pro Edition',
    slug: 'tablette-pro-edition',
    price: 250000,
    category: 'Électronique',
    isElectronic: true,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=600',
    description: 'La puissance informatique alliée à un écran bord à bord parfait pour créer, jouer ou travailler.',
    stock: 8,
    rating: 4.9,
    isAvailable: true,
    material: 'Aluminium et verre',
    views: 5600,
    salesCount: 10,
    brand: 'Laine et Déco',
    purchasePrice: 200000
  },
  {
    id: 'p-artisanat1',
    name: 'Poudre de Gypsum Premium (1kg)',
    slug: 'poudre-gypsum-premium',
    price: 4500,
    category: 'Artisanat',
    image: 'https://images.unsplash.com/photo-1510072898748-0ffd0aa22146?auto=format&fit=crop&q=80&w=600',
    description: 'Poudre de gypse extra fine pour la fabrication de moules et objets décoratifs. Durcissement rapide.',
    stock: 50,
    rating: 4.7,
    isNew: true,
    isAvailable: true,
    material: 'Gypse naturel',
    views: 1200,
    salesCount: 35,
    brand: 'Artisanat Pro',
    purchasePrice: 2000
  },
  {
    id: 'p-artisanat2',
    name: 'Moule en Silicone Géométrique',
    slug: 'moule-silicone-geometrique',
    price: 8500,
    category: 'Artisanat',
    image: 'https://images.unsplash.com/photo-1620600322304-44cc21204d16?auto=format&fit=crop&q=80&w=600',
    description: 'Moule réutilisable en silicone haute qualité. Idéal pour bougies, résine et objets en gypsum.',
    stock: 30,
    rating: 4.9,
    isAvailable: true,
    material: 'Silicone',
    views: 890,
    salesCount: 22,
    brand: 'Artisanat Pro',
    purchasePrice: 4000
  },
  {
    id: 'p-artisanat3',
    name: 'Machine de Moulage Sous Vide',
    slug: 'machine-moulage-sous-vide',
    price: 150000,
    oldPrice: 180000,
    category: 'Artisanat',
    isElectronic: true,
    image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=600',
    description: 'Appareil professionnel pour créer des moules parfaits sans bulles d\'air. Indispensable pour la coulée de précision.',
    stock: 5,
    rating: 5.0,
    isAvailable: true,
    material: 'Acier et composants électriques',
    views: 4500,
    salesCount: 3,
    brand: 'MouldTech',
    purchasePrice: 100000
  },
  {
    id: 'p1',
    name: 'Laine Mérinos Extra Fine',
    slug: 'laine-merinos-extra-fine',
    price: 8500,
    oldPrice: 9500,
    category: 'Laine',
    image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=600',
    description: 'Une laine d\'une douceur exceptionnelle, idéale pour les vêtements de bébé et les peaux sensibles.',
    stock: 150,
    rating: 4.9,
    isNew: true,
    isAvailable: true,
    material: '100% Mérinos',
    colors: ['#FFFFFF', '#F5F5DC', '#8B4513', '#000080'],
    reviews: [
      { id: 'r1', userName: 'Marie L.', rating: 5, comment: 'Magnifique qualité, je recommande !', date: '2024-02-15' }
    ],
    views: 1250,
    salesCount: 85,
    brand: 'Laine et Déco',
    purchasePrice: 4200
  },
  {
    id: 'p2',
    name: 'Vase en Céramique Artisanale',
    slug: 'vase-en-ceramique-artisanale',
    price: 25000,
    category: 'Décoration',
    image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&q=80&w=600',
    description: 'Vase fait main par des artisans locaux, chaque pièce est unique.',
    stock: 12,
    rating: 4.7,
    isAvailable: true,
    material: 'Terre cuite',
    reviews: [],
    views: 850,
    salesCount: 5,
    brand: 'Artisans du Cameroun',
    purchasePrice: 15000
  },
  {
    id: 'p3',
    name: 'Aiguilles à Tricoter en Bambou',
    slug: 'aiguilles-a-tricoter-en-bambou',
    price: 4500,
    category: 'Accessoires',
    image: 'https://images.unsplash.com/photo-1599406561184-2195dfb4257f?auto=format&fit=crop&q=80&w=600',
    description: 'Aiguilles légères et durables pour un confort de tricot optimal.',
    stock: 45,
    rating: 4.5,
    isAvailable: true,
    material: 'Bambou',
    views: 450,
    salesCount: 28,
    purchasePrice: 1800
  },
  {
    id: 'p4',
    name: 'Plaid en Grosse Maille',
    slug: 'plaid-en-grosse-maille',
    price: 45000,
    oldPrice: 55000,
    category: 'Décoration',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600',
    description: 'Un plaid ultra chaleureux pour vos soirées d\'hiver.',
    stock: 8,
    rating: 5.0,
    isSale: true,
    isAvailable: true,
    material: 'Laine XXL',
    views: 2100,
    salesCount: 15,
    purchasePrice: 22000
  },
  {
    id: 'p5',
    name: 'Kit Crochet Débutant - Panier',
    slug: 'kit-crochet-debutant-panier',
    price: 12500,
    category: 'Kits',
    image: 'https://images.unsplash.com/photo-1544605510-99757736f165?auto=format&fit=crop&q=80&w=600',
    description: 'Apprenez à crocheter votre propre panier de rangement avec ce kit complet.',
    stock: 25,
    rating: 4.8,
    isAvailable: true,
    views: 650,
    salesCount: 18,
    purchasePrice: 6000
  },
  {
    id: 'p6',
    name: 'Laine Alpaga Royale',
    slug: 'laine-alpaga-royale',
    price: 12000,
    category: 'Laine',
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&q=80&w=600',
    description: 'Laine luxueuse d\'alpaga, d\'une légèreté et d\'une chaleur incomparables.',
    stock: 80,
    rating: 4.9,
    isAvailable: true,
    material: '100% Alpaga',
    views: 950,
    salesCount: 42,
    purchasePrice: 5500
  },
  {
    id: 'p7',
    name: 'Bougie Parfumée "Forêt Tropicale"',
    slug: 'bougie-parfumee-foret-tropicale',
    price: 7500,
    category: 'Décoration',
    image: 'https://images.unsplash.com/photo-1603006373366-0428f52ef058?auto=format&fit=crop&q=80&w=600',
    description: 'Une fragrance fraîche et boisée pour embaumer votre intérieur.',
    stock: 60,
    rating: 4.6,
    isAvailable: true,
    material: 'Cire de soja',
    views: 1100,
    salesCount: 55,
    purchasePrice: 3000
  },
  {
    id: 'p8',
    name: 'Sac à Projet en Toile',
    slug: 'sac-a-projet-en-toile',
    price: 9500,
    category: 'Accessoires',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
    description: 'Le sac idéal pour transporter vos encours de tricot partout avec vous.',
    stock: 30,
    rating: 4.7,
    isAvailable: true,
    material: 'Coton bio',
    views: 350,
    salesCount: 12,
    purchasePrice: 4000
  },
  {
    id: 'p9',
    name: 'Modèle PDF "Pull Nuage"',
    slug: 'modele-pdf-pull-nuage',
    price: 3500,
    category: 'Modèles',
    image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&q=80&w=600',
    description: 'Patron détaillé pour réaliser un pull vaporeux et moderne.',
    stock: 999,
    rating: 4.9,
    isAvailable: true,
    views: 1500,
    salesCount: 120,
    purchasePrice: 0
  },
  {
    id: 'p10',
    name: 'Macramé Mural "Soleil"',
    slug: 'macrame-mural-soleil',
    price: 18500,
    category: 'Décoration',
    image: 'https://images.unsplash.com/photo-1563214811-0bbcd9991207?auto=format&fit=crop&q=80&w=600',
    description: 'Décoration murale en coton naturel pour une touche bohème.',
    stock: 15,
    rating: 4.8,
    isAvailable: true,
    material: 'Coton recyclé',
    views: 750,
    salesCount: 8,
    purchasePrice: 8500
  },
  {
    id: 'p11',
    name: 'Laine Coton Bio',
    slug: 'laine-coton-bio',
    price: 5500,
    category: 'Laine',
    image: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&q=80&w=600',
    description: 'Coton biologique certifié, parfait pour les vêtements d\'été.',
    stock: 200,
    rating: 4.7,
    isAvailable: true,
    material: '100% Coton Bio',
    views: 800,
    salesCount: 65,
    purchasePrice: 2500
  },
  {
    id: 'p12',
    name: 'Miroir Soleil en Rotin',
    slug: 'miroir-soleil-en-rotin',
    price: 32000,
    category: 'Décoration',
    image: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=600',
    description: 'Miroir décoratif en rotin naturel tressé à la main.',
    stock: 5,
    rating: 4.9,
    isAvailable: true,
    material: 'Rotin',
    views: 1400,
    salesCount: 3,
    purchasePrice: 18000
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'b1',
    title: '5 Conseils pour débuter le tricot',
    excerpt: 'Le tricot est une activité relaxante et créative. Voici comment bien commencer.',
    content: 'Contenu complet de l\'article sur le tricot...',
    image: 'https://picsum.photos/seed/blog1/800/400',
    date: '2024-03-01',
    author: 'Marie Claire',
    category: 'Conseils'
  },
  {
    id: 'b2',
    title: 'Tendances Déco 2024 : Le Naturel à l\'honneur',
    excerpt: 'Découvrez comment intégrer des matières naturelles dans votre intérieur.',
    content: 'Contenu complet de l\'article sur la déco...',
    image: 'https://picsum.photos/seed/blog2/800/400',
    date: '2024-02-15',
    author: 'Jean-Paul D.',
    category: 'Décoration'
  }
];

export const ORDERS: Order[] = [
  {
    id: 'ORD-2024-001',
    customer: 'Landry M.',
    userId: 'u1',
    date: '2024-03-10',
    total: 17000,
    status: 'delivered',
    items: 2,
    paymentMethod: 'Orange Money',
    address: 'Bastos, Yaoundé',
    orderDetails: [
      { id: 'item-1', productId: 'p1', quantity: 2, price: 8500, name: 'Laine Mérinos Extra Fine' }
    ]
  },
  {
    id: 'ORD-2024-002',
    customer: 'Alice B.',
    userId: 'u2',
    date: '2024-03-12',
    total: 32500,
    status: 'processing',
    items: 3,
    paymentMethod: 'Carte Bancaire',
    address: 'Akwa, Douala',
    orderDetails: [
      { id: 'item-2', productId: 'p2', quantity: 1, price: 25000, name: 'Vase en Céramique Artisanale' },
      { id: 'item-3', productId: 'p7', quantity: 1, price: 7500, name: 'Bougie Parfumée "Forêt Tropicale"' }
    ]
  }
];

export const USERS: User[] = [
  { id: 'u1', name: 'Landry M.', email: 'landrymoutongo97@gmail.com', role: 'super-admin', joinDate: '2023-01-15', orders: 5, status: 'active', points: 10000, loyaltyTier: 'Platinum' },
  { id: 'u2', name: 'Marie T.', email: 'marie@test.fr', role: 'editor', joinDate: '2023-05-20', orders: 2, status: 'active', points: 450, loyaltyTier: 'Bronze' },
  { id: 'u3', name: 'Jean K.', email: 'jean@gmail.com', role: 'stock-manager', joinDate: '2023-11-02', orders: 0, status: 'inactive', points: 0, loyaltyTier: 'Bronze' },
  { id: 'u4', name: 'Paul Martin', email: 'paul@martin.com', role: 'support-client', joinDate: '2024-01-10', orders: 1, status: 'active', points: 150, loyaltyTier: 'Bronze' },
  { id: 'u5', name: 'Alice Client', email: 'alice@client.com', role: 'customer', joinDate: '2024-02-10', orders: 3, status: 'active', points: 300, loyaltyTier: 'Silver' }
];

export const LOGIN_LOGS: LoginLog[] = [
  { id: 'l1', userId: 'u1', userName: 'Landry M.', timestamp: '2024-03-15 08:30', ip: '192.168.1.1', device: 'Chrome / Windows' },
  { id: 'l2', userId: 'u2', userName: 'Marie T.', timestamp: '2024-03-15 09:15', ip: '192.168.1.5', device: 'Safari / iPhone' }
];

export const REQUEST_LOGS: RequestLog[] = [
  { id: 'req1', method: 'GET', path: '/api/products', status: 200, timestamp: '2024-03-15 10:00:01', duration: '45ms' },
  { id: 'req2', method: 'POST', path: '/api/orders', status: 201, timestamp: '2024-03-15 10:05:22', duration: '120ms' }
];

export const NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'order', title: 'Nouvelle commande', message: 'Commande ORD-2024-002 reçue', timestamp: 'Il y a 5 min', read: false, relatedId: 'ORD-2024-002' },
  { id: 'n2', type: 'stock', title: 'Alerte stock', message: 'Le produit "Vase Céramique" est presque épuisé', timestamp: 'Il y a 1h', read: true, relatedId: 'p2' }
];

export const SALES_DATA: SalesStat[] = [
  { name: 'Jan', sales: 450000, orders: 45 },
  { name: 'Fév', sales: 520000, orders: 52 },
  { name: 'Mar', sales: 480000, orders: 48 },
  { name: 'Avr', sales: 610000, orders: 61 },
  { name: 'Mai', sales: 590000, orders: 59 },
  { name: 'Juin', sales: 720000, orders: 72 }
];

export const CATEGORY_DISTRIBUTION = [
  { name: 'Laine', value: 45 },
  { name: 'Décoration', value: 30 },
  { name: 'Accessoires', value: 15 },
  { name: 'Kits', value: 10 }
];

export const DEVICE_DATA = [
  { name: 'Mobile', value: 65 },
  { name: 'Desktop', value: 25 },
  { name: 'Tablet', value: 10 }
];

export const TRAFFIC_SOURCES = [
  { name: 'Direct', value: 40 },
  { name: 'Social', value: 35 },
  { name: 'Search', value: 20 },
  { name: 'Referral', value: 5 }
];

export const RETENTION_DATA = [
  { name: 'Semaine 1', value: 100 },
  { name: 'Semaine 2', value: 75 },
  { name: 'Semaine 3', value: 60 },
  { name: 'Semaine 4', value: 45 }
];

export const REVENUE_BY_PAYMENT = [
  { name: 'OM', value: 45 },
  { name: 'Momo', value: 35 },
  { name: 'Card', value: 20 }
];

export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'cp1',
    userName: 'Sophie_Knit',
    userImage: 'https://picsum.photos/seed/user1/100/100',
    image: 'https://picsum.photos/seed/post1/800/800',
    description: 'Enfin terminé mon pull en laine mérinos ! Tellement doux 😍',
    likes: 124,
    productsUsed: ['p1']
  },
  {
    id: 'cp2',
    userName: 'Art_Home',
    userImage: 'https://picsum.photos/seed/user2/100/100',
    image: 'https://picsum.photos/seed/post2/800/800',
    description: 'Nouvelle déco avec ce vase magnifique.',
    likes: 85,
    productsUsed: ['p2']
  }
];

export const BADGES: Badge[] = [
  { id: 'b1', name: 'Premier Achat', icon: '🛍️', description: 'Bienvenue dans la famille !', unlocked: true, badgeType: 'bronze' },
  { id: 'b2', name: 'Fidèle Client', icon: '⭐', description: 'Plus de 5 commandes passées', unlocked: false, badgeType: 'silver', autoAssignRule: { type: 'orders', threshold: 5 } },
  { id: 'b3', name: 'Expert Tricot', icon: '🧶', description: 'A partagé 3 créations', unlocked: false, badgeType: 'gold' }
];

export const INITIAL_CITIES: City[] = [
  { id: 'yaounde', name: 'Yaoundé', slug: 'yaounde', deliveryPrice: 1500, status: 'active' },
  { id: 'douala', name: 'Douala', slug: 'douala', deliveryPrice: 2000, status: 'active' },
  { id: 'garoua', name: 'Garoua', slug: 'garoua', deliveryPrice: 3500, status: 'active' },
  { id: 'bamenda', name: 'Bamenda', slug: 'bamenda', deliveryPrice: 3000, status: 'active' },
  { id: 'maroua', name: 'Maroua', slug: 'maroua', deliveryPrice: 4000, status: 'active' },
  { id: 'bafoussam', name: 'Bafoussam', slug: 'bafoussam', deliveryPrice: 2500, status: 'active' },
  { id: 'edea', name: 'Edéa', slug: 'edea', deliveryPrice: 2000, status: 'active' },
  { id: 'nkongsamba', name: 'Nkongsamba', slug: 'nkongsamba', deliveryPrice: 2500, status: 'active' },
  { id: 'ngaoundere', name: 'Ngaoundéré', slug: 'ngaoundere', deliveryPrice: 3500, status: 'active' },
  { id: 'dschang', name: 'Dschang', slug: 'dschang', deliveryPrice: 2500, status: 'active' },
  { id: 'limbe', name: 'Limbe', slug: 'limbe', deliveryPrice: 2500, status: 'active' },
  { id: 'bertoua', name: 'Bertoua', slug: 'bertoua', deliveryPrice: 3000, status: 'active' },
  { id: 'kumba', name: 'Kumba', slug: 'kumba', deliveryPrice: 3000, status: 'active' },
  { id: 'foumban', name: 'Foumban', slug: 'foumban', deliveryPrice: 2800, status: 'active' },
  { id: 'foumbot', name: 'Foumbot', slug: 'foumbot', deliveryPrice: 2800, status: 'active' },
  { id: 'mbouda', name: 'Mbouda', slug: 'mbouda', deliveryPrice: 2500, status: 'active' },
  { id: 'meiganga', name: 'Meiganga', slug: 'meiganga', deliveryPrice: 3800, status: 'active' },
  { id: 'guider', name: 'Guider', slug: 'guider', deliveryPrice: 4000, status: 'active' },
  { id: 'yagoua', name: 'Yagoua', slug: 'yagoua', deliveryPrice: 4500, status: 'active' },
  { id: 'mora', name: 'Mora', slug: 'mora', deliveryPrice: 4500, status: 'active' },
  { id: 'kousseri', name: 'Kousséri', slug: 'kousseri', deliveryPrice: 5000, status: 'active' },
  { id: 'mutengene', name: 'Mutengene', slug: 'mutengene', deliveryPrice: 2800, status: 'active' },
  { id: 'bali', name: 'Bali', slug: 'bali', deliveryPrice: 3200, status: 'active' },
  { id: 'melong', name: 'Melong', slug: 'melong', deliveryPrice: 2800, status: 'active' },
  { id: 'sangmelima', name: 'Sangmélima', slug: 'sangmelima', deliveryPrice: 2500, status: 'active' }
];

export interface InitialCurrencies extends Array<Currency> {}
export const CURRENCIES: Currency[] = [
  { id: '1', code: 'XAF', name: 'Franc CFA', symbol: 'FCFA', rate: 1, status: 'active' },
  { id: '2', code: 'EUR', name: 'Euro', symbol: '€', rate: 655.95, status: 'active' },
  { id: '3', code: 'USD', name: 'Dollar US', symbol: '$', rate: 600, status: 'active' },
];

export const USER_PROFILE: UserProfile = {
  id: 'u1',
  name: 'Landry M.',
  email: 'landrymoutongo97@gmail.com',
  points: 10000,
  badges: BADGES.filter(b => b.unlocked),
  orders: ['ORD-2024-001']
};

export const EXPENSES: Expense[] = [
  { id: 'ex1', description: 'Achat stock laine', amount: 150000, date: '2024-03-01', category: 'stock', status: 'verified' },
  { id: 'ex2', description: 'Publicité Facebook', amount: 25000, date: '2024-03-05', category: 'marketing', status: 'verified' },
  { id: 'ex3', description: 'Frais de livraison', amount: 12000, date: '2024-03-10', category: 'transport', status: 'pending' }
];

export const REVIEWS: Review[] = [
  { id: 'rev1', userName: 'Marie L.', rating: 5, comment: 'Magnifique qualité, je recommande !', date: '2024-02-15', productId: 'p1', productName: 'Laine Mérinos Extra Fine', status: 'approved' },
  { id: 'rev2', userName: 'Jean D.', rating: 4, comment: 'Très beau vase, un peu plus petit que prévu.', date: '2024-03-01', productId: 'p2', productName: 'Vase en Céramique Artisanale', status: 'approved' }
];

export const RMAS: RMA[] = [
  { id: 'RMA-001', orderId: 'ORD-2024-001', customer: 'Landry M.', reason: 'Produit endommagé', status: 'pending', date: '2024-03-12', amount: 8500 }
];

export const ABANDONED_CARTS: AbandonedCart[] = [
  { id: 'ac1', customer: 'Inconnu', email: 'test@example.com', date: '2024-03-14 15:30', total: 12000, items: 2, status: 'abandoned' }
];

export const CUSTOMER_GROUPS: CustomerGroup[] = [
  { id: 'g1', name: 'Standard', discountPercentage: 0, status: 'active' },
  { id: 'g2', name: 'VIP', discountPercentage: 10, status: 'active' },
  { id: 'g3', name: 'Grossiste', discountPercentage: 25, status: 'active' }
];

export const TAX_RULES: TaxRule[] = [
  { id: 't1', name: 'TVA Cameroun', rate: 19.25, country: 'Cameroun', status: 'active' }
];

export const SHIPPING_RULES: ShippingRule[] = [
  { id: 's1', name: 'Livraison Standard Yaoundé', condition: 'Yaoundé', price: 1500, status: 'active', type: 'zone' },
  { id: 's2', name: 'Livraison Standard Douala', condition: 'Douala', price: 2500, status: 'active', type: 'zone' },
  { id: 's3', name: 'Gratuit dès 200.000 FCFA', condition: 'Total > 200000', price: 0, status: 'active', type: 'threshold' }
];

export const CATALOG_PRICE_RULES: CatalogPriceRule[] = [
  { id: 'cpr1', name: 'Promo Laine Mars', discountPercentage: 15, startDate: '2024-03-01', endDate: '2024-03-31', status: 'active', createdAt: '2024-03-01T00:00:00Z' }
];

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'conv1',
    userId: 'u2',
    userName: 'Marie T.',
    lastMessage: 'Merci pour votre aide !',
    timestamp: 'Il y a 2h',
    unreadCount: 0,
    messages: [
      { id: 'm1', senderId: 'u2', senderName: 'Marie T.', message: 'Bonjour, avez-vous du stock pour la laine bleue ?', timestamp: '10:00', isAdmin: false },
      { id: 'm2', senderId: 'admin', senderName: 'Admin', message: 'Oui, il nous en reste 5 pelotes.', timestamp: '10:05', isAdmin: true },
      { id: 'm3', senderId: 'u2', senderName: 'Marie T.', message: 'Merci pour votre aide !', timestamp: '10:10', isAdmin: false }
    ]
  },
  {
    id: 'conv2',
    userId: 'u4',
    userName: 'Paul Martin',
    lastMessage: 'Merci pour votre réponse rapide !',
    timestamp: 'Il y a 1 jour',
    unreadCount: 0,
    messages: [
      { id: 'm4', senderId: 'u4', senderName: 'Paul Martin', message: 'Merci pour votre réponse rapide !', timestamp: '2 jours 10:15', isAdmin: false }
    ]
  }
];

export const PROMO_EVENTS: PromoEvent[] = [
  {
    id: 'e1',
    name: 'Soldes d\'Hiver',
    startDate: '2024-01-01T00:00:00',
    endDate: '2024-02-28T23:59:59',
    discountPercentage: 20,
    applyToAll: true,
    status: 'expired'
  },
  {
    id: 'e2',
    name: 'Vente Flash Printemps',
    startDate: '2024-03-15T09:00:00',
    endDate: '2024-03-15T21:00:00',
    discountPercentage: 15,
    applyToAll: false,
    productIds: ['p1', 'p2'],
    status: 'scheduled'
  }
];

export const DEFAULT_FLASH_SALES: FlashSale[] = [
  {
    id: 'flash-default',
    name: 'Vente Flash Laine et Déco',
    endDate: '2099-12-31T23:59:59',
    status: 'active',
    items: [
      { productId: 'p1', flashPrice: 6800, totalQuantity: 24, soldQuantity: 4 },
      { productId: 'p-tech1', flashPrice: 75000, totalQuantity: 10, soldQuantity: 2 },
      { productId: 'p12', flashPrice: 12000, totalQuantity: 18, soldQuantity: 5 },
      { productId: 'p-tech2', flashPrice: 42000, totalQuantity: 12, soldQuantity: 3 },
    ],
  },
];

export const SITE_CONFIG: SiteConfig = {
  id: 'global',
  primaryColor: '#3E4A3D',
  accentColor: '#5C6B5A',
  showAdBanner: true,
  adBannerText: "🎉 Offre de lancement : Livraison gratuite à partir de 200 000 FCFA d'achat avec le code BIENVENUE",
  loyaltyConfig: {
    pointsPerPurchase: 10,
    pointsPerReview: 50,
    badges: BADGES,
    levels: [
      { groupId: 'g1', minPoints: 0 },
      { groupId: 'g2', minPoints: 500 },
      { groupId: 'g3', minPoints: 2000 }
    ]
  },
  homeFeaturedProducts: ['p1', 'p-tech1', 'p12', 'p-tech2'],
  homeFeaturedCategories: ['1', '7', '6', '3'],
  showSlider: true,
  sliderItems: [
    { id: 's1', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200', title: 'Nouvelle Collection', subtitle: 'L\'alliance parfaite entre élégance et tendance' },
    { id: 's2', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200', title: 'Boutique Premium', subtitle: 'Découvrez notre sélection exclusive' },
  ],
  customSections: [
    { id: 'cs1', title: 'Nos Coups de Cœur', type: 'products', itemIds: ['p-tech1', 'p3', 'p5'] }
  ],
  maintenance: {
    isActive: false,
    message: 'Notre site est actuellement en maintenance. Nous serons de retour très bientôt !'
  },
  branding: {
    primaryColor: '#1A1A1A',
    secondaryColor: '#B85535'
  },
  features: [
    { iconName: "Package", title: "Qualité Premium", description: "Laines 100% naturelles" },
    { iconName: "Truck", title: "Livraison Rapide", description: "Offerte dès 200 000 FCFA" },
    { iconName: "ShieldCheck", title: "Paiement Sécurisé", description: "Transaction 100% protégée" },
    { iconName: "Heart", title: "Fait avec Amour", description: "Sélection artisanale" },
  ],
  seo: {
    home: { title: 'Laine et Déco - Boutique Artisanale', description: 'Découvrez notre sélection variée, laines de qualité et objets de décoration artisanaux.' },
    shop: { title: 'Boutique Laine et Déco | Artisanat & Déco', description: 'Explorez notre catalogue de laines, kits et objets de décoration faits main.' },
    contact: { title: 'Contactez Laine et Déco', description: 'Une question ? Notre équipe d\'artisans est à votre écoute.' },
    about: { title: 'À propos de Laine et Déco', description: 'Découvrez notre passion pour l\'artisanat et notre engagement.' },
    team: { title: 'Notre Équipe - Laine et Déco', description: 'Découvrez les talents derrière Laine et Déco.' },
    cart: { title: 'Mon Panier - Laine et Déco', description: 'Finalisez votre commande.' },
    wishlist: { title: 'Ma Wishlist - Laine et Déco', description: 'Retrouvez vos articles favoris.' },
    comparison: { title: 'Comparateur - Laine et Déco', description: 'Comparez nos produits.' },
    lookbook: { title: 'Lookbook - Laine et Déco', description: 'Inspirations et styles.' },
    'custom-order': { title: 'Sur Mesure - Laine et Déco', description: 'Votre projet personnalisé.' },
    'knitting-companion': { title: 'Compagnon Tricot - Laine et Déco', description: 'Aide à vos projets.' },
    'pattern-generator': { title: 'Générateur IA - Laine et Déco', description: 'Créez vos motifs uniques.' },
    blog: { title: 'Blog - Laine et Déco', description: 'Inspirations et conseils.' },
    calculator: { title: 'Calculateur - Laine et Déco', description: 'Calculez vos besoins.' },
    'volume-calculator': { title: 'Calculateur Volume - Laine et Déco', description: 'Calculez vos volumes.' },
    faq: { title: 'FAQ - Laine et Déco', description: 'Questions fréquentes.' },
    loyalty: { title: 'Points VIP - Laine et Déco', description: 'Votre programme fidélité.' }
  },
  hero: {
    title: 'Créez une atmosphère chic et authentique',
    description: 'Une sélection unique de laines artisanales et de décoration d\'exception.',
    backgroundImages: ['https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1200'],
    ctaText: 'Découvrir la collection'
  },
  marqueeItems: [
    { id: 'm1', text: "LIVRAISON OFFERTE DÈS 200 000 FCFA", iconName: "Package" },
    { id: 'm2', text: "NOUVELLE COLLECTION DISPONIBLE", iconName: "Sparkles" },
    { id: 'm3', text: "TRICOTÉ AVEC AMOUR", iconName: "Heart" },
  ],
  newsletterPopup: {
    isActive: true,
    title: 'Rejoignez la communauté de L\'Atelier',
    message: 'Inscrivez-vous à notre newsletter pour recevoir nos conseils tricot et des offres exclusives.',
    delay: 5000,
    image: 'https://picsum.photos/seed/newsletter/800/1200'
  }
};

export const COUPONS: Coupon[] = [
  { id: 'c1', code: 'BIENVENUE10', discount: 10, type: 'percentage', expiryDate: '2025-12-31', usageLimit: 100, usageCount: 45, status: 'active' },
  { id: 'c2', code: 'PROMO2024', discount: 5000, type: 'fixed', expiryDate: '2024-12-31', usageLimit: 50, usageCount: 12, status: 'active' },
];

export const ADMIN_ROLES: AdminRole[] = [
  { id: 'super-admin', slug: 'super-admin', name: 'Super Admin', permissions: ['all'], description: 'Contrôle total du système', status: 'active' },
  { id: 'admin', slug: 'admin', name: 'Administrateur', permissions: ['dashboard.view', 'orders.view', 'products.view', 'categories.view', 'users.view', 'marketing.view', 'finance.view', 'content.view', 'reports.view', 'system.view'], description: 'Gestion complète sauf privilèges super-admin (création users, logs)', status: 'active' },
  { id: 'stock-manager', slug: 'stock-manager', name: 'Gestionnaire Stock', permissions: ['dashboard.view', 'products.view', 'products.edit', 'stock.view'], description: 'Gestion des produits et du stock', status: 'active' },
  { id: 'editor', slug: 'editor', name: 'Editeur', permissions: ['dashboard.view', 'blog.view', 'blog.edit', 'lookbook.view', 'lookbook.edit'], description: 'Gestion du contenu éditorial (Blog, Lookbook)', status: 'active' },
  { id: 'support-client', slug: 'support-client', name: 'Support Client', permissions: ['dashboard.view', 'messages.view', 'messages.reply', 'orders.view'], description: 'Gestion des commandes, des retours et de la messagerie.', status: 'active' },
];

export const PUSH_NOTIFICATIONS: PushNotification[] = [
  { id: 'pn1', title: 'Nouvelle Collection', message: 'Découvrez nos nouveautés !', sentAt: '2024-03-05 10:00', status: 'sent' }
];

export const EMAILS: Email[] = [
  { id: 'e1', subject: 'Bienvenue', recipient: 'client@example.com', content: 'Bienvenue chez nous !', sentAt: '2024-03-05 11:00', status: 'sent' }
];

export const SUBSCRIBERS: NewsletterSubscriber[] = [
  { id: 'sub1', email: 'landry@example.com', subscribedAt: '2024-03-01', status: 'active' },
  { id: 'sub2', email: 'marie@test.fr', subscribedAt: '2024-03-10', status: 'active' },
  { id: 'sub3', email: 'jean@gmail.com', subscribedAt: '2024-03-12', status: 'unsubscribed' },
];

export const CHAT_MESSAGES: ChatMessage[] = [
  { id: 'm1', senderId: 'u2', senderName: 'Marie T.', message: 'Bonjour, avez-vous du stock pour la laine bleue ?', timestamp: '10:00', isAdmin: false },
  { id: 'm2', senderId: 'admin', senderName: 'Admin', message: 'Oui, il nous en reste 5 pelotes.', timestamp: '10:05', isAdmin: true }
];

export const LOOKBOOK_POSTS: any[] = [
  { 
    id: 'lp1', 
    title: 'Style Bohème', 
    image: 'https://picsum.photos/seed/look1/800/1200', 
    description: 'Un look naturel et élégant.',
    author: 'marie_knits',
    likes: 124,
    tags: ['bohème', 'laine-naturelle', 'déco'],
    productId: '1'
  },
  { 
    id: 'lp2', 
    title: 'Hiver Cocooning', 
    image: 'https://picsum.photos/seed/look2/800/1000', 
    description: 'Restez au chaud avec style.',
    author: 'lucas_créations',
    likes: 89,
    tags: ['hiver', 'confort', 'fait-main'],
    productId: '2'
  },
  { 
    id: 'lp3', 
    title: 'Élégance Nordique', 
    image: 'https://picsum.photos/seed/look3/800/1100', 
    description: 'Minimalisme et chaleur.',
    author: 'sophie_knit',
    likes: 256,
    tags: ['scandinave', 'minimalisme', 'élégance'],
    productId: '3'
  }
];

export const PACKS: Pack[] = [
  {
    id: 'pack1',
    name: 'Pack Débutant Tricot',
    description: 'Tout le nécessaire pour bien commencer le tricot.',
    products: [
      { productId: 'p1', quantity: 2 },
      { productId: 'p5', quantity: 1 }
    ],
    promoCode: 'PACKDEBUTANT',
    discountPercentage: 10,
    status: 'active'
  },
  {
    id: 'pack2',
    name: 'Pack Cocooning Hiver',
    description: 'L\'ensemble parfait pour vos soirées d\'hiver au coin du feu.',
    products: [
      { productId: 'p4', quantity: 1 },
      { productId: 'p6', quantity: 1 },
      { productId: 'p7', quantity: 2 }
    ],
    promoCode: 'COCOONING20',
    discountPercentage: 15,
    status: 'active'
  },
  {
    id: 'pack3',
    name: 'Pack Déco Bohème',
    description: 'Transformez votre intérieur avec une touche artisanale et naturelle.',
    products: [
      { productId: 'p2', quantity: 1 },
      { productId: 'p10', quantity: 1 },
      { productId: 'p3', quantity: 1 }
    ],
    promoCode: 'BOHEME15',
    discountPercentage: 12
  }
];

export const INITIAL_PORTFOLIOS: any[] = [
  {
    id: 'landry',
    profileType: 'developer',
    memberId: 'landry',
    name: 'Landry',
    role: 'Développeur Fullstack',
    bio: 'Passionné par le développement web et les nouvelles technologies. J\'aime créer des expériences utilisateur fluides et performantes.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    email: 'landrymoutongo97@gmail.com',
    github: 'https://github.com/DENMOUNS',
    linkedin: 'https://www.linkedin.com/in/moutongoeric/',
    expertise: [
      { category: 'Frontend', skills: [{ name: 'React', iconUrl: 'react' }, { name: 'Next.js', iconUrl: 'nextjs' }, { name: 'Tailwind', iconUrl: 'tailwind' }] },
      { category: 'Backend', skills: [{ name: 'Node.js', iconUrl: 'nodejs' }, { name: 'Firebase', iconUrl: 'firebase' }, { name: 'SQL', iconUrl: 'sql' }] },
      { category: 'Langages', skills: [{ name: 'TypeScript', iconUrl: 'typescript' }, { name: 'JavaScript', iconUrl: 'javascript' }] }
    ],
    projects: [
      {
        id: 'p1',
        title: 'E-commerce Laine & Déco',
        description: 'Plateforme complète de vente en ligne avec gestion de stock et panel admin.',
        image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800',
        tech: ['React', 'Firebase', 'Tailwind'],
        link: '#'
      }
    ],
    experience: [
      {
        id: 'e1',
        role: 'Développeur Senior',
        company: 'Tech Solutions',
        startDate: '2022-01-01',
        isCurrent: true,
        description: 'Lead dev sur plusieurs projets SaaS et e-commerce.'
      }
    ],
    education: [
      {
        id: 'edu1',
        degree: 'Master en Informatique',
        school: 'Université Polytechnique',
        startDate: '2018-09-01',
        endDate: '2020-07-01'
      }
    ],
    certifications: [
      {
        id: 'c1',
        name: 'Google Cloud Professional Developer',
        issuer: 'Google',
        date: '2023-01-01'
      }
    ]
  },
  {
    id: 'laine-et-deco',
    profileType: 'manager',
    memberId: 'laine-et-deco',
    name: 'Laine et Deco',
    role: 'Gestionnaire de Projet & Créatrice',
    bio: 'Experte en gestion de projet avec une touche créative. Je m\'assure que chaque projet Laine & Déco est une réussite.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    email: 'contact@laineetdeco.com',
    expertise: [
      { category: 'Methodologie', skills: [{ name: 'Agile', iconUrl: 'agile' }, { name: 'Scrum', iconUrl: 'scrum' }, { name: 'Trello', iconUrl: 'trello' }] },
      { category: 'Outils', skills: [{ name: 'Figma', iconUrl: 'figma' }, { name: 'Canva', iconUrl: 'canva' }] }
    ],
    projects: [],
    experience: [],
    education: [],
    certifications: []
  }
];
