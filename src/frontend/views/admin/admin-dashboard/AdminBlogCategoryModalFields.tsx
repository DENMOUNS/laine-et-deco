import React, { useState } from 'react';
import { Globe, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { translateContentWithAi } from '../../../utils/aiTranslator';

export function AdminBlogCategoryModalFields({ ctx }: { ctx: any }) {
  const { editingItem } = ctx;
  const [nameEn, setNameEn] = useState(editingItem?.name_en || '');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async (e: React.MouseEvent) => {
    const parent = (e.currentTarget.closest('.grid') as HTMLElement);
    const nameFr = (parent?.querySelector('input[name="name"]') as HTMLInputElement)?.value || editingItem?.name;
    if (!nameFr) {
      toast.error('Veuillez entrer un nom en français d\'abord.');
      return;
    }
    setIsTranslating(true);
    try {
      const res = await translateContentWithAi({ name: nameFr }, 'en', 'fr');
      if (res && res.name) {
        setNameEn(res.name);
        toast.success('Traduction générée par l\'IA !');
      }
    } catch {
      toast.error('Erreur lors de la traduction.');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <>
      {ctx.modalType === 'blog-category' && (
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Nom de la catégorie (Français) *</label>
              <input
                name="name"
                type="text"
                className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary font-medium"
                defaultValue={editingItem?.name}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-1">
                  <Globe size={13} /> Nom de la catégorie (Anglais)
                </label>
                <button
                  type="button"
                  onClick={handleTranslate}
                  disabled={isTranslating}
                  className="text-[11px] font-bold text-accent hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {isTranslating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  Traduire IA
                </button>
              </div>
              <input
                name="name_en"
                type="text"
                className="w-full px-6 py-4 bg-secondary/50 border border-accent/30 rounded-2xl focus:outline-none focus:border-accent font-medium"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Knitting Tips..."
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Statut</label>
            <select
              name="status"
              defaultValue={editingItem?.status || 'active'}
              className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary font-medium"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      )}
    </>
  );
}
