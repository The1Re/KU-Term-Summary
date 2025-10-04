import { Test, TestingModule } from '@nestjs/testing';
import { StudentPlanService } from '../student-plan.service';
import { StudentService } from '@/modules/student/student.service';
import { SubjectCourseService } from '@/modules/subject-course/subject-course.service';
import { DatabaseService } from '@/core/database/database.service';
import { Student } from '@prisma/client';

describe('Student Course Plan Service', () => {
  let studentPlanService: StudentPlanService;
  let studentService: jest.Mocked<StudentService>;
  let subjectCourseService: jest.Mocked<SubjectCourseService>;
  let db: jest.Mocked<DatabaseService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentPlanService,
        {
          provide: StudentService,
          useValue: { getStudentById: jest.fn() },
        },
        {
          provide: SubjectCourseService,
          useValue: { getAllSubjectCoursesByCoursePlanId: jest.fn() },
        },
        {
          provide: DatabaseService,
          useValue: {
            factStdPlan: {
              deleteMany: jest.fn(() => {}),
              createMany: jest.fn(() => {}),
            },
            $transaction: jest.fn(async (ops: unknown[]) => Promise.all(ops)),
          },
        },
      ],
    }).compile();

    studentPlanService = module.get<StudentPlanService>(StudentPlanService);
    studentService = module.get(StudentService);
    subjectCourseService = module.get(SubjectCourseService);
    db = module.get(DatabaseService);
  });

  describe('Create Student Course Plan', () => {
    const mockStudent: Student = {
      studentId: 1,
      studentUsername: 'testuser',
      studentStatusId: 1,
      coursePlanId: 100,
    };

    it('should throw error if student not found', async () => {
      studentService.getStudentById.mockResolvedValue(null);

      await expect(studentPlanService.createStudentPlan(1)).rejects.toThrow(
        'Student not found'
      );
    });

    it('should throw error if subject courses not found', async () => {
      studentService.getStudentById.mockResolvedValue(mockStudent);
      subjectCourseService.getAllSubjectCoursesByCoursePlanId.mockResolvedValue(
        []
      );

      await expect(studentPlanService.createStudentPlan(1)).rejects.toThrow(
        'No subject courses found for this course plan'
      );
    });

    it('should create student plan successfully', async () => {
      studentService.getStudentById.mockResolvedValue(mockStudent);

      subjectCourseService.getAllSubjectCoursesByCoursePlanId.mockResolvedValue(
        [
          { subjectCourseId: 10, coursePlanId: 1, subjectId: 1 },
          { subjectCourseId: 11, coursePlanId: 1, subjectId: 2 },
        ]
      );

      (db.factStdPlan.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
      (db.factStdPlan.createMany as jest.Mock).mockResolvedValue({ count: 2 });

      const result = await studentPlanService.createStudentPlan(1);

      expect(db.$transaction).toHaveBeenCalled();
      expect(db.$transaction).toHaveBeenCalledTimes(1);
      expect(db.$transaction).toHaveBeenCalledWith(
        [expect.any(Promise), expect.any(Promise)],
        expect.any(Object)
      );
      expect(db.factStdPlan.deleteMany).toHaveBeenCalledWith({
        where: { studentId: 1 },
      });
      expect(db.factStdPlan.createMany).toHaveBeenCalledWith({
        data: [
          { studentId: 1, subjectCourseId: 10 },
          { studentId: 1, subjectCourseId: 11 },
        ],
      });
      expect(result).toEqual({ count: 2 });
    });
  });
});
