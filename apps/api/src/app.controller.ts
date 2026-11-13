import { Controller, Get, HttpStatus, Optional, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(@Optional() private readonly prisma?: PrismaService) {}

  @Get()
  getStatus() {
    return {
      name: 'Kathaisolli API',
      status: 'ok',
    };
  }

  @Get('health')
  async getHealth(@Res({ passthrough: true }) res?: Response) {
    const base = {
      service: 'Kathaisolli API',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };

    if (!this.prisma) {
      res?.status(HttpStatus.SERVICE_UNAVAILABLE);
      return {
        ...base,
        status: 'degraded',
        database: {
          isConfigured: Boolean(process.env.DATABASE_URL),
          connected: false,
          status: 'service_unavailable',
        },
      };
    }

    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        ...base,
        status: 'ok',
        database: {
          isConfigured: true,
          connected: true,
          status: 'connected',
          latencyMs: Date.now() - start,
        },
      };
    } catch (error: any) {
      res?.status(HttpStatus.SERVICE_UNAVAILABLE);
      return {
        ...base,
        status: 'degraded',
        database: {
          isConfigured: Boolean(process.env.DATABASE_URL),
          connected: false,
          status: 'disconnected',
          latencyMs: Date.now() - start,
          error:
            process.env.NODE_ENV === 'production'
              ? 'Database unreachable'
              : error?.message || 'Database connection error',
        },
      };
    }
  }

  @Get('health/ready')
  async getReadiness(@Res({ passthrough: true }) res?: Response) {
    if (!this.prisma) {
      res?.status(HttpStatus.SERVICE_UNAVAILABLE);
      return {
        status: 'degraded',
        database: 'service_unavailable',
        timestamp: new Date().toISOString(),
      };
    }
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      res?.status(HttpStatus.SERVICE_UNAVAILABLE);
      return {
        status: 'degraded',
        database: 'disconnected',
        error:
          process.env.NODE_ENV === 'production'
            ? 'Database unreachable'
            : error?.message || 'Database connection error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
