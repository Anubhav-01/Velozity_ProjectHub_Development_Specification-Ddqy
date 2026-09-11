import { ActivityType, NotificationType, Role, TaskStatus } from '@prisma/client';
import prisma from '../config/prisma';
import { taskRepository, TaskFilters } from '../repositories/task.repository';
import { activityRepository } from '../repositories/activity.repository';
import { notificationRepository } from '../repositories/notification.repository';
import { projectRepository } from '../repositories/project.repository';
import { userRepository } from '../repositories/user.repository';
import { ApiError } from '../utils/ApiError';
import { CreateTaskInput, UpdateTaskInput, TaskQueryInput } from '../validators/schemas';
import { getIo } from '../socket';
import { emitActivity, emitNotification } from '../socket/activity.handler';
import { logger } from '../utils/logger';

export const taskService = {
  async findAll(user: { userId: string; role: Role }, query: TaskQueryInput) {
    const filters: TaskFilters = {};

    if (query.projectId) filters.projectId = query.projectId;
    if (query.status) filters.status = query.status;
    if (query.priority) filters.priority = query.priority;
    if (query.isOverdue !== undefined) filters.isOverdue = query.isOverdue;
    if (query.from || query.to) {
      filters.dueDate = {};
      if (query.from) filters.dueDate.gte = new Date(query.from);
      if (query.to) filters.dueDate.lte = new Date(query.to);
    }

    // Role-based filtering
    if (user.role === Role.PROJECT_MANAGER) {
      filters.project = { createdById: user.userId };
    } else if (user.role === Role.DEVELOPER) {
      filters.assignedDeveloperId = user.userId;
    }

    const [tasks, total] = await taskRepository.findAll(filters, query.page, query.limit);
    return { tasks, total, page: query.page, limit: query.limit };
  },

  async findById(id: string, user: { userId: string; role: Role }) {
    const task = await taskRepository.findById(id);
    if (!task) throw ApiError.notFound('Task');

    // Authorization
    if (user.role === Role.DEVELOPER && task.assignedDeveloperId !== user.userId) {
      throw ApiError.forbidden('You can only view tasks assigned to you');
    }
    if (
      user.role === Role.PROJECT_MANAGER &&
      task.project.createdById !== user.userId
    ) {
      throw ApiError.forbidden('You can only view tasks in your own projects');
    }

    return task;
  },

  async create(input: CreateTaskInput, user: { userId: string; role: Role }) {
    // Verify project exists and PM has access
    const project = await projectRepository.findById(input.projectId);
    if (!project) throw ApiError.notFound('Project');

    if (
      user.role === Role.PROJECT_MANAGER &&
      project.createdById !== user.userId
    ) {
      throw ApiError.forbidden('You can only create tasks in your own projects');
    }

    // Verify developer exists and has DEVELOPER role
    const developer = await userRepository.findById(input.assignedDeveloperId);
    if (!developer) throw ApiError.notFound('Developer');
    if (developer.role !== Role.DEVELOPER) {
      throw ApiError.badRequest('Tasks can only be assigned to users with DEVELOPER role');
    }

    // Use a transaction for task creation + activity log + notification
    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          title: input.title,
          description: input.description,
          projectId: input.projectId,
          assignedDeveloperId: input.assignedDeveloperId,
          status: input.status ?? TaskStatus.TODO,
          priority: input.priority,
          dueDate: new Date(input.dueDate),
        },
        include: {
          project: { select: { id: true, name: true, createdById: true } },
          assignedDeveloper: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      const activity = await activityRepository.createWithTx(tx, {
        type: ActivityType.TASK_CREATED,
        description: `${user.userId === user.userId ? 'Task created' : ''}: "${task.title}"`,
        project: { connect: { id: input.projectId } },
        task: { connect: { id: task.id } },
        user: { connect: { id: user.userId } },
      });

      // Notify the assigned developer
      const notification = await notificationRepository.createWithTx(tx, {
        userId: input.assignedDeveloperId,
        type: NotificationType.TASK_ASSIGNED,
        title: 'New Task Assigned',
        message: `You have been assigned to "${task.title}" in ${project.name}.`,
      });

      return { task, activity, notification };
    });

    // Emit real-time events after transaction commits
    try {
      const io = getIo();
      emitActivity(io, result.activity, project.createdById);
      emitNotification(io, result.notification, input.assignedDeveloperId);
    } catch (err) {
      logger.warn({ message: 'Failed to emit socket events after task creation', error: err });
    }

    return result.task;
  },

  async update(
    id: string,
    input: UpdateTaskInput,
    user: { userId: string; role: Role },
  ) {
    const task = await taskRepository.findById(id);
    if (!task) throw ApiError.notFound('Task');

    // Authorization checks
    if (user.role === Role.DEVELOPER) {
      // Developers can only update their own tasks (status only through /status endpoint)
      if (task.assignedDeveloperId !== user.userId) {
        throw ApiError.forbidden('You can only update tasks assigned to you');
      }
      // Developers cannot reassign tasks
      if (input.assignedDeveloperId && input.assignedDeveloperId !== user.userId) {
        throw ApiError.forbidden('Developers cannot reassign tasks');
      }
    }

    if (
      user.role === Role.PROJECT_MANAGER &&
      task.project.createdById !== user.userId
    ) {
      throw ApiError.forbidden('You can only update tasks in your own projects');
    }

    // Validate developer if changing assignment
    if (input.assignedDeveloperId && input.assignedDeveloperId !== task.assignedDeveloperId) {
      const developer = await userRepository.findById(input.assignedDeveloperId);
      if (!developer) throw ApiError.notFound('Developer');
      if (developer.role !== Role.DEVELOPER) {
        throw ApiError.badRequest('Tasks can only be assigned to users with DEVELOPER role');
      }
    }

    const updateData: Record<string, unknown> = { ...input };
    if (input.dueDate) updateData.dueDate = new Date(input.dueDate);

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.task.update({
        where: { id },
        data: updateData,
        include: {
          project: { select: { id: true, name: true, createdById: true } },
          assignedDeveloper: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      const activity = await activityRepository.createWithTx(tx, {
        type: ActivityType.TASK_UPDATED,
        description: `Task "${updated.title}" was updated`,
        project: { connect: { id: updated.projectId } },
        task: { connect: { id: updated.id } },
        user: { connect: { id: user.userId } },
      });

      // If developer was reassigned, notify new developer
      let notification = null;
      if (input.assignedDeveloperId && input.assignedDeveloperId !== task.assignedDeveloperId) {
        notification = await notificationRepository.createWithTx(tx, {
          userId: input.assignedDeveloperId,
          type: NotificationType.TASK_ASSIGNED,
          title: 'Task Assigned to You',
          message: `You have been assigned to "${updated.title}" in ${updated.project.name}.`,
        });
      }

      return { task: updated, activity, notification };
    });

    try {
      const io = getIo();
      emitActivity(io, result.activity, task.project.createdById);
      if (result.notification) {
        emitNotification(io, result.notification, input.assignedDeveloperId!);
      }
    } catch (err) {
      logger.warn({ message: 'Failed to emit socket events after task update', error: err });
    }

    return result.task;
  },

  async updateStatus(
    id: string,
    newStatus: TaskStatus,
    user: { userId: string; role: Role; name?: string },
  ) {
    const task = await taskRepository.findById(id);
    if (!task) throw ApiError.notFound('Task');

    const oldStatus = task.status;

    // Authorization
    if (user.role === Role.DEVELOPER && task.assignedDeveloperId !== user.userId) {
      throw ApiError.forbidden('You can only update the status of tasks assigned to you');
    }
    if (
      user.role === Role.PROJECT_MANAGER &&
      task.project.createdById !== user.userId
    ) {
      throw ApiError.forbidden('You can only update tasks in your own projects');
    }

    if (oldStatus === newStatus) {
      return task; // No change needed
    }

    // Use Prisma transaction: update task + create activity + create notification
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.task.update({
        where: { id },
        data: {
          status: newStatus,
          isOverdue: newStatus === TaskStatus.DONE ? false : task.isOverdue,
        },
        include: {
          project: { select: { id: true, name: true, createdById: true } },
          assignedDeveloper: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      const userName = user.name ?? 'Someone';
      const activity = await activityRepository.createWithTx(tx, {
        type: ActivityType.TASK_STATUS_CHANGED,
        oldStatus,
        newStatus,
        description: `${userName} moved "${updated.title}" from ${oldStatus} → ${newStatus}`,
        project: { connect: { id: updated.projectId } },
        task: { connect: { id: updated.id } },
        user: { connect: { id: user.userId } },
        metadata: {
          taskId: updated.id,
          projectId: updated.projectId,
          changedBy: { id: user.userId, name: userName },
          oldStatus,
          newStatus,
        },
      });

      // Notification: when developer moves task to IN_REVIEW, notify PM
      let notification = null;
      if (newStatus === TaskStatus.IN_REVIEW && user.role === Role.DEVELOPER) {
        notification = await notificationRepository.createWithTx(tx, {
          userId: updated.project.createdById,
          type: NotificationType.TASK_STATUS_CHANGED,
          title: 'Task Ready for Review',
          message: `${userName} moved "${updated.title}" to In Review.`,
        });
      }

      return { task: updated, activity, notification };
    });

    // Emit real-time events (outside transaction)
    try {
      const io = getIo();
      emitActivity(io, result.activity, task.project.createdById);
      if (result.notification) {
        emitNotification(io, result.notification, task.project.createdById);
      }
    } catch (err) {
      logger.warn({ message: 'Failed to emit socket events after status change', error: err });
    }

    return result.task;
  },

  async delete(id: string, user: { userId: string; role: Role }) {
    const task = await taskRepository.findById(id);
    if (!task) throw ApiError.notFound('Task');

    if (user.role === Role.DEVELOPER) {
      throw ApiError.forbidden('Developers cannot delete tasks');
    }
    if (
      user.role === Role.PROJECT_MANAGER &&
      task.project.createdById !== user.userId
    ) {
      throw ApiError.forbidden('You can only delete tasks in your own projects');
    }

    await taskRepository.delete(id);
  },
};
