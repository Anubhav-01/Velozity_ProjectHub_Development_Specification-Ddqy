import api from './api';
import { ApiResponse, User } from '../types';

export const userService = {
  async getUsers(role?: string): Promise<User[]> {
    const res = await api.get<ApiResponse<User[]>>('/users', {
      params: { role },
    });
    return res.data.data;
  },

  async getDevelopers(): Promise<User[]> {
    const res = await api.get<ApiResponse<User[]>>('/users/developers');
    return res.data.data;
  },

  async getUser(id: string): Promise<User> {
    const res = await api.get<ApiResponse<User>>(`/users/${id}`);
    return res.data.data;
  },

  async createUser(data: { name: string; email: string; password: string; role: string }): Promise<User> {
    const res = await api.post<ApiResponse<User>>('/users', data);
    return res.data.data;
  },

  async updateUser(id: string, data: Partial<{ name: string; email: string; password?: string; role: string }>): Promise<User> {
    const res = await api.patch<ApiResponse<User>>(`/users/${id}`, data);
    return res.data.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
