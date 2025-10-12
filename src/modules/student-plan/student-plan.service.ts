import { DatabaseService } from '@/core/database/database.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StudentPlanService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAllStudentPlan(studentId: number) {
    return this.databaseService.factStudentPlan.findMany({
      where: { studentId },
      include: {
        subjectCourse: {
          include: { subject: { include: { subCredit: true } } },
        },
      },
    });
  }
}
