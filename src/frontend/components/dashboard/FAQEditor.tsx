import React, { useState, useEffect } from 'react';
import { FAQ } from '../../../types';
import { X, Save, AlertCircle } from 'lucide-react';

interface FAQEditorProps {
  faq: FAQ | null;
  onSave: (faq: FAQ) => void;
  onClose: () => void;
}

export const FAQEditor: React.FC<FAQEditorProps> = ({ faq, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<FAQ>>({
    question: '',
    answer: '',
    category: 'Livraison',
    order: 0,
    status: 'active'
  });

  useEffect(() => {
    if (faq) {
      setFormData(faq);
    }
  }, [faq]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) return;
    onSave(formData as FAQ);
  };

  const categories = ['Livraison', 'Commandes', 'Paiements', 'Produits', 'Sur Mesure'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 md:p-8 flex justify-between items-center border-b border-slate-100">
          <h2 className="text-2xl font-serif text-primary">
            {faq ? 'Modifier la Question' : 'Ajouter une Question'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-primary/70 mb-2">Question</label>
              <input
                type="text"
                required
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-accent outline-none"
                placeholder="Ex: Quels sont les délais de livraison ?"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-widest text-primary/70 mb-2">Réponse</label>
              <textarea
                required
                rows={4}
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-accent outline-none font-sans"
                placeholder="Détaillez la réponse ici..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-primary/70 mb-2">Catégorie</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-accent outline-none appearance-none bg-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-primary/70 mb-2">Ordre d'affichage</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-accent outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-primary/70 mb-2">Statut</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-accent outline-none appearance-none bg-white"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-accent text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} /> Enregistrer
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 text-primary py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
