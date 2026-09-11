import prisma from '../config/prisma';
import { ActivityType, Prisma, Role, TaskStatus } from '@prisma/client';

const activityInclude = {
  user: {
    select: { id: true, name: true, email: true, role: true },
  },
  task: {
    select: { id: true, title: true },
  },
  project: {
    select: { id: true, name: true },
  },
} as const;

export interface ActivityFilters {
  projectId?: string;
  taskId?: string;
  userId?: string;
  type?: ActivityType;
}

export const activityRepository = {
  findAll(filters: ActivityFilters, page = 1, limit = 20) {
    return prisma.activityLog.findMany({
      where: filters,
      include: activityInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  },

  // Role-filtered activity for a user
  findForUser(params: {
    role: Role;
    userId: string;
    limit?: number;
    after?: Date;
  }) {
    const { role, userId, limit = 20, after } = params;

    let where: Prisma.ActivityLogWhereInput = {};

    if (after) {
      where.createdAt = { gt: after };
    }

    if (role === Role.ADMIN) {
      // Admin sees all activities
    } else if (role === Role.PROJECT_MANAGER) {
      // PM sees only their own projects' activities
      where.project = { createdById: userId };
    } else {
      // Developer sees only activities on tasks assigned to them
      where.task = { assignedDeveloperId: userId };
    }

    return prisma.activityLog.findMany({
      where,
      include: activityInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  // For missed activity recovery — last N events for the user's scope
  findMissedForUser(params: {
    role: Role;
    userId: string;
    since?: Date;
    limit?: number;
  }) {
    const { role, userId, since, limit = 20 } = params;

    let where: Prisma.ActivityLogWhereInput = {};

    if (since) {
      where.createdAt = { gt: since };
    }

    if (role === Role.PROJECT_MANAGER) {
      where.project = { createdById: userId };
    } else if (role === Role.DEVELOPER) {
      where.task = { assignedDeveloperId: userId };
    }

    return prisma.activityLog.findMany({
      where,
      include: activityInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  createWithTx(
    tx: Prisma.TransactionClient,
    data: Prisma.ActivityLogCreateInput,
  ) {
    return tx.activityLog.create({ data, include: activityInclude });
  },

  create(data: Prisma.ActivityLogCreateInput) {
    return prisma.activityLog.create({ data, include: activityInclude });
  },
};
