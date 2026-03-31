import React from 'react';
import { Mail, Plus } from 'lucide-react';
import { DataTable } from '../../components/DataTable';
import { Email } from '../../types';

interface AdminEmailsProps {
  localEmailTemplates: Email[];
  setModalType: (type: any) => void;
  setIsAddModalOpen: (open: boolean) => void;
  setEditingItem: (item: any) => void;
}

export const AdminEmails: React.FC<AdminEmailsProps> = ({
  localEmailTemplates,
  setModalType,
  setIsAddModalOpen,
  setEditingItem,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif">Modèles d'Emails</h2>
        <button 
          onClick={() => { setModalType('email'); setIsAddModalOpen(true); }}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-all shadow-lg"
        >
          <Plus size={18} /> Nouveau Modèle
        </button>
      </div>
      <DataTable<Email>
        data={localEmailTemplates}
        onRowClick={(template) => { setEditingItem(template); setModalType('email'); setIsAddModalOpen(true); }}
        title="Modèles d'Emails Automatisés"
        columns={[
          { header: 'ID', accessor: 'id', className: 'font-mono text-xs' },
          { header: 'Sujet', accessor: 'subject', className: 'text-slate-500' },
          { 
            header: 'Statut', 
            accessor: (t: Email) => (
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                t.status === 'sent' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
              }`}>
                {t.status}
              </span>
            ),
            exportValue: (t: Email) => t.status
          },
          {
              header: 'Actions',
              accessor: (template: Email) => (
                  <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setEditingItem(template); setModalType('email'); setIsAddModalOpen(true); }} className="text-primary hover:text-accent font-bold text-sm">Modifier</button>
                  </div>
              )
          }
        ]}
      />
    </div>
  );
};
