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
    if (currentConnectTimeout < 30) {
      parsed.searchParams.set('connect_timeout', '30');
    }
    const currentPoolTimeout = parseInt(parsed.searchParams.get('pool_timeout') || '0', 10);
    if (currentPoolTimeout < 30) {
      parsed.searchParams.set('pool_timeout', '30');
    }
    if (!parsed.searchParams.has('connection_limit')) {
      parsed.searchParams.set('connection_limit', '1');
    }
    // Neon pooled connection (PgBouncer) requires pgbouncer=true to prevent prepared statement errors in Prisma
    if (parsed.hostname.includes('-pooler') && !parsed.searchParams.has('pgbouncer')) {
      parsed.searchParams.set('pgbouncer', 'true');
    }
    // Ensure sslmode=require for Neon PostgreSQL
    if (!parsed.searchParams.has('sslmode')) {
      parsed.searchParams.set('sslmode', 'require');
    }
    return parsed.toString();
  } catch {
    return unquoted;
  }
}

export function resolveDatabaseUrl(): string | undefined {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.NEON_DATABASE_URL,
    process.env.DIRECT_URL,
    process.env.DATABASE_URL_UNPOOLED,
    process.env.POSTGRES_URL_NON_POOLING,
  ];

  for (const candidate of candidates) {
    const sanitized = sanitizeDatabaseUrl(candidate);
    if (sanitized) return sanitized;
  }

  return undefined;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const resolvedUrl = resolveDatabaseUrl();
    if (resolvedUrl && resolvedUrl !== process.env.DATABASE_URL) {
      process.env.DATABASE_URL = resolvedUrl;
    }
    super(
      resolvedUrl
        ? { datasources: { db: { url: resolvedUrl } } }
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
