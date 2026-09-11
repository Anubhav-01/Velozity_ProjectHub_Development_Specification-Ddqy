import { Role } from '@prisma/client';
import { activityRepository, ActivityFilters } from '../repositories/activity.repository';
import { projectRepository } from '../repositories/project.repository';
import { taskRepository } from '../repositories/task.repository';
import { ApiError } from '../utils/ApiError';

export const activityService = {
  async findAll(
    user: { userId: string; role: Role },
    query: { page?: number; limit?: number },
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    return activityRepository.findForUser({
      role: user.role,
      userId: user.userId,
      limit,
    });
  },

  async findByProject(
    projectId: string,
    user: { userId: string; role: Role },
    query: { page?: number; limit?: number },
  ) {
    const project = await projectRepository.findById(projectId);
    if (!project) throw ApiError.notFound('Project');

    // Authorization
    if (user.role === Role.PROJECT_MANAGER && project.createdById !== user.userId) {
      throw ApiError.forbidden('You do not have access to this project\'s activity');
    }

    if (user.role === Role.DEVELOPER) {
      // Check developer has a task in this project
      const devProjects = await projectRepository.findByDeveloper(user.userId);
      const hasAccess = devProjects.some((p) => p.id === projectId);
      if (!hasAccess) {
        throw ApiError.forbidden('You do not have access to this project\'s activity');
      }
    }

    const filters: ActivityFilters = { projectId };
    return activityRepository.findAll(filters, query.page, query.limit);
  },

  async findByTask(
    taskId: string,
    user: { userId: string; role: Role },
    query: { page?: number; limit?: number },
  ) {
    const task = await taskRepository.findById(taskId);
    if (!task) throw ApiError.notFound('Task');

    // Authorization
    if (user.role === Role.DEVELOPER && task.assignedDeveloperId !== user.userId) {
      throw ApiError.forbidden('You can only view activity for tasks assigned to you');
    }
    if (
      user.role === Role.PROJECT_MANAGER &&
      task.project.createdById !== user.userId
    ) {
      throw ApiError.forbidden('You do not have access to this task\'s activity');
    }

    const filters: ActivityFilters = { taskId };
    return activityRepository.findAll(filters, query.page, query.limit);
  },

  // Used for missed activity recovery on WebSocket reconnect
  async getMissedActivity(user: { userId: string; role: Role }, since?: Date) {
    return activityRepository.findMissedForUser({
      role: user.role,
      userId: user.userId,
      since,
      limit: 20,
    });
  },
};
