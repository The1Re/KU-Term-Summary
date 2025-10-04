import { DatabaseService } from '@/core/database/database.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SubjectCourseService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAllSubjectCoursesByCoursePlanId(coursePlanId: number) {
    return this.databaseService.subjectCourse.findMany({
      where: { coursePlanId },
    });
  }
}
