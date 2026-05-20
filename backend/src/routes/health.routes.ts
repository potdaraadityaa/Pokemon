import { Router } from 'express';
import { healthCheck } from '../controllers/health.controller';

const router = Router();

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Service health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: All services healthy
 *       207:
 *         description: Some services degraded
 */
router.get('/', healthCheck);

export default router;
