import React from 'react';
import { Calculator, Scale, Trash2 } from 'lucide-react';
import { WoolCalculation, VolumeCalculation } from '../../../types';
import { Button } from '../ui/Button';

interface DashboardToolsProps {
  woolCalculations: WoolCalculation[];
  volumeCalculations: VolumeCalculation[];
  onNavigate: (view: string) => void;
  onDeleteWoolCalculation: (id: string) => void;
  onDeleteVolumeCalculation: (id: string) => void;
}

export const DashboardTools: React.FC<DashboardToolsProps> = ({
  woolCalculations,
  volumeCalculations,
  onNavigate,
  onDeleteWoolCalculation,
  onDeleteVolumeCalculation
}) => {
  return (
    <div className="space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <h3 className="text-2xl font-serif font-bold text-primary">Mes Calculs Sauvegardés</h3>
            <div className="flex gap-2">
                <Button 
                    variant="outline"
                    onClick={() => onNavigate('calculator')}
                    className="px-4 py-2 bg-white border border-primary/10 rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-colors h-auto"
                >
                    Calculateur Laine
                </Button>
                <Button 
                    variant="outline"
                    onClick={() => onNavigate('volume-calculator')}
                    className="px-4 py-2 bg-white border border-primary/10 rounded-xl font-bold text-xs hover:bg-primary hover:text-white transition-colors h-auto"
                >
                    Calculateur Volume
                </Button>
            </div>
        </div>

        <div className="space-y-8">
            <div>
                <h4 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                    <Calculator size={20} className="text-accent" />
                    Estimations de Laine
                </h4>
                {woolCalculations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {woolCalculations.map(calc => (
                            <div key={calc.id} className="bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm relative group">
                                <Button 
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        if(confirm('Supprimer ce calcul ?')) onDeleteWoolCalculation(calc.id);
                                    }}
                                    className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 h-auto"
                                    title="Supprimer"
                                >
                                    <Trash2 size={14} />
                                </Button>
                                <div className="flex justify-between items-start mb-4 pr-8">
                                    <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-[10px] font-bold uppercase tracking-widest">{calc.projectType}</span>
                                    <span className="text-xs text-primary/70">{calc.date}</span>
                                </div>
                                <div className="space-y-2 mb-4">
                                    <p className="text-sm text-primary/70">Taille: <span className="font-bold text-primary">{calc.size || 'N/A'}</span></p>
                                    <p className="text-sm text-primary/70">Laine: <span className="font-bold text-primary">{calc.yarnWeight}</span></p>
                                </div>
                                <div className="pt-4 border-t border-primary/5">
                                    <p className="text-center text-2xl font-serif font-bold text-primary">{calc.result} <span className="text-sm font-sans font-normal text-primary/70">pelotes</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-primary/70 italic text-sm">Aucun calcul de laine enregistré.</p>
                )}
            </div>

            <div>
                <h4 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                    <Scale size={20} className="text-accent" />
                    Calculs de Volume (Résine/Jesmonite)
                </h4>
                {volumeCalculations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {volumeCalculations.map(calc => (
                            <div key={calc.id} className="bg-white p-6 rounded-[2rem] border border-primary/5 shadow-sm relative group">
                                <Button 
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        if(confirm('Supprimer ce calcul ?')) onDeleteVolumeCalculation(calc.id);
                                    }}
                                    className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 h-auto"
                                    title="Supprimer"
                                >
                                    <Trash2 size={14} />
                                </Button>
                                <div className="flex justify-between items-start mb-4 pr-8">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-widest">{calc.shape}</span>
                                    <span className="text-xs text-primary/70">{calc.date}</span>
                                </div>
                                <div className="space-y-2 mb-4">
                                    <p className="text-sm text-primary/70">Matériau: <span className="font-bold text-primary capitalize">{calc.material}</span></p>
                                    <p className="text-sm text-primary/70">Volume: <span className="font-bold text-primary">{calc.volume} ml</span></p>
                                </div>
                                <div className="pt-4 border-t border-primary/5 grid grid-cols-2 gap-2 text-center">
                                    <div>
                                        <p className="text-[10px] text-primary/70 uppercase">Partie A</p>
                                        <p className="font-bold text-primary">{calc.details.partA}g</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-primary/70 uppercase">Partie B</p>
                                        <p className="font-bold text-primary">{calc.details.partB}g</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-primary/70 italic text-sm">Aucun calcul de volume enregistré.</p>
                )}
            </div>
        </div>
    </div>
  );
};
