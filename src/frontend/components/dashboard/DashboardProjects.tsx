import React from 'react';
import { Scissors, ChevronRight, Trash2 } from 'lucide-react';
import { KnittingProject } from '../../../types';
import { Button } from '../ui/Button';

interface DashboardProjectsProps {
  knittingProjects: KnittingProject[];
  onNavigate: (view: string) => void;
  onDeleteProject: (id: string) => void;
}

export const DashboardProjects: React.FC<DashboardProjectsProps> = ({
  knittingProjects,
  onNavigate,
  onDeleteProject
}) => {
  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <h3 className="text-2xl font-serif font-bold text-primary">Mes Projets Tricot</h3>
            <Button 
                onClick={() => onNavigate('knitting-companion')}
                className="px-6 py-3 bg-accent text-white rounded-xl font-bold text-sm hover:bg-accent/90 transition-colors shadow-lg flex items-center gap-2 h-auto"
            >
                <Scissors size={18} />
                Nouveau Projet
            </Button>
        </div>

        {knittingProjects.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-primary/5">
                <Scissors size={48} className="mx-auto text-primary/70 mb-4" />
                <h3 className="text-xl font-serif font-bold text-primary mb-2">Aucun projet</h3>
                <p className="text-primary/70 mb-6">Commencez votre premier projet tricot dès maintenant !</p>
                <Button 
                    onClick={() => onNavigate('knitting-companion')}
                    className="px-8 py-3 bg-primary text-white rounded-full font-bold hover:bg-accent transition-colors h-auto"
                >
                    Lancer le Compagnon
                </Button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {knittingProjects.map(project => (
                    <div key={project.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-primary/5 hover:shadow-md transition-all relative group">
                        <Button 
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                if(confirm('Voulez-vous vraiment supprimer ce projet ?')) {
                                    onDeleteProject(project.id);
                                }
                            }}
                            className="absolute top-6 right-6 p-2 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 h-auto"
                            title="Supprimer le projet"
                        >
                            <Trash2 size={16} />
                        </Button>
                        <div className="flex justify-between items-start mb-6 pr-8">
                            <div>
                                <h4 className="text-xl font-bold text-primary mb-1">{project.name}</h4>
                                <p className="text-xs text-primary/70">Démarré le {new Date(project.startDate).toLocaleDateString()}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${project.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                {project.status === 'completed' ? 'Terminé' : 'En cours'}
                            </span>
                        </div>
                        
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-sm">
                                <span className="text-primary/70">Laine</span>
                                <span className="font-bold text-primary">{project.yarn || '-'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-primary/70">Aiguilles</span>
                                <span className="font-bold text-primary">{project.needleSize || '-'}</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-primary/70">
                                    <span>Progression</span>
                                    <span>{Math.round((project.rowCount / project.targetRows) * 100)}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-accent transition-all duration-500"
                                        style={{ width: `${Math.min(100, (project.rowCount / project.targetRows) * 100)}%` }}
                                    />
                                </div>
                                <p className="text-center text-xs text-primary/70 mt-1">
                                    {project.rowCount} / {project.targetRows} rangs
                                </p>
                            </div>
                        </div>

                        <Button 
                            variant="secondary"
                            onClick={() => onNavigate('knitting-companion')}
                            className="w-full py-3 bg-slate-50 text-primary rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 h-auto"
                        >
                            Continuer <ChevronRight size={16} />
                        </Button>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};
