import rateLimit from 'express-rate-limit';
import { Request } from 'express';
import { config } from '../config';
import { ApiResponse } from '../types/api.types';

export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,  // Return RateLimit-* headers
  legacyHeaders: false,
  // Correctly extract real IP even behind reverse proxies/load balancers
  keyGenerator: (req: Request): string => {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.ip ??
      'unknown'
    );
  },
  message: (): ApiResponse => ({
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: `Too many requests — please retry after ${Math.ceil(config.rateLimit.windowMs / 1000)}s`,
    },
    meta: {
      requestId: '',
      timestamp: new Date().toISOString(),
    },
  }),
  // Skip rate limiting for health checks (req.path is full path at app-level)
  skip: (req: Request): boolean => req.path.endsWith('/health'),
});
