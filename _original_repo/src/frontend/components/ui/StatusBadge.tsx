import React from 'react';
import { cn } from '../../utils/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const getStatusStyles = (status: string) => {
  const s = status.toLowerCase();
  
  // Green / Success
  if (['completed', 'delivered', 'approved', 'active', 'sent', 'verified', 'recovered', 'paid', 'success', 'publié', 'published'].includes(s)) {
    return 'bg-green-100 text-green-700 border-green-200';
  }
  
  // Yellow / Warning / Pending
  if (['pending', 'processing', 'scheduled', 'abandoned', 'reminded', 'waiting', 'unpaid', 'en attente'].includes(s)) {
    return 'bg-amber-100 text-amber-700 border-amber-200';
  }
  
  // Red / Danger / Error
  if (['cancelled', 'rejected', 'inactive', 'expired', 'error', 'failed', 'unsubscribed', 'annulé', 'rejeté'].includes(s)) {
    return 'bg-red-100 text-red-700 border-red-200';
  }
  
  // Blue / Info
  if (['shipped', 'received', 'reviewed', 'responded', 'draft', 'in-progress', 'expédié', 'en cours', 'brouillon'].includes(s)) {
    return 'bg-blue-100 text-blue-700 border-blue-200';
  }
  
  // Default
  return 'bg-gray-100 text-gray-700 border-gray-200';
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'pending': 'En attente',
      'processing': 'En cours',
      'shipped': 'Expédié',
      'delivered': 'Livré',
      'cancelled': 'Annulé',
      'completed': 'Terminé',
      'in-progress': 'En cours',
      'active': 'Actif',
      'inactive': 'Inactif',
      'approved': 'Approuvé',
      'rejected': 'Rejeté',
      'verified': 'Vérifié',
      'expired': 'Expiré',
      'scheduled': 'Programmé',
      'draft': 'Brouillon',
      'sent': 'Envoyé',
      'paid': 'Payé',
      'unpaid': 'Impayé',
      'abandoned': 'Abandonné',
      'recovered': 'Récupéré',
      'reminded': 'Relancé',
      'received': 'Reçu',
      'refunded': 'Remboursé',
      'reviewed': 'Revu',
      'responded': 'Répondu',
      'unsubscribed': 'Désinscrit',
    };
    
    return labels[status.toLowerCase()] || status;
  };

  return (
    <span className={cn(
      "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
      getStatusStyles(status),
      className
    )}>
      {getStatusLabel(status)}
    </span>
  );
};
