import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { useAuthStore } from '../store/authStore';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskModal } from '../components/tasks/TaskModal';
import { TaskStatusBadge, TaskPriorityBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { taskService } from '../services/task.service';
import { CheckSquare, Plus, AlertCircle, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { TaskStatus, TaskPriority } from '../types';

export function TasksPage() {
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);

  // Parse filter params from URL
  const status = (searchParams.get('status') as TaskStatus) || undefined;
  const priority = (searchParams.get('priority') as TaskPriority) || undefined;
  const from = searchParams.get('from') || undefined;
  const to = searchParams.get('to') || undefined;

  const { tasks, isLoading, refetch, updateStatus } = useTasks({
    status,
    priority,
    from: from ? new Date(from).toISOString() : undefined,
    to: to ? new Date(to).toISOString() : undefined,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const canCreate = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">
            {user?.role === 'ADMIN' && 'All tasks across all agency projects'}
            {user?.role === 'PROJECT_MANAGER' && 'Tasks inside projects created by you'}
            {user?.role === 'DEVELOPER' && 'Tasks assigned directly to you'}
          </p>
        </div>

        {canCreate && (
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </Button>
        )}
      </div>

      {/* URL Query-Driven Filter Bar */}
      <TaskFilters />

      {/* Tasks Table */}
      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <LoadingSpinner className="py-24" />
          ) : tasks.length === 0 ? (
            <div className="p-12 text-center">
              <CheckSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-700">No tasks match your filters</p>
              <p className="text-xs text-gray-400 mt-1">Try resetting the filter criteria above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/75 text-xs uppercase font-semibold text-gray-500">
                    <th className="py-3.5 px-6">Task</th>
                    <th className="py-3.5 px-6">Project</th>
                    <th className="py-3.5 px-6">Assignee</th>
                    <th className="py-3.5 px-6">Priority</th>
                    <th className="py-3.5 px-6">Due Date</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-900">
                        <Link to={`/tasks/${task.id}`} className="hover:text-indigo-600 block">
                          {task.title}
                        </Link>
                        {task.isOverdue && task.status !== 'DONE' && (
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <AlertCircle className="h-3 w-3" /> Overdue
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-600">
                        {task.project ? (
                          <Link to={`/projects/${task.project.id}`} className="hover:underline">
                            {task.project.name}
                          </Link>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-600">
                        {task.assignedDeveloper?.name || 'Unassigned'}
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
                        <Link
                          to={`/tasks/${task.id}`}
                          className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          View <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Create Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (data) => {
          await taskService.createTask(data);
          refetch();
        }}
      />
    </div>
  );
}
