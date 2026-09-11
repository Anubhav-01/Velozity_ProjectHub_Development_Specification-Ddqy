import prisma from '../config/prisma';
import { Role, Prisma } from '@prisma/client';

// Select fields to NEVER return passwordHash to callers
const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

// Include passwordHash for auth operations
const userWithPassword = {
  id: true,
  name: true,
  email: true,
  role: true,
  passwordHash: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const userRepository = {
  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });
  },

  findByIdWithPassword(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: userWithPassword,
    });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: userWithPassword,
    });
  },

  findAll(filters?: { role?: Role }) {
    return prisma.user.findMany({
      where: filters,
      select: userSelect,
      orderBy: { createdAt: 'desc' },
    });
  },

  findDevelopers() {
    return prisma.user.findMany({
      where: { role: Role.DEVELOPER },
      select: userSelect,
      orderBy: { name: 'asc' },
    });
  },

  create(data: { name: string; email: string; passwordHash: string; role: Role }) {
    return prisma.user.create({
      data,
      select: userSelect,
    });
  },

  update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    });
  },

  delete(id: string) {
    return prisma.user.delete({
      where: { id },
      select: userSelect,
    });
  },

  existsByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
  },
};

export type SafeUser = Awaited<ReturnType<typeof userRepository.findById>>;
