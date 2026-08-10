import React, { useRef, useState } from 'react';
import { ImagePlus, Trash2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { useEntity } from '../../../hooks/useEntity';

interface PatternModel {
  id: string;
  name: string;
  type: string;
  image: string;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}

const MAX_BYTES = 250 * 1024;

const compressImage = (file: File): Promise<{ data: string; mimeType: string }> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(new Error('Lecture de l’image impossible.'));
  reader.onload = () => {
    const image = new Image();
    image.onerror = () => reject(new Error('Image invalide.'));
    image.onload = () => {
      const scale = Math.min(1, 1200 / Math.max(image.width, image.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext('2d');
      if (!context) return reject(new Error('Compression impossible.'));
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      let quality = 0.82;
      let data = canvas.toDataURL('image/jpeg', quality);
      while (data.length * 0.75 > MAX_BYTES && quality > 0.25) {
        quality -= 0.08;
        data = canvas.toDataURL('image/jpeg', quality);
      }
      if (data.length * 0.75 > MAX_BYTES) return reject(new Error('Cette image ne peut pas être réduite sous 250 Ko.'));
      resolve({ data, mimeType: 'image/jpeg' });
    };
    image.src = String(reader.result);
  };
  reader.readAsDataURL(file);
});

export const AdminPatternModels: React.FC = () => {
  const { data: models, addEntity, deleteEntity } = useEntity<PatternModel>('pattern_model');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('Pull / Chandail');
  const [saving, setSaving] = useState(false);

  const addModel = async (event: React.FormEvent) => {
    event.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!name.trim() || !file) {
      toast.error('Indiquez un nom et sélectionnez une image.');
      return;
    }
    setSaving(true);
    try {
      const compressed = await compressImage(file);
      const now = new Date().toISOString();
      await addEntity({ id: crypto.randomUUID(), name: name.trim(), type, ...compressed, createdAt: now, updatedAt: now } as any);
      setName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Modèle enregistré et compressé sous 250 Ko.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible d’enregistrer le modèle.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3"><Wand2 className="text-accent" /><h1 className="text-3xl font-serif font-bold text-primary">Modèles du générateur de patrons</h1></div>
        <p className="mt-2 text-primary/60">Ajoutez des modèles réutilisables. Ils seront proposés au client et transmis à l’IA comme référence visuelle.</p>
      </div>
      <form onSubmit={addModel} className="grid gap-4 rounded-3xl border border-primary/10 bg-white p-6 md:grid-cols-[1fr_1fr_2fr_auto] md:items-end">
        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Nom<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex. T-shirt col rond" className="mt-2 w-full rounded-xl border border-primary/10 px-4 py-3 text-sm" /></label>
        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Type<select value={type} onChange={(event) => setType(event.target.value)} className="mt-2 w-full rounded-xl border border-primary/10 px-4 py-3 text-sm"><option>T-shirt</option><option>Robe</option><option>Jupe</option><option>Pull / Chandail</option><option>Gilet (Cardigan)</option><option>Écharpe</option><option>Bonnet</option><option>Couverture</option><option>Autre</option></select></label>
        <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Image du modèle<input ref={fileInputRef} type="file" accept="image/*" className="mt-2 block w-full rounded-xl border border-primary/10 px-4 py-2.5 text-sm" /></label>
        <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><ImagePlus size={17} />{saving ? 'Traitement…' : 'Ajouter'}</button>
      </form>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {models.map((model) => <article key={model.id} className="overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-sm"><img src={model.image} alt={model.name} className="h-56 w-full object-contain bg-[#F9F7F2]" /><div className="flex items-center justify-between p-5"><div><h2 className="font-serif text-xl text-primary">{model.name}</h2><p className="mt-1 text-xs uppercase tracking-widest text-primary/50">{model.type} · moins de 250 Ko</p></div><button type="button" onClick={() => void deleteEntity(model.id)} aria-label={`Supprimer ${model.name}`} className="rounded-full p-2 text-red-500 hover:bg-red-50"><Trash2 size={17} /></button></div></article>)}
      </div>
    </div>
  );
};
