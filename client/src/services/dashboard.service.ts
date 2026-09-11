import api from './api';
import { ApiResponse, AdminDashboardData, PMDashboardData, DeveloperDashboardData } from '../types';

export const dashboardService = {
  async getAdminDashboard(): Promise<AdminDashboardData> {
    const res = await api.get<ApiResponse<AdminDashboardData>>('/dashboard/admin');
    return res.data.data;
  },

  async getPMDashboard(): Promise<PMDashboardData> {
    const res = await api.get<ApiResponse<PMDashboardData>>('/dashboard/project-manager');
    return res.data.data;
  },

  async getDeveloperDashboard(): Promise<DeveloperDashboardData> {
    const res = await api.get<ApiResponse<DeveloperDashboardData>>('/dashboard/developer');
    return res.data.data;
  },
};
