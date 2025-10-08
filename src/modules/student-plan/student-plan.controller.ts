import { Controller, Get, NotFoundException, Param, Put } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StudentPlanUsecase } from './student-plan.usecase';
import { StudentPlanDto } from './student-plan.dto';
import { StudentPlanService } from './student-plan.service';

@Controller('/student-plans')
@ApiTags('Student Plans')
export class StudentPlanController {
  constructor(
    private readonly studentPlanUsecase: StudentPlanUsecase,
    private readonly studentPlanService: StudentPlanService
  ) {}

  @Put(':studentId')
  @ApiOperation({
    summary: 'Create or change a student plan',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    example: {
      message: 'Student plan updated successfully',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found',
    examples: {
      StudentNotFound: {
        summary: 'Student Not Found',
        value: {
          message: 'Student not found',
        },
      },
      CourseNotFound: {
        summary: 'Course Not Found',
        value: {
          message: 'No subject courses found for this course plan',
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    example: {
      message: 'Internal server error',
    },
  })
  async changeStudentPlan(@Param('studentId') studentId: string) {
    await this.studentPlanUsecase.createStudentPlan(studentId);
    await this.studentPlanUsecase.updateStudentPlan(studentId);
    return { message: 'Student plan updated successfully' };
  }

  @Get(':studentId')
  @ApiOkResponse({
    description: 'Fetched student plan successfully',
    type: StudentPlanDto,
    isArray: true,
  })
  @ApiOperation({
    summary: 'Get all student plan',
  })
  @ApiNotFoundResponse({
    description: 'Student not found',
    schema: {
      example: { message: 'Student not found' },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    example: {
      message: 'Internal server error',
    },
  })
  async getStudentPlan(@Param('studentId') studentId: string) {
    const student =
      await this.studentPlanService.getStudentPlanByStudentId(studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return this.studentPlanService.getStudentPlanByStudentId(studentId);
  }
}
