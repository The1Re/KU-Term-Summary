import { Test, TestingModule } from '@nestjs/testing';
import { TermSummaryService } from '../term-summary.service';
import { TermSummaryUsecase } from '../term-summary.usecase';
import { StudentService } from '@/modules/student/student.service';
import { DatabaseService } from '@/core/database/database.service';
import { NotFoundException } from '@nestjs/common';

describe('TermSummaryService', () => {
  let service: TermSummaryService;
  let studentService: jest.Mocked<StudentService>;
  let db: jest.Mocked<DatabaseService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TermSummaryService,
        TermSummaryUsecase,
        {
          provide: StudentService,
          useValue: { getStudentById: jest.fn() },
        },
        {
          provide: DatabaseService,
          useValue: {
            factTermSummary: { findMany: jest.fn() },
          },
        },
        {
          provide: TermSummaryUsecase,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get(TermSummaryService);
    studentService = module.get(StudentService);
    db = module.get(DatabaseService);
  });

  describe('getAllTermSummaries', () => {
    const studentId = '6520101234';
    const mockStudent = {
      studentId: '6520101234',
      studentUsername: 'testuser',
      studentStatusId: 1,
      coursePlanId: 100,
    };

    it('should throw NotFoundException if student not found', async () => {
      studentService.getStudentById.mockResolvedValue(null);
      await expect(service.getAllTermSummaries(studentId)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should return term summaries if student exists', async () => {
      const mockTermSummaries = [
        { id: 1, studentId, creditAll: 30 },
        { id: 2, studentId, creditAll: 60 },
      ];

      studentService.getStudentById.mockResolvedValue(mockStudent);
      (db.factTermSummary.findMany as jest.Mock).mockResolvedValue(
        mockTermSummaries
      );

      const result = await service.getAllTermSummaries(studentId);

      expect(result).toEqual(mockTermSummaries);
      expect(db.factTermSummary.findMany).toHaveBeenCalledWith({
        where: { studentId },
      });
    });

    it('should return empty array if no term summaries found', async () => {
      studentService.getStudentById.mockResolvedValue(mockStudent);
      (db.factTermSummary.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getAllTermSummaries(studentId);

      expect(result).toEqual([]);
      expect(db.factTermSummary.findMany).toHaveBeenCalledWith({
        where: { studentId },
      });
    });
  });
});
