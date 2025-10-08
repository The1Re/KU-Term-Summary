import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TermSummaryService } from './term-summary.service';
import { StudentService } from '../student/student.service';
import { CreateTermSummaryDto, TermSummaryDto } from './term-summary.dto';
import { Student } from '@prisma/client';
import { TermSummaryUsecase } from './term-summary.usecase';

@Controller('/term-summary')
@ApiTags('Term Summary')
export class TermSummaryController {
  constructor(
    private readonly termSummaryUsecase: TermSummaryUsecase,
    private readonly termSummaryService: TermSummaryService,
    private readonly studentService: StudentService
  ) {}

  @Get(':studentId')
  @ApiOperation({
    summary: 'Get all term summaries for a student',
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
  async getAllTermSummaries(@Param('studentId') studentId: string) {
    const student = await this.studentService.getStudentById(studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return this.termSummaryService.getAllTermSummaries(studentId);
  }

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
          message: 'Student with ID 6520501234 not found',
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
    let students: Student[] = [];
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
      await this.termSummaryUsecase.summaryTermForStudent(student.studentId);
    }

    return { message: 'Term summaries created/updated successfully' };
  }
}
