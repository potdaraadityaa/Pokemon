import dotenv from 'dotenv';
import path from 'path';

// Resolve .env from the project root (works in both ts-node dev and compiled dist/)
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function parseIntEnv(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  if (isNaN(parsed)) throw new Error(`Environment variable ${key} must be an integer`);
  return parsed;
}

export const config = {
  env: requireEnv('NODE_ENV', 'development') as 'development' | 'production' | 'test',
  port: parseIntEnv('PORT', 3000),
  apiPrefix: requireEnv('API_PREFIX', '/api'),

  cors: {
    origins: requireEnv('CORS_ORIGIN', 'http://localhost:5173')
      .split(',')
      .map((o) => o.trim()),
  },

  pokeApi: {
    baseUrl: requireEnv('POKEAPI_BASE_URL', 'https://pokeapi.co/api/v2'),
    timeout: parseIntEnv('POKEAPI_TIMEOUT', 10000),
  },

  cache: {
    maxEntries: parseIntEnv('CACHE_MAX_ENTRIES', 500),
    ttlSeconds: parseIntEnv('CACHE_TTL_SECONDS', 3600),
  },

  redis: {
    url: process.env['REDIS_URL'] ?? '',
  },

  rateLimit: {
    windowMs: parseIntEnv('RATE_LIMIT_WINDOW_MS', 60000),
    max: parseIntEnv('RATE_LIMIT_MAX', 100),
  },

  logging: {
    level: requireEnv('LOG_LEVEL', 'debug'),
  },
} as const;

export type Config = typeof config;
