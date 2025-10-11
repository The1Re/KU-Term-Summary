import { Module } from '@nestjs/common';
import { StudentPlanService } from './student-plan.service';
import { StudentPlanUsecase } from './student-plan.usecase';
import { SubjectCourseModule } from '@/modules/subject-course/subject-course.module';
import { RegisterModule } from '@/modules/register/register.module';

@Module({
  imports: [SubjectCourseModule, RegisterModule],
  providers: [StudentPlanService, StudentPlanUsecase],
  exports: [StudentPlanService, StudentPlanUsecase],
})
export class StudentPlanModule {}
