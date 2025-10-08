import { Test, TestingModule } from '@nestjs/testing';
import { StudentService } from '@/modules/student/student.service';
import { SubjectCourseService } from '@/modules/subject-course/subject-course.service';
import { DatabaseService } from '@/core/database/database.service';
import { FactRegister, FactStdPlan, Prisma, Student } from '@prisma/client';
import { StudentPlanUsecase } from '../student-plan.usecase';
import { StudentPlanService } from '../student-plan.service';
import { RegisterService } from '@/modules/register/register.service';

describe('Student Course Plan Usecase', () => {
  let studentPlanUsecase: StudentPlanUsecase;
  let studentService: jest.Mocked<StudentService>;
  let subjectCourseService: jest.Mocked<SubjectCourseService>;
  let studentPlanService: jest.Mocked<StudentPlanService>;
  let registerService: jest.Mocked<RegisterService>;
  let db: jest.Mocked<DatabaseService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentPlanUsecase,
        {
          provide: StudentService,
          useValue: { getStudentById: jest.fn() },
        },
        {
          provide: SubjectCourseService,
          useValue: { getAllSubjectCoursesByCoursePlanId: jest.fn() },
        },
        {
          provide: StudentPlanService,
          useValue: { getStudentPlanByStudentId: jest.fn() },
        },
        {
          provide: RegisterService,
          useValue: { getAllRegistersByStudentId: jest.fn() },
        },
        {
          provide: DatabaseService,
          useValue: {
            factStdPlan: {
              deleteMany: jest.fn(() => {}),
              createMany: jest.fn(() => {}),
              update: jest.fn(() => {}),
            },
            $transaction: jest.fn(async (ops: unknown[]) => Promise.all(ops)),
          },
        },
      ],
    }).compile();

    studentPlanUsecase = module.get<StudentPlanUsecase>(StudentPlanUsecase);
    studentService = module.get(StudentService);
    subjectCourseService = module.get(SubjectCourseService);
    studentPlanService = module.get(StudentPlanService);
    registerService = module.get(RegisterService);
    db = module.get(DatabaseService);
  });

  describe('Create Student Course Plan', () => {
    const mockStudent: Student = {
      studentId: '6520501234',
      studentUsername: 'testuser',
      studentStatusId: 1,
      coursePlanId: 100,
    };

    it('should throw error if student not found', async () => {
      studentService.getStudentById.mockResolvedValue(null);

      await expect(
        studentPlanUsecase.createStudentPlan('6520501234')
      ).rejects.toThrow('Student not found');
    });

    it('should throw error if subject courses not found', async () => {
      studentService.getStudentById.mockResolvedValue(mockStudent);
      subjectCourseService.getAllSubjectCoursesByCoursePlanId.mockResolvedValue(
        []
      );

      await expect(
        studentPlanUsecase.createStudentPlan('6520501234')
      ).rejects.toThrow('No subject courses found for this course plan');
    });

    it('should create student plan successfully', async () => {
      studentService.getStudentById.mockResolvedValue(mockStudent);

      subjectCourseService.getAllSubjectCoursesByCoursePlanId.mockResolvedValue(
        [
          {
            subjectCourseId: 10,
            coursePlanId: 1,
            subjectId: 1,
            studyYear: 1,
            term: 1,
          },
          {
            subjectCourseId: 11,
            coursePlanId: 1,
            subjectId: 2,
            studyYear: 1,
            term: 1,
          },
        ]
      );

      (db.factStdPlan.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
      (db.factStdPlan.createMany as jest.Mock).mockResolvedValue({ count: 2 });

      const result = await studentPlanUsecase.createStudentPlan('6520501234');

      expect(db.$transaction).toHaveBeenCalled();
      expect(db.$transaction).toHaveBeenCalledTimes(1);
      expect(db.$transaction).toHaveBeenCalledWith(
        [expect.any(Promise), expect.any(Promise)],
        expect.any(Object)
      );
      expect(db.factStdPlan.deleteMany).toHaveBeenCalledWith({
        where: { studentId: '6520501234' },
      });
      expect(db.factStdPlan.createMany).toHaveBeenCalledWith({
        data: [
          {
            studentId: '6520501234',
            subjectCourseId: 10,
            semester: 1,
            semesterPartInYear: 'ภาคต้น',
          },
          {
            studentId: '6520501234',
            subjectCourseId: 11,
            semester: 1,
            semesterPartInYear: 'ภาคต้น',
          },
        ],
      });
      expect(result).toEqual(true);
    });
  });

  describe('Update Student Course Plan', () => {
    const mockStudentPlans: FactStdPlan[] = [
      {
        studentId: '6520501234',
        subjectCourseId: 10,
        gradeLabelId: 1,
        stdPlanId: 1,
        grade: 'A',
        isPass: true,
        note: null,
        semester: 2568,
        semesterPartInYear: 'ภาคต้น',
      },
      {
        studentId: '6520501234',
        subjectCourseId: 11,
        gradeLabelId: 4,
        stdPlanId: 2,
        grade: 'F',
        isPass: false,
        note: null,
        semester: 2568,
        semesterPartInYear: 'ภาคต้น',
      },
      {
        studentId: '6520501234',
        subjectCourseId: 12,
        gradeLabelId: null,
        stdPlanId: 3,
        grade: null,
        isPass: false,
        note: null,
        semester: 2568,
        semesterPartInYear: 'ภาคปลาย',
      },
    ];
    const mockRegisters: FactRegister[] = [
      {
        studentId: '6520501234',
        subjectCourseId: 10,
        regisId: 1,
        creditRequireId: 1,
        creditRegis: 3,
        gradeNumber: 4,
        gradeCharacter: 'A',
        gradeLabelId: 1,
        studyYearInRegis: 1,
        studyTermInRegis: 1,
        semesterYearInRegis: 2568,
        semesterPartInRegis: 'ภาคต้น',
      },
      {
        studentId: '6520501234',
        subjectCourseId: 11,
        regisId: 2,
        creditRequireId: 1,
        creditRegis: 4,
        gradeNumber: 0,
        gradeCharacter: 'F',
        gradeLabelId: 4,
        studyYearInRegis: 1,
        studyTermInRegis: 1,
        semesterYearInRegis: 2568,
        semesterPartInRegis: 'ภาคต้น',
      },
      {
        studentId: '6520501234',
        subjectCourseId: 11,
        regisId: 3,
        creditRequireId: 1,
        creditRegis: 3,
        gradeNumber: 2,
        gradeCharacter: 'C',
        gradeLabelId: 3,
        studyYearInRegis: 1,
        studyTermInRegis: 2,
        semesterYearInRegis: 2568,
        semesterPartInRegis: 'ภาคปลาย',
      },
    ];

    it('if register exists should show previous grade in note', async () => {
      studentPlanService.getStudentPlanByStudentId.mockResolvedValue(
        mockStudentPlans
      );
      registerService.getAllRegistersByStudentId.mockResolvedValue(
        mockRegisters
      );

      const result = await studentPlanUsecase.updateStudentPlan('6520501234');

      expect(db.factStdPlan.update).toHaveBeenCalledTimes(2);
      expect(db.factStdPlan.update).toHaveBeenNthCalledWith(1, {
        where: { studentId: '6520501234', stdPlanId: 1 },
        data: {
          isPass: true,
          grade: 'A',
          note: null,
        },
      } as Prisma.FactStdPlanUpdateArgs);
      expect(db.factStdPlan.update).toHaveBeenNthCalledWith(2, {
        where: { studentId: '6520501234', stdPlanId: 2 },
        data: {
          note: 'F -> C',
          isPass: true,
          grade: 'C',
        },
      } as Prisma.FactStdPlanUpdateArgs);

      expect(result).toEqual(true);
    });

    it('if no register found should not update student plan', async () => {
      studentPlanService.getStudentPlanByStudentId.mockResolvedValue(
        mockStudentPlans
      );
      registerService.getAllRegistersByStudentId.mockResolvedValue([]);

      const result = await studentPlanUsecase.updateStudentPlan('6520501234');

      expect(db.factStdPlan.update).toHaveBeenCalledTimes(0);
      expect(result).toEqual(true);
    });

    it('if no matching subjectCourseId between student plan and register should not update student plan', async () => {
      studentPlanService.getStudentPlanByStudentId.mockResolvedValue([
        {
          studentId: '6520501234',
          subjectCourseId: 99,
          gradeLabelId: 1,
          stdPlanId: 1,
          grade: 'A',
          isPass: true,
          note: null,
          semester: 2568,
          semesterPartInYear: 'ภาคต้น',
        },
      ]);
      registerService.getAllRegistersByStudentId.mockResolvedValue(
        mockRegisters
      );

      const result = await studentPlanUsecase.updateStudentPlan('6520501234');

      expect(db.factStdPlan.update).toHaveBeenCalledTimes(0);
      expect(result).toEqual(true);
    });

    it('should update new grade and isPass if register found', async () => {
      studentPlanService.getStudentPlanByStudentId.mockResolvedValue(
        mockStudentPlans
      );
      registerService.getAllRegistersByStudentId.mockResolvedValue([
        {
          studentId: '6520501234',
          subjectCourseId: 12,
          regisId: 2,
          creditRequireId: 1,
          creditRegis: 4,
          gradeNumber: 3,
          gradeCharacter: 'B',
          gradeLabelId: 2,
          studyYearInRegis: 1,
          studyTermInRegis: 2,
          semesterYearInRegis: 2568,
          semesterPartInRegis: 'ภาคปลาย',
        },
      ]);

      const result = await studentPlanUsecase.updateStudentPlan('6520501234');

      expect(db.factStdPlan.update).toHaveBeenCalledTimes(1);
      expect(db.factStdPlan.update).toHaveBeenNthCalledWith(1, {
        where: { studentId: '6520501234', stdPlanId: 3 },
        data: {
          isPass: true,
          grade: 'B',
          note: null,
        },
      } as Prisma.FactStdPlanUpdateArgs);

      expect(result).toEqual(true);
    });
  });
});
