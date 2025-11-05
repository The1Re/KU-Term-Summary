import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
  Get,
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

@Controller('term-summary')
export class TermSummaryController {
  constructor(
    private readonly studentPlanService: StudentPlanService,
    private readonly studentService: StudentService,
    private readonly studentPlanUsecase: StudentPlanUsecase,
    private readonly termsummaryService: TermSummaryService,
    private readonly termsummaryUsecase: TermSummaryUseCase
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
          message: 'Student with code 6520501234 not found',
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
    if (body?.studentCodes) {
      for (const code of body.studentCodes) {
        const student =
          await this.studentService.getStudentByStudentUsername(code);
        if (!student) {
          throw new NotFoundException(`Student with code ${code} not found`);
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

  @Post('sync')
  @ApiOperation({
    summary: 'Sync term summary for all students and all term',
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
          message: 'Student with code 6520501234 not found',
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
  async sysncTermSummaryForAllStudents() {
    const students = await this.studentService.getAllStudents();

    for (const student of students) {
      const studentPlan = await this.studentPlanService.getAllStudentPlan(
        student.studentId
      );

      if (!studentPlan) {
        await this.studentPlanUsecase.createStudentPlan(student.studentId);
      }
      await this.studentPlanUsecase.updateStudentPlan(student.studentId);
      const allTerm = await this.termsummaryUsecase.getAllTerm(
        student.studentId
      );

      for (const term of allTerm) {
        await this.termsummaryUsecase.createOrUpdateTermSummary(
          student.studentId,
          term.studyYearInRegis!,
          term.studyTermInRegis!
        );
      }
    }

    return { message: 'Term summaries created/updated successfully' };
  }

  @Get(':studentCode')
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
  async getAllTermSummary(@Param('studentCode') studentCode: string) {
    const student =
      await this.studentService.getStudentByStudentUsername(studentCode);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return this.termsummaryService.getTermSummary(student.studentId);
  }
}
