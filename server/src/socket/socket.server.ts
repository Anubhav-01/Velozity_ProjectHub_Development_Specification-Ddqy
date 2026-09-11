import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { userRepository } from '../repositories/user.repository';
import { projectRepository } from '../repositories/project.repository';
import { taskRepository } from '../repositories/task.repository';
import { activityService } from '../services/activity.service';
import { getPresenceManager } from './presence';
import { logger } from '../utils/logger';
import { Role } from '@prisma/client';

export interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
    };
  };
}

export function setupSocketServer(io: Server): void {
  const presence = getPresenceManager();

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const payload = verifyAccessToken(token);
      const user = await userRepository.findById(payload.userId);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (err: any) {
      logger.warn('Socket connection rejected:', { message: err?.message });
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', async (socket: AuthenticatedSocket) => {
    const user = socket.data.user;
    logger.info(`Socket connected: ${user.name} (${user.role}) [${socket.id}]`);

    // 1. Join user private room
    socket.join(`user:${user.id}`);

    // 2. Role-based room subscriptions
    if (user.role === Role.ADMIN) {
      socket.join('admin-feed');
    } else if (user.role === Role.PROJECT_MANAGER) {
      socket.join(`pm:${user.id}`);

      // Join rooms for all projects created by this PM
      const pmProjects = await projectRepository.findAll({ createdById: user.id });
      for (const proj of pmProjects) {
        socket.join(`project:${proj.id}`);
      }
    } else if (user.role === Role.DEVELOPER) {
      socket.join(`dev:${user.id}`);

      // Join rooms for projects where developer has tasks
      const devProjects = await projectRepository.findByDeveloper(user.id);
      for (const proj of devProjects) {
        socket.join(`project:${proj.id}`);
      }
    }

    // 3. Presence tracking
    const isFirstConnection = presence.addUser(socket.id, {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    if (isFirstConnection) {
      // Broadcast updated online presence
      io.emit('presence:update', {
        onlineUsers: presence.getOnlineUsers(),
        count: presence.getOnlineUserCount(),
        changedUser: { userId: user.id, status: 'online' },
      });
    } else {
      // Send current presence to the connecting socket
      socket.emit('presence:init', {
        onlineUsers: presence.getOnlineUsers(),
        count: presence.getOnlineUserCount(),
      });
    }

    // 4. Missed Activity Recovery
    // When a user connects/reconnects, retrieve the last 20 relevant activity events from DB
    try {
      const missedActivities = await activityService.getMissedActivity({
        userId: user.id,
        role: user.role,
      });

      socket.emit('activity:missed', missedActivities);
    } catch (err) {
      logger.error('Error fetching missed activity on connect', { err });
    }

    // Handle manual sync requests
    socket.on('activity:sync', async (data: { since?: string }) => {
      try {
        const sinceDate = data?.since ? new Date(data.since) : undefined;
        const activities = await activityService.getMissedActivity(
          { userId: user.id, role: user.role },
          sinceDate
        );
        socket.emit('activity:missed', activities);
      } catch (err) {
        logger.error('Error syncing activity', { err });
      }
    });

    // Handle Disconnect
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${user.name} [${socket.id}]`);
      const removal = presence.removeUser(socket.id);

      if (removal && removal.isLastConnection) {
        io.emit('presence:update', {
          onlineUsers: presence.getOnlineUsers(),
          count: presence.getOnlineUserCount(),
          changedUser: { userId: user.id, status: 'offline' },
        });
      }
    });
  });
}
