import { ConfigService } from '@nestjs/config';

export function getRedisConnectionOptions(config: ConfigService) {
  const rawUrl = config.get<string>('REDIS_URL');
  if (rawUrl) {
    try {
      const redisUrl = new URL(rawUrl);
      if (redisUrl.protocol === 'redis:' || redisUrl.protocol === 'rediss:') {
        return {
          host: redisUrl.hostname,
          port: Number(redisUrl.port || 6379),
          username: redisUrl.username
            ? decodeURIComponent(redisUrl.username)
            : undefined,
          password: redisUrl.password
            ? decodeURIComponent(redisUrl.password)
            : undefined,
          tls: redisUrl.protocol === 'rediss:' ? {} : undefined,
          maxRetriesPerRequest: null,
        };
      }
    } catch {
      // Fallback below
    }
  }

  // Safe fallback to prevent startup/build type crashes
  return {
    host: 'localhost',
    port: 6379,
    maxRetriesPerRequest: null,
  };
}
