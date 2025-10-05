import { Injectable, NotFoundException } from '@nestjs/common';
import { StudentService } from '../student/student.service';
import { StudentPlanService } from '../student-plan/student-plan.service';

@Injectable()
export class CurriculumService {
  private termOrderMap: Record<string, number> = {
    ภาคต้น: 1,
    ภาคปลาย: 2,
    ซัมเมอร์: 3,
  };

  constructor(
    private readonly studentService: StudentService,
    private readonly studentPlanService: StudentPlanService
  ) {}

  private compareTerm(
    semA: number,
    partA: string,
    semB: number,
    partB: string
  ): number {
    if (semA < semB) return -1;
    if (semA > semB) return 1;

    const orderA = this.termOrderMap[partA] ?? 0;
    const orderB = this.termOrderMap[partB] ?? 0;

    if (orderA < orderB) return -1;
    if (orderA > orderB) return 1;
    return 0;
  }

  async checkCurriculumStudent(
    studentId: number,
    semester: number,
    term: string
  ) {
    const student = await this.studentService.getStudentById(studentId);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const studentPlan =
      await this.studentPlanService.getStudentPlanByStudentId(studentId);
    if (studentPlan.length === 0) {
      throw new NotFoundException('Student plan not found');
    }
    let minSemester = studentPlan[0].semester;
    let minPart = studentPlan[0].semesterPartInYear;
    for (const sp of studentPlan) {
      if (
        this.compareTerm(
          sp.semester,
          sp.semesterPartInYear,
          minSemester,
          minPart
        ) === -1
      ) {
        minSemester = sp.semester;
        minPart = sp.semesterPartInYear;
      }
    }

    for (const sp of studentPlan) {
      if (
        this.compareTerm(
          sp.semester,
          sp.semesterPartInYear,
          minSemester,
          minPart
        ) === -1
      ) {
        continue; // ก่อนช่วงเริ่มต้น
      }
      if (
        this.compareTerm(sp.semester, sp.semesterPartInYear, semester, term) ===
        1
      ) {
        continue; // หลัง target
      }

      if (sp.isPass !== 1) {
        return false;
      }
    }

    return true; // ผ่านทุกตัว
  }
}
