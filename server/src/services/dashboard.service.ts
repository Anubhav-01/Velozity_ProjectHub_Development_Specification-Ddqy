import { Role } from '@prisma/client';
import { projectRepository } from '../repositories/project.repository';
import { taskRepository } from '../repositories/task.repository';
import { ApiError } from '../utils/ApiError';
import { getPresenceManager } from '../socket/presence';

export const dashboardService = {
  async getAdminDashboard() {
    const [totalProjects, tasksByStatusRaw, overdueCount] = await Promise.all([
      projectRepository.countTotal(),
      taskRepository.countByStatus(),
      taskRepository.countOverdue(),
    ]);

    const tasksByStatus = Object.fromEntries(
      tasksByStatusRaw.map((row) => [row.status, row._count]),
    );

    const totalTasks = Object.values(tasksByStatus).reduce((sum, n) => sum + n, 0);

    const presence = getPresenceManager();
    const onlineUsers = presence.getOnlineUsers();

    return {
      totalProjects,
      totalTasks,
      tasksByStatus,
      overdueCount,
      onlineUsers,
    };
  },

  async getPMDashboard(userId: string) {
    const [projects, tasksByPriorityRaw, upcomingDueDates] = await Promise.all([
      projectRepository.findAll({ createdById: userId }),
      taskRepository.countByPriority(userId),
      taskRepository.findUpcomingDue(userId),
    ]);

    const tasksByPriority = Object.fromEntries(
      tasksByPriorityRaw.map((row) => [row.priority, row._count]),
    );

    return {
      projects,
      tasksByPriority,
      upcomingDueDates,
      totalProjects: projects.length,
    };
  },

  async getDeveloperDashboard(userId: string) {
    const [tasks] = await taskRepository.findAll(
      { assignedDeveloperId: userId },
      1,
      50,
    );

    return {
      myTasks: tasks,
      totalTasks: tasks.length,
    };
  },
};
