import { GPA_INCLUDED, StudentStatus } from '@/constants';
import { DatabaseService } from '@/core/database/database.service';
import { calculateGPA } from '@/core/utils/calculate';
import { Injectable, NotFoundException } from '@nestjs/common';
import { FactTermCredit, FactTermSummary, Prisma } from '@prisma/client';
import { StudentService } from '../student/student.service';
import { TermCreditService } from '../term-credit/term-credit.service';
import { normalizeSummerYear } from '@/core/utils/normalize';

@Injectable()
export class TermSummaryUseCase {
  private static readonly TERM_STATUS_LABEL_IDS: number[] = [5, 6, 7, 8];

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly studentService: StudentService,
    private readonly termCreditService: TermCreditService
  ) {}

  private async resolveGradeLabelIdFromGpax(gpax: number | null) {
    if (gpax === null || gpax < 0 || gpax > 4.0) return null;

    const label = await this.databaseService.gradeLabel.findFirst({
      where: {
        gradeLabelId: { in: TermSummaryUseCase.TERM_STATUS_LABEL_IDS },
        gradeMinInStatus: { lte: gpax },
        gradeMaxStatus: { gte: gpax },
      },
      orderBy: { gradeMinInStatus: 'desc' },
      select: { gradeLabelId: true },
    });

    return label?.gradeLabelId ?? null;
  }

  async checkFollowPlan(studentId: number, year: number, term: number) {
    const [creditRequire, studentPlan] = await Promise.all([
      this.databaseService.$queryRaw<
        {
          subjectCategoryId: number;
          credit: number;
        }[]
      >`
        SELECT
         	cr.subject_category_id AS subjectCategoryId,
          SUM(crd.credit) AS credit
        FROM fact_student fs
        JOIN course_plan cp ON cp.course_plan_id = fs.course_plan_id
        JOIN credit_require cr ON cr.course_plan_id = cp.course_plan_id
        JOIN credit_require_detail crd ON crd.credit_require_id = cr.credit_require_id
        WHERE 1=1
         	AND fs.student_id = ${studentId}
          AND (
       	    crd.study_year < ${year}
            OR
            (crd.study_year = ${year} AND crd.study_term <= ${term})
          )
        GROUP BY cr.subject_category_id
      `,
      this.databaseService.$queryRaw<
        {
          subjectCategoryId: number;
          totalCredit: number;
          isPass: boolean;
        }[]
      >`
        SELECT
          s.subject_category_id AS subjectCategoryId,
          SUM(subc.credit) AS totalCredit
        FROM
          fact_student_plan AS fsp
        JOIN subject_course sc ON sc.subject_course_id = fsp.subject_course_id
        JOIN subject s ON s.subject_id = sc.subject_id
        JOIN sub_credit subc ON subc.sub_credit_id = s.sub_credit_id
        WHERE 1=1
          AND fsp.student_id = ${studentId}
          AND fsp.is_pass = 1
          AND fsp.std_grade BETWEEN 1 AND 4
          AND (
            fsp.pass_year < ${year}
            OR
            (fsp.pass_year = ${year} AND fsp.pass_term <= ${term})
          )
        GROUP BY s.subject_category_id
      `,
    ]);

    const planMap = new Map<number, number>();
    for (const sp of studentPlan) {
      planMap.set(sp.subjectCategoryId, sp.totalCredit);
    }

    for (const cr of creditRequire) {
      const total = planMap.get(cr.subjectCategoryId) ?? 0;
      if (total < cr.credit) return false;
    }
    return true;
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
    term: number,
    termCredit: FactTermCredit[]
  ) {
    if (term === 3) {
      return StudentStatus.ACTIVE;
    }
    const Terms = await this.databaseService.factTermSummary.findMany({
      where: { studentId, studyTerm: { in: [1, 2] } },
      orderBy: [{ studyYear: 'desc' }, { studyTerm: 'desc' }],
      take: 2,
    });
    if (Terms.length === 0) return StudentStatus.ACTIVE;

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
    const allCategoriesMet = termCredit.every(tc => {
      const required = tc.creditRequire_ ?? 0;
      const passed = tc.creditPass ?? 0;
      return passed >= required;
    });
    if (latestTerm.creditAll >= totalCredit && allCategoriesMet) {
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

    const _registers = this.databaseService.factRegister.findMany({
      where: {
        studentId: studentId,
        gradeNumber: { not: null },
        gradeCharacter: { in: GPA_INCLUDED },
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

    const _existingSummary = this.databaseService.factTermSummary.findFirst({
      where: {
        studentId: studentId,
        studyYear,
        studyTerm,
      },
    });

    const [registers, existingSummary] = await Promise.all([
      _registers,
      _existingSummary,
    ]);
    if (registers.length === 0) return null;

    const registerInTerm = registers.filter(
      r => r.studyYearInRegis === studyYear && r.studyTermInRegis === studyTerm
    );

    const creditTerm = registerInTerm.reduce(
      (sum, r) => sum + (r.gradeCharacter === 'F' ? 0 : (r.creditRegis ?? 0)),
      0
    );
    const creditAll = registers.reduce(
      (sum, r) => sum + (r.gradeCharacter === 'F' ? 0 : (r.creditRegis ?? 0)),
      0
    );

    studyYear = normalizeSummerYear(studyYear, studyTerm);

    const gpaTerm = calculateGPA(
      registerInTerm.map(r => ({
        grade: r.gradeNumber!,
        credit: r.creditRegis!,
      }))
    );
    const gpaxAll = calculateGPA(
      registers.map(r => ({ grade: r.gradeNumber!, credit: r.creditRegis! }))
    );

    const gradeLabelId = await this.resolveGradeLabelIdFromGpax(gpaxAll);

    const termSummary: Prisma.FactTermSummaryCreateInput = {
      studyYear: studyYear,
      studyTerm: studyTerm,
      semesterYearInTerm: registerInTerm[0].semesterYearInRegis!,
      semesterPartInTerm: studyTerm,
      creditAll: creditAll,
      creditTerm: creditTerm,
      gpa: gpaTerm,
      gpax: gpaxAll,
      gradeLabel: gradeLabelId
        ? {
            connect: { gradeLabelId: gradeLabelId },
          }
        : undefined,
      isFollowPlan: await this.checkFollowPlan(studentId, studyYear, studyTerm),
      isCoopEligible: false,
      teacher: {
        connect: { teacherId: factStudent.teacherId },
      },
      student: {
        connect: { studentId: studentId },
      },
    };

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

    const termCredits = await this.termCreditService.createTermCredit(
      summary.factTermSummaryId,
      studentId,
      factStudent.coursePlanId,
      studyYear,
      studyTerm
    );

    const totalCredit = factStudent.coursePlan.totalCredit ?? 0;
    const studentStatusId = await this.checkStudentStatus(
      studentId,
      totalCredit,
      studyYear,
      studyTerm,
      termCredits
    );
    await this.studentService.updateStudentStatus(studentId, studentStatusId);

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
