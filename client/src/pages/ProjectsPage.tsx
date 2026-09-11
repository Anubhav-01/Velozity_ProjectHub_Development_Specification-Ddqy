import React, { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useAuthStore } from '../store/authStore';
import { Project, ProjectStatus } from '../types';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProjectStatusBadge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { ProjectModal } from '../components/projects/ProjectModal';
import { FolderKanban, Plus, CheckSquare, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ProjectsPage() {
  const { projects, isLoading, createProject } = useProjects();
  const user = useAuthStore((state) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canCreate = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">
            {user?.role === 'ADMIN' && 'All agency client projects'}
            {user?.role === 'PROJECT_MANAGER' && 'Projects managed by you'}
            {user?.role === 'DEVELOPER' && 'Projects you have tasks in'}
          </p>
        </div>

        {canCreate && (
          <Button onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </Button>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner className="py-24" />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="Create your first client project to start organizing tasks."
          action={
            canCreate && (
              <Button onClick={() => setIsModalOpen(true)} size="sm">
                Create Project
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow flex flex-col justify-between">
              <CardBody className="p-6">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <ProjectStatusBadge status={project.status} />
                  <span className="text-xs text-gray-400 font-medium">
                    {project.client?.companyName}
                  </span>
                </div>

                <Link
                  to={`/projects/${project.id}`}
                  className="text-base font-bold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1"
                >
                  {project.name}
                </Link>

                <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                  {project.description}
                </p>
              </CardBody>

              <div className="px-6 py-3.5 bg-gray-50/75 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <CheckSquare className="h-4 w-4 text-indigo-500" />
                  <span className="font-semibold text-gray-700">
                    {project._count?.tasks || 0}
                  </span>{' '}
                  tasks
                </div>

                <Link
                  to={`/projects/${project.id}`}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                >
                  View Details <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (data) => {
          await createProject(data);
        }}
      />
    </div>
  );
}
