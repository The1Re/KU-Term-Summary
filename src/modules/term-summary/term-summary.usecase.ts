import { Injectable, NotFoundException } from '@nestjs/common';
import { StudentService } from '../student/student.service';
import { StudentPlanService } from '../student-plan/student-plan.service';
import { DatabaseService } from '@/core/database/database.service';

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
    studentId: number,
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
}
