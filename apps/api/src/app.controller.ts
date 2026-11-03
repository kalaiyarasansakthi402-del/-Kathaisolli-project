import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
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
}
