import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse, ResponseMeta, AppError } from '../types/api.types';

// Attach a request ID to every request
export function attachRequestId(req: Request, res: Response, next: NextFunction): void {
  const requestId = (req.headers['x-request-id'] as string) ?? uuidv4();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
}

// Helper to build a standardised success response
export function successResponse<T>(
  data: T,
  meta?: Partial<ResponseMeta>,
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      requestId: meta?.requestId ?? '',
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

// Normalise a Pokemon name: lowercase, trimmed, replace spaces with dashes
export function normalisePokemonName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '-');
}

// Extract the Pokemon ID from a PokeAPI URL
// e.g. https://pokeapi.co/api/v2/pokemon/1/ → 1
export function idFromUrl(url: string): number {
  const parts = url.replace(/\/$/, '').split('/');
  return parseInt(parts[parts.length - 1] ?? '0', 10);
}

// Generate the official sprite URL for a given Pokemon ID
export function spriteUrlById(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

// Clamp a number to [min, max]
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// Sleep for N milliseconds (useful for retry delays)
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Format uptime seconds into a human-readable string
export function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

/**
 * Retry a function up to `maxAttempts` times with exponential backoff.
 * Only retries on upstream/timeout errors — never on 404/validation/bad-request.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 300,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      // Don't retry on operational errors (404, 400, validation)
      if (
        err instanceof AppError &&
        err.code !== 'UPSTREAM_ERROR' &&
        err.code !== 'TIMEOUT'
      ) {
        throw err;
      }
      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        await sleep(delay);
      }
    }
  }
  throw lastError;
}
