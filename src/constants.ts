import { Product, Category, Order, User, Review, BlogPost, Currency, LoginLog, RequestLog, Notification, SalesStat, Invoice, SiteConfig, ChatMessage, HomeSection } from './types';

export const REVIEWS: Review[] = [
  { id: 'r1', userName: 'Sophie L.', rating: 5, comment: 'La laine est incroyablement douce ! J\'ai hâte de commencer mon projet.', date: '2024-02-15' },
  { id: 'r2', userName: 'Marc D.', rating: 4, comment: 'Très beau vase, bien emballé. Un peu plus petit que ce que j\'imaginais.', date: '2024-02-20' },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'b1',
    title: '5 Astuces pour débuter le tricot',
    excerpt: 'Le tricot est une activité relaxante et créative. Voici nos conseils pour bien commencer.',
    content: 'Le tricot est bien plus qu\'un simple passe-temps. C\'est une forme de méditation active qui permet de créer des pièces uniques tout en réduisant le stress. Pour bien débuter, choisissez des aiguilles de taille moyenne (4mm ou 5mm) et une laine claire pour bien voir vos mailles...',
    image: 'https://picsum.photos/seed/blog1/800/600',
    date: '2024-02-10',
    author: 'Claire M.',
    category: 'Conseils'
  },
  {
    id: 'b2',
    title: 'Tendances Déco : Le retour du naturel',
    excerpt: 'Cette année, les matières organiques et les couleurs terreuses sont à l\'honneur.',
    content: 'La décoration intérieure évolue vers plus de simplicité. On délaisse le plastique pour le bois, la céramique et les fibres naturelles comme le lin ou le coton. Ces matières apportent une chaleur immédiate à n\'importe quelle pièce...',
    image: 'https://picsum.photos/seed/blog2/800/600',
    date: '2024-02-25',
    author: 'Julien R.',
    category: 'Tendances'
  }
];

export const CURRENCIES: Currency[] = [
  { code: 'XAF', symbol: 'FCFA', rate: 1, name: 'Franc CFA' },
  { code: 'EUR', symbol: '€', rate: 0.0015, name: 'Euro' },
  { code: 'USD', symbol: '$', rate: 0.0016, name: 'US Dollar' },
];

export const LOGIN_LOGS: LoginLog[] = [
  { id: 'l1', userId: 'u1', userName: 'Jean Dupont', timestamp: '2024-03-01 10:30', ip: '192.168.1.1', device: 'Chrome / Windows' },
  { id: 'l2', userId: 'u3', userName: 'Marie Curie', timestamp: '2024-03-01 11:15', ip: '192.168.1.5', device: 'Safari / iPhone' },
];

export const REQUEST_LOGS: RequestLog[] = [
  { id: 'req1', method: 'GET', path: '/api/products', status: 200, timestamp: '2024-03-01 12:00:01', duration: '45ms' },
  { id: 'req2', method: 'POST', path: '/api/cart/add', status: 201, timestamp: '2024-03-01 12:05:12', duration: '120ms' },
];

export const NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'order', title: 'Nouvelle commande', message: 'Jean Dupont vient de commander un Plaid en Grosse Maille.', timestamp: 'Il y a 5 min', read: false },
  { id: '2', type: 'stock', title: 'Stock faible', message: 'La Laine Mérinos est presque épuisée (2 restants).', timestamp: 'Il y a 20 min', read: false },
  { id: '3', type: 'inquiry', title: 'Nouvelle demande', message: 'Marie Curie demande des précisions sur les délais.', timestamp: 'Il y a 1 heure', read: true },
];

export const SALES_DATA: SalesStat[] = [
  { name: 'Jan', sales: 450000, orders: 45 },
  { name: 'Fév', sales: 520000, orders: 52 },
  { name: 'Mar', sales: 480000, orders: 48 },
  { name: 'Avr', sales: 610000, orders: 61 },
  { name: 'Mai', sales: 550000, orders: 55 },
  { name: 'Juin', sales: 670000, orders: 67 },
];

export const INVOICES: Invoice[] = [
  { id: 'INV-001', orderId: 'ORD-001', date: '2024-03-01', amount: 82000, status: 'paid' },
  { id: 'INV-002', orderId: 'ORD-002', date: '2024-03-02', amount: 29500, status: 'paid' },
];

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Laines Naturelles', image: 'https://picsum.photos/seed/wool1/400/500', count: 124 },
  { id: '2', name: 'Matériel de Tricot', image: 'https://picsum.photos/seed/knit/400/500', count: 45 },
  { id: '3', name: 'Décoration Murale', image: 'https://picsum.photos/seed/decor1/400/500', count: 89 },
  { id: '4', name: 'Coussins & Plaids', image: 'https://picsum.photos/seed/cushion/400/500', count: 67 },
  { id: '5', name: 'Bougies Artisanales', image: 'https://picsum.photos/seed/candle/400/500', count: 34 },
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Laine Mérinos Extra Fine',
    price: 8200,
    category: 'Laines Naturelles',
    image: 'https://picsum.photos/seed/merino/600/800',
    description: 'Une laine d\'une douceur incomparable, idéale pour les vêtements de bébé.',
    stock: 50,
    rating: 4.8,
    isNew: true,
    material: 'Mérinos',
    colors: ['#FFFFFF', '#F5F5DC', '#8B4513'],
    reviews: REVIEWS
  },
  {
    id: 'p2',
    name: 'Vase en Céramique Artisanale',
    price: 29500,
    category: 'Décoration Murale',
    image: 'https://picsum.photos/seed/vase/600/800',
    description: 'Fait main par nos artisans locaux, chaque pièce est unique.',
    stock: 12,
    rating: 4.9,
    material: 'Céramique',
    colors: ['#D2B48C', '#BC8F8F'],
    reviews: []
  },
  {
    id: 'p3',
    name: 'Kit de Macramé Débutant',
    price: 19600,
    category: 'Matériel de Tricot',
    image: 'https://picsum.photos/seed/macrame/600/800',
    description: 'Tout ce dont vous avez besoin pour créer votre première suspension murale.',
    stock: 25,
    rating: 4.5,
    isSale: true,
    material: 'Coton',
    colors: ['#F5F5DC'],
    reviews: []
  },
  {
    id: 'p4',
    name: 'Plaid en Grosse Maille',
    price: 58000,
    category: 'Coussins & Plaids',
    image: 'https://picsum.photos/seed/plaid/600/800',
    description: 'Chaleureux et décoratif, parfait pour vos soirées d\'hiver.',
    stock: 8,
    rating: 4.7,
    material: 'Laine acrylique',
    colors: ['#808080', '#2F4F4F'],
    reviews: []
  },
  {
    id: 'p5',
    name: 'Aiguilles en Bambou',
    price: 5500,
    category: 'Matériel de Tricot',
    image: 'https://picsum.photos/seed/needles/600/800',
    description: 'Légères et durables pour un tricotage fluide.',
    stock: 100,
    rating: 4.3,
    material: 'Bambou',
    colors: ['#DEB887'],
    reviews: []
  },
  {
    id: 'p6',
    name: 'Bougie Parfumée "Forêt"',
    price: 11800,
    category: 'Bougies Artisanales',
    image: 'https://picsum.photos/seed/candle2/600/800',
    description: 'Une odeur boisée qui transporte votre intérieur en pleine nature.',
    stock: 40,
    rating: 4.6,
    material: 'Cire de soja',
    colors: ['#FFFFFF'],
    reviews: []
  }
];

export const ORDERS: Order[] = [
  { 
    id: 'ORD-001', 
    customer: 'Jean Dupont', 
    date: '2024-03-01', 
    total: 82000, 
    status: 'delivered', 
    items: 3,
    paymentMethod: 'Paiement à la livraison',
    orderDetails: [
      { productId: 'p1', name: 'Laine Mérinos Extra Fine', quantity: 2, price: 8200 },
      { productId: 'p4', name: 'Plaid en Grosse Maille', quantity: 1, price: 58000 }
    ]
  },
  { id: 'ORD-002', customer: 'Marie Curie', date: '2024-03-02', total: 29500, status: 'processing', items: 1 },
  { id: 'ORD-003', customer: 'Paul Martin', date: '2024-03-02', total: 19600, status: 'pending', items: 2 },
  { id: 'ORD-004', customer: 'Alice Wong', date: '2024-03-03', total: 11800, status: 'shipped', items: 5 },
];

export const USERS: User[] = [
  { id: 'u1', name: 'Jean Dupont', email: 'jean@example.com', role: 'customer', joinDate: '2023-10-12', orders: 12 },
  { id: 'u2', name: 'Admin Laine', email: 'admin@laine-deco.com', role: 'admin', joinDate: '2023-01-01', orders: 0 },
  { id: 'u3', name: 'Marie Curie', email: 'marie@science.fr', role: 'customer', joinDate: '2024-01-15', orders: 2 },
];

export const CHAT_MESSAGES: ChatMessage[] = [
  { id: 'm1', senderId: 'u1', senderName: 'Jean Dupont', message: 'Bonjour, est-ce que la laine mérinos est disponible en bleu ?', timestamp: '2024-03-01 14:00', isAdmin: false },
  { id: 'm2', senderId: 'u2', senderName: 'Admin Laine', message: 'Bonjour Jean ! Oui, nous avons du bleu marine en stock.', timestamp: '2024-03-01 14:05', isAdmin: true },
];

export const SITE_CONFIG: SiteConfig = {
  primaryColor: '#5A5A40',
  accentColor: '#F27D26',
  homeFeaturedProducts: ['p1', 'p2', 'p4'],
  homeFeaturedCategories: ['1', '2', '3'],
  showSlider: true,
  sliderItems: [
    { id: 's1', image: 'https://picsum.photos/seed/slide1/1920/1080', title: 'Nouvelle Collection Hiver', subtitle: 'Découvrez nos laines les plus douces' },
    { id: 's2', image: 'https://picsum.photos/seed/slide2/1920/1080', title: 'Artisanat Local', subtitle: 'Des pièces uniques pour votre intérieur' },
  ],
  customSections: [
    { id: 'cs1', title: 'Nos Coups de Cœur Matériel', type: 'products', itemIds: ['p3', 'p5'] }
  ]
};
