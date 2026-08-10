/**
 * Formatters pour les notifications système
 */

export interface NotificationMessage {
  title: string;
  message: string;
  type: 'order' | 'product' | 'user' | 'system';
  relatedId?: string;
}

/**
 * Génère un message de notification pour une commande
 */
export function formatOrderNotification(order: any, status: string): NotificationMessage {
  const statusMap: Record<string, string> = {
    pending: 'passé une commande',
    processing: 'est en traitement',
    shipped: 'a été expédiée',
    delivered: 'a été livrée',
    cancelled: 'a été annulée',
    completed: 'a été complétée',
  };

  const statusAction = statusMap[status] || 'a été mise à jour';
  const itemCount = order.items || order.orderDetails?.length || 0;
  const total = order.total || 0;

  return {
    title: `Commande #${order.id} ${statusAction}`,
    message: `L'utilisateur ${order.customer} a ${statusAction} une commande de ${itemCount} produit${itemCount !== 1 ? 's' : ''} d'un montant de ${total.toLocaleString()} FCFA`,
    type: 'order',
    relatedId: order.id,
  };
}

/**
 * Génère un message pour une action produit
 */
export function formatProductNotification(action: string, product: any, details?: any): NotificationMessage {
  const actionMap: Record<string, string> = {
    created: 'a ajouté',
    updated: 'a mis à jour',
    deleted: 'a supprimé',
    published: 'a publié',
    unpublished: 'a dépublié',
  };

  const actionText = actionMap[action] || action;

  return {
    title: `Produit: ${product.name || product.title}`,
    message: `L'administrateur ${actionText} le produit "${product.name || product.title}"${details ? ` (${details})` : ''}`,
    type: 'product',
    relatedId: product.id,
  };
}

/**
 * Génère un message pour une action catégorie
 */
export function formatCategoryNotification(action: string, category: any): NotificationMessage {
  const actionMap: Record<string, string> = {
    created: 'a créé',
    updated: 'a mis à jour',
    deleted: 'a supprimé',
  };

  const actionText = actionMap[action] || action;

  return {
    title: `Catégorie: ${category.name || category.title}`,
    message: `L'administrateur ${actionText} la catégorie "${category.name || category.title}"`,
    type: 'product',
    relatedId: category.id,
  };
}

/**
 * Génère un message pour une action utilisateur
 */
export function formatUserNotification(action: string, user: any, details?: any): NotificationMessage {
  const actionMap: Record<string, string> = {
    registered: 's\'est inscrit',
    updated: 'a mis à jour son profil',
    deleted: 'a été supprimé',
  };

  const actionText = actionMap[action] || action;

  return {
    title: `Utilisateur: ${user.name || user.email}`,
    message: `L'utilisateur ${user.name || user.email} ${actionText}${details ? ` (${details})` : ''}`,
    type: 'user',
    relatedId: user.id,
  };
}

/**
 * Formate la date de manière naturelle sans notation technique
 * Ex: "10 août 2026, 14:30" au lieu de "2026-08-10T14:30:00Z"
 */
export function formatNotificationDate(dateString: string | Date | null | undefined): string {
  // Validation: vérifier si la date existe
  if (!dateString) return 'Date inconnue';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Validation: vérifier si la date est valide
  if (isNaN(date.getTime())) return 'Date invalide';
  
  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
}

/**
 * Retourne la date au format relatif (il y a X minutes/heures/jours)
 */
export function formatTimeAgo(dateString: string | Date | null | undefined): string {
  // Validation: vérifier si la date existe
  if (!dateString) return 'Date inconnue';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  // Validation: vérifier si la date est valide
  if (isNaN(date.getTime())) return 'Date invalide';
  
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'À l\'instant';
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)}j`;
  
  return formatNotificationDate(date);
}
