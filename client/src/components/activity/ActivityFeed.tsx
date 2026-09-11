import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ActivityLog } from '../../types';
import { Activity, ArrowRight, CheckCircle2, PlusCircle, AlertCircle } from 'lucide-react';
import { TaskStatusBadge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ActivityFeedProps {
  activities?: ActivityLog[];
  isLoading?: boolean;
}

export function ActivityFeed({ activities = [], isLoading = false }: ActivityFeedProps) {
  if (isLoading) {
    return <LoadingSpinner className="py-12" />;
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-100 p-6">
        <Activity className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-500">No activity logged yet</p>
      </div>
    );
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'TASK_STATUS_CHANGED':
        return <ArrowRight className="h-4 w-4 text-indigo-500" />;
      case 'TASK_CREATED':
      case 'PROJECT_CREATED':
        return <PlusCircle className="h-4 w-4 text-emerald-500" />;
      case 'TASK_ASSIGNED':
        return <Activity className="h-4 w-4 text-sky-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, idx) => {
          const isLast = idx === activities.length - 1;

          return (
            <li key={activity.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-5 left-4 -ml-px h-full w-0.5 bg-gray-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  {/* Icon Circle */}
                  <div className="relative">
                    <div className="h-8 w-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center">
                      {getActionIcon(activity.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 pt-1">
                    <div className="text-sm text-gray-800">
                      <span className="font-semibold text-gray-900">
                        {activity.user?.name || 'User'}
                      </span>{' '}
                      {activity.type === 'TASK_STATUS_CHANGED' && activity.oldStatus && activity.newStatus ? (
                        <span>
                          moved{' '}
                          <span className="font-medium text-indigo-600">
                            {activity.task?.title || 'Task'}
                          </span>{' '}
                          from{' '}
                          <TaskStatusBadge status={activity.oldStatus} /> to{' '}
                          <TaskStatusBadge status={activity.newStatus} />
                        </span>
                      ) : (
                        <span>{activity.description}</span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                      <span>
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </span>
                      {activity.project?.name && (
                        <>
                          <span>&bull;</span>
                          <span className="text-gray-500 font-medium">
                            {activity.project.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
