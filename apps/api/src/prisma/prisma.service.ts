import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export function sanitizeDatabaseUrl(rawUrl?: string): string | undefined {
  const trimmed = rawUrl?.trim();
  if (!trimmed) return undefined;

  const unquoted =
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
      ? trimmed.slice(1, -1)
      : trimmed;

  if (
    !unquoted.startsWith('postgres://') &&
    !unquoted.startsWith('postgresql://')
  ) {
    return undefined;
  }

  try {
    const parsed = new URL(unquoted);
    // Prisma's Rust engine does not support channel_binding=require reliably on Neon
    parsed.searchParams.delete('channel_binding');
    const currentConnectTimeout = parseInt(parsed.searchParams.get('connect_timeout') || '0', 10);
    if (currentConnectTimeout < 60) {
      parsed.searchParams.set('connect_timeout', '60');
    }
    const currentPoolTimeout = parseInt(parsed.searchParams.get('pool_timeout') || '0', 10);
    if (currentPoolTimeout < 60) {
      parsed.searchParams.set('pool_timeout', '60');
    }
    if (!parsed.searchParams.has('connection_limit')) {
      parsed.searchParams.set('connection_limit', '1');
    }
    return parsed.toString();
  } catch {
    return unquoted;
  }
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const sanitizedUrl = sanitizeDatabaseUrl(process.env.DATABASE_URL);
    if (sanitizedUrl && sanitizedUrl !== process.env.DATABASE_URL) {
      process.env.DATABASE_URL = sanitizedUrl;
    }
    super(
      sanitizedUrl
        ? { datasources: { db: { url: sanitizedUrl } } }
        : undefined,
    );
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma connected to PostgreSQL database successfully.');
    } catch (error) {
      this.logger.warn(
        '[PrismaService] Database connection deferred during startup (non-fatal for serverless cold start):',
        error,
      );
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch {
      // Ignore disconnect errors during teardown
    }
  }
}
