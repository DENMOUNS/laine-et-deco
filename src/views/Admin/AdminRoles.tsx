import React from 'react';
import { DataTable } from '../../components/DataTable';
import { Role } from '../../types';

interface AdminRolesProps {
  localRoles: Role[];
  setModalType: (type: any) => void;
  setIsAddModalOpen: (open: boolean) => void;
  setEditingItem: (item: any) => void;
}

export const AdminRoles: React.FC<AdminRolesProps> = ({
  localRoles,
  setModalType,
  setIsAddModalOpen,
  setEditingItem,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => { setModalType('role'); setIsAddModalOpen(true); }}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg"
        >
          + Ajouter un Rôle
        </button>
      </div>
      <DataTable<Role>
        data={localRoles}
        onRowClick={(role) => { setEditingItem(role); setModalType('role'); setIsAddModalOpen(true); }}
        title="Gestion des Rôles"
        columns={[
          { header: 'Nom', accessor: 'name', className: 'font-bold' },
          { header: 'Description', accessor: 'description', className: 'text-slate-500' },
          {
              header: 'Actions',
              accessor: (role: Role) => (
                  <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setEditingItem(role); setModalType('role'); setIsAddModalOpen(true); }} className="text-primary hover:text-accent font-bold text-sm">Modifier</button>
                  </div>
              )
          }
        ]}
      />
    </div>
  );
};
