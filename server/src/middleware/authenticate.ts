import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

// Augment Express Request with authenticated user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: import('@prisma/client').Role;
      };
    }
  }
}

/**
 * Verifies the JWT access token from the Authorization header.
 * Attaches decoded user info to req.user.
 * Throws 401 if missing, invalid, or expired.
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw ApiError.unauthorized('No authorization header provided');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      throw ApiError.unauthorized(
        'Invalid authorization format. Use: Bearer <token>',
      );
    }

    const token = parts[1];
    const payload = verifyAccessToken(token);

    req.user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch (error) {
    next(error);
  }
}
