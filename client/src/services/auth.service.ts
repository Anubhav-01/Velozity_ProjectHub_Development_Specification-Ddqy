import api from './api';
import { ApiResponse, User } from '../types';

export const authService = {
  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<{ user: User; accessToken: string }> {
    const res = await api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/register', data);
    return res.data.data;
  },

  async login(email: string, password: string): Promise<{ user: User; accessToken: string }> {
    const res = await api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/login', {
      email,
      password,
    });
    return res.data.data;
  },

  async refresh(): Promise<{ accessToken: string }> {
    const res = await api.post<ApiResponse<{ accessToken: string }>>('/auth/refresh');
    return res.data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },
};
