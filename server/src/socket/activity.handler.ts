import { Server } from 'socket.io';
import { logger } from '../utils/logger';

export function emitActivity(
  io: Server,
  activity: any,
  projectCreatedById?: string
): void {
  try {
    const payload = {
      id: activity.id,
      taskId: activity.taskId,
      projectId: activity.projectId,
      type: activity.type,
      oldStatus: activity.oldStatus,
      newStatus: activity.newStatus,
      description: activity.description,
      createdAt: activity.createdAt,
      metadata: activity.metadata,
      user: activity.user,
      task: activity.task,
      project: activity.project,
    };

    // 1. Admin gets all activity
    io.to('admin-feed').emit('activity:new', payload);

    // 2. Project Manager gets activity for their project
    if (projectCreatedById) {
      io.to(`pm:${projectCreatedById}`).emit('activity:new', payload);
    }

    // 3. If related to a task with assigned developer
    if (activity.task?.assignedDeveloperId) {
      io.to(`dev:${activity.task.assignedDeveloperId}`).emit('activity:new', payload);
    }

    // 4. Also emit to project specific room
    if (activity.projectId) {
      io.to(`project:${activity.projectId}`).emit('activity:new', payload);
    }

    // Also emit task status updated event if it was a status change
    if (activity.type === 'TASK_STATUS_CHANGED' && activity.taskId) {
      io.emit('task:status:updated', {
        taskId: activity.taskId,
        projectId: activity.projectId,
        oldStatus: activity.oldStatus,
        newStatus: activity.newStatus,
        changedBy: activity.user,
        timestamp: activity.createdAt,
      });
    }
  } catch (error) {
    logger.error('Error emitting activity event', { error });
  }
}

export function emitNotification(
  io: Server,
  notification: any,
  targetUserId: string
): void {
  try {
    io.to(`user:${targetUserId}`).emit('notification:new', notification);
  } catch (error) {
    logger.error('Error emitting notification event', { error });
  }
}
