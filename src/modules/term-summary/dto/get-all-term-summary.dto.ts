import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FactTermSummary } from '@prisma/client';

export class TermSummaryDto
  implements Omit<FactTermSummary, 'createAt' | 'updatedAt'>
{
  @ApiProperty({ example: 101, description: 'รหัสผลการเรียนภาคการศึกษา' })
  factTermSummaryId: number;

  @ApiProperty({ example: 186, description: 'รหัสนักศึกษา (FK ไป student)' })
  studentId: number;

  @ApiProperty({
    example: 7,
    description: 'รหัสอาจารย์ที่ปรึกษา (FK ไป teacher)',
  })
  teacherId: number;

  @ApiProperty({ example: 19, description: 'หน่วยกิตในเทอมนี้' })
  creditTerm: number;

  @ApiProperty({ example: 84, description: 'หน่วยกิตสะสม' })
  creditAll: number;

  @ApiProperty({ example: 3.45, description: 'เกรดเฉลี่ยประจำเทอม (GPA)' })
  gpa: number;

  @ApiProperty({ example: 3.33, description: 'เกรดเฉลี่ยสะสม (GPAX)' })
  gpax: number;

  @ApiProperty({
    example: 3,
    description: 'ชั้นปีการศึกษา (เช่น ปี 1=1, ปี 2=2, ...)',
  })
  studyYear: number;

  @ApiProperty({
    example: 1,
    description: 'ภาคการศึกษา (ภาคต้น=1, ภาคปลาย=2, ฤดูร้อน=3)',
  })
  studyTerm: number;

  @ApiPropertyOptional({
    example: true,
    description: 'ตามแผนการเรียนหรือไม่ (default=false)',
  })
  isFollowPlan: boolean;

  @ApiProperty({
    example: 2567,
    description: 'ปีการศึกษาในมิติ Term (ใช้แยกในรายงาน)',
  })
  semesterYearInTerm: number;

  @ApiProperty({
    example: '1',
    description:
      'ส่วนของภาคการศึกษาในมิติ Term (เช่น ภาคต้น=1/ภาคปลาย=2/ฤดูร้อน=3)',
  })
  semesterPartInTerm: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'รหัสเกรดเลเบล (FK ไป grade_label) อาจเป็น null',
  })
  gradeLabelId: number | null;

  @ApiProperty({
    example: false,
    description: 'มีสิทธิสหกิจศึกษาหรือไม่ (default=false)',
  })
  isCoopEligible: boolean;
}
