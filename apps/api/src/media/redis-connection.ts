import { ConfigService } from '@nestjs/config';

export function getRedisConnectionOptions(config: ConfigService) {
  const redisUrl = new URL(config.getOrThrow<string>('REDIS_URL'));
  if (redisUrl.protocol !== 'redis:' && redisUrl.protocol !== 'rediss:') {
    throw new Error('REDIS_URL must use the redis: or rediss: scheme.');
  }
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
