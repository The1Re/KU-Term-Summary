import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { StudentService } from '../student/student.service';
import { StudentPlanService } from '../student-plan/student-plan.service';
import { DatabaseService } from '@/core/database/database.service';
import { StudentStatus } from '@/constants/studentStatus';
import { FactRegister, Prisma } from '@prisma/client';
import { RegisterService } from '../register/register.service';
@Injectable()
export class TermSummaryUsecase {
  constructor(
    private readonly studentService: StudentService,
    private readonly studentPlanService: StudentPlanService,
    private readonly registerService: RegisterService,
    private readonly databaseService: DatabaseService
  ) {}

  private calculateGpa(registers: FactRegister[]) {
    const excludedGrades = ['W', 'I', 'S', 'U', 'P'];

    const valid = registers.filter(
      r =>
        r.gradeNumber !== null &&
        r.creditRegis > 0 &&
        !excludedGrades.includes(r.gradeCharacter?.toUpperCase() ?? '')
    );

    if (valid.length === 0)
      return { gpa: 0, totalCredits: 0, totalWeightedPoints: 0 };

    const totalWeightedPoints = valid.reduce(
      (sum, r) => sum + (r.gradeNumber ?? 0) * r.creditRegis,
      0
    );
    const totalCredits = valid.reduce((sum, r) => sum + r.creditRegis, 0);
    const gpa = totalCredits > 0 ? totalWeightedPoints / totalCredits : 0;

    if (!registers || registers.length === 0) {
      return { gpa: 0, totalCredits: 0, totalWeightedPoints: 0 };
    }

    return {
      gpa: parseFloat(gpa.toFixed(2)),
      totalCredits,
      totalWeightedPoints,
    };
  }

  getTermsForFilter(term: string): string[] {
    switch (term) {
      case 'ภาคต้น':
        return ['ภาคต้น'];
      case 'ภาคปลาย':
      case 'ภาคฤดูร้อน':
        return ['ภาคต้น', 'ภาคปลาย'];
      default:
        return [term];
    }
  }

  async checkFollowPlan(
    studentId: string,
    semester: number,
    semesterPartInYear: string
  ) {
    const student = await this.studentService.getStudentById(studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const studentPlan =
      await this.studentPlanService.getStudentPlanByStudentId(studentId);
    if (studentPlan.length === 0) {
      throw new NotFoundException('Student plan not found');
    }

    const countPlanNotPass = await this.databaseService.factStdPlan.count({
      where: {
        studentId: studentId,
        isPass: false,
        OR: [
          {
            semester: { lt: semester },
          },
          {
            semester: semester,
            semesterPartInYear: {
              in: this.getTermsForFilter(semesterPartInYear),
            },
          },
        ],
      },
    });

    return !countPlanNotPass;
  }

  async checkIsEligibleForCoop(
    studentId: string,
    year: number,
    term: string
  ): Promise<boolean> {
    const student = await this.studentService.getStudentById(studentId);
    if (!student) throw new NotFoundException('Student not found');

    const courseplan = await this.databaseService.coursePlan.findUnique({
      where: { coursePlanId: student.coursePlanId },
    });
    if (!courseplan) throw new NotFoundException('Course plan not found');

    const latestTerm = await this.databaseService.factTermSummary.findFirst({
      where: { studentId },
      orderBy: [{ studyYear: 'desc' }, { studyTerm: 'desc' }],
    });

    const creditAll = latestTerm?.creditAll ?? 0;
    const creditIntern = courseplan.creditIntern;

    const canGoCoop = creditAll >= creditIntern;

    if (!canGoCoop) return false;

    const isFollowPlan = await this.checkFollowPlan(
      studentId,
      Number(year),
      String(term)
    );

    return isFollowPlan;
  }

  async checkStudentStatus(
    studentId: string,
    semester: number,
    semesterPartInYear: string
  ) {
    if (semesterPartInYear === 'ภาคฤดูร้อน') {
      return StudentStatus.STUDYING;
    }
    const student = await this.studentService.getStudentById(studentId);
    if (!student) throw new NotFoundException('Student not found');

    const courseplan = await this.databaseService.coursePlan.findUnique({
      where: { coursePlanId: student.coursePlanId },
    });
    if (!courseplan) throw new NotFoundException('Course plan not found');

    const Terms = await this.databaseService.factTermSummary.findMany({
      where: { studentId, semesterPartInTerm: { in: ['ภาคต้น', 'ภาคปลาย'] } },
      orderBy: [{ studyYear: 'desc' }, { studyTerm: 'desc' }],
      take: 2,
    });

    if (!Terms.length) return StudentStatus.STUDYING;

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
          return StudentStatus.TERMINATION;
        }
      }
    }

    if (latestTerm.creditAll >= courseplan.totalCredit) {
      const isFollowPlan = await this.checkFollowPlan(
        studentId,
        semester,
        semesterPartInYear
      );
      if (isFollowPlan) return StudentStatus.GRADUATED;
    }

    return StudentStatus.STUDYING;
  }

  async getCurrentYearTerm(studentId: string) {
    const latest = await this.databaseService.factRegister.findFirst({
      where: { studentId },
      orderBy: [{ studyYearInRegis: 'desc' }, { studyTermInRegis: 'desc' }],
      select: {
        studyYearInRegis: true,
        studyTermInRegis: true,
        semesterYearInRegis: true,
        semesterPartInRegis: true,
      },
    });

    return latest;
  }

  async summaryTermForStudent(studentId: string) {
    const lastYearTerm = await this.getCurrentYearTerm(studentId);
    if (!lastYearTerm) return null; // ถ้าไม่มีข้อมูล return null

    const regist = await this.databaseService.factRegister.findMany({
      where: {
        studentId,
        studyYearInRegis: lastYearTerm.studyYearInRegis,
        studyTermInRegis: lastYearTerm.studyTermInRegis,
      },
      orderBy: [{ studyYearInRegis: 'asc' }, { studyTermInRegis: 'asc' }],
      include: {
        subject_course: {
          include: {
            subject: {
              include: {
                subject_caterogy: true,
              },
            },
          },
        },
      },
    });

    if (regist.length === 0) return null;

    const studyYear = regist[0].studyYearInRegis;
    const studyTerm = regist[0].studyTermInRegis;
    const semesterYearInTerm = regist[0].semesterYearInRegis;
    const semesterPartInTerm = regist[0].semesterPartInRegis;

    const creditTerm = regist.reduce((sum, r) => sum + r.creditRegis, 0);

    let generalSubjectCredit = 0;
    let specificSubjectCredit = 0;
    let freeSubjectCredit = 0;
    const selectSubjectCredit = 0;

    for (const r of regist) {
      const categoryId =
        r.subject_course.subject.subject_caterogy.subjectCaterogyId;

      switch (categoryId) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          generalSubjectCredit += r.creditRegis;
          break;
        case 6:
          freeSubjectCredit += r.creditRegis;
          break;
        case 7:
        case 8:
        case 9:
          specificSubjectCredit += r.creditRegis;
          break;
      }
    }

    const previousTermSummary =
      await this.databaseService.factTermSummary.findFirst({
        where: { studentId },
        orderBy: [
          { semesterYearInTerm: 'desc' },
          { semesterPartInTerm: 'desc' },
        ],
      });

    const creditAll = (previousTermSummary?.creditAll ?? 0) + creditTerm;
    const generalSubjectCreditAll =
      (previousTermSummary?.generalSubjectCreditAll ?? 0) +
      generalSubjectCredit;
    const specificSubjectCreditAll =
      (previousTermSummary?.specificSubjectCreditAll ?? 0) +
      specificSubjectCredit;
    const freeSubjectCreditAll =
      (previousTermSummary?.freeSubjectCreditAll ?? 0) + freeSubjectCredit;
    const selectSubjectCreditAll =
      (previousTermSummary?.selectSubjectCreditAll ?? 0) + selectSubjectCredit;

    const gpa = await this.getGpa(
      studentId,
      semesterYearInTerm,
      semesterPartInTerm
    );
    const gpax = await this.getGpax(studentId);

    const planStatusBool = await this.checkFollowPlan(
      studentId,
      studyYear,
      semesterPartInTerm
    );
    const planStatus = planStatusBool ? 'ผ่าน' : 'ไม่ผ่าน';

    const isCoopAllowed = await this.checkIsEligibleForCoop(
      studentId,
      semesterYearInTerm,
      semesterPartInTerm
    );
    const studentStatus = await this.checkStudentStatus(
      studentId,
      studyYear,
      semesterPartInTerm
    );

    const gradeLabelId = null;

    const toCreate: Prisma.FactTermSummaryCreateManyInput = {
      studentId,
      creditTerm,
      creditAll,
      gpa,
      gpax,
      studyYear,
      studyTerm,
      planStatus,
      studentStatus,
      isCoop: isCoopAllowed,
      generalSubjectCredit,
      specificSubjectCredit,
      freeSubjectCredit,
      selectSubjectCredit,
      generalSubjectCreditAll,
      specificSubjectCreditAll,
      freeSubjectCreditAll,
      selectSubjectCreditAll,
      semesterYearInTerm,
      semesterPartInTerm,
      gradeLabelId: gradeLabelId ?? null,
    };
    const created = await this.databaseService.factTermSummary.create({
      data: toCreate,
    });

    return created;
  }

  async getGpa(studentId: string, year: number, term: string) {
    const student = await this.studentService.getStudentById(studentId);
    if (!student) throw new NotFoundException('Student not found');

    const registers = await this.databaseService.factRegister.findMany({
      where: {
        studentId,
        semesterYearInRegis: year,
        semesterPartInRegis: term,
      },
    });

    if (!registers || registers.length === 0) {
      throw new NotFoundException(
        'No register records found for the given term'
      );
    }

    try {
      const { gpa } = this.calculateGpa(registers);
      return gpa;
    } catch (_error) {
      throw new InternalServerErrorException('Failed to calculate GPA');
    }
  }

  async getGpax(studentId: string) {
    const student = await this.studentService.getStudentById(studentId);
    if (!student) throw new NotFoundException('Student not found');

    try {
      const registers = await this.databaseService.factRegister.findMany({
        where: { studentId },
      });

      const { gpa } = this.calculateGpa(registers);

      return gpa;
    } catch (_error) {
      throw new InternalServerErrorException('Failed to calculate GPAX');
    }
  }
}
