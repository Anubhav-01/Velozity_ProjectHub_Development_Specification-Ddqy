import React from 'react';
import { Task, TaskStatus } from '../../types';
import { Card, CardHeader, CardTitle, CardBody } from '../ui/Card';
import { TaskStatusBadge, TaskPriorityBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface DeveloperDashboardProps {
  data: {
    myTasks: Task[];
    totalTasks: number;
  };
  onUpdateStatus: (id: string, status: TaskStatus) => Promise<any>;
}

export function DeveloperDashboard({ data, onUpdateStatus }: DeveloperDashboardProps) {
  // Sort tasks by: 1. Priority (CRITICAL > HIGH > MEDIUM > LOW), 2. Due Date
  const priorityWeight: Record<string, number> = {
    CRITICAL: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  const sortedTasks = [...(data.myTasks || [])].sort((a, b) => {
    const pDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    if (pDiff !== 0) return pDiff;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'TODO') return 'IN_PROGRESS';
    if (current === 'IN_PROGRESS') return 'IN_REVIEW';
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>My Assigned Tasks ({sortedTasks.length})</CardTitle>
              <p className="text-xs text-gray-500 mt-1">
                Sorted by Priority &bull; Due Date
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {sortedTasks.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">
              You have no active tasks assigned to you right now. Great job!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/75 text-xs uppercase font-semibold text-gray-500">
                    <th className="py-3 px-6">Task Title</th>
                    <th className="py-3 px-6">Project</th>
                    <th className="py-3 px-6">Priority</th>
                    <th className="py-3 px-6">Due Date</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {sortedTasks.map((task) => {
                    const nextStatus = getNextStatus(task.status);

                    return (
                      <tr key={task.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-4 px-6 font-medium text-gray-900">
                          <Link to={`/tasks/${task.id}`} className="hover:text-indigo-600">
                            {task.title}
                          </Link>
                          {task.isOverdue && task.status !== 'DONE' && (
                            <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              <AlertCircle className="h-3 w-3" /> Overdue
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-gray-600 text-xs">
                          {task.project?.name || 'Project'}
                        </td>
                        <td className="py-4 px-6">
                          <TaskPriorityBadge priority={task.priority} />
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-500">
                          {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                        </td>
                        <td className="py-4 px-6">
                          <TaskStatusBadge status={task.status} />
                        </td>
                        <td className="py-4 px-6 text-right">
                          {nextStatus ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onUpdateStatus(task.id, nextStatus)}
                              className="text-xs"
                            >
                              Move to {nextStatus === 'IN_PROGRESS' ? 'In Progress' : 'In Review'}
                            </Button>
                          ) : task.status === 'IN_REVIEW' ? (
                            <span className="text-xs text-amber-600 font-medium">
                              Pending PM review
                            </span>
                          ) : (
                            <span className="text-xs text-emerald-600 font-medium flex items-center justify-end gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
