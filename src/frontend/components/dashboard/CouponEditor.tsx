import React from 'react';
import { Modal } from '../Modal';
import { Button } from '../ui/Button';
import { Coupon } from '../../../types';
import { useEntity } from '../../hooks/useEntity';

interface CouponEditorProps {
  coupon: Coupon | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (coupon: Coupon) => void;
}

export const CouponEditor: React.FC<CouponEditorProps> = ({ coupon, isOpen, onClose, onSave }) => {
  const { data: users } = useEntity<any>('user', []);
  
  const [formData, setFormData] = React.useState<Partial<Coupon>>({
    code: '',
    discount: 0,
    type: 'percentage',
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: 0,
    usageCount: 0,
    status: 'active',
    restrictedToUserId: '',
    freeShipping: false
  });

  React.useEffect(() => {
    if (coupon) {
      setFormData(coupon);
    } else {
      setFormData({
        code: '',
        discount: 0,
        type: 'percentage',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        usageLimit: 0,
        usageCount: 0,
        status: 'active',
        restrictedToUserId: '',
        freeShipping: false
      });
    }
  }, [coupon, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: coupon?.id || `coupon-${Date.now()}`,
    } as Coupon);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={coupon ? 'Modifier le Coupon' : 'Ajouter un Coupon'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Code</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2 bg-secondary rounded-xl border border-primary/5 focus:outline-none focus:ring-2 focus:ring-accent/20"
              placeholder="EX: PROMO2026"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-4 py-2 bg-secondary rounded-xl border border-primary/5 focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value="percentage">Pourcentage (%)</option>
              <option value="fixed">Montant Fixe (FCFA)</option>
              <option value="free_shipping">Livraison Gratuite</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Valeur</label>
            <input
              type="number"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-secondary rounded-xl border border-primary/5 focus:outline-none focus:ring-2 focus:ring-accent/20"
              disabled={formData.type === 'free_shipping'}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Date d'expiration</label>
            <input
              type="date"
              required
              value={formData.expiryDate?.split('T')[0]}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="w-full px-4 py-2 bg-secondary rounded-xl border border-primary/5 focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Limite d'utilisation</label>
            <input
              type="number"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-secondary rounded-xl border border-primary/5 focus:outline-none focus:ring-2 focus:ring-accent/20"
              placeholder="0 pour illimité"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Statut</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-2 bg-secondary rounded-xl border border-primary/5 focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value="active">Actif</option>
              <option value="expired">Expiré</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Restreindre à un utilisateur (Optionnel)</label>
          <select
            value={formData.restrictedToUserId || ''}
            onChange={(e) => setFormData({ ...formData, restrictedToUserId: e.target.value })}
            className="w-full px-4 py-2 bg-secondary rounded-xl border border-primary/5 focus:outline-none focus:ring-2 focus:ring-accent/20"
          >
            <option value="">Tous les utilisateurs</option>
            {users.map((u: any) => (
              <option key={u.id} value={u.uid || u.id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="freeShipping"
            checked={formData.freeShipping || formData.type === 'free_shipping'}
            onChange={(e) => setFormData({ ...formData, freeShipping: e.target.checked })}
            className="w-4 h-4 text-accent border-primary/10 rounded focus:ring-accent"
          />
          <label htmlFor="freeShipping" className="text-xs font-bold text-primary/70">
            Inclure la livraison gratuite
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose} type="button">
            Annuler
          </Button>
          <Button variant="primary" type="submit">
            {coupon ? 'Enregistrer' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
