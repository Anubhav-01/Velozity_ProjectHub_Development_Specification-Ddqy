import { notificationRepository } from '../repositories/notification.repository';
import { ApiError } from '../utils/ApiError';

export const notificationService = {
  async findForUser(userId: string, page = 1, limit = 20) {
    return notificationRepository.findForUser(userId, page, limit);
  },

  async getUnreadCount(userId: string) {
    const count = await notificationRepository.countUnread(userId);
    return { count };
  },

  async markRead(id: string, userId: string) {
    const notification = await notificationRepository.findById(id);
    if (!notification) throw ApiError.notFound('Notification');

    // Ensure user can only mark their own notifications as read
    if (notification.userId !== userId) {
      throw ApiError.forbidden('You can only mark your own notifications as read');
    }

    await notificationRepository.markRead(id, userId);
  },

  async markAllRead(userId: string) {
    await notificationRepository.markAllRead(userId);
  },
};
