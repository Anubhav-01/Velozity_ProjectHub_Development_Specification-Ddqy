import prisma from '../config/prisma';
import crypto from 'crypto';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const refreshTokenRepository = {
  create(data: { userId: string; token: string; expiresAt: Date }) {
    const tokenHash = hashToken(data.token);
    return prisma.refreshToken.create({
      data: {
        userId: data.userId,
        tokenHash,
        expiresAt: data.expiresAt,
      },
    });
  },

  findByToken(token: string) {
    const tokenHash = hashToken(token);
    return prisma.refreshToken.findUnique({ where: { tokenHash } });
  },

  findById(id: string) {
    return prisma.refreshToken.findUnique({ where: { id } });
  },

  revoke(id: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  },

  revokeAllForUser(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  // Clean up expired/revoked tokens (called by background job)
  cleanup() {
    return prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { not: null } },
        ],
      },
    });
  },

  isValid(token: { expiresAt: Date; revokedAt: Date | null }) {
    return token.expiresAt > new Date() && token.revokedAt === null;
  },
};

export { hashToken };
