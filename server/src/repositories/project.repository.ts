import prisma from '../config/prisma';
import { Prisma, ProjectStatus, Role } from '@prisma/client';

const projectInclude = {
  client: {
    select: { id: true, name: true, companyName: true },
  },
  createdBy: {
    select: { id: true, name: true, email: true, role: true },
  },
  _count: { select: { tasks: true } },
} as const;

export const projectRepository = {
  findAll(filters?: {
    createdById?: string;
    clientId?: string;
    status?: ProjectStatus;
  }) {
    return prisma.project.findMany({
      where: filters,
      include: projectInclude,
      orderBy: { createdAt: 'desc' },
    });
  },

  // Find projects where a developer has at least one assigned task
  findByDeveloper(developerId: string) {
    return prisma.project.findMany({
      where: {
        tasks: {
          some: { assignedDeveloperId: developerId },
        },
      },
      include: projectInclude,
      orderBy: { createdAt: 'desc' },
    });
  },

  findById(id: string) {
    return prisma.project.findUnique({
      where: { id },
      include: projectInclude,
    });
  },

  create(data: Prisma.ProjectCreateInput) {
    return prisma.project.create({ data, include: projectInclude });
  },

  update(id: string, data: Prisma.ProjectUpdateInput) {
    return prisma.project.update({
      where: { id },
      data,
      include: projectInclude,
    });
  },

  delete(id: string) {
    return prisma.project.delete({ where: { id } });
  },

  // Dashboard stats
  countByStatus(createdById?: string) {
    return prisma.project.groupBy({
      by: ['status'],
      where: createdById ? { createdById } : undefined,
      _count: true,
    });
  },

  countTotal(createdById?: string) {
    return prisma.project.count({
      where: createdById ? { createdById } : undefined,
    });
  },
};
