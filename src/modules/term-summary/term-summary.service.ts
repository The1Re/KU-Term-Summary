import { Injectable } from '@nestjs/common';
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
      throw new Error('Student not found');
    }
    const termSummaries = await this.databaseService.factTermSummary.findMany({
      where: {
        studentId: studentId,
      },
    });

    return termSummaries;
  }

  async getTermSummary(studentId: number, year: number, term: number) {
    const student = await this.studentService.getStudentById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const termSummary = await this.databaseService.factTermSummary.findFirst({
      where: {
        studentId: studentId,
        semesterYearInTerm: year,
        semesterPartInTerm: term,
      },
    });

    return termSummary;
  }
}
