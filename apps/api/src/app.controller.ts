import { Controller, Get, Optional } from '@nestjs/common';
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
  getHealth() {
    return {
      status: 'ok',
      service: 'Kathaisolli API',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health/ready')
  async getReadiness() {
    if (!this.prisma) {
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
