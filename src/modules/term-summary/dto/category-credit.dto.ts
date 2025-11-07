import { ApiProperty } from '@nestjs/swagger';

export class CategoryCreditDto {
  @ApiProperty({
    example: 1,
    description: 'รหัสหมวดวิชา (FK ไป subject_category)',
  })
  categoryId: number;

  @ApiProperty({ example: 'หมวดศึกษาทั่วไป', description: 'ชื่อหมวดวิชา' })
  categoryName: string;

  @ApiProperty({
    example: 12,
    description: 'จำนวนหน่วยกิตที่ต้องผ่านในหมวดนี้',
  })
  creditRequire: number;

  @ApiProperty({ example: 6, description: 'จำนวนหน่วยกิตที่ผ่านแล้วในหมวดนี้' })
  creditPass: number;

  @ApiProperty({ example: 3.33, description: 'เกรดเฉลี่ยของหมวดนี้' })
  avgGrade: number;
}
