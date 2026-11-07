import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { getRedisConnectionOptions } from '../media/redis-connection';

@Injectable()
export class CatalogCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CatalogCacheService.name);
  private redis: Redis | null = null;
  private readonly memoryCache = new Map<string, { value: any; expiresAt: number }>();
  private isRedisHealthy = false;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    try {
      const redisUrl = this.config.get<string>('REDIS_URL');
      const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
      const isLocalhostRedis = redisUrl?.includes('localhost') || redisUrl?.includes('127.0.0.1');

      if (
        redisUrl &&
        (redisUrl.startsWith('redis://') || redisUrl.startsWith('rediss://')) &&
        !(isServerless && isLocalhostRedis)
      ) {
        const opts = getRedisConnectionOptions(this.config);
        this.redis = new Redis({
          ...opts,
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          retryStrategy: (times) => (times > 2 ? null : Math.min(times * 100, 1000)),
        });

        this.redis.on('connect', () => {
          this.isRedisHealthy = true;
          this.logger.log('Redis connected for catalog caching.');
        });

        this.redis.on('error', (err) => {
          this.isRedisHealthy = false;
          this.logger.warn(`[CatalogCacheService] Redis error (non-fatal): ${err.message}`);
        });

        this.redis.connect().catch((err) => {
          this.isRedisHealthy = false;
          this.logger.warn(`[CatalogCacheService] Redis connect error (non-fatal): ${err.message}`);
        });
      }
    } catch {
      this.isRedisHealthy = false;
    }
  }

  onModuleDestroy() {
    if (this.redis) {
      this.redis.disconnect();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    // 1. Try Redis if healthy
    if (this.redis && this.isRedisHealthy) {
      try {
        const raw = await this.redis.get(`kathaisolli:${key}`);
        if (raw) return JSON.parse(raw);
      } catch {
        this.isRedisHealthy = false;
      }
    }

    // 2. Memory cache fallback
    const item = this.memoryCache.get(key);
    if (item) {
      if (Date.now() < item.expiresAt) {
        return item.value as T;
      }
      this.memoryCache.delete(key);
    }

    return null;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    this.memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });

    if (this.memoryCache.size > 500) {
      const now = Date.now();
      for (const [k, v] of this.memoryCache.entries()) {
        if (now > v.expiresAt) this.memoryCache.delete(k);
      }
    }

    if (this.redis && this.isRedisHealthy) {
      try {
        await this.redis.set(
          `kathaisolli:${key}`,
          JSON.stringify(value),
          'EX',
          ttlSeconds,
        );
      } catch {
        this.isRedisHealthy = false;
      }
    }
  }

  async del(key: string): Promise<void> {
    this.memoryCache.delete(key);
    if (this.redis && this.isRedisHealthy) {
      try {
        await this.redis.del(`kathaisolli:${key}`);
      } catch {
        this.isRedisHealthy = false;
      }
    }
  }

  async invalidateCatalog(): Promise<void> {
    this.memoryCache.clear();
    if (this.redis && this.isRedisHealthy) {
      try {
        const keys = await this.redis.keys('kathaisolli:catalog:*');
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } catch {
        this.isRedisHealthy = false;
      }
    }
  }
}
