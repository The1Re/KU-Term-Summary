import { StudentStatus } from '@/constants';
import { MainSubject } from '@/constants/mainSubject';
import { DatabaseService } from '@/core/database/database.service';
import { calculateGPA } from '@/core/utils/calculate';
import { Injectable, NotFoundException } from '@nestjs/common';
import { FactTermCredit, FactTermSummary, Prisma } from '@prisma/client';
import { StudentService } from '../student/student.service';
import { TermCreditService } from '../term-credit/term-credit.service';

@Injectable()
export class TermSummaryUseCase {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly studentService: StudentService,
    private readonly termCreditService: TermCreditService
  ) {}

  async checkFollowPlan(studentId: number, year: number, term: number) {
    const countPlanNotPass = await this.databaseService.factStudentPlan.count({
      where: {
        studentId: studentId,
        isPass: false,
        OR: [
          {
            subjectCourse: {
              partYear: { lt: year },
            },
          },
          {
            subjectCourse: {
              partYear: year,
              stdTerm: {
                lte: term,
              },
            },
          },
          {
            subjectCourse: {
              subject: {
                subjectCategory: {
                  categoryName: {
                    in: [MainSubject.CORE, MainSubject.SPECIAL],
                  },
                },
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
    term: number,
    termCredit: FactTermCredit[]
  ) {
    const coursePlan = await this.databaseService.coursePlan.findUnique({
      where: { coursePlanId },
    });

    const creditIntern = coursePlan?.creditIntern ?? 0;
    const canGoCoop = creditAll >= creditIntern;
    if (!canGoCoop) return false;

    if (!termCredit || termCredit.length === 0) {
      return false;
    }

    const allCategoriesMet = termCredit.every(tc => {
      const required = tc.creditRequire_ ?? 0;
      const passed = tc.creditPass ?? 0;
      return passed >= required;
    });

    if (!allCategoriesMet) return false;

    const isFollowPlan = await this.checkFollowPlan(studentId, year, term);
    if (isFollowPlan) {
      return true;
    }
    return false;
  }

  async checkStudentStatus(
    studentId: number,
    totalCredit: number,
    year: number,
    term: number
  ) {
    if (term === 3) {
      return StudentStatus.ACTIVE;
    }
    const Terms = await this.databaseService.factTermSummary.findMany({
      where: { studentId, studyTerm: { in: [0, 1] } },
      orderBy: [{ studyYear: 'desc' }, { studyTerm: 'desc' }],
      take: 2,
    });
    if (!Terms.length) return StudentStatus.ACTIVE;

    const [latestTerm, previousTerm] = Terms;

    const isFirstTerm = (year: number, term: number) =>
      year === 1 && term === 1;
    const gpaxLow = latestTerm.gpax < 1.75;
    const gpaxCritical = latestTerm.gpax < 1.5;
    const previousGpaxLow = previousTerm?.gpax < 1.75;
    if (gpaxLow && !isFirstTerm(latestTerm.studyYear, latestTerm.studyTerm)) {
      if (gpaxCritical || previousGpaxLow) {
        if (
          !isFirstTerm(
            previousTerm?.studyYear ?? 1,
            previousTerm?.studyTerm ?? 1
          )
        ) {
          return StudentStatus.EXPELLED;
        }
      }
    }
    if (latestTerm.creditAll >= totalCredit) {
      const isFollowPlan = await this.checkFollowPlan(studentId, year, term);
      if (isFollowPlan) return StudentStatus.EXPECTED_GRADUATION;
    }

    return StudentStatus.ACTIVE;
  }

  async createOrUpdateTermSummary(
    studentId: number,
    studyYear: number,
    studyTerm: number
  ): Promise<FactTermSummary | null> {
    const factStudent = await this.studentService.getStudentById(studentId);

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
      orderBy: [
        {
          studyYearInRegis: 'desc',
        },
        {
          studyTermInRegis: 'desc',
        },
      ],
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
      semesterPartInTerm: studyTerm,
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
      isCoopEligible: false,
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

    const totalCredit = factStudent.coursePlan.totalCredit ?? 0;
    const studentStatusId = await this.checkStudentStatus(
      studentId,
      totalCredit,
      studyYear,
      studyTerm
    );

    await this.studentService.updateStudentStatus(studentId, studentStatusId);

    const termCredits = await this.termCreditService.createTermCredit(
      summary.factTermSummaryId,
      studentId,
      factStudent.coursePlanId,
      studyYear,
      studyTerm
    );

    const isCoopEligible = await this.checkIsEligibleForCoop(
      studentId,
      factStudent.coursePlanId,
      summary.creditAll,
      studyYear,
      studyTerm,
      termCredits
    );

    summary = await this.databaseService.factTermSummary.update({
      where: { factTermSummaryId: summary.factTermSummaryId },
      data: { isCoopEligible: isCoopEligible },
    });

    return summary;
  }

  async latestTermSummary(studentId: number) {
    const latestRegister = await this.databaseService.factRegister.findFirst({
      where: { studentId },
      orderBy: [{ studyYearInRegis: 'desc' }, { studyTermInRegis: 'desc' }],
      select: {
        studyYearInRegis: true,
        studyTermInRegis: true,
      },
    });

    if (!latestRegister) return null;

    if (
      latestRegister.studyYearInRegis === null ||
      latestRegister.studyTermInRegis === null
    ) {
      return null;
    }
    return {
      year: latestRegister.studyYearInRegis,
      term: latestRegister.studyTermInRegis,
    };
  }

  async getAllTerm(studentId: number) {
    return await this.databaseService.factRegister.groupBy({
      by: ['studyYearInRegis', 'studyTermInRegis'],
      where: { studentId },
      orderBy: [{ studyYearInRegis: 'desc' }, { studyTermInRegis: 'desc' }],
    });
  }
}
