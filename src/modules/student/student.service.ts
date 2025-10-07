import { DatabaseService } from '@/core/database/database.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StudentService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getStudentById(studentId: string) {
    return this.databaseService.student.findUnique({
      where: { studentId: studentId },
    });
  }
}
