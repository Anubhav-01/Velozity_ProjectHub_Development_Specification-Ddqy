import { Role, TaskStatus, TaskPriority, ProjectStatus, ActivityType, NotificationType } from '@prisma/client';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface ActivityPayload {
  id: string;
  taskId?: string | null;
  projectId: string;
  userId: string;
  type: ActivityType;
  oldStatus?: TaskStatus | null;
  newStatus?: TaskStatus | null;
  description: string;
  metadata?: any;
  createdAt: Date;
  user?: UserSummary;
  task?: { id: string; title: string };
  project?: { id: string; name: string };
}

export interface OnlineUserStatus {
  userId: string;
  name: string;
  email: string;
  role: Role;
}
