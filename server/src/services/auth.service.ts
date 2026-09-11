import { Response } from 'express';
import { userRepository } from '../repositories/user.repository';
import { refreshTokenRepository } from '../repositories/refreshToken.repository';
import { comparePassword, hashPassword } from '../utils/password';
import { Role } from '@prisma/client';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiryDate,
} from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import crypto from 'crypto';

// We generate a unique tokenId per refresh token so we can store it
// and look it up independently of the token value
function generateTokenId(): string {
  // Use crypto random bytes for a unique token ID
  return crypto.randomBytes(32).toString('hex');
}

const COOKIE_NAME = 'velozity_refresh_token';

export const authService = {
  async register(
    data: { name: string; email: string; password: string; role?: Role },
    res: Response
  ) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw ApiError.conflict('A user with this email address already exists');
    }

    const passwordHash = await hashPassword(data.password);
    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role || Role.DEVELOPER,
    });

    const accessToken = signAccessToken(user.id, user.role);
    const tokenId = generateTokenId();
    const refreshToken = signRefreshToken(user.id, tokenId);
    const expiresAt = getRefreshTokenExpiryDate();

    await refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    authService.setRefreshTokenCookie(res, refreshToken);

    logger.info({ message: 'User registered', userId: user.id, email: user.email });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  async login(email: string, password: string, res: Response) {
    // 1. Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw ApiError.invalidCredentials();
    }

    // 2. Verify password
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw ApiError.invalidCredentials();
    }

    // 3. Generate tokens
    const accessToken = signAccessToken(user.id, user.role);
    const tokenId = generateTokenId();
    const refreshToken = signRefreshToken(user.id, tokenId);
    const expiresAt = getRefreshTokenExpiryDate();

    // 4. Store hashed refresh token in DB
    await refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });

    // 5. Set HttpOnly cookie
    authService.setRefreshTokenCookie(res, refreshToken);

    logger.info({ message: 'User logged in', userId: user.id, email: user.email });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  async refresh(refreshToken: string | undefined, res: Response) {
    if (!refreshToken) {
      throw ApiError.unauthorized('No refresh token provided');
    }

    // 1. Verify JWT signature
    const payload = verifyRefreshToken(refreshToken);

    // 2. Look up the stored hash
    const storedToken = await refreshTokenRepository.findByToken(refreshToken);
    if (!storedToken) {
      throw ApiError.unauthorized('Refresh token not found or already used');
    }

    // 3. Check it's still valid
    if (!refreshTokenRepository.isValid(storedToken)) {
      throw ApiError.unauthorized('Refresh token is expired or revoked');
    }

    // 4. Verify user exists
    const user = await userRepository.findByIdWithPassword(payload.userId);
    if (!user) {
      throw ApiError.unauthorized('User no longer exists');
    }

    // 5. Revoke the old token (rotation)
    await refreshTokenRepository.revoke(storedToken.id);

    // 6. Issue new tokens
    const newAccessToken = signAccessToken(user.id, user.role);
    const tokenId = generateTokenId();
    const newRefreshToken = signRefreshToken(user.id, tokenId);
    const expiresAt = getRefreshTokenExpiryDate();

    await refreshTokenRepository.create({
      userId: user.id,
      token: newRefreshToken,
      expiresAt,
    });

    authService.setRefreshTokenCookie(res, newRefreshToken);

    return { accessToken: newAccessToken };
  },

  async logout(refreshToken: string | undefined, res: Response) {
    if (refreshToken) {
      try {
        const storedToken = await refreshTokenRepository.findByToken(refreshToken);
        if (storedToken) {
          await refreshTokenRepository.revoke(storedToken.id);
        }
      } catch {
        // Best-effort revocation — don't fail the logout
      }
    }

    authService.clearRefreshTokenCookie(res);
  },

  async getMe(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User');
    }
    return user;
  },

  setRefreshTokenCookie(res: Response, token: string) {
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
      path: '/api/auth',
    });
  },

  clearRefreshTokenCookie(res: Response) {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: env.COOKIE_SECURE,
      sameSite: env.COOKIE_SAME_SITE,
      path: '/api/auth',
    });
  },

  getRefreshTokenFromCookies(cookies: Record<string, string>): string | undefined {
    return cookies[COOKIE_NAME];
  },
};
