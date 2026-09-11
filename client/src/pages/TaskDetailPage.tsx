import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTask, useTasks } from '../hooks/useTasks';
import { useActivityFeed } from '../hooks/useActivityFeed';
import { useAuthStore } from '../store/authStore';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TaskStatusBadge, TaskPriorityBadge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorState } from '../components/ui/ErrorState';
import { ActivityFeed } from '../components/activity/ActivityFeed';
import { TaskModal } from '../components/tasks/TaskModal';
import { taskService } from '../services/task.service';
import { TaskStatus } from '../types';
import { ArrowLeft, Calendar, FolderKanban, User, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const { data: task, isLoading, error, refetch } = useTask(id!);
  const { data: activities, isLoading: activitiesLoading } = useActivityFeed({ taskId: id });
  const { updateStatus, isUpdatingStatus } = useTasks();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (isLoading) {
    return <LoadingSpinner className="py-24" />;
  }

  if (error || !task) {
    return <ErrorState message="Task not found or you do not have permission to view it." />;
  }

  const isAssignedDev = user?.id === task.assignedDeveloperId;
  const isPMOwner = user?.role === 'PROJECT_MANAGER' && task.project?.createdById === user?.id;
  const isAdmin = user?.role === 'ADMIN';

  // Can change status: Assigned Dev, PM Owner, or Admin
  const canUpdateStatus = isAssignedDev || isPMOwner || isAdmin;
  // Can edit task details or delete: PM Owner or Admin
  const canManage = isPMOwner || isAdmin;

  const handleStatusChange = async (newStatus: TaskStatus) => {
    await updateStatus({ id: task.id, status: newStatus });
    refetch();
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setIsDeleting(true);
    try {
      await taskService.deleteTask(task.id);
      navigate('/tasks');
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link
          to="/tasks"
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Tasks
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
              {task.isOverdue && task.status !== 'DONE' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  <AlertCircle className="h-3.5 w-3.5" /> Overdue
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">Task ID: #{task.id}</p>
          </div>

          <div className="flex items-center gap-3">
            {canManage && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditModalOpen(true)}
                  className="gap-1.5"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
                  isLoading={isDeleting}
                  className="gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Task Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Description
            </h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {task.description}
            </p>
          </Card>

          {/* Activity Timeline for this task */}
          <Card>
            <CardHeader>
              <CardTitle>Task History & Status Changes</CardTitle>
            </CardHeader>
            <CardBody>
              <ActivityFeed activities={activities} isLoading={activitiesLoading} />
            </CardBody>
          </Card>
        </div>

        {/* Right: Meta details & Status Changer */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Task Details
            </h3>

            {/* Current Status & Fast Selector */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              {canUpdateStatus ? (
                <select
                  value={task.status}
                  disabled={isUpdatingStatus}
                  onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                  className="w-full text-xs font-semibold border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="IN_REVIEW">IN_REVIEW</option>
                  <option value="DONE">DONE</option>
                </select>
              ) : (
                <TaskStatusBadge status={task.status} />
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
              <TaskPriorityBadge priority={task.priority} />
            </div>

            <div className="pt-2 border-t border-gray-100">
              <label className="block text-xs font-medium text-gray-500 mb-1">Project</label>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <FolderKanban className="h-4 w-4 text-indigo-500" />
                <Link to={`/projects/${task.projectId}`} className="hover:text-indigo-600">
                  {task.project?.name || 'Project'}
                </Link>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Assigned Developer</label>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <User className="h-4 w-4 text-sky-500" />
                <span>{task.assignedDeveloper?.name || 'Unassigned'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Due Date</label>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>{format(new Date(task.dueDate), 'MMMM dd, yyyy')}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <TaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={task}
        onSubmit={async (data) => {
          await taskService.updateTask(task.id, data);
          refetch();
        }}
      />
    </div>
  );
}
