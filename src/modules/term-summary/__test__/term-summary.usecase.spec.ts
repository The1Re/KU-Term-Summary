import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '@/core/database/database.service';
import { TermSummaryUsecase } from '../term-summary.usecase';
import { StudentService } from '@/modules/student/student.service';
import { StudentPlanService } from '@/modules/student-plan/student-plan.service';
import { RegisterService } from '@/modules/register/register.service';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { StudentStatus } from '@/constants/studentStatus';
import { FactRegister } from '@prisma/client';

describe('TermSummaryUsecase', () => {
  let termSummaryUsecase: TermSummaryUsecase;
  let studentService: jest.Mocked<StudentService>;
  let studentPlanService: jest.Mocked<StudentPlanService>;
  let registerService: jest.Mocked<RegisterService>;
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
          provide: RegisterService,
          useValue: {
            getAllRegistersByStudentId: jest.fn(),
          },
        },
        {
          provide: DatabaseService,
          useValue: {
            factStdPlan: { count: jest.fn() },
            coursePlan: { findUnique: jest.fn() },
            factTermSummary: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
            },
            factRegister: {
              findFirst: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    termSummaryUsecase = module.get<TermSummaryUsecase>(TermSummaryUsecase);
    studentService = module.get(StudentService);
    studentPlanService = module.get(StudentPlanService);
    registerService = module.get(RegisterService);
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

      await expect(
        termSummaryUsecase.checkFollowPlan('1', 1, 'ภาคต้น')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error if student plan not found', async () => {
      studentService.getStudentById.mockResolvedValue(mockStudent);
      studentPlanService.getStudentPlanByStudentId.mockResolvedValue([]);

      await expect(
        termSummaryUsecase.checkFollowPlan('1', 1, 'ภาคต้น')
      ).rejects.toThrow(NotFoundException);
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

      const result = await termSummaryUsecase.checkFollowPlan(
        '1',
        2,
        'ภาคปลาย'
      );
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

      const result = await termSummaryUsecase.checkFollowPlan(
        '1',
        2,
        'ภาคปลาย'
      );
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

      await termSummaryUsecase.checkFollowPlan('1', 2, 'ภาคฤดูร้อน');

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
        termSummaryUsecase.checkStudentStatus('1', 1, 'ภาคต้น')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if course plan not found', async () => {
      (db.coursePlan.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        termSummaryUsecase.checkStudentStatus('1', 1, 'ภาคต้น')
      ).rejects.toThrow(NotFoundException);
    });

    it('should return STUDYING immediately if semesterPartInYear is ภาคฤดูร้อน', async () => {
      const result = await termSummaryUsecase.checkStudentStatus(
        '1',
        1,
        'ภาคฤดูร้อน'
      );
      expect(result).toBe(StudentStatus.STUDYING);
    });

    it('should return "พ้นสภาพนิสิต" for gpax < 1.5', async () => {
      (db.coursePlan.findUnique as jest.Mock).mockResolvedValue(mockCoursePlan);
      (db.factTermSummary.findMany as jest.Mock).mockResolvedValue([
        { gpax: 1.4, creditAll: 100, studyYear: 2, studyTerm: 1 },
        { gpax: 2.0, creditAll: 20, studyYear: 1, studyTerm: 2 },
      ]);

      jest
        .spyOn(termSummaryUsecase, 'checkFollowPlan')
        .mockResolvedValue(false);

      const result = await termSummaryUsecase.checkStudentStatus(
        '1',
        1,
        'ภาคต้น'
      );
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

      const result = await termSummaryUsecase.checkStudentStatus(
        '1',
        1,
        'ภาคต้น'
      );
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

      const result = await termSummaryUsecase.checkStudentStatus(
        '1',
        1,
        'ภาคต้น'
      );
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

      const result = await termSummaryUsecase.checkStudentStatus(
        '1',
        1,
        'ภาคต้น'
      );
      expect(result).toBe(StudentStatus.STUDYING);
    });

    it('should return "สำเร็จการศึกษา" if creditAll >= totalCredit and follows plan', async () => {
      (db.coursePlan.findUnique as jest.Mock).mockResolvedValue(mockCoursePlan);
      (db.factTermSummary.findMany as jest.Mock).mockResolvedValue([
        { gpax: 3.0, creditAll: 134, studyYear: 4, studyTerm: 2 },
      ]);
      jest.spyOn(termSummaryUsecase, 'checkFollowPlan').mockResolvedValue(true);

      const result = await termSummaryUsecase.checkStudentStatus(
        '1',
        1,
        'ภาคต้น'
      );
      expect(result).toBe(StudentStatus.GRADUATED);
    });

    it('should return "กำลังศึกษา" if not follow plan or creditAll < totalCredit', async () => {
      (db.coursePlan.findUnique as jest.Mock).mockResolvedValue(mockCoursePlan);
      (db.factTermSummary.findMany as jest.Mock).mockResolvedValue([
        { gpax: 3.0, creditAll: 134, studyYear: 4, studyTerm: 2 },
      ]);
      jest
        .spyOn(termSummaryUsecase, 'checkFollowPlan')
        .mockResolvedValue(false);

      const result = await termSummaryUsecase.checkStudentStatus(
        '1',
        1,
        'ภาคต้น'
      );
      expect(result).toBe(StudentStatus.STUDYING);
    });
  });

  describe('checkIsEligibleForCoop', () => {
    const mockStudent = {
      studentId: '6520503333',
      studentUsername: 'testuser',
      studentStatusId: 1,
      coursePlanId: 100,
    };
    const term = 'ภาคปลาย';
    const year = 2567;

    const mockCoursePlan = { totalCredit: 120, creditIntern: 60 };

    it('should throw NotFoundException if student not found', async () => {
      studentService.getStudentById.mockResolvedValue(null);
      await expect(
        termSummaryUsecase.checkIsEligibleForCoop('1', year, term)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if course plan not found', async () => {
      studentService.getStudentById.mockResolvedValue(mockStudent);
      (db.coursePlan.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(
        termSummaryUsecase.checkIsEligibleForCoop('1', year, term)
      ).rejects.toThrow(NotFoundException);
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

      const result = await termSummaryUsecase.checkIsEligibleForCoop(
        '1',
        year,
        term
      );
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
      jest.spyOn(termSummaryUsecase, 'checkFollowPlan').mockResolvedValue(true);

      const result = await termSummaryUsecase.checkIsEligibleForCoop(
        '1',
        year,
        term
      );
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
      jest
        .spyOn(termSummaryUsecase, 'checkFollowPlan')
        .mockResolvedValue(false);

      const result = await termSummaryUsecase.checkIsEligibleForCoop(
        '1',
        year,
        term
      );
      expect(result).toBe(false);
    });
  });

  describe('getCurrentYearTerm', () => {
    it('should return latest term for student', async () => {
      const mockLatest = {
        studyYearInRegis: 2,
        studyTermInRegis: 1,
        semesterYearInRegis: 2567,
        semesterPartInRegis: 'ภาคต้น',
      };
      (db.factRegister.findFirst as jest.Mock).mockResolvedValue(mockLatest);

      const result = await termSummaryUsecase.getCurrentYearTerm('12345');
      expect(result).toEqual(mockLatest);
      expect(db.factRegister.findFirst).toHaveBeenCalledWith({
        where: { studentId: '12345' },
        orderBy: [{ studyYearInRegis: 'desc' }, { studyTermInRegis: 'desc' }],
        select: {
          studyYearInRegis: true,
          studyTermInRegis: true,
          semesterYearInRegis: true,
          semesterPartInRegis: true,
        },
      });
    });

    it('should return null if no record found', async () => {
      (db.factRegister.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await termSummaryUsecase.getCurrentYearTerm('99999');
      expect(result).toBeNull();
    });
  });

  describe('Summary term for student', () => {
    const mockLastTerm = {
      studyYearInRegis: 2,
      studyTermInRegis: 1,
      semesterYearInRegis: 2567,
      semesterPartInRegis: 'ภาคต้น',
    };

    beforeEach(() => {
      studentService.getStudentById.mockResolvedValue({
        studentId: '12345',
        studentUsername: 'testuser',
        studentStatusId: 1,
        coursePlanId: 1,
      });

      studentPlanService.getStudentPlanByStudentId.mockResolvedValue([
        {
          stdPlanId: 1,
          subjectCourseId: 101,
          studentId: '12345',
          gradeLabelId: 1,
          semester: 1,
          grade: 'A',
          isPass: true,
          semesterPartInYear: 'ภาคต้น',
          note: null,
        },
      ]);

      (db.coursePlan.findUnique as jest.Mock).mockResolvedValue({
        coursePlanId: 1,
        courseId: 1,
        planCourse: 'แผนตัวอย่าง',
        totalCredit: 120,
        generalSubjectCredit: 30,
        specificSubjectCredit: 60,
        freeSubjectCredit: 30,
        coreSubjectCredit: 0,
        spacailSubjectCredit: 0,
        selectSubjectCredit: 0,
        happySubjectCredit: 0,
        entrepreneurshipSubjectCredit: 0,
        languageSubjectCredit: 0,
        peopleSubjectCredit: 0,
        aestheticsSubjectCredit: 0,
        internshipHours: 0,
      });

      (db.factTermSummary.findFirst as jest.Mock).mockResolvedValue({
        creditAll: 3,
        semesterYearInTerm: mockLastTerm.semesterYearInRegis,
        semesterPartInTerm: mockLastTerm.semesterPartInRegis,
        creditIntern: 3,
      });
    });

    it('should return null if no latest term', async () => {
      jest
        .spyOn(termSummaryUsecase, 'getCurrentYearTerm')
        .mockResolvedValue(null);

      const result = await termSummaryUsecase.summaryTermForStudent('12345');
      expect(result).toBeNull();
    });

    it('should return null if no register records found', async () => {
      registerService.getAllRegistersByStudentId.mockResolvedValue([]);
      const result = await termSummaryUsecase.summaryTermForStudent('12345');
      expect(result).toBeNull();
    });

    it('should create a new term summary', async () => {
      jest
        .spyOn(termSummaryUsecase, 'getCurrentYearTerm')
        .mockResolvedValue(mockLastTerm);

      (db.factRegister.findMany as jest.Mock).mockResolvedValue([
        {
          studentId: '12345',
          semesterYearInRegis: mockLastTerm.semesterYearInRegis,
          semesterPartInRegis: mockLastTerm.semesterPartInRegis,
          subjectCourseId: 1,
          creditRegis: 3,
          subject_course: {
            subject: {
              subjectId: 101,
              subjectCode: 'MATH101',
              nameSubjectThai: 'คณิตวิศวกรรม',
              nameSubjectEng: 'Engineering Math',
              credit: 3,
              subject_caterogy: {
                subjectCaterogyId: 1,
                subjectCategoryName: 'General',
                subjectGroupName: 'A',
              },
            },
          },
          gradeLabelId: 1,
          gradeCharacter: 'A',
        },
      ]);

      (db.factTermSummary.findMany as jest.Mock).mockResolvedValue([
        { gpax: 3.0, creditAll: 3, studyYear: 1, studyTerm: 2 },
      ]);

      (db.factTermSummary.create as jest.Mock).mockResolvedValue({
        id: 1,
        studentId: '12345',
        creditTerm: 3,
        creditAll: 3,
        generalSubjectCredit: 0,
        specificSubjectCredit: 3,
        freeSubjectCredit: 0,
      });

      const result = await termSummaryUsecase.summaryTermForStudent('12345');

      expect(db.factRegister.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            studentId: '12345',
            studyYearInRegis: mockLastTerm.studyYearInRegis,
            studyTermInRegis: mockLastTerm.studyTermInRegis,
          },
          orderBy: [{ studyYearInRegis: 'asc' }, { studyTermInRegis: 'asc' }],
          include: expect.any(Object),
        })
      );

      expect(db.factTermSummary.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            studentId: '12345',
            creditTerm: 3,
            creditAll: 6,
            generalSubjectCredit: 3,
            specificSubjectCredit: 0,
            freeSubjectCredit: 0,
          }),
        })
      );

      expect(result).toHaveProperty('id', 1);
    });
  });
  describe('getGpa', () => {
    it('should correctly calculate GPA for the latest term', async () => {
      const studentId = '6520503461';

      (studentService.getStudentById as jest.Mock).mockResolvedValue({
        studentId,
      });
      (db.factRegister.findFirst as jest.Mock).mockResolvedValue({
        semesterYearInRegis: 2568,
        semesterPartInRegis: 'ภาคต้น',
      });
      (db.factRegister.findMany as jest.Mock).mockResolvedValue([
        { gradeNumber: 4, creditRegis: 3, gradeCharacter: 'A' },
        { gradeNumber: 3, creditRegis: 3, gradeCharacter: 'B+' },
      ] as FactRegister[]);

      const result = await termSummaryUsecase.getGpa(studentId, 2568, 'ภาคต้น');

      expect(result).toEqual({ gpa: 3.5 });
    });

    it('should throw NotFoundException if student not found', async () => {
      (studentService.getStudentById as jest.Mock).mockResolvedValue(null);

      await expect(
        termSummaryUsecase.getGpa('invalidId', 2568, 'ภาคต้น')
      ).rejects.toThrow(NotFoundException);
    });

    it('should return GPA = 0 if no register records found for the latest term', async () => {
      const studentId = '6520503461';

      (studentService.getStudentById as jest.Mock).mockResolvedValue({
        studentId,
      });
      (db.factRegister.findFirst as jest.Mock).mockResolvedValue({
        semesterYearInRegis: 2568,
        semesterPartInRegis: 'ภาคต้น',
      });
      (db.factRegister.findMany as jest.Mock).mockResolvedValue([]);

      await expect(
        termSummaryUsecase.getGpa(studentId, 2568, 'ภาคต้น')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if database query fails', async () => {
      const studentId = '6520503461';
      (studentService.getStudentById as jest.Mock).mockResolvedValue({
        studentId,
      });
      (db.factRegister.findFirst as jest.Mock).mockResolvedValue({
        semesterYearInRegis: 2568,
        semesterPartInRegis: 'ภาคต้น',
      });

      await expect(
        termSummaryUsecase.getGpa(studentId, 2568, 'ภาคต้น')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getGpax', () => {
    it('should correctly calculate cumulative GPAX', async () => {
      const studentId = '6520503461';

      (studentService.getStudentById as jest.Mock).mockResolvedValue({
        studentId,
      });
      (db.factRegister.findMany as jest.Mock).mockResolvedValue([
        { gradeNumber: 4, creditRegis: 3, gradeCharacter: 'A' },
        { gradeNumber: 3, creditRegis: 3, gradeCharacter: 'B+' },
      ] as FactRegister[]);

      const result = await termSummaryUsecase.getGpax(studentId);

      expect(result).toEqual({ gpax: 3.5 });
    });

    it('should throw NotFoundException if student not found', async () => {
      (studentService.getStudentById as jest.Mock).mockResolvedValue(null);

      await expect(termSummaryUsecase.getGpax('invalidId')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should return GPAX = 0 if no register data found', async () => {
      const studentId = '6520503461';

      (studentService.getStudentById as jest.Mock).mockResolvedValue({
        studentId,
      });
      (db.factRegister.findMany as jest.Mock).mockResolvedValue([]);

      const result = await termSummaryUsecase.getGpax(studentId);

      expect(result).toEqual({ gpax: 0 });
    });

    it('should throw InternalServerErrorException if database query fails', async () => {
      const studentId = '6520503461';
      (studentService.getStudentById as jest.Mock).mockResolvedValue({
        studentId,
      });

      await expect(termSummaryUsecase.getGpax(studentId)).rejects.toThrow(
        InternalServerErrorException
      );
    });
  });
});
