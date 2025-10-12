import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StudentPlanUsecase } from './student-plan.usecase';
import { StudentPlanService } from './student-plan.service';
import { StudentService } from '../student/student.service';
import { StudentPlanDto } from './dto/student-plan.dto';

@Controller('/student-plans')
@ApiTags('Student Plans')
export class StudentPlanController {
  constructor(
    private readonly studentPlanUsecase: StudentPlanUsecase,
    private readonly studentPlanService: StudentPlanService,
    private readonly studentService: StudentService
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
  async changeStudentPlan(@Param('studentId', ParseIntPipe) studentId: number) {
    await this.studentPlanUsecase.createStudentPlan(studentId);
    await this.studentPlanUsecase.updateStudentPlan(studentId);
    return { message: 'Student plan updated successfully' };
  }

  @Get(':studentId')
  @ApiOperation({
    summary: 'Get all student plan',
  })
  @ApiOkResponse({
    description: 'Fetched student plan successfully',
    type: StudentPlanDto,
    isArray: true,
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
  async getStudentPlan(
    @Param('studentId', ParseIntPipe) studentId: number
  ): Promise<StudentPlanDto[]> {
    const student = await this.studentService.getStudentById(studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    const studentPlans =
      await this.studentPlanService.getAllStudentPlan(studentId);

    const result: StudentPlanDto[] = studentPlans.map(plan => ({
      factStudentPlanId: plan.factStudentPlanId,
      studentId: plan.studentId,
      subjectCourseId: plan.subjectCourseId,
      gradeLabelId: plan.gradeLabelId,
      isRequire: plan.isRequire,
      isPass: plan.isPass,
      passYear: plan.passYear,
      passTerm: plan.passTerm,
      stdGrade: plan.stdGrade,
      gradeDetails: plan.gradeDetails,
      credit: plan.subjectCourse.subject.subCredit.credit,
    }));
    return result;
  }
}
