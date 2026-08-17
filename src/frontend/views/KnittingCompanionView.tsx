import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  Archive,
  Check,
  CheckCircle2,
  Clock3,
  Lightbulb,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Scissors,
  Trash2,
  X,
} from 'lucide-react';
import { where } from 'firebase/firestore';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { useEntity } from '../hooks/useEntity';
import { useAuthStore } from '../../stores/authStore';
import type { KnittingProject, Product } from '../../types';
import { triggerHaptic } from '../utils/haptics';

const LOCAL_STORAGE_KEY = 'knitting-companion-projects:v2';

type ProjectForm = {
  name: string;
  targetRows: string;
  yarnProductId: string;
  customYarn: string;
  needleSize: string;
  notes: string;
};

const emptyForm: ProjectForm = {
  name: '',
  targetRows: '',
  yarnProductId: '',
  customYarn: '',
  needleSize: '',
  notes: '',
};

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return hours > 0
    ? `${hours}h ${String(minutes).padStart(2, '0')}min`
    : `${minutes}min ${String(remainingSeconds).padStart(2, '0')}s`;
};

const formatDate = (value: string) => new Date(value).toLocaleDateString('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const readLocalProjects = (): KnittingProject[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) as KnittingProject[] : [];
  } catch {
    return [];
  }
};

export const KnittingCompanionView: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const [localProjects, setLocalProjects] = useState<KnittingProject[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isExpertMode, setIsExpertMode] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const { data: products, isLoading: isProductsLoading } = useEntity<Product>('product', [], { cacheOnly: true });
  const woolProducts = useMemo(
    () => products
      .filter((product) => product.category.trim().toLocaleLowerCase('fr-FR') === 'laine' && product.isAvailable !== false)
      .sort((first, second) => first.name.localeCompare(second.name, 'fr')),
    [products],
  );

  const { data: cloudProjects, isLoading: isCloudLoading, addEntity, updateEntity, deleteEntity } = useEntity<KnittingProject>(
    'knitting_project',
    [],
    {
      enabled: Boolean(user),
      constraints: user ? [where('userId', '==', user.uid)] : [],
      deps: [user?.uid],
    },
  );

  const projects = user ? cloudProjects : localProjects;
  const activeProject = projects.find((project) => project.id === activeProjectId) ?? projects[0];

  const totalCompletedRows = useMemo(
    () => projects.reduce((total, project) => total + project.rowCount, 0),
    [projects],
  );

  useEffect(() => {
    if (!user) setLocalProjects(readLocalProjects());
  }, [user]);

  useEffect(() => {
    if (user && cloudProjects.length > 0 && !activeProjectId) {
      setActiveProjectId(cloudProjects[0].id);
    }
  }, [activeProjectId, cloudProjects, user]);

  useEffect(() => {
    if (!user) localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localProjects));
  }, [localProjects, user]);

  useEffect(() => {
    if (!isTimerRunning) return undefined;
    const timer = window.setInterval(() => setSessionSeconds((seconds) => seconds + 1), 1000);
    return () => window.clearInterval(timer);
  }, [isTimerRunning]);

  const replaceLocalProject = (updated: KnittingProject) => {
    setLocalProjects((current) => current.map((project) => project.id === updated.id ? updated : project));
  };

  const persistUpdate = async (project: KnittingProject, updates: Partial<KnittingProject>) => {
    const updated = { ...project, ...updates, lastUpdated: new Date().toISOString() };
    if (user) {
      try {
        await updateEntity(project.id, { ...updates, lastUpdated: updated.lastUpdated });
      } catch {
        toast.error('La synchronisation a échoué. Réessayez dans un instant.');
        return null;
      }
    } else {
      replaceLocalProject(updated);
    }
    return updated;
  };

  const incrementRow = async (project: KnittingProject, amount = 1) => {
    const rowCount = Math.max(0, Math.min(project.targetRows, project.rowCount + amount));
    const status = rowCount >= project.targetRows ? 'completed' : 'in-progress';
    if (status === 'completed') {
      triggerHaptic('success');
    } else {
      triggerHaptic('medium');
    }
    const savedProject = await persistUpdate(project, { rowCount, status });
    if (!savedProject) return;
    toast.success(status === 'completed' ? 'Bravo, votre projet est terminé !' : 'Rang enregistré.');
  };

  const resetRows = async (project: KnittingProject) => {
    if (!window.confirm(`Réinitialiser la progression de « ${project.name} » ?`)) return;
    triggerHaptic('warning');
    if (await persistUpdate(project, { rowCount: 0, status: 'in-progress' })) toast.success('Progression réinitialisée.');
  };

  const toggleTimer = () => {
    triggerHaptic('light');
    if (!activeProject) {
      toast.info('Créez d’abord un projet pour démarrer une session.');
      setIsCreateOpen(true);
      return;
    }
    setActiveProjectId(activeProject.id);
    setIsExpertMode(true);
    setIsTimerRunning((running) => !running);
  };

  const finishTimer = async () => {
    if (!activeProject || sessionSeconds === 0) {
      setIsTimerRunning(false);
      return;
    }
    setIsTimerRunning(false);
    if (await persistUpdate(activeProject, { timeSpent: activeProject.timeSpent + sessionSeconds })) {
      setSessionSeconds(0);
      toast.success('Session enregistrée dans votre projet.');
    }
  };

  const handleCreateProject = async (event: React.FormEvent) => {
    event.preventDefault();
    const targetRows = Number(form.targetRows);
    if (!form.name.trim() || !Number.isFinite(targetRows) || targetRows <= 0) {
      toast.error('Indiquez un nom et un nombre de rangs supérieur à zéro.');
      return;
    }

    if (!form.yarnProductId || (form.yarnProductId === 'other' && !form.customYarn.trim())) {
      toast.error('Sélectionnez une laine ou saisissez son nom dans « Autre ».');
      return;
    }

    setIsSaving(true);
    const now = new Date().toISOString();
    const projectData = {
      name: form.name.trim(),
      startDate: now,
      rowCount: 0,
      targetRows: Math.round(targetRows),
      timeSpent: 0,
      needleSize: form.needleSize.trim(),
      yarn: form.yarnProductId === 'other'
        ? form.customYarn.trim()
        : woolProducts.find((product) => product.id === form.yarnProductId)?.name || '',
      notes: form.notes.trim(),
      status: 'in-progress' as const,
      lastUpdated: now,
      ...(user ? { userId: user.uid } : {}),
    };

    try {
      if (user) {
        const id = await addEntity(projectData);
        setActiveProjectId(id);
      } else {
        const localProject = { id: crypto.randomUUID(), ...projectData };
        setLocalProjects((current) => [localProject, ...current]);
        setActiveProjectId(localProject.id);
      }
      setForm(emptyForm);
      setIsCreateOpen(false);
      toast.success('Projet créé. Bon tricot !');
    } catch {
      toast.error('Impossible de créer le projet pour le moment.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeProject = async (project: KnittingProject) => {
    if (!window.confirm(`Supprimer définitivement « ${project.name} » ?`)) return;
    if (user) {
      try {
        await deleteEntity(project.id);
      } catch {
        toast.error('Impossible de supprimer ce projet.');
        return;
      }
    } else {
      setLocalProjects((current) => current.filter((item) => item.id !== project.id));
    }
    if (activeProjectId === project.id) setActiveProjectId(null);
    toast.success('Projet supprimé.');
  };

  const selectProject = (projectId: string) => {
    if (isTimerRunning && activeProjectId !== projectId) {
      toast.info('Enregistrez ou mettez en pause votre session avant de changer de projet.');
      return;
    }
    setActiveProjectId(projectId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-widest mb-5">
            <Scissors size={14} /> Compagnon de tricot
          </div>
          <h1 className="text-4xl md:text-6xl font-serif text-primary mb-4">Vos ouvrages, à votre rythme.</h1>
          <p className="text-primary/70 max-w-2xl text-base md:text-lg">
            Un espace doux et simple pour savoir où vous en êtes, retrouver vos notes et garder le plaisir de chaque rang.
          </p>
        </div>
        <Button size="lg" onClick={() => setIsCreateOpen(true)} className="rounded-full px-8 shadow-xl shadow-primary/20 shrink-0">
          <Plus size={20} className="mr-2" /> Nouveau projet
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard label="Projets" value={String(projects.length)} />
        <StatCard label="En cours" value={String(projects.filter((project) => project.status === 'in-progress').length)} />
        <StatCard label="Terminés" value={String(projects.filter((project) => project.status === 'completed').length)} />
        <StatCard label="Rangs réalisés" value={String(totalCompletedRows)} />
      </div>

      {isCloudLoading && user ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((item) => <div key={item} className="h-72 rounded-[2.5rem] bg-primary/5 animate-pulse" />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState onCreate={() => setIsCreateOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              isActive={project.id === activeProject?.id}
              onSelect={() => selectProject(project.id)}
              onIncrement={() => void incrementRow(project)}
              onDecrement={() => void incrementRow(project, -1)}
              onReset={() => void resetRows(project)}
              onDelete={() => void removeProject(project)}
            />
          ))}
        </div>
      )}

      <section className={`mt-12 p-6 md:p-12 rounded-[2.5rem] md:clay-tactile border transition-all ${isExpertMode ? 'bg-primary text-white border-primary shadow-2xl shadow-primary/25' : 'bg-secondary/30 md:bg-white border-primary/10'}`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${isExpertMode ? 'bg-white/10 text-accent' : 'bg-accent/15 text-accent shadow-inner'}`}>
            <Clock3 size={30} />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-2xl font-serif">Mode expert</h2>
              {isExpertMode && <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest">Session active</span>}
            </div>
            <p className={isExpertMode ? 'text-white/70' : 'text-primary/70'}>
              Chronométrez une session, enregistrez votre temps et découvrez votre rythme naturel de tricot.
            </p>
            {isExpertMode && <p className="text-3xl font-bold mt-4 tracking-tight">{formatDuration(sessionSeconds)}</p>}
          </div>
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <Button variant={isExpertMode ? 'accent' : 'primary'} onClick={toggleTimer} className="rounded-full clay-tactile-button py-3 px-6">
              {isTimerRunning ? <Pause size={18} className="mr-2" /> : <Play size={18} className="mr-2" />}
              {isTimerRunning ? 'Mettre en pause' : isExpertMode ? 'Reprendre' : 'Démarrer une session'}
            </Button>
            {isExpertMode && <Button variant="outline" onClick={() => void finishTimer()} className="rounded-full border-white/20 text-white hover:bg-white/10">Enregistrer</Button>}
          </div>
        </div>
      </section>

      <div className="mt-8 flex items-start gap-3 text-sm text-primary/60 bg-accent/5 rounded-2xl p-5 md:p-6 border border-accent/10">
        <Lightbulb size={20} className="text-accent shrink-0 mt-0.5" />
        <p><strong className="text-primary">Astuce tactile :</strong> lancez une session au début d’un moment de tricot et arrêtez-la quand vous posez vos aiguilles. Le temps est automatiquement rattaché au projet sélectionné.</p>
      </div>

      {isCreateOpen && <CreateProjectModal form={form} setForm={setForm} isSaving={isSaving} woolProducts={woolProducts} isProductsLoading={isProductsLoading} onClose={() => setIsCreateOpen(false)} onSubmit={handleCreateProject} />}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-card md:clay-tactile rounded-2xl md:rounded-3xl border border-primary/10 p-5 md:p-6 transition-transform hover:scale-[1.02]">
    <p className="text-3xl md:text-4xl font-bold text-primary font-serif">{value}</p>
    <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60 mt-1">{label}</p>
  </div>
);

const EmptyState: React.FC<{ onCreate: () => void }> = ({ onCreate }) => (
  <div className="text-center py-16 md:py-24 px-6 bg-card md:clay-tactile rounded-[2.5rem] border border-primary/10">
    <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-accent/10 text-accent flex items-center justify-center shadow-inner"><Archive size={36} /></div>
    <h2 className="text-2xl md:text-3xl font-serif text-primary mb-3">Votre prochain ouvrage commence ici</h2>
    <p className="max-w-md mx-auto text-primary/70 mb-7">Créez un projet pour compter vos rangs, garder vos informations et reprendre facilement votre tricot.</p>
    <Button onClick={onCreate} size="lg" className="rounded-full px-8 clay-tactile-button"><Plus size={18} className="mr-2" /> Créer mon premier projet</Button>
  </div>
);

type ProjectCardProps = {
  project: KnittingProject;
  index: number;
  isActive: boolean;
  onSelect: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onReset: () => void;
  onDelete: () => void;
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, isActive, onSelect, onIncrement, onDecrement, onReset, onDelete }) => {
  const progress = project.targetRows > 0 ? Math.min(100, Math.round((project.rowCount / project.targetRows) * 100)) : 0;
  return (
    <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} onClick={onSelect} className={`bg-card md:clay-tactile p-6 md:p-8 rounded-[2.5rem] border cursor-pointer transition-all ${isActive ? 'border-accent shadow-xl shadow-accent/15 ring-2 ring-accent/20' : 'border-primary/10 shadow-sm hover:shadow-md'}`}>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl md:text-2xl font-serif text-primary">{project.name}</h3>
            {project.status === 'completed' && <CheckCircle2 size={19} className="text-green-500 shrink-0" />}
          </div>
          <p className="text-xs text-primary/60">Commencé le {formatDate(project.startDate)}</p>
        </div>
        <button type="button" aria-label={`Supprimer ${project.name}`} onClick={(event) => { event.stopPropagation(); onDelete(); }} className="p-2.5 rounded-full text-primary/30 hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
      </div>
      <div className="flex items-end justify-between gap-4 mb-3"><span className="text-4xl font-bold text-accent font-serif">{progress}%</span><span className="text-sm font-bold text-primary/70">{project.rowCount} / {project.targetRows} rangs</span></div>
      <div className="h-3.5 bg-primary/10 rounded-full overflow-hidden mb-6 shadow-inner"><motion.div animate={{ width: `${progress}%` }} className="h-full bg-accent rounded-full shadow-sm" /></div>
      <div className="grid grid-cols-2 gap-3 text-xs text-primary/60 mb-6">
        <div className="bg-primary/5 rounded-2xl p-3.5 border border-primary/5"><span className="block font-bold text-primary text-sm mb-0.5">{project.yarn || 'Non renseignée'}</span>Laine</div>
        <div className="bg-primary/5 rounded-2xl p-3.5 border border-primary/5"><span className="block font-bold text-primary text-sm mb-0.5">{project.needleSize || 'Non renseignées'}</span>Aiguilles</div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="icon" onClick={onDecrement} disabled={project.rowCount === 0} className="w-11 h-11 rounded-2xl border-primary/15 hover:bg-primary/5 font-bold text-lg">−</Button>
          <Button variant="outline" size="icon" onClick={onReset} className="w-11 h-11 rounded-2xl border-primary/15 hover:bg-primary/5" title="Réinitialiser"><RotateCcw size={17} /></Button>
          <Button variant="outline" size="icon" onClick={onIncrement} disabled={project.status === 'completed'} className="w-11 h-11 rounded-2xl border-primary/15 hover:bg-primary/5 font-bold text-lg">+</Button>
        </div>
        <Button variant="primary" onClick={onIncrement} disabled={project.status === 'completed'} className="rounded-2xl px-6 py-3 clay-tactile-button">{project.status === 'completed' ? <><Check size={16} className="mr-2" /> Terminé</> : <>Rang suivant <Plus size={16} className="ml-2" /></>}</Button>
      </div>
      {project.notes && <p className="mt-5 pt-5 border-t border-primary/10 text-sm text-primary/70 line-clamp-2">{project.notes}</p>}
    </motion.article>
  );
};

type CreateModalProps = {
  form: ProjectForm;
  setForm: React.Dispatch<React.SetStateAction<ProjectForm>>;
  isSaving: boolean;
  woolProducts: Product[];
  isProductsLoading: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
};

const CreateProjectModal: React.FC<CreateModalProps> = ({ form, setForm, isSaving, woolProducts, isProductsLoading, onClose, onSubmit }) => (
  <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm" onMouseDown={onClose}>
    <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-[2rem] shadow-2xl p-6 md:p-8">
      <div className="flex items-center justify-between mb-7"><div><p className="text-xs uppercase tracking-widest text-accent font-bold mb-2">Nouveau projet</p><h2 className="text-3xl font-serif text-primary">Donnons-lui un nom</h2></div><button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-primary/5"><X size={20} /></button></div>
      <form onSubmit={onSubmit} className="space-y-5">
        <Field label="Nom du projet *"><input autoFocus required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ex. Pull d'hiver" className="w-full rounded-xl border border-primary/10 bg-secondary/30 px-4 py-3 text-primary outline-none focus:border-accent" /></Field>
        <Field label="Nombre total de rangs *"><input required min="1" type="number" value={form.targetRows} onChange={(event) => setForm((current) => ({ ...current, targetRows: event.target.value }))} placeholder="Ex. 120" className="w-full rounded-xl border border-primary/10 bg-secondary/30 px-4 py-3 text-primary outline-none focus:border-accent" /></Field>
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Laine *">
            <select required value={form.yarnProductId} onChange={(event) => setForm((current) => ({ ...current, yarnProductId: event.target.value, customYarn: '' }))} disabled={isProductsLoading} className="w-full rounded-xl border border-primary/10 bg-secondary/30 px-4 py-3 text-primary outline-none focus:border-accent">
              <option value="">{isProductsLoading ? 'Chargement des laines…' : 'Choisir une laine'}</option>
              {woolProducts.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
              <option value="other">Autre</option>
            </select>
            {form.yarnProductId === 'other' && <input required autoFocus value={form.customYarn} onChange={(event) => setForm((current) => ({ ...current, customYarn: event.target.value }))} placeholder="Saisissez le nom de votre laine" className="mt-3 w-full rounded-xl border border-accent/40 bg-white px-4 py-3 text-primary outline-none focus:border-accent" />}
          </Field>
          <Field label="Aiguilles"><input value={form.needleSize} onChange={(event) => setForm((current) => ({ ...current, needleSize: event.target.value }))} placeholder="Ex. 4,5 mm" className="w-full rounded-xl border border-primary/10 bg-secondary/30 px-4 py-3 text-primary outline-none focus:border-accent" /></Field>
        </div>
        <Field label="Notes"><textarea rows={3} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Motif, taille, idées, rappels..." className="w-full rounded-xl border border-primary/10 bg-secondary/30 px-4 py-3 text-primary outline-none focus:border-accent resize-none" /></Field>
        <div className="flex justify-end gap-3 pt-3"><Button type="button" variant="ghost" onClick={onClose}>Annuler</Button><Button type="submit" isLoading={isSaving} className="rounded-xl px-6"><Check size={17} className="mr-2" /> Créer le projet</Button></div>
      </form>
    </motion.div>
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => <label className="block"><span className="block text-xs font-bold uppercase tracking-widest text-primary/70 mb-2">{label}</span>{children}</label>;
