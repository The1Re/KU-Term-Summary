import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
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

  @Post()
  @ApiOperation({
    summary: 'Create a student plan for all student',
  })
  @ApiResponse({
    status: 201,
    description: 'Success',
    example: {
      success: {
        summary: 'All created',
        value: {
          message: 'Student plan create successfully',
        },
      },
      successWithSomeError: {
        summary: 'Partial success',
        value: {
          message:
            'Student plan create successfully but some student got error',
          error_student_id: [1, 2, 3],
        },
      },
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
  async createStudentPlan() {
    const students = await this.studentService.getAllStudents();
    const studentIds = students.map(s => s.studentId);
    const failed: { studentId: number; reason: string }[] = [];
    for (const studentId of studentIds) {
      try {
        await this.studentPlanUsecase.createStudentPlan(studentId);
        await this.studentPlanUsecase.updateStudentPlan(studentId);
      } catch (err) {
        failed.push({ studentId, reason: err?.message ?? 'Unknown error' });
      }
    }
    if (failed.length === 0) {
      return { message: 'Student plan create successfully' };
    } else {
      return {
        message: 'Student plan create successfully but some student got error',
        error_student_id: failed.map(f => f.studentId),
      };
    }
  }

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
