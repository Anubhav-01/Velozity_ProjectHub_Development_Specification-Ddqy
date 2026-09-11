import api from './api';
import { ApiResponse, Client } from '../types';

export const clientService = {
  async getClients(): Promise<Client[]> {
    const res = await api.get<ApiResponse<Client[]>>('/clients');
    return res.data.data;
  },

  async getClient(id: string): Promise<Client> {
    const res = await api.get<ApiResponse<Client>>(`/clients/${id}`);
    return res.data.data;
  },

  async createClient(data: { name: string; email: string; companyName: string; phone?: string }): Promise<Client> {
    const res = await api.post<ApiResponse<Client>>('/clients', data);
    return res.data.data;
  },

  async updateClient(id: string, data: Partial<{ name: string; email: string; companyName: string; phone?: string }>): Promise<Client> {
    const res = await api.patch<ApiResponse<Client>>(`/clients/${id}`, data);
    return res.data.data;
  },

  async deleteClient(id: string): Promise<void> {
    await api.delete(`/clients/${id}`);
  },
};
