import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '@/core/database/database.service';
import { NotFoundException } from '@nestjs/common';
import { TermSummaryUsecase } from '../term-summary.usecase';
import { StudentService } from '@/modules/student/student.service';
import { StudentPlanService } from '@/modules/student-plan/student-plan.service';

describe('TermSummaryUsecase', () => {
  let usecase: TermSummaryUsecase;
  let studentService: jest.Mocked<StudentService>;
  let studentPlanService: jest.Mocked<StudentPlanService>;
  let db: jest.Mocked<DatabaseService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TermSummaryUsecase,
        {
          provide: StudentService,
          useValue: { getStudentById: jest.fn() },
        },
        {
          provide: StudentPlanService,
          useValue: { getStudentPlanByStudentId: jest.fn() },
        },
        {
          provide: DatabaseService,
          useValue: { factStdPlan: { count: jest.fn() } },
        },
      ],
    }).compile();

    usecase = module.get<TermSummaryUsecase>(TermSummaryUsecase);
    studentService = module.get(StudentService);
    studentPlanService = module.get(StudentPlanService);
    db = module.get(DatabaseService);
  });

  describe('Check is Follow Plan', () => {
    const mockStudent = {
      studentId: 1,
      studentUsername: 'testuser',
      studentStatusId: 1,
      coursePlanId: 100,
    };

    it('should throw error if student not found', async () => {
      studentService.getStudentById.mockResolvedValue(null);

      await expect(usecase.checkFollowPlan(1, 1, 'ภาคต้น')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw error if student plan not found', async () => {
      studentService.getStudentById.mockResolvedValue(mockStudent);
      studentPlanService.getStudentPlanByStudentId.mockResolvedValue([]);

      await expect(usecase.checkFollowPlan(1, 1, 'ภาคต้น')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should return false if there is any not passed subject', async () => {
      studentService.getStudentById.mockResolvedValue(mockStudent);
      studentPlanService.getStudentPlanByStudentId.mockResolvedValue([
        {
          stdPlanId: 1,
          subjectCourseId: 101,
          studentId: 1,
          gradeLabelId: 1,
          semester: 1,
          grade: 'A',
          semesterPartInYear: 'ภาคต้น',
          isPass: true,
          note: null,
        },
      ]);
      (db.factStdPlan.count as jest.Mock).mockResolvedValue(2); // > 0 not pass

      const result = await usecase.checkFollowPlan(1, 2, 'ภาคปลาย');
      expect(result).toBe(false);
    });

    it('should return true if all subjects passed', async () => {
      studentService.getStudentById.mockResolvedValue(mockStudent);
      studentPlanService.getStudentPlanByStudentId.mockResolvedValue([
        {
          stdPlanId: 1,
          subjectCourseId: 101,
          studentId: 1,
          gradeLabelId: 1,
          semester: 1,
          grade: 'A',
          semesterPartInYear: 'ภาคต้น',
          isPass: true,
          note: null,
        },
      ]);
      (db.factStdPlan.count as jest.Mock).mockResolvedValue(0); // no not pass

      const result = await usecase.checkFollowPlan(1, 2, 'ภาคปลาย');
      expect(result).toBe(true);
    });

    it('should map term "ภาคฤดูร้อน" to ["ภาคต้น", "ภาคปลาย"] in query', async () => {
      studentService.getStudentById.mockResolvedValue(mockStudent);
      studentPlanService.getStudentPlanByStudentId.mockResolvedValue([
        {
          stdPlanId: 1,
          subjectCourseId: 101,
          studentId: 1,
          semester: 1,
          gradeLabelId: 1,
          grade: 'A',
          isPass: true,
          semesterPartInYear: 'ภาคต้น',
          note: null,
        },
      ]);

      (db.factStdPlan.count as jest.Mock).mockResolvedValue(0);

      await usecase.checkFollowPlan(1, 2, 'ภาคฤดูร้อน');

      expect(db.factStdPlan.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                semesterPartInYear: { in: ['ภาคต้น', 'ภาคปลาย'] },
              }),
            ]),
          }),
        })
      );
    });
  });
});
