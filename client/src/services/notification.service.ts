import api from './api';
import { ApiResponse, Notification } from '../types';

export const notificationService = {
  async getNotifications(page = 1, limit = 20): Promise<Notification[]> {
    const res = await api.get<ApiResponse<Notification[]>>('/notifications', {
      params: { page, limit },
    });
    return res.data.data;
  },

  async getUnreadCount(): Promise<number> {
    const res = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
    return res.data.data.count;
  },

  async markRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    await api.patch('/notifications/read-all');
  },
};
