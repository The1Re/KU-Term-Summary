import { Injectable, NotFoundException } from '@nestjs/common';
import { StudentService } from '../student/student.service';
import { StudentPlanService } from '../student-plan/student-plan.service';
import { DatabaseService } from '@/core/database/database.service';
import { StudentStatus } from '@/constants/studentStatus';
@Injectable()
export class TermSummaryUsecase {
  constructor(
    private readonly studentService: StudentService,
    private readonly studentPlanService: StudentPlanService,
    private readonly databaseService: DatabaseService
  ) {}

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

  async checkIsEligibleForCoop(studentId: string): Promise<boolean> {
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
    if (!latestTerm) throw new NotFoundException('Term summary not found');

    const creditAll = latestTerm.creditAll;
    const creditIntern = courseplan.creditIntern;

    const canGoCoop = creditAll >= creditIntern;

    if (!canGoCoop) return false;

    const isFollowPlan = await this.checkFollowPlan(
      studentId,
      Number(latestTerm.semesterYearInTerm),
      String(latestTerm.semesterPartInTerm)
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

    if (!Terms.length) throw new NotFoundException('Term summary not found');

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

    // เช็คจำนวนหน่วยกิต
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
}
