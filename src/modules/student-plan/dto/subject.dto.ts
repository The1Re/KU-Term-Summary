import { ApiProperty } from '@nestjs/swagger';

export class SubjectDto {
  @ApiProperty({
    example: 150,
    description: 'The unique identifier for the subject record',
  })
  subjectId: number;

  @ApiProperty({
    example: 25,
    description: 'The unique identifier for the subject category record',
  })
  subjectCategoryId: number;

  @ApiProperty({
    example: '01417167',
    description: 'The unique code for the subject',
  })
  subjectCode: string;

  @ApiProperty({
    example: 'คณิตศาสตร์วิศวกรรม I',
    description: 'The name of the subject in Thai',
  })
  nameSubjectThai: string;

  @ApiProperty({
    example: 'Engineering Mathematics I',
    description: 'The name of the subject in English',
  })
  nameSubjectEng: string;

  @ApiProperty({
    example: 'วิชาแกน',
    description: 'The name of the subject category',
  })
  categoryName: string;

  @ApiProperty({
    example: '3',
    description: 'credit of the subject',
  })
  credits: number;
}
