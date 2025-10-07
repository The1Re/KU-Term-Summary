import { DatabaseService } from '@/core/database/database.service';
import { Injectable } from '@nestjs/common';
import { StudentService } from '../student/student.service';

@Injectable()
export class StudentPlanService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly studentService: StudentService
  ) {}

  async getStudentPlanByStudentId(studentId: string) {
    const studentPlan = await this.databaseService.factStdPlan.findMany({
      where: { studentId: studentId },
    });
    return studentPlan;
  }
}
