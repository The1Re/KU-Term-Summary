import { DatabaseService } from '@/core/database/database.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class RegisterService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAllRegisterByStudentId(
    studentId: number,
    whereClause?: Prisma.FactRegisterWhereInput
  ) {
    return this.databaseService.factRegister.findMany({
      where: { studentId: studentId, ...whereClause },
      orderBy: [{ studyYearInRegis: 'desc' }, { studyTermInRegis: 'desc' }],
    });
  }

  async getLastestRegistForSubjectCourse(
    studentId: number,
    subjectCourseId: number
  ) {
    return await this.databaseService.factRegister.findFirst({
      where: { studentId, subjectCourseId },
      orderBy: [{ studyYearInRegis: 'desc' }, { studyTermInRegis: 'desc' }],
    });
  }
}
