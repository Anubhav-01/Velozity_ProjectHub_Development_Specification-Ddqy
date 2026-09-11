import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboard.service';
import { useAuthStore } from '../store/authStore';

export function useDashboard() {
  const user = useAuthStore((state) => state.user);

  const adminQuery = useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: () => dashboardService.getAdminDashboard(),
    enabled: user?.role === 'ADMIN',
  });

  const pmQuery = useQuery({
    queryKey: ['dashboard', 'pm'],
    queryFn: () => dashboardService.getPMDashboard(),
    enabled: user?.role === 'PROJECT_MANAGER',
  });

  const devQuery = useQuery({
    queryKey: ['dashboard', 'dev'],
    queryFn: () => dashboardService.getDeveloperDashboard(),
    enabled: user?.role === 'DEVELOPER',
  });

  return {
    adminData: adminQuery.data,
    pmData: pmQuery.data,
    devData: devQuery.data,
    isLoading: adminQuery.isLoading || pmQuery.isLoading || devQuery.isLoading,
    refetch: () => {
      if (user?.role === 'ADMIN') adminQuery.refetch();
      if (user?.role === 'PROJECT_MANAGER') pmQuery.refetch();
      if (user?.role === 'DEVELOPER') devQuery.refetch();
    },
  };
}
