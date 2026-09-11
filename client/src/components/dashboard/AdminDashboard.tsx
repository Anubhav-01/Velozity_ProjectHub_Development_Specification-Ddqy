import React from 'react';
import { FolderKanban, CheckSquare, AlertTriangle, Users, ArrowUpRight } from 'lucide-react';
import { AdminDashboardData } from '../../types';
import { StatsCard } from '../ui/StatsCard';
import { Card, CardHeader, CardTitle, CardBody } from '../ui/Card';
import { PresenceWidget } from './PresenceWidget';
import { TaskStatusBadge } from '../ui/Badge';
import { Link } from 'react-router-dom';

export function AdminDashboard({ data }: { data: AdminDashboardData }) {
  const statusCounts = {
    TODO: data.tasksByStatus?.TODO || 0,
    IN_PROGRESS: data.tasksByStatus?.IN_PROGRESS || 0,
    IN_REVIEW: data.tasksByStatus?.IN_REVIEW || 0,
    DONE: data.tasksByStatus?.DONE || 0,
  };

  return (
    <div className="space-y-6">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Projects"
          value={data.totalProjects}
          icon={FolderKanban}
          color="indigo"
        />
        <StatsCard
          title="Total Tasks"
          value={data.totalTasks}
          icon={CheckSquare}
          color="sky"
        />
        <StatsCard
          title="Overdue Tasks"
          value={data.overdueCount}
          icon={AlertTriangle}
          color={data.overdueCount > 0 ? 'rose' : 'emerald'}
          trend={data.overdueCount > 0 ? 'Action required' : 'All tasks on schedule'}
        />
        <StatsCard
          title="Users Online Now"
          value={data.onlineUsers?.length || 0}
          icon={Users}
          color="emerald"
          trend="Real-time WebSocket presence"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks by Status Breakdown */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Tasks Breakdown by Status</CardTitle>
              <Link
                to="/tasks"
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                View all tasks <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col items-center justify-center text-center">
                  <TaskStatusBadge status="TODO" />
                  <span className="text-2xl font-bold text-gray-800 mt-2">{statusCounts.TODO}</span>
                  <span className="text-xs text-gray-400 mt-0.5">Pending</span>
                </div>
                <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-100 flex flex-col items-center justify-center text-center">
                  <TaskStatusBadge status="IN_PROGRESS" />
                  <span className="text-2xl font-bold text-sky-800 mt-2">{statusCounts.IN_PROGRESS}</span>
                  <span className="text-xs text-sky-600 mt-0.5">Active</span>
                </div>
                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 flex flex-col items-center justify-center text-center">
                  <TaskStatusBadge status="IN_REVIEW" />
                  <span className="text-2xl font-bold text-amber-800 mt-2">{statusCounts.IN_REVIEW}</span>
                  <span className="text-xs text-amber-600 mt-0.5">Under Review</span>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex flex-col items-center justify-center text-center">
                  <TaskStatusBadge status="DONE" />
                  <span className="text-2xl font-bold text-emerald-800 mt-2">{statusCounts.DONE}</span>
                  <span className="text-xs text-emerald-600 mt-0.5">Completed</span>
                </div>
              </div>

              {/* Progress visualizer */}
              <div className="mt-8">
                <div className="flex justify-between text-xs text-gray-500 mb-2 font-medium">
                  <span>Progress Overview</span>
                  <span>
                    {data.totalTasks > 0
                      ? Math.round((statusCounts.DONE / data.totalTasks) * 100)
                      : 0}
                    % Done
                  </span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${(statusCounts.DONE / (data.totalTasks || 1)) * 100}%` }}
                    className="bg-emerald-500"
                  />
                  <div
                    style={{ width: `${(statusCounts.IN_REVIEW / (data.totalTasks || 1)) * 100}%` }}
                    className="bg-amber-400"
                  />
                  <div
                    style={{ width: `${(statusCounts.IN_PROGRESS / (data.totalTasks || 1)) * 100}%` }}
                    className="bg-sky-500"
                  />
                  <div
                    style={{ width: `${(statusCounts.TODO / (data.totalTasks || 1)) * 100}%` }}
                    className="bg-gray-300"
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Online Presence Widget */}
        <div>
          <PresenceWidget onlineUsers={data.onlineUsers} />
        </div>
      </div>
    </div>
  );
}
