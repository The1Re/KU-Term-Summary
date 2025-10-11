import { Module } from '@nestjs/common';
import { SubjectCourseService } from './subject-course.service';

@Module({
  providers: [SubjectCourseService],
  exports: [SubjectCourseService],
})
export class SubjectCourseModule {}
