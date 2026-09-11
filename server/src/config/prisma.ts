import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Singleton Prisma client
// In development, reuse the same instance across hot reloads
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const createPrismaClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
  });

const prisma = global.__prisma ?? createPrismaClient();

if (env.NODE_ENV === 'development') {
  global.__prisma = prisma;
}

export { prisma };
export default prisma;
