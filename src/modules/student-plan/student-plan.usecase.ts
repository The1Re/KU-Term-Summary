import { DatabaseService } from '@/core/database/database.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { FactRegister, Prisma } from '@prisma/client';
import { SubjectCourseService } from '@/modules/subject-course/subject-course.service';
import { RegisterService } from '@/modules/register/register.service';
import { StudentPlanService } from './student-plan.service';

@Injectable()
export class StudentPlanUsecase {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly studentPlanService: StudentPlanService,
    private readonly subjectCourseService: SubjectCourseService,
    private readonly registerService: RegisterService
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
              isRequire: true, // todo: recheck this field when subjectCourse schema change
            }) as Prisma.FactStudentPlanCreateManyInput
        ),
      }),
    ]);
    return true;
  }

  async updateStudentPlan(studentId: number) {
    const [studentPlan, registers] = await Promise.all([
      this.studentPlanService.getAllStudentPlan(studentId),
      this.registerService.getAllRegisterByStudentId(studentId),
    ]);

    // Group registers by subjectCourseId
    // previous term -> current term
    const groupRegisterBySubjectCourseId = registers.reduce((map, register) => {
      if (!register.subjectCourseId) return map;

      const list = map.get(register.subjectCourseId) ?? [];
      list.push(register);
      map.set(register.subjectCourseId, list);

      return map;
    }, new Map<number, FactRegister[]>());

    // only update student plan that are already registered
    const filteredStudentPlan = studentPlan.filter(plan =>
      groupRegisterBySubjectCourseId.has(plan.subjectCourseId)
    );

    await this.databaseService.$transaction(
      filteredStudentPlan.map(plan => {
        const registers =
          groupRegisterBySubjectCourseId.get(plan.subjectCourseId) ?? [];

        const latestRegister = registers[0];
        const isCurrentTermPass = (latestRegister.gradeNumber ?? 0) > 0;

        const note = registers
          .reverse()
          .map(register => register.gradeCharacter)
          .join(',');

        return this.databaseService.factStudentPlan.update({
          where: {
            studentId,
            factStudentPlanId: plan.factStudentPlanId,
          },
          data: {
            ...(isCurrentTermPass && {
              passYear: latestRegister.studyYearInRegis,
              passTerm: latestRegister.studyTermInRegis,
            }),
            isPass: isCurrentTermPass,
            stdGrade: latestRegister.gradeNumber,
            gradeDetails: note,
          },
        });
      })
    );

    return true;
  }
}
