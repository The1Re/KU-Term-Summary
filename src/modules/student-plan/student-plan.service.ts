import { DatabaseService } from '@/core/database/database.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { SubjectCourseService } from '@/modules/subject-course/subject-course.service';
import { StudentService } from '@/modules/student/student.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class StudentPlanService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly studentService: StudentService,
    private readonly subjectCourseService: SubjectCourseService
  ) {}

  async createStudentPlan(studentId: number) {
    const student = await this.studentService.getStudentById(studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const subjectCourses =
      await this.subjectCourseService.getAllSubjectCoursesByCoursePlanId(
        student.coursePlanId
      );
    if (subjectCourses.length === 0) {
      throw new NotFoundException(
        'No subject courses found for this course plan'
      );
    }

    const [_, result] = await this.databaseService.$transaction(
      [
        this.databaseService.factStdPlan.deleteMany({
          where: { studentId: studentId },
        }),
        this.databaseService.factStdPlan.createMany({
          data: subjectCourses.map(
            subjectCourse =>
              ({
                studentId: studentId,
                subjectCourseId: subjectCourse.subjectCourseId,
              }) as Prisma.FactStdPlanCreateManyInput
          ),
        }),
      ],
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    return result;
  }

  async getStudentPlanByStudentId(studentId: number) {
    const studentPlan = await this.databaseService.factStdPlan.findMany({
      where: { studentId: studentId },
    });
    return studentPlan;
  }
}
