import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { DatabaseService } from '@/core/database/database.service';
import { StudentService } from '@/modules/student/student.service';
import { FactRegister } from '@prisma/client';

@Injectable()
export class RegisterUsecase {
  //เอาไว้กรอกเอาแค่ที่เป็นเกรด ไม่เอา w i p s u (พวกถอน ผ่าน ไม่ผ่าน ติด i)
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly studentService: StudentService
  ) {}

  private calculateGpa(registers: FactRegister[]) {
    const excludedGrades = ['W', 'I', 'S', 'U', 'P'];

    const valid = registers.filter(
      r =>
        r.gradeNumber !== null &&
        r.creditRegis > 0 &&
        !excludedGrades.includes(r.gradeCharacter?.toUpperCase() ?? '')
    );

    if (valid.length === 0)
      return { gpa: 0, totalCredits: 0, totalWeightedPoints: 0 };

    const totalWeightedPoints = valid.reduce(
      (sum, r) => sum + (r.gradeNumber ?? 0) * r.creditRegis,
      0
    );
    const totalCredits = valid.reduce((sum, r) => sum + r.creditRegis, 0);
    const gpa = totalCredits > 0 ? totalWeightedPoints / totalCredits : 0;

    if (!registers || registers.length === 0) {
      return { gpa: 0, totalCredits: 0, totalWeightedPoints: 0 };
    }

    return {
      gpa: parseFloat(gpa.toFixed(2)),
      totalCredits,
      totalWeightedPoints,
    };
  }

  async getCurrentYearTerm(studentId: string) {
    return this.databaseService.factRegister.findFirst({
      where: { studentId },
      orderBy: [{ studyYearInRegis: 'desc' }, { studyTermInRegis: 'desc' }],
      select: {
        studyYearInRegis: true,
        studyTermInRegis: true,
        semesterYearInRegis: true,
        semesterPartInRegis: true,
      },
    });
  }
  //รอปริ้นรวมเดียวเอา getCurrentYearTerm ออก และเรียกเอา

  async getGpa(studentId: string) {
    const student = await this.studentService.getStudentById(studentId);
    if (!student) throw new NotFoundException('Student not found');

    const latestTerm = await this.getCurrentYearTerm(studentId);
    if (!latestTerm) throw new NotFoundException('No register records found');

    try {
      const registers = await this.databaseService.factRegister.findMany({
        where: {
          studentId,
          studyYearInRegis: latestTerm.studyYearInRegis,
          studyTermInRegis: latestTerm.studyTermInRegis,
        },
      });

      const { gpa } = this.calculateGpa(registers);

      return {
        gpa,
      };
    } catch (_error) {
      throw new InternalServerErrorException('Failed to calculate GPA');
    }
  }

  async getGpax(studentId: string) {
    const student = await this.studentService.getStudentById(studentId);
    if (!student) throw new NotFoundException('Student not found');

    try {
      const registers = await this.databaseService.factRegister.findMany({
        where: { studentId },
      });

      const { gpa } = this.calculateGpa(registers);

      return {
        gpax: gpa,
      };
    } catch (_error) {
      throw new InternalServerErrorException('Failed to calculate GPAX');
    }
  }
}
