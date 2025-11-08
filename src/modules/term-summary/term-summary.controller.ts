import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
  Get,
  BadRequestException,
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
import { CategoryCreditDto } from './dto/category-credit.dto';

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
    description: `
    - if no body provided, create term summary for all student and latest term only
    - studentCodes: [...] for specific student else all students
    - all: true to create term summary for all terms
    - year and term: create term summary from specified year and term to the first term
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Success',
    example: {
      message: 'Term summaries created/updated successfully',
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    examples: {
      missingYearOrTerm: {
        summary: 'Missing year or term',
        value: {
          message: 'Both year and term must be provided together',
        },
      },
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

    if ((body?.year && !body.term) || (body?.term && !body.year)) {
      throw new BadRequestException(
        'Both year and term must be provided together'
      );
    }

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

      if (studentPlan.length === 0) {
        await this.studentPlanUsecase.createStudentPlan(student.studentId);
      }
      await this.studentPlanUsecase.updateStudentPlan(student.studentId);

      if (body?.all) {
        // create term summary for all terms
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
      } else if (body?.year && body.term) {
        // create term summary from specified year and term to the first term
        for (let i = body.year; i >= 1; i--) {
          for (let j = 3; j >= 1; j--) {
            if ((i === body.year && j <= body.term) || i < body.year) {
              await this.termsummaryUsecase.createOrUpdateTermSummary(
                student.studentId,
                i,
                j
              );
            }
          }
        }
      } else {
        // create term summary for latest term only
        const latestTerm = await this.termsummaryUsecase.latestTermSummary(
          student.studentId
        );

        await this.termsummaryUsecase.createOrUpdateTermSummary(
          student.studentId,
          latestTerm?.year ?? 1,
          latestTerm?.term ?? 1
        );
      }
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

      if (studentPlan.length === 0) {
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
    summary: 'Get all Term Summary for specific student',
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
        value: { message: 'Student not found' },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    example: { message: 'Internal server error' },
  })
  async getAllTermSummary(@Param('studentCode') studentCode: string) {
    const student =
      await this.studentService.getStudentByStudentUsername(studentCode);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const termSummaries = await this.termsummaryService.getTermSummary(
      student.studentId
    );

    const result: TermSummaryDto[] = termSummaries.map(term => ({
      factTermSummaryId: term.factTermSummaryId,
      studentId: term.studentId,
      teacherId: term.teacherId,
      creditTerm: term.creditTerm,
      creditAll: term.creditAll,
      gpa: term.gpa,
      gpax: term.gpax,
      studyYear: term.studyYear,
      studyTerm: term.studyTerm,
      isFollowPlan: term.isFollowPlan ?? false,
      semesterYearInTerm: term.semesterYearInTerm,
      semesterPartInTerm: term.semesterPartInTerm,
      gradeLabelId: term.gradeLabelId,
      isCoopEligible: term.isCoopEligible,

      categoryCredit: (term.factTermCredit || []).map(termCredit => ({
        categoryId: termCredit?.creditRequire?.subjectCategoryId ?? 0,
        categoryName:
          termCredit?.creditRequire?.subjectCategory?.categoryName ?? '',
        creditRequire: termCredit?.creditRequire_ ?? 0,
        creditPass: termCredit?.creditPass ?? 0,
        avgGrade: termCredit?.grade ?? 0,
      })) as CategoryCreditDto[],
    }));

    return result;
  }
}
