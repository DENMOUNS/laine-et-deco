
import React from 'react';
import { cn } from '../../utils/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLSpanElement>;
  as?: 'span' | 'button';
}

/**
 * Status Management Centralized Logic
 * Defines colors, labels and styles for all application statuses.
 */
export const STATUS_CONFIG: Record<string, { bg: string, text: string, label: string }> = {
  // Order statuses
  'en attente': { bg: 'bg-amber-100', text: 'text-amber-900', label: 'EN ATTENTE' },
  'pending': { bg: 'bg-amber-100', text: 'text-amber-900', label: 'EN ATTENTE' },
  'traitement': { bg: 'bg-indigo-100', text: 'text-indigo-900', label: 'TRAITEMENT' },
  'processing': { bg: 'bg-indigo-100', text: 'text-indigo-900', label: 'TRAITEMENT' },
  'expédié': { bg: 'bg-sky-100', text: 'text-sky-900', label: 'EXPÉDIÉ' },
  'shipped': { bg: 'bg-sky-100', text: 'text-sky-900', label: 'EXPÉDIÉ' },
  'livré': { bg: 'bg-emerald-100', text: 'text-emerald-900', label: 'LIVRÉ' },
  'delivered': { bg: 'bg-emerald-100', text: 'text-emerald-900', label: 'LIVRÉ' },
  'completed': { bg: 'bg-emerald-100', text: 'text-emerald-900', label: 'TERMINÉ' },
  'annulé': { bg: 'bg-rose-100', text: 'text-rose-900', label: 'ANNULÉ' },
  'cancelled': { bg: 'bg-rose-100', text: 'text-rose-900', label: 'ANNULÉ' },
  
  // Content visibility statuses
  'publié': { bg: 'bg-emerald-100', text: 'text-emerald-900', label: 'PUBLIÉ' },
  'published': { bg: 'bg-emerald-100', text: 'text-emerald-900', label: 'PUBLIÉ' },
  'brouillon': { bg: 'bg-slate-100', text: 'text-slate-900', label: 'BROUILLON' },
  'draft': { bg: 'bg-slate-100', text: 'text-slate-900', label: 'BROUILLON' },
  'actif': { bg: 'bg-emerald-100', text: 'text-emerald-900', label: 'ACTIF' },
  'active': { bg: 'bg-emerald-100', text: 'text-emerald-900', label: 'ACTIF' },
  'inactif': { bg: 'bg-rose-100', text: 'text-rose-900', label: 'INACTIF' },
  'inactive': { bg: 'bg-rose-100', text: 'text-rose-900', label: 'INACTIF' },
  'verified': { bg: 'bg-emerald-100', text: 'text-emerald-900', label: 'VÉRIFIÉ' },
  'sent': { bg: 'bg-emerald-100', text: 'text-emerald-900', label: 'ENVOYÉ' },
  'scheduled': { bg: 'bg-indigo-100', text: 'text-indigo-900', label: 'PLANIFIÉ' },
  'unsubscribed': { bg: 'bg-rose-100', text: 'text-rose-900', label: 'DÉSABONNÉ' },
  'paid': { bg: 'bg-emerald-100', text: 'text-emerald-900', label: 'PAYÉ' },
  'unpaid': { bg: 'bg-amber-100', text: 'text-amber-900', label: 'EN ATTENTE' },
  'in-progress': { bg: 'bg-indigo-100', text: 'text-indigo-900', label: 'EN COURS' },
  'expired': { bg: 'bg-rose-100', text: 'text-rose-900', label: 'EXPIRÉ' },
  'used': { bg: 'bg-slate-100', text: 'text-slate-900', label: 'UTILISÉ' },
  'abandoned': { bg: 'bg-amber-100', text: 'text-amber-900', label: 'ABANDONNÉ' },
  'recovered': { bg: 'bg-emerald-100', text: 'text-emerald-900', label: 'RÉCUPÉRÉ' },
  'reminded': { bg: 'bg-sky-100', text: 'text-sky-900', label: 'RELANCÉ' },
  
  // RMA statuses
  'approved': { bg: 'bg-indigo-100', text: 'text-indigo-900', label: 'APPROUVÉ' },
  'received': { bg: 'bg-sky-100', text: 'text-sky-900', label: 'REÇU' },
  'refunded': { bg: 'bg-emerald-100', text: 'text-emerald-900', label: 'REMBOURSÉ' },
  'rejected': { bg: 'bg-rose-100', text: 'text-rose-900', label: 'REJETÉ' },
};

/**
 * StatusColor Class-like object for clean access to status styles
 */
export const StatusColor = {
  getStyle: (status: string) => {
    if (!status) return 'bg-slate-100 text-slate-900 border-slate-200';
    const config = STATUS_CONFIG[status.toLowerCase()];
    if (config) {
      return cn(config.bg, config.text, 'border-current/10 font-black shadow-sm ring-1 ring-inset ring-current/5');
    }
    return 'bg-slate-100 text-slate-900 border-slate-200 font-black';
  },
  getLabel: (status: string) => {
    const config = STATUS_CONFIG[(status || '').toLowerCase()];
    return config ? config.label : (status || 'N/A').toUpperCase();
  }
};

export const getStatusStyles = StatusColor.getStyle;

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, onClick, as }) => {
  const styles = StatusColor.getStyle(status);
  const label = StatusColor.getLabel(status);
  const Component = as === 'button' || onClick ? 'button' : 'span';

  return (
    <Component
      type={Component === 'button' ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        "px-3 py-1 rounded-full text-[10px] uppercase font-black border transition-all duration-300",
        styles,
        onClick && 'cursor-pointer',
        className
      )}
    >
      {label}
    </Component>
  );
};
