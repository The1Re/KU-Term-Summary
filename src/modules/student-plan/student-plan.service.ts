import { DatabaseService } from '@/core/database/database.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StudentPlanService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getStudentPlanByStudentId(studentId: string) {
    const studentPlan = await this.databaseService.factStdPlan.findMany({
      where: { studentId: studentId },
    });
    return studentPlan;
  }
}
