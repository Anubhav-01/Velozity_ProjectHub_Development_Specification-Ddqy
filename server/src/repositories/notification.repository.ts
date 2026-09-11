import prisma from '../config/prisma';
import { NotificationType, Prisma } from '@prisma/client';

export const notificationRepository = {
  findForUser(userId: string, page = 1, limit = 20) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  },

  countUnread(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  },

  findById(id: string) {
    return prisma.notification.findUnique({ where: { id } });
  },

  createWithTx(
    tx: Prisma.TransactionClient,
    data: {
      userId: string;
      type: NotificationType;
      title: string;
      message: string;
    },
  ) {
    return tx.notification.create({ data });
  },

  create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
  }) {
    return prisma.notification.create({ data });
  },

  markRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });
  },

  markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  },
};
