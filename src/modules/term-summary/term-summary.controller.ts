import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TermSummaryService } from './term-summary.service';
import { StudentService } from '../student/student.service';
import { TermSummaryDto } from './term-summary.dto';

@Controller('/term-summary')
@ApiTags('Term Summary')
export class TermSummaryController {
  constructor(
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
}
