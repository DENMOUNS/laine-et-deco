import React, { useState } from 'react';
import { Type as TypeIcon, Plus, Trash2, Save, Loader2, Sparkles, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../../backend/firebase';
import { useStaticEntity, dispatchStaticEntityUpdate } from '../../../hooks/useStaticEntity';
import { MarqueeItem } from '../../../../types';
import { translateContentWithAi } from '../../../utils/aiTranslator';

const ICON_OPTIONS = ['Package', 'Sparkles', 'Heart', 'Star', 'Truck', 'ShieldCheck', 'Tag', 'Gift', 'Award'];

export function AdminSiteMarqueeSection() {
  const { data: marqueeItems, isLoading } = useStaticEntity<MarqueeItem>('marquee_item');
  const [saving, setSaving] = useState<string | null>(null);
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [localItems, setLocalItems] = useState<MarqueeItem[] | null>(null);

  // Use local state if modified, otherwise use DB data
  const items: MarqueeItem[] = (localItems ?? marqueeItems ?? [])
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const handleTranslate = async (item: MarqueeItem) => {
    if (!item.text?.trim()) {
      toast.error('Veuillez d\'abord saisir le texte en français.');
      return;
    }
    setTranslatingId(item.id);
    try {
      const res = await translateContentWithAi({ text: item.text }, 'en', 'fr');
      if (res?.text) {
        const next = items.map((i) => (i.id === item.id ? { ...i, text_en: res.text } : i));
        setLocalItems(next);
        toast.success('Traduction générée par l\'IA ! Pensez à enregistrer.');
      }
    } catch {
      toast.error('Erreur lors de la traduction.');
    } finally {
      setTranslatingId(null);
    }
  };

  const handleAdd = async () => {
    try {
      setSaving('add');
      const newOrder = items.length > 0 ? Math.max(...items.map((i) => i.order || 0)) + 1 : 1;
      const newItem = {
        text: 'NOUVEAU MESSAGE',
        text_en: 'NEW MESSAGE',
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
              Gérez les messages qui défilent tout en haut de votre site (Français & Anglais)
            </p>
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={saving === 'add'}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-secondary rounded-full font-bold uppercase tracking-widest text-xs hover:bg-accent transition-colors disabled:opacity-60 cursor-pointer"
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
              className="bg-secondary/30 p-5 rounded-2xl border border-primary/10 space-y-3"
            >
              <div className="flex flex-wrap gap-4 items-end">
                {/* Ordre */}
                <div className="w-16 space-y-1.5 flex-shrink-0">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Ordre</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full px-3 py-2 bg-white border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-sm font-semibold"
                    value={item.order || 0}
                    onChange={(e) => handleChange(item.id, 'order', Number(e.target.value))}
                  />
                </div>

                {/* Texte FR */}
                <div className="flex-1 min-w-[200px] space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Texte (FR)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-white border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-sm font-medium"
                    value={item.text}
                    onChange={(e) => handleChange(item.id, 'text', e.target.value)}
                  />
                </div>

                {/* Texte EN */}
                <div className="flex-1 min-w-[200px] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-1">
                      <Globe size={11} /> Texte (EN)
                    </label>
                    <button
                      type="button"
                      onClick={() => handleTranslate(item)}
                      disabled={translatingId === item.id}
                      className="text-[10px] font-bold text-accent hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      {translatingId === item.id ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                      Traduire IA
                    </button>
                  </div>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-white border border-accent/30 rounded-xl focus:outline-none focus:border-accent text-sm font-medium"
                    value={item.text_en || ''}
                    placeholder="English text..."
                    onChange={(e) => handleChange(item.id, 'text_en', e.target.value)}
                  />
                </div>

                {/* Icône */}
                <div className="w-36 space-y-1.5 flex-shrink-0">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Icône</label>
                  <select
                    className="w-full px-3 py-2 bg-white border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-sm font-medium"
                    value={item.iconName}
                    onChange={(e) => handleChange(item.id, 'iconName', e.target.value)}
                  >
                    {ICON_OPTIONS.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>

                {/* Statut */}
                <div className="w-28 space-y-1.5 flex-shrink-0">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Statut</label>
                  <select
                    className="w-full px-3 py-2 bg-white border border-primary/10 rounded-xl focus:outline-none focus:border-primary text-sm font-medium"
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
                    className="p-2.5 text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
                    title="Sauvegarder"
                  >
                    {saving === item.id ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={saving === item.id}
                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
