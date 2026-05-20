import { createApp } from './app';
import { config } from './config';
import { createCacheManager } from './cache/cacheManager';
import { logger } from './utils/logger';

async function bootstrap(): Promise<void> {
  // 1) Initialise cache (Redis or LRU)
  await createCacheManager();

  // 2) Create Express app
  const app = createApp();

  // 3) Start listening
  const server = app.listen(config.port, () => {
    logger.info('═══════════════════════════════════════════════');
    logger.info(`  🔴  Pokemon Pokedex API`);
    logger.info(`  ✅  Running on http://localhost:${config.port}`);
    logger.info(`  📘  Docs    → http://localhost:${config.port}/api-docs`);
    logger.info(`  ❤️   Health  → http://localhost:${config.port}/api/health`);
    logger.info(`  🌍  Env     → ${config.env}`);
    logger.info('═══════════════════════════════════════════════');
  });

  // Graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`[Server] ${signal} received — shutting down gracefully`);
    server.close(() => {
      logger.info('[Server] HTTP server closed');
      process.exit(0);
    });

    // Force exit after 10s
    setTimeout(() => {
      logger.error('[Server] Forced exit after 10s timeout');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error('[Server] Unhandled rejection', { reason });
  });

  process.on('uncaughtException', (err) => {
    logger.error('[Server] Uncaught exception', { error: err.message, stack: err.stack });
    process.exit(1);
  });
}

bootstrap().catch((err: Error) => {
  console.error('Fatal error during bootstrap:', err.message);
  process.exit(1);
});
