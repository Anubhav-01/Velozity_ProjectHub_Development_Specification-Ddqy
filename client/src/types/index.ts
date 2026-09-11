export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ProjectStatus = 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

export type ActivityType =
  | 'TASK_CREATED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_ASSIGNED'
  | 'TASK_UPDATED'
  | 'TASK_DELETED'
  | 'PROJECT_CREATED'
  | 'PROJECT_UPDATED'
  | 'PROJECT_DELETED'
  | 'COMMENT_ADDED';

export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_STATUS_CHANGED'
  | 'TASK_OVERDUE'
  | 'PROJECT_UPDATED'
  | 'GENERAL';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  companyName: string;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    projects: number;
  };
  projects?: Project[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  clientId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
    companyName: string;
  };
  createdBy?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  _count?: {
    tasks: number;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assignedDeveloperId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
    createdById: string;
  };
  assignedDeveloper?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export interface ActivityLog {
  id: string;
  taskId?: string | null;
  projectId: string;
  userId: string;
  type: ActivityType;
  oldStatus?: TaskStatus | null;
  newStatus?: TaskStatus | null;
  description: string;
  metadata?: any;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  task?: {
    id: string;
    title: string;
  };
  project?: {
    id: string;
    name: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
}

export interface OnlineUser {
  userId: string;
  name: string;
  email: string;
  role: Role;
}

export interface AdminDashboardData {
  totalProjects: number;
  totalTasks: number;
  tasksByStatus: Record<string, number>;
  overdueCount: number;
  onlineUsers: OnlineUser[];
}

export interface PMDashboardData {
  projects: Project[];
  tasksByPriority: Record<string, number>;
  upcomingDueDates: Task[];
  totalProjects: number;
}

export interface DeveloperDashboardData {
  myTasks: Task[];
  totalTasks: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
