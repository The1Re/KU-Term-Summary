import { Injectable, NotFoundException } from '@nestjs/common';
import { StudentService } from '../student/student.service';
import { DatabaseService } from '@/core/database/database.service';

@Injectable()
export class TermSummaryService {
  constructor(
    private readonly studentService: StudentService,
    private readonly databaseService: DatabaseService
  ) {}

  async getAllTermSummaries(studentId: number) {
    const student = await this.studentService.getStudentById(studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    const termSummaries = await this.databaseService.factTermSummary.findMany({
      where: {
        studentId: studentId,
      },
    });

    return termSummaries;
  }
}
