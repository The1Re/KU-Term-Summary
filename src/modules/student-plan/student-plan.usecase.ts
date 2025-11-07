import { DatabaseService } from '@/core/database/database.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { FactRegister, FactStudentPlan, Prisma } from '@prisma/client';
import { SubjectCourseService } from '@/modules/subject-course/subject-course.service';
import { RegisterService } from '@/modules/register/register.service';
import { StudentPlanService } from './student-plan.service';
import { SpecialCase } from '@/constants';
import { normalizeSummerYear } from '@/core/utils/normalize';

@Injectable()
export class StudentPlanUsecase {
  private static readonly COURSE_COLOR_LABEL_IDS: number[] = [1, 2, 3, 4];
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly studentPlanService: StudentPlanService,
    private readonly subjectCourseService: SubjectCourseService,
    private readonly registerService: RegisterService
  ) {}

  private async resolveGradeLabelId(
    stdGrade: number | null,
    tx?: Prisma.TransactionClient
  ): Promise<number | null> {
    if (stdGrade === null || stdGrade < 0 || stdGrade > 4.0) return null;

    const db = tx ?? this.databaseService;

    const label = await db.gradeLabel.findFirst({
      where: {
        gradeLabelId: { in: StudentPlanUsecase.COURSE_COLOR_LABEL_IDS },
        gradeMinInStatus: { lte: stdGrade },
        gradeMaxStatus: { gte: stdGrade },
      },
      orderBy: { gradeMinInStatus: 'desc' },
      select: { gradeLabelId: true },
    });

    return label?.gradeLabelId ?? null;
  }

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
              isRequire: Boolean(subjectCourse.isRequire),
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

    const specialSubject = new Map<string, FactStudentPlan>();

    for (const plan of studentPlan) {
      const subjectCode = plan.subjectCourse.subject.subjectCode;
      if (subjectCode.includes(SpecialCase.SUBJECT)) {
        const newSubjectCode = subjectCode.replaceAll(SpecialCase.SUBJECT, '');
        if (newSubjectCode.length === 0) {
          continue;
        }
        specialSubject.set(newSubjectCode, plan);
      }
    }

    // Group registers by subjectCourseId
    // previous term -> current term
    const groupRegisterBySubjectCourseId = registers.reduce((map, register) => {
      let subjectCourseId = register.subjectCourseId;
      let foundSpecial = false;

      for (const key of specialSubject.keys()) {
        if (register.subjectCodeInRegis?.startsWith(key)) {
          const plan = specialSubject.get(key);
          if (plan) {
            subjectCourseId = plan.subjectCourseId;
            foundSpecial = true;
            break;
          }
        }
      }

      if (!subjectCourseId && !foundSpecial) {
        return map;
      }

      register.studyYearInRegis = normalizeSummerYear(
        register.studyYearInRegis!,
        register.studyTermInRegis!
      );

      const list = map.get(subjectCourseId!) ?? [];
      list.push(register);
      map.set(subjectCourseId!, list);

      return map;
    }, new Map<number, FactRegister[]>());

    // only update student plan that are already registered
    const filteredStudentPlan = studentPlan.filter(plan =>
      groupRegisterBySubjectCourseId.has(plan.subjectCourseId)
    );

    await this.databaseService.$transaction(async tx => {
      for (const plan of filteredStudentPlan) {
        const registers =
          groupRegisterBySubjectCourseId.get(plan.subjectCourseId) ?? [];

        const latestRegister = registers[0];

        const isCurrentTermPass =
          (latestRegister?.gradeNumber ?? 0) > 0 ||
          latestRegister?.gradeCharacter === 'P';

        const note = registers
          .reverse()
          .map(register => register.gradeCharacter)
          .join(',');

        const gradeLabelId = await this.resolveGradeLabelId(
          latestRegister.gradeNumber,
          tx
        );

        await tx.factStudentPlan.update({
          where: { studentId, factStudentPlanId: plan.factStudentPlanId },
          data: {
            ...(isCurrentTermPass && {
              passYear: latestRegister.studyYearInRegis,
              passTerm: latestRegister.studyTermInRegis,
            }),
            isPass: isCurrentTermPass,
            stdGrade: latestRegister.gradeNumber,
            gradeDetails: note,
            gradeLabelId,
          },
        });
      }
    });

    return true;
  }
}
