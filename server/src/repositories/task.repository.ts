import prisma from '../config/prisma';
import { Prisma, TaskStatus, TaskPriority } from '@prisma/client';

const taskInclude = {
  project: {
    select: { id: true, name: true, createdById: true },
  },
  assignedDeveloper: {
    select: { id: true, name: true, email: true, role: true },
  },
} as const;

export interface TaskFilters {
  projectId?: string;
  assignedDeveloperId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  isOverdue?: boolean;
  dueDate?: {
    gte?: Date;
    lte?: Date;
  };
  // For PM: only tasks in projects they created
  project?: {
    createdById?: string;
  };
}

export const taskRepository = {
  findAll(filters: TaskFilters, page = 1, limit = 20) {
    const where: Prisma.TaskWhereInput = {};

    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.assignedDeveloperId) where.assignedDeveloperId = filters.assignedDeveloperId;
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.isOverdue !== undefined) where.isOverdue = filters.isOverdue;
    if (filters.dueDate) where.dueDate = filters.dueDate;
    if (filters.project?.createdById) {
      where.project = { createdById: filters.project.createdById };
    }

    return prisma.$transaction([
      prisma.task.findMany({
        where,
        include: taskInclude,
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.task.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: taskInclude,
    });
  },

  create(data: Prisma.TaskCreateInput) {
    return prisma.task.create({ data, include: taskInclude });
  },

  // Used in service transaction — receives Prisma tx client
  createWithTx(
    tx: Prisma.TransactionClient,
    data: Prisma.TaskCreateInput,
  ) {
    return tx.task.create({ data, include: taskInclude });
  },

  updateWithTx(
    tx: Prisma.TransactionClient,
    id: string,
    data: Prisma.TaskUpdateInput,
  ) {
    return tx.task.update({ where: { id }, data, include: taskInclude });
  },

  update(id: string, data: Prisma.TaskUpdateInput) {
    return prisma.task.update({ where: { id }, data, include: taskInclude });
  },

  delete(id: string) {
    return prisma.task.delete({ where: { id } });
  },

  // Mark overdue tasks — used by background job
  markOverdue() {
    return prisma.task.updateMany({
      where: {
        dueDate: { lt: new Date() },
        status: { notIn: [TaskStatus.DONE] },
        isOverdue: false,
      },
      data: { isOverdue: true },
    });
  },

  // Dashboard stats
  countByStatus(filters?: { assignedDeveloperId?: string; projectCreatedById?: string }) {
    const where: Prisma.TaskWhereInput = {};
    if (filters?.assignedDeveloperId) {
      where.assignedDeveloperId = filters.assignedDeveloperId;
    }
    if (filters?.projectCreatedById) {
      where.project = { createdById: filters.projectCreatedById };
    }

    return prisma.task.groupBy({
      by: ['status'],
      where,
      _count: true,
    });
  },

  countByPriority(projectCreatedById?: string) {
    return prisma.task.groupBy({
      by: ['priority'],
      where: projectCreatedById ? { project: { createdById: projectCreatedById } } : undefined,
      _count: true,
    });
  },

  countOverdue(filters?: { projectCreatedById?: string; assignedDeveloperId?: string }) {
    const where: Prisma.TaskWhereInput = { isOverdue: true, status: { not: TaskStatus.DONE } };
    if (filters?.projectCreatedById) {
      where.project = { createdById: filters.projectCreatedById };
    }
    if (filters?.assignedDeveloperId) {
      where.assignedDeveloperId = filters.assignedDeveloperId;
    }
    return prisma.task.count({ where });
  },

  findUpcomingDue(createdById: string) {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return prisma.task.findMany({
      where: {
        project: { createdById },
        dueDate: { gte: now, lte: weekFromNow },
        status: { notIn: [TaskStatus.DONE] },
      },
      include: taskInclude,
      orderBy: { dueDate: 'asc' },
      take: 10,
    });
  },
};
