import api from './api';
import { ApiResponse, ActivityLog } from '../types';

export const activityService = {
  async getActivity(params?: { page?: number; limit?: number }): Promise<ActivityLog[]> {
    const res = await api.get<ApiResponse<ActivityLog[]>>('/activity', { params });
    return res.data.data;
  },

  async getProjectActivity(projectId: string, params?: { page?: number; limit?: number }): Promise<ActivityLog[]> {
    const res = await api.get<ApiResponse<ActivityLog[]>>(`/activity/projects/${projectId}`, { params });
    return res.data.data;
  },

  async getTaskActivity(taskId: string, params?: { page?: number; limit?: number }): Promise<ActivityLog[]> {
    const res = await api.get<ApiResponse<ActivityLog[]>>(`/activity/tasks/${taskId}`, { params });
    return res.data.data;
  },
};
