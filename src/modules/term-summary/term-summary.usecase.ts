import { Injectable } from '@nestjs/common';
import { StudentService } from '../student/student.service';
import { StudentPlanService } from '../student-plan/student-plan.service';
import { DatabaseService } from '@/core/database/database.service';

@Injectable()
export class TermSummaryUsecase {
  private termOrderMap: Record<string, number> = {
    first: 1,
    final: 2,
    summer: 3,
  };

  constructor(
    private readonly studentService: StudentService,
    private readonly studentPlanService: StudentPlanService,
    private readonly databaseService: DatabaseService
  ) {}
}
