import { ApiProperty } from '@nestjs/swagger';
import { FactStudentPlan } from '@prisma/client';

export class StudentPlanDto implements FactStudentPlan {
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
    description: 'Indicates if the subject course is required',
  })
  isRequire: boolean;

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

  // extra for response
  @ApiProperty({
    example: 3,
    description: 'The credit value of the subject course',
  })
  credit: number;
}
