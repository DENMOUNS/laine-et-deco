import React from 'react';
import { SiteConfig } from '../../../../types';
import { User as FirebaseUser } from 'firebase/auth';
import { useAdminDashboardContext } from './useAdminDashboardContext';
import { AdminDashboardShell } from './AdminDashboardShell';

interface AdminDashboardProps {
  onNavigate: (view: string, id?: string, query?: string) => void;
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  user: FirebaseUser | null;
  isAuthLoading: boolean;
}

export const AdminDashboardController: React.FC<AdminDashboardProps> = (props) => {
  const dashboardContext = useAdminDashboardContext(props);
  return <AdminDashboardShell ctx={dashboardContext} />;
};
