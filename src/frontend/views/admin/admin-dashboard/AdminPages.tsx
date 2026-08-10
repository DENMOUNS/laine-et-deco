import React, { useCallback, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Edit, Trash2, Search, Plus } from 'lucide-react';

import { useEntity } from '../../../hooks/useEntity';
import { DataTable } from '../../../components/DataTable';
import { toast } from 'sonner';

function PageStatus({ item }: Readonly<{ item: PageContent }>) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
      {item.status}
    </span>
  );
}

function PageNotes({ item }: Readonly<{ item: PageContent }>) {
  return (
    <span className="truncate max-w-xs block" title={item.notes}>
      {item.notes || 'Aucune note'}
    </span>
  );
}

function PageActions({ item, onEdit, onDelete }: Readonly<{ item: PageContent; onEdit: (item: PageContent) => void; onDelete: (item: PageContent) => void }>) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => onEdit(item)} className="p-2 bg-primary/5 text-primary rounded-lg hover:bg-primary/10">
        <Edit size={16} />
      </button>
      <button type="button" onClick={() => onDelete(item)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100">
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function renderPageStatus(item: PageContent) {
  return <PageStatus item={item} />;
}

function renderPageNotes(item: PageContent) {
  return <PageNotes item={item} />;
}

function renderPageActions(item: PageContent, onEdit: (item: PageContent) => void, onDelete: (item: PageContent) => void) {
  return <PageActions item={item} onEdit={onEdit} onDelete={onDelete} />;
}

export function AdminPages({ ctx }: Readonly<{ ctx: any }>) {
  const { data: pages, createEntity, updateEntity, deleteEntity } = useEntity<PageContent>('content_page');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PageContent | null>(null);
  const [formData, setFormData] = useState({ page: '', title: '', content: '', notes: '', status: 'active' as 'active' | 'inactive' });

  const handleSave = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const payload = { ...formData, slug: formData.page };
      if (editingItem?.id) {
        await updateEntity(editingItem.id, payload as any);
        toast.success('Page mise à jour');
      } else {
        await createEntity(payload as any);
        toast.success('Nouvelle page ajoutée');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ page: '', title: '', content: '', notes: '', status: 'active' });
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const openNewPageModal = () => {
    setEditingItem(null);
    setFormData({ page: '', title: '', content: '', notes: '', status: 'active' });
    setIsModalOpen(true);
  };

  const handleEditItem = useCallback((item: PageContent) => {
    setEditingItem(item);
    setFormData({ page: item.page || item.slug || '', title: item.title, content: item.content, notes: item.notes || '', status: item.status });
    setIsModalOpen(true);
  }, []);

  const handleDeleteItem = useCallback(
    (item: PageContent) => {
      if (item.id && confirm('Supprimer cette page ?')) {
        deleteEntity(item.id);
      }
    },
    [deleteEntity]
  );

  const columns: any[] = useMemo(
    () => [
      { header: 'Page', accessor: 'page' },
      { header: 'Titre', accessor: 'title' },
      { header: 'Statut', accessor: renderPageStatus },
      { header: 'Notes', accessor: renderPageNotes },
      { header: 'Actions', accessor: (item: PageContent) => renderPageActions(item, handleEditItem, handleDeleteItem) },
    ],
    [handleDeleteItem, handleEditItem]
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-card p-6 rounded-3xl border border-primary/10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/5 text-primary rounded-2xl"><Search size={24} /></div>
          <div>
            <h2 className="text-2xl font-serif text-primary">Pages</h2>
            <p className="text-sm text-primary/60">Gérez le contenu des pages publiques et les notes de suivi.</p>
          </div>
        </div>
        <button onClick={openNewPageModal} className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all">
          <Plus size={20} /> Nouvelle Page
        </button>
      </div>

      <div className="bg-card rounded-3xl border border-primary/10 shadow-sm overflow-hidden">
        <DataTable data={pages || []} columns={columns} />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-label="Fermer la fenêtre modale"
            onClick={() => setIsModalOpen(false)}
          />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative z-10 p-8 border border-primary/10">
            <h3 className="text-2xl font-serif text-primary mb-6">{editingItem ? 'Modifier une page' : 'Ajouter une page'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="page-slug" className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Identifiant de la page</label>
                <input
                  id="page-slug"
                  required
                  type="text"
                  value={formData.page}
                  onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                  className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3"
                  placeholder="ex: about, legal, shipping"
                />
              </div>
              <div>
                <label htmlFor="page-title" className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Titre</label>
                <input
                  id="page-title"
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3"
                />
              </div>
              <div>
                <label htmlFor="page-content" className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Contenu</label>
                <textarea
                  id="page-content"
                  required
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 resize-none"
                  placeholder="Texte de la page, plusieurs paragraphes séparés par des sauts de ligne"
                />
              </div>
              <div>
                <label htmlFor="page-notes" className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Notes / Reste à faire</label>
                <textarea
                  id="page-notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 resize-none"
                  placeholder="Ajoutez des commentaires de suivi ou les modifications restantes"
                />
              </div>
              <div>
                <label htmlFor="page-status" className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Statut</label>
                <select
                  id="page-status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3"
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 border border-primary/20 text-primary font-bold rounded-2xl hover:bg-primary/5">Annuler</button>
                <button type="submit" className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-accent">Enregistrer</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
