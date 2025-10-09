import { DatabaseService } from '@/core/database/database.service';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { StudentService } from '@/modules/student/student.service';
import { FactRegister, Prisma } from '@prisma/client';
import { StudentPlanService } from './student-plan.service';
import { SubjectCourseService } from '@/modules/subject-course/subject-course.service';
import { RegisterService } from '@/modules/register/register.service';

@Injectable()
export class StudentPlanUsecase {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly studentService: StudentService,
    private readonly subjectCourseService: SubjectCourseService,
    private readonly studentPlanService: StudentPlanService,
    private readonly registerService: RegisterService
  ) {}

  private mapTermToString(term: number): string {
    const termMap = ['ภาคต้น', 'ภาคปลาย', 'ภาคฤดูร้อน'];
    return termMap[term - 1] || 'ไม่รู้จัก';
  }

  async createStudentPlan(studentId: string) {
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
                  studyYear: subjectCourse.studyYear,
                  studyTerm: subjectCourse.term,
                }) as Prisma.FactStdPlanCreateManyInput
            ),
          }),
        ],
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        }
      );
      return true;
    } catch (_) {
      throw new InternalServerErrorException();
    }
  }

  async updateStudentPlan(studentId: string) {
    try {
      const [studentPlan, registers] = await Promise.all([
        this.studentPlanService.getStudentPlanByStudentId(studentId),
        this.registerService.getAllRegistersByStudentId(studentId),
      ]);

      // Group registers by subjectCourseId
      // previous term -> current term
      const groupRegisterBySubjectCourseId = registers.reduce(
        (map, register) => {
          const list = map.get(register.subjectCourseId) ?? [];
          list.push(register);
          map.set(register.subjectCourseId, list);
          return map;
        },
        new Map<number, FactRegister[]>()
      );

      // only update student plan that are already registered
      const filteredStudentPlan = studentPlan.filter(plan =>
        groupRegisterBySubjectCourseId.has(plan.subjectCourseId)
      );

      await this.databaseService.$transaction(
        filteredStudentPlan.map(plan => {
          const registers =
            groupRegisterBySubjectCourseId.get(plan.subjectCourseId) ?? [];

          const note = registers
            .map(register => register.gradeCharacter)
            .join(' -> ');

          return this.databaseService.factStdPlan.update({
            where: {
              studentId,
              stdPlanId: plan.stdPlanId,
            },
            data: {
              isPass: registers.some(r => r.gradeNumber ?? 0 > 0),
              grade: registers[registers.length - 1].gradeCharacter, // latest grade
              note: registers.length > 1 ? note : null,
            },
          });
        })
      );

      return true;
    } catch (_) {
      throw new InternalServerErrorException();
    }
  }
}
