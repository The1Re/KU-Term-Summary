import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/core/database/database.service';
import { StudentStatus } from '@/constants';

@Injectable()
export class StudentService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getStudentById(studentId: number) {
    return await this.databaseService.factStudent.findFirst({
      where: { studentId },
      include: {
        coursePlan: {
          select: { totalCredit: true },
        },
      },
    });
  }

  async getAllStudents() {
    return await this.databaseService.factStudent.findMany({
      where: {
        studentStatusId: StudentStatus.ACTIVE,
      },
    });
  }

  async updateStudentStatus(studentId: number, studentStatusId: number) {
    return await this.databaseService.factStudent.updateMany({
      where: { studentId },
      data: { studentStatusId },
    });
  }
}
