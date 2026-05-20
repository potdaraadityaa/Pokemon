import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types/api.types';

export function notFoundHandler(req: Request, res: Response, _next: NextFunction): void {
  const body: ApiResponse = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
    meta: {
      requestId: req.headers['x-request-id'] as string ?? '',
      timestamp: new Date().toISOString(),
    },
  };
  res.status(404).json(body);
}
