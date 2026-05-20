import { Request, Response, NextFunction } from 'express';
import os from 'os';
import { getCacheManager } from '../cache/cacheManager';
import { successResponse, formatUptime } from '../utils/helpers';
import { HealthStatus, ServiceHealth } from '../types/api.types';
import { pokeApiClient } from '../utils/pokeApiClient';
import { logger } from '../utils/logger';

/**
 * GET /api/health
 */
export async function healthCheck(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const checks: Record<string, ServiceHealth> = {};

    // 1) PokeAPI reachability
    const apiStart = Date.now();
    try {
      await pokeApiClient.get('/pokemon/1');
      checks['pokeapi'] = { status: 'up', latency: Date.now() - apiStart };
    } catch {
      checks['pokeapi'] = { status: 'down', latency: Date.now() - apiStart, message: 'Unreachable' };
    }

    // 2) Cache
    try {
      const cm = getCacheManager();
      const stats = cm.stats();
      checks['cache'] = {
        status: 'up',
        message: `${stats.source} (${stats.size >= 0 ? stats.size + ' entries' : 'size N/A'})`,
      };
    } catch {
      checks['cache'] = { status: 'down', message: 'Not initialised' };
    }

    // 3) Memory
    const memUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    checks['memory'] = {
      status: 'up',
      message: `Heap ${heapUsedMB}MB | OS free ${Math.round(freeMem / 1024 / 1024)}/${Math.round(totalMem / 1024 / 1024)}MB`,
    };

    const allUp = Object.values(checks).every((c) => c.status === 'up');
    const anyDown = Object.values(checks).some((c) => c.status === 'down');
    const overallStatus: HealthStatus['status'] = anyDown ? 'degraded' : allUp ? 'healthy' : 'degraded';

    const health: HealthStatus = {
      status: overallStatus,
      version: process.env['npm_package_version'] ?? '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks,
    };

    const httpStatus = overallStatus === 'healthy' ? 200 : 207;
    res.status(httpStatus).json(
      successResponse(health, {
        requestId: req.headers['x-request-id'] as string,
      }),
    );
  } catch (err) {
    next(err);
  }
}
