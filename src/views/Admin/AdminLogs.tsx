import React from 'react';
import { DataTable } from '../../components/DataTable';
import { TabFilter } from '../../components/TabFilter';
import { LoginLog, RequestLog } from '../../types';
import { History, Activity } from 'lucide-react';

interface AdminLogsProps {
  logFilter: string;
  setLogFilter: (filter: string) => void;
  requestLogFilter: string;
  setRequestLogFilter: (filter: string) => void;
  loginLogs: LoginLog[];
  requestLogs: RequestLog[];
}

export const AdminLogs: React.FC<AdminLogsProps> = ({
  logFilter,
  setLogFilter,
  requestLogFilter,
  setRequestLogFilter,
  loginLogs,
  requestLogs,
}) => {
  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-serif flex items-center gap-3 text-slate-900">
            <History className="text-primary" size={24} /> Historique des Connexions
          </h3>
          <TabFilter 
            options={[
              { id: 'all', label: 'Tous' },
              { id: 'success', label: 'Réussis' },
              { id: 'failed', label: 'Échecs' },
            ]}
            active={logFilter}
            onChange={setLogFilter}
          />
        </div>
        <DataTable<LoginLog>
          data={loginLogs}
          title="Logs de Connexion"
          columns={[
            { header: 'Utilisateur', accessor: 'userName', className: 'font-bold' },
            { header: 'IP', accessor: 'ip', className: 'font-mono text-xs text-slate-400' },
            { header: 'Date', accessor: 'timestamp', className: 'text-slate-400 text-sm' },
            { header: 'Appareil', accessor: 'device', className: 'text-slate-400 text-sm' },
          ]}
        />
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-serif flex items-center gap-3 text-slate-900">
            <Activity className="text-accent" size={24} /> Requêtes API & Activité
          </h3>
          <TabFilter 
            options={[
              { id: 'all', label: 'Toutes' },
              { id: 'GET', label: 'GET' },
              { id: 'POST', label: 'POST' },
              { id: 'PUT', label: 'PUT' },
              { id: 'DELETE', label: 'DELETE' },
            ]}
            active={requestLogFilter}
            onChange={setRequestLogFilter}
          />
        </div>
        <DataTable<RequestLog>
          data={requestLogs.filter(l => requestLogFilter === 'all' || l.method === requestLogFilter)}
          title="Logs API"
          columns={[
            { header: 'Méthode', accessor: (l) => <span className="font-mono font-bold text-primary">{l.method}</span> },
            { header: 'Chemin', accessor: 'path', className: 'font-mono text-xs text-slate-500' },
            { header: 'Date', accessor: 'timestamp', className: 'text-slate-400 text-sm' },
            { 
              header: 'Statut', 
              accessor: (l) => (
                <span className={`font-mono font-bold ${l.status < 300 ? 'text-green-500' : 'text-red-500'}`}>
                  {l.status}
                </span>
              )
            },
            { header: 'Durée', accessor: (l) => <span className="text-xs text-slate-400">{l.duration}ms</span> }
          ]}
        />
      </div>
    </div>
  );
};
