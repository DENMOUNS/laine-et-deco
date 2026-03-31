import React from 'react';
import { DataTable } from '../../components/DataTable';
import { User as UserType, Role } from '../../types';

interface AdminUsersProps {
  localUsers: UserType[];
  localRoles: Role[];
  setModalType: (type: any) => void;
  setIsAddModalOpen: (open: boolean) => void;
  setEditingItem: (item: any) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({
  localUsers,
  localRoles,
  setModalType,
  setIsAddModalOpen,
  setEditingItem,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => { setModalType('user'); setIsAddModalOpen(true); }}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg"
        >
          + Ajouter un Utilisateur
        </button>
      </div>
      <DataTable<UserType>
        data={localUsers.filter(u => u.role !== 'customer')}
        onRowClick={(user) => { setEditingItem(user); setModalType('user'); setIsAddModalOpen(true); }}
        title="Liste des Utilisateurs"
        columns={[
          {
            header: 'Utilisateur',
            accessor: (user: UserType) => (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold">
                  {user.name[0]}
                </div>
                <span className="font-medium">{user.name}</span>
              </div>
            ),
          },
          { header: 'Email', accessor: 'email', className: 'text-slate-400' },
          { 
            header: 'Rôle', 
            accessor: (u: UserType) => localRoles.find(r => r.id === u.role)?.name || (u.role === 'customer' ? 'Client' : u.role), 
            className: 'font-bold uppercase text-xs tracking-widest' 
          },
          { header: 'Date d\'ajout', accessor: 'joinDate', className: 'text-slate-400' },
          {
              header: 'Actions',
              accessor: (user: UserType) => (
                  <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setEditingItem(user); setModalType('user'); setIsAddModalOpen(true); }} className="text-primary hover:text-accent font-bold text-sm">Modifier</button>
                  </div>
              )
          }
        ]}
      />
    </div>
  );
};
