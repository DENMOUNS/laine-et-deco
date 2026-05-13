
import React from 'react';
import { 
  LayoutDashboard, Package, ShoppingBag, Users, BarChart3, Settings, 
  TrendingUp, Bell, Plus, Coins, Globe, Shield, History, Percent, 
  Truck, MapPin, Download, Lock
} from 'lucide-react';

export const getAdminMenuItems = () => [
  // Principal
  { id: 'principal_header', label: 'PRINCIPAL', isHeader: true },
  { id: 'overview', label: 'Tableau de Bord', icon: <LayoutDashboard size={20} /> },
  { id: 'orders', label: 'Commandes', icon: <ShoppingBag size={20} /> },
  { id: 'products', label: 'Catalogue Produits', icon: <Package size={20} /> },
  { id: 'categories', label: 'Catégories', icon: <Plus size={20} /> },
  { id: 'customers', label: 'Clients & Fidélité', icon: <Users size={20} /> },
  
  // Marketing & Ventes
  { id: 'marketing_header', label: 'MARKETING', isHeader: true },
  { id: 'coupons', label: 'Coupons & Promos', icon: <Plus size={20} /> },
  { id: 'promo-rules', label: 'Règles de Prix', icon: <Percent size={20} /> },
  { id: 'flash-sales', label: 'Ventes Flash', icon: <TrendingUp size={20} /> },
  { id: 'packs', label: 'Gestion des Packs', icon: <Plus size={20} /> },
  { id: 'lookbook', label: 'Lookbook Automne', icon: <Plus size={20} /> },
  
  // Finance
  { id: 'finance_header', label: 'FINANCE', isHeader: true },
  { id: 'payments', label: 'Paiements & Devises', icon: <Coins size={20} /> },
  { id: 'expenses', label: 'Dépenses & Achats', icon: <History size={20} /> },

  // Contenu
  { id: 'content_header', label: 'CONTENU', isHeader: true },
  { id: 'blog', label: 'Blog & Articles', icon: <Plus size={20} /> },
  { id: 'reviews', label: 'Avis & Retours', icon: <Plus size={20} /> },
  { id: 'faq', label: 'FAQ Dynamique', icon: <Plus size={20} /> },
  { id: 'nav-items', label: 'Menu Navigation', icon: <Globe size={20} /> },
  
  // Rapports
  { id: 'reports_header', label: 'RAPPORTS', isHeader: true },
  { id: 'stats', label: 'Statistiques', icon: <BarChart3 size={20} /> },
  { id: 'analytics', label: 'Analytique Avancée', icon: <TrendingUp size={20} /> },
  
  // Système
  { id: 'system_header', label: 'SYSTÈME', isHeader: true },
  { id: 'site', label: 'Configuration Site', icon: <Settings size={20} /> },
  { id: 'taxes', label: 'Taxes (TVA)', icon: <Percent size={20} /> },
  { id: 'shipping', label: 'Livraison', icon: <Truck size={20} /> },
  { id: 'cities', label: 'Villes & Tarifs', icon: <MapPin size={20} /> },
  { id: 'import-export', label: 'Import / Export', icon: <Download size={20} /> },
  { id: 'users', label: 'Utilisateurs Admin', icon: <Shield size={20} /> },
  { id: 'roles', label: 'Rôles', icon: <Lock size={20} /> },
  { id: 'logs', label: 'Historique & Logs', icon: <History size={20} /> },
  { id: 'notifications', label: 'Notifications Système', icon: <Bell size={20} /> },
];
