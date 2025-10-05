import { Test, TestingModule } from '@nestjs/testing';
import { StatusStudentService } from './status-student.service';

describe('StatusStudentService', () => {
  let service: StatusStudentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StatusStudentService],
    }).compile();

    service = module.get<StatusStudentService>(StatusStudentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
