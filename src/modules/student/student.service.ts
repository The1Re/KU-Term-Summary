import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@/core/database/database.service';

@Injectable()
export class StudentService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getStudentById(studentId: number) {
    return await this.databaseService.factStudent.findFirst({
      where: { studentId },
    });
  }
}
