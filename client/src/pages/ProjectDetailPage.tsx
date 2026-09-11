import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { useActivityFeed } from '../hooks/useActivityFeed';
import { useAuthStore } from '../store/authStore';
import { Card, CardHeader, CardTitle, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProjectStatusBadge, TaskPriorityBadge, TaskStatusBadge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorState } from '../components/ui/ErrorState';
import { ActivityFeed } from '../components/activity/ActivityFeed';
import { TaskModal } from '../components/tasks/TaskModal';
import { taskService } from '../services/task.service';
import { Plus, ArrowLeft, Calendar, Briefcase, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);

  const { data: project, isLoading: projectLoading, error: projectError } = useProject(id!);
  const { tasks, isLoading: tasksLoading, refetch: refetchTasks } = useTasks({ projectId: id });
  const { data: activities, isLoading: activitiesLoading } = useActivityFeed({ projectId: id });

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const canManageTasks = user?.role === 'ADMIN' || (user?.role === 'PROJECT_MANAGER' && project?.createdById === user?.id);

  if (projectLoading) {
    return <LoadingSpinner className="py-24" />;
  }

  if (projectError || !project) {
    return <ErrorState message="Could not load project details or you do not have permission to view it." />;
  }

  return (
    <div className="space-y-6">
      {/* Back Link & Header */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-700 mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Projects
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <ProjectStatusBadge status={project.status} />
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" /> Client: <strong>{project.client?.companyName}</strong>
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <UserIcon className="h-3.5 w-3.5" /> PM: <strong>{project.createdBy?.name}</strong>
              </span>
            </p>
          </div>

          {canManageTasks && (
            <Button onClick={() => setIsTaskModalOpen(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </Button>
          )}
        </div>
      </div>

      {/* Description */}
      <Card className="p-6">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About Project</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{project.description}</p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Tasks ({tasks.length})</CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              {tasksLoading ? (
                <LoadingSpinner className="py-12" />
              ) : tasks.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400">
                  No tasks created for this project yet.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      <div className="min-w-0 flex-1 mr-4">
                        <Link
                          to={`/tasks/${task.id}`}
                          className="text-sm font-semibold text-gray-900 hover:text-indigo-600 truncate block"
                        >
                          {task.title}
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Assigned: {task.assignedDeveloper?.name || 'Unassigned'} &bull; Due{' '}
                          {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <TaskPriorityBadge priority={task.priority} />
                        <TaskStatusBadge status={task.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Project Activity Log */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Project Activity</CardTitle>
            </CardHeader>
            <CardBody>
              <ActivityFeed activities={activities} isLoading={activitiesLoading} />
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Add Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        defaultProjectId={project.id}
        onSubmit={async (data) => {
          await taskService.createTask(data);
          refetchTasks();
        }}
      />
    </div>
  );
}
