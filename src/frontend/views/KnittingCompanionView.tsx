import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Scissors, Plus, Clock, CheckCircle2, Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface Project {
  id: string;
  name: string;
  status: 'in-progress' | 'completed';
  rows: number;
  totalRows: number;
  lastUpdated: string;
}

export const KnittingCompanionView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([
    { id: '1', name: 'Pull Oversize Laine', status: 'in-progress', rows: 45, totalRows: 120, lastUpdated: 'Il y a 2h' },
    { id: '2', name: 'Écharpe Torsadée', status: 'in-progress', rows: 82, totalRows: 200, lastUpdated: 'Hier' },
    { id: '3', name: 'Bonnet Pompon', status: 'completed', rows: 60, totalRows: 60, lastUpdated: 'Il y a 3 jours' }
  ]);

  const incrementRow = (id: string) => {
    setProjects(projects.map(p => 
      p.id === id && p.rows < p.totalRows ? { ...p, rows: p.rows + 1, lastUpdated: 'À l\'instant' } : p
    ));
  };

  const resetRows = (id: string) => {
    if (window.confirm('Voulez-vous vraiment réinitialiser le compteur ?')) {
      setProjects(projects.map(p => p.id === id ? { ...p, rows: 0 } : p));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Scissors size={14} />
            <span>Compagnon de Tricot</span>
          </motion.div>
          <h1 className="text-5xl font-serif text-primary">Mes Projets</h1>
        </div>
        <Button size="lg" className="rounded-full px-8 shadow-xl shadow-primary/20">
          <Plus size={20} className="mr-2" /> Nouveau Projet
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-card p-8 md:p-12 rounded-[3rem] border border-primary/5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-serif text-primary">{project.name}</h3>
                  {project.status === 'completed' && (
                    <CheckCircle2 size={20} className="text-green-500" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-primary/70 text-xs font-bold uppercase tracking-widest">
                  <Clock size={14} />
                  <span>Mis à jour {project.lastUpdated}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-4xl font-bold text-accent">{Math.round((project.rows / project.totalRows) * 100)}%</span>
                <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">Progression</p>
              </div>
            </div>

            <div className="relative h-4 bg-primary/5 rounded-full overflow-hidden mb-10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(project.rows / project.totalRows) * 100}%` }}
                className="absolute inset-y-0 left-0 bg-accent shadow-[0_0_15px_rgba(184,85,53,0.4)]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">{project.rows}</p>
                  <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">Rangs faits</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary/70">{project.totalRows}</p>
                  <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">Total visé</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => resetRows(project.id)}
                  className="w-12 h-12 rounded-2xl border-primary/10 hover:bg-red-50 hover:text-red-500"
                >
                  <RotateCcw size={20} />
                </Button>
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => incrementRow(project.id)}
                  disabled={project.status === 'completed'}
                  className="rounded-2xl px-8 h-12 font-bold shadow-lg shadow-primary/10"
                >
                  Rang suivant <Plus size={20} className="ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 bg-secondary/30 p-12 rounded-[3rem] border border-primary/5 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-shrink-0 w-24 h-24 bg-accent/10 rounded-[2rem] flex items-center justify-center text-accent">
          <Play size={40} fill="currentColor" />
        </div>
        <div>
          <h2 className="text-2xl font-serif text-primary mb-2">Mode Chronomètre</h2>
          <p className="text-primary/70 max-w-xl">
            Activez le mode chronomètre pour suivre précisément le temps passé sur chaque rang et estimer la date de fin de votre projet.
          </p>
        </div>
        <Button variant="outline" className="md:ml-auto rounded-full px-8">
          Activer le mode expert
        </Button>
      </div>
    </div>
  );
};
