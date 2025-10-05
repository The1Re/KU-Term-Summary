import { DatabaseService } from '@/core/database/database.service';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SubjectCourseService } from '@/modules/subject-course/subject-course.service';
import { StudentService } from '@/modules/student/student.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class StudentPlanUsecase {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly studentService: StudentService,
    private readonly subjectCourseService: SubjectCourseService
  ) {}

  private mapTermToString(term: number): string {
    const termMap = ['ภาคต้น', 'ภาคปลาย', 'ภาคฤดูร้อน'];
    return termMap[term - 1] || 'ไม่รู้จัก';
  }

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

    try {
      await this.databaseService.$transaction(
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
                  semester: subjectCourse.studyYear,
                  semesterPartInYear: this.mapTermToString(
                    Number(subjectCourse.term)
                  ),
                }) as Prisma.FactStdPlanCreateManyInput
            ),
          }),
        ],
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        }
      );
      return { message: 'Student plan updated successfully' };
    } catch (_) {
      throw new InternalServerErrorException();
    }
  }
}
