import { DatabaseService } from '@/core/database/database.service';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class TermSummaryUsecase {
  constructor(private readonly databaseService: DatabaseService) {}

  private calculateGPA(grades: { grade: number; credit: number }[]): number {
    const totalPoints = grades.reduce(
      (acc, { grade, credit }) => acc + grade * credit,
      0
    );
    const totalCredits = grades.reduce((acc, { credit }) => acc + credit, 0);
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  }

  async getGpa(studentId: number, year: number, term: number): Promise<number> {
    const registers = await this.databaseService.factRegister.findMany({
      where: {
        studentId,
        studyYearInRegis: year,
        studyTermInRegis: term,
        gradeNumber: { not: null },
        creditRegis: { not: null },
      },
      select: {
        gradeNumber: true,
        creditRegis: true,
      },
    });

    if (!registers.length) {
      throw new NotFoundException('No register records found for this term');
    }

    const grades = registers
      .filter(r => r.creditRegis !== null)
      .map(r => ({
        grade: r.gradeNumber!,
        credit: r.creditRegis as number,
      }));
    return this.calculateGPA(grades);
  }

  async getGpax(studentId: number): Promise<number> {
    const registers = await this.databaseService.factRegister.findMany({
      where: {
        studentId,
        gradeNumber: { not: null },
        creditRegis: { not: null },
      },
      select: {
        gradeNumber: true,
        creditRegis: true,
      },
    });

    if (!registers.length) {
      throw new NotFoundException('No register records found for this student');
    }

    const grades = registers
      .filter(r => r.creditRegis !== null)
      .map(r => ({
        grade: r.gradeNumber!,
        credit: r.creditRegis as number,
      }));
    return this.calculateGPA(grades);
  }
}
