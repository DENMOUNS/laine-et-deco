import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Edit, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Search, 
  CheckCircle2, 
  Sliders, 
  HelpCircle, 
  Info, 
  ShieldCheck, 
  Sparkles,
  Layers,
  Eye
} from 'lucide-react';
import { useEntity } from '../../../hooks/useEntity';
import { DataTable } from '../../../components/DataTable';
import { toast } from 'sonner';
import { useConfigStore } from '../../../../stores/configStore';
import { AdminContactPageEditor } from './AdminContactPageEditor';
import { AdminAboutPageEditor } from './AdminAboutPageEditor';
import { AdminFaqPageEditor } from './AdminFaqPageEditor';
import { DEFAULT_CONTACT_PAGE_CONFIG, DEFAULT_ABOUT_PAGE_CONFIG, DEFAULT_FAQ_PAGE_CONFIG } from '../../../../siteDefaults';

interface PageContent {
  id?: string;
  page?: string;
  slug?: string;
  title: string;
  content: string;
  notes?: string;
  status: 'active' | 'inactive';
}

function PageStatus({ item }: Readonly<{ item: PageContent }>) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
      {item.status}
    </span>
  );
}

function PageNotes({ item }: Readonly<{ item: PageContent }>) {
  return (
    <span className="truncate max-w-xs block text-primary/70" title={item.notes}>
      {item.notes || 'Aucune note'}
    </span>
  );
}

function PageActions({ item, onEdit, onDelete }: Readonly<{ item: PageContent; onEdit: (item: PageContent) => void; onDelete: (item: PageContent) => void }>) {
  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => onEdit(item)} className="p-2 bg-primary/5 text-primary rounded-lg hover:bg-primary/10 transition-colors" title="Modifier">
        <Edit size={16} />
      </button>
      <button type="button" onClick={() => onDelete(item)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors" title="Supprimer">
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export function AdminPages({ ctx }: Readonly<{ ctx: any }>) {
  const [selectedPageEditor, setSelectedPageEditor] = useState<string | null>(null);
  
  // Custom pages from Firestore entity
  const { data: customPages, createEntity, updateEntity, deleteEntity } = useEntity<PageContent>('content_page');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PageContent | null>(null);
  const [formData, setFormData] = useState({ page: '', title: '', content: '', notes: '', status: 'active' as 'active' | 'inactive' });

  // Get current configs
  const siteConfig = useConfigStore((s) => s.siteConfig);
  const contactCfg = { ...DEFAULT_CONTACT_PAGE_CONFIG, ...(ctx?.siteConfig?.contactPage || siteConfig?.contactPage || {}) };
  const aboutCfg = { ...DEFAULT_ABOUT_PAGE_CONFIG, ...(ctx?.siteConfig?.aboutPage || siteConfig?.aboutPage || {}) };
  const faqCfg = { ...DEFAULT_FAQ_PAGE_CONFIG, ...(ctx?.siteConfig?.faqPage || siteConfig?.faqPage || {}) };

  const handleSaveCustomPage = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const payload = { ...formData, slug: formData.page };
      if (editingItem?.id) {
        await updateEntity(editingItem.id, payload as any);
        toast.success('Page personnalisée mise à jour');
      } else {
        await createEntity(payload as any);
        toast.success('Nouvelle page personnalisée ajoutée');
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
      if (item.id && confirm('Supprimer cette page personnalisée ?')) {
        deleteEntity(item.id);
      }
    },
    [deleteEntity]
  );

  const columns: any[] = useMemo(
    () => [
      { header: 'Identifiant / URL', accessor: 'page' },
      { header: 'Titre de la page', accessor: 'title' },
      { header: 'Statut', accessor: (item: PageContent) => <PageStatus item={item} /> },
      { header: 'Notes de suivi', accessor: (item: PageContent) => <PageNotes item={item} /> },
      { header: 'Actions', accessor: (item: PageContent) => <PageActions item={item} onEdit={handleEditItem} onDelete={handleDeleteItem} /> },
    ],
    [handleDeleteItem, handleEditItem]
  );

  // If specific page editor is open, render dedicated editor
  if (selectedPageEditor === 'contact') {
    return (
      <AdminContactPageEditor
        ctx={ctx}
        onBack={() => setSelectedPageEditor(null)}
      />
    );
  }

  if (selectedPageEditor === 'about') {
    return (
      <AdminAboutPageEditor
        ctx={ctx}
        onBack={() => setSelectedPageEditor(null)}
      />
    );
  }

  if (selectedPageEditor === 'faq') {
    return (
      <AdminFaqPageEditor
        ctx={ctx}
        onBack={() => setSelectedPageEditor(null)}
        onGoToFaqItems={() => {
          if (ctx?.setActiveTab) {
            ctx.setActiveTab('faq');
          }
        }}
      />
    );
  }

  return (
    <div className="space-y-10 pb-12">
      {/* Header Banner */}
      <div className="bg-card p-6 md:p-8 rounded-3xl border border-primary/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-primary/5 text-primary rounded-2xl">
            <FileText size={26} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif text-primary">Gestion des Pages</h1>
            <p className="text-sm text-primary/60 mt-0.5">
              Administrez le contenu des pages interactives du site et configurez leurs blocs en base de données.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: Pages Principales du Site (Éditeurs Dédiés) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={20} className="text-accent" />
            <h2 className="text-xl font-serif font-bold text-primary">Pages Principales du Site</h2>
          </div>
          <span className="text-xs text-primary/60 font-medium">Cliquez sur une page pour modifier son contenu</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* CARTE 1 : Page Contact (Éditeur Complet Firestore) */}
          <div 
            onClick={() => setSelectedPageEditor('contact')}
            className="group relative bg-card hover:bg-secondary/20 p-6 rounded-3xl border-2 border-accent/30 hover:border-accent shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Phone size={22} />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> Éditeur Firestore Prêt
                </span>
              </div>

              <h3 className="text-xl font-serif font-bold text-primary group-hover:text-accent transition-colors mb-1">
                Page Contact
              </h3>
              <p className="text-xs text-primary/60 mb-4">
                Modifier en direct les 4 cartes coordonnées (Boutique, Téléphone, Email, Horaires) et l'encadré sur mesure.
              </p>

              {/* Aperçu rapide des données enregistrées */}
              <div className="bg-secondary/40 rounded-2xl p-3.5 space-y-2 text-xs text-primary/80 border border-primary/5">
                <div className="flex items-center gap-2 truncate">
                  <MapPin size={13} className="text-accent shrink-0" />
                  <span className="truncate">{contactCfg.shopAddressLine1 || 'Akwa, Rue des Écoles'} ({contactCfg.shopAddressLine2 || 'Douala'})</span>
                </div>
                <div className="flex items-center gap-2 truncate">
                  <Phone size={13} className="text-accent shrink-0" />
                  <span>{contactCfg.phoneNumber || '+237 600 000 000'}</span>
                  <span className="text-[10px] text-primary/50">({contactCfg.phoneAvailability || 'Lun-Ven'})</span>
                </div>
                <div className="flex items-center gap-2 truncate">
                  <Mail size={13} className="text-accent shrink-0" />
                  <span className="truncate">{contactCfg.emailAddress || 'contact@laine-deco.com'}</span>
                </div>
                <div className="flex items-center gap-2 truncate">
                  <Clock size={13} className="text-accent shrink-0" />
                  <span className="truncate">{contactCfg.hoursWeekday || 'Lun - Ven : 09h - 19h'}</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-primary/10 flex items-center justify-between text-xs font-bold text-accent">
              <span>Ouvrir l'éditeur de contact</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* CARTE 2 : Page À Propos (Éditeur Firestore Prêt) */}
          <div 
            onClick={() => setSelectedPageEditor('about')}
            className="group relative bg-card hover:bg-secondary/20 p-6 rounded-3xl border-2 border-accent/30 hover:border-accent shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Info size={22} />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> Éditeur Firestore Prêt
                </span>
              </div>
              <h3 className="text-xl font-serif font-bold text-primary group-hover:text-accent transition-colors mb-1">
                Page À Propos
              </h3>
              <p className="text-xs text-primary/60 mb-4">
                Histoire, mission textile, les 4 valeurs piliers et biographies des fondateurs.
              </p>
              <div className="bg-secondary/40 rounded-2xl p-3.5 space-y-2 text-xs text-primary/80 border border-primary/5">
                <div className="font-serif font-bold text-primary truncate">
                  {aboutCfg.heroTitle || "Notre Histoire & Notre Raison d'Être"}
                </div>
                <div className="text-[11px] text-primary/70 line-clamp-2">
                  {aboutCfg.heroSubtitle || "Découvrez l'aventure de Laine & Déco..."}
                </div>
              </div>
            </div>
            <div className="pt-5 mt-4 border-t border-primary/10 flex items-center justify-between text-xs font-bold text-accent">
              <span>Ouvrir l'éditeur À Propos</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* CARTE 3 : Page FAQ (Éditeur Firestore Prêt) */}
          <div 
            onClick={() => setSelectedPageEditor('faq')}
            className="group relative bg-card hover:bg-secondary/20 p-6 rounded-3xl border-2 border-accent/30 hover:border-accent shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                  <HelpCircle size={22} />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> Éditeur Firestore Prêt
                </span>
              </div>
              <h3 className="text-xl font-serif font-bold text-primary group-hover:text-accent transition-colors mb-1">
                Page FAQ Dynamique
              </h3>
              <p className="text-xs text-primary/60 mb-4">
                Bandeau d'accueil, barre de recherche, assistance WhatsApp & gestion des Q/R.
              </p>
              <div className="bg-secondary/40 rounded-2xl p-3.5 space-y-2 text-xs text-primary/80 border border-primary/5">
                <div className="font-serif font-bold text-primary truncate">
                  {faqCfg.heroTitle || "Comment pouvons-nous vous aider ?"}
                </div>
                <div className="text-[11px] text-primary/70 line-clamp-2">
                  {faqCfg.heroSubtitle || "Trouvez des réponses instantanées..."}
                </div>
              </div>
            </div>
            <div className="pt-5 mt-4 border-t border-primary/10 flex items-center justify-between text-xs font-bold text-accent">
              <span>Ouvrir l'éditeur FAQ</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Pages Personnalisées / Contenus Additionnels */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText size={20} className="text-accent" />
              <h2 className="text-xl font-serif font-bold text-primary">Pages Additionnelles & Mentions</h2>
            </div>
            <p className="text-xs text-primary/60 mt-0.5">
              Créez des pages statiques supplémentaires (ex. Mentions Légales, CGV, Politique de Livraison).
            </p>
          </div>
          <button
            type="button"
            onClick={openNewPageModal}
            className="bg-primary hover:bg-accent text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all self-start sm:self-auto shadow-md shadow-primary/10"
          >
            <Plus size={18} /> Nouvelle Page
          </button>
        </div>

        <div className="bg-card rounded-3xl border border-primary/10 shadow-sm overflow-hidden">
          <DataTable data={customPages || []} columns={columns} />
        </div>
      </div>

      {/* Modale d'ajout/édition d'une page personnalisée */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            aria-label="Fermer la fenêtre modale"
            onClick={() => setIsModalOpen(false)}
          />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative z-10 p-8 border border-primary/10">
            <h3 className="text-2xl font-serif text-primary mb-6">{editingItem ? 'Modifier la page' : 'Créer une page personnalisée'}</h3>
            <form onSubmit={handleSaveCustomPage} className="space-y-4">
              <div>
                <label htmlFor="page-slug" className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Identifiant / Slug d'URL</label>
                <input
                  id="page-slug"
                  required
                  type="text"
                  value={formData.page}
                  onChange={(e) => setFormData({ ...formData, page: e.target.value })}
                  className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                  placeholder="ex: mentions-legales, cgv, livraison"
                />
              </div>
              <div>
                <label htmlFor="page-title" className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Titre de la page</label>
                <input
                  id="page-title"
                  required
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                  placeholder="ex: Conditions Générales de Vente"
                />
              </div>
              <div>
                <label htmlFor="page-content" className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Contenu texte</label>
                <textarea
                  id="page-content"
                  required
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary resize-none"
                  placeholder="Rédigez le texte de la page..."
                />
              </div>
              <div>
                <label htmlFor="page-notes" className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Notes de suivi internes</label>
                <textarea
                  id="page-notes"
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary resize-none"
                  placeholder="Commentaires pour l'équipe..."
                />
              </div>
              <div>
                <label htmlFor="page-status" className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-2 block">Statut</label>
                <select
                  id="page-status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full bg-secondary/50 border border-primary/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary"
                >
                  <option value="active">Active (Publiée)</option>
                  <option value="inactive">Inactive (Brouillon)</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 border border-primary/20 text-primary font-bold rounded-2xl hover:bg-primary/5 transition-colors">Annuler</button>
                <button type="submit" className="flex-1 py-3.5 bg-primary text-white font-bold rounded-2xl hover:bg-accent transition-colors shadow-lg shadow-primary/10">Enregistrer</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
