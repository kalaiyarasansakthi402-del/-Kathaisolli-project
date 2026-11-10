import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;
  const mockPrisma = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('status', () => {
    it('returns the service identity and liveness state', () => {
      expect(appController.getStatus()).toEqual({
        name: 'Kathaisolli API',
        status: 'ok',
      });
    });
  });

  describe('health', () => {
    it('returns basic liveness health metrics without faking database connection', () => {
      const res = appController.getHealth();
      expect(res.status).toBe('ok');
      expect(res.service).toBe('Kathaisolli API');
      expect(typeof res.uptime).toBe('number');
      expect(typeof res.timestamp).toBe('string');
    });
  });

  describe('health/ready', () => {
    it('reports connected database when query succeeds', async () => {
      mockPrisma.$queryRaw.mockResolvedValueOnce([{ '1': 1 }]);
      const res = await appController.getReadiness();
      expect(res.status).toBe('ok');
      expect(res.database).toBe('connected');
    });

    it('reports degraded status when database query fails', async () => {
      mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('Connection refused'));
      const res = await appController.getReadiness();
      expect(res.status).toBe('degraded');
      expect(res.database).toBe('disconnected');
    });
  });
});
