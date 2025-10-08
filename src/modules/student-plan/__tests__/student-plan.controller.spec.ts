import { Test, TestingModule } from '@nestjs/testing';
import { StudentPlanController } from '../student-plan.controller';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { StudentPlanUsecase } from '../student-plan.usecase';
import { StudentPlanService } from '../student-plan.service';
import { StudentPlanDto } from '../student-plan.dto';

describe('StudentPlanController', () => {
  let studentPlanController: StudentPlanController;
  let studentPlanUsecase: jest.Mocked<StudentPlanUsecase>;
  let studentPlanService: jest.Mocked<StudentPlanService>;

  const mockStudentPlan: StudentPlanDto[] = [
    {
      stdPlanId: 1,
      studentId: '6520501234',
      subjectCourseId: 2001,
      semester: 1,
      semesterPartInYear: 'ภาคต้น',
      gradeLabelId: null,
      grade: null,
      isPass: false,
      note: null,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentPlanController],
      providers: [
        {
          provide: StudentPlanUsecase,
          useValue: {
            createStudentPlan: jest.fn(),
            updateStudentPlan: jest.fn(),
          },
        },
        {
          provide: StudentPlanService,
          useValue: { getStudentPlanByStudentId: jest.fn() },
        },
      ],
    }).compile();

    studentPlanController = module.get<StudentPlanController>(
      StudentPlanController
    );
    studentPlanUsecase = module.get(StudentPlanUsecase);
    studentPlanService = module.get(StudentPlanService);
  });

  describe('changeStudentPlan', () => {
    const studentId = '6520501234';
    const expectedResult = { message: 'Student plan updated successfully' };

    it('should successfully create/update student plan', async () => {
      studentPlanUsecase.createStudentPlan.mockResolvedValue(true);
      studentPlanUsecase.updateStudentPlan.mockResolvedValue(true);

      const result = await studentPlanController.changeStudentPlan(studentId);

      expect(studentPlanUsecase.createStudentPlan).toHaveBeenCalledWith(
        studentId
      );
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException when student is not found', async () => {
      studentPlanUsecase.createStudentPlan.mockRejectedValue(
        new NotFoundException('Student not found')
      );

      await expect(
        studentPlanController.changeStudentPlan(studentId)
      ).rejects.toThrow(NotFoundException);
      expect(studentPlanUsecase.createStudentPlan).toHaveBeenCalledWith(
        studentId
      );
    });

    it('should throw NotFoundException when no subject courses found', async () => {
      studentPlanUsecase.createStudentPlan.mockRejectedValue(
        new InternalServerErrorException()
      );

      await expect(
        studentPlanController.changeStudentPlan(studentId)
      ).rejects.toThrow(InternalServerErrorException);
      expect(studentPlanUsecase.createStudentPlan).toHaveBeenCalledWith(
        studentId
      );
    });
  });

  describe('getStudentPlan', () => {
    const studentId = '6520501234';

    it('should return an array of student plans', async () => {
      studentPlanService.getStudentPlanByStudentId.mockResolvedValue(
        mockStudentPlan
      );

      const result = await studentPlanController.getStudentPlan(studentId);

      expect(studentPlanService.getStudentPlanByStudentId).toHaveBeenCalledWith(
        studentId
      );
      expect(result).toEqual(mockStudentPlan);
    });

    it('should throw NotFoundException if student not found', async () => {
      studentPlanService.getStudentPlanByStudentId.mockRejectedValue(
        new NotFoundException('Student not found')
      );

      await expect(
        studentPlanController.getStudentPlan(studentId)
      ).rejects.toThrow(NotFoundException);
      expect(studentPlanService.getStudentPlanByStudentId).toHaveBeenCalledWith(
        studentId
      );
    });
  });
});
