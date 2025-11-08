import { ApiProperty } from '@nestjs/swagger';

export class CreateTermSummaryDto {
  @ApiProperty({
    example: ['6520501234', '6520505678'],
    description: 'list ของ รหัสนักศึกษาที่ต้องการสร้างสรุปเทอม',
    required: false,
    type: [String],
  })
  studentCodes?: string[];

  @ApiProperty({
    example: false,
    description: 'สร้างสรุปเทอมของทุกเทอมใช่หรือไม่',
    required: false,
    type: Boolean,
  })
  all?: boolean;

  @ApiProperty({
    example: 2,
    description: 'ปีการศึกษาตั้งแต่ปีที่เลือกจนถึงีแรกที่ต้องการสร้างสรุปเทอม',
    required: false,
    type: Number,
  })
  year?: number;

  @ApiProperty({
    example: 1,
    minLength: 1,
    maxLength: 3,
    description:
      'เทอมการศึกษาตั้งแต่เทอมที่เลือกจนถึงเทอมแรกที่ต้องการสร้างสรุปเทอม',
    required: false,
    type: Number,
  })
  term?: number;
}
