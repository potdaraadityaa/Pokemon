import { Request, Response, NextFunction } from 'express';
import { AppError, ApiResponse } from '../types/api.types';
import { logger } from '../utils/logger';
import { config } from '../config';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  const requestId = req.headers['x-request-id'] as string | undefined;

  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error('[ErrorHandler] Non-operational AppError', {
        requestId,
        message: err.message,
        stack: err.stack,
      });
    } else {
      logger.warn('[ErrorHandler] Operational error', {
        requestId,
        code: err.code,
        statusCode: err.statusCode,
        message: err.message,
      });
    }

    const body: ApiResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
      meta: {
        requestId: requestId ?? '',
        timestamp: new Date().toISOString(),
      },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  // Unknown / unhandled error
  logger.error('[ErrorHandler] Unexpected error', {
    requestId,
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });

  const body: ApiResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message:
        config.env === 'production'
          ? 'An unexpected error occurred'
          : err instanceof Error
          ? err.message
          : String(err),
    },
    meta: {
      requestId: requestId ?? '',
      timestamp: new Date().toISOString(),
    },
  };
  res.status(500).json(body);
}
