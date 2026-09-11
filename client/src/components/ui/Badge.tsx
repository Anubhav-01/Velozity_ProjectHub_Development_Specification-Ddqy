import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TaskStatus, TaskPriority, ProjectStatus, Role } from '../../types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  children: React.ReactNode;
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-700 border-gray-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  return (
    <span
      className={twMerge(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const map: Record<TaskStatus, { label: string; variant: 'default' | 'info' | 'warning' | 'success' }> = {
    TODO: { label: 'To Do', variant: 'default' },
    IN_PROGRESS: { label: 'In Progress', variant: 'info' },
    IN_REVIEW: { label: 'In Review', variant: 'warning' },
    DONE: { label: 'Done', variant: 'success' },
  };
  const item = map[status] || { label: status, variant: 'default' };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  const map: Record<TaskPriority, { label: string; variant: 'default' | 'info' | 'warning' | 'danger' }> = {
    LOW: { label: 'Low', variant: 'default' },
    MEDIUM: { label: 'Medium', variant: 'info' },
    HIGH: { label: 'High', variant: 'warning' },
    CRITICAL: { label: 'Critical', variant: 'danger' },
  };
  const item = map[priority] || { label: priority, variant: 'default' };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const map: Record<ProjectStatus, { label: string; variant: 'success' | 'warning' | 'default' | 'danger' }> = {
    ACTIVE: { label: 'Active', variant: 'success' },
    ON_HOLD: { label: 'On Hold', variant: 'warning' },
    COMPLETED: { label: 'Completed', variant: 'default' },
    CANCELLED: { label: 'Cancelled', variant: 'danger' },
  };
  const item = map[status] || { label: status, variant: 'default' };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}

export function RoleBadge({ role }: { role: Role }) {
  const map: Record<Role, { label: string; variant: 'danger' | 'purple' | 'info' }> = {
    ADMIN: { label: 'Admin', variant: 'danger' },
    PROJECT_MANAGER: { label: 'Project Manager', variant: 'purple' },
    DEVELOPER: { label: 'Developer', variant: 'info' },
  };
  const item = map[role] || { label: role, variant: 'info' };
  return <Badge variant={item.variant}>{item.label}</Badge>;
}
