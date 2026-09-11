import { authorize } from '../middleware/authorize';
import { Role } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

describe('RBAC Middleware (authorize)', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    req = {};
    res = {};
    next = jest.fn();
  });

  it('should allow access if user has required role', () => {
    req.user = { userId: '1', role: Role.ADMIN };
    const middleware = authorize(Role.ADMIN, Role.PROJECT_MANAGER);

    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should deny access if user does not have required role (FORBIDDEN 403)', () => {
    req.user = { userId: '2', role: Role.DEVELOPER };
    const middleware = authorize(Role.ADMIN, Role.PROJECT_MANAGER);

    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    const error = next.mock.calls[0][0] as unknown as ApiError;
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('FORBIDDEN');
  });

  it('should reject unauthenticated request (UNAUTHORIZED 401)', () => {
    req.user = undefined;
    const middleware = authorize(Role.ADMIN);

    middleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    const error = next.mock.calls[0][0] as unknown as ApiError;
    expect(error.statusCode).toBe(401);
  });
});
