import { ApiProperty } from '@nestjs/swagger';
import { FactTermSummary } from '@prisma/client';

export class TermSummaryDto
  implements Omit<FactTermSummary, 'createAt' | 'updatedAt'>
{
  @ApiProperty({
    example: 1,
    description: 'รหัสผลการเรียนภาคการศึกษา (TermsummaryId)',
  })
  TermSummaryId: number;

  @ApiProperty({ example: '6520501234', description: 'รหัสนักศึกษา' })
  studentId: string;

  @ApiProperty({ example: 19, description: 'หน่วยกิตต่อเทอม' })
  creditTerm: number;

  @ApiProperty({ example: 37, description: 'หน่วยกิตสะสม' })
  creditAll: number;

  @ApiProperty({ example: 3.5, description: 'ผลการเรียนต่อเทอม' })
  gpa: number;

  @ApiProperty({ example: 3.33, description: 'ผลการเรียนรวมเฉลี่ย' })
  gpax: number;

  @ApiProperty({ example: 1, description: 'ชั้นปี' })
  studyYear: number;

  @ApiProperty({ example: 2, description: 'ภาคการเรียน' })
  studyTerm: number;

  @ApiProperty({ example: 'ตามแผน', description: 'ตามแผนที่ลงหรือไม่' })
  planStatus: string;

  @ApiProperty({ example: 'กำลังศึกษา', description: 'สภานะนิสิตปัจจุบัน' })
  studentStatus: string;

  @ApiProperty({ example: 'False', description: 'ไปสหกิจได้หรือไม่' })
  isCoop: boolean;

  @ApiProperty({ example: 6, description: 'หน่วยกิตหมวดศึกษาทั่วไป' })
  generalSubjectCredit: number;

  @ApiProperty({ example: 9, description: 'หน่วยกิตหมวดวิชาเฉพาะ' })
  specificSubjectCredit: number;

  @ApiProperty({ example: 0, description: 'หน่วยกิตหมวดเลือกเสรี' })
  freeSubjectCredit: number;

  @ApiProperty({ example: 0, description: 'หน่วยกิตหมวดวิชาเฉพาะเลือก' })
  selectSubjectCredit: number;

  @ApiProperty({ example: 10, description: 'หน่วยกิตหมวดศึกษาทั่วไปสะสม' })
  generalSubjectCreditAll: number;

  @ApiProperty({ example: 17, description: 'หน่วยกิตหมวดวิชาเฉพาะสะสม' })
  specificSubjectCreditAll: number;

  @ApiProperty({ example: 0, description: 'หน่วยกิตหมวดเลือกเสรีสะสม' })
  freeSubjectCreditAll: number;

  @ApiProperty({ example: 0, description: 'หน่วยกิตหมวดวิชาเฉพาะเลือกสะสม' })
  selectSubjectCreditAll: number;

  @ApiProperty({ example: 2565, description: 'ปีการศึกษา' })
  semesterYearInTerm: number;

  @ApiProperty({
    example: 'ภาคปลาย',
    description: 'ภาคการศึกษา (1 = ภาคต้น, 2 = ภาคปลาย, 3 = ภาคฤดูร้อน)',
  })
  semesterPartInTerm: string;

  @ApiProperty({
    example: 1,
    description: 'รหัสลำดับผลการเรียน (ติดโปร เกียรตินิยม)',
  })
  gradeLabelId: number | null;
}

export class CreateTermSummaryDto {
  @ApiProperty({
    example: ['6520501234', '6520501235'],
    description: 'list ของ รหัสนักศึกษา',
    required: false,
    type: [String],
  })
  studentIds?: string[];
}
