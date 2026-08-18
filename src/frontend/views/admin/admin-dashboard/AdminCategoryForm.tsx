import React, { useState } from 'react';
import { ImageIcon, Globe, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Loader } from '../../../components/Loader';
import { translateContentWithAi } from '../../../utils/aiTranslator';

export function AdminCategoryForm({ ctx }: { ctx: any }) {
  const { activeTab, currentImage, currentSlug, editingItem, handleFormSubmit, isSaving, setCurrentImage, setEditingItem, setModalType, setActiveTab } = ctx;
  const [nameEn, setNameEn] = useState(editingItem?.name_en || '');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async (e: React.MouseEvent) => {
    const form = (e.currentTarget.closest('form') as HTMLFormElement);
    const frNameInput = (form?.querySelector('input[name="name"]') as HTMLInputElement)?.value || editingItem?.name;
    if (!frNameInput) {
      toast.error('Veuillez renseigner le nom en français d\'abord.');
      return;
    }
    setIsTranslating(true);
    try {
      const res = await translateContentWithAi({ name: frNameInput }, 'en', 'fr');
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
      {(activeTab === 'category-create' || activeTab === 'category-edit') && (
           <div className="space-y-6 max-w-2xl mx-auto">
             <div className="flex justify-between items-center">
               <h2 className="text-2xl font-serif font-bold text-primary">
                 {activeTab === 'category-create' ? 'Créer une Catégorie' : 'Modifier la Catégorie'}
               </h2>
               <button 
                 onClick={() => { setActiveTab('categories'); setEditingItem(null); setModalType(''); }}
                 className="text-primary/60 hover:text-primary font-bold text-sm cursor-pointer"
               >
                 Annuler
               </button>
             </div>
             
             <form className="space-y-6 bg-card p-10 rounded-[2rem] border border-primary/10 shadow-sm" onSubmit={handleFormSubmit}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Nom de la catégorie (Français) *</label>
                   <input 
                     name="name"
                     type="text" 
                     className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary" 
                     placeholder="Décoration Murale..." 
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
                     className="w-full px-6 py-4 bg-secondary/50 border border-accent/30 rounded-2xl focus:outline-none focus:border-accent" 
                     placeholder="Wall Decoration..." 
                     value={nameEn}
                     onChange={(e) => setNameEn(e.target.value)}
                   />
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Image de couverture</label>
                 <div className="relative w-full h-64 bg-secondary/30 rounded-[2rem] border-2 border-dashed border-primary/10 overflow-hidden flex flex-col items-center justify-center group cursor-pointer hover:border-primary/40 transition-all shadow-inner">
                     {(currentImage || editingItem?.image) ? (
                       <>
                         <img src={currentImage || editingItem?.image} alt="Preview" className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                           <span className="bg-white text-primary px-6 py-2 rounded-xl font-bold text-sm shadow-xl">Changer l'image</span>
                           <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentImage('');
                              if (editingItem) editingItem.image = '';
                            }}
                            className="bg-rose-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-xl hover:bg-rose-600 transition-colors cursor-pointer"
                           >
                             Supprimer
                           </button>
                         </div>
                       </>
                     ) : (
                       <div className="text-center p-10 text-primary/40 group-hover:text-primary/60 transition-colors">
                         <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ImageIcon size={32} />
                         </div>
                         <p className="text-sm font-bold uppercase tracking-widest">Sélectionner une photo</p>
                         <p className="text-[10px] mt-2 italic">Format carré ou paysage recommandé</p>
                       </div>
                     )}
                     <input 
                       type="file" 
                       accept="image/*"
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                       onChange={(e) => {
                         const file = e.target.files?.[0];
                         if (file) {
                           const reader = new FileReader();
                           reader.onloadend = () => {
                             setCurrentImage(reader.result as string);
                           };
                           reader.readAsDataURL(file);
                         }
                       }}
                     />
                  </div>
                  <input type="hidden" name="image" value={currentImage || editingItem?.image || ''} />
                  <input type="hidden" name="slug" value={currentSlug || editingItem?.slug || ''} />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-primary/60">Statut</label>
                 <select 
                   name="status" 
                   className="w-full px-6 py-4 bg-secondary/50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary" 
                   defaultValue={editingItem?.status || 'active'}
                 >
                   <option value="active">Actif</option>
                   <option value="inactive">Inactif</option>
                 </select>
               </div>

               <div className="pt-6">
                 <button 
                   type="submit" 
                   disabled={isSaving}
                   className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-accent transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                 >
                   {isSaving ? <Loader text="" /> : (activeTab === 'category-create' ? 'Créer la catégorie' : 'Enregistrer les modifications')}
                 </button>
               </div>
             </form>
           </div>
        )}
    </>
  );
}
