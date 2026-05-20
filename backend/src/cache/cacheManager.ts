import { LRUCache } from 'lru-cache';
import { config } from '../config';
import { logger } from '../utils/logger';

export type CacheSource = 'redis' | 'memory' | 'none';

export interface CacheEntry<T> {
  data: T;
  cachedAt: number; // epoch ms
  expiresAt: number; // epoch ms
}

export interface ICacheManager {
  get<T>(key: string): Promise<{ value: T; source: CacheSource } | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  flush(): Promise<void>;
  stats(): { size: number; source: CacheSource };
}

// ─── LRU In-Memory Cache ─────────────────────────────────────────────────────

class LruCacheManager implements ICacheManager {
  private readonly lru: LRUCache<string, CacheEntry<unknown>>;

  constructor() {
    this.lru = new LRUCache<string, CacheEntry<unknown>>({
      max: config.cache.maxEntries,
      // LRU ttl in milliseconds — entries auto-expire
      ttl: config.cache.ttlSeconds * 1000,
      updateAgeOnGet: false,
      allowStale: false,
    });
    logger.info(`[Cache] Using in-memory LRU cache (max=${config.cache.maxEntries}, ttl=${config.cache.ttlSeconds}s)`);
  }

  async get<T>(key: string): Promise<{ value: T; source: CacheSource } | null> {
    const entry = this.lru.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    // Double-check manual TTL (belt-and-suspenders)
    if (Date.now() > entry.expiresAt) {
      this.lru.delete(key);
      return null;
    }

    return { value: entry.data, source: 'memory' };
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const ttlMs = (ttlSeconds ?? config.cache.ttlSeconds) * 1000;
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data: value,
      cachedAt: now,
      expiresAt: now + ttlMs,
    };
    this.lru.set(key, entry as CacheEntry<unknown>, { ttl: ttlMs });
  }

  async del(key: string): Promise<void> {
    this.lru.delete(key);
  }

  async flush(): Promise<void> {
    this.lru.clear();
  }

  stats(): { size: number; source: CacheSource } {
    return { size: this.lru.size, source: 'memory' };
  }
}

// ─── Redis Cache Manager ──────────────────────────────────────────────────────

class RedisCacheManager implements ICacheManager {
  // Lazily imported to avoid crashing if redis is not available
  private client: import('redis').RedisClientType | null = null;
  private connected = false;

  async connect(redisUrl: string): Promise<void> {
    try {
      const redis = await import('redis');
      const client = redis.createClient({ url: redisUrl }) as import('redis').RedisClientType;
      client.on('error', (err: Error) => {
        logger.error('[Redis] Client error', { error: err.message });
        this.connected = false;
      });
      client.on('ready', () => {
        logger.info('[Redis] Connected and ready');
        this.connected = true;
      });
      await client.connect();
      this.client = client;
      this.connected = true;
    } catch (err) {
      logger.error('[Redis] Failed to connect — falling back to LRU', { error: (err as Error).message });
      throw err;
    }
  }

  async get<T>(key: string): Promise<{ value: T; source: CacheSource } | null> {
    if (!this.client || !this.connected) return null;
    try {
      const raw = await this.client.get(key);
      if (!raw) return null;
      const value = JSON.parse(raw) as T;
      return { value, source: 'redis' };
    } catch {
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (!this.client || !this.connected) return;
    const ttl = ttlSeconds ?? config.cache.ttlSeconds;
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } catch (err) {
      logger.warn('[Redis] set failed', { key, error: (err as Error).message });
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client || !this.connected) return;
    try {
      await this.client.del(key);
    } catch {
      // swallow
    }
  }

  async flush(): Promise<void> {
    if (!this.client || !this.connected) return;
    try {
      await this.client.flushDb();
    } catch {
      // swallow
    }
  }

  stats(): { size: number; source: CacheSource } {
    return { size: -1, source: 'redis' }; // size not easily available without DBSIZE call
  }

  isConnected(): boolean {
    return this.connected;
  }
}

// ─── Factory — returns Redis if configured, else LRU ─────────────────────────

let _cacheManager: ICacheManager | null = null;

export async function createCacheManager(): Promise<ICacheManager> {
  if (_cacheManager) return _cacheManager;

  if (config.redis.url) {
    const redisManager = new RedisCacheManager();
    try {
      await redisManager.connect(config.redis.url);
      _cacheManager = redisManager;
      logger.info('[Cache] Using Redis cache');
      return _cacheManager;
    } catch {
      logger.warn('[Cache] Redis unavailable — falling back to LRU in-memory cache');
    }
  }

  _cacheManager = new LruCacheManager();
  return _cacheManager;
}

export function getCacheManager(): ICacheManager {
  if (!_cacheManager) {
    throw new Error('CacheManager not initialised. Call createCacheManager() first.');
  }
  return _cacheManager;
}

// ─── Cache Key Builders ───────────────────────────────────────────────────────

export const CacheKeys = {
  pokemon: (name: string) => `pokemon:detail:${name}`,
  species: (name: string) => `pokemon:species:${name}`,
  list: (limit: number, offset: number) => `pokemon:list:${limit}:${offset}`,
  search: (q: string, page: number, limit: number) => `pokemon:search:${q}:${page}:${limit}`,
  random: () => `pokemon:random:pool`,
} as const;
