import React from 'react';
import { Star } from 'lucide-react';
import { TabFilter } from '../../components/TabFilter';
import { DataTable } from '../../components/DataTable';
import { Product } from '../../types';
import { toast } from 'sonner';

interface AdminReviewsProps {
  localProducts: Product[];
  reviewFilter: string;
  setReviewFilter: (filter: string) => void;
}

export const AdminReviews: React.FC<AdminReviewsProps> = ({
  localProducts,
  reviewFilter,
  setReviewFilter,
}) => {
  return (
    <div className="space-y-6">
      <TabFilter 
        options={[
          { id: 'all', label: 'Tous' },
          { id: '5', label: '5 Étoiles' },
          { id: '4', label: '4 Étoiles' },
          { id: '3', label: '3 Étoiles' },
          { id: 'low', label: 'Basses notes' },
        ]}
        active={reviewFilter}
        onChange={setReviewFilter}
      />
      <DataTable<any>
        data={localProducts.flatMap(p => (p.reviews || []).map(r => ({ ...r, productName: p.name, productId: p.id }))).filter(r => {
          if (reviewFilter === 'all') return true;
          if (reviewFilter === 'low') return r.rating <= 2;
          return r.rating === parseInt(reviewFilter);
        })}
        title="Avis Clients"
        columns={[
          { header: 'Produit', accessor: 'productName', className: 'font-medium' },
          { header: 'Client', accessor: 'userName', className: 'font-medium' },
          {
            header: 'Note',
            accessor: (review: any) => (
              <div className="flex items-center gap-1 text-yellow-500">
                <Star size={14} fill="currentColor" />
                <span className="text-sm font-bold text-slate-900">{review.rating}</span>
              </div>
            ),
            exportValue: (review: any) => String(review.rating)
          },
          { header: 'Commentaire', accessor: 'comment' as any, className: 'text-slate-400 text-sm max-w-xs truncate' },
          { header: 'Date', accessor: 'date' as any, className: 'text-slate-400 text-sm' },
          {
            header: 'Actions',
            accessor: (review: any) => (
              <div className="flex gap-2">
                <button 
                  onClick={() => toast.success('Avis approuvé')}
                  className="text-primary font-bold text-sm hover:underline"
                >
                  Approuver
                </button>
                <button 
                  onClick={() => toast.success('Avis supprimé')}
                  className="text-red-500 font-bold text-sm hover:underline"
                >
                  Supprimer
                </button>
              </div>
            )
          }
        ]}
      />
    </div>
  );
};
