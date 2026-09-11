import api from './api';
import { ApiResponse, Task, TaskStatus, TaskPriority } from '../types';

export interface TaskQueryParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  assignedDeveloperId?: string;
  from?: string;
  to?: string;
  isOverdue?: boolean;
  page?: number;
  limit?: number;
}

export const taskService = {
  async getTasks(params?: TaskQueryParams): Promise<{ tasks: Task[]; meta: any }> {
    const res = await api.get<ApiResponse<Task[]>>('/tasks', { params });
    return {
      tasks: res.data.data,
      meta: res.data.meta,
    };
  },

  async getTask(id: string): Promise<Task> {
    const res = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return res.data.data;
  },

  async createTask(data: {
    title: string;
    description: string;
    projectId: string;
    assignedDeveloperId: string;
    status?: TaskStatus;
    priority: TaskPriority;
    dueDate: string;
  }): Promise<Task> {
    const res = await api.post<ApiResponse<Task>>('/tasks', data);
    return res.data.data;
  },

  async updateTask(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      assignedDeveloperId: string;
      status: TaskStatus;
      priority: TaskPriority;
      dueDate: string;
    }>
  ): Promise<Task> {
    const res = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, data);
    return res.data.data;
  },

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    const res = await api.post<ApiResponse<Task>>(`/tasks/${id}/status`, { status });
    return res.data.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
};
