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
          useValue: { createStudentPlan: jest.fn() },
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
    it('should successfully create/update student plan', async () => {
      const studentId = '6520501234';
      const expectedResult = { message: 'Student plan updated successfully' };

      studentPlanUsecase.createStudentPlan.mockResolvedValue(expectedResult);

      const result = await studentPlanController.changeStudentPlan(studentId);

      expect(studentPlanUsecase.createStudentPlan).toHaveBeenCalledWith(
        studentId
      );
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException when student is not found', async () => {
      const studentId = '6520501234';
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

    it('should handle Internal server errors', async () => {
      const studentId = '6520501234';
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
    it('should return an array of student plans', async () => {
      const studentId = '6520501234';
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
      const studentId = '6520501234';
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

    it('should handle Internal server errors', async () => {
      const studentId = '6520501234';
      studentPlanService.getStudentPlanByStudentId.mockRejectedValue(
        new InternalServerErrorException()
      );

      await expect(
        studentPlanController.getStudentPlan(studentId)
      ).rejects.toThrow(InternalServerErrorException);
      expect(studentPlanService.getStudentPlanByStudentId).toHaveBeenCalledWith(
        studentId
      );
    });
  });
});
