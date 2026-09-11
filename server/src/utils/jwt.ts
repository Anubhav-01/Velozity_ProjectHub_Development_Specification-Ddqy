import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from './ApiError';
import { Role } from '@prisma/client';

export interface AccessTokenPayload {
  userId: string;
  role: Role;
  type: 'access';
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  type: 'refresh';
}

// ── Access Token ─────────────────────────────────────────────

export function signAccessToken(userId: string, role: Role): string {
  const payload: AccessTokenPayload = { userId, role, type: 'access' };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    if (payload.type !== 'access') {
      throw ApiError.invalidToken();
    }
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw ApiError.tokenExpired();
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw ApiError.invalidToken();
    }
    throw error;
  }
}

// ── Refresh Token ─────────────────────────────────────────────

export function signRefreshToken(userId: string, tokenId: string): string {
  const payload: RefreshTokenPayload = { userId, tokenId, type: 'refresh' };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
    if (payload.type !== 'refresh') {
      throw ApiError.invalidToken();
    }
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized('Refresh token has expired. Please log in again.');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw ApiError.invalidToken();
    }
    throw error;
  }
}

// ── Parse refresh token expiry for cookie max age ─────────────
export function getRefreshTokenExpiryMs(): number {
  const expiry = env.REFRESH_TOKEN_EXPIRES_IN;
  const units: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7d
  return parseInt(match[1]) * units[match[2]];
}

export function getRefreshTokenExpiryDate(): Date {
  return new Date(Date.now() + getRefreshTokenExpiryMs());
}
