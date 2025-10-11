import { Module } from '@nestjs/common';
import { StudentPlanService } from './student-plan.service';
import { StudentPlanUsecase } from './student-plan.usecase';
import { SubjectCourseModule } from '../subject-course/subject-course.module';

@Module({
  imports: [SubjectCourseModule],
  providers: [StudentPlanService, StudentPlanUsecase],
  exports: [StudentPlanService, StudentPlanUsecase],
})
export class StudentPlanModule {}
