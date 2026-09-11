import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';

export const clientRepository = {
  findAll() {
    return prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { projects: true } },
      },
    });
  },

  findById(id: string) {
    return prisma.client.findUnique({
      where: { id },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
            _count: { select: { tasks: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  },

  findByEmail(email: string) {
    return prisma.client.findUnique({
      where: { email },
      select: { id: true },
    });
  },

  create(data: Prisma.ClientCreateInput) {
    return prisma.client.create({ data });
  },

  update(id: string, data: Prisma.ClientUpdateInput) {
    return prisma.client.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.client.delete({ where: { id } });
  },
};
