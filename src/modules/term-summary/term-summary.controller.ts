import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
  Get,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateTermSummaryDto } from './dto/create-term-summary.dto';
import { FactStudent } from '@prisma/client';
import { StudentService } from '../student/student.service';
import { StudentPlanUsecase } from '../student-plan/student-plan.usecase';
import { StudentPlanService } from '../student-plan/student-plan.service';
import { TermSummaryService } from './term-summary.service';
import { TermSummaryDto } from './dto/get-all-term-summary.dto';
import { TermSummaryUseCase } from './term-summary.usecase';
import { RegisterService } from '../register/register.service';

@Controller('term-summary')
export class TermSummaryController {
  constructor(
    private readonly studentPlanService: StudentPlanService,
    private readonly studentService: StudentService,
    private readonly studentPlanUsecase: StudentPlanUsecase,
    private readonly termsummaryService: TermSummaryService,
    private readonly termsummaryUsecase: TermSummaryUseCase,
    private readonly registerService: RegisterService
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create term summary for all students or a specific student',
  })
  @ApiResponse({
    status: 201,
    description: 'Success',
    example: {
      message: 'Term summaries created/updated successfully',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found',
    examples: {
      studentNotFound: {
        summary: 'Student Not Found',
        value: {
          message: 'Student with ID 1 not found',
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
  @ApiBody({ required: false, type: CreateTermSummaryDto })
  async createTermSummary(@Body() body?: CreateTermSummaryDto) {
    let students: FactStudent[] = [];
    if (body?.studentIds) {
      for (const id of body.studentIds) {
        const student = await this.studentService.getStudentById(id);
        if (!student) {
          throw new NotFoundException(`Student with ID ${id} not found`);
        }
        students.push(student);
      }
    } else {
      students = await this.studentService.getAllStudents();
    }

    for (const student of students) {
      const studentPlan = await this.studentPlanService.getAllStudentPlan(
        student.studentId
      );

      if (!studentPlan) {
        await this.studentPlanUsecase.createStudentPlan(student.studentId);
      }
      await this.studentPlanUsecase.updateStudentPlan(student.studentId);
      const latestTerm = await this.termsummaryUsecase.latestTermSummary(
        student.studentId
      );

      await this.termsummaryUsecase.createOrUpdateTermSummary(
        student.studentId,
        latestTerm?.year ?? 1,
        latestTerm?.term ?? 1
      );
    }

    return { message: 'Term summaries created/updated successfully' };
  }

  @Get(':studentId')
  @ApiOperation({
    summary: 'Get all Term Summary',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: TermSummaryDto,
    isArray: true,
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found',
    examples: {
      studentNotFound: {
        summary: 'Student Not Found',
        value: {
          message: 'Student not found',
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
  async getAllTermSummary(@Param('studentId', ParseIntPipe) studentId: number) {
    const student = await this.studentService.getStudentById(studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return this.termsummaryService.getTermSummary(studentId);
  }
}
