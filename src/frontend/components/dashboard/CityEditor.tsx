import React from 'react';
import { Modal } from '../Modal';
import { Button } from '../ui/Button';
import { City } from '../../../types';

interface CityEditorProps {
  city: City | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (city: City) => void;
}

export const CityEditor: React.FC<CityEditorProps> = ({ city, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = React.useState<Partial<City>>({
    name: '',
    slug: '',
    deliveryPrice: 1500,
    status: 'active'
  });

  React.useEffect(() => {
    if (city) {
      setFormData(city);
    } else {
      setFormData({
        name: '',
        slug: '',
        deliveryPrice: 1500,
        status: 'active'
      });
    }
  }, [city, isOpen]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: city?.id || `city-${Date.now()}`,
      slug: formData.slug || generateSlug(formData.name || ''),
      updatedAt: new Date().toISOString()
    } as City);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={city ? 'Modifier la Ville' : 'Ajouter une Ville'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Nom de la ville</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => {
              const name = e.target.value;
              setFormData({ 
                ...formData, 
                name, 
                slug: city ? formData.slug : generateSlug(name) 
              });
            }}
            className="w-full px-4 py-2 bg-secondary rounded-xl border border-primary/5 focus:outline-none focus:ring-2 focus:ring-accent/20"
            placeholder="Ex: Yaoundé"
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Slug (URL/ID)</label>
          <input
            type="text"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-4 py-2 bg-secondary rounded-xl border border-primary/5 focus:outline-none focus:ring-2 focus:ring-accent/20"
            placeholder="ex: yaounde"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Prix de livraison (FCFA)</label>
          <input
            type="number"
            required
            value={formData.deliveryPrice}
            onChange={(e) => setFormData({ ...formData, deliveryPrice: Number(e.target.value) })}
            className="w-full px-4 py-2 bg-secondary rounded-xl border border-primary/5 focus:outline-none focus:ring-2 focus:ring-accent/20"
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
            <option value="inactive">Inactif</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose} type="button">
            Annuler
          </Button>
          <Button variant="primary" type="submit">
            {city ? 'Enregistrer' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
