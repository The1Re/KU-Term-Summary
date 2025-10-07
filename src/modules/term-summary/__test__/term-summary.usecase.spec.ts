import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '@/core/database/database.service';
import { NotFoundException } from '@nestjs/common';
import { TermSummaryUsecase } from '../term-summary.usecase';
import { StudentService } from '@/modules/student/student.service';
import { StudentPlanService } from '@/modules/student-plan/student-plan.service';
import { StudentStatus } from '@/constants/studentStatus';

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
          useValue: {
            factStdPlan: { count: jest.fn() },
            coursePlan: { findUnique: jest.fn() },
            factTermSummary: { findMany: jest.fn() },
          },
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
      studentId: '6520503333',
      studentUsername: 'testuser',
      studentStatusId: 1,
      coursePlanId: 100,
    };

    it('should throw error if student not found', async () => {
      studentService.getStudentById.mockResolvedValue(null);

      await expect(usecase.checkFollowPlan('1', 1, 'ภาคต้น')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw error if student plan not found', async () => {
      studentService.getStudentById.mockResolvedValue(mockStudent);
      studentPlanService.getStudentPlanByStudentId.mockResolvedValue([]);

      await expect(usecase.checkFollowPlan('1', 1, 'ภาคต้น')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should return false if there is any not passed subject', async () => {
      studentService.getStudentById.mockResolvedValue(mockStudent);
      studentPlanService.getStudentPlanByStudentId.mockResolvedValue([
        {
          stdPlanId: 1,
          subjectCourseId: 101,
          studentId: '6520503333',
          gradeLabelId: 1,
          semester: 1,
          grade: 'A',
          semesterPartInYear: 'ภาคต้น',
          isPass: true,
          note: null,
        },
      ]);
      (db.factStdPlan.count as jest.Mock).mockResolvedValue(2); // > 0 not pass

      const result = await usecase.checkFollowPlan('1', 2, 'ภาคปลาย');
      expect(result).toBe(false);
    });

    it('should return true if all subjects passed', async () => {
      studentService.getStudentById.mockResolvedValue(mockStudent);
      studentPlanService.getStudentPlanByStudentId.mockResolvedValue([
        {
          stdPlanId: 1,
          subjectCourseId: 101,
          studentId: '6520503333',
          gradeLabelId: 1,
          semester: 1,
          grade: 'A',
          semesterPartInYear: 'ภาคต้น',
          isPass: true,
          note: null,
        },
      ]);
      (db.factStdPlan.count as jest.Mock).mockResolvedValue(0); // no not pass

      const result = await usecase.checkFollowPlan('1', 2, 'ภาคปลาย');
      expect(result).toBe(true);
    });

    it('should map term "ภาคฤดูร้อน" to ["ภาคต้น", "ภาคปลาย"] in query', async () => {
      studentService.getStudentById.mockResolvedValue(mockStudent);
      studentPlanService.getStudentPlanByStudentId.mockResolvedValue([
        {
          stdPlanId: 1,
          subjectCourseId: 101,
          studentId: '6520503333',
          semester: 1,
          gradeLabelId: 1,
          grade: 'A',
          isPass: true,
          semesterPartInYear: 'ภาคต้น',
          note: null,
        },
      ]);

      (db.factStdPlan.count as jest.Mock).mockResolvedValue(0);

      await usecase.checkFollowPlan('1', 2, 'ภาคฤดูร้อน');

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

  describe('Check Student Status', () => {
    const mockStudent = {
      studentId: 1,
      studentUsername: 'testuser',
      studentStatusId: 1,
      coursePlanId: 100,
    };

    const mockCoursePlan = {
      coursePlanId: 1,
      courseId: 1,
      planCourse: 'แผนสหกิจศึกษา',
      totalCredit: 134,
      generalSubjectCredit: 30,
      specificSubjectCredit: 98,
      freeSubjectCredit: 6,
      coreSubjectCredit: 30,
      spacailSubjectCredit: 49,
      selectSubjectCredit: 19,
      happySubjectCredit: 3,
      entrepreneurshipSubjectCredit: 6,
      languageSubjectCredit: 13,
      peopleSubjectCredit: 5,
      aestheticsSubjectCredit: 3,
      internshipHours: 240,
    };

    beforeEach(() => {
      (studentService.getStudentById as jest.Mock).mockResolvedValue(
        mockStudent
      );
      (
        studentPlanService.getStudentPlanByStudentId as jest.Mock
      ).mockResolvedValue([]);
    });

    it('should throw NotFoundException if student not found', async () => {
      (studentService.getStudentById as jest.Mock).mockResolvedValueOnce(null);

      await expect(
        usecase.checkStudentStatus('1', 1, 'ภาคต้น')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if course plan not found', async () => {
      (db.coursePlan.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        usecase.checkStudentStatus('1', 1, 'ภาคต้น')
      ).rejects.toThrow(NotFoundException);
    });

    it('should return STUDYING immediately if semesterPartInYear is ภาคฤดูร้อน', async () => {
      const result = await usecase.checkStudentStatus('1', 1, 'ภาคฤดูร้อน');
      expect(result).toBe(StudentStatus.STUDYING);
    });

    it('should return "พ้นสภาพนิสิต" for gpax < 1.5', async () => {
      (db.coursePlan.findUnique as jest.Mock).mockResolvedValue(mockCoursePlan);
      (db.factTermSummary.findMany as jest.Mock).mockResolvedValue([
        { gpax: 1.4, creditAll: 100, studyYear: 2, studyTerm: 1 },
        { gpax: 2.0, creditAll: 20, studyYear: 1, studyTerm: 2 },
      ]);

      jest.spyOn(usecase, 'checkFollowPlan').mockResolvedValue(false);

      const result = await usecase.checkStudentStatus('1', 1, 'ภาคต้น');
      expect(result).toBe(StudentStatus.TERMINATION);
    });

    it('should return "พ้นสภาพนิสิต" for gpax < 1.75 two terms', async () => {
      (studentService.getStudentById as jest.Mock).mockResolvedValue({
        ...mockStudent,
        coursePlanId: 1,
      });
      (db.coursePlan.findUnique as jest.Mock).mockResolvedValue({
        totalCredit: 120,
      });
      (db.factTermSummary.findMany as jest.Mock).mockResolvedValue([
        { gpax: 1.7, creditAll: 100, studyYear: 2, studyTerm: 1 },
        { gpax: 1.6, creditAll: 20, studyYear: 1, studyTerm: 2 },
      ]);

      const result = await usecase.checkStudentStatus('1', 1, 'ภาคต้น');
      expect(result).toBe(StudentStatus.TERMINATION);
    });

    it('should return "กำลังศึกษา" if lastTerm is year 1 and term 1', async () => {
      (studentService.getStudentById as jest.Mock).mockResolvedValue({
        ...mockStudent,
        coursePlanId: 1,
      });
      (db.coursePlan.findUnique as jest.Mock).mockResolvedValue({
        totalCredit: 120,
      });
      (db.factTermSummary.findMany as jest.Mock).mockResolvedValue([
        { gpax: 1.4, creditAll: 100, studyYear: 1, studyTerm: 1 },
      ]);

      const result = await usecase.checkStudentStatus('1', 1, 'ภาคต้น');
      expect(result).toBe(StudentStatus.STUDYING);
    });

    it('should return "กำลังศึกษา" for gpax < 1.75 but previousTerm is year 1 term 1', async () => {
      (studentService.getStudentById as jest.Mock).mockResolvedValue({
        ...mockStudent,
        coursePlanId: 1,
      });
      (db.coursePlan.findUnique as jest.Mock).mockResolvedValue({
        totalCredit: 120,
      });
      (db.factTermSummary.findMany as jest.Mock).mockResolvedValue([
        { gpax: 1.7, creditAll: 100, studyYear: 1, studyTerm: 2 },
        { gpax: 1.6, creditAll: 20, studyYear: 1, studyTerm: 1 },
      ]);

      const result = await usecase.checkStudentStatus('1', 1, 'ภาคต้น');
      expect(result).toBe(StudentStatus.STUDYING);
    });

    it('should return "สำเร็จการศึกษา" if creditAll >= totalCredit and follows plan', async () => {
      (db.coursePlan.findUnique as jest.Mock).mockResolvedValue(mockCoursePlan);
      (db.factTermSummary.findMany as jest.Mock).mockResolvedValue([
        { gpax: 3.0, creditAll: 134, studyYear: 4, studyTerm: 2 },
      ]);
      jest.spyOn(usecase, 'checkFollowPlan').mockResolvedValue(true);

      const result = await usecase.checkStudentStatus('1', 1, 'ภาคต้น');
      expect(result).toBe(StudentStatus.GRADUATED);
    });

    it('should return "กำลังศึกษา" if not follow plan or creditAll < totalCredit', async () => {
      (db.coursePlan.findUnique as jest.Mock).mockResolvedValue(mockCoursePlan);
      (db.factTermSummary.findMany as jest.Mock).mockResolvedValue([
        { gpax: 3.0, creditAll: 134, studyYear: 4, studyTerm: 2 },
      ]);
      jest.spyOn(usecase, 'checkFollowPlan').mockResolvedValue(false);

      const result = await usecase.checkStudentStatus('1', 1, 'ภาคต้น');
      expect(result).toBe(StudentStatus.STUDYING);
    });
  });
});

describe('checkIsEligibleForCoop', () => {
  let usecase: TermSummaryUsecase;
  let studentService: jest.Mocked<StudentService>;
  let db: jest.Mocked<DatabaseService>;

  const mockStudent = {
    studentId: '6520503333',
    studentUsername: 'testuser',
    studentStatusId: 1,
    coursePlanId: 100,
  };

  const mockCoursePlan = { totalCredit: 120, creditIntern: 60 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TermSummaryUsecase,
        {
          provide: StudentService,
          useValue: { getStudentById: jest.fn() },
        },
        {
          provide: DatabaseService,
          useValue: {
            coursePlan: { findUnique: jest.fn() },
            factTermSummary: { findFirst: jest.fn() },
            factStdPlan: { count: jest.fn() },
          },
        },
        {
          provide: StudentPlanService,
          useValue: { getStudentPlanByStudentId: jest.fn() },
        },
      ],
    }).compile();

    usecase = module.get<TermSummaryUsecase>(TermSummaryUsecase);
    studentService = module.get(StudentService);
    db = module.get(DatabaseService);
  });

  it('should throw NotFoundException if student not found', async () => {
    studentService.getStudentById.mockResolvedValue(null);
    await expect(usecase.checkIsEligibleForCoop('1')).rejects.toThrow(
      NotFoundException
    );
  });

  it('should throw NotFoundException if course plan not found', async () => {
    studentService.getStudentById.mockResolvedValue(mockStudent);
    (db.coursePlan.findUnique as jest.Mock).mockResolvedValue(null);
    await expect(usecase.checkIsEligibleForCoop('1')).rejects.toThrow(
      NotFoundException
    );
  });

  it('should throw NotFoundException if term summary not found', async () => {
    studentService.getStudentById.mockResolvedValue(mockStudent);
    (db.coursePlan.findUnique as jest.Mock).mockResolvedValue(mockCoursePlan);
    (db.factTermSummary.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(usecase.checkIsEligibleForCoop('1')).rejects.toThrow(
      NotFoundException
    );
  });

  it('should return false if creditAll < creditInten', async () => {
    studentService.getStudentById.mockResolvedValue(mockStudent);
    (db.coursePlan.findUnique as jest.Mock).mockResolvedValue(mockCoursePlan);
    (db.factTermSummary.findFirst as jest.Mock).mockResolvedValue({
      creditAll: 50,
      semesterYearInTerm: 1,
      semesterPartInTerm: 'ภาคต้น',
      creditIntern: 60,
    });

    const result = await usecase.checkIsEligibleForCoop('1');
    expect(result).toBe(false);
  });

  it('should return true if creditAll >= creditInten and follow plan', async () => {
    studentService.getStudentById.mockResolvedValue(mockStudent);
    (db.coursePlan.findUnique as jest.Mock).mockResolvedValue(mockCoursePlan);
    (db.factTermSummary.findFirst as jest.Mock).mockResolvedValue({
      creditAll: 80,
      semesterYearInTerm: 2,
      semesterPartInTerm: 'ภาคปลาย',
      creditIntern: 60,
    });
    jest.spyOn(usecase, 'checkFollowPlan').mockResolvedValue(true);

    const result = await usecase.checkIsEligibleForCoop('1');
    expect(result).toBe(true);
  });

  it('should return false if follow plan is false', async () => {
    studentService.getStudentById.mockResolvedValue(mockStudent);
    (db.coursePlan.findUnique as jest.Mock).mockResolvedValue(mockCoursePlan);
    (db.factTermSummary.findFirst as jest.Mock).mockResolvedValue({
      creditAll: 100,
      semesterYearInTerm: 2,
      semesterPartInTerm: 'ภาคปลาย',
    });
    jest.spyOn(usecase, 'checkFollowPlan').mockResolvedValue(false);

    const result = await usecase.checkIsEligibleForCoop('1');
    expect(result).toBe(false);
  });
});
