import { DatabaseService } from '@/core/database/database.service';
import { Injectable } from '@nestjs/common';

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
                lt: term,
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
}
