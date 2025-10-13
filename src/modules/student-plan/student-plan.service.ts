import { DatabaseService } from '@/core/database/database.service';
import { Injectable } from '@nestjs/common';
import { StudentPlanWithLast } from '@/modules/student-plan/types/student-plan.types';

@Injectable()
export class StudentPlanService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getAllStudentPlan(studentId: number) {
    const studentPlans = await this.databaseService.factStudentPlan.findMany({
      where: { studentId },
      include: {
        subjectCourse: {
          include: {
            subject: { include: { subCredit: true, subjectCategory: true } },
          },
        },
      },
    });

    const subjectCourseIds = studentPlans.map(p => p.subjectCourseId);
    if (subjectCourseIds.length === 0) return studentPlans;

    const registers = await this.databaseService.factRegister.findMany({
      where: {
        studentId,
        subjectCourseId: { in: subjectCourseIds },
      },
      orderBy: [{ studyYearInRegis: 'desc' }, { studyTermInRegis: 'desc' }],
    });

    const latestRegMap = new Map<number, (typeof registers)[0]>();
    for (const reg of registers) {
      const scId = reg.subjectCourseId;
      if (scId === null) continue;
      if (!latestRegMap.has(scId)) latestRegMap.set(scId, reg);
    }

    const result = studentPlans.map(plan => {
      const latestReg = latestRegMap.get(plan.subjectCourseId);
      return {
        ...plan,
        lastRegisterYear: latestReg?.studyYearInRegis ?? null,
        lastRegisterTerm: latestReg?.studyTermInRegis ?? null,
      } as StudentPlanWithLast;
    });
    return result;
  }
}
