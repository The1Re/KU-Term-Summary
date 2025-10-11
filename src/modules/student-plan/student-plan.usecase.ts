import { DatabaseService } from '@/core/database/database.service';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SubjectCourseService } from '../subject-course/subject-course.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class StudentPlanUsecase {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly subjectCourseService: SubjectCourseService
  ) {}

  async createStudentPlan(studentId: number) {
    const coursePlanId = await this.databaseService.factStudent.findFirst({
      where: { studentId: studentId },
      select: { coursePlanId: true },
    });

    if (!coursePlanId?.coursePlanId) {
      throw new NotFoundException(
        `Course plan not found for the studentId: ${studentId}`
      );
    }

    const subjectCourses = await this.subjectCourseService.getAllSubjectCourses(
      coursePlanId.coursePlanId
    );

    if (subjectCourses.length === 0) {
      throw new NotFoundException(
        `Subject courses not found for the coursePlanId: ${coursePlanId.coursePlanId}`
      );
    }

    try {
      await this.databaseService.$transaction([
        this.databaseService.factStudentPlan.deleteMany({
          where: { studentId },
        }),
        this.databaseService.factStudentPlan.createMany({
          data: subjectCourses.map(
            subjectCourse =>
              ({
                studentId,
                subjectCourseId: subjectCourse.subjectCourseId,
              }) as Prisma.FactStudentPlanCreateManyInput
          ),
        }),
      ]);
    } catch (_) {
      throw new InternalServerErrorException();
    }
  }
}
