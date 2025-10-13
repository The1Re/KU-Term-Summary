import { ApiProperty } from '@nestjs/swagger';

export class CreateTermSummaryDto {
  @ApiProperty({
    example: ['6520501234', '6520505678'],
    description: 'list ของ รหัสนักศึกษา',
    required: false,
    type: [String],
  })
  studentCodes?: string[];
}
