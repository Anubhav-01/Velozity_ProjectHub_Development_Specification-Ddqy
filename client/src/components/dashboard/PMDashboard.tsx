import React from 'react';
import { FolderKanban, Calendar, ArrowUpRight } from 'lucide-react';
import { PMDashboardData } from '../../types';
import { StatsCard } from '../ui/StatsCard';
import { Card, CardHeader, CardTitle, CardBody } from '../ui/Card';
import { TaskPriorityBadge, TaskStatusBadge, ProjectStatusBadge } from '../ui/Badge';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export function PMDashboard({ data }: { data: PMDashboardData }) {
  const priorities = {
    CRITICAL: data.tasksByPriority?.CRITICAL || 0,
    HIGH: data.tasksByPriority?.HIGH || 0,
    MEDIUM: data.tasksByPriority?.MEDIUM || 0,
    LOW: data.tasksByPriority?.LOW || 0,
  };

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="My Active Projects"
          value={data.totalProjects}
          icon={FolderKanban}
          color="indigo"
        />
        <StatsCard
          title="Critical Tasks"
          value={priorities.CRITICAL}
          icon={Calendar}
          color="rose"
          trend="Highest priority"
        />
        <StatsCard
          title="High Tasks"
          value={priorities.HIGH}
          icon={Calendar}
          color="amber"
        />
        <StatsCard
          title="Due This Week"
          value={data.upcomingDueDates?.length || 0}
          icon={Calendar}
          color="sky"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Created by this PM */}
        <Card>
          <CardHeader>
            <CardTitle>My Projects ({data.projects?.length || 0})</CardTitle>
            <Link
              to="/projects"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              Manage <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {data.projects?.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">
                You have not created any projects yet
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {data.projects?.map((project) => (
                  <div key={project.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div>
                      <Link
                        to={`/projects/${project.id}`}
                        className="text-sm font-semibold text-gray-900 hover:text-indigo-600"
                      >
                        {project.name}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Client: {project.client?.companyName || 'N/A'} &bull; {project._count?.tasks || 0} tasks
                      </p>
                    </div>
                    <ProjectStatusBadge status={project.status} />
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Upcoming Due Dates This Week */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Due Dates This Week</CardTitle>
            <Link
              to="/tasks"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              All Tasks <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {data.upcomingDueDates?.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400">
                No tasks due this week
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {data.upcomingDueDates?.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                    <div className="min-w-0 flex-1 mr-4">
                      <Link
                        to={`/tasks/${task.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-indigo-600 truncate block"
                      >
                        {task.title}
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Assigned: {task.assignedDeveloper?.name} &bull; Due {format(new Date(task.dueDate), 'MMM dd, yyyy')}
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
    </div>
  );
}
