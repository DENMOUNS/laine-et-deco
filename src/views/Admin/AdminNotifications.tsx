import React from 'react';
import { Bell, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import { TabFilter } from '../../components/TabFilter';
import { PushNotification, Notification } from '../../types';
import { DataTable } from '../../components/DataTable';
import { toast } from 'sonner';

interface AdminNotificationsProps {
  notifications: Notification[];
  notificationFilter: string;
  setNotificationFilter: (filter: string) => void;
  notificationPage: number;
  setNotificationPage: (page: number) => void;
  itemsPerPage: number;
  localNotifications: PushNotification[];
  setLocalNotifications: React.Dispatch<React.SetStateAction<PushNotification[]>>;
  setModalType: (type: any) => void;
  setIsAddModalOpen: (open: boolean) => void;
  setEditingItem: (item: any) => void;
}

export const AdminNotifications: React.FC<AdminNotificationsProps> = ({
  notifications,
  notificationFilter,
  setNotificationFilter,
  notificationPage,
  setNotificationPage,
  itemsPerPage,
  localNotifications,
  setLocalNotifications,
  setModalType,
  setIsAddModalOpen,
  setEditingItem,
}) => {
  return (
    <div className="space-y-10">
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-serif flex items-center gap-3">
            <Bell className="text-primary" size={24} /> Centre de Notifications
          </h3>
          <button className="text-xs font-bold text-primary hover:underline">Tout marquer comme lu</button>
        </div>
        <div className="px-8 pt-6">
          <TabFilter 
            options={[
              { id: 'all', label: 'Toutes' },
              { id: 'order', label: 'Commandes' },
              { id: 'stock', label: 'Stock' },
              { id: 'inquiry', label: 'Demandes' },
            ]}
            active={notificationFilter}
            onChange={(val) => { setNotificationFilter(val); setNotificationPage(1); }}
          />
        </div>
        <div className="divide-y divide-slate-50">
          {notifications.filter(n => notificationFilter === 'all' || n.type === notificationFilter)
            .slice((notificationPage - 1) * itemsPerPage, notificationPage * itemsPerPage)
            .map((notif) => (
            <div key={notif.id} className={`p-8 flex gap-6 hover:bg-slate-50 transition-colors cursor-pointer ${!notif.read ? 'bg-primary/5' : ''}`}>
              <div className={`p-4 rounded-2xl flex-shrink-0 ${
                notif.type === 'order' ? 'bg-green-100 text-green-600' :
                notif.type === 'stock' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {notif.type === 'order' ? <CheckCircle2 size={24} /> : 
                 notif.type === 'stock' ? <AlertCircle size={24} /> : <MessageSquare size={24} />}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg text-slate-900">{notif.title}</h4>
                  <span className="text-xs text-slate-400 font-medium">{notif.timestamp}</span>
                </div>
                <p className="text-slate-600 leading-relaxed mb-4">{notif.message}</p>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:border-primary transition-colors">Détails</button>
                  {!notif.read && <button className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-accent transition-colors">Marquer comme lu</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
        {notifications.filter(n => notificationFilter === 'all' || n.type === notificationFilter).length > itemsPerPage && (
          <div className="p-8 border-t border-slate-50 flex justify-center gap-2">
            {Array.from({ length: Math.ceil(notifications.filter(n => notificationFilter === 'all' || n.type === notificationFilter).length / itemsPerPage) }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setNotificationPage(n)}
                className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${notificationPage === n ? 'bg-primary text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-400 hover:border-primary hover:text-primary'}`}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-serif">Gestion des Notifications Push</h3>
          <button 
            onClick={() => { setModalType('notification'); setIsAddModalOpen(true); }}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg"
          >
            + Nouvelle Notification Push
          </button>
        </div>
        <DataTable<PushNotification>
          data={localNotifications}
          onRowClick={(n) => { setEditingItem(n); setModalType('notification'); setIsAddModalOpen(true); }}
          title="Notifications Push"
          columns={[
            { header: 'ID', accessor: 'id', className: 'font-mono text-xs' },
            { header: 'Titre', accessor: 'title', className: 'font-bold' },
            { header: 'Message', accessor: 'message', className: 'text-slate-400' },
            { 
              header: 'Statut', 
              accessor: (n) => (
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  n.status === 'sent' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {n.status === 'sent' ? 'Envoyé' : 'Brouillon'}
                </span>
              ),
              exportValue: (n) => n.status
            },
            { header: 'Date d\'envoi', accessor: 'sentAt', className: 'text-slate-400' },
            {
              header: 'Actions',
              accessor: (n) => (
                <div className="flex gap-2">
                  {n.status === 'draft' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocalNotifications(prev => prev.map(notif => 
                          notif.id === n.id 
                            ? { ...notif, status: 'sent', sentAt: new Date().toISOString().split('T')[0] } 
                            : notif
                        ));
                        toast.success('Notification envoyée !');
                      }}
                      className="text-primary font-bold text-sm hover:underline"
                    >
                      Envoyer
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditingItem(n); setModalType('notification'); setIsAddModalOpen(true); }}
                    className="text-slate-400 font-bold text-sm hover:underline"
                  >
                    Modifier
                  </button>
                </div>
              )
            }
          ]}
        />
      </div>
    </div>
  );
};
