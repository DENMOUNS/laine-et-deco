import React, { useState } from 'react';
import { Type as TypeIcon, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../../backend/firebase';
import { useStaticEntity, dispatchStaticEntityUpdate } from '../../../hooks/useStaticEntity';
import { MarqueeItem } from '../../../../types';

const ICON_OPTIONS = ['Package', 'Sparkles', 'Heart', 'Star', 'Truck', 'ShieldCheck', 'Tag', 'Gift', 'Award'];

export function AdminSiteMarqueeSection() {
  const { data: marqueeItems, isLoading } = useStaticEntity<MarqueeItem>('marquee_item');
  const [saving, setSaving] = useState<string | null>(null);
  const [localItems, setLocalItems] = useState<MarqueeItem[] | null>(null);

  // Use local state if modified, otherwise use DB data
  const items: MarqueeItem[] = (localItems ?? marqueeItems ?? [])
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleAdd = async () => {
    try {
      setSaving('add');
      const newOrder = items.length > 0 ? Math.max(...items.map((i) => i.order || 0)) + 1 : 1;
      const newItem = {
        text: 'NOUVEAU MESSAGE',
        iconName: 'Star',
        order: newOrder,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, 'marquee_item'), newItem);
      const created: MarqueeItem = { ...newItem, id: docRef.id };
      const next = [...items, created];
      setLocalItems(next);
      dispatchStaticEntityUpdate<MarqueeItem>('marquee_item', { fullData: next });
      toast.success('Message ajouté !');
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors de l\'ajout');
    } finally {
      setSaving(null);
    }
  };

  const handleUpdate = async (item: MarqueeItem) => {
    try {
      setSaving(item.id);
      const { id, ...data } = item;
      await updateDoc(doc(db, 'marquee_item', id), data);
      const next = items.map((i) => (i.id === id ? item : i));
      setLocalItems(next);
      dispatchStaticEntityUpdate<MarqueeItem>('marquee_item', { record: item });
      toast.success('Message sauvegardé !');
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer ce message ?')) return;
    try {
      setSaving(id);
      await deleteDoc(doc(db, 'marquee_item', id));
      const next = items.filter((i) => i.id !== id);
      setLocalItems(next);
      dispatchStaticEntityUpdate<MarqueeItem>('marquee_item', { fullData: next });
      toast.success('Message supprimé !');
    } catch (e) {
      console.error(e);
      toast.error('Erreur lors de la suppression');
    } finally {
      setSaving(null);
    }
  };

  const handleChange = (id: string, field: keyof MarqueeItem, value: string | number) => {
    const next = items.map((i) => (i.id === id ? { ...i, [field]: value } : i));
    setLocalItems(next);
  };

  return (
    <section className="bg-card p-8 rounded-[2.5rem] shadow-sm border border-primary/10">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/5 text-primary rounded-2xl">
            <TypeIcon size={24} />
          </div>
          <div>
            <h3 className="text-xl font-serif text-primary">Barre Défilante (Haut de page)</h3>
            <p className="text-xs text-primary/60">
              Gérez les messages qui défilent tout en haut de votre site — collection{' '}
              <code className="bg-primary/5 px-1 rounded text-primary font-mono">marquee_item</code>
            </p>
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={saving === 'add'}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-secondary rounded-full font-bold uppercase tracking-widest text-xs hover:bg-accent transition-colors disabled:opacity-60"
        >
          {saving === 'add' ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Ajouter un message
        </button>
      </div>

      {isLoading && !localItems ? (
        <div className="flex items-center justify-center py-12 text-primary/40">
          <Loader2 size={32} className="animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-primary/40 text-sm">
          Aucun message dans la barre défilante. Cliquez sur "Ajouter un message" pour commencer.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 items-end bg-secondary/30 p-4 rounded-2xl border border-primary/10"
            >
              {/* Ordre */}
              <div className="w-20 space-y-2 flex-shrink-0">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Ordre</label>
                <input
                  type="number"
                  min={1}
                  className="w-full px-3 py-2 bg-white border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-sm"
                  value={item.order || 0}
                  onChange={(e) => handleChange(item.id, 'order', Number(e.target.value))}
                />
              </div>

              {/* Texte */}
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Texte</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-white border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-sm"
                  value={item.text}
                  onChange={(e) => handleChange(item.id, 'text', e.target.value)}
                />
              </div>

              {/* Icône */}
              <div className="w-44 space-y-2 flex-shrink-0">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Icône</label>
                <select
                  className="w-full px-3 py-2 bg-white border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-sm"
                  value={item.iconName}
                  onChange={(e) => handleChange(item.id, 'iconName', e.target.value)}
                >
                  {ICON_OPTIONS.map((icon) => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>

              {/* Statut */}
              <div className="w-32 space-y-2 flex-shrink-0">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Statut</label>
                <select
                  className="w-full px-3 py-2 bg-white border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-sm"
                  value={item.status}
                  onChange={(e) => handleChange(item.id, 'status', e.target.value as 'active' | 'inactive')}
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleUpdate(item)}
                  disabled={saving === item.id}
                  className="p-2 text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors disabled:opacity-60"
                  title="Sauvegarder"
                >
                  {saving === item.id ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={saving === item.id}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-60"
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
