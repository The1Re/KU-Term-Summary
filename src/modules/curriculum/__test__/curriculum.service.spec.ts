// curriculum.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CurriculumService } from '../curriculum.service';
import { StudentService } from '../../student/student.service';
import { StudentPlanService } from '../../student-plan/student-plan.service';

describe('CurriculumService', () => {
  let service: CurriculumService;
  let mockStudentService: Partial<Record<keyof StudentService, jest.Mock>>;
  let mockStudentPlanService: Partial<
    Record<keyof StudentPlanService, jest.Mock>
  >;

  const sampleStudent = {
    studentId: 1,
    studentUsername: 'print',
    studentStatusId: 1,
    coursePlanId: 1,
  };

  beforeEach(async () => {
    mockStudentService = {
      getStudentById: jest.fn(),
    };
    mockStudentPlanService = {
      getStudentPlanByStudentId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurriculumService,
        { provide: StudentService, useValue: mockStudentService },
        { provide: StudentPlanService, useValue: mockStudentPlanService },
      ],
    }).compile();

    service = module.get<CurriculumService>(CurriculumService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw NotFoundException when student not found', async () => {
    (mockStudentService.getStudentById as jest.Mock).mockResolvedValue(null);

    await expect(
      service.checkCurriculumStudent(999, 2565, 'ภาคต้น')
    ).rejects.toThrow(NotFoundException);

    expect(mockStudentService.getStudentById).toHaveBeenCalledWith(999);
  });

  it('should throw NotFoundException when student plan is empty', async () => {
    (mockStudentService.getStudentById as jest.Mock).mockResolvedValue(
      sampleStudent
    );
    (
      mockStudentPlanService.getStudentPlanByStudentId as jest.Mock
    ).mockResolvedValue([]);

    await expect(
      service.checkCurriculumStudent(sampleStudent.studentId, 2565, 'ภาคต้น')
    ).rejects.toThrow(NotFoundException);

    expect(
      mockStudentPlanService.getStudentPlanByStudentId
    ).toHaveBeenCalledWith(sampleStudent.studentId);
  });

  it('should return true when all required plans up to target are passed', async () => {
    (mockStudentService.getStudentById as jest.Mock).mockResolvedValue(
      sampleStudent
    );

    // two plans: 2565 ภาคต้น (passed), 2565 ภาคปลาย (passed)
    const plans = [
      {
        studentId: 1,
        subjectCourseId: 101,
        isPass: 1,
        semester: 2565,
        semesterPartInYear: 'ภาคต้น',
      },
      {
        studentId: 1,
        subjectCourseId: 102,
        isPass: 1,
        semester: 2565,
        semesterPartInYear: 'ภาคปลาย',
      },
      // a plan after target should be ignored even if not passed
      {
        studentId: 1,
        subjectCourseId: 103,
        isPass: 0,
        semester: 2566,
        semesterPartInYear: 'ภาคต้น',
      },
    ];

    (
      mockStudentPlanService.getStudentPlanByStudentId as jest.Mock
    ).mockResolvedValue(plans);

    const result = await service.checkCurriculumStudent(1, 2565, 'ภาคปลาย');
    expect(result).toBe(true);
  });

  it('should return false when any required plan up to target is not passed', async () => {
    (mockStudentService.getStudentById as jest.Mock).mockResolvedValue(
      sampleStudent
    );

    // second plan (target) is not passed
    const plans = [
      {
        studentId: 1,
        subjectCourseId: 201,
        isPass: 1,
        semester: 2565,
        semesterPartInYear: 'ภาคต้น',
      },
      {
        studentId: 1,
        subjectCourseId: 202,
        isPass: 0,
        semester: 2565,
        semesterPartInYear: 'ภาคปลาย',
      },
    ];

    (
      mockStudentPlanService.getStudentPlanByStudentId as jest.Mock
    ).mockResolvedValue(plans);

    const result = await service.checkCurriculumStudent(1, 2565, 'ภาคปลาย');
    expect(result).toBe(false);
  });

  it('should correctly handle term ordering and ignore plans after the target term', async () => {
    (mockStudentService.getStudentById as jest.Mock).mockResolvedValue(
      sampleStudent
    );

    // Mixed order and terms to validate compareTerm logic
    const plans = [
      // earliest in chronological order (should be considered)
      {
        studentId: 1,
        subjectCourseId: 301,
        isPass: 1,
        semester: 2564,
        semesterPartInYear: 'ภาคปลาย',
      },
      // plan in target range (not passed -> cause false if included)
      {
        studentId: 1,
        subjectCourseId: 302,
        isPass: 1,
        semester: 2565,
        semesterPartInYear: 'ภาคต้น',
      },
      // after target -> should be ignored even if not passed
      {
        studentId: 1,
        subjectCourseId: 303,
        isPass: 0,
        semester: 2566,
        semesterPartInYear: 'ภาคต้น',
      },
    ];

    (
      mockStudentPlanService.getStudentPlanByStudentId as jest.Mock
    ).mockResolvedValue(plans);

    // target: 2565 ภาคต้น — all plans up to and including this are passed
    const result = await service.checkCurriculumStudent(1, 2565, 'ภาคต้น');
    expect(result).toBe(true);
  });
});
