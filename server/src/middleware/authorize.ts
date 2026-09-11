import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ApiError } from '../utils/ApiError';

/**
 * Role-based access control middleware factory.
 * Usage: router.get('/route', authenticate, authorize(Role.ADMIN, Role.PROJECT_MANAGER), handler)
 *
 * Must be used AFTER authenticate middleware (requires req.user).
 */
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
        ),
      );
    }

    next();
  };
}

/**
 * Convenience: only ADMINs may proceed
 */
export const adminOnly = authorize(Role.ADMIN);

/**
 * Convenience: ADMINs and PROJECT_MANAGERs may proceed
 */
export const managerOrAbove = authorize(Role.ADMIN, Role.PROJECT_MANAGER);

/**
 * Convenience: any authenticated user may proceed (role check is deferred to service layer)
 */
export const anyRole = authorize(Role.ADMIN, Role.PROJECT_MANAGER, Role.DEVELOPER);
