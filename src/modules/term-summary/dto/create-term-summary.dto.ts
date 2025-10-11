import { ApiProperty } from '@nestjs/swagger';

export class CreateTermSummaryDto {
  @ApiProperty({
    example: [1, 2, 3],
    description: 'list ของ id นักศึกษา',
    required: false,
    type: [Number],
  })
  studentIds?: number[];
}
