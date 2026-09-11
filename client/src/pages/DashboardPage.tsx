import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useDashboard } from '../hooks/useDashboard';
import { useTasks } from '../hooks/useTasks';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { PMDashboard } from '../components/dashboard/PMDashboard';
import { DeveloperDashboard } from '../components/dashboard/DeveloperDashboard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorState } from '../components/ui/ErrorState';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { adminData, pmData, devData, isLoading, refetch } = useDashboard();
  const { updateStatus } = useTasks();

  if (isLoading) {
    return (
      <div className="py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {user?.role === 'ADMIN' && 'Agency Overview & Operations Dashboard'}
            {user?.role === 'PROJECT_MANAGER' && 'Project Management & Team Velocity Dashboard'}
            {user?.role === 'DEVELOPER' && 'Personal Task Queue & Sprint Progress'}
          </p>
        </div>
      </div>

      {user?.role === 'ADMIN' && adminData && <AdminDashboard data={adminData} />}
      {user?.role === 'PROJECT_MANAGER' && pmData && <PMDashboard data={pmData} />}
      {user?.role === 'DEVELOPER' && devData && (
        <DeveloperDashboard
          data={devData}
          onUpdateStatus={async (id, status) => {
            await updateStatus({ id, status });
            refetch();
          }}
        />
      )}
    </div>
  );
}
