import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';

import { config } from './config';
import { swaggerSpec } from './config/swagger';
import { attachRequestId } from './utils/helpers';
import { requestLogger } from './middleware/requestLogger';
import { rateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';

import pokemonRoutes from './routes/pokemon.routes';
import healthRoutes from './routes/health.routes';

export function createApp(): Application {
  const app = express();

  // Trust proxy — required for correct IP detection behind Nginx/load balancers
  // and for express-rate-limit to work correctly
  app.set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(
    cors({
      origin: config.cors.origins,
      methods: ['GET', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
      credentials: false,
    }),
  );
  app.use(compression());

  // ── Body Parsing ──────────────────────────────────────────────────────────
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // ── Request ID & Logging ──────────────────────────────────────────────────
  app.use(attachRequestId);
  app.use(requestLogger);

  // ── Rate Limiting ─────────────────────────────────────────────────────────
  app.use(rateLimiter);

  // ── Swagger UI ────────────────────────────────────────────────────────────
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: 'Pokemon Pokedex API Docs',
      customCss: '.swagger-ui .topbar { background: #cc0000; }',
      swaggerOptions: {
        persistAuthorization: true,
      },
    }),
  );

  // Expose the raw spec for tooling
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // ── API Routes ────────────────────────────────────────────────────────────
  const prefix = config.apiPrefix;
  app.use(`${prefix}/health`, healthRoutes);
  app.use(`${prefix}/pokemon`, pokemonRoutes);

  // ── 404 & Error handlers ──────────────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
