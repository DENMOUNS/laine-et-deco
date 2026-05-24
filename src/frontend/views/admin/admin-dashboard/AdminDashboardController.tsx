import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SiteConfig } from '../../../../types';
import { User as FirebaseUser } from 'firebase/auth';
import { useAdminDashboardContext } from './useAdminDashboardContext';
import { AdminDashboardShell } from './AdminDashboardShell';
import { useAdminStore } from '../../../../stores/adminStore';

interface AdminDashboardProps {
  onNavigate: (view: string, id?: string, query?: string) => void;
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
  user: FirebaseUser | null;
  isAuthLoading: boolean;
}

export const AdminDashboardController: React.FC<AdminDashboardProps> = (props) => {
  const location = useLocation();
  const setActiveTab = useAdminStore((s) => s.setActiveTab);
  
  // Restore activeTab from URL on mount and URL changes
  useEffect(() => {
    const path = location.pathname; // e.g., /admin/products
    if (path.startsWith('/admin/')) {
      const tab = path.replace('/admin/', '').split('/')[0]; // extract first segment
      if (tab && tab !== 'admin') {
        setActiveTab(tab);
      }
    }
  }, [location.pathname, setActiveTab]);

  const dashboardContext = useAdminDashboardContext(props);
  return <AdminDashboardShell ctx={dashboardContext} />;
};
