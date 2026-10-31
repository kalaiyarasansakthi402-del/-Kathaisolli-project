import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
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
});
