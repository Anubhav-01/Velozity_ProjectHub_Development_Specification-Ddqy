import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

/**
 * Centralized Express error handler.
 * Must be registered LAST — after all routes.
 * Converts all errors to the standardized API error format.
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // Operational errors (thrown intentionally by application code)
  if (error instanceof ApiError) {
    // Log 5xx errors as errors, 4xx as warnings
    if (error.statusCode >= 500) {
      logger.error({
        message: error.message,
        code: error.code,
        path: req.path,
        method: req.method,
        userId: req.user?.userId,
        stack: error.stack,
      });
    } else {
      logger.warn({
        message: error.message,
        code: error.code,
        path: req.path,
        method: req.method,
        userId: req.user?.userId,
      });
    }

    const response: Record<string, unknown> = {
      success: false,
      error: {
        code: error.code,
        message: error.message,
      },
    };

    if (error.details) {
      response.error = { ...response.error as object, details: error.details };
    }

    res.status(error.statusCode).json(response);
    return;
  }

  // Unexpected / programming errors — log full stack, hide details from client
  logger.error({
    message: 'Unhandled error',
    error: error.message,
    path: req.path,
    method: req.method,
    userId: req.user?.userId,
    stack: error.stack,
  });

  const isProd = env.NODE_ENV === 'production';

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isProd
        ? 'An unexpected error occurred. Please try again later.'
        : error.message,
      ...(isProd ? {} : { stack: error.stack }),
    },
  });
}

/**
 * 404 Not Found handler — register after all routes, before errorHandler
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route ${req.method} ${req.path}`));
}
