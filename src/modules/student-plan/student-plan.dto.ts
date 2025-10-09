import { ApiProperty } from '@nestjs/swagger';
import { FactStdPlan } from '@prisma/client';

export class StudentPlanDto
  implements Omit<FactStdPlan, 'createdAt' | 'updatedAt'>
{
  @ApiProperty({ example: 1, description: 'รหัสแผนการเรียน (stdPlanId)' })
  stdPlanId: number;

  @ApiProperty({ example: '6520501234', description: 'รหัสนักศึกษา' })
  studentId: string;

  @ApiProperty({ example: 2001, description: 'รหัสรายวิชาในหลักสูตร' })
  subjectCourseId: number;

  @ApiProperty({
    example: 10,
    nullable: true,
    description: 'รหัส label ของเกรด (เช่น A, B, C)',
  })
  gradeLabelId: number | null;

  @ApiProperty({ example: 'A', nullable: true, description: 'เกรดของรายวิชา' })
  grade: string | null;

  @ApiProperty({ example: true, description: 'ผ่านรายวิชานี้หรือไม่' })
  isPass: boolean;

  @ApiProperty({
    example: 'เรียนซ้ำในปีถัดไป',
    nullable: true,
    description: 'หมายเหตุเพิ่มเติมเกี่ยวกับรายวิชา',
  })
  note: string | null;

  @ApiProperty({
    example: 1,
    description: 'ปี (1 , 2, 3)',
  })
  studyYear: number;

  @ApiProperty({
    example: 1,
    description: 'ภาคการศึกษา (1, 2, หรือ 3)',
  })
  studyTerm: number;
}
