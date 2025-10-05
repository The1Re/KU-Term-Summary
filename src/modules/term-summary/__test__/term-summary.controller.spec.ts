import { Test, TestingModule } from '@nestjs/testing';
import { TermSummaryController } from '../term-summary.controller';
import { TermSummaryService } from '../term-summary.service';
import { NotFoundException } from '@nestjs/common';
import { StudentService } from '@/modules/student/student.service';
import { Student } from '@prisma/client';

describe('TermSummaryController', () => {
  let termSummaryController: TermSummaryController;
  let termSummaryService: jest.Mocked<TermSummaryService>;
  let studentService: jest.Mocked<StudentService>;

  beforeEach(async () => {
    const serviceMock: Partial<jest.Mocked<TermSummaryService>> = {
      getAllTermSummaries: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TermSummaryController],
      providers: [
        { provide: TermSummaryService, useValue: serviceMock },
        { provide: StudentService, useValue: { getStudentById: jest.fn() } },
      ],
    }).compile();

    termSummaryController = module.get<TermSummaryController>(
      TermSummaryController
    );
    termSummaryService = module.get(TermSummaryService);
    studentService = module.get(StudentService);
  });

  describe('getAllTermSummaries', () => {
    const student: Student = {
      studentId: '6520501234',
      studentUsername: 'testuser',
      coursePlanId: 1,
      studentStatusId: 1,
    };

    it('should return term summaries for a valid student', async () => {
      const mockTermSummaries = [
        {
          term: 1,
          year: 2568,
          totalCredits: 15,
          gpa: 3.5,
        },
      ];
      (termSummaryService.getAllTermSummaries as jest.Mock).mockResolvedValue(
        mockTermSummaries
      );
      studentService.getStudentById.mockResolvedValue(student);
      const result = await termSummaryController.getAllTermSummaries(
        student.studentId
      );
      expect(result).toEqual(mockTermSummaries);
      expect(termSummaryService.getAllTermSummaries).toHaveBeenCalledWith(
        student.studentId
      );
    });

    it('should throw NotFoundException if student does not exist', async () => {
      studentService.getStudentById.mockResolvedValue(null);

      await expect(
        termSummaryController.getAllTermSummaries(student.studentId)
      ).rejects.toThrow(NotFoundException);
      expect(studentService.getStudentById).toHaveBeenCalledWith(
        student.studentId
      );
      expect(termSummaryService.getAllTermSummaries).not.toHaveBeenCalled();
    });
  });
});
