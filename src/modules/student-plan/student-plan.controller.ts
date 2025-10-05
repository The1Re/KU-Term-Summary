import { Controller, Param, ParseIntPipe, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StudentPlanUsecase } from './student-plan.usecase';

@Controller('/student-plans')
@ApiTags('Student Plans')
export class StudentPlanController {
  constructor(private readonly studentPlanUsecase: StudentPlanUsecase) {}

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
  changeStudentPlan(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.studentPlanUsecase.createStudentPlan(studentId);
  }
}
