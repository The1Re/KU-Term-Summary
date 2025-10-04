import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../app.controller';

describe('App Controller', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Welcome to KU Term Summary API Service"', () => {
      expect(appController.root()).toMatchObject({
        message: 'Welcome to KU Term Summary API Service',
      });
    });
  });
});
