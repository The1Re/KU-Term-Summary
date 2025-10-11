import { DatabaseService } from '@/core/database/database.service';
import { Injectable } from '@nestjs/common';
import { StudentPlanService } from '../student-plan/student-plan.service';

@Injectable()
export class TermSummaryUseCase {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly studentPlanService: StudentPlanService
  ) {}

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
}
