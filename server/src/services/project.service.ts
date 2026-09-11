import { Role } from '@prisma/client';
import { projectRepository } from '../repositories/project.repository';
import { clientRepository } from '../repositories/client.repository';
import { ApiError } from '../utils/ApiError';
import { CreateProjectInput, UpdateProjectInput } from '../validators/schemas';

export const projectService = {
  async findAll(user: { userId: string; role: Role }) {
    if (user.role === Role.ADMIN) {
      return projectRepository.findAll();
    }
    if (user.role === Role.PROJECT_MANAGER) {
      return projectRepository.findAll({ createdById: user.userId });
    }
    // Developer: sees projects where they have assigned tasks
    return projectRepository.findByDeveloper(user.userId);
  },

  async findById(id: string, user: { userId: string; role: Role }) {
    const project = await projectRepository.findById(id);
    if (!project) throw ApiError.notFound('Project');

    // Authorization: enforce resource-level access
    if (user.role === Role.PROJECT_MANAGER && project.createdById !== user.userId) {
      throw ApiError.forbidden('You do not have access to this project');
    }

    if (user.role === Role.DEVELOPER) {
      // Check developer has a task in this project
      const devProjects = await projectRepository.findByDeveloper(user.userId);
      const hasAccess = devProjects.some((p) => p.id === id);
      if (!hasAccess) {
        throw ApiError.forbidden('You do not have access to this project');
      }
    }

    return project;
  },

  async create(input: CreateProjectInput, userId: string) {
    // Verify client exists
    const client = await clientRepository.findById(input.clientId);
    if (!client) throw ApiError.notFound('Client');

    return projectRepository.create({
      name: input.name,
      description: input.description,
      status: input.status,
      client: { connect: { id: input.clientId } },
      createdBy: { connect: { id: userId } },
    });
  },

  async update(
    id: string,
    input: UpdateProjectInput,
    user: { userId: string; role: Role },
  ) {
    const project = await projectRepository.findById(id);
    if (!project) throw ApiError.notFound('Project');

    // Only admin or the PM who created it can update
    if (user.role === Role.PROJECT_MANAGER && project.createdById !== user.userId) {
      throw ApiError.forbidden('You can only update your own projects');
    }

    if (input.clientId) {
      const client = await clientRepository.findById(input.clientId);
      if (!client) throw ApiError.notFound('Client');
    }

    return projectRepository.update(id, input);
  },

  async delete(id: string, user: { userId: string; role: Role }) {
    const project = await projectRepository.findById(id);
    if (!project) throw ApiError.notFound('Project');

    if (user.role === Role.PROJECT_MANAGER && project.createdById !== user.userId) {
      throw ApiError.forbidden('You can only delete your own projects');
    }

    await projectRepository.delete(id);
  },
};
