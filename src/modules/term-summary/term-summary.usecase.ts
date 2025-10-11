import { DatabaseService } from '@/core/database/database.service';
import { calculateGPA } from '@/core/utils/calculate';
import { Injectable, NotFoundException } from '@nestjs/common';
import { FactTermSummary, Prisma } from '@prisma/client';

@Injectable()
export class TermSummaryUseCase {
  constructor(private readonly databaseService: DatabaseService) {}

  async checkFollowPlan(studentId: number, year: number, term: number) {
    const countPlanNotPass = await this.databaseService.factStudentPlan.count({
      where: {
        studentId: studentId,
        isPass: false,
        OR: [
          {
            subjectCourse: {
              studyYear: { lt: year },
            },
          },
          {
            subjectCourse: {
              studyYear: year,
              studyTerm: {
                lte: term,
              },
            },
          },
        ],
      },
    });
    return !countPlanNotPass;
  }

  async checkIsEligibleForCoop(
    studentId: number,
    coursePlanId: number,
    creditAll: number,
    year: number,
    term: number
  ) {
    const coursePlan = await this.databaseService.coursePlan.findUnique({
      where: { coursePlanId },
    });

    const creditIntern = coursePlan?.creditIntern ?? 0;
    const canGoCoop = creditAll >= creditIntern;
    if (!canGoCoop) return false;

    const isFollowPlan = await this.checkFollowPlan(studentId, year, term);
    if (isFollowPlan) {
      return true;
    }
    return false;
  }

  async createOrUpdateTermSummary(
    studentId: number,
    studyYear: number,
    studyTerm: number
  ): Promise<FactTermSummary | null> {
    const factStudent = await this.databaseService.factStudent.findFirst({
      where: { studentId: studentId },
      select: { teacherId: true, coursePlanId: true },
    });

    if (!factStudent) {
      throw new NotFoundException('Student not found in FactStudent');
    }

    const registers = await this.databaseService.factRegister.findMany({
      where: {
        studentId: studentId,
        gradeNumber: { not: null },
        creditRegis: { not: null },
        OR: [
          { studyYearInRegis: { lt: studyYear } },
          {
            studyYearInRegis: studyYear,
            studyTermInRegis: { lte: studyTerm },
          },
        ],
      },
      orderBy: {
        studyYearInRegis: 'desc',
        studyTermInRegis: 'desc',
      },
    });

    if (registers.length === 0) return null;

    const registerInTerm = registers.filter(
      r => r.studyYearInRegis === studyYear && r.studyTermInRegis === studyTerm
    );

    const creditTerm = registerInTerm.reduce(
      (sum, r) => sum + (r.creditRegis ?? 0),
      0
    );

    const creditAll = registers.reduce(
      (sum, r) => sum + (r.creditRegis ?? 0),
      0
    );

    const termSummary: Prisma.FactTermSummaryCreateInput = {
      studentId: studentId,
      studyYear: studyYear,
      studyTerm: studyTerm,
      semesterYearInTerm: registerInTerm[0].semesterYearInRegis!,
      semesterPartInTerm: registerInTerm[0].semesterPartInRegis!,
      creditAll: creditAll,
      creditTerm: creditTerm,
      gpa: calculateGPA(
        registerInTerm.map(r => ({
          grade: r.gradeNumber!,
          credit: r.creditRegis!,
        }))
      ),
      gpax: calculateGPA(
        registers.map(r => ({ grade: r.gradeNumber!, credit: r.creditRegis! }))
      ),
      isFollowPlan: await this.checkFollowPlan(studentId, studyYear, studyTerm),
      isCoopEligible: await this.checkIsEligibleForCoop(
        studentId,
        factStudent.coursePlanId,
        creditAll,
        studyYear,
        studyTerm
      ),
      teacher: {
        connect: { teacherId: factStudent.teacherId },
      },
    };

    const existingSummary =
      await this.databaseService.factTermSummary.findFirst({
        where: {
          studentId: studentId,
          studyYear,
          studyTerm,
        },
      });

    let summary: FactTermSummary;

    if (existingSummary) {
      summary = await this.databaseService.factTermSummary.update({
        where: { factTermSummaryId: existingSummary.factTermSummaryId },
        data: termSummary,
      });
    } else {
      summary = await this.databaseService.factTermSummary.create({
        data: termSummary,
      });
    }

    // todo: create term credit

    return summary;
  }
}
