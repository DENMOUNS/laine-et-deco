import React from 'react';
import { Search, ShieldCheck } from 'lucide-react';

export interface LegalSectionMeta {
  id: string;
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface LegalSidebarProps {
  sections: LegalSectionMeta[];
  activeSection: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectSection: (id: string) => void;
}

export const LegalSidebar: React.FC<LegalSidebarProps> = ({
  sections,
  activeSection,
  searchQuery,
  onSearchChange,
  onSelectSection,
}) => {
  return (
    <aside className="lg:col-span-4 xl:col-span-3 hidden lg:block">
      <div className="sticky top-28 bg-white dark:bg-[#181C18] rounded-3xl p-5 shadow-xl border border-primary/10 dark:border-white/10 space-y-4 backdrop-blur-xl">
        <div className="px-2">
          <h3 className="text-xs font-bold uppercase tracking-widest text-accent mb-1">Sommaire</h3>
          <p className="text-xs text-primary/60 dark:text-white/60">Accès direct aux chapitres</p>
        </div>

        <div className="relative mb-2">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40 dark:text-white/40" />
          <input
            type="text"
            placeholder="Rechercher une clause..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-primary/5 dark:bg-white/5 border border-primary/10 dark:border-white/10 focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        <nav className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
          {sections
            .filter((s) => !searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => onSelectSection(sec.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-accent text-white shadow-sm font-semibold'
                      : 'text-primary/80 dark:text-white/80 hover:bg-primary/5 dark:hover:bg-white/5 hover:text-accent'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-white' : 'text-accent'} />
                  <span className="truncate">{sec.title}</span>
                </button>
              );
            })}
        </nav>

        <div className="pt-3 border-t border-primary/10 dark:border-white/10">
          <div className="bg-primary/5 dark:bg-white/5 p-3 rounded-2xl text-[11px] space-y-1.5">
            <p className="font-semibold text-primary dark:text-white flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-500" />
              Site certifié conforme
            </p>
            <p className="text-primary/70 dark:text-white/70 leading-normal">
              Conforme aux standards de commerce en ligne et de protection des données.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
