import { Test, TestingModule } from '@nestjs/testing';
import { StudentPlanController } from '../student-plan.controller';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { StudentPlanUsecase } from '../student-plan.usecase';

describe('Student Course Plan Controller', () => {
  let studentPlanController: StudentPlanController;
  let studentPlanUsecase: jest.Mocked<StudentPlanUsecase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentPlanController],
      providers: [
        {
          provide: StudentPlanUsecase,
          useValue: { createStudentPlan: jest.fn() },
        },
      ],
    }).compile();

    studentPlanController = module.get<StudentPlanController>(
      StudentPlanController
    );
    studentPlanUsecase = module.get(StudentPlanUsecase);
  });

  describe('changeStudentPlan', () => {
    it('should successfully create/update student plan', async () => {
      const studentId = 1;
      const expectedResult = { message: 'Student plan updated successfully' };

      studentPlanUsecase.createStudentPlan.mockResolvedValue(expectedResult);

      const result = await studentPlanController.changeStudentPlan(studentId);

      expect(studentPlanUsecase.createStudentPlan).toHaveBeenCalledWith(
        studentId
      );
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException when student is not found', async () => {
      const studentId = 999;

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
      const studentId = 1;

      studentPlanUsecase.createStudentPlan.mockRejectedValue(
        new NotFoundException('No subject courses found for this course plan')
      );

      await expect(
        studentPlanController.changeStudentPlan(studentId)
      ).rejects.toThrow(NotFoundException);

      expect(studentPlanUsecase.createStudentPlan).toHaveBeenCalledWith(
        studentId
      );
    });

    it('should handle Internal server errors', async () => {
      const studentId = 1;

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
});
