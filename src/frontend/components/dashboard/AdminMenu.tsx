
import React from 'react';
import { 
  LayoutDashboard, Package, ShoppingBag, Users, BarChart3, Settings, 
  TrendingUp, Bell, Plus, Coins, Globe, Shield, History, Percent, 
  Truck, MapPin, Download, Lock, BoxesIcon, Image as ImageIcon, Palette, Monitor, Megaphone, Type as TypeIcon, Search, Award, Wrench, Mail, FileText, QrCode
} from 'lucide-react';

export const getAdminMenuItems = () => [
  // Principal
  { id: 'principal_header', label: 'PRINCIPAL', isHeader: true },
  { id: 'overview', label: 'Tableau de Bord', icon: <LayoutDashboard size={20} />, permission: 'dashboard.view' },
  { id: 'orders', label: 'Commandes', icon: <ShoppingBag size={20} />, permission: 'orders.view' },
  { id: 'products', label: 'Catalogue Produits', icon: <Package size={20} />, permission: 'products.view' },
  { id: 'inventory', label: 'Gestion des Stocks', icon: <BoxesIcon size={20} />, permission: 'inventory.view' },
  { id: 'categories', label: 'Catégories', icon: <Plus size={20} />, permission: 'categories.view' },
  { id: 'customers', label: 'Utilisateurs & Fidélité', icon: <Users size={20} />, permission: 'users.view' },
  
  // Marketing & Ventes
  { id: 'marketing_header', label: 'MARKETING', isHeader: true },
  { id: 'coupons', label: 'Coupons & Promos', icon: <Plus size={20} />, permission: 'marketing.view' },
  { id: 'promo-rules', label: 'Règles de Prix', icon: <Percent size={20} />, permission: 'marketing.view' },
  { id: 'flash-sales', label: 'Ventes Flash', icon: <TrendingUp size={20} />, permission: 'marketing.view' },
  { id: 'packs', label: 'Gestion des Packs', icon: <Plus size={20} />, permission: 'marketing.view' },
  { id: 'lookbook', label: 'Lookbook Automne', icon: <Plus size={20} />, permission: 'lookbook.view' },
  
  // Finance
  { id: 'finance_header', label: 'FINANCE', isHeader: true },
  { id: 'expenses', label: 'Dépenses & Achats', icon: <History size={20} />, permission: 'finance.view' },

  // Contenu
  { id: 'content_header', label: 'CONTENU', isHeader: true },
  { id: 'portfolios', label: 'Membres & Portfolios', icon: <Users size={20} />, permission: 'content.view' },
  { id: 'blog', label: 'Blog & Articles', icon: <Plus size={20} />, permission: 'blog.view' },
  { id: 'reviews', label: 'Avis & Retours', icon: <Plus size={20} />, permission: 'messages.view' },
  { id: 'faq', label: 'FAQ Dynamique', icon: <Plus size={20} />, permission: 'content.view' },
  { id: 'nav-items', label: 'Menu Navigation', icon: <Globe size={20} />, permission: 'system.view' },
  
  // Rapports
  { id: 'reports_header', label: 'RAPPORTS', isHeader: true },
  { id: 'stats', label: 'Statistiques', icon: <BarChart3 size={20} />, permission: 'reports.view' },
  
  // Système
  { id: 'system_header', label: 'SYSTÈME', isHeader: true },
  { id: 'site', label: 'Configuration du Site', icon: <Settings size={20} />, permission: 'system.view' },
  { id: 'site_logos', label: 'Logos du Site', icon: <ImageIcon size={20} />, permission: 'system.view' },
  { id: 'site_colors', label: 'Couleurs du Site', icon: <Palette size={20} />, permission: 'system.view' },
  { id: 'hero_banners', label: 'Bannières Hero', icon: <Monitor size={20} />, permission: 'system.view' },
  { id: 'announcement_banners', label: 'Bannières Annonce', icon: <Megaphone size={20} />, permission: 'system.view' },
  { id: 'scrolling_banners', label: 'Bannières Défilantes', icon: <TypeIcon size={20} />, permission: 'system.view' },
  { id: 'seo_pages', label: 'Pages SEO', icon: <Search size={20} />, permission: 'system.view' },
  { id: 'loyalty_config', label: 'Prog. de Fidélité', icon: <Award size={20} />, permission: 'system.view' },
  { id: 'maintenance_config', label: 'Mode Maintenance', icon: <Wrench size={20} />, permission: 'system.view' },
  { id: 'newsletter_config', label: 'Popup Newsletter', icon: <Mail size={20} />, permission: 'system.view' },
  { id: 'invoice_config', label: 'Factures (PDF)', icon: <FileText size={20} />, permission: 'system.view' },
  { id: 'qr', label: 'QR Code Landing', icon: <QrCode size={20} />, permission: 'system.view' },
  { id: 'taxes', label: 'Taxes (TVA)', icon: <Percent size={20} />, permission: 'system.view' },
  { id: 'shipping', label: 'Livraison', icon: <Truck size={20} />, permission: 'system.view' },
  { id: 'cities', label: 'Villes & Tarifs', icon: <MapPin size={20} />, permission: 'system.view' },
  { id: 'import-export', label: 'Import / Export', icon: <Download size={20} />, permission: 'system.view' },
  { id: 'roles', label: 'Rôles', icon: <Lock size={20} />, permission: 'super-admin' },
  { id: 'notifications', label: 'Notifications Système', icon: <Bell size={20} />, permission: 'system.view' },
];
