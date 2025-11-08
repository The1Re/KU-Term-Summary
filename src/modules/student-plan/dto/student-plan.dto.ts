import { ApiProperty } from '@nestjs/swagger';
import { FactStudentPlan } from '@prisma/client';
import { SubjectDto } from './subject.dto';

export class StudentPlanDto implements Omit<FactStudentPlan, 'isRequire'> {
  @ApiProperty({
    example: 1,
    description: 'The unique identifier for the student plan record',
  })
  factStudentPlanId: number;

  @ApiProperty({
    example: 1,
    description: 'The unique identifier for the student record',
  })
  studentId: number;

  @ApiProperty({
    example: '6520509999',
    description: 'The student code (username)',
  })
  studentUsername: string;

  @ApiProperty({
    example: 1,
    description: 'The unique identifier for the subject course record',
  })
  subjectCourseId: number;

  @ApiProperty({
    example: 1,
    description: 'The unique identifier for the grade label record',
  })
  gradeLabelId: number | null;

  @ApiProperty({
    example: true,
    description: 'Indicates if the student has passed the subject course',
  })
  isPass: boolean;

  @ApiProperty({
    example: 1,
    description: 'The year the student passed the subject course like 1,2,3,4',
  })
  passYear: number | null;

  @ApiProperty({
    example: 1,
    description:
      'The term the student passed the subject course like 1 (First Term),2 (Second Term),3 (Summer Term)',
  })
  passTerm: number | null;

  @ApiProperty({
    example: 1,
    description:
      'The year the student should pass the subject course like 1,2,3,4',
  })
  expectedPassingYear: number | null;

  @ApiProperty({
    example: 1,
    description:
      'The term the student should pass the subject course like 1 (First Term),2 (Second Term),3 (Summer Term)',
  })
  expectedPassingTerm: number | null;

  @ApiProperty({
    example: 3.5,
    description:
      'The standard grade the student achieved in the subject course',
  })
  stdGrade: number | null;

  @ApiProperty({
    example: 'F,B+',
    description:
      'The detailed grade information for the student in the subject course',
  })
  gradeDetails: string | null;

  @ApiProperty({
    type: SubjectDto,
    description: 'The subject details associated with the student plan',
  })
  subject: SubjectDto;

  @ApiProperty({
    example: 2025,
    description:
      'Last registered study year for this subject by the student (null if never registered)',
    required: false,
  })
  lastRegisterYear?: number | null;

  @ApiProperty({
    example: 2,
    description:
      'Last registered study term for this subject by the student (null if never registered)',
    required: false,
  })
  lastRegisterTerm?: number | null;
}
