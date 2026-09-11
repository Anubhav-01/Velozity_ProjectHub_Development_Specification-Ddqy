import api from './api';
import { ApiResponse, Project, ProjectStatus } from '../types';

export const projectService = {
  async getProjects(): Promise<Project[]> {
    const res = await api.get<ApiResponse<Project[]>>('/projects');
    return res.data.data;
  },

  async getProject(id: string): Promise<Project> {
    const res = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return res.data.data;
  },

  async createProject(data: { name: string; description: string; clientId: string; status?: ProjectStatus }): Promise<Project> {
    const res = await api.post<ApiResponse<Project>>('/projects', data);
    return res.data.data;
  },

  async updateProject(id: string, data: Partial<{ name: string; description: string; clientId: string; status?: ProjectStatus }>): Promise<Project> {
    const res = await api.patch<ApiResponse<Project>>(`/projects/${id}`, data);
    return res.data.data;
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },
};
